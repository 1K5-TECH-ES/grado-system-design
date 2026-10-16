// Lógica del configurador de temas: del color principal a las paletas que combinan con él,
// los tokens de Grado para cada una, el CSS del tema y el código para compartirlo.
// Sin DOM: lo usan la web (React) y los tests.
import { contrast, hslToRgb, mix, parseColor, rgbToHsl, tint, toHex, toHslTriplet } from '../packages/grado/scripts/lib/color.mjs'

/** Berenjena, menta y fucsia de la guía de marca: principal, acento y destacado. */
export const BRAND = { primary: '#5C068C', accent: '#2ED8C3', highlight: '#FA65EC' }
export const GRAPHITE = '#222222'
export const WHITE = '#FFFFFF'

export const PRESETS = [
  { name: 'Berenjena', hex: '#5C068C' },
  { name: 'Océano', hex: '#1D4ED8' },
  { name: 'Bosque', hex: '#0F6B4F' },
  { name: 'Teja', hex: '#B9400E' },
  { name: 'Grafito', hex: '#222222' },
]

/** Cómo se aplica la paleta. La letra va en el código de tema. */
export const VARIANTS = [
  { id: 'F', name: 'Fiel', description: 'Los colores de la paleta tal cual. Grises con un toque del principal.' },
  { id: 'S', name: 'Suave', description: 'Más luz y menos saturación. Pensada para lo que ve el cliente.' },
  { id: 'C', name: 'Alto contraste', description: 'Oscurece lo justo para llegar a AAA con el texto del botón.' },
]

/**
 * Armonías del círculo cromático: cuántos grados se gira el tono del principal para el acento
 * y para el destacado. La complementaria solo tiene un opuesto: el destacado es un vecino vivo
 * del principal, como el fucsia de la berenjena en la guía de marca.
 */
const HARMONIES = [
  { id: 'complementaria', name: 'Complementaria', description: 'El tono opuesto. Es la que más destaca.', turn: [180, 25] },
  { id: 'dividida', name: 'Complementaria dividida', description: 'Los dos vecinos del opuesto. Contrasta sin chocar.', turn: [150, 210] },
  { id: 'triada', name: 'Tríada', description: 'Tres tonos repartidos por el círculo. Viva y equilibrada.', turn: [120, 240] },
  { id: 'analoga', name: 'Análoga', description: 'Tonos vecinos del principal. Tranquila y coherente.', turn: [40, -40] },
  { id: 'monocromatica', name: 'Monocromática', description: 'Solo el tono del principal, con otras luces. La más sobria.', turn: null },
]
/** Un principal casi gris no tiene tono que girar: parejas de tonos fijos. */
const NEUTRAL_PAIRS = [
  { id: 'cielo', name: 'Cielo y ámbar', description: 'Fresca y luminosa.', hues: [235, 75] },
  { id: 'coral', name: 'Coral y turquesa', description: 'Cálida, con un contrapunto frío.', hues: [30, 195] },
  { id: 'lima', name: 'Lima y violeta', description: 'Enérgica. Buena para datos y gráficos.', hues: [130, 300] },
  { id: 'indigo', name: 'Índigo y rosa', description: 'Moderna, con aire digital.', hues: [275, 350] },
]
const MARCA = {
  id: 'marca',
  name: 'Marca',
  description: 'Menta y fucsia, los de la guía de marca.',
  accent: BRAND.accent,
  highlight: BRAND.highlight,
}

export const RADII = { r4: '0.25rem', r8: '0.5rem', r12: '0.75rem' }

/**
 * Fuentes del configurador, todas en Google Fonts y en Fontsource con los pesos 400 a 700.
 * Inter es la de tokens.json y viene en el propio paquete (@1k5-tech-es/grado/fonts.css).
 * «Sistema» no descarga nada.
 */
