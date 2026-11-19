import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import {
  compareValues,
  fileError,
  filterOptions,
  pageCount,
  pageItems,
  rangeError,
  lockScroll,
  backdropGesture,
  selectionLabel,
} from '@1k5-tech-es/grado/patterns'
import { normalize } from './normalize.mjs'

test('búsqueda sin tildes, paginación acotada y orden numérico', () => {
  assert.deepEqual(
    filterOptions(
      [
        { value: '1', label: 'Lucía Fernández' },
        { value: '2', label: 'Ana' },
      ],
      'lucia',
    ).map((x) => x.value),
    ['1'],
  )
  assert.equal(pageCount(0, 10), 1)
  assert.equal(pageCount(128, 10), 13)
  assert.deepEqual([0, 1, 3].map(selectionLabel), ['Ninguna fila seleccionada', '1 fila seleccionada', '3 filas seleccionadas'])
  assert.deepEqual(pageItems(6, 13), [1, 'ellipsis', 5, 6, 7, 'ellipsis', 13])
  assert.deepEqual(pageItems(99, 3), [1, 2, 3])
  assert.ok(compareValues(2, 10) < 0)
  assert.ok(compareValues('2', '10') < 0)
  assert.ok(compareValues(null, 'a') > 0)
})
test('la búsqueda reutiliza el texto normalizado pero ve los cambios de etiqueta', () => {
  const options = [
    { value: '1', label: 'Ávila' },
    { value: '2', label: 'Cádiz', keywords: 'andalucía' },
  ]
  assert.equal(filterOptions(options, '  '), options)
  assert.deepEqual(
    filterOptions(options, 'andalucia').map((x) => x.value),
    ['2'],
  )
  options[0].label = 'León'
  assert.deepEqual(
    filterOptions(options, 'leon').map((x) => x.value),
    ['1'],
  )
  assert.deepEqual(filterOptions(options, 'avila'), [])
  assert.ok(compareValues('Cliente 2', 'Cliente 10') < 0)
  assert.equal(compareValues('ángel', 'Angel'), 0)
})
test('valida extensiones, MIME, límites y fechas sin modificar el dato', () => {
  assert.equal(fileError({ name: 'Memoria.PDF', type: '', size: 20 }, '.pdf', 100), '')
  assert.equal(fileError({ name: 'foto.png', type: 'image/png', size: 20 }, 'image/*'), '')
  assert.match(fileError({ name: 'nota.txt', type: 'text/plain', size: 20 }, '.pdf'), /formato/)
  assert.match(fileError({ name: 'foto.png', type: 'image/png', size: 200 }, 'image/*', 100), /límite/)
  assert.match(rangeError('2026-10-31', '2026-10-01'), /posterior/)
  assert.match(rangeError('2026-01-01', '', '2026-02-01'), /partir/)
  assert.equal(rangeError('2026-10-01', '2026-10-31'), '')
})
test('el fondo de un diálogo solo cierra si el gesto empieza y acaba fuera', () => {
  const dialog = { getBoundingClientRect: () => ({ left: 100, right: 500, top: 100, bottom: 400 }) }
  const at = (x, y, target = dialog) => ({ target, currentTarget: dialog, clientX: x, clientY: y })
  const field = {}
  const gesture = backdropGesture()
  gesture.down(at(20, 20))
  assert.equal(gesture.click(at(20, 20)), true, 'clic en el fondo')
  gesture.down(at(200, 200, field))
  assert.equal(gesture.click(at(20, 20)), false, 'pulsar en un campo y soltar en el fondo')
  gesture.down(at(20, 20))
  assert.equal(gesture.click(at(200, 200)), false, 'pulsar en el fondo y soltar dentro de la caja')
  assert.equal(gesture.click(at(20, 20)), false, 'un click sin pointerdown antes no cierra')
})
test('los bloqueos de scroll anidados restauran el valor original una sola vez', () => {
  const doc = { body: { style: { overflow: 'scroll' } } }
  const release1 = lockScroll(doc),
    release2 = lockScroll(doc)
  assert.equal(doc.body.style.overflow, 'hidden')
  release1()
  release1()
  assert.equal(doc.body.style.overflow, 'hidden')
  release2()
  assert.equal(doc.body.style.overflow, 'scroll')
})

