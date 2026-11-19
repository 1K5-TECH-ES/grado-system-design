// La skill de Claude Code (plugins/grado) y GUIA-INTEGRACION.md no se pueden quedar atrás:
// misma versión que los paquetes, todos los componentes públicos nombrados y las guías de uso iguales que las de la web.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const skill = 'plugins/grado/skills/grado'
const { version } = JSON.parse(read('packages/grado/package.json'))

test('el plugin y el marketplace son JSON válidos y apuntan a la skill', () => {
  const marketplace = JSON.parse(read('.claude-plugin/marketplace.json'))
  const entry = marketplace.plugins.find((plugin) => plugin.name === 'grado')
  assert.equal(entry?.source, './plugins/grado')
  const plugin = JSON.parse(read('plugins/grado/.claude-plugin/plugin.json'))
  assert.equal(plugin.name, 'grado')
  assert.equal(plugin.version, version, 'plugin.json tiene que llevar la versión de los paquetes')
})

test('SKILL.md tiene nombre y descripción, y la descripción cabe', () => {
  const frontmatter = read(`${skill}/SKILL.md`).match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? ''
  assert.match(frontmatter, /^name: grado$/m)
  const description = frontmatter.match(/^description: (.+)$/m)?.[1] ?? ''
  assert.ok(description.length > 0 && description.length <= 1024, `descripción de ${description.length} caracteres`)
})

test('la skill y la guía hablan de la versión actual', () => {
  assert.ok(read(`${skill}/SKILL.md`).includes(`**Grado ${version}**`), 'SKILL.md')
  assert.ok(read(`${skill}/references/componentes.md`).includes(`**Grado ${version}**`), 'componentes.md')
  assert.ok(read('GUIA-INTEGRACION.md').includes(`Versión actual: **${version}**`), 'GUIA-INTEGRACION.md')
})

test('los enlaces entre archivos de la skill existen', () => {
  const guides = readdirSync(new URL(`../${skill}/references/guias/`, import.meta.url)).map((file) => `references/guias/${file}`)
  for (const file of ['SKILL.md', 'references/componentes.md', 'references/migracion.md', ...guides]) {
    const base = new URL(`../${skill}/${file}`, import.meta.url)
    for (const [, target] of read(`${skill}/${file}`).matchAll(/\]\(((?:[\w-]+\/)*[\w-]+\.md)\)/g)) {
      assert.doesNotThrow(() => readFileSync(new URL(target, base)), `${file} enlaza a ${target}`)
    }
  }
})

test('componentes.md nombra todos los componentes públicos', () => {
  const list = read(`${skill}/references/componentes.md`)
  const apis = ['grado-react', 'grado-vue', 'grado-react-labs', 'grado-vue-labs', 'grado-react-react-hook-form', 'grado-vue-vee-validate']
  // Componentes: los encabezados en PascalCase de la API generada (las constantes van en mayúsculas y las funciones en minúscula).
  const components = new Set(
    apis.flatMap((api) => [...read(`api/${api}.api.md`).matchAll(/^## ([A-Z][a-z]\w*)$/gm)].map(([, name]) => name)),
  )
  const missing = [...components].filter((name) => !list.includes(`\`${name}\``))
  assert.deepEqual(missing, [], 'añádelos a la lista de componentes.md')
})

test('las guías de uso de la skill son las de la web', () => {
  // Falla con el mensaje de scripts/skill.mjs: «Ejecuta npm run skill».
  assert.doesNotThrow(() =>
    execFileSync(process.execPath, [fileURLToPath(new URL('../scripts/skill.mjs', import.meta.url)), 'check'], { stdio: 'pipe' }),
  )
})