const FALLBACK = 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
export const FONT_WEIGHTS = [400, 500, 600, 700]
export const FONTS = [
  { id: 'inter', name: 'Inter', note: 'La de Grado. Neutra y muy legible en pantalla.' },
  { id: 'barlow', name: 'Barlow', note: 'La de la guía de marca. Algo estrecha, de aire técnico.' },
  { id: 'roboto', name: 'Roboto', note: 'La de Android. Familiar para casi todos.' },
  { id: 'opensans', name: 'Open Sans', note: 'Abierta y amable. Lee bien en textos largos.' },
  { id: 'sourcesans', name: 'Source Sans 3', note: 'Clara y compacta, pensada para interfaces.' },
  { id: 'plex', name: 'IBM Plex Sans', note: 'Técnica, con carácter de ingeniería.' },
  { id: 'dmsans', name: 'DM Sans', note: 'Geométrica y limpia, con poco contraste.' },
  { id: 'manrope', name: 'Manrope', note: 'Moderna, con cifras muy claras.' },
  { id: 'jakarta', name: 'Plus Jakarta Sans', note: 'Geométrica y cercana. Buena para producto.' },
  { id: 'montserrat', name: 'Montserrat', note: 'Ancha y geométrica. Luce más en títulos que en tablas.' },
  { id: 'poppins', name: 'Poppins', note: 'Redonda y geométrica. Ocupa más espacio.' },
  { id: 'sistema', name: 'Sistema', note: 'La del sistema operativo. No descarga nada.', system: true },
].map((font) => {
  if (font.system) return { ...font, stack: FALLBACK }
  const family = /^[a-z-]+$/i.test(font.name) ? font.name : `"${font.name}"`
  const bundled = font.id === 'inter'
  return {
    ...font,
    stack: `${family}, ${FALLBACK}`,
    // Inter no necesita paquete aparte: la trae @1k5-tech-es/grado.
    ...(bundled ? { bundled: true } : { package: `@fontsource/${font.name.toLowerCase().replaceAll(' ', '-')}` }),
    // Hoja de estilos de Google Fonts: la web la usa para las muestras y las páginas HTML sin bundler.
    href: `https://fonts.googleapis.com/css2?family=${font.name.replaceAll(' ', '+')}:wght@${FONT_WEIGHTS.join(';')}&display=swap`,
  }
})
export const fontById = (id) => FONTS.find((font) => font.id === id) ?? FONTS[0]

export const DEFAULTS = {
  primary: BRAND.primary,
  accent: BRAND.accent,
  variant: 'F',
  base: 'consola',
  radius: 'r8',
  font: 'inter',
  density: 'default',
  dark: true,
}

/** Las tres bases de Grado. «campo» pide 7 : 1 en todo el texto y va en su propio archivo. */
export const BASES = [
  { id: 'consola', name: 'Consola', description: 'Cabecera de color. Herramientas internas.', min: 4.5 },
  { id: 'marca', name: 'Marca', description: 'Barra lateral de color. Lo que ve el cliente.', min: 4.5 },
  { id: 'campo', name: 'Campo', description: 'Alto contraste y controles de 44 px. Técnicos al sol.', min: 7 },
]
export const baseById = (id) => BASES.find((base) => base.id === id) ?? BASES[0]

/** Densidad de los controles: data-k5-density en <html>. «Normal» no escribe nada. */
export const DENSITIES = [
  { id: 'default', name: 'Normal', description: 'La altura de cada base. En pantallas táctiles, 44 px.' },
  { id: 'compact', name: 'Compacta', description: 'Controles más bajos para tablas y paneles con muchos datos.' },
  { id: 'comfortable', name: 'Cómoda', description: '44 px siempre, también con ratón. Para tablet y manos con guantes.' },
]
const DENSITY_FLAGS = { compact: 'COMPACT', comfortable: 'COMFORT' }

