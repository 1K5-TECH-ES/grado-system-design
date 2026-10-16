/** Comportamiento compartido por React y Vue, sin depender de ninguno de los dos. */
import { DEFAULT_LOCALE, MESSAGES, formatMessage } from './messages.js'
import { collator, dateTimeFormat, numberFormat } from './intl.js'

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

// Texto normalizado de cada opción, para no repetirlo en cada tecla. Si la opción cambia
// de objeto (otro array de opciones) se calcula de nuevo; si no, se reutiliza.
const searchTexts = new WeakMap()
function searchText(item, text) {
  const saved = searchTexts.get(item)
  if (saved?.text === text) return saved.normalized
  const normalized = normalizeSearch(text)
  searchTexts.set(item, { text, normalized })
  return normalized
}

export function filterOptions(options, query) {
  const needle = normalizeSearch(query)
  if (!needle) return options
  return options.filter((option) => searchText(option, `${option.label} ${option.keywords ?? ''}`).includes(needle))
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
  return collator('es', { numeric: true, sensitivity: 'base' }).compare(String(a), String(b))
}

export function fileError(file, accept = '', maxSize, { messages = ES, locale = DEFAULT_LOCALE } = {}) {
  if (maxSize != null && file.size > maxSize) {
    const size = numberFormat(locale, { maximumFractionDigits: 1 }).format(Math.round((maxSize / 1024 / 1024) * 10) / 10)
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
  const parts = numberFormat(locale).formatToParts(12345.6)
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
  return numberFormat(locale, { maximumFractionDigits: decimals }).format(value)
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
  const short = dateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC' })
  const long = dateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' })
  // 2026-01-04 es domingo.
  return Array.from({ length: 7 }, (_, i) => {
    const date = utc(addDays('2026-01-04', (weekStartsOn + i) % 7))
    return { short: short.format(date).toLocaleUpperCase(locale), long: long.format(date) }
  })
}
export function monthTitle(month, locale = DEFAULT_LOCALE) {
  const text = dateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(utc(`${month}-01`))
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1)
}
export function dateLabel(iso, locale = DEFAULT_LOCALE) {
  return dateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(utc(iso))
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
  if (!needle) return groups.filter((group) => group.items.length > 0)
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        searchText(item, `${item.label} ${item.description ?? ''} ${item.keywords ?? ''}`).includes(needle),
      ),
    }))
    .filter((group) => group.items.length > 0)
}

/** ¿Es el atajo Ctrl/⌘ + tecla? */
export function isShortcut(event, key) {
  return Boolean(key) && (event.metaKey || event.ctrlKey) && !event.altKey && String(event.key).toLowerCase() === String(key).toLowerCase()
}

// ---------- Datos y piezas (0.3) ----------
/** 0.64 → «64 %» (es-ES y de-DE con espacio fino, en-GB «64%»). */
export function formatPercent(ratio, locale = DEFAULT_LOCALE, decimals = 0) {
  if (ratio == null || Number.isNaN(ratio)) return ''
  return numberFormat(locale, { style: 'percent', maximumFractionDigits: decimals }).format(ratio)
}

/**
 * Todo lo que necesita Progress para pintarse igual en React y Vue.
 * value null o undefined: indeterminado. steps: variante por pasos (value = pasos completados).
 */
export function progressState({ value, max = 100, steps, locale = DEFAULT_LOCALE, messages } = {}) {
  const texts = textsOr(messages)
  const stepped = Number.isFinite(steps) && steps > 0
  const top = stepped ? Math.round(steps) : max > 0 ? max : 100
  if (value == null || Number.isNaN(value)) return { indeterminate: true, stepped, max: top, now: null, ratio: 0, text: '' }
  const now = clampNumber(stepped ? Math.round(value) : value, 0, top)
  const ratio = now / top
  const text = stepped ? formatMessage(texts.progressStep, { value: now, max: top }) : formatPercent(ratio, locale)
  return { indeterminate: false, stepped, max: top, now, ratio, text }
}

/** Avatares que se ven y los que van en el círculo «+N». */
export function splitAvatars(items = [], max = 4) {
  const limit = Math.max(1, Math.floor(max))
  return items.length > limit ? { shown: items.slice(0, limit), rest: items.slice(limit) } : { shown: items, rest: [] }
}

/**
 * Al quitar un Tag su botón desaparece. Devuelve el botón de quitar de la etiqueta siguiente
 * (o, si es la última, de la anterior) del mismo contenedor, para no perder el foco.
 */
export function tagFocusTarget(button) {
  const tag = button?.closest?.('.k5-tag')
  if (!tag?.parentElement) return null
  const buttons = [...tag.parentElement.children].map((el) => el.querySelector?.('.k5-tag__remove')).filter((el) => el && !el.disabled)
  const index = buttons.indexOf(button)
  return buttons[index + 1] ?? buttons[index - 1] ?? null
}

