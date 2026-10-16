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