/** "#5c068c", "5C068C" o " #5C068C " → "#5C068C"; cualquier otra cosa → null. */
export function normalizeHex(input) {
  const value = String(input ?? '')
    .trim()
    .replace(/^#/, '')
  return /^[0-9a-f]{6}$/i.test(value) ? `#${value.toUpperCase()}` : null
}

const rgb = (hex) => parseColor(hex)
const hex = (color) => toHex(color)
const hsl = (value) => rgbToHsl(rgb(value))
const clamp = (n, min, max) => Math.min(max, Math.max(min, n))
const fromHsl = (h, s, l) => toHex(hslToRgb(((h % 360) + 360) % 360, clamp(s, 0, 100), clamp(l, 0, 100)))
const blend = (a, b, t) => hex(mix(rgb(a), rgb(b), t))
const tinted = (value, p) => hex(tint(rgb(value), p))

export const ratio = (a, b) => contrast(rgb(a), rgb(b))
/** Blanco o grafito, el que más contraste tenga sobre `bg`. */
export const onColor = (bg) => (ratio(bg, WHITE) >= ratio(bg, GRAPHITE) ? WHITE : GRAPHITE)

/** Ajusta la luminosidad de `value`, conservando tono y saturación, hasta `target` de contraste con `against`. */
export function reach(value, against, target) {
  const { h, s, l } = hsl(value)
  const step = rgbToHsl(rgb(against)).l > 50 ? -1 : 1
  let out = value
  for (let light = l; ratio(out, against) < target && light >= 0 && light <= 100; light += step) out = fromHsl(h, s, light)
  return out
}

/** Como deriveText de Grado: el color mezclado con el texto lo justo para leerse sobre su tinte. */
function textOnTint(color, foreground, surfaces, min = 4.5, amount = 0.1) {
  const tints = surfaces.map((surface) => blend(surface, color, amount))
  for (let step = 0; step <= 100; step++) {
    const text = blend(color, foreground, step / 100)
    if (tints.every((t) => ratio(text, t) >= min)) return text
  }
  return foreground
}

export function level(value) {
  if (value >= 7) return { label: 'AAA', tone: 'success' }
  if (value >= 4.5) return { label: 'AA', tone: 'success' }
  return { label: 'Bajo', tone: 'warning' }
}
export const formatRatio = (value) => `${value.toFixed(1).replace('.', ',')} : 1`

/**
 * El texto sobre el principal y, para botones y bordes, si se distingue sobre blanco
 * (3 : 1, WCAG 1.4.11).
 */
export function primaryContrast(primary) {
  const value = ratio(primary, onColor(primary))
  return {
    value,
    text: formatRatio(value),
    ...level(value),
    warning: ratio(primary, WHITE) < 3 ? 'Apenas se distingue de un fondo blanco.' : null,
  }
}

// OKLCH (Björn Ottosson): las armonías giran el tono sin cambiar la luz percibida.
// En HSL, un amarillo y un azul con la misma luminosidad no pesan lo mismo.
const toLinear = (v) => {
  const c = v / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const fromLinear = (v) => Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055))

export function oklch(value) {
  const { r, g, b } = rgb(value)
  const [lr, lg, lb] = [r, g, b].map(toLinear)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    c: Math.hypot(A, B),
    h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360,
  }
}

/** OKLCH → HEX. Si el color no cabe en sRGB, baja el croma hasta que quepa. */
export function fromOklch(L, C, H) {
  const angle = (H * Math.PI) / 180
  for (let c = C; ; c = Math.max(0, c - 0.005)) {
    const A = c * Math.cos(angle),
      B = c * Math.sin(angle)
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
    const linear = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ]
    if (c === 0 || linear.every((v) => v >= -0.0001 && v <= 1.0001)) {
      const [r, g, b] = linear.map((v) => fromLinear(clamp(v, 0, 1)))
      return hex({ r, g, b })
    }
  }
}

/**
 * Paletas que combinan con el principal: un acento (menús, selección y segundo color de los
 * gráficos) y un destacado (tercer color de los gráficos). Con la berenjena o un gris, la
 * primera es la de marca.
 */
export function harmonies(primary) {
  const p = oklch(primary)
  if (p.c < 0.03) {
    return [
      MARCA,
      ...NEUTRAL_PAIRS.map(({ hues, ...meta }) => ({
        ...meta,
        accent: fromOklch(0.78, 0.14, hues[0]),
        highlight: fromOklch(0.72, 0.2, hues[1]),
      })),
    ]
  }
  // Sobre un principal oscuro, acentos claros; sobre uno claro, acentos más oscuros.
  const light = p.l >= 0.62
  const list = HARMONIES.map(({ turn, ...meta }) =>
    turn
      ? {
          ...meta,
          accent: fromOklch(light ? 0.55 : 0.78, clamp(p.c, 0.09, 0.15), p.h + turn[0]),
          highlight: fromOklch(0.72, clamp(p.c * 1.2, 0.12, 0.22), p.h + turn[1]),
        }
      : {
          ...meta,
          accent: fromOklch(light ? 0.5 : 0.86, Math.min(p.c, 0.1), p.h),
          highlight: fromOklch(light ? 0.86 : 0.62, Math.min(p.c * 1.2, 0.2), p.h),
        },
  )
  return primary === BRAND.primary ? [MARCA, ...list] : list
}

