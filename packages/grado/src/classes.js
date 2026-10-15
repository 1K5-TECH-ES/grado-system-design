// Traduce props a clases de grado.css. Lo usan @1k5/grado-react y @1k5/grado-vue,
// y cualquier otra tecnología puede usarlo igual. Cambiar aquí cambia las dos.

export const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost', 'danger', 'link']
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
  const n = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Math.abs(change))
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

export function appShellClass({ collapsed = false, navOpen = false } = {}) {
  return cx('k5-app', collapsed && 'k5-app--collapsed', navOpen && 'k5-app--nav-open')
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