const fixtures = [
  ['Dialog', { title: 'Editar' }],
  ['AlertDialog', { title: 'Eliminar' }],
  ['Drawer', { title: 'Ficha' }],
  ['Sheet', { title: 'Ficha' }],
  ['DropdownMenu', { label: 'Acciones', items: [{ id: 'edit', label: 'Editar' }] }],
  ['Tooltip', { label: 'Ayuda', content: 'Contenido' }],
  ['Checkbox', { label: 'Aceptar', indeterminate: true }],
  ['RadioGroup', { label: 'Tipo', options: [{ value: 'a', label: 'Solar' }] }],
  ['Combobox', { label: 'Cliente', options: [{ value: 'a', label: 'Ana' }] }],
  ['Alert', { title: 'Aviso', tone: 'warning' }],
  ['Toast', { title: 'Aviso', open: true, onOpenChange: () => {} }],
  ['Skeleton', { circle: true }],
  ['Tabs', { label: 'Ficha', items: [{ value: 'a', label: 'Resumen', content: 'Texto' }] }],
  ['Pagination', { total: 128 }],
  ['DatePicker', {}],
  ['DateRangePicker', { label: 'Periodo' }],
  ['FileUpload', { files: [{ id: '1', name: 'test.pdf', status: 'error' }] }],
  ['Stepper', { items: [{ id: 'a', label: 'Cliente' }], value: 'a', modelValue: 'a' }],
  ['Timeline', { items: [{ id: '1', title: 'Creado', tone: 'info' }] }],
  ['FilterChip', { label: 'Estado: abierto' }],
  ['FilterBar', { filters: [{ id: '1', label: 'Estado' }] }],
  ['Accordion', { items: [{ value: 'a', title: 'Ayuda', content: 'Texto' }] }],
  ['Breadcrumbs', { items: [{ label: 'Inicio' }] }],
  [
    'DataTable',
    {
      rows: [{ id: '1', name: 'Ana' }],
      columns: [{ key: 'name', header: 'Nombre', sortable: true }],
      rowKey: 'id',
      caption: 'Clientes',
      selectable: true,
    },
  ],
  ['NumberInput', { value: 8.4, modelValue: 8.4, step: 0.1, suffix: 'kWp', name: 'kwp', 'aria-label': 'Potencia' }],
  [
    'SegmentedControl',
    {
      label: 'Periodo',
      options: [
        { value: 'd', label: 'Día' },
        { value: 'm', label: 'Mes' },
      ],
      defaultValue: 'm',
      name: 'periodo',
    },
  ],
  [
    'MultiSelect',
    {
      label: 'Provincias',
      options: [
        { value: 'md', label: 'Madrid' },
        { value: 'vc', label: 'Valencia' },
      ],
      defaultValue: ['md'],
      name: 'provincias',
    },
  ],
  ['Calendar', { today: '2026-11-04', defaultValue: '2026-11-03' }],
  ['Calendar', { mode: 'range', today: '2026-11-04', defaultValue: { start: '2026-11-03', end: '2026-11-10' }, min: '2026-11-02' }],
  [
    'CommandPalette',
    {
      groups: [
        {
          label: 'Instalaciones',
          items: [
            { id: 'a', label: 'INS-2041 · Lucía', description: 'Valencia' },
            { id: 'b', label: 'Nueva oferta', shortcut: 'N' },
          ],
        },
      ],
    },
  ],
  [
    'BarChart',
    {
      data: [
        { semana: 'S1', auto: 210, exc: 85 },
        { semana: 'S2', auto: 185, exc: 70 },
      ],
      categoryKey: 'semana',
      series: [
        { key: 'auto', label: 'Autoconsumo' },
        { key: 'exc', label: 'Excedentes' },
      ],
      stacked: true,
      unit: 'kWh',
      title: 'Producción',
      categoryLabel: 'Semana',
    },
  ],
]
const css = readFileSync(new URL('../packages/grado/dist/grado.css', import.meta.url), 'utf8')
for (const [name, props] of fixtures) {
  test(`${name}: exportado en ambos frameworks, SSR seguro y clases disponibles`, async () => {
    assert.ok(R[name])
    assert.ok(V[name])
    const reactProps = { ...props }
    delete reactProps.modelValue
    const vueProps = { ...props }
    delete vueProps.value
    delete vueProps.onOpenChange
    const htmls = [renderToStaticMarkup(r(R[name], reactProps)), await renderToString(createSSRApp({ render: () => h(V[name], vueProps) }))]
    for (const html of htmls) {
      assert.ok(html.length > 0)
      for (const [, list] of html.matchAll(/class="([^"]+)"/g))
        for (const cls of list.split(' ').filter((c) => c.startsWith('k5-'))) assert.ok(css.includes(`.${cls}`), `Falta ${cls}`)
      const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1])
      assert.equal(new Set(ids).size, ids.length)
      for (const [, references] of html.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g))
        for (const id of references.split(' ')) assert.ok(ids.includes(id), `Falta el destino ${id}`)
    }
  })
}

