// Núcleo común (0.6): estado y teclado de Combobox, Calendar y DataTable sin framework.
// React, Vue y grado-elements lo usan igual; aquí se prueba una vez.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  calendarAnchor,
  calendarChoose,
  calendarMove,
  calendarShift,
  calendarView,
  comboboxReduce,
  comboboxState,
  comboboxView,
  COMBOBOX_CREATE,
  groupRows,
  withCreateOption,
  nextSort,
  sortRows,
  tableView,
  toggleAllRows,
  toggleColumn,
  toggleRow,
} from '@1k5-tech-es/grado/core'

const options = [
  { value: 'md', label: 'Madrid' },
  { value: 'bcn', label: 'Barcelona', disabled: true },
  { value: 'vlc', label: 'Valencia' },
]

test('combobox: abrir, flechas que saltan lo desactivado, Enter elige y Escape cierra', () => {
  let state = comboboxState()
  const send = (event, filtered = options, loading = false) => {
    const result = comboboxReduce(state, event, { filtered, loading })
    state = result.state
    return result
  }
  send({ type: 'focus' })
  assert.deepEqual(state, { open: true, query: '', active: -1 })
  assert.equal(send({ type: 'key', key: 'ArrowDown' }).preventDefault, true)
  assert.equal(state.active, 0)
  send({ type: 'key', key: 'ArrowDown' })
  assert.equal(state.active, 2, 'salta Barcelona, desactivada')
  send({ type: 'key', key: 'ArrowDown' })
  assert.equal(state.active, 0, 'vuelve al principio')
  send({ type: 'key', key: 'End' })
  assert.equal(state.active, 2)
  assert.deepEqual(send({ type: 'key', key: 'Enter' }), {
    state: { open: false, query: '', active: 2 },
    select: 'vlc',
    focusInput: true,
    preventDefault: true,
  })
  send({ type: 'focus' })
  assert.deepEqual(send({ type: 'key', key: 'Escape' }), {
    state: { open: false, query: '', active: -1 },
    preventDefault: true,
    stopPropagation: true,
  })
})

test('combobox: escribir busca y avisa; vaciar quita el valor; el ratón no activa lo desactivado', () => {
  let { state, query, select } = comboboxReduce(comboboxState(), { type: 'input', value: 'val' })
  assert.deepEqual(state, { open: true, query: 'val', active: -1 })
  assert.equal(query, 'val')
  assert.equal(select, undefined)
  assert.equal(comboboxReduce(state, { type: 'input', value: '' }).select, '')
  assert.equal(comboboxReduce(state, { type: 'hover', index: 1 }, { filtered: options }).state.active, -1)
  assert.equal(comboboxReduce(state, { type: 'hover', index: 2 }, { filtered: options }).state.active, 2)
  assert.deepEqual(comboboxReduce(state, { type: 'pick', option: options[1] }), { state })
  // Cargando, Enter no elige; Inicio y Fin con la lista cerrada no hacen nada (el campo los usa).
  assert.equal(
    comboboxReduce({ open: true, query: '', active: 0 }, { type: 'key', key: 'Enter' }, { filtered: options, loading: true }).select,
    undefined,
  )
  assert.deepEqual(comboboxReduce(comboboxState(), { type: 'key', key: 'Home' }, { filtered: options }), { state: comboboxState() })
  assert.deepEqual(comboboxReduce({ open: true, query: 'x', active: 2 }, { type: 'leave' }).state, comboboxState())
})

test('combobox: lo que se pinta', () => {
  const view = comboboxView(
    { open: true, query: 'v', active: 2 },
    { options, filtered: options, selected: 'md', id: 'k5-c', placeholder: 'Buscar…' },
  )
  assert.equal(view.inputValue, 'v')
  assert.equal(view.inputPlaceholder, 'Madrid')
  assert.equal(view.activeDescendant, 'k5-c-option-2')
  assert.equal(view.listId, 'k5-c-list')
  const closed = comboboxView(comboboxState(), { options, filtered: options, selected: 'md', id: 'k5-c', placeholder: 'Buscar…' })
  assert.equal(closed.inputValue, 'Madrid')
  assert.equal(closed.activeDescendant, undefined)
})

