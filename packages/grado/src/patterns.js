/** Comportamiento compartido por React y Vue, sin depender de ninguno de los dos. */
import { DEFAULT_LOCALE, MESSAGES, formatMessage } from './messages.js'

const ES = MESSAGES[DEFAULT_LOCALE]
// Acepta solo un objeto de textos: así selectionLabel funciona también en array.map().
const textsOr = (messages) => (messages && typeof messages === 'object' ? messages : ES)
export function normalizeSearch(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim()
}

export function filterOptions(options, query) {
  const needle = normalizeSearch(query)
  return options.filter((option) => normalizeSearch(`${option.label} ${option.keywords ?? ''}`).includes(needle))
}

export function pageCount(total, pageSize) {
  return Math.max(1, Math.ceil(Math.max(0, total) / Math.max(1, pageSize)))
}

export function pageItems(page, count) {
  const current = Math.min(count, Math.max(1, page))
  const pages = [...new Set([1, count, current - 1, current, current + 1].filter((n) => n > 0 && n <= count))].sort((a, b) => a - b)
  const result = []
  for (const n of pages) {
    const previous = result.at(-1)
    if (typeof previous === 'number' && n - previous > 1) result.push('ellipsis')
    result.push(n)
  }
  return result
}

export function compareValues(a, b) {
  if (a == null) return b == null ? 0 : 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'es', { numeric: true, sensitivity: 'base' })
}

export function fileError(file, accept = '', maxSize, { messages = ES, locale = DEFAULT_LOCALE } = {}) {
  if (maxSize != null && file.size > maxSize) {
    const size = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(Math.round((maxSize / 1024 / 1024) * 10) / 10)
    return formatMessage(messages.uploadTooBig, { name: file.name, size })
  }
  const rules = accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
  const type = file.type.toLowerCase()
  const valid =
    !rules.length ||
    rules.some((rule) =>
      rule.startsWith('.')
        ? file.name.toLowerCase().endsWith(rule)
        : rule.endsWith('/*')
          ? type.startsWith(rule.slice(0, -1))
          : type === rule,
    )
  return valid ? '' : formatMessage(messages.uploadFormat, { name: file.name })
}

export function rangeError(start, end, min, max, texts) {
  const messages = textsOr(texts)
  if (start && end && start > end) return messages.rangeInverted
  if (min && ((start && start < min) || (end && end < min))) return formatMessage(messages.rangeMin, { min })
  if (max && ((start && start > max) || (end && end > max))) return formatMessage(messages.rangeMax, { max })
  return ''
}

/** Lock scroll safely even when more than one modal is open. */
const locks = new WeakMap()
export function lockScroll(doc) {
  const state = locks.get(doc) ?? { count: 0, previous: doc.body.style.overflow }
  state.count++
  locks.set(doc, state)
  doc.body.style.overflow = 'hidden'
  let released = false
  return () => {
    if (released) return
    released = true
    if (--state.count === 0) {
      doc.body.style.overflow = state.previous
      locks.delete(doc)
    }
  }
}

/** Roving focus with arrows, Home/End and printable-character navigation. */
export function moveFocus(event, container, selector, horizontal = false) {
  const items = [...container.querySelectorAll(selector)].filter((el) => !el.disabled && el.getAttribute('aria-disabled') !== 'true')
  if (!items.length) return
  const index = items.indexOf(container.ownerDocument.activeElement)
  let next
  if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = items.length - 1
  else if (event.key === (horizontal ? 'ArrowRight' : 'ArrowDown')) next = (index + 1) % items.length
  else if (event.key === (horizontal ? 'ArrowLeft' : 'ArrowUp')) next = (index - 1 + items.length) % items.length
  else if (!horizontal && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)]
    const match = ordered.find((el) => normalizeSearch(el.textContent).startsWith(normalizeSearch(event.key)))
    if (match) {
      event.preventDefault()
      match.focus()
    }
    return
  }
  if (next != null) {
    event.preventDefault()
    items[next].focus()
  }
}

/**
 * Siguiente posición en una lista con flechas, Home y End, dando la vuelta en los extremos.
 * Para grupos de radios: izquierda y arriba retroceden, derecha y abajo avanzan.
 * Devuelve null si la tecla no mueve nada.
 */
