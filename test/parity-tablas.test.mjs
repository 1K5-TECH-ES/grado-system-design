// Tablas con datos del servidor (0.4): React y Vue generan el mismo HTML con las props nuevas de DataTable.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import { normalize } from './normalize.mjs'

const same = (html) => normalize(html).replace(/(k5-[a-z-]+-)(?:_R_[A-Za-z0-9]*_|v-\d+(?:-\d+)*)/g, '$1AUTO')
const vue = (render) => renderToString(createSSRApp({ render }))

// La página 3 de 125 instalaciones, ya ordenada por el servidor (de menos a más potencia).
const rows = [
  { id: 'INS-21', cliente: 'Lucía Martín', provincia: 'Madrid', kwp: 6.4 },
  { id: 'INS-22', cliente: 'Jordi Puig', provincia: 'Barcelona', kwp: 4.8 },
]
const columns = [
  { key: 'cliente', header: 'Cliente', sortable: true, hideable: false },
  { key: 'provincia', header: 'Provincia' },
  { key: 'kwp', header: 'Potencia', numeric: true, sortable: true },
]
const base = { rows, columns, rowKey: 'id', caption: 'Instalaciones', pageSize: 10 }

const SCENARIOS = {
  'servidor: página 3 de 125, sin ordenar en el cliente': {
    ...base,
    manual: true,
    totalRows: 125,
    page: 3,
    sort: { key: 'kwp', direction: 'desc' },
  },
  'servidor cargando: la paginación sigue a la vista': { ...base, manual: true, totalRows: 125, page: 3, loading: true },
  'columnas: selector y una oculta': { ...base, columnPicker: true, defaultHiddenColumns: ['provincia'], selectable: true },
  'alto máximo con cabecera fija': { ...base, maxHeight: 320 },
  'alto máximo como medida CSS': { ...base, maxHeight: '50vh' },
  'filas virtuales: 1000 filas con alto máximo': {
    rows: Array.from({ length: 1000 }, (_, i) => ({ id: `INS-${i + 1}`, cliente: `Cliente ${i + 1}`, provincia: 'Madrid', kwp: 5 })),
    columns,
    rowKey: 'id',
    caption: 'Instalaciones',
    pageSize: 1000,
    maxHeight: 400,
    selectable: true,
  },
  'agrupada por provincia, con selección y un grupo plegado': {
    ...base,
    rows: [...rows, { id: 'INS-23', cliente: 'Ana Ruiz', provincia: 'Madrid', kwp: 5.2 }, { id: 'INS-24', cliente: 'Pau Vidal' }],
    groupBy: 'provincia',
    selectable: true,
    defaultCollapsedGroups: ['Barcelona'],
  },
  'agrupada con etiqueta propia': {
    ...base,
    groupBy: (row) => (row.kwp > 5 ? 'grande' : 'pequeña'),
    groupLabel: (key) => `Instalación ${key}`,
  },
}

for (const [name, props] of Object.entries(SCENARIOS)) {
  test(`DataTable · ${name}`, async () => {
    const react = renderToStaticMarkup(r(R.DataTable, props))
    assert.equal(same(react), same(await vue(() => h(V.DataTable, props))))
  })
}

test('DataTable con manual: no reordena ni recorta, y pagina con totalRows', () => {
  const html = renderToStaticMarkup(r(R.DataTable, SCENARIOS['servidor: página 3 de 125, sin ordenar en el cliente']))
  assert.ok(html.indexOf('Lucía Martín') < html.indexOf('Jordi Puig'), 'mantiene el orden del servidor')
  assert.match(html, /21–30 de 125/)
  assert.match(html, /aria-sort="descending"/)
  const loading = renderToStaticMarkup(r(R.DataTable, SCENARIOS['servidor cargando: la paginación sigue a la vista']))
  assert.match(loading, /k5-data-table__loading/)
  assert.match(loading, /k5-pagination/)
})

test('DataTable con columnas ocultas y alto máximo', () => {
  const picker = renderToStaticMarkup(r(R.DataTable, SCENARIOS['columnas: selector y una oculta']))
  assert.match(picker, /class="k5-data-table__toolbar"/)
  assert.match(picker, />Columnas</)
  assert.doesNotMatch(picker, />Provincia</)
  assert.doesNotMatch(picker, /Madrid/)
  const scroll = renderToStaticMarkup(r(R.DataTable, SCENARIOS['alto máximo con cabecera fija']))
  assert.match(scroll, /class="k5-data-table k5-data-table--scroll" style="--_height:320px"/)
})

test('DataTable con filas virtuales: solo el primer tramo, con su alto y su posición', () => {
  const html = renderToStaticMarkup(r(R.DataTable, SCENARIOS['filas virtuales: 1000 filas con alto máximo']))
  const rendered = html.match(/<tr aria-rowindex/g) ?? []
  // 400 px de alto a ~41 px por fila más 10 de margen: unas 20, no 1000.
  assert.ok(rendered.length > 10 && rendered.length < 40, `${rendered.length} filas pintadas`)
  assert.match(html, /<table[^>]*aria-rowcount="1001"/)
  assert.match(html, /<tr aria-rowindex="2"[^>]*>.*?Cliente 1</)
  assert.doesNotMatch(html, /Cliente 1000/)
  assert.match(html, /class="k5-data-table__spacer" aria-hidden="true" style="height:\d+px"/)
  // Con 200 filas o menos, o sin alto máximo, se pintan todas como siempre.
  const few = renderToStaticMarkup(r(R.DataTable, { ...SCENARIOS['filas virtuales: 1000 filas con alto máximo'], pageSize: 200 }))
  assert.doesNotMatch(few, /aria-rowcount|k5-data-table__spacer/)
  const noHeight = renderToStaticMarkup(
    r(R.DataTable, { ...SCENARIOS['filas virtuales: 1000 filas con alto máximo'], maxHeight: undefined }),
  )
  assert.equal((noHeight.match(/<tr data-selected|<tr>/g) ?? []).length > 1000, true)
})

test('DataTable agrupada: un tbody por grupo con su título, su total y el plegado', () => {
  const html = renderToStaticMarkup(r(R.DataTable, SCENARIOS['agrupada por provincia, con selección y un grupo plegado']))
  assert.equal((html.match(/<tbody class="k5-data-table__group">/g) ?? []).length, 3)
  assert.match(html, /<th scope="rowgroup" colSpan="4"><button type="button" class="k5-data-table__group-toggle" aria-expanded="true">/)
  assert.match(html, /<span>Madrid<\/span><span class="k5-data-table__group-count">2<\/span>/)
  assert.match(html, /aria-expanded="false">.*?<span>Barcelona<\/span>/)
  assert.doesNotMatch(html, /Jordi Puig/, 'el grupo plegado no pinta sus filas')
  assert.match(html, /<span>Sin grupo<\/span>/)
  assert.ok(html.indexOf('Lucía Martín') < html.indexOf('Ana Ruiz') && html.indexOf('Ana Ruiz') < html.indexOf('Pau Vidal'))
  const label = renderToStaticMarkup(r(R.DataTable, SCENARIOS['agrupada con etiqueta propia']))
  assert.match(label, /<span>Instalación grande<\/span>/)
})
