// Genera todo dist/ a partir de src/tokens.json: `node scripts/build.mjs`.
// Solo usa esbuild, para minificar grado.min.css.
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { contrast, toHex, toHslTriplet } from './lib/color.mjs'
import { BASE_THEME, CONTRAST_PAIRS, MODES, SHADCN_SIZE_ALIASES, loadTokens } from './lib/tokens.mjs'
import { renderPreview } from './lib/preview.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = `${root}dist/`
const pkg = JSON.parse(readFileSync(`${root}package.json`, 'utf8'))
const tokens = loadTokens()

const banner = (what) =>
  `/*\n * ${pkg.name} ${pkg.version} · ${what}\n * Generado desde src/tokens.json. No lo edites a mano: cambia el JSON y ejecuta npm run build.\n */\n`

// ---------- Selectores de tema ----------

function selectors(theme, mode) {
  const attr = `[data-k5-theme="${theme}"]`
  if (theme === BASE_THEME) {
    return mode === 'light' ? [':root', attr] : ['.dark', '[data-theme="dark"]', `.dark ${attr}`, `[data-theme="dark"] ${attr}`]
  }
  return mode === 'light' ? [attr] : [`.dark${attr}`, `.dark ${attr}`, `[data-theme="dark"]${attr}`, `[data-theme="dark"] ${attr}`]
}

// ---------- CSS de tokens (dos formatos de color para los nombres de shadcn) ----------

function globalBlock() {
  const lines = ['  /* Marca y neutros (constantes, iguales en todos los temas) */']
  for (const [name, entry] of Object.entries(tokens.palette)) {
    const note = entry.kind === 'tint' ? ' /* calculado */' : ''
    lines.push(`  --k5-${name}: ${toHex(entry.color)};${note}`)
  }
  lines.push('', '  /* Tipografía: Barlow (fonts.css) con la fuente del sistema de respaldo */')
  for (const [name, value] of Object.entries(tokens.typography)) lines.push(`  --k5-${name}: ${value};`)
  lines.push('', '  /* Espaciado: escala de 4 px */')
  for (const [name, value] of Object.entries(tokens.space)) lines.push(`  --k5-space-${name}: ${value};`)
  lines.push('', '  /* Movimiento */')
  for (const [name, value] of Object.entries(tokens.motion)) lines.push(`  --k5-${name}: ${value};`)
  lines.push('', '  /* Capas: lo que flota sobre la página, de abajo arriba */')
  for (const [name, value] of Object.entries(tokens.z)) lines.push(`  --k5-z-${name}: ${value};`)
  lines.push('', '  /* Puntos de corte: referencia para JS; los media queries no aceptan variables */')
  for (const [name, value] of Object.entries(tokens.breakpoint)) lines.push(`  --k5-breakpoint-${name}: ${value};`)
  return `:root {\n${lines.join('\n')}\n}\n`
}

// Con «reducir movimiento», las transiciones pasan a ser instantáneas.
function reducedMotionBlock() {
  const durations = Object.keys(tokens.motion).filter((name) => name.startsWith('duration-'))
  return `@media (prefers-reduced-motion: reduce) {\n  :root {\n${durations.map((name) => `    --k5-${name}: 0s;`).join('\n')}\n  }\n}\n`
}

function themeBlock(theme, mode, format) {
  const { block } = tokens.themes[theme][mode]
  const k5 = []
  const shadcn = []
  for (const [name, { color, ref }] of Object.entries(block.color)) {
    const note = ref ? ` /* ${ref} */` : ''
    k5.push(`  --k5-${name}: ${toHex(color)};${note}`)
    shadcn.push(`  --${name}: ${format === 'hsl' ? toHslTriplet(color) : toHex(color)};`)
  }
  for (const [name, value] of Object.entries(block.shadow)) {
    k5.push(`  --k5-shadow-${name}: ${value};`)
    shadcn.push(`  --shadow-${name}: ${value};`)
  }
  for (const [name, value] of Object.entries(block.size)) {
    k5.push(`  --k5-${name}: ${value};`)
    if (SHADCN_SIZE_ALIASES[name]) shadcn.push(`  ${SHADCN_SIZE_ALIASES[name]}: ${value};`)
  }
  const body = [
    `  color-scheme: ${mode};`,
    '',
    '  /* Grado: siempre colores completos */',
    ...k5,
    '',
    format === 'hsl'
      ? '  /* Nombres de shadcn en formato HSL: úsalos como hsl(var(--primary)) */'
      : '  /* Nombres de shadcn: úsalos como var(--primary) */',
    ...shadcn,
  ]
  const label = `${theme} · ${mode === 'light' ? 'claro' : 'oscuro'}`
  return `/* ${label} */\n${selectors(theme, mode).join(',\n')} {\n${body.join('\n')}\n}\n`
}