/** Un acento que no está entre las sugeridas, como el secundario de un código antiguo, se conserva. */
function palettesFor(primary, accent) {
  const list = harmonies(primary)
  if (list.some((palette) => palette.accent === accent)) return list
  const highlight = primary === BRAND.primary ? BRAND.highlight : fromHsl(hsl(primary).h + 27, 94, 69)
  return [...list, { id: 'personalizada', name: 'Personalizada', description: 'El acento de tu código de tema.', accent, highlight }]
}

/** Cambia el principal y conserva el tipo de paleta: la tríada del rojo pasa a la tríada del azul. */
export function withPrimary(config, primary) {
  const current = harmonies(config.primary).find((palette) => palette.accent === config.accent)?.id
  const list = harmonies(primary)
  return { ...config, primary, accent: (list.find((palette) => palette.id === current) ?? list[0]).accent }
}

function applyVariant(variant, { primary, accent, highlight }, { accentMin = 4.5 } = {}) {
  const p = hsl(primary)
  if (variant === 'S')
    return {
      primary: fromHsl(p.h, p.s < 10 ? p.s : Math.max(20, p.s - 15), Math.min(58, p.l + 12)),
      accent: tinted(accent, 0.65),
      highlight: tinted(highlight, 0.7),
    }
  if (variant === 'C')
    return { primary: reach(primary, WHITE, 7), accent: reach(accent, WHITE, accentMin), highlight: reach(highlight, WHITE, 4.5) }
  return { primary, accent, highlight }
}

/**
 * Las paletas del principal con sus colores finales, ya con la variante aplicada. Con la base
 * «campo» siempre es «Alto contraste», y el acento también llega a 7 : 1.
 */
export function buildPalettes(primary, accent, variant = 'F', base = 'consola') {
  const campo = base === 'campo'
  return palettesFor(primary, accent).map((palette) => {
    const colors = applyVariant(
      campo ? 'C' : variant,
      { primary, accent: palette.accent, highlight: palette.highlight },
      { accentMin: campo ? 7 : 4.5 },
    )
    return { ...palette, colors: { ...colors, soft: tinted(colors.primary, 0.1) } }
  })
}

/**
 * Tokens de Grado para una paleta. Siguen las mismas fórmulas que el tema Consola
 * (grises con el tono del principal) y, con base «marca», la barra lateral de color.
 */
