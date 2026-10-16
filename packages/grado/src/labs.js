// Labs: utilidades que las apps escribían cada una a su manera. Están fuera de la promesa de la
// 1.0: pueden cambiar en una versión menor hasta que pasen a patterns. Sin dependencias.
//   import { formatEuro, formatEnergy, formatRelative } from '@1k5-tech-es/grado/labs'

import { dateTimeFormat, numberFormat } from './intl.js'

const DEFAULT_LOCALE = 'es-ES'
// Espacio duro entre cifra y unidad: «6,4 kWp» no se parte al final de una línea.
const NBSP = ' '

const missing = (value) => value == null || Number.isNaN(Number(value))

// ---------- Importes ----------

/**
 * 1234.5 → «1234,50 €». decimals: 2 por defecto; 0 para euros enteros. grouping: 'always' pone
 * el punto de miles también en cifras de cuatro dígitos («1.234,50 €»); por defecto, la norma
 * del idioma (en español, a partir de cinco). signed: «+12,00 €» para variaciones.
 */
export function formatEuro(value, { locale = DEFAULT_LOCALE, decimals = 2, grouping, signed = false } = {}) {
  if (missing(value)) return ''
  return numberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    ...(grouping ? { useGrouping: grouping } : {}),
    ...(signed ? { signDisplay: 'exceptZero' } : {}),
  }).format(Number(value))
}

// ---------- Energía y potencia ----------

const ENERGY_STEPS = [
  [1e6, 'GWh'],
  [1e3, 'MWh'],
  [1, 'kWh'],
]
const POWER_STEPS = [
  [1e6, 'GW'],
  [1e3, 'MW'],
  [1, 'kW'],
]

function scaled(kilo, steps, { locale, decimals, unit, scale, signed, suffix = '' }) {
  if (missing(kilo)) return ''
  const value = Number(kilo)
  const [divisor, name] = unit
    ? (steps.find(([, n]) => n === unit) ?? [1, unit])
    : scale
      ? (steps.find(([d]) => Math.abs(value) >= d) ?? steps.at(-1))
      : steps.at(-1)
  const text = numberFormat(locale, {
    maximumFractionDigits: decimals,
    ...(signed ? { signDisplay: 'exceptZero' } : {}),
  }).format(value / divisor)
  return `${text}${NBSP}${name}${suffix}`
}

/**
 * Energía en kWh. 7.2 → «7,2 kWh»; con scale, 12500 → «12,5 MWh». unit fuerza una unidad
 * ('kWh', 'MWh' o 'GWh'). decimals: 1 por defecto.
 */
export function formatEnergy(kwh, { locale = DEFAULT_LOCALE, decimals = 1, unit, scale = false, signed = false } = {}) {
  return scaled(kwh, ENERGY_STEPS, { locale, decimals, unit, scale, signed })
}

/**
 * Potencia en kW. 4.6 → «4,6 kW»; peak, potencia pico de una instalación: «6,4 kWp».
 * Con scale, 1500 → «1,5 MW». unit fuerza 'kW', 'MW' o 'GW'.
 */
export function formatPower(kw, { locale = DEFAULT_LOCALE, decimals = 1, unit, scale = false, peak = false, signed = false } = {}) {
  return scaled(kw, POWER_STEPS, { locale, decimals, unit, scale, signed, suffix: peak ? 'p' : '' })
}

/** Unidades que entiende Amount y la función que les da formato. */
export const AMOUNT_UNITS = ['eur', 'kWh', 'kW', 'kWp', 'percent', 'number']

/** El texto de Amount: importe, energía, potencia, porcentaje o número. */
export function formatAmount(value, { unit = 'number', locale = DEFAULT_LOCALE, decimals, scale = false, signed = false } = {}) {
  if (missing(value)) return ''
  if (unit === 'eur') return formatEuro(value, { locale, decimals: decimals ?? 2, signed })
  if (unit === 'kWh') return formatEnergy(value, { locale, decimals: decimals ?? 1, scale, signed })
  if (unit === 'kW' || unit === 'kWp') return formatPower(value, { locale, decimals: decimals ?? 1, scale, signed, peak: unit === 'kWp' })
  if (unit === 'percent')
    return numberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: decimals ?? 0,
      ...(signed ? { signDisplay: 'exceptZero' } : {}),
    }).format(Number(value))
  return numberFormat(locale, {
    maximumFractionDigits: decimals ?? 2,
    ...(signed ? { signDisplay: 'exceptZero' } : {}),
  }).format(Number(value))
}

