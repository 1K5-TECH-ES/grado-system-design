#!/usr/bin/env node
// npx @1k5-tech-es/grado migrate [rutas…] [--from 0.1] [--dry]
// npx @1k5-tech-es/grado usage [rutas…] [--app nombre] [--adoption ruta] [--json]
// Sin dependencias.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'
import { migratePackageJson, migrateSource, npmrcWithRegistry, olderThan, RULES, WARNINGS } from '../src/migrate.js'
import { componentCounts, DEPRECATED, gradoPackages, mergeUsage, propSummary, usageOf, withAdoption } from '../src/usage.js'

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const current = version.split('.').slice(0, 2).join('.')
const SKIP = new Set(['node_modules', 'dist', 'build', 'coverage', '.git', '.next', '.nuxt', '.output', '.svelte-kit', 'vendor'])
const SOURCES = /\.(jsx?|tsx?|mjs|cjs|vue|svelte|astro|html?|css|scss|sass|less|mdx)$/
// El inventario mira también plantillas de servidor, que pueden usar las clases k5-….
const TEMPLATES = /\.(php|twig|blade\.php|erb|hbs|njk)$/

const HELP = `Uso:
  npx @1k5-tech-es/grado migrate [rutas…] [--from 0.1] [--dry]
  npx @1k5-tech-es/grado usage [rutas…] [--app nombre] [--adoption ruta] [--json]

migrate · actualiza un proyecto a Grado ${version}:
  - imports y dependencias de @1k5/… a @1k5-tech-es/… (${current})
  - alias de tamaño --k5-text-badge, -label, -nav y -section a los pasos nuevos
  - quita la clase k5-unit, que ya no hace falta
  - añade el registro de GitHub Packages a .npmrc
  Y avisa, con archivo y línea, de lo que pide una decisión (Button danger, Badge highlight…).

  --from     versión de la que vienes. Por defecto, la de las dependencias de package.json.
  --dry      enseña lo que cambiaría sin escribir nada.

usage · cuenta qué usa un proyecto de Grado: componentes y sus props, funciones como toast(),
  clases k5-… y tokens --k5-…. No cambia nada del proyecto.

  --app       nombre de la app. Por defecto, el name del package.json.
  --adoption  adoption.json del repositorio de Grado: guarda ahí la versión y los componentes.
  --json      el inventario completo en JSON, para otros scripts.

  rutas      carpetas o archivos que revisar. Por defecto, la carpeta actual.
`

const args = process.argv.slice(2)
const help = args.includes('--help') || args.includes('-h')
const command = args[0]
if (!['migrate', 'usage'].includes(command) || help) {
  console.log(HELP)
  process.exit(help || !args.length ? 0 : 1)
}
const VALUE_FLAGS = new Set(['--from', '--app', '--adoption'])
const flag = (name) => {
  const index = args.indexOf(name)
  return index >= 0 ? (args[index + 1] ?? '') : null
}
const targets = args.slice(1).filter((arg, i, all) => !arg.startsWith('--') && !VALUE_FLAGS.has(all[i - 1]))
const roots = (targets.length ? targets : ['.']).map((path) => resolve(path))
const cwd = process.cwd()
const show = (file) => (file ? relative(cwd, file) || file : '')

function* walk(path, pattern) {
  if (!existsSync(path)) return
  if (statSync(path).isFile()) {
    yield path
    return
  }
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP.has(entry.name) && !entry.name.startsWith('.')) yield* walk(join(path, entry.name), pattern)
    } else if (entry.name === 'package.json' || pattern.test(entry.name)) yield join(path, entry.name)
  }
}
const filesIn = (pattern) => [...new Set(roots.flatMap((root) => [...walk(root, pattern)]))]

if (command === 'migrate') migrate()
else usage()