export function themeTokens(palette, { base = 'consola', radius = 'r8', font = 'inter' } = {}) {
  const { primary, accent, highlight } = palette.colors
  const h = Math.round(hsl(primary).h),
    ps = hsl(primary).s,
    ah = hsl(accent)
  const marca = base === 'marca'
  // Campo: todo el texto a 7 : 1 y bordes que se ven al sol.
  const campo = base === 'campo'
  const min = baseById(base).min
  // En campo, el texto sobre color es blanco o negro puro: el grafito no llega a 7 : 1 en oscuro.
  const on = campo ? (bg) => (ratio(bg, WHITE) >= ratio(bg, '#000000') ? WHITE : '#000000') : onColor
  // Grises con el tono del principal; si el principal es casi gris, grises neutros.
  const k = clamp(ps / 40, 0, 1)
  const n = (sat, light) => fromHsl(h, sat * k, light)

  const lightBg = marca ? n(33, 96.5) : WHITE
  const lightSecondary = marca ? tinted(primary, 0.1) : n(20, 95)
  const lightMuted = marca ? n(28, 94) : n(15, 96)
  const lightFg = campo ? '#111111' : GRAPHITE
  const onPrimary = on(primary)
  const lightBorder = campo ? reach(n(10, 60), lightBg, 3.5) : marca ? n(22, 90) : n(15, 90)
  const light = {
    background: lightBg,
    ...(campo ? { foreground: lightFg, 'card-foreground': lightFg, 'popover-foreground': lightFg } : {}),
    primary,
    'primary-foreground': onPrimary,
    'primary-text': textOnTint(primary, lightFg, [lightBg, WHITE], min),
    // Escala tonal del principal, como la calcula Grado: tinte al 10 % y borde al 30 % sobre la tarjeta.
    'primary-subtle': blend(WHITE, primary, 0.1),
    'primary-border': blend(WHITE, primary, 0.3),
    secondary: lightSecondary,
    'secondary-foreground': reach(n(Math.min(92, ps), 20), lightSecondary, 7),
    muted: lightMuted,
    'muted-foreground': reach(n(8, campo ? 30 : 40), lightMuted, min),
    accent,
    'accent-foreground': on(accent),
    border: lightBorder,
    input: campo ? reach(n(10, 45), lightBg, 4.5) : lightBorder,
    ring: primary,
    header: primary,
    'header-foreground': onPrimary,
    'brand-pink': highlight,
    'chart-1': primary,
    'chart-2': accent,
    'chart-3': highlight,
    ...(marca
      ? {
          sidebar: primary,
          'sidebar-foreground': blend(primary, WHITE, 0.82),
          'sidebar-primary': accent,
          'sidebar-primary-foreground': onColor(accent),
          'sidebar-accent': blend(primary, WHITE, 0.12),
          'sidebar-accent-foreground': onPrimary,
          'sidebar-border': blend(primary, WHITE, 0.08),
          'sidebar-ring': accent,
        }
      : {
          'sidebar-primary': primary,
          'sidebar-primary-foreground': onPrimary,
          'sidebar-accent': tinted(primary, 0.1),
          'sidebar-accent-foreground': textOnTint(primary, lightFg, [WHITE], min),
          'sidebar-border': lightBorder,
          'sidebar-ring': primary,
        }),
  }

  const darkBg = campo ? '#000000' : marca ? n(38, 5) : n(25, 6)
  const darkCard = campo ? n(20, 5) : marca ? n(30, 10) : n(25, 8)
  const darkPrimary = campo ? reach(n(clamp(ps, 40, 70), 70), darkBg, 7) : n(clamp(ps, 40, 70), 60)
  const darkAccent = campo ? reach(fromHsl(ah.h, Math.min(60, ah.s), 55), darkBg, 7) : fromHsl(ah.h, Math.min(60, ah.s), 45)
  const darkFg = campo ? WHITE : '#FAFAFA'
  const darkHeader = marca ? n(75, 15) : n(60, 18)
  const darkMuted = n(15, campo ? 10 : 14)
  const darkBorder = campo ? reach(n(10, 45), darkBg, 3.5) : n(15, 18)
  const dark = {
    background: darkBg,
    ...(campo ? { foreground: darkFg, 'card-foreground': darkFg, 'popover-foreground': darkFg } : {}),
    card: darkCard,
    popover: darkCard,
    primary: darkPrimary,
    'primary-foreground': on(darkPrimary),
    'primary-text': textOnTint(darkPrimary, darkFg, [darkBg, darkCard], min),
    'primary-subtle': blend(darkCard, darkPrimary, 0.1),
    'primary-border': blend(darkCard, darkPrimary, 0.3),
    secondary: n(15, 16),
    'secondary-foreground': darkFg,
    muted: darkMuted,
    'muted-foreground': reach(n(8, 65), darkMuted, min),
    accent: darkAccent,
    'accent-foreground': on(darkAccent),
    border: darkBorder,
    input: campo ? reach(n(10, 55), darkBg, 4.5) : darkBorder,
    ring: darkPrimary,
    header: darkHeader,
    'header-foreground': WHITE,
    'brand-pink': highlight,
    'chart-1': darkPrimary,
    'chart-2': accent,
    'chart-3': highlight,
    ...(marca
      ? {
          sidebar: darkHeader,
          'sidebar-foreground': n(40, 89),
          'sidebar-primary': accent,
          'sidebar-primary-foreground': onColor(accent),
          'sidebar-accent': n(43, 23),
          'sidebar-accent-foreground': WHITE,
          'sidebar-border': n(50, 21),
          'sidebar-ring': accent,
        }
      : {
          sidebar: darkBg,
          'sidebar-primary': darkPrimary,
          'sidebar-primary-foreground': onColor(darkPrimary),
          'sidebar-accent': blend(darkBg, darkPrimary, 0.12),
          'sidebar-accent-foreground': n(75, 82),
          'sidebar-border': darkBorder,
          'sidebar-ring': darkPrimary,
        }),
  }
  return { light, dark, radius: RADII[radius] ?? RADII.r8, font: fontById(font).stack }
}

/** Variables CSS listas para un atributo style: { '--k5-primary': '#…', … }. */
export function cssVariables(tokens, mode = 'light') {
  const out = { '--k5-radius': tokens.radius, '--k5-font-sans': tokens.font }
  for (const [name, value] of Object.entries(tokens[mode])) out[`--k5-${name}`] = value
  return out
}