test('calendario: teclas, límites, periodo y mes de partida', () => {
  assert.equal(calendarMove('ArrowRight', '2026-10-31'), '2026-11-01')
  assert.equal(calendarMove('ArrowUp', '2026-10-16'), '2026-10-09')
  assert.equal(calendarMove('Home', '2026-10-16'), '2026-10-12')
  assert.equal(calendarMove('End', '2026-10-16', { weekStartsOn: 0 }), '2026-10-17')
  assert.equal(calendarMove('PageDown', '2026-01-31', { shift: true }), '2027-01-31')
  assert.equal(calendarMove('ArrowLeft', '2026-10-01', { min: '2026-10-01' }), '2026-10-01')
  assert.equal(calendarMove('Tab', '2026-10-01'), null)
  assert.equal(calendarMove('ArrowLeft', undefined), null)
  assert.equal(calendarChoose('2026-10-01', '2026-10-05'), '2026-10-05')
  assert.deepEqual(calendarChoose({ start: '2026-10-01', end: '' }, '2026-10-05', 'range'), { start: '2026-10-01', end: '2026-10-05' })
  assert.equal(calendarAnchor('', { today: '2026-10-16', max: '2026-09-30' }), '2026-09')
  assert.equal(calendarAnchor({ start: '2027-02-03', end: '' }, { mode: 'range', today: '2026-10-16' }), '2027-02')
  assert.equal(calendarShift('2026-12', 1), '2027-01')
})

test('calendario: la rejilla marca valor, periodo, hoy, bloqueados y el día con Tab', () => {
  const view = calendarView({
    visible: '2026-10',
    value: { start: '2026-10-05', end: '2026-10-08' },
    mode: 'range',
    today: '2026-10-16',
    max: '2026-10-20',
    locale: 'es-ES',
  })
  const days = view.weeks.flat().filter((day) => !day.outside)
  const day = (iso) => days.find((d) => d.iso === iso)
  assert.equal(view.title, 'Octubre de 2026')
  assert.equal(view.names[0].short.toLowerCase().startsWith('l'), true)
  assert.equal(day('2026-10-05').rangeStart, true)
  assert.equal(day('2026-10-06').between, true)
  assert.equal(day('2026-10-06').endpoint, false)
  assert.equal(day('2026-10-08').rangeEnd, true)
  assert.equal(day('2026-10-16').today, true)
  assert.equal(day('2026-10-21').disabled, true)
  assert.deepEqual(
    days.filter((d) => d.tabbable).map((d) => d.iso),
    ['2026-10-05'],
  )
  assert.equal(view.nextBlocked, true)
  assert.equal(view.prevBlocked, false)
})

test('tabla: orden, página, selección, columnas y filas virtuales', () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({ id: `r${i + 1}`, name: `Fila ${i + 1}`, kwp: (i * 7) % 10 }))
  const columns = [
    { key: 'name', header: 'Nombre' },
    { key: 'kwp', header: 'kWp', sortable: true },
  ]
  assert.deepEqual(nextSort(null, 'kwp'), { key: 'kwp', direction: 'asc' })
  assert.deepEqual(nextSort({ key: 'kwp', direction: 'asc' }, 'kwp'), { key: 'kwp', direction: 'desc' })
  assert.equal(sortRows(rows, columns, { key: 'name', direction: 'asc' }), rows, 'columna no ordenable: tal cual')
  const sorted = sortRows(rows, columns, { key: 'kwp', direction: 'desc' })
  assert.equal(sorted[0].kwp, 9)
  const view = tableView({ rows, columns, rowKey: 'id', sort: { key: 'kwp', direction: 'desc' }, page: 9, pageSize: 10, selected: ['r1'] })
  assert.deepEqual([view.total, view.count, view.current, view.visible.length], [25, 3, 3, 5], 'la página se ajusta a la última')
  assert.equal(view.all, false)
  const manual = tableView({ rows: rows.slice(0, 10), columns, rowKey: (row) => row.id, page: 2, manual: true, totalRows: 125 })
  assert.deepEqual([manual.total, manual.count, manual.visible[0].id], [125, 13, 'r1'])
  assert.deepEqual(toggleAllRows(['x'], ['a', 'b'], true), ['x', 'a', 'b'])
  assert.deepEqual(toggleAllRows(['x', 'a', 'b'], ['a', 'b'], false), ['x'])
  assert.deepEqual(toggleRow(['a'], 'a', true), ['a'])
  assert.deepEqual(toggleRow(['a', 'b'], 'a', false), ['b'])
  assert.deepEqual(toggleColumn(['kwp'], 'kwp', true), [])
  assert.deepEqual(toggleColumn([], 'kwp', false), ['kwp'])
  const many = Array.from({ length: 1000 }, (_, i) => ({ id: String(i) }))
  const virtual = tableView({
    rows: many,
    columns: [],
    rowKey: 'id',
    page: 1,
    pageSize: 1000,
    maxHeight: 400,
    scroll: { top: 0, viewport: 400, rowHeight: 40 },
  })
  assert.deepEqual([virtual.range.start, virtual.range.end], [0, 20])
  assert.equal(tableView({ rows: many, columns: [], rowKey: 'id', page: 1, pageSize: 1000 }).range, null)
})

