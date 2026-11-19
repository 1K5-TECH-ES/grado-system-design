// Núcleo común (0.6): el estado y el teclado de los componentes con más lógica, sin framework.
// React, Vue y los Web Components (grado-elements) los usan igual: cada evento entra en una
// función pura que devuelve el estado nuevo y lo que el adaptador tiene que hacer (elegir un
// valor, evitar la acción del navegador, mover el foco). Así el comportamiento es el mismo en
// los tres y se prueba una vez.
//   import { comboboxReduce, calendarView, tableView } from '@1k5-tech-es/grado/core'

import { compareValues, pageCount, virtualWindow, VIRTUAL_ROWS } from './patterns.js'
import { addDays, addMonths, clampDate, dateLabel, monthTitle, monthWeeks, nextRange, startOfWeek, weekdayNames } from './patterns.js'

// ---------- Combobox ----------

/** Valor de la opción «Crear "…"»: al elegirla, el combobox avisa con onCreate en lugar de seleccionar. */
export const COMBOBOX_CREATE = '\u0000create'

/**
 * Con onCreate: añade «Crear "…"» al final de las opciones que se ven si lo escrito no es ya una
 * opción (sin distinguir mayúsculas). label es el texto de esa opción, ya traducido.
 */
export function withCreateOption(filtered, query, options, label) {
  const text = query.trim().toLocaleLowerCase()
  if (!text || options.some((option) => option.label.trim().toLocaleLowerCase() === text)) return filtered
  return [...filtered, { value: COMBOBOX_CREATE, label }]
}

/** Estado inicial: lista cerrada, sin búsqueda ni opción activa. */
export const comboboxState = () => ({ open: false, query: '', active: -1 })

const enabledIndexes = (options) => options.map((option, i) => (option.disabled ? -1 : i)).filter((i) => i >= 0)

/**
 * Un evento del combobox: focus, click, input ({ value }), key ({ key }), hover ({ index }),
 * leave (el foco sale del componente) o pick ({ option }). ctx: { filtered, loading }, las
 * opciones que se ven ahora. Devuelve { state, select?, query?, focusInput?, preventDefault?,
 * stopPropagation? }: select es el valor que hay que elegir ('' lo vacía) y query, la búsqueda
 * que hay que avisar.
 */