function migrate() {
  const dry = args.includes('--dry')
  const fromFlag = flag('--from')
  if (fromFlag !== null && !/^\d+\.\d+$/.test(fromFlag)) {
    console.error('--from necesita una versión como 0.1 o 0.2')
    process.exit(1)
  }
  const files = filesIn(SOURCES)
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

  const width = Math.max(1, ...Object.values(totals).map((n) => String(n).length))
  console.log(`Grado ${version} · migración desde ${from} · ${files.length} archivos revisados\n`)
  for (const [rule, label] of Object.entries(RULES))
    if (totals[rule])
      console.log(`✓ ${String(totals[rule]).padStart(width)}  ${rule === 'dependencies' ? `${label} en ^${version}` : label}`)
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
}

function usage() {
  const files = filesIn(new RegExp(`${SOURCES.source}|${TEMPLATES.source}`))
  const manifests = files.filter((file) => file.endsWith('package.json'))
  const packages = {}
  let name = null
  for (const file of manifests) {
    try {
      Object.assign(packages, gradoPackages(readFileSync(file, 'utf8')))
      if (file === join(roots[0], 'package.json')) name = JSON.parse(readFileSync(file, 'utf8')).name ?? null
    } catch {
      // Un package.json roto no impide contar el código.
    }
  }
  const sources = files.filter((file) => !file.endsWith('package.json'))
  const total = mergeUsage(sources.map((file) => usageOf(readFileSync(file, 'utf8'), { path: file })))
  const app = flag('--app') || name || basename(roots[0])
  const versions = [...new Set(Object.values(packages))]
  const appVersion = versions.sort().at(0) ?? null
  const components = componentCounts(total)

  if (args.includes('--json')) {
    console.log(JSON.stringify({ app, packages, files: sources.length, ...total }, null, 2))
  } else {
    const list = Object.entries(packages).map(([pkg, v]) => `${pkg} ${v}`)
    console.log(
      `${app} · ${list.length ? list.join(', ') : 'sin paquetes de Grado en package.json'} · ${sources.length} archivos revisados\n`,
    )
    const names = Object.keys(components)
    const width = Math.max(10, ...names.map((n) => n.length))
    const usesWidth = Math.max(1, ...Object.values(components).map((n) => String(n).length))
    for (const n of names)
      console.log(`  ${n.padEnd(width)}  ${String(components[n]).padStart(usesWidth)}   ${propSummary(total.components[n].props)}`)
    const functions = Object.entries(total.functions).sort((a, b) => b[1] - a[1])
    if (functions.length) console.log(`\n  Funciones: ${functions.map(([f, n]) => `${f}() ${n}`).join(' · ')}`)
    const classes = Object.entries(total.classes).sort((a, b) => b[1] - a[1])
    if (classes.length)
      console.log(
        `  Clases k5-… escritas a mano: ${classes.length} (${classes
          .slice(0, 6)
          .map(([c, n]) => `${c} ${n}`)
          .join(' · ')}${classes.length > 6 ? ' …' : ''})`,
      )
    const tokens = Object.keys(total.tokens).length
    if (tokens) console.log(`  Tokens --k5-…: ${tokens} distintos, ${Object.values(total.tokens).reduce((a, b) => a + b, 0)} usos`)
    const deprecated = Object.entries(total.deprecated)
    if (deprecated.length) {
      console.log(`\nSe retira en 1.0 (npx @1k5-tech-es/grado migrate cambia los tokens; text-2xs, a mano):`)
      for (const [name, n] of deprecated) console.log(`! ${name} ${n} → ${DEPRECATED[name]}`)
    }
    console.log(`\n${names.length} componente${names.length === 1 ? '' : 's'} de Grado en uso`)
  }

  const adoptionPath = flag('--adoption')
  if (adoptionPath) {
    const path = resolve(adoptionPath)
    const adoption = JSON.parse(readFileSync(path, 'utf8'))
    const date = new Date().toISOString().slice(0, 10)
    writeFileSync(path, `${JSON.stringify(withAdoption(adoption, { app, version: appVersion, components, date }), null, 2)}\n`)
    if (!args.includes('--json')) console.log(`${show(path)} actualizado para ${app}`)
  }
}
