import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { hslToRgb, parseColor, sameColor, toHex, toHslTriplet } from '../scripts/lib/color.mjs'
import { MODES, loadTokens } from '../scripts/lib/tokens.mjs'

const tokens = loadTokens()
const dist = new URL('../dist/', import.meta.url)

test('los colores oficiales de la guía de marca están tal cual', () => {
  assert.equal(toHex(tokens.palette.aubergine.color), '#5C068C')
  assert.equal(toHex(tokens.palette.mint.color), '#2ED8C3')
  assert.equal(toHex(tokens.palette.fuchsia.color), '#FA65EC')
  assert.equal(toHex(tokens.palette.graphite.color), '#222222')
  assert.equal(toHex(tokens.palette['graphite-75'].color), '#4F4F4F')
  assert.equal(toHex(tokens.palette['graphite-25'].color), '#BDBDBD')
})

test('cada triplete HSL vuelve exactamente al mismo color', () => {
  for (const [theme, modes] of Object.entries(tokens.themes)) {
    for (const mode of MODES) {
      for (const [name, { color }] of Object.entries(modes[mode].full.color)) {
        const [h, s, l] = toHslTriplet(color).replace(/%/g, '').split(' ').map(Number)
        assert.ok(sameColor(hslToRgb(h, s, l), color), `${theme}.${mode}.${name}: ${toHex(color)} -> ${toHslTriplet(color)}`)
      }
    }
  }
})

test('todos los temas y modos tienen el mismo juego de tokens', () => {
  const expected = tokens.keys
  for (const [theme, modes] of Object.entries(tokens.themes)) {
    for (const mode of MODES) {
      const { full } = modes[mode]
      for (const kind of ['color', 'shadow', 'size']) {
        assert.deepEqual(Object.keys(full[kind]).sort(), [...expected[kind]].sort(), `${theme}.${mode}.${kind}`)
      }
    }
  }
})

test('un tema derivado en oscuro sobrescribe todo lo que cambia en claro', () => {
  const { light, dark } = tokens.themes.marca
  for (const kind of ['color', 'shadow']) {
    for (const key of Object.keys(light.block[kind])) {
      assert.ok(key in dark.block[kind], `marca.dark debe declarar ${kind}.${key}; si no, se colaría el valor claro`)
    }
  }
  assert.equal(tokens.themes.marca.dark.full.size.radius, tokens.themes.marca.light.full.size.radius)
})

test('las referencias a colores que no existen fallan con un mensaje claro', () => {
  assert.throws(() => parseColor('rojo'), /Color no válido/)
})

test('tokens.css y tokens-hsl.css declaran las mismas variables', () => {
  const vars = (file) => [...readFileSync(new URL(file, dist), 'utf8').matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1])
  assert.deepEqual(vars('tokens-hsl.css'), vars('tokens.css'))
})

test('el CSS en HEX usa colores completos y el HSL usa tripletes', () => {
  const hex = readFileSync(new URL('tokens.css', dist), 'utf8')
  const hsl = readFileSync(new URL('tokens-hsl.css', dist), 'utf8')
  assert.match(hex, /--primary: #5C068C;/)
  assert.match(hsl, /--primary: 278\.5 91\.8% 28\.6%;/)
  assert.match(hsl, /--k5-primary: #5C068C;/, 'las variables --k5-* son siempre colores completos')
})

test('los tokens para JavaScript se pueden importar en ESM y CommonJS', async () => {
  const esm = await import(new URL('tokens.js', dist))
  const cjs = createRequire(import.meta.url)('../dist/tokens.cjs')
  assert.equal(esm.themes.consola.light.color.primary, '#5C068C')
  assert.equal(cjs.themes.marca.light.color.sidebar, '#5C068C')
  assert.equal(esm.default.palette['aubergine-10'], '#EFE6F4')
})