export function nextIndex(key, index, length) {
  if (!length) return null
  if (key === 'Home') return 0
  if (key === 'End') return length - 1
  if (key === 'ArrowRight' || key === 'ArrowDown') return (index + 1 + length) % length
  if (key === 'ArrowLeft' || key === 'ArrowUp') return index < 0 ? length - 1 : (index - 1 + length) % length
  return null
}

/** ¿Se sale el elemento por el lado `side` ('left' | 'right')? Cuenta la ventana y cualquier
 *  contenedor que recorte (overflow distinto de visible), como el scroll de AppShell. */
export function overflowsSide(element, side) {
  const view = element.ownerDocument.defaultView
  let left = 0,
    right = element.ownerDocument.documentElement.clientWidth
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (view.getComputedStyle(node).overflowX === 'visible') continue
    const box = node.getBoundingClientRect()
    left = Math.max(left, box.left)
    right = Math.min(right, box.right)
  }
  const rect = element.getBoundingClientRect()
  return side === 'left' ? rect.left < left : rect.right > right
}

/** «Ninguna fila seleccionada», «1 fila seleccionada», «3 filas seleccionadas». */
export function selectionLabel(count, texts) {
  const messages = textsOr(texts)
  if (!count) return messages.selectedNone
  return count === 1 ? messages.selectedOne : formatMessage(messages.selectedMany, { count })
}

// ---------- Números (NumberInput) ----------

function separators(locale) {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6)
  return { group: parts.find((p) => p.type === 'group')?.value ?? '', decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.' }
}

/**
 * Texto escrito por una persona → número. Entiende el formato del idioma («1.234,5» en
 * español) y también el punto decimal («8.4» es 8,4: un punto sin grupos de tres cifras
 * detrás no puede ser separador de miles). Devuelve null si está vacío y NaN si no es un número.
 */
export function parseNumber(text, locale = DEFAULT_LOCALE) {
  const raw = String(text ?? '')
    .trim()
    .replace(/\s|\u00a0|\u202f/g, '')
    .replace(/^\u2212/, '-')
  if (!raw) return null
  const { group, decimal } = separators(locale)
  let normalized = raw
  if (decimal !== '.' && raw.includes(decimal)) normalized = raw.split(group).join('').replace(decimal, '.')
  else if (group && raw.includes(group)) {
    const grouped = new RegExp(`^-?\\d{1,3}(\\${group}\\d{3})+$`).test(raw)
    // «8.4» en español o «8,4» en inglés: el separador no forma grupos de tres, así que es decimal.
    normalized = grouped ? raw.split(group).join('') : raw.split(group).length === 2 ? raw.replace(group, '.') : raw
  } else if (raw.includes(',')) normalized = raw.split(',').length === 2 ? raw.replace(',', '.') : raw
  return /^-?(\d+\.?\d*|\.\d+)$/.test(normalized) ? Number(normalized) : NaN
}

/** Cifras decimales de un paso: 0.1 → 1, 0.25 → 2, 5 → 0. */
export function decimalsOf(step) {
  const text = String(step)
  if (text.includes('e-')) return Number(text.split('e-')[1])
  return text.includes('.') ? text.split('.')[1].length : 0
}

export function formatNumber(value, locale = DEFAULT_LOCALE, decimals = 2) {
  if (value == null || Number.isNaN(value)) return ''
  return new Intl.NumberFormat(locale, { maximumFractionDigits: decimals }).format(value)
}

export function clampNumber(value, min, max) {
  let next = value
  if (min != null && next < min) next = min
  if (max != null && next > max) next = max
  return next
}

/** Suma `times` pasos sin arrastrar errores de coma flotante (0.1 + 0.2). */
export function stepNumber(value, step, times, min, max) {
  // Sin valor, el primer paso lleva al mínimo (o a 0).
  if (value == null || Number.isNaN(value)) return clampNumber(min ?? 0, min, max)
  const decimals = Math.max(decimalsOf(step), decimalsOf(value))
  const next = Math.round((value + step * times) * 10 ** decimals) / 10 ** decimals
  return clampNumber(next, min, max)
}

// ---------- Fechas (Calendar). Siempre en ISO YYYY-MM-DD, sin zona horaria ----------