/**
 * Copia un texto al portapapeles. Usa navigator.clipboard y, si no existe o falla (http,
 * permisos), un textarea temporal con execCommand('copy'). Devuelve true si se ha copiado.
 * env: el objeto global; se puede sustituir en pruebas.
 */
export async function copyText(text, env = globalThis) {
  const value = String(text ?? '')
  try {
    if (env.navigator?.clipboard?.writeText) {
      await env.navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    // Sigue con el método antiguo.
  }
  const doc = env.document
  if (!doc?.body) return false
  const active = doc.activeElement
  const area = doc.createElement('textarea')
  area.value = value
  area.setAttribute('readonly', '')
  area.setAttribute('aria-hidden', 'true')
  area.style.position = 'fixed'
  area.style.top = '0'
  area.style.left = '0'
  area.style.opacity = '0'
  doc.body.appendChild(area)
  area.select()
  let copied = false
  try {
    copied = Boolean(doc.execCommand?.('copy'))
  } catch {
    copied = false
  }
  area.remove()
  // El foco vuelve al botón que pidió la copia.
  active?.focus?.()
  return copied
}

// ---------- Gráficos (0.3) ----------
// Sparkline, LineChart, Donut, Meter y EnergyFlow. Las coordenadas van en un lienzo de
// 100 × 100 (y = 0 arriba) que el SVG estira con preserveAspectRatio="none".

const round2 = (n) => Math.round(n * 100) / 100
const finite = (v) => typeof v === 'number' && Number.isFinite(v)

/**
 * Puntos de una sparkline. La escala va del mínimo al máximo de los datos; si todos son
 * iguales (o solo hay uno), la línea queda plana en el centro.
 */
export function sparklinePoints(values) {
  const data = (values ?? []).filter(finite)
  if (!data.length) return []
  const series = data.length === 1 ? [data[0], data[0]] : data
  const min = Math.min(...series)
  const max = Math.max(...series)
  return series.map((v, i) => ({
    x: round2((i / (series.length - 1)) * 100),
    y: max === min ? 50 : round2(((max - v) / (max - min)) * 100),
  }))
}

/** Puntos de una serie de LineChart: cada valor en el centro de su columna, en una escala de 0 a `max`. */
export function chartPoints(values, max) {
  const top = max > 0 ? max : 1
  return values.map((v, i) => ({
    x: round2(((i + 0.5) / values.length) * 100),
    y: round2(100 - (Math.min(Math.max(0, finite(v) ? v : 0), top) / top) * 100),
  }))
}

/** Trazo SVG que une los puntos: «M0 50 L50 20 L100 80». */
export function linePath(points) {
  return points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ')
}

/** Trazo SVG cerrado bajo la línea, hasta `base` (100 = abajo del todo). */
export function areaPath(points, base = 100) {
  if (!points.length) return ''
  return `${linePath(points)} L${points[points.length - 1].x} ${base} L${points[0].x} ${base} Z`
}

/**
 * Porciones de un donut: dónde empieza cada una y cuánto ocupa (de 0 a 100), y su
 * porcentaje entero. Sin `total`, el total es la suma y los porcentajes suman 100.
 */
export function donutSlices(values, total) {
  const clean = values.map((v) => (finite(v) && v > 0 ? v : 0))
  const sum = total != null ? total : clean.reduce((a, b) => a + b, 0)
  if (!(sum > 0)) return clean.map(() => ({ start: 0, length: 0, percent: 0 }))
  const shares = clean.map((v) => (Math.min(v, sum) / sum) * 100)
  const percents = shares.map(Math.floor)
  if (total == null) {
    // Reparto por el mayor resto: 33,3 + 33,3 + 33,3 → 34 + 33 + 33.
    let missing = 100 - percents.reduce((a, b) => a + b, 0)
    const order = shares.map((s, i) => [s - Math.floor(s), i]).sort((a, b) => b[0] - a[0])
    for (const [, i] of order) {
      if (missing <= 0) break
      if (shares[i] > 0) {
        percents[i]++
        missing--
      }
    }
  } else shares.forEach((s, i) => (percents[i] = Math.round(s)))
  let start = 0
  return shares.map((length, i) => {
    const slice = { start: round2(start), length: round2(length), percent: percents[i] }
    start += length
    return slice
  })
}

/** Parte del rango que ocupa el valor, de 0 a 1. */
export function meterRatio(value, min = 0, max = 100) {
  if (!(max > min) || !finite(value)) return 0
  return Math.round(Math.min(1, Math.max(0, (value - min) / (max - min))) * 1e6) / 1e6
}

/**
 * Tono de un medidor con el criterio de <meter> de HTML: la zona donde cae optimum es
 * buena; la vecina, regular; la opuesta, mala. Sin low, high ni optimum: neutral.
 */
export function meterLevel({ value, min = 0, max = 100, low, high, optimum } = {}) {
  if (low == null && high == null && optimum == null) return 'neutral'
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
  const v = clamp(finite(value) ? value : min, min, max)
  const lo = clamp(low ?? min, min, max)
  const hi = clamp(high ?? max, lo, max)
  const best = clamp(optimum ?? (min + max) / 2, min, max)
  if (best < lo) return v <= lo ? 'good' : v <= hi ? 'fair' : 'poor'
  if (best > hi) return v >= hi ? 'good' : v >= lo ? 'fair' : 'poor'
  return v >= lo && v <= hi ? 'good' : 'fair'
}

/** Segmentos encendidos de un medidor por segmentos (redondeo al más cercano). */
export function meterSegments(ratio, count) {
  return Math.min(count, Math.max(0, Math.round(ratio * count)))
}

const ENERGY_STATES = {
  solar: ['energyProducing', 'energyNoProduction', 'energyProducing'],
  home: ['energyConsuming', 'energyNoConsumption', 'energyConsuming'],
  battery: ['energyCharging', 'energyBatteryIdle', 'energyDischarging'],
  grid: ['energyImporting', 'energyGridIdle', 'energyExporting'],
}
/**
 * Sentido y texto de estado de un nodo del flujo de energía, respecto al inversor del
 * centro: 'in' si la energía llega al inversor, 'out' si sale de él, 'none' si vale 0.
 * battery: positivo = cargando. grid: positivo = importando de la red.
 */
export function energyFlow(node, value) {
  const v = finite(value) ? value : 0
  const [positive, idle, negative] = ENERGY_STATES[node] ?? ENERGY_STATES.solar
  if (v === 0) return { flow: 'none', state: idle }
  const towardHub = node === 'solar' || node === 'grid' ? v > 0 : node === 'battery' ? v < 0 : false
  return { flow: towardHub ? 'in' : 'out', state: v > 0 ? positive : negative }
}

// ---------- Campos especiales (0.3) ----------
// Cursor al reformatear un campo mientras se escribe («612 345 678», «ES91 2100…»): se cuentan
// las letras y cifras que hay antes del cursor y se coloca detrás del mismo número en el texto nuevo.
const SIGNIFICANT = /[0-9A-Za-z]/
/** Letras y cifras que hay en `text` antes de la posición `end`. */
export function significantCount(text, end = String(text ?? '').length) {
  let count = 0
  for (const char of String(text ?? '').slice(0, end)) if (SIGNIFICANT.test(char)) count++
  return count
}
/** Posición en `text` justo detrás de la letra o cifra número `count`. */
export function caretAfter(text, count) {
  const value = String(text ?? '')
  if (count <= 0) return 0
  let seen = 0
  for (let i = 0; i < value.length; i++) {
    if (SIGNIFICANT.test(value[i]) && ++seen === count) return i + 1
  }
  return value.length
}

// ---------- Horas (TimePicker). Siempre «HH:MM», de 00:00 a 23:59 ----------

/**
 * Hora escrita por una persona → minutos desde las 00:00. Entiende «9», «930», «0930»,
 * «9:30», «09.30» y «9h30». Devuelve null si no es una hora válida.
 */
export function parseTime(text) {
  const raw = String(text ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[.,h]/g, ':')
  let match = /^(\d{1,2}):?$/.exec(raw) ?? /^(\d{1,2}):(\d{2})$/.exec(raw)
  if (!match) {
    const digits = /^(\d{3,4})$/.exec(raw)
    if (digits) match = [raw, raw.slice(0, -2), raw.slice(-2)]
  }
  if (!match) return null
  const hours = Number(match[1]),
    minutes = Number(match[2] ?? 0)
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

/** Minutos desde las 00:00 → «HH:MM». */
export function formatTime(minutes) {
  if (minutes == null || Number.isNaN(minutes)) return ''
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

/** «930» → «09:30». Devuelve null si no es una hora. */
export function normalizeTime(text) {
  const minutes = parseTime(text)
  return minutes == null ? null : formatTime(minutes)
}

/** Franjas cada `step` minutos de `min` a `max`, ambas incluidas: «08:00», «08:15»… */
export function timeSlots(min = '00:00', max = '23:59', step = 15) {
  const from = parseTime(min) ?? 0,
    to = parseTime(max) ?? 1439,
    every = Math.max(1, Math.round(step))
  const slots = []
  for (let minutes = from; minutes <= to; minutes += every) slots.push(formatTime(minutes))
  return slots
}

/** Posición de la franja más cercana a `time` (la primera si empatan), o -1. */
export function nearestTime(slots, time) {
  const target = parseTime(time)
  if (target == null || !slots.length) return -1
  let best = -1,
    distance = Infinity
  slots.forEach((slot, index) => {
    const d = Math.abs((parseTime(slot) ?? 0) - target)
    if (d < distance) {
      best = index
      distance = d
    }
  })
  return best
}

/** Error de una hora escrita: formato o fuera de `min`–`max`. Vacío no es error. */
export function timeError(text, { min, max } = {}, texts) {
  const messages = textsOr(texts)
  if (!String(text ?? '').trim()) return ''
  const minutes = parseTime(text)
  if (minutes == null) return messages.timeInvalid
  if (min && minutes < (parseTime(min) ?? 0)) return formatMessage(messages.timeMin, { min: normalizeTime(min) })
  if (max && minutes > (parseTime(max) ?? 1439)) return formatMessage(messages.timeMax, { max: normalizeTime(max) })
  return ''
}

// ---------- Teléfonos (PhoneInput). El valor es E.164: «+34612345678» ----------

// groups: cifras de cada bloque sin el 0 inicial. trunk: el 0 nacional se quita en E.164.
// example: un móvil de ejemplo, para el placeholder.
const PHONE_RULES = {
  ES: { dial: '34', groups: [3, 3, 3], trunk: false, valid: /^[6789]\d{8}$/, example: '612345678' },
  PT: { dial: '351', groups: [3, 3, 3], trunk: false, valid: /^[239]\d{8}$/, example: '912345678' },
  FR: { dial: '33', groups: [1, 2, 2, 2, 2], trunk: true, valid: /^[1-9]\d{8}$/, example: '612345678' },
  DE: { dial: '49', groups: [3, 4, 4], trunk: true, valid: /^[1-9]\d{5,10}$/, example: '15123456789' },
  IT: { dial: '39', groups: [3, 3, 4], trunk: false, valid: /^(3\d{8,9}|0\d{5,10})$/, example: '3123456789' },
  GB: { dial: '44', groups: [4, 6], trunk: true, valid: /^[1-9]\d{8,9}$/, example: '7400123456' },
}

const phoneRule = (country) => PHONE_RULES[String(country ?? '').toUpperCase()] ?? PHONE_RULES.ES

/** Países con prefijo, en el orden del selector, y un número de ejemplo ya formateado. */
export const PHONE_COUNTRIES = Object.entries(PHONE_RULES).map(([code, rule]) => ({
  code,
  dial: `+${rule.dial}`,
  example: formatPhone(rule.example, code),
}))

/** País de un número internacional («+351…» → «PT»), o null si no es de la lista. */
export function phoneCountryOf(text) {
  const digits = String(text ?? '')
    .trim()
    .replace(/^00/, '+')
  if (!digits.startsWith('+')) return null
  const plain = digits.replace(/\D/g, '')
  return Object.keys(PHONE_RULES).find((code) => plain.startsWith(PHONE_RULES[code].dial)) ?? null
}

/**
 * Texto escrito → país y cifras nacionales (con el 0 inicial si se escribió). Si empieza por
 * «+» o «00» y un prefijo conocido, el país sale del número.
 */
export function parsePhone(text, country = 'ES') {
  const raw = String(text ?? '').trim()
  const detected = phoneCountryOf(raw)
  const code = detected ?? (PHONE_RULES[String(country).toUpperCase()] ? String(country).toUpperCase() : 'ES')
  let digits = raw.replace(/\D/g, '')
  if (detected) digits = digits.replace(/^00/, '').slice(PHONE_RULES[detected].dial.length)
  return { country: code, digits }
}

const significantPhone = (digits, rule) => (rule.trunk ? digits.replace(/^0/, '') : digits)

/** «612345678» → «612 345 678». En Francia, «0612345678» → «06 12 34 56 78». */
export function formatPhone(text, country = 'ES') {
  const { country: code, digits } = parsePhone(text, country)
  const rule = phoneRule(code)
  const trunk = rule.trunk && digits.startsWith('0') ? '0' : ''
  let rest = digits.slice(trunk.length)
  const parts = []
  rule.groups.forEach((size, index) => {
    if (!rest) return
    const take = index === rule.groups.length - 1 ? rest.length : size
    parts.push(rest.slice(0, take))
    rest = rest.slice(take)
  })
  if (parts.length) parts[0] = trunk + parts[0]
  else if (trunk) parts.push(trunk)
  return parts.join(' ')
}

/** Número en E.164 («+34612345678»), o '' si no hay cifras. */
export function toE164(text, country = 'ES') {
  const { country: code, digits } = parsePhone(text, country)
  const rule = phoneRule(code)
  const national = significantPhone(digits, rule)
  return national ? `+${rule.dial}${national}` : ''
}

/** Cifras nacionales de un número E.164 de `country`, sin el prefijo. */
export function nationalNumber(e164, country = 'ES') {
  const { digits } = parsePhone(e164, country)
  return digits
}

/** Error de un teléfono: '' si es válido o está vacío. */
export function phoneError(text, country = 'ES', texts) {
  const messages = textsOr(texts)
  const { country: code, digits } = parsePhone(text, country)
  if (!digits) return ''
  const rule = phoneRule(code)
  const national = significantPhone(digits, rule)
  if (rule.valid.test(national)) return ''
  if (code === 'ES') return national.length !== 9 ? messages.phoneSpainLength : messages.phoneSpainStart
  return messages.phoneInvalid
}

export function isValidPhone(text, country = 'ES') {
  return Boolean(parsePhone(text, country).digits) && !phoneError(text, country)
}

// ---------- NIF: DNI, NIE y CIF ----------

const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE'
const CIF_LETTERS = 'JABCDEFGHI'

/** Mayúsculas, sin espacios, guiones, puntos ni barras. Quita el «ES» del NIF-IVA. */
export function normalizeNif(text) {
  const value = String(text ?? '')
    .toUpperCase()
    .replace(/[\s.\-/]/g, '')
  return /^ES[0-9A-Z]\d{7}[0-9A-Z]$/.test(value) ? value.slice(2) : value
}

/** 'dni', 'nie' o 'cif' según la forma (sin comprobar el control), o null. */
export function nifKind(text) {
  const value = normalizeNif(text)
  if (/^\d/.test(value)) return 'dni'
  if (/^[XYZ]/.test(value)) return 'nie'
  if (/^[ABCDEFGHJNPQRSUVW]/.test(value)) return 'cif'
  return null
}

function cifControl(digits) {
  let sum = 0
  for (let i = 0; i < 7; i++) {
    const n = Number(digits[i])
    if (i % 2 === 0) {
      const doubled = n * 2
      sum += Math.floor(doubled / 10) + (doubled % 10)
    } else sum += n
  }
  return (10 - (sum % 10)) % 10
}

/** Error concreto de un DNI, NIE o CIF: '' si es válido o está vacío. */
export function nifError(text, texts) {
  const messages = textsOr(texts)
  const value = normalizeNif(text)
  if (!value) return ''
  const kind = nifKind(value)
  if (kind === 'dni') {
    if (!/^\d{8}[A-Z]$/.test(value)) return messages.nifDniFormat
    return DNI_LETTERS[Number(value.slice(0, 8)) % 23] === value[8] ? '' : messages.nifDniLetter
  }
  if (kind === 'nie') {
    if (!/^[XYZ]\d{7}[A-Z]$/.test(value)) return messages.nifNieFormat
    const number = Number('XYZ'.indexOf(value[0]) + value.slice(1, 8))
    return DNI_LETTERS[number % 23] === value[8] ? '' : messages.nifNieLetter
  }
  if (kind === 'cif') {
    if (!/^[A-Z]\d{7}[0-9A-J]$/.test(value)) return messages.nifCifFormat
    const digit = cifControl(value.slice(1, 8)),
      control = value[8]
    // Llevan letra los de entidades sin ánimo de lucro, organismos públicos y no residentes;
    // número las sociedades anónimas y limitadas, las comunidades de bienes y las de propietarios.
    const letterOnly = 'NPQRSW'.includes(value[0]) || value.slice(1, 3) === '00'
    const digitOnly = 'ABEH'.includes(value[0])
    const ok = (!letterOnly && control === String(digit)) || (!digitOnly && control === CIF_LETTERS[digit])
    return ok ? '' : messages.nifCifControl
  }
  return messages.nifInvalid
}

export function isValidNif(text) {
  return Boolean(normalizeNif(text)) && !nifError(text)
}

// ---------- IBAN ----------

/** Longitud del IBAN de cada país (registro SWIFT). */
export const IBAN_LENGTHS = Object.fromEntries(
  'AD24 AE23 AL28 AT20 AZ28 BA20 BE16 BG22 BH22 BR29 BY28 CH21 CR22 CY28 CZ24 DE22 DK18 DO28 EE20 EG29 ES24 FI18 FO18 FR27 GB22 GE22 GI23 GL18 GR27 GT28 HR21 HU28 IE22 IL23 IQ23 IS26 IT27 JO30 KW30 KZ20 LB28 LC32 LI21 LT20 LU20 LV21 MC27 MD24 ME22 MK19 MR27 MT31 MU30 NL18 NO15 PK24 PL28 PS29 PT25 QA29 RO24 RS22 SA24 SC31 SE24 SI19 SK24 SM27 ST25 SV28 TL23 TN24 TR26 UA29 VA22 VG24 XK20'
    .split(' ')
    .map((entry) => [entry.slice(0, 2), Number(entry.slice(2))]),
)

/** Mayúsculas, solo letras y cifras: el valor que se guarda. */
export function normalizeIban(text) {
  return String(text ?? '')
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, '')
}

/** «es9121000418…» → «ES91 2100 0418 …», en bloques de cuatro. */
export function formatIban(text) {
  return normalizeIban(text).replace(/(.{4})(?=.)/g, '$1 ')
}

function ibanMod97(value) {
  const moved = value.slice(4) + value.slice(0, 4)
  let rest = 0
  for (const char of moved) {
    const n = char >= 'A' ? String(char.charCodeAt(0) - 55) : char
    for (const digit of n) rest = (rest * 10 + Number(digit)) % 97
  }
  return rest
}

/** Error de un IBAN: país, longitud o dígitos de control. '' si es válido o está vacío. */
export function ibanError(text, texts) {
  const messages = textsOr(texts)
  const value = normalizeIban(text)
  if (!value) return ''
  if (!/^[A-Z]{2}\d{2}/.test(value)) return messages.ibanCountry
  const country = value.slice(0, 2),
    length = IBAN_LENGTHS[country]
  if (length && value.length !== length) return formatMessage(messages.ibanLength, { country, length })
  if (!length && (value.length < 15 || value.length > 34)) return messages.ibanInvalid
  return ibanMod97(value) === 1 ? '' : messages.ibanChecksum
}

export function isValidIban(text) {
  return Boolean(normalizeIban(text)) && !ibanError(text)
}

// ---------- Superposiciones y acciones (0.3) ----------

/** «1 seleccionada», «3 seleccionadas»: el texto de ActionBar. */
export function selectedCount(count, texts) {
  const messages = textsOr(texts)
  return count === 1 ? messages.selectedCountOne : formatMessage(messages.selectedCountMany, { count })
}

/**
 * Posición de un menú flotante (ContextMenu) que no se sale de la ventana. Se abre hacia abajo
 * y a la derecha del punto; si no cabe, hacia el otro lado; nunca a menos de `margin` del borde.
 */
export function menuPosition(point, size, viewport, margin = 8) {
  const axis = (start, length, room) => {
    if (start + length <= room - margin) return Math.max(margin, start)
    if (start - length >= margin) return start - length
    return Math.max(margin, room - margin - length)
  }
  return { x: axis(point.x, size.width, viewport.width), y: axis(point.y, size.height, viewport.height) }
}

/** Valores de un ToggleGroup tras pulsar `value`. single: uno o ninguno; multiple: los que haya, en el orden de las opciones. */
export function toggleValues(current, value, type = 'single', order = []) {
  const on = current.includes(value)
  if (type !== 'multiple') return on ? [] : [value]
  const next = on ? current.filter((item) => item !== value) : [...current, value]
  return order.length ? order.filter((item) => next.includes(item)) : next
}

// ---------- Avisos (0.4) ----------

const TOAST_TONES = { success: 'success', warning: 'warning', error: 'danger', info: 'info' }

/**
 * Cola de avisos de toast(). @1k5-tech-es/grado-react y @1k5-tech-es/grado-vue crean una cada uno
 * y Toaster la pinta. Los avisos salen por orden de llegada: los que no caben esperan su turno, así
 * que nadie se pierde un aviso aunque lleguen varios a la vez.
 */
export function createToastStore() {
  let items = []
  let counter = 0
  const listeners = new Set()
  const set = (next) => {
    items = next
    listeners.forEach((listener) => listener())
  }
  // Con un id que ya existe, el aviso se actualiza en su sitio (lo usa toast.promise).
  const show = (title, options = {}) => {
    const id = options.id ?? `k5-toast-${++counter}`
    const item = {
      id,
      title: String(title),
      tone: options.tone ?? 'info',
      description: options.description,
      action: options.action,
      duration: options.duration ?? 5000,
    }
    set(items.some((old) => old.id === id) ? items.map((old) => (old.id === id ? item : old)) : [...items, item])
    return id
  }
  const toast = (title, options) => show(title, options)
  for (const [name, tone] of Object.entries(TOAST_TONES)) toast[name] = (title, options) => show(title, { ...options, tone })
  toast.dismiss = (id) => set(id == null ? [] : items.filter((item) => item.id !== id))
  toast.promise = (work, messages) => {
    const id = show(messages.loading, { tone: 'info', duration: 0 })
    const text = (message, value) => (typeof message === 'function' ? message(value) : message)
    const promise = Promise.resolve(typeof work === 'function' ? work() : work)
    promise.then(
      (value) => show(text(messages.success, value), { id, tone: 'success' }),
      (reason) => show(text(messages.error, reason), { id, tone: 'danger' }),
    )
    return promise
  }
  return {
    toast,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => items,
  }
}

/** Avisos visibles: los `max` primeros de la cola. */
export function visibleToasts(items, max = 3) {
  return items.slice(0, Math.max(1, Math.floor(max)))
}

// ---------- Formularios (0.4) ----------

/** ¿Vacío para un campo obligatorio? '', solo espacios, null, [], false (casilla sin marcar) o un periodo sin fechas. */
export function isEmptyValue(value) {
  if (value == null || value === false) return true
  if (typeof value === 'string') return !value.trim()
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object' && 'start' in value && 'end' in value) return !value.start && !value.end
  return false
}

/** Título de ErrorSummary: «Revisa 2 campos antes de continuar». */
export function errorSummaryTitle(count, texts) {
  const messages = textsOr(texts)
  return count === 1 ? messages.errorSummaryOne : formatMessage(messages.errorSummaryMany, { count })
}

/** id de un campo de formulario a partir de su nombre: «titular.nif» → «k5-form-1-titular-nif». */
export function fieldId(prefix, name) {
  return `${prefix}-${String(name).replace(/[^a-zA-Z0-9_-]+/g, '-')}`
}

/**
 * Valida un valor con las comprobaciones de FormField, en orden, y devuelve el primer error o ''.
 * Primero obligatorio, luego el error de formato del propio campo (NIF, IBAN, teléfono, hora) y
 * luego las comprobaciones propias, que devuelven true (vale), el texto del error o false (no vale,
 * con un texto genérico), como en react-hook-form. Pueden ser async.
 */
export async function checkValue(value, values, { required = false, formatError = '', checks = [], messages } = {}) {
  const texts = textsOr(messages)
  if (required && isEmptyValue(value)) return texts.fieldRequired
  if (formatError) return formatError
  for (const check of [checks].flat()) {
    if (!check) continue
    const result = await check(value, values)
    if (typeof result === 'string' && result) return result
    if (result === false) return texts.fieldInvalid
  }
  return ''
}

const FIELD_CONTROLS =
  'input:not([type=hidden]):not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), [tabindex]:not([tabindex="-1"])'

/**
 * Enfoca el control de un error de ErrorSummary. Si el id no es de un control (un RadioGroup o
 * un Calendar no lo usan), busca el campo por data-k5-field y enfoca su primer control.
 */
export function focusField(id, doc = document) {
  const target = doc.getElementById(id) ?? doc.querySelector(`[data-k5-field="${CSS.escape(id)}"]`)
  const control = target?.matches(FIELD_CONTROLS) ? target : target?.querySelector(FIELD_CONTROLS)
  if (!control) return false
  control.focus()
  control.scrollIntoView?.({ block: 'center' })
  return true
}

// ---------- Tablas con datos del servidor (0.4) ----------

/** Columnas que se ven: todas menos las ocultas. Las que no se pueden ocultar (hideable: false) siempre. */
export function visibleColumns(columns, hidden = []) {
  return columns.filter((column) => column.hideable === false || !hidden.includes(column.key))
}

/**
 * Filas a CSV para Excel en el idioma activo: en es-ES y de-DE, «;» entre columnas y coma decimal.
 * Usa csvValue de cada columna si la tiene; si no, el valor del campo. Las celdas de texto que
 * empiezan por = + - @ llevan un apóstrofo delante, para que Excel no las ejecute como fórmula.
 */
export function toCsv(rows, columns, { locale = DEFAULT_LOCALE, separator } = {}) {
  const decimal = numberFormat(locale, { useGrouping: false }).format(1.5).charAt(1)
  const sep = separator ?? (decimal === ',' ? ';' : ',')
  const cell = (value) => {
    let text
    if (value == null) text = ''
    else if (typeof value === 'number')
      text = Number.isFinite(value) ? numberFormat(locale, { useGrouping: false, maximumFractionDigits: 20 }).format(value) : ''
    else if (value instanceof Date) text = value.toISOString()
    else {
      text = String(value)
      if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
    }
    return /["\r\n]/.test(text) || text.includes(sep) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const lines = [columns.map((column) => cell(column.header))]
  for (const row of rows) lines.push(columns.map((column) => cell(column.csvValue ? column.csvValue(row) : row[column.key])))
  return `\uFEFF${lines.map((line) => line.join(sep)).join('\r\n')}\r\n`
}

/** Descarga un CSV hecho con toCsv(): downloadCsv('instalaciones.csv', csv). */
export function downloadCsv(filename, csv, doc = document) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = Object.assign(doc.createElement('a'), { href: url, download: filename })
  doc.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url))
}

// ---------- Gráficos interactivos (0.4) ----------

/** Dato bajo el puntero: cada dato ocupa una franja igual del ancho del gráfico. */
export function chartSlotAt(offset, width, count) {
  if (!count || !(width > 0)) return null
  return Math.min(count - 1, Math.max(0, Math.floor((offset / width) * count)))
}

/**
 * Dato al que lleva una tecla: flechas izquierda y derecha (sin dar la vuelta), Inicio y Fin.
 * La primera flecha entra por el principio (derecha) o por el final (izquierda). undefined si la tecla no es suya.
 */
export function chartKeyMove(key, current, count) {
  if (!count) return undefined
  const last = count - 1
  if (key === 'Home') return 0
  if (key === 'End') return last
  if (key === 'ArrowRight') return current == null ? 0 : Math.min(last, current + 1)
  if (key === 'ArrowLeft') return current == null ? last : Math.max(0, current - 1)
  return undefined
}

/**
 * Lado de la guía vertical en el que va la tarjeta del dato (x en % del ancho): a la derecha
 * en la mitad izquierda y a la izquierda en la otra, para no tapar los puntos ni salirse.
 */
export function tooltipAlign(x) {
  return x > 55 ? 'before' : 'after'
}

/** Posición horizontal (en %) del centro del dato i de count. */
export function slotCenter(index, count) {
  return round2(((index + 0.5) / Math.max(1, count)) * 100)
}

// ---------- Energía (0.4) ----------

/**
 * Festivos nacionales de fecha fija (MM-DD). Son los que cuentan en la 2.0TD: todo el día es
 * valle. Los festivos autonómicos o que cambian de fecha no cuentan.
 */
export const NATIONAL_HOLIDAYS = ['01-01', '01-06', '05-01', '08-15', '10-12', '11-01', '12-06', '12-08', '12-25']

/** ¿Día entero en valle? Sábados, domingos y festivos nacionales de fecha fija, más los que pases. */
export function isOffPeakDay(date, holidays = []) {
  if (!date) return false
  const day = weekday(date)
  return day === 0 || day === 6 || NATIONAL_HOLIDAYS.includes(date.slice(5, 10)) || holidays.includes(date)
}

/**
 * Periodo de la tarifa 2.0TD en la península para una hora (0–23) de un día laborable:
 * valle de 0 a 8, punta de 10 a 14 y de 18 a 22, llano el resto.
 */
export function tariffPeriod(hour, offPeak = false) {
  if (offPeak || hour < 8) return 'valle'
  if ((hour >= 10 && hour < 14) || (hour >= 18 && hour < 22)) return 'punta'
  return 'llano'
}

const clock = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/**
 * Franjas de un día de precios: 24 (horarios) o 96 (cuartohorarios, como el PVPC desde octubre
 * de 2025). Cada una con su hora de inicio y fin, su periodo 2.0TD y su precio.
 */
export function priceSlots(prices, { date, holidays = [], periods } = {}) {
  const count = prices.length
  const minutes = count ? Math.round(1440 / count) : 60
  const offPeak = isOffPeakDay(date, holidays)
  return prices.map((price, index) => {
    const start = index * minutes
    return {
      index,
      start: clock(start),
      end: clock(Math.min(1440, start + minutes)).replace('24:00', '00:00'),
      hour: Math.floor(start / 60),
      period: periods?.[index] ?? tariffPeriod(Math.floor(start / 60), offPeak),
      price: finite(price) ? price : null,
    }
  })
}

/** Franjas más barata y más cara (la primera, si se repiten). null sin precios. */
export function priceExtremes(slots) {
  const priced = slots.filter((slot) => slot.price != null)
  if (!priced.length) return { cheapest: null, dearest: null }
  return {
    cheapest: priced.reduce((best, slot) => (slot.price < best.price ? slot : best)),
    dearest: priced.reduce((best, slot) => (slot.price > best.price ? slot : best)),
  }
}

/** Franja de una hora «HH:MM», o -1 si no la hay. */
export function slotAt(slots, time) {
  const minutes = timeMinutes(time)
  if (minutes == null || !slots.length) return -1
  return Math.min(slots.length - 1, Math.floor(minutes / (1440 / slots.length)))
}
const timeMinutes = (time) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(time ?? ''))
  return match && +match[1] < 24 && +match[2] < 60 ? +match[1] * 60 + +match[2] : null
}

