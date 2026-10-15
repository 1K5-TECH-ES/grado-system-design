// El tema "consola" tiene que reproducir 1komma5es_help. Las únicas diferencias
// permitidas son las correcciones de marca y las de contraste de abajo.
// El fixture es una copia de Frontend/src/assets/index.css de 1komma5es_help.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseColor, sameColor, toHex } from '../scripts/lib/color.mjs'
import { loadTokens } from '../scripts/lib/tokens.mjs'

const css = readFileSync(new URL('./fixtures/1komma5es_help-index.css', import.meta.url), 'utf8')
const { themes } = loadTokens()

function block(selector) {
  const start = css.indexOf(`${selector} {`)
  assert.ok(start >= 0, `no se encuentra ${selector} en el fixture`)
  const body = css.slice(start, css.indexOf('}', start))
  return Object.fromEntries([...body.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1].slice(2), m[2].trim()]))
}

const help = { light: block(':root'), dark: block('.dark') }

// Colores oficiales de la guía de marca (fase 1).
const BRAND = {
  light: {
    foreground: '#222222',
    'card-foreground': '#222222',
    'popover-foreground': '#222222',
    'accent-foreground': '#222222',
    primary: '#5C068C',
    ring: '#5C068C',
    header: '#5C068C',
    accent: '#2ED8C3',
    'brand-pink': '#FA65EC',
  },
  dark: {
    'brand-pink': '#FA65EC',
  },
}

// Contraste AA (0.2.0): el mismo tono, un poco más oscuro en claro; en oscuro, el morado
// sube de luminosidad y el texto sobre morado, menta, verde y azul pasa a grafito.
const CONTRAST = {
  light: {
    destructive: '#DD1313',
    success: '#227F53',
    info: '#0F65F0',
  },
  dark: {
    primary: '#B86CE5',
    ring: '#B86CE5',
    'primary-foreground': '#222222',
    'accent-foreground': '#222222',
    'success-foreground': '#222222',
    'info-foreground': '#222222',
  },
}

const CORRECTIONS = {
  light: { ...BRAND.light, ...CONTRAST.light },
  dark: { ...BRAND.dark, ...CONTRAST.dark },
}

for (const mode of ['light', 'dark']) {
  test(`consola ${mode}: igual que 1komma5es_help salvo las correcciones de marca y de contraste`, () => {
    const ours = themes.consola[mode].full
    const differences = {}
    for (const [name, value] of Object.entries(help[mode])) {
      if (name.startsWith('shadow-')) {
        assert.equal(ours.shadow[name.slice(7)], value, `sombra ${name}`)
        continue
      }
      if (name === 'radius') {
        assert.equal(ours.size.radius, value)
        continue
      }
      assert.ok(ours.color[name], `falta el token ${name} que usa 1komma5es_help`)
      const theirs = parseColor(`hsl(${value})`)
      if (!sameColor(theirs, ours.color[name].color)) differences[name] = toHex(ours.color[name].color)
    }
    assert.deepEqual(differences, CORRECTIONS[mode])
  })
}