const pad = (n) => String(n).padStart(2, '0')
export function toIso(year, month, day) {
  return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`
}
export function parseIso(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''))
  return match ? { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) } : null
}
const utc = (iso) => {
  const d = parseIso(iso)
  return new Date(Date.UTC(d.year, d.month - 1, d.day))
}
const fromUtc = (date) => toIso(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())

export function todayIso(now = new Date()) {
  return toIso(now.getFullYear(), now.getMonth() + 1, now.getDate())
}
export function addDays(iso, days) {
  const date = utc(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return fromUtc(date)
}
/** Suma meses y, si el día no existe (31 de abril), se queda en el último del mes. */
export function addMonths(iso, months) {
  const { year, month, day } = parseIso(iso)
  const first = new Date(Date.UTC(year, month - 1 + months, 1))
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
  return toIso(first.getUTCFullYear(), first.getUTCMonth() + 1, Math.min(day, last))
}
/** 0 = domingo … 6 = sábado. */
export function weekday(iso) {
  return utc(iso).getUTCDay()
}
export function startOfWeek(iso, weekStartsOn = 1) {
  return addDays(iso, -((weekday(iso) - weekStartsOn + 7) % 7))
}
export function clampDate(iso, min, max) {
  if (min && iso < min) return min
  if (max && iso > max) return max
  return iso
}

/** Seis semanas del mes de `month` (YYYY-MM), con los días de los meses vecinos. */
export function monthWeeks(month, weekStartsOn = 1) {
  const first = `${month}-01`
  let day = startOfWeek(first, weekStartsOn)
  const weeks = []
  for (let w = 0; w < 6; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      week.push({ iso: day, day: parseIso(day).day, outside: !day.startsWith(month) })
      day = addDays(day, 1)
    }
    weeks.push(week)
  }
  return weeks
}

/** Nombres de los días de la semana, empezando por `weekStartsOn`. */
export function weekdayNames(locale = DEFAULT_LOCALE, weekStartsOn = 1) {
  const short = new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC' })
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' })
  // 2026-01-04 es domingo.
  return Array.from({ length: 7 }, (_, i) => {
    const date = utc(addDays('2026-01-04', (weekStartsOn + i) % 7))
    return { short: short.format(date).toLocaleUpperCase(locale), long: long.format(date) }
  })
}
export function monthTitle(month, locale = DEFAULT_LOCALE) {
  const text = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(utc(`${month}-01`))
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1)
}
export function dateLabel(iso, locale = DEFAULT_LOCALE) {
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    utc(iso),
  )
}

/** Siguiente valor de un rango al elegir `iso`: primero el inicio, después el final. */
export function nextRange(range, iso) {
  const { start = '', end = '' } = range ?? {}
  if (!start || end) return { start: iso, end: '' }
  return iso < start ? { start: iso, end: start } : { start, end: iso }
}

// ---------- Gráficos (BarChart) ----------

/** Escala «redonda» de 0 a un máximo que cubre `max`: 0, 100, 200, 300. */
export function niceScale(max, count = 4) {
  if (!(max > 0)) return { max: 1, step: 0.25, ticks: [0, 0.25, 0.5, 0.75, 1] }
  const raw = max / count
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((n) => n * magnitude).find((n) => n >= raw)
  const top = Math.ceil(max / step - 1e-9) * step
  const ticks = []
  for (let value = 0; value <= top + step / 2; value += step) ticks.push(Math.round(value * 1e6) / 1e6)
  return { max: top, step, ticks }
}

// ---------- Paleta de comandos ----------

/** Filtra los grupos por texto (sin tildes) y quita los que se quedan vacíos. */
export function filterGroups(groups, query) {
  const needle = normalizeSearch(query)
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        normalizeSearch(`${item.label} ${item.description ?? ''} ${item.keywords ?? ''}`).includes(needle),
      ),
    }))
    .filter((group) => group.items.length > 0)
}

/** ¿Es el atajo Ctrl/⌘ + tecla? */
export function isShortcut(event, key) {
  return Boolean(key) && (event.metaKey || event.ctrlKey) && !event.altKey && String(event.key).toLowerCase() === String(key).toLowerCase()
}
