// Traduce props a clases de grado.css. Lo usan @1k5-tech-es/grado-react y @1k5-tech-es/grado-vue,
// y cualquier otra tecnología puede usarlo igual. Cambiar aquí cambia las dos.

import { numberFormat } from './intl.js'

export const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost', 'danger', 'destructive', 'link']
export const SIZES = ['sm', 'md', 'lg']
export const BADGE_TONES = ['neutral', 'brand', 'info', 'success', 'warning', 'danger', 'highlight']
export const CARD_VARIANTS = ['panel', 'alert', 'plain']

/** Une clases e ignora valores vacíos: cx('a', false, 'b') → 'a b'. */
export function cx(...parts) {
  return parts.flat(Infinity).filter(Boolean).join(' ')
}

const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback)

export function buttonClass({ variant = 'primary', size = 'md', iconOnly = false, block = false } = {}) {
  const v = pick(variant, BUTTON_VARIANTS, 'primary')
  const s = pick(size, SIZES, 'md')
  return cx('k5-btn', `k5-btn--${v}`, s !== 'md' && `k5-btn--${s}`, iconOnly && 'k5-btn--icon', block && 'k5-btn--block')
}

// Teclas de un atajo tal como se pintan → nombres de aria-keyshortcuts. Lo que no está en la
// tabla (letras, F1…) va tal cual, con las letras en mayúscula.
const KEY_NAMES = {
  '⌘': 'Meta',
  Cmd: 'Meta',
  Meta: 'Meta',
  Ctrl: 'Control',
  Control: 'Control',
  '⌥': 'Alt',
  Alt: 'Alt',
  Opción: 'Alt',
  '⇧': 'Shift',
  Shift: 'Shift',
  Mayús: 'Shift',
  '↵': 'Enter',
  Enter: 'Enter',
  Intro: 'Enter',
  Esc: 'Escape',
  Escape: 'Escape',
  '⌫': 'Backspace',
  '⌦': 'Delete',
  Supr: 'Delete',
  Tab: 'Tab',
  Espacio: 'Space',
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',
  '←': 'ArrowLeft',
  '→': 'ArrowRight',
}

/** Atajo para aria-keyshortcuts: ['⌘', 'K'] → 'Meta+K', ['⇧', 'v'] → 'Shift+V'. */
export function keyShortcuts(keys = []) {
  return keys.map((key) => KEY_NAMES[key] ?? (key.length === 1 ? key.toUpperCase() : key)).join('+')
}

export function badgeClass({ tone = 'neutral' } = {}) {
  return cx('k5-badge', `k5-badge--${pick(tone, BADGE_TONES, 'neutral')}`)
}

/** kind: 'input' | 'select' | 'textarea'. El tamaño no aplica a textarea. */
export function controlClass(kind = 'input', { size = 'md' } = {}) {
  const s = pick(size, SIZES, 'md')
  return cx(`k5-${kind}`, kind !== 'textarea' && s !== 'md' && `k5-input--${s}`)
}

export function inputWrapClass({ size = 'md' } = {}) {
  const s = pick(size, SIZES, 'md')
  return cx('k5-input-wrap', s !== 'md' && `k5-input-wrap--${s}`)
}

export function cardClass({ variant = 'panel' } = {}) {
  const v = pick(variant, CARD_VARIANTS, 'panel')
  return cx('k5-card', v !== 'panel' && `k5-card--${v}`)
}

export function tableClass({ compact = false } = {}) {
  return cx('k5-table', compact && 'k5-table--compact')
}

/** Contenedor de la tabla. plain: sin caja, para tablas que ya están dentro de un panel. */
export function tableWrapClass({ plain = false } = {}) {
  return cx('k5-table-wrap', plain && 'k5-table-wrap--plain')
}

export function spinnerClass({ size = 'md' } = {}) {
  const s = pick(size, SIZES, 'md')
  return cx('k5-spinner', s !== 'md' && `k5-spinner--${s}`)
}