/**
 * Código corto que guarda la configuración: GRADO-5C068C-2ED8C3-F-R8[-BARLOW][-M|-K][-COMPACT|-COMFORT][-D],
 * con el principal, el acento, la variante, la fuente, la base (M marca, K campo), la densidad y el oscuro. Con la fuente por defecto (Inter desde 0.6;
 * antes, Barlow) no se escribe.
 */
export function encodeTheme(config) {
  const c = { ...DEFAULTS, ...config }
  const font = fontById(c.font).id
  return [
    'GRADO',
    c.primary.slice(1),
    c.accent.slice(1),
    c.variant,
    c.radius.toUpperCase(),
    font === DEFAULTS.font ? null : font.toUpperCase(),
    c.base === 'marca' ? 'M' : c.base === 'campo' ? 'K' : null,
    DENSITY_FLAGS[c.density] ?? null,
    c.dark ? 'D' : null,
  ]
    .filter(Boolean)
    .join('-')
}

export function decodeTheme(code) {
  const m = String(code ?? '')
    .trim()
    .toUpperCase()
    .match(/^GRADO-([0-9A-F]{6})-([0-9A-F]{6})-([FESC])-(R4|R8|R12)((?:-[A-Z0-9]+)*)$/)
  if (!m) return null
  const flags = m[5].split('-').filter(Boolean)
  const known = new Set(['M', 'K', 'D', ...Object.values(DENSITY_FLAGS)])
  const fonts = flags.filter((flag) => !known.has(flag))
  // Una sola base y una sola densidad: «-M-K» o «-COMPACT-COMFORT» no son un tema.
  const densities = flags.filter((flag) => Object.values(DENSITY_FLAGS).includes(flag))
  if (densities.length > 1 || (flags.includes('M') && flags.includes('K'))) return null
  const font = fonts.length ? FONTS.find((item) => item.id.toUpperCase() === fonts[0]) : fontById(DEFAULTS.font)
  if (!font || fonts.length > 1) return null
  // La antigua propuesta «Equilibrada» (E) ya no existe: esos códigos se abren con «Fiel».
  return {
    primary: `#${m[1]}`,
    accent: `#${m[2]}`,
    variant: m[3] === 'E' ? 'F' : m[3],
    radius: m[4].toLowerCase(),
    font: font.id,
    base: flags.includes('M') ? 'marca' : flags.includes('K') ? 'campo' : 'consola',
    density: Object.keys(DENSITY_FLAGS).find((key) => flags.includes(DENSITY_FLAGS[key])) ?? 'default',
    dark: flags.includes('D'),
  }
}

/** Todo lo que necesita la web para una configuración. */
export function resolveTheme(config) {
  const c = { ...DEFAULTS, ...config }
  const palettes = buildPalettes(c.primary, c.accent, c.variant, c.base)
  const palette = palettes.find((p) => p.accent === c.accent)
  // Campo usa siempre «Alto contraste»: es lo que pide trabajar al sol.
  const variant = VARIANTS.find((v) => v.id === (c.base === 'campo' ? 'C' : c.variant)) ?? VARIANTS[0]
  return {
    config: c,
    palettes,
    palette,
    variant,
    base: baseById(c.base),
    density: DENSITIES.find((item) => item.id === c.density) ?? DENSITIES[0],
    font: fontById(c.font),
    tokens: themeTokens(palette, c),
    code: encodeTheme(c),
  }
}

/**
 * Combinaciones que revisa el panel de contraste, en claro y, si el tema lo incluye, en oscuro.
 * Texto: 4,5 : 1, o 7 : 1 con la base «campo». Elementos gráficos (`ui`): 3 : 1, WCAG 1.4.11;
 * si no llegan, es un aviso.
 */
