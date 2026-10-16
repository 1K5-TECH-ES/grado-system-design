// Datos que la web calcula al generarse, en Node: cobertura de cada componente (leyendo los
// tests), adopción por aplicación y el registro de cambios. El build los pasa a la aplicación
// como el módulo «virtual:site-data»; los tests los calculan igual.
import { readFileSync, readdirSync } from 'node:fs'
import * as G from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import * as RF from '@1k5-tech-es/grado-react/react-hook-form'
import * as VF from '@1k5-tech-es/grado-vue/vee-validate'
import { byCategory, components } from './catalog.mjs'
import { guidelines } from './guidelines.mjs'
import { slug } from './site/text.mjs'

const root = new URL('../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const filesIn = (dir, pattern) =>
  readdirSync(new URL(dir, root))
    .filter((file) => pattern.test(file))
    .map((file) => `${dir}${file}`)

// Se calcula leyendo los tests, así que no se queda desactualizado.
// Los componentes de 0.3 tienen sus tests y su parte del catálogo en archivos por grupo.
function coverage(adoption) {
  const sources = {
    parity: [
      'test/parity.test.mjs',
      'test/patterns.test.mjs',
      'test/i18n.test.mjs',
      ...filesIn('test/', /^(parity|patterns)-.+\.test\.mjs$/),
    ]
      .map(read)
      .join('\n'),
    browser: ['test/browser/fixture.mjs', ...filesIn('test/browser/groups/', /\.fixture\.mjs$/)].map(read).join('\n'),
    visual: ['scripts/catalog.mjs', ...filesIn('scripts/catalog/', /\.mjs$/)].map(read).join('\n'),
  }
  const exportNames = (c) => c.name.split(/[^A-Za-z]+/).filter((word) => /^[A-Z]/.test(word))
  const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const mentions = (source, names, patterns) => names.some((name) => patterns.some((make) => new RegExp(make(escapeRe(name))).test(source)))
  return components.map((c) => {
    const names = exportNames(c)
    return {
      id: c.id,
      name: c.name,
      // Form y FormField viven en los adaptadores de react-hook-form y VeeValidate.
      react: names.every((name) => name in G || name in RF),
      vue: names.every((name) => name in V || name in VF),
      parity: mentions(sources.parity, names, [(n) => `\\bRF?\\.${n}\\b`, (n) => `\\['${n}'`]),
      browser: mentions(sources.browser, names, [(n) => `C\\('${n}'`, (n) => `\\b[GF]\\.${n}\\b`]),
      visual: mentions(sources.visual, names, [(n) => `G\\.${n}\\b`]),
      guide: Boolean(guidelines[c.id]),
      figma: adoption.figma?.[c.id] ?? '',
    }
  })
}

// CHANGELOG.md: títulos ## (versión) y ###, listas con «- » y párrafos.
function changelog(source) {
  const lines = source.split('\n')
  const intro = lines.find((line) => line && !line.startsWith('#')) ?? ''
  const versions = []
  let version, list
  for (const line of lines) {
    if (line.startsWith('# ') || line === intro) continue
    if (line.startsWith('## ')) {
      const title = line.slice(3)
      const [number, note = ''] = title.split('·').map((part) => part.trim())
      version = { id: `v-${slug(number)}`, number, note, blocks: [] }
      versions.push(version)
      list = null
    } else if (!version) continue
    else if (line.startsWith('### ')) {
      version.blocks.push({ type: 'heading', text: line.slice(4) })
      list = null
    } else if (line.startsWith('- ')) {
      if (!list) version.blocks.push((list = { type: 'list', items: [] }))
      list.items.push(line.slice(2))
    } else if (line.trim()) {
      version.blocks.push({ type: 'paragraph', text: line })
      list = null
    } else list = null
  }
  return { intro, versions }
}

export function siteData() {
  const adoption = JSON.parse(read('docs-site/adoption.json'))
  return {
    // Lo que necesitan la barra lateral, el buscador e Inicio, sin las demos ni el código.
    families: byCategory.map((group) => ({
      name: group.name,
      items: group.items.map(({ id, name, description }) => ({ id, name, description })),
    })),
    coverage: coverage(adoption),
    apps: adoption.apps,
    changelog: changelog(read('CHANGELOG.md')),
  }
}