export function emptyClass({ compact = false } = {}) {
  return cx('k5-empty', compact && 'k5-empty--compact')
}

export function kpiClass({ tone = 'default' } = {}) {
  return cx('k5-kpi', tone === 'danger' && 'k5-kpi--danger')
}

/**
 * Si una variación es buena, mala o neutra, como en KpiStrip de 1komma5es_help.
 * better: 'higher' (subir es mejor), 'lower' (bajar es mejor) o 'neutral'.
 */
export function kpiTrend(change, better = 'higher') {
  if (change == null || Number.isNaN(change)) return null
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat'
  let tone = 'flat'
  if (Math.abs(change) >= 0.5 && better !== 'neutral') tone = change > 0 === (better !== 'lower') ? 'good' : 'bad'
  return { tone, direction }
}

/** "5,9 %" en español. */
export function formatChange(change, locale = 'es-ES') {
  const n = numberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(change))
  return `${n} %`
}

/** Texto para lectores de pantalla delante de la variación. */
export const TREND_LABELS = { up: 'Sube', down: 'Baja', flat: 'Sin cambios' }

/** Iconos de flecha (trazos de Lucide) para no depender de ninguna librería de iconos. */
export const ARROW_PATHS = {
  up: ['m5 12 7-7 7 7', 'M12 19V5'],
  down: ['M12 5v14', 'm19 12-7 7-7-7'],
  flat: ['M5 12h14'],
}
export const ICON_ATTRS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2.4',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'aria-hidden': 'true',
}

// ---------- Armazón de aplicación ----------

export const SIDEBAR_ID = 'k5-app-sidebar'

export function appShellClass({ collapsed = false, navOpen = false, brandHeader = false } = {}) {
  return cx('k5-app', collapsed && 'k5-app--collapsed', navOpen && 'k5-app--nav-open', brandHeader && 'k5-app--brand-header')
}

export function avatarClass({ size = 'md' } = {}) {
  const s = pick(size, SIZES, 'md')
  return cx('k5-avatar', s !== 'md' && `k5-avatar--${s}`)
}

export const AVATAR_STATUSES = ['online', 'away', 'busy']

/** Iniciales para un avatar: «Lucía Fernández» → «LF», «marta» → «M». */
export function initials(name = '') {
  const words = String(name).trim().split(/\s+/).filter(Boolean)
  return (
    words
      .slice(0, 2)
      .map((w) => w[0].toLocaleUpperCase('es-ES'))
      .join('') || '?'
  )
}