export function contrastChecks({ config, tokens }) {
  const text = baseById(config.base).min
  const campo = config.base === 'campo'
  const checks = []
  for (const mode of config.dark ? ['light', 'dark'] : ['light']) {
    const c = tokens[mode]
    checks.push({ mode, label: 'Texto del botón principal', background: c.primary, foreground: c['primary-foreground'], min: text })
    checks.push({ mode, label: 'Enlaces y texto de marca', background: c.background, foreground: c['primary-text'], min: text })
    checks.push({ mode, label: 'Texto de marca sobre tinte', background: c['primary-subtle'], foreground: c['primary-text'], min: text })
    checks.push({ mode, label: 'Texto secundario', background: c.muted, foreground: c['muted-foreground'], min: text })
    if (mode === 'light')
      checks.push({ mode, label: 'Acento sobre el fondo', background: c.background, foreground: c.accent, min: 3, ui: true })
    checks.push({ mode, label: 'Texto sobre el acento', background: c.accent, foreground: c['accent-foreground'], min: text })
    // Al sol, el borde de un campo tiene que verse (WCAG 1.4.11).
    if (campo) checks.push({ mode, label: 'Borde de los campos', background: c.background, foreground: c.input, min: 3, ui: true })
  }
  return checks.map((check) => {
    const value = ratio(check.background, check.foreground)
    const pass = value >= check.min
    const status = pass ? 'ok' : check.ui ? 'warning' : 'fail'
    const tag = pass ? (check.ui ? 'Visible' : level(value).label) : check.ui ? 'Aviso' : 'No llega'
    return {
      ...check,
      ui: Boolean(check.ui),
      value,
      text: formatRatio(value),
      pass,
      status,
      tag,
      tone: { ok: 'success', warning: 'warning', fail: 'danger' }[status],
    }
  })
}

// Con data-k5-theme en el mismo <html> que .dark (Marca, Campo), tokens.css usa
// .dark[data-k5-theme="marca"]: el tema necesita también esa forma para ganarle.
const DARK_SELECTOR =
  '.dark,\n[data-theme="dark"],\n.dark[data-k5-theme],\n[data-theme="dark"][data-k5-theme],\n.dark [data-k5-theme],\n[data-theme="dark"] [data-k5-theme]'

/**
 * grado-tema.css: cada token como --k5-* (componentes de Grado) y con su alias sin
 * prefijo (utilidades de Tailwind). Con Tailwind 3 los alias van en HSL, como tokens-hsl.css.
 */
export function themeCss({ config, palette, variant, font, tokens, code }, { styles = 'tailwind4' } = {}) {
  const alias = (value) => {
    if (styles !== 'tailwind3') return value
    try {
      return toHslTriplet(rgb(value))
    } catch {
      const c = hsl(value)
      return `${c.h.toFixed(1)} ${c.s.toFixed(1)}% ${c.l.toFixed(1)}%`
    }
  }
  const block = (selector, colors, extra = []) => {
    const lines = []
    for (const [name, value] of Object.entries(colors)) lines.push(`  --k5-${name}: ${value};`, `  --${name}: ${alias(value)};`)
    return `${selector} {\n${[...extra, ...lines].join('\n')}\n}`
  }
  const head = `/* grado-tema.css · ${code}\n   Principal ${config.primary} · Paleta «${palette.name}», acento ${config.accent} · Variante «${variant.name}» · Fuente ${font.name}\n   Impórtalo después de los estilos de Grado. Generado en la web de Grado. */`
  const parts = [
    head,
    block(':root,\n[data-k5-theme]', tokens.light, [
      `  --k5-radius: ${tokens.radius};`,
      `  --radius: ${tokens.radius};`,
      `  --k5-font-sans: ${tokens.font};`,
    ]),
  ]
  // Como en Grado, al imprimir no se aplica el oscuro: papel blanco y texto oscuro.
  if (config.dark) parts.push(`@media not print {\n${block(DARK_SELECTOR, tokens.dark).replace(/^(?=.)/gm, '  ')}\n}`)
  // Tailwind 4 lee la fuente de --k5-font-sans. El preset de Tailwind 3 escribe la de marca en su
  // base (html): :root pesa más que html, así que la página usa la fuente del tema.
  if (styles === 'tailwind3')
    parts.push('/* Fuente del tema por encima de la base de Tailwind 3. */\n:root {\n  font-family: var(--k5-font-sans);\n}')
  return `${parts.join('\n\n')}\n`
}

/**
 * Pasos de instalación con el tema, según framework y estilos. Con bundler, Inter sale de
 * @1k5-tech-es/grado/fonts.css y las demás fuentes de Fontsource; en HTML, Inter se copia del
 * paquete y las demás se enlazan a Google Fonts. Campo añade su archivo (themes/campo.css) y,
 * en HTML, los Web Components de @1k5-tech-es/grado-elements traen lo interactivo.
 */
