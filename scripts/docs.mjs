// Genera la web de documentación en docs-site/dist/: una aplicación React con el AppShell y
// los componentes de @1k5-tech-es/grado-react (docs-site/site/), los recursos de Grado y los datos
// que se calculan al generar (cobertura, adopción y cambios).
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, cpSync, rmSync } from 'node:fs'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { components } from '../docs-site/catalog.mjs'
import { GradoMark } from '../docs-site/brand.mjs'
import { siteData } from '../docs-site/site-data.mjs'

const root = new URL('../', import.meta.url)
const out = new URL('docs-site/dist/', root)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const version = JSON.parse(read('packages/grado/package.json')).version

mkdirSync(new URL('assets/', out), { recursive: true })
// Solo los paquetes de esta versión: npm pack los vuelve a generar después.
rmSync(new URL('downloads/', out), { recursive: true, force: true })
mkdirSync(new URL('downloads/', out), { recursive: true })
for (const file of ['tokens.css', 'grado.css', 'labs.css'])
  copyFileSync(new URL(`packages/grado/dist/${file}`, root), new URL(`assets/${file}`, out))
// Inter desde el propio paquete: la web no depende de Google Fonts para su fuente.
writeFileSync(new URL('assets/fonts.css', out), read('packages/grado/dist/fonts.css').replaceAll('../assets/fonts/', 'fonts/'))
cpSync(new URL('packages/grado/assets/fonts/', root), new URL('assets/fonts/', out), { recursive: true })
writeFileSync(new URL('assets/grado-mark.svg', out), renderToStaticMarkup(h(GradoMark, { xmlns: 'http://www.w3.org/2000/svg' })))
// Restos de versiones anteriores de la web.
for (const stale of [
  'assets/docs.js',
  'assets/live-demos.js',
  'assets/site.css',
  'assets/logo-1k5.svg',
  'assets/logo-1k5-white.svg',
  'assets/signet-1k5.svg',
])
  rmSync(new URL(stale, out), { force: true })
for (const stale of ['assets/pages/', 'assets/chunks/']) rmSync(new URL(stale, out), { recursive: true, force: true })
for (const filename of ['personalizar.html', 'fundamentos.html', 'installation.html', 'components.html', 'status.html', 'changelog.html'])
  rmSync(new URL(filename, out), { force: true })
cpSync(new URL('docs-site/assets/', root), new URL('assets/', out), {
  recursive: true,
  filter: (source) => !source.endsWith('.mjs'),
})

// El marco es el AppShell de Grado: sigue el tema elegido, Marca por defecto.
const documentHtml = `<!doctype html>
<html lang="es" data-k5-theme="marca"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="description" content="Grado, el sistema de diseño de 1KOMMA5° España. Guía de instalación, configurador de temas, componentes y ejemplos para React, Vue y HTML."><title>Grado · Sistema de diseño</title><link rel="icon" href="assets/grado-mark.svg" type="image/svg+xml"><link rel="stylesheet" href="assets/fonts.css"><link rel="stylesheet" href="assets/tokens.css"><link rel="stylesheet" href="assets/grado.css"><link rel="stylesheet" href="assets/labs.css"><link rel="stylesheet" href="assets/docs.css"><script src="assets/theme.js"></script></head>
<body><div id="app"></div><script src="assets/app.js" type="module"></script></body></html>`
writeFileSync(new URL('index.html', out), documentHtml)

// «virtual:site-data»: lo que solo se puede calcular en Node, como un módulo más de la app.
const data = siteData()
const siteDataPlugin = {
  name: 'site-data',
  setup(builder) {
    builder.onResolve({ filter: /^virtual:site-data$/ }, () => ({ path: 'site-data', namespace: 'site-data' }))
    builder.onLoad({ filter: /.*/, namespace: 'site-data' }, () => ({ contents: JSON.stringify(data), loader: 'json' }))
  },
}
await build({
  entryPoints: [fileURLToPath(new URL('docs-site/assets/app.mjs', root))],
  outdir: fileURLToPath(new URL('assets/', out)),
  entryNames: 'app',
  chunkNames: 'chunks/[name]-[hash]',
  bundle: true,
  splitting: true,
  format: 'esm',
  minify: true,
  platform: 'browser',
  target: 'es2020',
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [siteDataPlugin],
})
console.log(`Documentación de Grado ${version}: docs-site/dist/ (${components.length} componentes, configurador de temas)`)
