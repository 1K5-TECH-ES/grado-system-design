// Compila de verdad con Tailwind 3 y Tailwind 4 para comprobar que el preset y
// tailwind.css generan las clases que usan las apps.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import tailwind3 from 'tailwindcss3'
import tailwind4 from '@tailwindcss/postcss'
import preset from '@1k5/grado/tailwind-preset'

const here = fileURLToPath(new URL('.', import.meta.url))

const CLASSES = [
  'bg-primary',
  'bg-primary/10',
  'text-primary-foreground',
  'text-muted-foreground',
  'border-border',
  'bg-sidebar-accent',
  'text-warning-strong',
  'bg-brand-pink',
  'bg-chart-2',
  'bg-aubergine-25',
  'text-mint',
  'bg-graphite-10',
  'rounded-lg',
  'rounded-md',
  'shadow-overlay',
  'h-control',
  'text-2xs',
  'text-caption',
  'text-display',
  'bg-primary-subtle',
  'border-destructive-border',
  'shadow-raised',
  'rounded-xs',
  'font-sans',
  'dark:bg-card',
  'duration-base',
  'ease-emphasized',
  'z-dropdown',
]

const rule = (css, selector) => {
  const at = css.indexOf(`${selector} {`) >= 0 ? css.indexOf(`${selector} {`) : css.indexOf(`${selector}{`)
  assert.ok(at >= 0, `no se generó ${selector}`)
  return css.slice(at, css.indexOf('}', at))
}

test('Tailwind 3 con el preset (1komma5es_help, Sales Coach)', async () => {
  const { css } = await postcss([
    tailwind3({ presets: [preset], content: [{ raw: `<div class="${CLASSES.join(' ')}"></div>` }], corePlugins: { preflight: false } }),
  ]).process('@tailwind utilities;', { from: undefined })

  assert.match(rule(css, '.bg-primary\\/10'), /hsl\(var\(--primary\) \/ 0\.1\)/)
  assert.match(rule(css, '.text-muted-foreground'), /hsl\(var\(--muted-foreground\) \/ var\(--tw-text-opacity/)
  assert.match(rule(css, '.bg-sidebar-accent'), /hsl\(var\(--sidebar-accent\)/)
  assert.match(rule(css, '.text-warning-strong'), /hsl\(var\(--warning-strong\)/)
  assert.match(rule(css, '.bg-aubergine-25'), /rgb\(214 193 226/)
  assert.match(rule(css, '.rounded-lg'), /border-radius: var\(--radius\)/)
  assert.match(rule(css, '.rounded-md'), /calc\(var\(--radius\) - 2px\)/)
  assert.match(rule(css, '.shadow-overlay'), /var\(--shadow-overlay\)/)
  assert.match(rule(css, '.h-control'), /height: var\(--k5-control-h\)/)
  assert.match(rule(css, '.text-2xs'), /font-size: 0\.75rem/)
  assert.match(rule(css, '.text-display'), /font-size: var\(--k5-text-display\);\s*line-height: var\(--k5-leading-display\)/)
  assert.match(rule(css, '.bg-primary-subtle'), /hsl\(var\(--primary-subtle\)/)
  assert.match(rule(css, '.border-destructive-border'), /hsl\(var\(--destructive-border\)/)
  assert.match(rule(css, '.shadow-raised'), /var\(--shadow-raised\)/)
  assert.match(rule(css, '.rounded-xs'), /var\(--k5-radius-xs\)/)
  assert.match(css, /\.dark\\:bg-card:is\(\.dark \*\)/)
  assert.match(rule(css, '.duration-base'), /transition-duration: var\(--k5-duration-base\)/)
  assert.match(rule(css, '.ease-emphasized'), /var\(--k5-ease-emphasized\)/)
  assert.match(rule(css, '.z-dropdown'), /z-index: var\(--k5-z-dropdown\)/)
})

test('Tailwind 4 con tailwind.css (Kompilot, Memorias)', async () => {
  const input = [
    '@import "tailwindcss" source(none);',
    '@import "@1k5/grado/tailwind.css";',
    `@source inline("${CLASSES.join(' ')}");`,
  ].join('\n')
  const { css } = await postcss([tailwind4({ base: here, optimize: false })]).process(input, { from: `${here}input.css` })

  assert.match(css, /--k5-aubergine: #5C068C;/, 'incluye tokens.css')
  assert.match(css, /--primary: #5C068C;/)
  assert.match(rule(css, '.bg-primary'), /background-color: var\(--primary\)/)
  assert.match(rule(css, '.bg-primary\\/10'), /color-mix\(in (oklab|srgb), var\(--primary\) 10%, transparent\)/)
  assert.match(rule(css, '.bg-aubergine-25'), /var\(--k5-aubergine-25\)/)
  assert.match(rule(css, '.rounded-lg'), /border-radius: var\(--radius\)/)
  assert.match(rule(css, '.h-control'), /height: var\(--k5-control-h\)/)
  assert.match(rule(css, '.text-2xs'), /font-size: var\(--k5-text-badge\)/)
  assert.match(rule(css, '.text-caption'), /font-size: var\(--k5-text-caption\)/)
  assert.match(rule(css, '.bg-primary-subtle'), /background-color: var\(--primary-subtle\)/)
  assert.match(rule(css, '.shadow-raised'), /var\(--k5-shadow-raised\)/)
  assert.match(rule(css, '.rounded-xs'), /border-radius: var\(--k5-radius-xs\)/)
  assert.match(css, /\.shadow-overlay/)
  assert.match(rule(css, '.ease-emphasized'), /transition-timing-function: var\(--k5-ease-emphasized\)/)
  assert.match(css, /\.dark\\:bg-card[^{]*:where\(\.dark, \.dark \*, \[data-theme="dark"\], \[data-theme="dark"\] \*\)/)
})

test('Tailwind 4: grado.css entra en la capa components y las utilidades la pueden sobrescribir', async () => {
  const input = [
    '@import "tailwindcss" source(none);',
    '@import "@1k5/grado/tailwind.css";',
    '@import "@1k5/grado/grado.css" layer(components);',
    '@source inline("rounded-full");',
  ].join('\n')
  const { css } = await postcss([tailwind4({ base: here, optimize: false })]).process(input, { from: `${here}input.css` })

  // El orden de las capas lo fija esta declaración, no la posición en el archivo:
  // utilities gana a components aunque aparezca antes.
  assert.match(css, /@layer theme, base, components, utilities;/)
  const layerOf = (selector) => {
    const at = css.indexOf(`${selector} {`)
    const opened = [...css.slice(0, at).matchAll(/^@layer ([a-z]+) \{/gm)].pop()
    return opened?.[1]
  }
  assert.equal(layerOf('.k5-btn'), 'components')
  assert.equal(layerOf('.rounded-full'), 'utilities')
})