/** Logo 1K5° (letras en currentColor, anillo en menta). Mismo SVG que logo-1k5.svg. */
export const LOGO = {
  viewBox: '76 190 384 132',
  letters: [
    'm374.83,247.98c-3.7-3.2-8.11-5.68-13.1-7.36-4.98-1.67-10.43-2.52-16.23-2.52-2.1,0-4.48.11-7.09.33-1.91.16-3.63.42-5.16.75-.16.04-.29-.09-.28-.25l1.02-22.2c0-.13.11-.23.24-.23h46.91c.27,0,.49-.22.49-.49v-18.91c0-.27-.22-.49-.49-.49h-66.29c-.26,0-.48.2-.49.46l-2.71,64.95c-.02.37.35.63.69.46,1.1-.56,3.4-1.63,6.26-2.59,2.23-.76,4.54-1.45,6.83-2.04,2.32-.59,4.71-1.05,7.13-1.38,5.89-.79,10.96-.61,16,.56,2.92.68,5.58,1.89,7.93,3.61,2.33,1.71,4.24,4,5.7,6.8,1.44,2.8,2.18,6.4,2.18,10.71,0,3.36-.55,6.41-1.65,9.07-1.08,2.64-2.57,4.88-4.44,6.63-1.87,1.76-4.07,3.13-6.56,4.06-2.51.94-5.22,1.41-8.03,1.41-5.01,0-9.41-1.35-13.04-3.99-3.54-2.58-6.23-5.89-8.05-11.14-.09-.26-.37-.4-.62-.31l-19.02,6.98c-.26.09-.39.39-.29.65,3.18,8.42,8.54,15.14,15.26,19.7,6.84,4.65,15.35,7.01,25.29,7.01,5.92,0,11.57-.96,16.82-2.86,5.26-1.9,9.93-4.69,13.85-8.28,3.93-3.59,7.09-8.06,9.38-13.27,2.31-5.22,3.47-11.2,3.47-17.8,0-6.05-1.06-11.48-3.14-16.15-2.09-4.68-5.04-8.68-8.76-11.89',
    'm118.92,221.67v93.61c0,.27.22.49.49.49h18.85c.27,0,.49-.22.49-.49v-118.18c0-.27-.22-.49-.49-.49h-19.19c-.1,0-.21.03-.29.1l-39.41,29.44c-.21.15-.26.45-.11.67l10.52,15.55c.16.23.48.28.7.12l28.06-21.01c.16-.12.39,0,.39.2',
    'm208.68,268.94l32.89,46.63c.09.13.23.21.39.21h44.63c.39,0,.62-.44.4-.76l-42.83-63.58c-.12-.17-.11-.4.01-.57l40.48-53.47c.25-.32.01-.78-.39-.78h-42.49c-.16,0-.3.07-.39.2l-32.7,43.15c-.14.19-.44.09-.44-.15v-42.71c0-.27-.22-.49-.49-.49h-38.92c-.27,0-.49.22-.49.49v118.18c0,.27.22.49.49.49h38.91c.27,0,.49-.22.49-.49v-46.2c0-.24.31-.33.44-.14',
  ],
  ring: 'm426.01,214.43c-5.35,0-9.7,4.35-9.7,9.7s4.35,9.7,9.7,9.7,9.7-4.35,9.7-9.7-4.35-9.7-9.7-9.7m0,39.3c-16.32,0-29.6-13.27-29.6-29.6s13.28-29.6,29.6-29.6,29.6,13.27,29.6,29.6-13.28,29.6-29.6,29.6',
}