function tokensCss(format) {
  const parts = [globalBlock()]
  const order = [BASE_THEME, ...Object.keys(tokens.themes).filter((t) => t !== BASE_THEME)]
  for (const theme of order) for (const mode of MODES) parts.push(themeBlock(theme, mode, format))
  parts.push(reducedMotionBlock())
  return parts.join('\n')
}

// ---------- Tailwind 4 ----------

function tailwind4Css() {
  const lines = []
  for (const name of tokens.keys.color) lines.push(`  --color-${name}: var(--${name});`)
  lines.push('')
  for (const name of Object.keys(tokens.palette)) lines.push(`  --color-${name}: var(--k5-${name});`)
  lines.push(
    '',
    '  --font-sans: var(--k5-font-sans);',
    '  --font-mono: var(--k5-font-mono);',
    '  --text-2xs: var(--k5-text-badge);',
    '  --text-2xs--line-height: 1rem;',
    '',
    '  --radius-sm: calc(var(--radius) - 4px);',
    '  --radius-md: calc(var(--radius) - 2px);',
    '  --radius-lg: var(--radius);',
    '  --radius-panel: var(--k5-radius-panel);',
    '  --radius-badge: var(--k5-radius-badge);',
    '',
    '  --shadow-overlay: var(--k5-shadow-overlay);',
    '  --shadow-popover: var(--k5-shadow-popover);',
    '',
    '  --spacing-control-sm: var(--k5-control-h-sm);',
    '  --spacing-control: var(--k5-control-h);',
    '  --spacing-control-lg: var(--k5-control-h-lg);',
    '',
    '  --ease-standard: var(--k5-ease-standard);',
    '  --ease-emphasized: var(--k5-ease-emphasized);',
  )
  return (
    banner('Tailwind 4') +
    `@import "./tokens.css";\n\n` +
    `@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));\n\n` +
    `@theme inline {\n${lines.join('\n')}\n}\n`
  )
}

// ---------- Tailwind 3 (preset) ----------

function tailwind3Colors() {
  const names = tokens.keys.color
  const colors = {}
  for (const name of names) {
    const value = `hsl(var(--${name}) / <alpha-value>)`
    const dash = name.indexOf('-')
    const base = dash > 0 ? name.slice(0, dash) : null
    if (base && names.includes(base)) {
      colors[base] ??= {}
      colors[base][name.slice(dash + 1)] = value
    } else if (names.some((n) => n.startsWith(`${name}-`))) {
      colors[name] ??= {}
      colors[name].DEFAULT = value
    } else {
      colors[name] = value
    }
  }
  const groups = {}
  for (const [name, entry] of Object.entries(tokens.palette)) {
    const [base, step] = name.split('-')
    if (step && tokens.palette[base]) {
      groups[base] ??= { DEFAULT: toHex(tokens.palette[base].color) }
      groups[base][step] = toHex(entry.color)
    } else if (!Object.keys(tokens.palette).some((n) => n.startsWith(`${name}-`))) {
      groups[name] = toHex(entry.color)
    }
  }
  return { ...colors, ...groups }
}

const stack = (value) => value.split(',').map((s) => s.trim())

