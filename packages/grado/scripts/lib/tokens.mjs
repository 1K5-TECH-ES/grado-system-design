import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { contrast, mix, parseColor, tint } from './color.mjs'

export const TOKENS_PATH = fileURLToPath(new URL('../../src/tokens.json', import.meta.url))

export const BASE_THEME = 'consola'
export const MODES = ['light', 'dark']

/** Tokens de forma que también existen con nombre de shadcn. */
export const SHADCN_SIZE_ALIASES = { radius: '--radius' }

/**
 * Parejas texto / fondo que se comprueban en cada tema. Umbral AA para texto
 * normal: 4,5 : 1. Lo que no llega se reporta; los tests deciden qué es aceptable.
 */
export const CONTRAST_PAIRS = [
  ['foreground', 'background', 'Texto principal'],
  ['muted-foreground', 'background', 'Texto secundario'],
  ['muted-foreground', 'muted', 'Texto secundario sobre gris'],
  ['card-foreground', 'card', 'Texto en tarjetas'],
  ['popover-foreground', 'popover', 'Texto en menús'],
  ['primary', 'background', 'Texto o enlace berenjena'],
  ['primary-foreground', 'primary', 'Botón principal'],
  ['secondary-foreground', 'secondary', 'Botón secundario'],
  ['accent-foreground', 'accent', 'Resaltado menta'],
  ['header-foreground', 'header', 'Cabecera'],
  ['destructive-foreground', 'destructive', 'Botón de borrar'],
  ['destructive', 'background', 'Texto de error'],
  ['success-foreground', 'success', 'Éxito sólido'],
  ['success', 'background', 'Texto de éxito'],
  ['warning-foreground', 'warning', 'Aviso sólido'],
  ['warning-strong', 'background', 'Texto de aviso'],
  ['info-foreground', 'info', 'Información sólida'],
  ['info', 'background', 'Texto informativo'],
  ['sidebar-foreground', 'sidebar', 'Navegación lateral'],
  ['sidebar-accent-foreground', 'sidebar-accent', 'Sección activa'],
  ['sidebar-primary-foreground', 'sidebar-primary', 'Indicador activo'],
]