// ---------- Fechas relativas ----------

const UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]
const relativeFormats = new Map()
function relativeFormat(locale) {
  let format = relativeFormats.get(locale)
  if (!format) relativeFormats.set(locale, (format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })))
  return format
}

const toDate = (value) => (value instanceof Date ? value : new Date(value))

/**
 * «hace 5 minutos», «ayer», «dentro de 2 horas». Con menos de un minuto, «ahora». Pasada una
 * semana (o el límite de max, en segundos), la fecha: «16 oct» o «16 oct 2025» si es de otro año.
 */
export function formatRelative(value, { now = Date.now(), locale = DEFAULT_LOCALE, max = 7 * 24 * 3600 } = {}) {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return ''
  const seconds = Math.round((date.getTime() - toDate(now).getTime()) / 1000)
  const abs = Math.abs(seconds)
  if (abs > max) {
    const sameYear = date.getFullYear() === toDate(now).getFullYear()
    return dateTimeFormat(locale, { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) }).format(date)
  }
  if (abs < 60) return relativeFormat(locale).format(0, 'second')
  const [unit, size] = UNITS.find(([, length]) => abs >= length)
  return relativeFormat(locale).format(Math.round(seconds / size), unit)
}

/** Fecha y hora completas para el title de RelativeTime: «16 de octubre de 2026, 10:30». */
export function formatDateTime(value, { locale = DEFAULT_LOCALE } = {}) {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return ''
  return dateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(date)
}

/** Cada cuánto conviene volver a pintar una fecha relativa: cada minuto la primera hora, luego cada hora. */
export function relativeRefresh(value, now = Date.now()) {
  const age = Math.abs(toDate(now).getTime() - toDate(value).getTime()) / 1000
  return age < 3600 ? 60_000 : age < 24 * 3600 ? 3_600_000 : null
}

// ---------- Tema claro, oscuro o del sistema ----------

export const THEME_MODES = ['light', 'dark', 'system']
export const THEME_STORAGE_KEY = 'k5-mode'