export function comboboxReduce(state, event, { filtered = [], loading = false } = {}) {
  const pick = (option) =>
    option.disabled ? { state } : { state: { ...state, open: false, query: '' }, select: option.value, focusInput: true }
  switch (event.type) {
    case 'focus':
      return { state: { ...state, open: true, active: -1 } }
    case 'click':
      return { state: { ...state, open: true } }
    case 'input': {
      const next = { state: { ...state, query: event.value, active: -1, open: true }, query: event.value }
      return event.value ? next : { ...next, select: '' }
    }
    case 'hover':
      return filtered[event.index] && !filtered[event.index].disabled ? { state: { ...state, active: event.index } } : { state }
    case 'leave':
      return { state: { ...state, open: false, query: '', active: -1 } }
    case 'pick':
      return pick(event.option)
    case 'key': {
      if (event.key === 'Escape') return { state: { ...state, open: false, query: '' }, preventDefault: true, stopPropagation: true }
      if (event.key === 'Enter' && state.open) {
        const option = filtered[state.active]
        if (!loading && option) return { ...pick(option), preventDefault: true }
        return { state, preventDefault: true }
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return { state }
      if (!state.open && ['Home', 'End'].includes(event.key)) return { state }
      const enabled = enabledIndexes(filtered)
      const position = enabled.indexOf(state.active)
      const active =
        event.key === 'Home'
          ? (enabled[0] ?? -1)
          : event.key === 'End'
            ? (enabled[enabled.length - 1] ?? -1)
            : (enabled[
                position < 0
                  ? event.key === 'ArrowDown'
                    ? 0
                    : enabled.length - 1
                  : (position + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length
              ] ?? -1)
      return { state: { ...state, open: true, active }, preventDefault: true }
    }
    default:
      return { state }
  }
}

/**
 * Lo que pinta el combobox para un estado: el texto y el placeholder del campo, la opción
 * elegida y la activa, y los ids de la lista y de cada opción.
 */
export function comboboxView(state, { options, filtered, selected, id, placeholder }) {
  const chosen = options.find((option) => option.value === selected)
  const activeOption = filtered[state.active]
  return {
    chosen,
    activeOption,
    listId: `${id}-list`,
    optionId: (index) => `${id}-option-${index}`,
    activeDescendant: state.open && activeOption && !activeOption.disabled ? `${id}-option-${state.active}` : undefined,
    inputValue: state.open ? state.query : (chosen?.label ?? ''),
    inputPlaceholder: state.open ? (chosen?.label ?? placeholder) : placeholder,
  }
}

// ---------- Calendar ----------

const KEY_MOVES = {
  ArrowLeft: (iso) => addDays(iso, -1),
  ArrowRight: (iso) => addDays(iso, 1),
  ArrowUp: (iso) => addDays(iso, -7),
  ArrowDown: (iso) => addDays(iso, 7),
  Home: (iso, _, start) => startOfWeek(iso, start),
  End: (iso, _, start) => addDays(startOfWeek(iso, start), 6),
  PageUp: (iso, shift) => addMonths(iso, shift ? -12 : -1),
  PageDown: (iso, shift) => addMonths(iso, shift ? 12 : 1),
}

/**
 * Fecha a la que lleva una tecla desde el día enfocado, dentro de min y max; null si la tecla
 * no mueve. Flechas: días y semanas; Inicio y Fin: la semana; Re Pág y Av Pág: meses (con
 * Mayúsculas, años).
 */
export function calendarMove(key, from, { shift = false, weekStartsOn = 1, min, max } = {}) {
  const move = KEY_MOVES[key]
  return move && from ? clampDate(move(from, shift, weekStartsOn), min, max) : null
}

/** El valor nuevo al pulsar un día: la fecha, o en un periodo el siguiente paso (inicio y final). */
export const calendarChoose = (value, iso, mode = 'single') =>
  mode === 'range' ? nextRange(value && typeof value === 'object' ? value : { start: '', end: '' }, iso) : iso

/** El mes que se ve al empezar: el del valor o el de hoy, dentro de min y max (YYYY-MM). */
export function calendarAnchor(value, { mode = 'single', today, min, max }) {
  const iso = mode === 'range' ? value?.start : value
  return (iso || clampDate(today, min, max)).slice(0, 7)
}

/**
 * Todo lo que pinta el calendario: título, nombres de los días, semanas con cada día marcado
 * (fuera del mes, extremo del valor, dentro del periodo, hoy, bloqueado, el que recibe el Tab)
 * y si se puede ir al mes anterior o al siguiente.
 */
export function calendarView({ visible, value, mode = 'single', today, min, max, focusDate, weekStartsOn = 1, locale }) {
  const range = mode === 'range'
  const single = typeof value === 'string' ? value : ''
  const span = value && typeof value === 'object' ? value : { start: '', end: '' }
  const inMonth = (iso) => Boolean(iso && iso.startsWith(visible))
  const tabbable = [focusDate, range ? span.start : single, today, `${visible}-01`].find(inMonth)
  const blocked = (iso) => Boolean((min && iso < min) || (max && iso > max))
  const weeks = monthWeeks(visible, weekStartsOn).map((week) =>
    week.map((day) => {
      if (day.outside) return { ...day }
      const endpoint = range ? day.iso === span.start || day.iso === span.end : day.iso === single
      const between = Boolean(range && span.start && span.end && day.iso >= span.start && day.iso <= span.end)
      return {
        ...day,
        endpoint,
        between,
        selected: endpoint || between,
        rangeStart: between && day.iso === span.start,
        rangeEnd: between && day.iso === span.end,
        today: day.iso === today,
        disabled: blocked(day.iso),
        tabbable: day.iso === tabbable,
        label: dateLabel(day.iso, locale),
      }
    }),
  )
  return {
    title: monthTitle(visible, locale),
    names: weekdayNames(locale, weekStartsOn),
    weeks,
    prevBlocked: Boolean(min && `${visible}-01` <= min),
    nextBlocked: Boolean(max && addMonths(`${visible}-01`, 1) > max),
  }
}

/** El mes visible tras pulsar anterior (-1) o siguiente (1). */
export const calendarShift = (visible, months) => addMonths(`${visible}-01`, months).slice(0, 7)

// ---------- DataTable ----------

/** Orden nuevo al pulsar una columna: ascendente, y descendente si ya lo estaba. */
export const nextSort = (sort, key) => ({ key, direction: sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc' })

/** Selección tras marcar o desmarcar todas las filas de la página. */
export const toggleAllRows = (selected, keys, checked) =>
  checked ? [...new Set([...selected, ...keys])] : selected.filter((key) => !keys.includes(key))

/** Selección tras marcar o desmarcar una fila. */
export const toggleRow = (selected, key, checked) =>
  checked ? [...new Set([...selected, key])] : selected.filter((value) => value !== key)

/** Columnas ocultas tras marcar o desmarcar una en «Columnas». */
export const toggleColumn = (hidden, key, visible) => (visible ? hidden.filter((value) => value !== key) : [...hidden, key])

const groupOf = (groupBy) => (typeof groupBy === 'function' ? groupBy : (row) => String(row[groupBy] ?? ''))

/**
 * Filas juntas por grupo (groupBy: un campo o una función). Los grupos salen en el orden en que
 * aparecen en order (por defecto, rows); dentro de cada grupo, las filas siguen en su orden.
 */
export function groupRows(rows, groupBy, order = rows) {
  if (!groupBy) return rows
  const of = groupOf(groupBy),
    index = new Map()
  for (const row of order) if (!index.has(of(row))) index.set(of(row), index.size)
  return [...rows].sort((a, b) => (index.get(of(a)) ?? 0) - (index.get(of(b)) ?? 0))
}

/**
 * Lo que pinta DataTable: la página (ordenada en el cliente salvo con manual), sus claves, si
 * están todas o algunas seleccionadas, el total y las páginas, y el tramo de filas virtuales
 * si hay alto máximo y más de VIRTUAL_ROWS filas. sorted se puede pasar ya calculado (memo).
 * Con groupBy, groups trae los grupos de la página: { key, rows, count (en todas las filas),
 * collapsed }. Las filas de un grupo plegado no cuentan para «seleccionar la página», y con
 * grupos no hay filas virtuales.
 */
export function tableView({
  rows,
  columns,
  rowKey,
  sort,
  page,
  pageSize = 10,
  manual = false,
  totalRows,
  selected = [],
  maxHeight,
  loading = false,
  error,
  scroll,
  sorted,
  groupBy,
  collapsed = [],
}) {
  const keyOf = (row) => (typeof rowKey === 'function' ? rowKey(row) : String(row[rowKey]))
  const total = manual ? (totalRows ?? rows.length) : rows.length
  const size = Math.max(1, pageSize)
  const count = pageCount(total, size)
  const current = Math.min(count, Math.max(1, page))
  const ordered = groupRows(sorted ?? sortRows(rows, columns, sort, manual), groupBy, rows)
  const visible = manual ? groupRows(rows, groupBy) : ordered.slice((current - 1) * size, current * size)
  let groups = null
  if (groupBy) {
    const of = groupOf(groupBy),
      counts = new Map()
    for (const row of rows) counts.set(of(row), (counts.get(of(row)) ?? 0) + 1)
    groups = []
    for (const row of visible) {
      const key = of(row),
        last = groups[groups.length - 1]
      if (last?.key === key) last.rows.push(row)
      else groups.push({ key, rows: [row], count: counts.get(key), collapsed: collapsed.includes(key) })
    }
  }
  const keys = (groups ? groups.flatMap((group) => (group.collapsed ? [] : group.rows)) : visible).map(keyOf)
  const virtual = !groups && maxHeight != null && !loading && !error && visible.length > VIRTUAL_ROWS
  return {
    keyOf,
    total,
    size,
    count,
    current,
    visible,
    keys,
    all: keys.length > 0 && keys.every((key) => selected.includes(key)),
    some: keys.some((key) => selected.includes(key)),
    groups,
    range: virtual
      ? virtualWindow({ count: visible.length, rowHeight: scroll?.rowHeight, scrollTop: scroll?.top, viewport: scroll?.viewport })
      : null,
  }
}

/** Filas ordenadas por una columna ordenable (en el cliente). Con manual o sin orden, tal cual. */
export function sortRows(rows, columns, sort, manual = false) {
  const column = columns.find((col) => col.key === sort?.key && col.sortable)
  if (manual || !column || !sort) return rows
  const value = (row) => (column.sortValue ? column.sortValue(row) : row[column.key])
  return [...rows].sort((a, b) => compareValues(value(a), value(b)) * (sort.direction === 'asc' ? 1 : -1))
}