/** Trazos de Lucide para los iconos que necesitan los componentes. */
export const ICON_PATHS = {
  search: ['M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0', 'm21 21-4.3-4.3'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  chevronRight: ['m9 18 6-6-6-6'],
  chevronLeft: ['m15 18-6-6 6-6'],
  chevronDown: ['m6 9 6 6 6-6'],
  chevronsUpDown: ['m7 15 5 5 5-5', 'm7 9 5-5 5 5'],
  arrowUp: ['m5 12 7-7 7 7', 'M12 19V5'],
  arrowDown: ['M12 5v14', 'm19 12-7 7-7-7'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  check: ['M20 6 9 17l-5-5'],
  info: ['M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0', 'M12 16v-4', 'M12 8h.01'],
  circleCheck: ['M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0', 'm9 12 2 2 4-4'],
  circleAlert: ['M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0', 'M12 8v4', 'M12 16h.01'],
  triangleAlert: ['m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3', 'M12 9v4', 'M12 17h.01'],
  upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm17 8-5-5-5 5', 'M12 3v12'],
  file: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4'],
  minus: ['M5 12h14'],
  plus: ['M5 12h14', 'M12 5v14'],
}

/** Icono de cada tono de aviso (Alert, Toast). */
export const STATUS_ICONS = { info: 'info', success: 'circleCheck', warning: 'triangleAlert', danger: 'circleAlert' }

/** Texto para lectores de pantalla del punto de estado del avatar. */
export const AVATAR_STATUS_LABELS = { online: 'Disponible', away: 'Ausente', busy: 'Ocupado' }

// ---------- Datos y piezas (0.3) ----------
export const STATUS_TONES = ['neutral', 'brand', 'info', 'success', 'warning', 'danger']
export const PROGRESS_TONES = ['brand', 'success', 'warning', 'danger']
export const DESCRIPTION_LAYOUTS = ['columns', 'stacked']
export const LINK_TONES = ['default', 'muted']
export const LINK_UNDERLINES = ['hover', 'always']
const SMALL_SIZES = ['sm', 'md']

/**
 * Pasos de un flujo con orden (ticket, instalación). La forma del icono se lee sin color:
 * discontinuo, vacío, medio, tres cuartos, lleno con check y lleno con aspa. Cada paso trae su
 * tono por defecto.
 */
export const STATUS_PROGRESS = {
  backlog: 'neutral',
  todo: 'neutral',
  started: 'warning',
  waiting: 'info',
  done: 'success',
  canceled: 'neutral',
}

/**
 * Estado de una fila: punto de color y texto. pulse: el punto late (estados «en vivo»).
 * progress: el punto pasa a icono de progreso; sin tone, usa el del paso.
 */
export function statusClass({ tone, pulse = false, progress } = {}) {
  const step = Object.hasOwn(STATUS_PROGRESS, progress) ? progress : null
  const t = pick(tone ?? (step ? STATUS_PROGRESS[step] : 'neutral'), STATUS_TONES, 'neutral')
  return cx('k5-status', `k5-status--${t}`, pulse && 'k5-status--pulse', step && `k5-status--progress k5-status--${step}`)
}

/** Barra de progreso. steps: variante por pasos; indeterminate: sin valor conocido. */
export function progressClass({ tone = 'brand', size = 'md', indeterminate = false, steps = false } = {}) {
  const s = pick(size, SMALL_SIZES, 'md')
  return cx(
    'k5-progress',
    `k5-progress--${pick(tone, PROGRESS_TONES, 'brand')}`,
    s !== 'md' && `k5-progress--${s}`,
    indeterminate && 'k5-progress--indeterminate',
    steps && 'k5-progress--steps',
  )
}

export function descriptionListClass({ layout = 'columns' } = {}) {
  return cx('k5-dl', pick(layout, DESCRIPTION_LAYOUTS, 'columns') === 'stacked' && 'k5-dl--stacked')
}

/** Botón de copiar: un botón ghost (sm por defecto) con su marca de copiado. */
export function copyButtonClass({ size = 'sm', iconOnly = false, copied = false } = {}) {
  return cx(buttonClass({ variant: 'ghost', size, iconOnly }), 'k5-copy__button', copied && 'k5-copy__button--copied')
}

export function tagClass({ size = 'md', disabled = false } = {}) {
  const s = pick(size, SMALL_SIZES, 'md')
  return cx('k5-tag', s !== 'md' && `k5-tag--${s}`, disabled && 'k5-tag--disabled')
}

export function avatarGroupClass({ size = 'md' } = {}) {
  const s = pick(size, SIZES, 'md')
  return cx('k5-avatar-group', s !== 'md' && `k5-avatar-group--${s}`)
}

export function separatorClass({ orientation = 'horizontal', label = false } = {}) {
  return cx('k5-separator', orientation === 'vertical' && 'k5-separator--vertical', label && 'k5-separator--label')
}

export function linkClass({ tone = 'default', underline = 'hover' } = {}) {
  return cx(
    'k5-link',
    pick(tone, LINK_TONES, 'default') === 'muted' && 'k5-link--muted',
    pick(underline, LINK_UNDERLINES, 'hover') === 'always' && 'k5-link--underline',
  )
}

/** Iconos de Lucide de CopyButton y Link: copy y external-link. */
export const DATA_ICON_PATHS = {
  copy: [
    'M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2',
    'M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2',
  ],
  externalLink: ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'],
}

// ---------- Gráficos (0.3) ----------
export const SPARKLINE_TONES = ['brand', 'success', 'danger', 'neutral']
export const METER_VARIANTS = ['bar', 'segments']
export const METER_LEVELS = ['good', 'fair', 'poor', 'neutral']
/** Dónde va cada nodo del flujo de energía alrededor del inversor. */
export const ENERGY_POSITIONS = { solar: 'top', home: 'right', battery: 'bottom', grid: 'left' }

/** Sparkline: el tono colorea la línea, el relleno y el punto final. */
export function sparklineClass({ tone = 'brand' } = {}) {
  return cx('k5-sparkline', `k5-sparkline--${pick(tone, SPARKLINE_TONES, 'brand')}`)
}

/** Tono de la sparkline de un Kpi: el mismo que su variación (buena, mala o neutra). */
export function kpiSparklineTone(trend) {
  return trend?.tone === 'good' ? 'success' : trend?.tone === 'bad' ? 'danger' : 'neutral'
}

export function donutClass({ size = 'md' } = {}) {
  const s = pick(size, SIZES, 'md')
  return cx('k5-donut', s !== 'md' && `k5-donut--${s}`)
}

/** Medidor: barra continua o segmentos tipo batería; level sale de meterLevel() en patterns. */
export function meterClass({ variant = 'bar', level = 'neutral' } = {}) {
  return cx(
    'k5-meter',
    pick(variant, METER_VARIANTS, 'bar') === 'segments' && 'k5-meter--segments',
    `k5-meter--${pick(level, METER_LEVELS, 'neutral')}`,
  )
}

const ENERGY_ARROWS = {
  top: { in: 'down', out: 'up' },
  bottom: { in: 'up', out: 'down' },
  left: { in: 'right', out: 'left' },
  right: { in: 'left', out: 'right' },
}
/** Línea entre un nodo y el inversor. flow: 'in' (hacia el inversor), 'out' o 'none' (apagada). */
export function energyLineClass(node, flow = 'none') {
  const position = ENERGY_POSITIONS[node] ?? 'top'
  const arrow = ENERGY_ARROWS[position][flow]
  return cx('k5-energy__line', `k5-energy__line--${node}`, arrow ? `k5-energy__line--${arrow}` : 'k5-energy__line--off')
}

export function energyNodeClass(node, flow = 'none') {
  return cx('k5-energy__node', `k5-energy__node--${node}`, flow === 'none' && 'k5-energy__node--idle')
}

/** Iconos de los nodos (trazos de Lucide: sun, house, battery, utility-pole y zap). */
export const ENERGY_ICONS = {
  solar: [
    'M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0',
    'M12 2v2',
    'M12 20v2',
    'm4.93 4.93 1.41 1.41',
    'm17.66 17.66 1.41 1.41',
    'M2 12h2',
    'M20 12h2',
    'm6.34 17.66-1.41 1.41',
    'm19.07 4.93-1.41 1.41',
  ],
  home: [
    'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8',
    'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  ],
  battery: ['M22 14v-4', 'M4 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z', 'M6 10v4', 'M10 10v4'],
  grid: ['M12 2v20', 'M2 5h20', 'M3 3v2', 'M7 3v2', 'M17 3v2', 'M21 3v2', 'm19 5-7 7-7-7'],
  hub: [
    'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z',
  ],
  arrow: ['m9 18 6-6-6-6'],
}

// ---------- Iconos de energía (0.4) ----------
/**
 * Iconos de una instalación, con el trazo de Lucide (24 × 24, línea de 2, puntas redondas).
 * solar, home, battery y grid son los de EnergyFlow; el resto son propios de Grado.
 */
export const ENERGY_ICON_PATHS = {
  solarPanel: ['M5 3h14l2 11H3z', 'M12 3v11', 'M4 8.5h16', 'M12 14v7', 'M8 21h8'],
  homeBattery: ENERGY_ICONS.battery,
  powerGrid: ENERGY_ICONS.grid,
  heatPump: [
    'M5 4h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'M6 11.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0',
    'M9.5 11.5c-.5-2 .5-3.5 2.3-2.9',
    'M9.5 11.5c2 .6 2.8 2.2 1.4 3.4',
    'M9.5 11.5c-1.5 1.4-3.3 1.3-3.7-.5',
    'M16 9h2',
    'M16 12h2',
    'M16 15h2',
    'M7 19v2',
    'M17 19v2',
  ],
  wallbox: [
    'M6 2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z',
    'm10.5 6-2.5 4h3l-2.5 4',
    'M15 14h2a2 2 0 0 1 2 2v1a2 2 0 0 0 4 0V9',
    'M21 9V6',
    'M19 9h4',
  ],
  electricMeter: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M7 7h10v5H7z', 'm12.5 14-1.5 2.5h2L11.5 19'],
  inverter: [
    'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
    'M3 21 21 3',
    'M6 8h5',
    'M6 10.5h5',
    'M13 16c1-2 2-2 3 0s2 2 3 0',
  ],
}

/** Clase del BatteryLevel según la carga: low (hasta 10 %), medium (hasta 25 %) o high. */
export function batteryClass({ level = 0, size = 'md' } = {}) {
  const tone = level <= 10 ? 'low' : level <= 25 ? 'medium' : 'high'
  return cx('k5-battery', `k5-battery--${tone}`, size === 'sm' && 'k5-battery--sm')
}

// ---------- Campos especiales (0.3) ----------
/** Iconos de los campos especiales (SearchInput, PasswordInput, TimePicker, AddressInput). Trazos de Lucide. */
export const FIELD_ICON_PATHS = {
  eye: [
    'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0',
    'M9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
  ],
  eyeOff: [
    'M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49',
    'M14.084 14.158a3 3 0 0 1-4.242-4.242',
    'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143',
    'm2 2 20 20',
  ],
  clock: ['M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0', 'M12 6v6l4 2'],
  mapPin: [
    'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0',
    'M9 10a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
  ],
}

// ---------- Superposiciones y acciones (0.3) ----------

export const BANNER_TONES = ['info', 'success', 'warning', 'danger', 'brand']
export const ICON_BUTTON_VARIANTS = ['ghost', 'secondary', 'primary']
export const POPOVER_ALIGNS = ['start', 'center', 'end']

/** Aviso de toda la aplicación, de borde a borde. */
export function bannerClass({ tone = 'info' } = {}) {
  return cx('k5-banner', `k5-banner--${pick(tone, BANNER_TONES, 'info')}`)
}

/** Botón de solo icono: un Button cuadrado. pressed añade el estado de botón conmutador. */
export function iconButtonClass({ variant = 'ghost', size = 'md' } = {}) {
  return buttonClass({ variant: pick(variant, ICON_BUTTON_VARIANTS, 'ghost'), size, iconOnly: true })
}

/** Panel del Popover. align: borde del disparador con el que se alinea; side: arriba o abajo. */
export function popoverClass({ align = 'start', side = 'bottom' } = {}) {
  return cx(
    'k5-popover__content',
    `k5-popover__content--${pick(align, POPOVER_ALIGNS, 'start')}`,
    side === 'top' && 'k5-popover__content--top',
  )
}

/** Barra de acciones en lote. inline: en su sitio, sin flotar (documentación y ejemplos). */
export function actionBarClass({ inline = false } = {}) {
  return cx('k5-action-bar', inline && 'k5-action-bar--inline')
}

export function toggleGroupClass({ size = 'md', iconOnly = false } = {}) {
  const s = pick(size, SIZES, 'md')
  return cx('k5-toggle-group', s !== 'md' && `k5-toggle-group--${s}`, iconOnly && 'k5-toggle-group--icon')
}

// ---------- Maquetación y tipografía (0.3) ----------
/** Claves de la escala de espacio (tokens.space). k5-gap-<clave> pone ese hueco: k5-gap-1-5 = --k5-space-1-5. */
export const SPACE_STEPS = ['0-5', '1', '1-5', '2', '2-5', '3', '3-5', '4', '5', '6', '8', '10', '12', '16']
export const STACK_DIRECTIONS = ['column', 'row']
export const STACK_ALIGNS = ['start', 'center', 'end', 'stretch', 'baseline']
export const STACK_JUSTIFIES = ['start', 'center', 'end', 'between']
export const GRID_COLUMNS = [1, 2, 3, 4, 5, 6, 'auto']
export const GRID_MIN_WIDTHS = ['sm', 'md', 'lg']
export const CONTAINER_SIZES = ['sm', 'md', 'lg']
export const TEXT_SIZES = ['caption', 'small', 'body', 'lead']
export const TEXT_TONES = ['default', 'muted', 'primary', 'success', 'warning', 'danger', 'info']
export const TEXT_WEIGHTS = ['regular', 'medium', 'semibold']
export const HEADING_LEVELS = [1, 2, 3, 4, 5, 6]
export const HEADING_SIZES = ['lead', 'heading', 'title', 'display']

/** Hueco de la escala de espacio. Admite '1-5' y también 1.5 o '1.5'. Por defecto, 4 (16 px). */
export function gapClass(gap = '4') {
  return `k5-gap-${pick(String(gap ?? '4').replace('.', '-'), SPACE_STEPS, '4')}`
}

/** Stack: hijos en columna (por defecto) o en fila, con un hueco de la escala de espacio. */
export function stackClass({ direction = 'column', gap = '4', align, justify, wrap = false } = {}) {
  return cx(
    'k5-stack',
    pick(direction, STACK_DIRECTIONS, 'column') === 'row' && 'k5-stack--row',
    wrap && 'k5-stack--wrap',
    gapClass(gap),
    STACK_ALIGNS.includes(align) && `k5-align-${align}`,
    STACK_JUSTIFIES.includes(justify) && `k5-justify-${justify}`,
  )
}

/** Grid: columns 1–6 (una sola por debajo de 600 px) o 'auto', que mete tantas como quepan de minItemWidth. */
export function gridClass({ columns = 'auto', gap = '4', minItemWidth = 'md' } = {}) {
  const n = columns === 'auto' ? 'auto' : Number(columns)
  const c = GRID_COLUMNS.includes(n) ? n : 'auto'
  const min = pick(minItemWidth, GRID_MIN_WIDTHS, 'md')
  return cx(
    'k5-grid',
    c === 'auto' ? 'k5-grid--auto' : `k5-grid--cols-${c}`,
    c === 'auto' && min !== 'md' && `k5-grid--min-${min}`,
    gapClass(gap),
  )
}

/** Container: ancho máximo centrado. padded (por defecto) deja margen lateral; sin él, k5-container--flush. */
export function containerClass({ size = 'lg', padded = true } = {}) {
  const s = pick(size, CONTAINER_SIZES, 'lg')
  return cx('k5-container', s !== 'lg' && `k5-container--${s}`, !padded && 'k5-container--flush')
}

/** Text: tamaño body, peso regular y el color del contexto salvo que se pida otra cosa. */
export function textClass({ size = 'body', tone = 'default', weight = 'regular', truncate = false, numeric = false } = {}) {
  const s = pick(size, TEXT_SIZES, 'body')
  const t = pick(tone, TEXT_TONES, 'default')
  const w = pick(weight, TEXT_WEIGHTS, 'regular')
  return cx(
    'k5-text',
    s !== 'body' && `k5-text--${s}`,
    t !== 'default' && `k5-text--${t}`,
    w !== 'regular' && `k5-text--${w}`,
    truncate && 'k5-text--truncate',
    numeric && 'k5-text--numeric',
  )
}

/** Nivel de encabezado entre 1 y 6. Admite '2' (atributo en Vue). Si no es válido, 2. */
export function headingLevel(level) {
  const n = Number(level)
  return HEADING_LEVELS.includes(n) ? n : 2
}

/** Tamaño por defecto de cada nivel: 1 → title, 2 → heading, 3 a 6 → lead. */
export function headingSize(level) {
  const n = headingLevel(level)
  return n === 1 ? 'title' : n === 2 ? 'heading' : 'lead'
}

export function headingClass({ level = 2, size } = {}) {
  return cx('k5-heading', `k5-heading--${pick(size, HEADING_SIZES, headingSize(level))}`)
}
