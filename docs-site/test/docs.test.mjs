import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import ts from 'typescript'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { StaticApp, pageModules } from '../site/App.mjs'
import { routes as siteRoutes } from '../site/routes.mjs'
import { siteData } from '../site-data.mjs'

const out = new URL('../dist/', import.meta.url)
const routes = Object.fromEntries(siteRoutes.map((route) => [route.path, route.key]))
const decode = (text) =>
  text.replace(/&(amp|lt|gt|quot|#39|#x27);/g, (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", '#x27': "'" })[entity])
const read = (path) => readFileSync(new URL(path, out), 'utf8')
// Cada página se pinta como en la web: el mismo AppShell, con los datos del build. Los ejemplos
// de código salen en el framework elegido, así que se pintan en React y en Vue.
const data = siteData()
const pages = Object.fromEntries(await Promise.all(siteRoutes.map(async ({ key }) => [key, (await pageModules[key]()).default])))
const renderPage = (path, framework) =>
  renderToStaticMarkup(h(StaticRouter, { location: path }, h(StaticApp, { data, page: pages[routes[path]], framework })))
const pageData = Object.fromEntries(
  siteRoutes.map(({ path, key }) => [key, { html: renderPage(path, 'react'), vue: renderPage(path, 'vue') }]),
)
const pageHtml = (key) => pageData[key].html

test('todas las páginas, recursos, rutas y anclas internas existen', () => {
  assert.ok(existsSync(new URL('index.html', out)), 'Ejecuta npm run docs:build primero')
  assert.ok(existsSync(new URL('assets/app.js', out)))
  for (const [route, key] of Object.entries(routes)) {
    const html = pageHtml(key)
    assert.ok(!html.includes('[object Object]'), `${route}: hay un objeto interpolado como texto`)
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
    assert.equal(ids.length, new Set(ids).size, `${route}: IDs duplicados`)
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${route}: un título principal`)
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const link = decode(match[1])
      assert.ok(!/^(https?:)?\/\//.test(link), `${route}: no depende de recursos externos`)
      const target = new URL(link, `https://grado.local${route}`)
      const targetKey = routes[target.pathname]
      if (!targetKey && !target.hash) assert.ok(existsSync(new URL(target.pathname.slice(1), out)), `${route}: recurso inexistente ${link}`)
      if (target.hash) {
        const text = pageHtml(targetKey || key)
        assert.ok(text.includes(`id="${target.hash.slice(1)}"`), `${route}: ancla inexistente ${link}`)
      }
    }
  }
})

test('cada ejemplo React y Vue tiene sintaxis válida', () => {
  let reactCount = 0,
    vueCount = 0
  for (const html of Object.values(pageData).flatMap((page) => [page.html, page.vue])) {
    for (const match of html.matchAll(/<pre\b[^>]*><code>([\s\S]*?)<\/code><\/pre>/g)) {
      const source = decode(match[1])
      if (source.startsWith('<script setup>')) {
        const filename = `Example${++vueCount}.vue`
        const { descriptor, errors } = parse(source, { filename })
        assert.deepEqual(errors, [], filename)
        compileScript(descriptor, { id: filename })
        const template = compileTemplate({ source: descriptor.template.content, filename, id: filename })
        assert.deepEqual(template.errors, [], filename)
      } else if (source.includes("from '@1k5-tech-es/grado-react'")) {
        const filename = `Example${++reactCount}.tsx`
        // Wrap usage fragments in a component so adjacent JSX examples are valid.
        const imports = source.match(/^import[\s\S]*?from [^;]+;/gm) || []
        const body = source.replace(/^import[\s\S]*?from [^;]+;/gm, '').trim()
        const content = body.startsWith('<') ? `${imports.join('\n')}\nfunction Example(){return <>${body}</>}` : source
        const result = ts.transpileModule(content, {
          compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
          fileName: filename,
          reportDiagnostics: true,
        })
        assert.deepEqual(result.diagnostics, [], filename)
      }
    }
  }
  assert.ok(reactCount >= 14)
  assert.ok(vueCount >= 14)
})

test('las descargas contienen paquetes compilados y sus versiones coinciden', () => {
  const html = pageHtml('installation')
  const paths = [...html.matchAll(/href="(downloads\/[^"]+\.tgz)"/g)].map((match) => match[1])
  assert.equal(paths.length, 3)
  for (const path of paths) {
    const archive = gunzipSync(readFileSync(new URL(path, out))).toString('utf8')
    assert.ok(archive.includes('package/package.json'), path)
    if (path.includes('grado-react') || path.includes('grado-vue')) {
      assert.ok(archive.includes('package/dist/index.js'), path)
      assert.ok(archive.includes('package/dist/index.d.ts'), path)
    } else {
      assert.ok(archive.includes('package/dist/tokens.css'), path)
      assert.ok(archive.includes('package/dist/grado.css'), path)
    }
    const version = path.match(/-(\d+\.\d+\.\d+)\.tgz$/)[1]
    assert.ok(archive.includes(`"version": "${version}"`))
  }
})

test('cada componente tiene su guía de uso con las tres partes', () => {
  const html = pageHtml('components')
  const sections = [...html.matchAll(/<section id="([^"]+)" class="docs-component"[^>]*>([\s\S]*?)<\/section>/g)]
  assert.equal(sections.length, data.coverage.length)
  for (const [, id, body] of sections) {
    for (const title of ['Cuándo usarlo', 'Qué evitar', 'Accesibilidad'])
      assert.ok(new RegExp(`<h4>(?:<svg[^]*?</svg>)?${title}</h4>`).test(body), `${id}: falta «${title}»`)
  }
})

test('Estado lista todos los componentes y Cambios empieza por la versión actual', () => {
  const version = JSON.parse(readFileSync(new URL('../../packages/grado/package.json', import.meta.url), 'utf8')).version
  const status = pageHtml('status')
  const components = [...pageHtml('components').matchAll(/<section id="([^"]+)" class="docs-component"/g)].map((m) => m[1])
  assert.ok(components.length >= 74)
  for (const id of components) assert.ok(status.includes(`href="/componentes#${id}"`), `Estado no enlaza ${id}`)
  assert.match(status, /Sales Coach/)
  const changelog = pageHtml('changelog')
  assert.match(changelog, new RegExp(`<h2[^>]* id="v-${version.replaceAll('.', '-')}"[^>]*>${version.replaceAll('.', '\\.')}<`))
})

test('la web carga Inter del paquete, sin Google Fonts', () => {
  const index = read('index.html')
  assert.doesNotMatch(index, /fonts\.googleapis/)
  assert.match(index, /href="assets\/fonts\.css"/)
  for (const [, file] of read('assets/fonts.css').matchAll(/url\('([^']+)'\)/g)) assert.ok(existsSync(new URL(`assets/${file}`, out)), file)
})
