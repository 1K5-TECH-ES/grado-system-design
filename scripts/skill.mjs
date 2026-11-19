// Guías de uso de la skill de Claude Code (plugins/grado), sacadas de las de la web: una por familia.
// La fuente es docs-site/guidelines.mjs y el catálogo de la web; estos archivos no se editan a mano. Necesita el build hecho.
//   node scripts/skill.mjs         escribe plugins/grado/skills/grado/references/guias/*.md
//   node scripts/skill.mjs check   falla si no coinciden con lo que hay ahora (lo usa test/skill.test.mjs)
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { byCategory } from '../docs-site/catalog.mjs'
import { guidelines } from '../docs-site/guidelines.mjs'
import { slug } from '../docs-site/site/text.mjs'

const dir = fileURLToPath(new URL('../plugins/grado/skills/grado/references/guias/', import.meta.url))

const list = (title, items) => (items?.length ? [`**${title}**`, '', ...items.map((item) => `- ${item}`), ''] : [])

/** { 'formularios.md': '…', … } */
export function guides() {
  const files = {}
  for (const family of byCategory) {
    const lines = [
      `# Guías de uso: ${family.name}`,
      '',
      'Generado por `npm run skill` desde las guías de la web de documentación. Cuándo usar cada componente, qué evitar y qué cuidar de accesibilidad. Las props exactas están en los tipos instalados.',
      '',
      `Componentes: ${family.items.map((c) => c.name).join(' · ')}`,
      '',
    ]
    for (const c of family.items) {
      const g = guidelines[c.id] ?? {}
      lines.push(`## ${c.name}`, '', c.description, '')
      lines.push(...list('Cuándo usarlo', g.use), ...list('Qué evitar', g.avoid), ...list('Accesibilidad', g.a11y))
      if (c.note) lines.push(`**Nota:** ${c.note}`, '')
    }
    files[`${slug(family.name)}.md`] = lines.join('\n').trimEnd() + '\n'
  }
  // El índice dice en qué archivo está cada componente: Badge está en Datos y Card en Estructura.
  const index = [
    '# Guías de uso: índice',
    '',
    'Generado por `npm run skill`. Busca el componente y lee solo el archivo de su familia.',
    '',
    '| Familia | Archivo | Componentes |',
    '|---|---|---|',
    ...byCategory.map(
      (family) =>
        `| ${family.name} | [${slug(family.name)}.md](${slug(family.name)}.md) | ${family.items.map((c) => c.name).join(' · ')} |`,
    ),
  ]
  files['indice.md'] = index.join('\n') + '\n'
  return files
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const wanted = guides()
  const present = existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith('.md')) : []
  if (process.argv[2] === 'check') {
    const stale = [
      ...Object.keys(wanted).filter((file) => !existsSync(dir + file) || readFileSync(dir + file, 'utf8') !== wanted[file]),
      ...present.filter((file) => !(file in wanted)),
    ]
    if (stale.length) {
      console.error(`Las guías de la skill no coinciden con las de la web (${stale.join(', ')}). Ejecuta npm run skill.`)
      process.exit(1)
    }
    console.log('Las guías de la skill están al día.')
  } else {
    mkdirSync(dir, { recursive: true })
    for (const file of present.filter((file) => !(file in wanted))) rmSync(dir + file)
    for (const [file, text] of Object.entries(wanted)) writeFileSync(dir + file, text)
    console.log(`Escritas ${Object.keys(wanted).length} guías en ${dir}`)
  }
}
