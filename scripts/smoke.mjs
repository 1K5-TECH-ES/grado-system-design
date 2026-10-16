// npm run test:smoke [-- vite-react|next|nuxt|html …]
// Apps de prueba (test/smoke/): cada una instala Grado desde los .tgz, como una app de verdad
// fuera del monorepo, y compila con su framework. Falla si alguna no compila o si el
// resultado no lleva lo que debería. Necesita el build hecho y red para instalar los frameworks.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const APPS = {
  'vite-react': { out: 'dist', expect: [/k5-btn/, /k5-data-table/] },
  next: { out: '.next', expect: [/k5-kpi/, /k5-card/] },
  nuxt: { out: '.output', expect: [/k5-kpi/, /k5-data-table/] },
  // HTML sin framework con los Web Components (0.6).
  html: { out: 'dist', expect: [/k5-combobox/, /k5-toaster/, /customElements/] },
}
const wanted = process.argv.slice(2)
const apps = wanted.length ? wanted : Object.keys(APPS)
const unknown = apps.filter((app) => !APPS[app])
if (unknown.length) {
  console.error(`Apps desconocidas: ${unknown.join(', ')}. Hay: ${Object.keys(APPS).join(', ')}`)
  process.exit(1)
}

const work = mkdtempSync(join(tmpdir(), 'grado-smoke-'))
const run = (command, args, cwd) =>
  execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  })

// Todo el HTML, JS y CSS que ha generado la app, para buscar las clases de Grado.
function* filesUnder(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* filesUnder(path)
    else if (/\.(html|m?js|css)$/.test(entry.name)) yield path
  }
}

const failed = []
try {
  const packs = join(work, 'packs')
  mkdirSync(packs)
  run('npm', ['pack', '--workspaces', '--pack-destination', packs], root)
  const tgz = Object.fromEntries(
    readdirSync(packs).map((file) => [
      `@1k5-tech-es/${file.replace(/^1k5-tech-es-/, '').replace(/-\d+\.\d+\.\d+.*\.tgz$/, '')}`,
      join(packs, file),
    ]),
  )

  for (const app of apps) {
    const dir = join(work, app)
    cpSync(join(root, 'test/smoke', app), dir, { recursive: true })
    const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    const framework = { nuxt: '@1k5-tech-es/grado-vue', html: '@1k5-tech-es/grado-elements' }[app] ?? '@1k5-tech-es/grado-react'
    manifest.dependencies ??= {}
    manifest.dependencies['@1k5-tech-es/grado'] = `file:${tgz['@1k5-tech-es/grado']}`
    manifest.dependencies[framework] = `file:${tgz[framework]}`
    writeFileSync(join(dir, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`)
    const started = Date.now()
    try {
      run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], dir)
      run('npm', ['run', 'build'], dir)
      const out = join(dir, APPS[app].out)
      if (!existsSync(out)) throw new Error(`no ha generado ${APPS[app].out}/`)
      const text = [...filesUnder(out)].map((file) => readFileSync(file, 'utf8')).join('\n')
      const missing = APPS[app].expect.filter((pattern) => !pattern.test(text))
      if (missing.length) throw new Error(`el resultado no lleva ${missing.join(', ')}`)
      console.log(`✓ ${app}: instala desde los .tgz y compila (${Math.round((Date.now() - started) / 1000)} s)`)
    } catch (error) {
      failed.push(app)
      console.error(`✗ ${app}: ${error.message}\n${[error.stdout, error.stderr].filter(Boolean).join('\n').slice(-4000)}`)
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}
if (failed.length) process.exit(1)