export function installSteps({ config, font }, { framework = 'react', styles = 'tailwind4' } = {}) {
  const campo = config.base === 'campo'
  const fontPackage = font.package ? ` \\\n  ${font.package}` : ''
  const install =
    framework === 'html'
      ? 'npm install @1k5-tech-es/grado @1k5-tech-es/grado-elements'
      : `npm install @1k5-tech-es/grado @1k5-tech-es/grado-${framework}${fontPackage}`
  const attrs = [
    config.base !== 'consola' ? ` data-k5-theme="${config.base}"` : '',
    config.density && config.density !== 'default' ? ` data-k5-density="${config.density}"` : '',
  ].join('')
  const htmlTag = `<html lang="es"${attrs}>`
  const main = framework === 'vue' ? 'main.ts' : 'main.tsx'
  const fontImports = font.bundled
    ? "import '@1k5-tech-es/grado/fonts.css';\n"
    : font.package
      ? `${FONT_WEIGHTS.map((weight) => `import '${font.package}/${weight}.css';`).join('\n')}\n`
      : ''
  let entry, fontEntry, elements
  if (framework === 'html') {
    const fontLinks = font.bundled
      ? '  <link rel="stylesheet" href="/grado/dist/fonts.css">\n'
      : font.href
        ? `  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link rel="stylesheet" href="${font.href}">\n`
        : ''
    entry = {
      label: 'index.html · copia dist/ y assets/fonts/ de @1k5-tech-es/grado a /grado, y tu tema a /grado/grado-tema.css',
      code: `${htmlTag}\n<head>\n${fontLinks}  <link rel="stylesheet" href="/grado/dist/tokens.css">\n${campo ? '  <link rel="stylesheet" href="/grado/dist/themes/campo.css">\n' : ''}  <link rel="stylesheet" href="/grado/dist/grado.min.css">\n  <link rel="stylesheet" href="/grado/grado-tema.css">\n</head>`,
    }
    elements = {
      label: 'Componentes interactivos · copia dist/grado-elements.min.js de @1k5-tech-es/grado-elements',
      code: `<script type="module" src="/grado/grado-elements.min.js"></script>\n\n<k5-combobox label="Provincia" name="provincia">\n  <option value="md">Madrid</option>\n</k5-combobox>`,
    }
  } else if (styles === 'css') {
    entry = {
      label: `Entrada de tu aplicación · ${main}`,
      code: `${fontImports}import '@1k5-tech-es/grado/tokens.css';\n${campo ? "import '@1k5-tech-es/grado/themes/campo.css';\n" : ''}import '@1k5-tech-es/grado/grado.css';\nimport './grado-tema.css';`,
    }
  } else {
    entry =
      styles === 'tailwind3'
        ? {
            label: 'CSS global · con el preset de Grado en tailwind.config.js',
            code: `@import '@1k5-tech-es/grado/tokens-hsl.css';\n${campo ? "@import '@1k5-tech-es/grado/themes/campo-hsl.css';\n" : ''}@import '@1k5-tech-es/grado/grado.css';\n@import './grado-tema.css';\n\n@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
          }
        : {
            label: 'CSS global',
            code: `@import 'tailwindcss';\n@import '@1k5-tech-es/grado/tailwind.css';\n${campo ? "@import '@1k5-tech-es/grado/themes/campo.css';\n" : ''}@import '@1k5-tech-es/grado/grado.css' layer(components);\n@import './grado-tema.css';`,
          }
    // La fuente va en la entrada de JavaScript: así el bundler resuelve las rutas de sus archivos.
    if (fontImports) fontEntry = { label: `Entrada de tu aplicación · ${main} · fuente ${font.name}`, code: fontImports.trimEnd() }
  }
  // El paso del archivo no lleva código: la web pone ahí el CSS del tema (themeCss).
  const steps = [
    { label: 'Terminal · en tu aplicación, con el .npmrc de Instalación', code: install },
    { label: framework === 'html' ? 'grado/grado-tema.css · guarda aquí tu tema' : 'src/grado-tema.css · guarda aquí tu tema', file: true },
    entry,
  ]
  if (fontEntry) steps.push(fontEntry)
  if (elements) steps.push(elements)
  if (framework !== 'html' && (attrs || config.dark))
    steps.push({ label: 'index.html', code: `${htmlTag}${config.dark ? '\n<!-- Modo oscuro: añade class="dark" a <html> -->' : ''}` })
  return steps
}

/** Comando de una línea para cuando exista el CLI de Grado. */
export const cliCommand = (code, { framework = 'react', styles = 'tailwind4' } = {}) =>
  `npx @1k5-tech-es/grado init --tema ${code} --framework ${framework}${framework === 'html' ? '' : ` --estilos ${styles}`}`
