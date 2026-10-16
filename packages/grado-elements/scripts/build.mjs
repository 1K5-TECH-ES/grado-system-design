// Build de @1k5-tech-es/grado-elements:
//   dist/*.js                 los módulos tal cual, para bundlers (importan @1k5-tech-es/grado)
//   dist/index.d.ts           tipos
//   dist/grado-elements.min.js todo en un archivo, minificado, para <script type="module"> sin bundler
import { cpSync, readFileSync, rmSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = new URL('../', import.meta.url)
const dist = new URL('dist/', root)
const { version } = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'))
rmSync(dist, { recursive: true, force: true })
mkdirSync(dist, { recursive: true })
cpSync(new URL('src/', root), dist, { recursive: true })
await build({
  entryPoints: [fileURLToPath(new URL('src/index.js', root))],
  outfile: fileURLToPath(new URL('grado-elements.min.js', dist)),
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['chrome111', 'safari16.2', 'firefox113'],
  banner: { js: `/* @1k5-tech-es/grado-elements ${version} · Web Components de Grado. Necesita tokens.css y grado.css */` },
  logLevel: 'warning',
})
console.log(`@1k5-tech-es/grado-elements ${version}: dist/ generado`)