/** Estado de una batería por su potencia: positiva carga, negativa descarga; menos de 50 W, en reposo. */
export function batteryState(power) {
  if (finite(power) && power > 0.05) return 'charging'
  if (finite(power) && power < -0.05) return 'discharging'
  return 'idle'
}

/** Intensidad (0 a 1, dos decimales) de cada celda de un mapa de calor, entre min y max. */
export function heatLevels(rows, { min, max } = {}) {
  const values = rows.flat().filter(finite)
  const low = min ?? (values.length ? Math.min(...values) : 0)
  const high = max ?? (values.length ? Math.max(...values) : 1)
  const span = high - low
  return {
    min: low,
    max: high,
    levels: rows.map((row) =>
      row.map((value) => (finite(value) ? round2(span > 0 ? Math.min(1, Math.max(0, (value - low) / span)) : 0.5) : null)),
    ),
  }
}

/** Celda a la que lleva una tecla en un mapa de calor: flechas, Inicio y Fin (de la fila). */
export function gridKeyMove(key, current, rows, columns) {
  if (!rows || !columns) return undefined
  const [row, column] = current ?? [-1, -1]
  if (!current && ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(key)) return [0, 0]
  const clampTo = (n, size) => Math.min(size - 1, Math.max(0, n))
  if (key === 'ArrowRight') return [row, clampTo(column + 1, columns)]
  if (key === 'ArrowLeft') return [row, clampTo(column - 1, columns)]
  if (key === 'ArrowDown') return [clampTo(row + 1, rows), column]
  if (key === 'ArrowUp') return [clampTo(row - 1, rows), column]
  if (key === 'Home') return [row, 0]
  if (key === 'End') return [row, columns - 1]
  return undefined
}
