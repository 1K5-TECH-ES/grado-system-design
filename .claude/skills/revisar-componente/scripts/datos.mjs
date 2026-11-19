// Datos de partida para revisar componentes de Grado: dónde está cada uno, qué tests lo cubren,
// cuánto lo usan las apps y si tiene guía. Solo lee. Necesita el build hecho (npm run build).
//   node .claude/skills/revisar-componente/scripts/datos.mjs Dialog
//   node .claude/skills/revisar-componente/scripts/datos.mjs Superposiciones     (una familia entera)
//   node .claude/skills/revisar-componente/scripts/datos.mjs --familias          (lista de familias)
import { readFileSync, readdirSync } from 'node:fs'

const root = new URL('../../../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const filesIn = (dir, pattern) =>
  readdirSync(new URL(dir, root), { recursive: true })
    .filter((file) => pattern.test(file))
    .map((file) => `${dir}${file}`)

const { byCategory } = await import(new URL('docs-site/catalog.mjs', root))
const { guidelines } = await import(new URL('docs-site/guidelines.mjs', root))
const { siteData } = await import(new URL('docs-site/site-data.mjs', root))

const arg = process.argv.slice(2).join(' ').trim()
const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
if (!arg || arg === '--familias') {
  for (const family of byCategory) console.log(`${family.name}: ${family.items.map((c) => c.name).join(' · ')}`)
  process.exit(arg ? 0 : 1)
}

const all = byCategory.flatMap((family) => family.items.map((c) => ({ ...c, family: family.name })))
const family = byCategory.find((f) => normalize(f.name) === normalize(arg))
const wanted = family
  ? all.filter((c) => c.family === family.name)
  : all.filter((c) => normalize(c.id) === normalize(arg) || exportNames(c).some((name) => normalize(name) === normalize(arg)))
if (!wanted.length) {
  console.error(`No hay ningún componente ni familia «${arg}». Prueba con --familias.`)
  process.exit(1)
}

function exportNames(c) {
  return c.name.split(/[^A-Za-z]+/).filter((word) => /^[A-Z]/.test(word))
}
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

const sources = {
  react: filesIn('packages/grado-react/src/', /\.tsx?$/),
  vue: filesIn('packages/grado-vue/src/', /\.ts$/),
  elements: filesIn('packages/grado-elements/src/', /\.js$/),
  css: filesIn('packages/grado/src/css/', /\.css$/),
  tests: [...filesIn('test/', /\.(test|check|fixture|spec)\.mjs$/), ...filesIn('packages/grado/test/', /\.test\.mjs$/)].filter(
    (file) => !file.includes('fixtures/'),
  ),
  docs: [...filesIn('docs-site/', /^(components|catalog|demos)\.mjs$/), ...filesIn('docs-site/groups/', /\.mjs$/)],
}
const text = Object.fromEntries(
  Object.values(sources)
    .flat()
    .map((file) => [file, read(file)]),
)
const grep = (files, re) => files.filter((file) => re.test(text[file]))

const { coverage, apps } = siteData()
const usage = (name) =>
  apps
    .filter((app) => app.componentes?.[name])
    .map((app) => `${app.app} ${app.componentes[name]}`)
    .join(', ')

const lines = []
for (const c of wanted) {
  const names = exportNames(c)
  const cov = coverage.find((row) => row.id === c.id) ?? {}
  const defines = (files, name) => grep(files, new RegExp(`export (const|function|class) ${name}\\b`))
  const missing = ['react', 'vue', 'parity', 'browser', 'visual', 'guide'].filter((key) => !cov[key])
  lines.push(`## ${c.name} (${c.id}) · ${c.family}`, '', c.description, '')
  lines.push(`- Exporta: ${names.join(', ')}`)
  const where = (files) => [...new Set(names.flatMap((n) => defines(files, n)))].join(', ') || '—'
  lines.push(`- React: ${where(sources.react)}`)
  lines.push(`- Vue: ${where(sources.vue)}`)
  const tags = grep(sources.elements, new RegExp(`k5-${kebab(names[0])}\\b`))
  if (tags.length) lines.push(`- Web Component: ${tags.join(', ')}`)
  lines.push(
    `- CSS (.k5-${kebab(names[0])}): ${grep(sources.css, new RegExp(`\\.k5-${kebab(names[0])}\\b`)).join(', ') || 'no hay una clase con ese nombre: busca la clase k5- que pinta (packages/grado/src/classes.js)'}`,
  )
  lines.push(
    `- Tests que lo nombran: ${[...new Set(names.flatMap((n) => grep(sources.tests, new RegExp(`\\b${n}\\b`))))].join(', ') || '—'}`,
  )
  lines.push(`- Documentación: ${grep(sources.docs, new RegExp(`['"]${c.id}['"]`)).join(', ') || '—'}`)
  lines.push(`- Cobertura: ${missing.length ? `falta ${missing.join(', ')}` : 'React, Vue, paridad, navegador, captura y guía'}`)
  lines.push(`- Uso en apps: ${names.map((n) => `${n}: ${usage(n) || 'ninguna'}`).join(' · ')}`)
  const g = guidelines[c.id]
  lines.push(
    `- Guía: ${g ? `${g.use?.length ?? 0} usos, ${g.avoid?.length ?? 0} a evitar, ${g.a11y?.length ?? 0} de accesibilidad` : 'no tiene'}`,
  )
  if (c.note) lines.push(`- Nota de la web: ${c.note}`)
  lines.push('')
}
const appsLine = apps.map((app) => `${app.app} (${app.estado}${app.version ? `, ${app.version}` : ''})`).join(' · ')
console.log(`# Datos de partida\n\nApps: ${appsLine}\n\n${lines.join('\n')}`)
