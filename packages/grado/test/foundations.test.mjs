// Tokens de espaciado, movimiento, capas y puntos de corte, y los archivos que genera el
// build además de grado.css: minificado, en capa, por componente, fuentes y formato W3C.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { loadTokens } from '../scripts/lib/tokens.mjs'

const tokens = loadTokens()
const dist = new URL('../dist/', import.meta.url)
const read = (file) => readFileSync(new URL(file, dist), 'utf8')
const css = read('grado.css')
const tokensCss = read('tokens.css')

test('tokens.css declara espaciado, movimiento, capas y puntos de corte', () => {
  for (const name of Object.keys(tokens.space)) assert.match(tokensCss, new RegExp(`--k5-space-${name}: `))
  for (const name of Object.keys(tokens.motion)) assert.match(tokensCss, new RegExp(`--k5-${name}: `))
  for (const name of Object.keys(tokens.z)) assert.match(tokensCss, new RegExp(`--k5-z-${name}: \\d+;`))
  for (const name of Object.keys(tokens.breakpoint)) assert.match(tokensCss, new RegExp(`--k5-breakpoint-${name}: \\d+px;`))
  assert.match(tokensCss, /@media \(prefers-reduced-motion: reduce\) \{\s*:root \{\s*--k5-duration-fast: 0s;/)
})

test('las capas van de abajo arriba sin empates', () => {
  const values = Object.values(tokens.z).map(Number)
  assert.deepEqual(
    values,
    [...values].sort((a, b) => a - b),
  )
  assert.equal(new Set(values).size, values.length)
})

test('grado.css no escribe z-index ni duraciones a mano', () => {
  assert.deepEqual(
    [...css.matchAll(/z-index:(?!\s*var\()[^;]+;/g)].map((m) => m[0]),
    [],
  )
  // Solo las animaciones en bucle (spinner y skeleton) llevan su propio ritmo.
  const loose = [...css.matchAll(/\b(transition|animation)(?:-duration)?\s*:[^;]*\b\d*\.?\d+m?s\b[^;]*;/g)]
    .map((m) => m[0])
    .filter((rule) => !/k5-(spin|pulse)|animation-duration: 1\.6s|visibility 0s/.test(rule))
  assert.deepEqual(loose, [])
})

test('los media queries usan los puntos de corte de tokens.json', () => {
  const allowed = new Set(Object.values(tokens.breakpoint).flatMap((px) => [px, `${parseInt(px) - 1}px`]))
  for (const [, width] of css.matchAll(/@media \((?:max|min)-width:\s*(\d+px)\)/g)) {
    assert.ok(allowed.has(width), `${width} no es un punto de corte de tokens.json (${[...allowed].join(', ')})`)
  }
})

test('grado.min.css, grado.layer.css y css/*.css contienen lo mismo que grado.css', () => {
  const min = read('grado.min.css')
  const layered = read('grado.layer.css')
  assert.ok(min.length < css.length * 0.85, 'grado.min.css debería ocupar bastante menos')
  assert.match(layered, /^@layer components \{$/m)
  for (const selector of ['.k5-btn', '.k5-calendar__day', '.k5-chart__bar--5', '.k5-command__item']) {
    assert.ok(min.includes(selector) && layered.includes(selector), selector)
  }
  const files = readdirSync(new URL('css/', dist))
  assert.ok(files.includes('base.css') && files.includes('button.css') && files.includes('calendar.css'))
  const joined = files.map((f) => read(`css/${f}`)).join('\n')
  for (const selector of ['.k5-btn--primary', '.k5-segmented__option', '.k5-number__step']) assert.ok(joined.includes(selector), selector)
})

test('fonts.css apunta a archivos que existen en el paquete', () => {
  const fonts = read('fonts.css')
  const urls = [...fonts.matchAll(/url\('([^']+)'\)/g)].map((m) => m[1])
  assert.equal(urls.length, 8, 'Barlow 400–700 en latin y latin-ext')
  for (const url of urls) assert.ok(existsSync(new URL(url, dist)), url)
  assert.ok(existsSync(new URL('../assets/fonts/OFL.txt', dist)), 'la licencia OFL viaja con las fuentes')
  assert.match(tokens.typography['font-sans'], /^Barlow, /)
})

test('tokens.dtcg.json sigue el formato W3C: cada token tiene $type y $value', () => {
  const data = JSON.parse(read('tokens.dtcg.json'))
  assert.deepEqual(
    Object.keys(data).filter((k) => !k.startsWith('$')),
    ['global', 'consola/light', 'consola/dark', 'marca/light', 'marca/dark'],
  )
  let count = 0
  const walk = (node, path) => {
    if (node && typeof node === 'object' && '$value' in node) {
      assert.ok(node.$type, `${path} sin $type`)
      count++
      return
    }
    for (const [key, child] of Object.entries(node)) if (!key.startsWith('$')) walk(child, `${path}.${key}`)
  }
  walk(data, '')
  assert.ok(count > 200, `solo ${count} tokens`)
  assert.equal(data['consola/light'].color.primary.$value, '#5C068C')
  assert.deepEqual(data.global.ease.emphasized.$value, [0.32, 0.72, 0, 1])
  assert.equal(data.global.z.dropdown.$value, 60)
})