// Mismo HTML en React y en Vue. Los ids automáticos de cada framework se igualan.
const sameHtml = [
  ['Dialog', { title: 'Editar', description: 'Ficha del cliente' }],
  ['Dialog', { title: 'Plano de cubierta', description: 'Editor', fullscreen: true, header: false, closeOnEscape: false }],
  ['Alert', { title: 'Aviso' }],
  ['Alert', { title: 'Aviso', tone: 'danger' }],
  ['Pagination', { total: 128, defaultPage: 6 }],
  ['Tooltip', { label: 'Ayuda', content: 'Texto' }],
  ['DropdownMenu', { label: 'Acciones', items: [{ id: 'a', label: 'Editar' }], align: 'start' }],
  ['Combobox', { label: 'Cliente', options: [{ value: 'a', label: 'Ana' }], defaultValue: 'a' }],
  [
    'Stepper',
    {
      items: [
        { id: 'a', label: 'Cliente', description: 'Contacto' },
        { id: 'b', label: 'Oferta' },
      ],
      value: 'b',
      modelValue: 'b',
    },
  ],
  ['Timeline', { items: [{ id: '1', title: 'Creado', tone: 'info', date: 'hoy' }] }],
  ['FilterChip', { label: 'Estado' }],
  ['Accordion', { items: [{ value: 'a', title: 'Ayuda', content: 'Texto' }], defaultValue: ['a'] }],
  ['Breadcrumbs', { items: [{ label: 'Inicio', href: '/' }, { label: 'Aquí' }] }],
  [
    'DataTable',
    {
      rows: [{ id: '1', name: 'Ana', kwp: 6 }],
      columns: [
        { key: 'name', header: 'Nombre', sortable: true },
        { key: 'kwp', header: 'kWp', numeric: true },
      ],
      rowKey: 'id',
      caption: 'Clientes',
      selectable: true,
      defaultSort: { key: 'name', direction: 'asc' },
    },
  ],
  ['DataTable', { rows: [], columns: [{ key: 'name', header: 'Nombre' }], rowKey: 'id', caption: 'Clientes', loading: true }],
  ['NumberInput', { value: 1234.5, modelValue: 1234.5, step: 0.5, min: 0, max: 5000, prefix: '€', 'aria-label': 'Importe' }],
  ['NumberInput', { value: null, modelValue: null, hideSteppers: true, placeholder: '0', 'aria-label': 'Vacío' }],
  [
    'SegmentedControl',
    {
      label: 'Periodo',
      options: [
        { value: 'd', label: 'Día' },
        { value: 'x', label: 'No', disabled: true },
        { value: 'm', label: 'Mes' },
      ],
      value: 'm',
      modelValue: 'm',
      size: 'sm',
      block: true,
    },
  ],
  [
    'MultiSelect',
    {
      label: 'Provincias',
      options: [
        { value: 'md', label: 'Madrid' },
        { value: 'vc', label: 'Valencia' },
      ],
      value: ['md', 'vc'],
      modelValue: ['md', 'vc'],
      name: 'p',
    },
  ],
  ['Calendar', { today: '2026-11-04', value: '2026-11-03', modelValue: '2026-11-03', locale: 'de-DE', max: '2026-11-20' }],
  [
    'Calendar',
    {
      mode: 'range',
      today: '2026-11-04',
      value: { start: '2026-11-03', end: '2026-11-10' },
      modelValue: { start: '2026-11-03', end: '2026-11-10' },
      weekStartsOn: 0,
    },
  ],
  [
    'CommandPalette',
    {
      groups: [
        {
          label: 'Acciones',
          items: [
            { id: 'a', label: 'Nueva oferta', shortcut: 'N' },
            { id: 'b', label: 'Bloqueada', disabled: true },
          ],
        },
        { label: 'Clientes', items: [{ id: 'c', label: 'Lucía', description: 'Valencia' }] },
      ],
    },
  ],
  ['CommandPalette', { groups: [] }],
  [
    'BarChart',
    {
      data: [
        { mes: 'Oct', a: 4.2 },
        { mes: 'Nov', a: 3.1 },
      ],
      categoryKey: 'mes',
      series: [{ key: 'a', label: 'Producción', tone: 2 }],
      unit: 'MWh',
      height: 160,
      description: 'Datos de ejemplo',
    },
  ],
]
const sameIds = (html) => normalize(html).replace(/(k5-[a-z]+-)(?:_R_[A-Za-z0-9]*_|v-\d+(?:-\d+)*)/g, '$1AUTO')
for (const [name, props] of sameHtml) {
  test(`${name}: React y Vue generan el mismo HTML (${Object.keys(props).join(', ')})`, async () => {
    const reactProps = { ...props }
    delete reactProps.modelValue
    const vueProps = { ...props }
    delete vueProps.value
    const react = sameIds(renderToStaticMarkup(r(R[name], reactProps)))
    const vue = sameIds(await renderToString(createSSRApp({ render: () => h(V[name], vueProps) })))
    assert.equal(vue, react)
  })
}

