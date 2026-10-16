#!/usr/bin/env node
// npx @1k5-tech-es/grado migrate [rutas…] [--from 0.1] [--dry]
// Actualiza un proyecto a esta versión de Grado. Sin dependencias.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { migratePackageJson, migrateSource, npmrcWithRegistry, olderThan, RULES, WARNINGS } from '../src/migrate.js'

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const current = version.split('.').slice(0, 2).join('.')
const SKIP = new Set(['node_modules', 'dist', 'build', 'coverage', '.git', '.next', '.nuxt', '.output', '.svelte-kit', 'vendor'])
const SOURCES = /\.(jsx?|tsx?|mjs|cjs|vue|svelte|astro|html?|css|scss|sass|less|mdx)$/

const HELP = `Uso: npx @1k5-tech-es/grado migrate [rutas…] [--from 0.1] [--dry]

Actualiza un proyecto a Grado ${version}:
  - imports y dependencias de @1k5/… a @1k5-tech-es/… (${current})
  - alias de tamaño --k5-text-badge, -label, -nav y -section a los pasos nuevos
  - quita la clase k5-unit, que ya no hace falta
  - añade el registro de GitHub Packages a .npmrc
Y avisa, con archivo y línea, de lo que pide una decisión (Button danger, Badge highlight…).

  rutas      carpetas o archivos que revisar. Por defecto, la carpeta actual.
  --from     versión de la que vienes. Por defecto, la de las dependencias de package.json.
  --dry      enseña lo que cambiaría sin escribir nada.
`

const args = process.argv.slice(2)
const help = args.includes('--help') || args.includes('-h')
if (args[0] !== 'migrate' || help) {
  console.log(HELP)
  process.exit(help || !args.length ? 0 : 1)
}
const dry = args.includes('--dry')
const fromIndex = args.indexOf('--from')
const fromFlag = fromIndex >= 0 ? args[fromIndex + 1] : null
if (fromIndex >= 0 && !/^\d+\.\d+$/.test(fromFlag ?? '')) {
  console.error('--from necesita una versión como 0.1 o 0.2')
  process.exit(1)
}
const targets = args.slice(1).filter((arg, i, all) => !arg.startsWith('--') && all[i - 1] !== '--from')
const roots = (targets.length ? targets : ['.']).map((path) => resolve(path))
const cwd = process.cwd()

function* walk(path) {
  if (!existsSync(path)) return
  if (statSync(path).isFile()) {
    yield path
    return
  }
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP.has(entry.name) && !entry.name.startsWith('.')) yield* walk(join(path, entry.name))
    } else if (entry.name === 'package.json' || SOURCES.test(entry.name)) yield join(path, entry.name)
  }
}

const files = [...new Set(roots.flatMap((root) => [...walk(root)]))]
const manifests = files.filter((file) => file.endsWith('package.json'))
const sources = files.filter((file) => !file.endsWith('package.json'))
const totals = {}
const warnings = []
const writes = new Map()
const add = (changes) => Object.entries(changes).forEach(([rule, n]) => (totals[rule] = (totals[rule] ?? 0) + n))
const warn = (file, list) => list.forEach((w) => warnings.push({ ...w, file }))

// 1. package.json: nombres y versiones; de paso dice de qué versión se viene.
let detected = null
for (const file of manifests) {
  const before = readFileSync(file, 'utf8')
  let result
  try {
    result = migratePackageJson(before, version)
  } catch {
    warnings.push({ file, line: 1, message: 'No es JSON válido: no se ha tocado.' })
    continue
  }
  if (result.from && (!detected || olderThan(result.from, detected))) detected = result.from
  add(result.changes)
  warn(file, result.warnings)
  if (result.text !== before) writes.set(file, result.text)
}
const from = fromFlag ?? detected ?? '0.1'

// 2. Código y estilos.
let density = false
for (const file of sources) {
  const before = readFileSync(file, 'utf8')
  if (before.includes('data-k5-density')) density = true
  const result = migrateSource(before, { path: file, from })
  add(result.changes)
  warn(file, result.warnings)
  if (result.text !== before) writes.set(file, result.text)
}
if (olderThan(from, '0.3') && !density) warnings.push({ file: null, rule: 'density' })

// 3. .npmrc junto al package.json de la carpeta actual.
if (existsSync(join(cwd, 'package.json')) && (manifests.length || totals.scope)) {
  const npmrc = join(cwd, '.npmrc')
  const next = npmrcWithRegistry(existsSync(npmrc) ? readFileSync(npmrc, 'utf8') : '')
  if (next) {
    writes.set(npmrc, next)
    warnings.push({ file: npmrc, line: 1, rule: 'npmrc' })
  }
}

if (!dry) for (const [file, text] of writes) writeFileSync(file, text)

const show = (file) => (file ? relative(cwd, file) || file : '')
const width = Math.max(1, ...Object.values(totals).map((n) => String(n).length))
console.log(`Grado ${version} · migración desde ${from} · ${files.length} archivos revisados\n`)
for (const [rule, label] of Object.entries(RULES))
  if (totals[rule]) console.log(`✓ ${String(totals[rule]).padStart(width)}  ${rule === 'dependencies' ? `${label} en ^${version}` : label}`)
if (!Object.keys(totals).length) console.log('✓ Nada que cambiar automáticamente.')
if (warnings.length) {
  console.log(`\nPara revisar:`)
  for (const w of warnings) {
    const where = w.file ? `${show(w.file)}${w.line ? `:${w.line}` : ''}` : 'proyecto'
    console.log(`! ${where}  ${w.message ?? WARNINGS[w.rule]}`)
  }
}
console.log(
  `\n${writes.size} archivo${writes.size === 1 ? '' : 's'} ${dry ? 'cambiarían (--dry: no se ha escrito nada)' : 'cambiados'} · ${warnings.length} aviso${warnings.length === 1 ? '' : 's'}`,
)
if (!dry && [...writes.keys()].some((file) => file.endsWith('package.json'))) console.log('Siguiente paso: npm install')
