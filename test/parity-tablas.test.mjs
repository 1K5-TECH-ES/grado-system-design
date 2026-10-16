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