test('Tooltip con trigger: acompaña al control dado, sin botón de información, igual en React y Vue', async () => {
  const react = sameIds(
    renderToStaticMarkup(r(R.Tooltip, { content: 'Ctrl + Mayús + U', trigger: r(R.Button, { variant: 'secondary' }, 'Unifilar') })),
  )
  const vue = sameIds(
    await renderToString(
      createSSRApp({
        render: () =>
          h(V.Tooltip, { content: 'Ctrl + Mayús + U' }, { trigger: () => h(V.Button, { variant: 'secondary' }, () => 'Unifilar') }),
      }),
    ),
  )
  assert.equal(vue, react)
  assert.match(react, /^<span class="k5-tooltip"><button[^>]*class="k5-btn k5-btn--secondary[^"]*"[^>]*>Unifilar<\/button><\/span>$/)
})

test('Dialog sin cabecera: el título sigue nombrando el diálogo y no hay botón de cierre', () => {
  const html = renderToStaticMarkup(r(R.Dialog, { title: 'Plano de cubierta', header: false, fullscreen: true }, 'lienzo'))
  assert.match(html, /class="k5-dialog k5-dialog--fullscreen k5-dialog--headless"/)
  assert.match(html, /<h2 class="k5-sr-only" id="([^"]+)">Plano de cubierta<\/h2>/)
  assert.doesNotMatch(html, /k5-close/)
  const id = /aria-labelledby="([^"]+)"/.exec(html)[1]
  assert.ok(html.includes(`id="${id}"`))
})