function tailwind3Preset() {
  return {
    darkMode: ['class'],
    theme: {
      container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
      extend: {
        colors: tailwind3Colors(),
        borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)',
          panel: 'var(--k5-radius-panel)',
          badge: 'var(--k5-radius-badge)',
        },
        boxShadow: { overlay: 'var(--shadow-overlay)', popover: 'var(--shadow-popover)' },
        fontFamily: { sans: stack(tokens.typography['font-sans']), mono: stack(tokens.typography['font-mono']) },
        fontSize: { '2xs': [tokens.typography['text-badge'], { lineHeight: '1rem' }] },
        spacing: {
          'control-sm': 'var(--k5-control-h-sm)',
          control: 'var(--k5-control-h)',
          'control-lg': 'var(--k5-control-h-lg)',
        },
        transitionDuration: Object.fromEntries(
          Object.keys(tokens.motion)
            .filter((n) => n.startsWith('duration-'))
            .map((n) => [n.slice(9), `var(--k5-${n})`]),
        ),
        transitionTimingFunction: { standard: 'var(--k5-ease-standard)', emphasized: 'var(--k5-ease-emphasized)' },
        zIndex: Object.fromEntries(Object.keys(tokens.z).map((n) => [n, `var(--k5-z-${n})`])),
        keyframes: {
          'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
          'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        },
        animation: {
          'accordion-down': 'accordion-down 0.2s ease-out',
          'accordion-up': 'accordion-up 0.2s ease-out',
        },
      },
    },
  }
}

// ---------- Tokens para JavaScript ----------

function jsData() {
  const themes = {}
  for (const [theme, modes] of Object.entries(tokens.themes)) {
    themes[theme] = {}
    for (const mode of MODES) {
      const { full } = modes[mode]
      themes[theme][mode] = {
        color: Object.fromEntries(Object.entries(full.color).map(([k, v]) => [k, toHex(v.color)])),
        shadow: full.shadow,
        size: full.size,
      }
    }
  }
  return {
    brand: tokens.brand,
    palette: Object.fromEntries(Object.entries(tokens.palette).map(([k, v]) => [k, toHex(v.color)])),
    typography: tokens.typography,
    space: tokens.space,
    motion: tokens.motion,
    z: Object.fromEntries(Object.entries(tokens.z).map(([k, v]) => [k, Number(v)])),
    breakpoint: tokens.breakpoint,
    themes,
  }
}

function tokensDts(data) {
  const union = (list) => list.map((k) => JSON.stringify(k)).join(' | ')
  return `${banner('tipos de los tokens')}
export type ThemeName = ${union(Object.keys(data.themes))}
export type ThemeMode = 'light' | 'dark'
export type ColorToken = ${union(tokens.keys.color)}
export type ShadowToken = ${union(tokens.keys.shadow)}
export type SizeToken = ${union(tokens.keys.size)}
export type PaletteName = ${union(Object.keys(data.palette))}
export type BrandName = ${union(Object.keys(data.brand))}

export interface BrandColor { hex: string; rgb: string; cmyk: string; pantone: string; oracal: string; usage: string }
export interface ThemeValues {
  color: Record<ColorToken, string>
  shadow: Record<ShadowToken, string>
  size: Record<SizeToken, string>
}

export declare const brand: Record<BrandName, BrandColor>
export declare const palette: Record<PaletteName, string>
export type SpaceToken = ${union(Object.keys(data.space))}
export type MotionToken = ${union(Object.keys(data.motion))}
export type LayerToken = ${union(Object.keys(data.z))}
export type BreakpointToken = ${union(Object.keys(data.breakpoint))}

export declare const typography: Record<string, string>
export declare const space: Record<SpaceToken, string>
export declare const motion: Record<MotionToken, string>
export declare const z: Record<LayerToken, number>
export declare const breakpoint: Record<BreakpointToken, string>
export declare const themes: Record<ThemeName, Record<ThemeMode, ThemeValues>>
declare const tokens: {
  brand: typeof brand
  palette: typeof palette
  typography: typeof typography
  space: typeof space
  motion: typeof motion
  z: typeof z
  breakpoint: typeof breakpoint
  themes: typeof themes
}
export default tokens
`
}

// ---------- Contraste (para la vista previa y el informe) ----------

function contrastReport() {
  const out = {}
  for (const [theme, modes] of Object.entries(tokens.themes)) {
    out[theme] = {}
    for (const mode of MODES) {
      const c = modes[mode].full.color
      out[theme][mode] = CONTRAST_PAIRS.map(([fg, bg, label]) => ({
        fg,
        bg,
        label,
        ratio: Math.round(contrast(c[fg].color, c[bg].color) * 100) / 100,
      }))
    }
  }
  return out
}

// ---------- Escribir ----------

