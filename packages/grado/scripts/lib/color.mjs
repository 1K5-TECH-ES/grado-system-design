// Utilidades de color sin dependencias. Trabajan en sRGB de 8 bits, que es lo que
// acaba pintando el navegador, para que las comprobaciones de paridad sean exactas.

const HEX = /^#([0-9a-f]{6})$/i
const HSL = /^hsl\(\s*(-?[\d.]+)(?:deg)?\s+([\d.]+)%\s+([\d.]+)%\s*\)$/i

/** Convierte "#RRGGBB" o "hsl(h s% l%)" en { r, g, b } y conserva el HSL original si lo hay. */
export function parseColor(input) {
  const value = String(input).trim()
  let m = value.match(HEX)
  if (m) {
    const n = parseInt(m[1], 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, hsl: null }
  }
  m = value.match(HSL)
  if (m) {
    const [h, s, l] = m.slice(1).map(Number)
    return { ...hslToRgb(h, s, l), hsl: { h, s, l } }
  }
  throw new Error(`Color no válido: "${input}". Usa #RRGGBB o hsl(h s% l%).`)
}

export function hslToRgb(h, s, l) {
  const sat = s / 100
  const lig = l / 100
  const a = sat * Math.min(lig, 1 - lig)
  const f = (n) => {
    const k = (n + h / 30) % 12
    return lig - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) }
}

export function rgbToHsl({ r, g, b }) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return { h: 0, s: 0, l: l * 100 }
  const s = d / (1 - Math.abs(2 * l - 1))
  let h
  if (max === rn) h = ((gn - bn) / d) % 6
  else if (max === gn) h = (bn - rn) / d + 2
  else h = (rn - gn) / d + 4
  h *= 60
  if (h < 0) h += 360
  return { h, s: s * 100, l: l * 100 }
}

export function toHex({ r, g, b }) {
  return (
    '#' +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  )
}

const trim = (n) => String(Number(n.toFixed(2)))

/**
 * Triplete "h s% l%" para el formato de shadcn con Tailwind 3 (`hsl(var(--x))`).
 * Si el color vino en HSL se respeta tal cual; si vino en HEX se busca la menor
 * precisión que, al volver a RGB, da exactamente el mismo color.
 */
export function toHslTriplet(color) {
  if (color.hsl) return `${trim(color.hsl.h)} ${trim(color.hsl.s)}% ${trim(color.hsl.l)}%`
  const exact = rgbToHsl(color)
  for (const digits of [0, 1, 2, 3]) {
    const p = 10 ** digits
    const h = Math.round(exact.h * p) / p
    const s = Math.round(exact.s * p) / p
    const l = Math.round(exact.l * p) / p
    const back = hslToRgb(h, s, l)
    if (back.r === color.r && back.g === color.g && back.b === color.b) {
      return `${trim(h)} ${trim(s)}% ${trim(l)}%`
    }
  }
  throw new Error(`No se pudo expresar ${toHex(color)} en HSL sin perder precisión`)
}

/** Mezcla en sRGB: t = 0 devuelve a, t = 1 devuelve b. Igual que color-mix(in srgb, a, b t). */
export function mix(a, b, t) {
  const ch = (x, y) => Math.round(x * (1 - t) + y * t)
  return { r: ch(a.r, b.r), g: ch(a.g, b.g), b: ch(a.b, b.b), hsl: null }
}

/** Tono de un color mezclado con blanco: p = 0.75 deja el 75 % del color. */
export function tint(color, p) {
  const mixChannel = (v) => Math.round(255 - p * (255 - v))
  return { r: mixChannel(color.r), g: mixChannel(color.g), b: mixChannel(color.b), hsl: null }
}

export function luminance({ r, g, b }) {
  const lin = (v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** Relación de contraste WCAG 2.x entre dos colores. */
export function contrast(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

export function sameColor(a, b) {
  return a.r === b.r && a.g === b.g && a.b === b.b
}