test('tabla agrupada: grupos en el orden de rows, orden dentro de cada uno, total y plegados', () => {
  const rows = [
    { id: 'a', estado: 'Abierta', kwp: 3 },
    { id: 'b', estado: 'Cerrada', kwp: 9 },
    { id: 'c', estado: 'Abierta', kwp: 7 },
    { id: 'd', estado: '', kwp: 1 },
    { id: 'e', estado: 'Cerrada', kwp: 5 },
  ]
  const columns = [{ key: 'kwp', header: 'kWp', sortable: true }]
  assert.equal(groupRows(rows, undefined), rows, 'sin groupBy: tal cual')
  assert.deepEqual(
    groupRows(rows, 'estado').map((row) => row.id),
    ['a', 'c', 'b', 'e', 'd'],
  )
  // El orden de la columna manda dentro del grupo; el de los grupos no cambia al ordenar.
  const view = tableView({ rows, columns, rowKey: 'id', sort: { key: 'kwp', direction: 'desc' }, page: 1, groupBy: 'estado' })
  assert.deepEqual(
    view.groups.map((group) => [group.key, group.rows.map((row) => row.id), group.count]),
    [
      ['Abierta', ['c', 'a'], 2],
      ['Cerrada', ['b', 'e'], 2],
      ['', ['d'], 1],
    ],
  )
  // Un grupo partido entre dos páginas sale en las dos con su total entero.
  const second = tableView({ rows, columns, rowKey: 'id', page: 2, pageSize: 3, groupBy: (row) => row.estado || 'Sin estado' })
  assert.deepEqual(
    second.groups.map((group) => [group.key, group.rows.length, group.count]),
    [
      ['Cerrada', 1, 2],
      ['Sin estado', 1, 1],
    ],
  )
  // Las filas plegadas no cuentan para «seleccionar la página».
  const folded = tableView({ rows, columns, rowKey: 'id', page: 1, groupBy: 'estado', collapsed: ['Cerrada'], selected: ['a', 'c', 'd'] })
  assert.equal(folded.groups[1].collapsed, true)
  assert.deepEqual(folded.keys, ['a', 'c', 'd'])
  assert.equal(folded.all, true)
  // Con grupos no hay filas virtuales.
  const many = Array.from({ length: 1000 }, (_, i) => ({ id: String(i), g: String(i % 2) }))
  assert.equal(tableView({ rows: many, columns: [], rowKey: 'id', page: 1, pageSize: 1000, maxHeight: 400, groupBy: 'g' }).range, null)
})

test('combobox: «Crear "…"» solo cuando lo escrito no es ya una opción', () => {
  const create = (query) => withCreateOption([], query, options, `Crear «${query.trim()}»`)
  assert.deepEqual(create('Toledo'), [{ value: COMBOBOX_CREATE, label: 'Crear «Toledo»' }])
  assert.deepEqual(create('  madrid '), [], 'sin distinguir mayúsculas ni espacios')
  assert.deepEqual(create('   '), [])
  // Va detrás de las coincidencias y elegirla devuelve su valor, que el componente convierte en onCreate.
  const list = withCreateOption([options[0]], 'Mad', options, 'Crear «Mad»')
  assert.equal(list.length, 2)
  const picked = comboboxReduce({ open: true, query: 'Mad', active: 1 }, { type: 'key', key: 'Enter' }, { filtered: list })
  assert.equal(picked.select, COMBOBOX_CREATE)
})