/** Lo guardado, si es válido; si no, 'system'. Sin almacenamiento (modo privado), 'system'. */
export function readThemeMode(key = THEME_STORAGE_KEY) {
  try {
    const value = localStorage.getItem(key)
    return THEME_MODES.includes(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

export function saveThemeMode(mode, key = THEME_STORAGE_KEY) {
  try {
    if (mode === 'system') localStorage.removeItem(key)
    else localStorage.setItem(key, mode)
  } catch {
    // Sin almacenamiento la elección dura hasta recargar.
  }
}

/** 'light' o 'dark' para una elección y la preferencia del sistema. */
export const resolveThemeMode = (mode, prefersDark) => (mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode)

/** Pone o quita la clase dark en <html> (la que leen los tokens). */
export function applyThemeMode(mode, root = document.documentElement) {
  const prefersDark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
  root.classList.toggle('dark', resolveThemeMode(mode, prefersDark) === 'dark')
}

/**
 * Script para el <head>, antes del CSS: aplica el tema guardado antes de pintar, sin parpadeo.
 * <script>{themeScript()}</script> en React (dangerouslySetInnerHTML) o tal cual en el HTML.
 */
export function themeScript(key = THEME_STORAGE_KEY) {
  return `(function(){try{var m=localStorage.getItem(${JSON.stringify(key)});var d=m==='dark'||(m!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`
}

// ---------- Atajos de teclado ----------

const MODIFIERS = new Set(['mod', 'ctrl', 'meta', 'alt', 'shift'])
const KEY_NAMES = { esc: 'escape', space: ' ', plus: '+' }

/** «mod+k», «shift+?», «g» → { key, mod, ctrl, meta, alt, shift }. mod es ⌘ en Mac y Ctrl en el resto. */
export function parseHotkey(hotkey) {
  const parts = String(hotkey).toLowerCase().split('+')
  const key = parts.pop() || '+'
  const flags = Object.fromEntries([...MODIFIERS].map((name) => [name, parts.includes(name)]))
  const unknown = parts.filter((part) => !MODIFIERS.has(part))
  if (unknown.length) throw new Error(`Atajo no válido: «${hotkey}»`)
  return { key: KEY_NAMES[key] ?? key, ...flags }
}

/** ¿El evento de teclado es ese atajo? mod acepta Ctrl o ⌘. Shift solo cuenta si el atajo lo pide o la tecla es una letra. */
export function matchesHotkey(event, hotkey) {
  const want = typeof hotkey === 'string' ? parseHotkey(hotkey) : hotkey
  const key = String(event.key).toLowerCase()
  if (key !== want.key) return false
  const command = event.metaKey || event.ctrlKey
  if (want.mod ? !command : want.ctrl !== event.ctrlKey || want.meta !== event.metaKey) return false
  if (want.alt !== event.altKey) return false
  // «?» ya lleva Mayúsculas en el teclado: solo se exige igualdad para letras y números.
  if (/^[a-z0-9]$/.test(want.key) && want.shift !== event.shiftKey) return false
  return true
}

/** ¿El foco está en un sitio donde se escribe? Los atajos sin modificador no deben saltar ahí. */
export function isTypingTarget(target) {
  if (!target || typeof target !== 'object') return false
  const tag = String(target.tagName ?? '').toLowerCase()
  return (
    tag === 'textarea' ||
    tag === 'select' ||
    Boolean(target.isContentEditable) ||
    (tag === 'input' && !/^(checkbox|radio|button|submit|reset|range|color|file)$/.test(target.type ?? 'text'))
  )
}

/** Texto para Kbd: «mod+k» → «Ctrl K» o «⌘ K». */
export function hotkeyLabel(hotkey, { mac = false } = {}) {
  const want = parseHotkey(hotkey)
  const names = []
  if (want.mod) names.push(mac ? '⌘' : 'Ctrl')
  if (want.ctrl) names.push('Ctrl')
  if (want.meta) names.push('⌘')
  if (want.alt) names.push(mac ? '⌥' : 'Alt')
  if (want.shift) names.push(mac ? '⇧' : 'Mayús')
  names.push(want.key === ' ' ? 'Espacio' : want.key === 'escape' ? 'Esc' : want.key.length === 1 ? want.key.toUpperCase() : want.key)
  return names.join(' ')
}

// ---------- Comparador de tarifas (0.6) ----------

const PERIODS = ['punta', 'llano', 'valle']
const sumPeriods = (value) => (typeof value === 'number' ? value : PERIODS.reduce((total, p) => total + (Number(value?.[p]) || 0), 0))
const round2 = (value) => Math.round(value * 100) / 100

/**
 * Coste de una tarifa en euros con un consumo por periodos de la 2.0TD ({ punta, llano, valle }
 * en kWh) y la potencia contratada ({ punta, valle } en kW, o una cifra para las dos).
 * tariff.energy: €/kWh, un precio o uno por periodo. tariff.power: €/kW y día, uno o por periodo.
 * tariff.monthly: cuota fija al mes. Sin taxes, sin impuestos; con { electricityTax, vat } los
 * suma (el impuesto eléctrico sobre energía y potencia, el IVA sobre todo). Cambian con el tiempo:
 * pásalos tú.
 */
export function tariffCost(tariff, { consumption, power = 0, days = 365, taxes } = {}) {
  const energy =
    typeof tariff.energy === 'number'
      ? sumPeriods(consumption) * tariff.energy
      : PERIODS.reduce((total, p) => {
          const kwh = typeof consumption === 'number' ? Number.NaN : Number(consumption?.[p]) || 0
          return total + kwh * (Number(tariff.energy?.[p]) || 0)
        }, 0)
  if (Number.isNaN(energy)) throw new Error(`${tariff.name}: con precios por periodo, el consumo tiene que ir por periodos`)
  const kw = (period) => (typeof power === 'number' ? power : Number(power?.[period]) || 0)
  const powerCost =
    typeof tariff.power === 'number'
      ? kw('punta') * tariff.power * days
      : (kw('punta') * (Number(tariff.power?.punta) || 0) + kw('valle') * (Number(tariff.power?.valle) || 0)) * days
  const fixed = (Number(tariff.monthly) || 0) * (days / 365) * 12
  const electricityTax = taxes ? (energy + powerCost) * (taxes.electricityTax ?? 0) : 0
  const vat = taxes ? (energy + powerCost + electricityTax + fixed) * (taxes.vat ?? 0) : 0
  return {
    energy: round2(energy),
    power: round2(powerCost),
    fixed: round2(fixed),
    taxes: round2(electricityTax + vat),
    total: round2(energy + powerCost + fixed + electricityTax + vat),
  }
}

/**
 * Coste de varias tarifas con el mismo consumo, en el orden en que llegan: cuál es la más
 * barata, cuánto más cuesta cada una y su barra (ratio respecto a la más cara).
 */
export function compareTariffs(tariffs, options) {
  const rows = tariffs.map((tariff, index) => ({ id: tariff.id ?? String(index), name: tariff.name, cost: tariffCost(tariff, options) }))
  const totals = rows.map((row) => row.cost.total)
  const min = Math.min(...totals)
  const max = Math.max(...totals)
  const cheapest = rows.find((row) => row.cost.total === min)?.id ?? null
  return {
    cheapest,
    rows: rows.map((row) => ({
      ...row,
      cheapest: row.id === cheapest,
      delta: round2(row.cost.total - min),
      monthly: round2(row.cost.total / 12),
      ratio: max > 0 ? row.cost.total / max : 0,
    })),
  }
}

// ---------- Firma (0.6) ----------

export const SIGNATURE_SIZE = { width: 600, height: 200 }

/** ¿Hay firma? Trazos con algún punto o un nombre escrito. */
export function isSignatureEmpty(value) {
  if (!value) return true
  if (typeof value.typed === 'string') return value.typed.trim() === ''
  return !value.strokes?.some((stroke) => stroke.length > 0)
}

/** Punto del puntero dentro de la zona de firma, en unidades de la firma (600 × 200), con un decimal. */
export function signaturePoint(rect, clientX, clientY, size = SIGNATURE_SIZE) {
  const clamp = (value, max) => Math.round(Math.min(max, Math.max(0, value)) * 10) / 10
  return [
    clamp(((clientX - rect.left) / rect.width) * size.width, size.width),
    clamp(((clientY - rect.top) / rect.height) * size.height, size.height),
  ]
}

/** Trazo SVG suave para una lista de puntos: curvas por los puntos medios. Un solo punto es un punto. */
export function signaturePath(stroke) {
  if (!stroke?.length) return ''
  const [first] = stroke
  if (stroke.length === 1) return `M${first[0]} ${first[1]} l0.1 0`
  if (stroke.length === 2) return `M${first[0]} ${first[1]} L${stroke[1][0]} ${stroke[1][1]}`
  let d = `M${first[0]} ${first[1]}`
  for (let i = 1; i < stroke.length - 1; i++) {
    const [x, y] = stroke[i]
    const [nx, ny] = stroke[i + 1]
    d += ` Q${x} ${y} ${Math.round(((x + nx) / 2) * 10) / 10} ${Math.round(((y + ny) / 2) * 10) / 10}`
  }
  const last = stroke[stroke.length - 1]
  return `${d} L${last[0]} ${last[1]}`
}

const escapeXml = (text) =>
  String(text).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c])

/**
 * La firma como SVG independiente, para guardarla con la oferta o meterla en un PDF. La escrita
 * va en cursiva con la fuente que digas (por defecto, Inter con la del sistema de respaldo).
 */
export function signatureSvg(value, { size = SIGNATURE_SIZE, color = '#222222', font = 'Inter, system-ui, sans-serif' } = {}) {
  const { width, height } = size
  const body =
    typeof value?.typed === 'string'
      ? `<text x="24" y="${Math.round(height * 0.66)}" font-family="${escapeXml(font)}" font-style="italic" font-size="${Math.round(height * 0.28)}" fill="${escapeXml(color)}">${escapeXml(value.typed.trim())}</text>`
      : (value?.strokes ?? [])
          .filter((stroke) => stroke.length)
          .map((stroke) => `<path d="${signaturePath(stroke)}"/>`)
          .join('')
  const strokes =
    typeof value?.typed === 'string'
      ? ''
      : ` fill="none" stroke="${escapeXml(color)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><g${strokes}>${body}</g></svg>`
}

/** signatureSvg como data URL, para un <img> o para enviarlo al servidor. */
export const signatureDataUrl = (value, options) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(signatureSvg(value, options))}`

// ---------- Previsión de producción solar (0.6) ----------

/** Iconos del tiempo con el trazo de Lucide: sun, cloud-sun, cloud y cloud-rain. */
export const WEATHER_ICON_PATHS = {
  sun: [
    'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    'M12 2v2',
    'M12 20v2',
    'm4.93 4.93 1.41 1.41',
    'm17.66 17.66 1.41 1.41',
    'M2 12h2',
    'M20 12h2',
    'm6.34 17.66-1.41 1.41',
    'm19.07 4.93-1.41 1.41',
  ],
  partly: [
    'M12 2v2',
    'm4.93 4.93 1.41 1.41',
    'M20 12h2',
    'm19.07 4.93-1.41 1.41',
    'M15.947 12.65a4 4 0 0 0-5.925-4.128',
    'M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z',
  ],
  cloud: ['M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'],
  rain: ['M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242', 'M16 14v6', 'M8 14v6', 'M12 16v6'],
}
export const WEATHER_KINDS = Object.keys(WEATHER_ICON_PATHS)

const finiteNumber = (value) => typeof value === 'number' && Number.isFinite(value)

/**
 * Lo que dice el resumen de SolarForecast: previsto en el día, producido hasta la última hora con
 * dato, lo que se esperaba hasta entonces y la desviación. status: 'above' o 'below' si se
 * separa más de tolerance (5 %), si no 'on-track'; sin datos reales, null.
 */
export function forecastSummary({ forecast = [], actual = [], tolerance = 0.05 } = {}) {
  let done = 0
  actual.forEach((value, index) => {
    if (finiteNumber(value)) done = index + 1
  })
  const sum = (values) => values.reduce((total, value) => total + (finiteNumber(value) ? value : 0), 0)
  const forecastTotal = sum(forecast)
  const actualTotal = sum(actual.slice(0, done))
  const expectedSoFar = sum(forecast.slice(0, done))
  const deviation = done && expectedSoFar > 0 ? actualTotal / expectedSoFar - 1 : null
  const status = deviation == null ? null : deviation > tolerance ? 'above' : deviation < -tolerance ? 'below' : 'on-track'
  return { done, forecastTotal, actualTotal, expectedSoFar, deviation, status }
}

/** «13:00–14:00» para la franja i de un día partido en count franjas (24: horas). */
export function slotLabel(index, count = 24) {
  const minutes = (n) => Math.round((n * 24 * 60) / count)
  const clock = (total) => `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
  return `${clock(minutes(index))}–${clock(minutes(index + 1))}`
}