function readRaw(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

/** Paleta plana: aubergine, aubergine-75 … graphite-10, white, black. */
function buildPalette(raw) {
  const palette = {}
  for (const [name, def] of Object.entries(raw.brand)) {
    const base = parseColor(def.hex)
    palette[name] = { color: base, source: def.hex, kind: 'brand' }
    for (const step of raw.tints.steps) {
      palette[`${name}-${step}`] = { color: tint(base, step / 100), source: `${step} % de ${name}`, kind: 'tint' }
    }
  }
  for (const [name, hex] of Object.entries(raw.neutral)) {
    palette[name] = { color: parseColor(hex), source: hex, kind: 'neutral' }
  }
  return palette
}

function resolveColor(value, palette, where) {
  const ref = String(value).match(/^\{([a-z0-9-]+)\}$/)
  if (ref) {
    const hit = palette[ref[1]]
    if (!hit) throw new Error(`${where}: la referencia {${ref[1]}} no existe en la paleta`)
    return { color: hit.color, ref: ref[1] }
  }
  try {
    return { color: parseColor(value), ref: null }
  } catch (err) {
    throw new Error(`${where}: ${err.message}`)
  }
}

function resolveBlock(block = {}, palette, where) {
  const color = {}
  for (const [name, value] of Object.entries(block.color ?? {})) {
    color[name] = resolveColor(value, palette, `${where}.color.${name}`)
  }
  return { color, shadow: { ...(block.shadow ?? {}) }, size: { ...(block.size ?? {}) } }
}

const merge = (...blocks) => ({
  color: Object.assign({}, ...blocks.map((b) => b.color)),
  shadow: Object.assign({}, ...blocks.map((b) => b.shadow)),
  size: Object.assign({}, ...blocks.map((b) => b.size)),
})

/**
 * Devuelve, para cada tema y modo:
 * - `block`: lo que hay que escribir en su selector CSS.
 * - `full`: el tema completo ya resuelto (para JS, tests y la vista previa).
 *
 * Reglas: el tema base define todos los tokens; los demás solo pueden
 * sobrescribir tokens que existen. Los tamaños no dependen del modo, así que
 * solo se declaran en claro. En oscuro, un tema derivado repite todo lo que su
 * versión clara sobrescribe, para que nunca se cuele un valor claro.
 */
export function loadTokens(path = TOKENS_PATH) {
  const raw = readRaw(path)
  const palette = buildPalette(raw)
  const base = raw.themes[BASE_THEME]
  if (!base) throw new Error(`Falta el tema base "${BASE_THEME}"`)

  const baseLight = resolveBlock(base.light, palette, `${BASE_THEME}.light`)
  const baseDark = resolveBlock(base.dark, palette, `${BASE_THEME}.dark`)
  const keys = {
    color: Object.keys(baseLight.color),
    shadow: Object.keys(baseLight.shadow),
    size: Object.keys(baseLight.size),
  }
  const assertKnown = (block, where) => {
    for (const kind of ['color', 'shadow', 'size']) {
      for (const name of Object.keys(block[kind])) {
        if (!keys[kind].includes(name)) throw new Error(`${where}: "${name}" no existe en el tema base`)
      }
    }
  }
  if (Object.keys(baseDark.size).length) throw new Error(`${BASE_THEME}.dark: los tamaños solo van en claro`)
  assertKnown(baseDark, `${BASE_THEME}.dark`)
  for (const name of keys.color) {
    if (!baseDark.color[name]) throw new Error(`${BASE_THEME}.dark: falta el color "${name}"`)
  }

  const baseDarkFull = merge(baseLight, baseDark)
  const themes = {
    [BASE_THEME]: {
      description: base.description,
      light: { block: baseLight, full: baseLight },
      dark: { block: baseDark, full: baseDarkFull },
    },
  }

  for (const [name, def] of Object.entries(raw.themes)) {
    if (name === BASE_THEME) continue
    if (def.extends !== BASE_THEME) throw new Error(`${name}: solo se puede extender "${BASE_THEME}"`)
    const light = resolveBlock(def.light, palette, `${name}.light`)
    const darkOwn = resolveBlock(def.dark, palette, `${name}.dark`)
    assertKnown(light, `${name}.light`)
    assertKnown(darkOwn, `${name}.dark`)
    if (Object.keys(darkOwn.size).length) throw new Error(`${name}.dark: los tamaños solo van en claro`)

    const darkBlock = { color: {}, shadow: {}, size: {} }
    for (const kind of ['color', 'shadow']) {
      const touched = new Set([...Object.keys(light[kind]), ...Object.keys(darkOwn[kind])])
      for (const key of touched) darkBlock[kind][key] = darkOwn[kind][key] ?? baseDarkFull[kind][key]
    }
    themes[name] = {
      description: def.description,
      light: { block: light, full: merge(baseLight, light) },
      dark: { block: darkBlock, full: merge(baseDarkFull, { color: {}, shadow: {}, size: light.size }, darkBlock) },
    }
  }

  if (raw.derived) addDerived(raw.derived, themes, keys)

  return {
    raw,
    palette,
    keys,
    themes,
    typography: raw.typography,
    brand: raw.brand,
    tintNote: raw.tints.note,
    derived: raw.derived,
    ...globalScales(raw),
  }
}

/**
 * Escalas iguales en todos los temas: espaciado, movimiento, capas y puntos de corte.
 * Devuelve nombre de token → valor CSS, en el orden del JSON.
 */
function globalScales(raw) {
  const motion = {}
  for (const [name, value] of Object.entries(raw.motion.duration)) motion[`duration-${name}`] = value
  for (const [name, value] of Object.entries(raw.motion.ease)) motion[`ease-${name}`] = value
  return {
    space: { ...raw.space.values },
    motion,
    z: Object.fromEntries(Object.entries(raw.z.values).map(([name, value]) => [name, String(value)])),
    breakpoint: { ...raw.breakpoint.values },
  }
}

/**
 * Texto legible sobre el tinte de un color: el propio color mezclado con
 * `foreground` lo justo para llegar a `min` sobre el tinte en el fondo de
 * página y en el de tarjeta. En claro oscurece; en oscuro aclara.
 */
export function deriveText(colors, source, { tint: amount, min }) {
  const base = colors[source].color
  const surfaces = ['background', 'card'].map((s) => mix(colors[s].color, base, amount))
  for (let step = 0; step <= 100; step++) {
    const text = mix(base, colors.foreground.color, step / 100)
    if (surfaces.every((surface) => contrast(text, surface) >= min)) return text
  }
  throw new Error(`No hay texto con contraste ${min} para "${source}"`)
}

function addDerived(derived, themes, keys) {
  for (const [name, source] of Object.entries(derived.tokens)) {
    if (!keys.color.includes(source)) throw new Error(`derived.${name}: "${source}" no existe`)
    if (keys.color.includes(name)) throw new Error(`derived.${name}: ya existe un token con ese nombre`)
  }
  for (const modes of Object.values(themes)) {
    for (const mode of MODES) {
      const { block, full } = modes[mode]
      const values = Object.entries(derived.tokens).map(([name, source]) => [
        name,
        { color: deriveText(full.color, source, derived), ref: null, derivedFrom: source },
      ])
      for (const [name, value] of values) {
        block.color[name] = value
        full.color[name] = value
      }
    }
  }
  keys.color.push(...Object.keys(derived.tokens))
}