mkdirSync(dist, { recursive: true })
const write = (file, content) => writeFileSync(dist + file, content)

const css = banner('tokens.css · para Tailwind 4, shadcn v4 y CSS normal') + '\n' + tokensCss('hex')
write('tokens.css', css)
write('tokens-hsl.css', banner('tokens-hsl.css · para Tailwind 3 y shadcn-vue: hsl(var(--primary))') + '\n' + tokensCss('hsl'))
write('tailwind.css', tailwind4Css())

const preset = JSON.stringify(tailwind3Preset(), null, 2)
write(
  'tailwind-preset.js',
  `${banner('preset de Tailwind 3')}\n/** @type {import('tailwindcss').Config} */\nconst preset = ${preset}\n\nexport default preset\n`,
)
write(
  'tailwind-preset.cjs',
  `${banner('preset de Tailwind 3')}\n/** @type {import('tailwindcss').Config} */\nconst preset = ${preset}\n\nmodule.exports = preset\n`,
)
write(
  'tailwind-preset.d.ts',
  `${banner('tipos del preset de Tailwind 3')}\nimport type { Config } from 'tailwindcss'\ndeclare const preset: Partial<Config>\nexport default preset\n`,
)

const data = jsData()
const json = JSON.stringify(data, null, 2)
write(
  'tokens.js',
  `${banner('tokens para JavaScript')}\nconst tokens = ${json}\n\nexport const { brand, palette, typography, space, motion, z, breakpoint, themes } = tokens\nexport default tokens\n`,
)
write(
  'tokens.cjs',
  `${banner('tokens para JavaScript')}\nconst tokens = ${json}\n\nmodule.exports = tokens\nmodule.exports.default = tokens\n`,
)
write('tokens.d.ts', tokensDts(data))

// Componentes en CSS: un archivo por componente, en este orden.
const COMPONENT_CSS = [
  'base',
  'button',
  'badge',
  'field',
  'switch',
  'card',
  'table',
  'kpi',
  'page-header',
  'empty-state',
  'avatar',
  'nav',
  'app-shell',
  'overlay',
  'menu',
  'choice',
  'alert',
  'skeleton',
  'tabs',
  'pagination',
  'date-range',
  'upload',
  'stepper',
  'timeline',
  'filter-bar',
  'accordion',
  'breadcrumbs',
  'data-table',
  'segmented',
  'number-input',
  'multi-select',
  'calendar',
  'command-palette',
  'chart',
]
const missing = readdirSync(`${root}src/css`).filter((f) => f.endsWith('.css') && !COMPONENT_CSS.includes(f.slice(0, -4)))
if (missing.length) throw new Error(`Añade a COMPONENT_CSS: ${missing.join(', ')}`)
const componentCss = Object.fromEntries(COMPONENT_CSS.map((name) => [name, readFileSync(`${root}src/css/${name}.css`, 'utf8').trim()]))
const gradoCss = COMPONENT_CSS.map((name) => componentCss[name]).join('\n\n') + '\n'
write('grado.css', banner('grado.css · componentes en CSS. Necesita tokens.css o tokens-hsl.css') + '\n' + gradoCss)

// Lo mismo dentro de @layer components: el CSS propio de la app (sin capa) gana siempre.
// Para HTML sin bundler o Tailwind 4 sin `layer(components)` en el import.
write('grado.layer.css', banner('grado.layer.css · grado.css dentro de @layer components') + '\n@layer components {\n' + gradoCss + '}\n')

// Minificado, para servirlo tal cual sin bundler.
const { transform } = await import('esbuild')
const minified = await transform(gradoCss, { loader: 'css', minify: true, target: ['chrome111', 'safari16.2', 'firefox113'] })
write('grado.min.css', `/* ${pkg.name} ${pkg.version} · grado.min.css */\n${minified.code}`)

// Un archivo por componente. Todos necesitan tokens.css y css/base.css.
rmSync(`${dist}css`, { recursive: true, force: true })
mkdirSync(`${dist}css`, { recursive: true })
for (const [name, content] of Object.entries(componentCss)) {
  const needs = name === 'base' ? 'Necesita tokens.css' : 'Necesita tokens.css y css/base.css'
  write(`css/${name}.css`, banner(`css/${name}.css · ${needs}`) + '\n' + content + '\n')
}