// ---------- Textos de labs (0.6) ----------
// Aparte de @1k5-tech-es/grado/messages: solo los descargan las apps que usan labs. Se cambian
// con los mismos messages de GradoProvider o del plugin Grado ({ tariffCheapest: '…' }).

export const LABS_MESSAGES = {
  'es-ES': {
    themeLabel: 'Tema',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    themeSystem: 'Sistema',
    tariffName: 'Tarifa',
    tariffAnnual: 'Al año',
    tariffMonthly: '{value} al mes',
    tariffCheapest: 'Más barata',
    tariffMore: '{value} más al año',
    tariffEnergy: 'Energía',
    tariffPower: 'Potencia',
    tariffTaxesIncluded: 'Con impuestos',
    tariffNoTaxes: 'Sin impuestos',
    signatureHint: 'Firma con el dedo o con el ratón.',
    signatureClear: 'Borrar',
    signatureTypeInstead: 'Escribir mi nombre',
    signatureDrawInstead: 'Dibujar la firma',
    signatureTypedLabel: 'Nombre y apellidos',
    signatureEmpty: 'Sin firmar',
    signatureDrawn: 'Firma dibujada',
    signatureTyped: 'Firma: {name}',
    forecastExpected: 'Previsto',
    forecastActual: 'Producido',
    forecastUntil: 'hasta las {time}',
    forecastAbove: '{value} por encima de lo previsto',
    forecastBelow: '{value} por debajo de lo previsto',
    forecastOnTrack: 'Según lo previsto',
    forecastWeather: 'Tiempo',
    forecastHour: 'Hora',
    weatherSun: 'Sol',
    weatherPartly: 'Nubes y claros',
    weatherCloud: 'Nublado',
    weatherRain: 'Lluvia',
  },
  'de-DE': {
    themeLabel: 'Design',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    themeSystem: 'System',
    tariffName: 'Tarif',
    tariffAnnual: 'Pro Jahr',
    tariffMonthly: '{value} pro Monat',
    tariffCheapest: 'Günstigster',
    tariffMore: '{value} mehr pro Jahr',
    tariffEnergy: 'Energie',
    tariffPower: 'Leistung',
    tariffTaxesIncluded: 'Mit Steuern',
    tariffNoTaxes: 'Ohne Steuern',
    signatureHint: 'Mit dem Finger oder der Maus unterschreiben.',
    signatureClear: 'Löschen',
    signatureTypeInstead: 'Namen eingeben',
    signatureDrawInstead: 'Unterschrift zeichnen',
    signatureTypedLabel: 'Vor- und Nachname',
    signatureEmpty: 'Nicht unterschrieben',
    signatureDrawn: 'Gezeichnete Unterschrift',
    signatureTyped: 'Unterschrift: {name}',
    forecastExpected: 'Prognose',
    forecastActual: 'Erzeugt',
    forecastUntil: 'bis {time} Uhr',
    forecastAbove: '{value} über der Prognose',
    forecastBelow: '{value} unter der Prognose',
    forecastOnTrack: 'Wie prognostiziert',
    forecastWeather: 'Wetter',
    forecastHour: 'Uhrzeit',
    weatherSun: 'Sonnig',
    weatherPartly: 'Teilweise bewölkt',
    weatherCloud: 'Bewölkt',
    weatherRain: 'Regen',
  },
  'en-GB': {
    themeLabel: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    tariffName: 'Tariff',
    tariffAnnual: 'Per year',
    tariffMonthly: '{value} a month',
    tariffCheapest: 'Cheapest',
    tariffMore: '{value} more a year',
    tariffEnergy: 'Energy',
    tariffPower: 'Power',
    tariffTaxesIncluded: 'Taxes included',
    tariffNoTaxes: 'Before taxes',
    signatureHint: 'Sign with your finger or the mouse.',
    signatureClear: 'Clear',
    signatureTypeInstead: 'Type my name',
    signatureDrawInstead: 'Draw the signature',
    signatureTypedLabel: 'Full name',
    signatureEmpty: 'Not signed',
    signatureDrawn: 'Drawn signature',
    signatureTyped: 'Signature: {name}',
    forecastExpected: 'Forecast',
    forecastActual: 'Produced',
    forecastUntil: 'until {time}',
    forecastAbove: '{value} above forecast',
    forecastBelow: '{value} below forecast',
    forecastOnTrack: 'On forecast',
    forecastWeather: 'Weather',
    forecastHour: 'Time',
    weatherSun: 'Sunny',
    weatherPartly: 'Partly cloudy',
    weatherCloud: 'Cloudy',
    weatherRain: 'Rain',
  },
}

/** Textos de labs para un idioma (o su lengua, o español), con los cambios de messages. */
export function labsMessagesFor(locale = DEFAULT_LOCALE, overrides) {
  const language = String(locale).split('-')[0]
  const match = LABS_MESSAGES[locale] ?? Object.entries(LABS_MESSAGES).find(([key]) => key.split('-')[0] === language)?.[1]
  const picked = Object.fromEntries(
    Object.keys(LABS_MESSAGES['es-ES'])
      .filter((key) => overrides && key in overrides)
      .map((key) => [key, overrides[key]]),
  )
  return { ...LABS_MESSAGES['es-ES'], ...match, ...picked }
}
