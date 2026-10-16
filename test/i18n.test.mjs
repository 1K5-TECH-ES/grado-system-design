// Idiomas: los textos de los componentes salen de @1k5-tech-es/grado/messages y se cambian con
// GradoProvider (React) o con el plugin y GradoProvider (Vue). Las props mandan.
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import { MESSAGES, formatMessage, messagesFor } from '@1k5-tech-es/grado/messages'
import { normalize } from './normalize.mjs'

const sameIds = (html) => normalize(html).replace(/(k5-[a-z]+-)(?:_R_[A-Za-z0-9]*_|v-\d+(?:-\d+)*)/g, '$1AUTO')
const react = (locale, name, props, messages) => sameIds(renderToStaticMarkup(r(R.GradoProvider, { locale, messages }, r(R[name], props))))
const vue = async (locale, name, props, messages) =>
  sameIds(await renderToString(createSSRApp({ render: () => h(V.GradoProvider, { locale, messages }, () => h(V[name], props)) })))

test('los tres idiomas tienen las mismas claves y ninguna vacía', () => {
  const keys = Object.keys(MESSAGES['es-ES']).sort()
  for (const [locale, texts] of Object.entries(MESSAGES)) {
    assert.deepEqual(Object.keys(texts).sort(), keys, locale)
    for (const [key, text] of Object.entries(texts)) assert.ok(text.trim(), `${locale}.${key} vacío`)
    // Las variables {x} de cada texto son las mismas que en español.
    for (const key of keys) {
      const vars = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
      assert.deepEqual(vars(texts[key]), vars(MESSAGES['es-ES'][key]), `${locale}.${key}`)
    }
  }
})

test('messagesFor elige por idioma completo, por lengua o cae en español', () => {
  assert.equal(messagesFor('de-DE').close, 'Schließen')
  assert.equal(messagesFor('de-AT').close, 'Schließen')
  assert.equal(messagesFor('en-US').close, 'Close')
  assert.equal(messagesFor('fr-FR').close, 'Cerrar')
  assert.equal(messagesFor('de-DE', { close: 'Zu' }).close, 'Zu')
  assert.equal(formatMessage('Página {page} de {total}', { page: 2 }), 'Página 2 de {total}')
})

const cases = [
  ['Pagination', { total: 128, defaultPage: 3 }, ['Seite 3', '21–30 von 128', 'Nächste Seite']],
  [
    'DataTable',
    { rows: [{ id: '1', name: 'Ana' }], columns: [{ key: 'name', header: 'Name' }], rowKey: 'id', caption: 'Kunden', selectable: true },
    ['Keine Zeile ausgewählt', 'Zeile 1 auswählen'],
  ],
  ['Dialog', { title: 'Bearbeiten' }, ['aria-label="Schließen"']],
  ['Kpi', { label: 'Anlagen', value: '128', change: 5.9, previous: '116' }, ['Steigt', '5,9 %', 'vorher']],
  ['NumberInput', { value: 1234.5, modelValue: 1234.5, step: 0.1, 'aria-label': 'Betrag' }, ['value="1.234,5"', 'Verringern', 'Erhöhen']],
  [
    'Calendar',
    { today: '2026-11-04', value: '2026-11-03', modelValue: '2026-11-03' },
    ['November 2026', 'Dienstag, 3. November 2026', 'Vorheriger Monat'],
  ],
]
for (const [name, props, expected] of cases) {
  test(`${name} en alemán: igual en React y Vue`, async () => {
    const reactProps = { ...props }
    delete reactProps.modelValue
    const vueProps = { ...props }
    if ('modelValue' in props) delete vueProps.value
    const fromReact = react('de-DE', name, reactProps)
    assert.equal(await vue('de-DE', name, vueProps), fromReact)
    for (const text of expected) assert.ok(fromReact.includes(text), `falta «${text}» en ${name}`)
  })
}

test('las props siguen mandando sobre el proveedor', async () => {
  const html = react('de-DE', 'Dialog', { title: 'x', closeLabel: 'Fermer' })
  assert.match(html, /aria-label="Fermer"/)
  const custom = await vue('en-GB', 'Combobox', { options: [], label: 'Clientes' }, { searchPlaceholder: 'Find a customer…' })
  assert.match(custom, /placeholder="Find a customer…"/)
})

test('un proveedor dentro de otro hereda el idioma y suma textos', () => {
  const html = renderToStaticMarkup(
    r(
      R.GradoProvider,
      { locale: 'en-GB' },
      r(
        R.GradoProvider,
        { messages: { noResults: 'Nothing here' } },
        r(R.DataTable, { rows: [], columns: [{ key: 'a', header: 'A' }], rowKey: 'a', caption: 'x' }),
      ),
    ),
  )
  assert.match(html, /Nothing here/)
  assert.match(html, /0 results/)
})

test('sin proveedor, todo sigue en español', () => {
  assert.match(renderToStaticMarkup(r(R.Pagination, { total: 30 })), /Página siguiente/)
})

// Desde 1.0 solo el español viene de serie: de y en se importan aparte. En 0.5 avisa.
test('textos de alemán e inglés en su propio módulo, iguales que los de serie', async () => {
  const { MESSAGES: all } = await import('@1k5-tech-es/grado/messages')
  const { default: de } = await import('@1k5-tech-es/grado/messages/de')
  const { en } = await import('@1k5-tech-es/grado/messages/en')
  assert.deepEqual(de, all['de-DE'])
  assert.deepEqual(en, all['en-GB'])
})

test('avisa una vez si se pide alemán o inglés sin pasar sus textos, y nunca en producción', () => {
  const script = () => `
    const warnings = []
    console.warn = (message) => warnings.push(message)
    const { messagesFor } = await import('@1k5-tech-es/grado/messages')
    const { de } = await import('@1k5-tech-es/grado/messages/de')
    messagesFor('es-ES')
    messagesFor('de-DE', de)
    const before = warnings.length
    messagesFor('de-DE')
    messagesFor('de-AT', { close: 'Zu' })
    messagesFor('en-GB')
    console.log(JSON.stringify({ before, warnings }))`
  const run = (env) =>
    JSON.parse(
      execFileSync('node', ['--input-type=module', '-e', script()], {
        encoding: 'utf8',
        env: { ...process.env, NODE_ENV: env },
      }),
    )
  const dev = run('development')
  assert.equal(dev.before, 0, 'con los textos completos no avisa')
  assert.equal(dev.warnings.length, 2, 'una vez por idioma')
  assert.match(dev.warnings[0], /\[Grado\] Grado 1\.0 solo incluirá los textos en español/)
  assert.match(dev.warnings[0], /import de from '@1k5-tech-es\/grado\/messages\/de'/)
  assert.deepEqual(run('production').warnings, [])
})