// ---------- Fuente: Barlow alojada en el propio paquete ----------

const FONT_RANGES = {
  latin:
    'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  'latin-ext':
    'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
}
const FONT_WEIGHTS = [400, 500, 600, 700]
const faces = []
for (const weight of FONT_WEIGHTS) {
  for (const [subset, range] of Object.entries(FONT_RANGES)) {
    const file = `barlow-${subset}-${weight}-normal.woff2`
    readFileSync(`${root}assets/fonts/${file}`) // falla aquí si falta el archivo
    faces.push(
      `@font-face {\n  font-family: 'Barlow';\n  font-style: normal;\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('../assets/fonts/${file}') format('woff2');\n  unicode-range: ${range};\n}`,
    )
  }
}
write(
  'fonts.css',
  `${banner('fonts.css · Barlow 400, 500, 600 y 700. Licencia SIL OFL 1.1: assets/fonts/OFL.txt')}\n${faces.join('\n\n')}\n`,
)

// ---------- Formato W3C (DTCG), para Tokens Studio y Figma ----------

function dtcg() {
  const color = (hex) => ({ $type: 'color', $value: hex })
  const dimension = (value) => ({ $type: 'dimension', $value: value })
  const set = (entries, make) => Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, make(v)]))
  const global = {
    palette: set(data.palette, color),
    font: {
      sans: { $type: 'fontFamily', $value: stack(tokens.typography['font-sans']) },
      mono: { $type: 'fontFamily', $value: stack(tokens.typography['font-mono']) },
    },
    text: set(
      Object.fromEntries(
        Object.entries(tokens.typography)
          .filter(([k]) => k.startsWith('text-'))
          .map(([k, v]) => [k.slice(5), v]),
      ),
      dimension,
    ),
    weight: set(
      Object.fromEntries(
        Object.entries(tokens.typography)
          .filter(([k]) => k.startsWith('weight-'))
          .map(([k, v]) => [k.slice(7), Number(v)]),
      ),
      (v) => ({ $type: 'fontWeight', $value: v }),
    ),
    space: set(tokens.space, dimension),
    duration: set(
      Object.fromEntries(
        Object.entries(tokens.motion)
          .filter(([k]) => k.startsWith('duration-'))
          .map(([k, v]) => [k.slice(9), v]),
      ),
      (v) => ({ $type: 'duration', $value: v }),
    ),
    ease: set(
      Object.fromEntries(
        Object.entries(tokens.motion)
          .filter(([k]) => k.startsWith('ease-'))
          .map(([k, v]) => [k.slice(5), v]),
      ),
      (v) => ({ $type: 'cubicBezier', $value: EASE_POINTS[v] ?? v }),
    ),
    z: set(data.z, (v) => ({ $type: 'number', $value: v })),
    breakpoint: set(tokens.breakpoint, dimension),
  }
  const out = { $description: `${pkg.name} ${pkg.version}. Un conjunto global y uno por tema y modo (Tokens Studio: token sets).`, global }
  for (const [theme, modes] of Object.entries(data.themes)) {
    for (const mode of MODES) {
      const { color: colors, shadow, size } = modes[mode]
      out[`${theme}/${mode}`] = {
        color: set(colors, color),
        shadow: set(shadow, (v) => ({ $type: 'shadow', $value: v })),
        size: set(size, dimension),
      }
    }
  }
  return out
}
// Las curvas con nombre de CSS, como puntos de Bézier (lo que pide el formato W3C).
const EASE_POINTS = { ease: [0.25, 0.1, 0.25, 1], 'ease-out': [0, 0, 0.58, 1], 'cubic-bezier(0.32, 0.72, 0, 1)': [0.32, 0.72, 0, 1] }
write('tokens.dtcg.json', JSON.stringify(dtcg(), null, 2) + '\n')

const logoWhite = readFileSync(`${root}assets/logo-1k5-white.svg`, 'utf8')
write('preview.html', renderPreview({ css, data, contrast: contrastReport(), logoWhite, version: pkg.version, tintNote: tokens.tintNote }))

console.log(
  `${pkg.name} ${pkg.version}: dist/ generado (${Object.keys(tokens.themes).length} temas, ${tokens.keys.color.length} colores por tema)`,
)
