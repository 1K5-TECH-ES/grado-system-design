// Maquetación y tipografía: cada clase que generan los helpers existe en grado.css,
// y hay una clase de hueco para cada paso de la escala de espacio.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadTokens } from '../scripts/lib/tokens.mjs'
import * as k5 from '@1k5-tech-es/grado/classes'

const tokens = loadTokens()
const css = readFileSync(new URL('../dist/grado.css', import.meta.url), 'utf8')
const has = (cls) => new RegExp(`\\.${cls}[\\s{:,.\\[]`).test(css)
const rule = (selector) => css.match(new RegExp(`\\${selector} \\{([^}]*)\\}`))?.[1] ?? ''

test('hay una clase de hueco para cada clave de tokens.space, con su variable', () => {
  assert.deepEqual([...k5.SPACE_STEPS].sort(), Object.keys(tokens.space).sort(), 'SPACE_STEPS sigue la escala de tokens.json')
  for (const step of Object.keys(tokens.space)) {
    assert.equal(k5.gapClass(step), `k5-gap-${step}`)
    assert.match(rule(`.k5-gap-${step}`), new RegExp(`gap: var\\(--k5-space-${step}\\);`), `falta .k5-gap-${step} en grado.css`)
  }
})

test('cada clase que generan los helpers de maquetación y tipografía existe en grado.css', () => {
  const produced = new Set()
  const add = (s) => s.split(' ').forEach((c) => produced.add(c))
  for (const direction of k5.STACK_DIRECTIONS)
    for (const align of k5.STACK_ALIGNS)
      for (const justify of k5.STACK_JUSTIFIES) add(k5.stackClass({ direction, align, justify, wrap: true }))
  for (const columns of k5.GRID_COLUMNS) for (const minItemWidth of k5.GRID_MIN_WIDTHS) add(k5.gridClass({ columns, minItemWidth }))
  for (const size of k5.CONTAINER_SIZES) for (const padded of [true, false]) add(k5.containerClass({ size, padded }))
  for (const size of k5.TEXT_SIZES)
    for (const tone of k5.TEXT_TONES)
      for (const weight of k5.TEXT_WEIGHTS) add(k5.textClass({ size, tone, weight, truncate: true, numeric: true }))
  for (const level of k5.HEADING_LEVELS) for (const size of [undefined, ...k5.HEADING_SIZES]) add(k5.headingClass({ level, size }))
  for (const cls of produced) assert.ok(has(cls), `falta .${cls} en grado.css`)
})

test('valores sueltos y no válidos', () => {
  assert.equal(k5.gapClass(1.5), 'k5-gap-1-5')
  assert.equal(k5.gapClass('7'), 'k5-gap-4')
  assert.equal(k5.stackClass(), 'k5-stack k5-gap-4')
  assert.equal(k5.gridClass({ columns: '3' }), 'k5-grid k5-grid--cols-3 k5-gap-4')
  assert.equal(k5.gridClass({ columns: 9 }), 'k5-grid k5-grid--auto k5-gap-4')
  assert.equal(k5.containerClass(), 'k5-container')
  assert.equal(k5.textClass({ tone: 'rojo' }), 'k5-text')
  assert.equal(k5.headingLevel('3'), 3)
  assert.equal(k5.headingLevel(9), 2)
  assert.deepEqual(
    [1, 2, 3, 4, 5, 6].map((level) => k5.headingSize(level)),
    ['title', 'heading', 'lead', 'lead', 'lead', 'lead'],
  )
})

test('tipografía y contenedores con los tokens de la escala', () => {
  for (const size of ['caption', 'small', 'lead'])
    assert.match(
      rule(`.k5-text--${size}`),
      new RegExp(`font-size: var\\(--k5-text-${size}\\);\\s*line-height: var\\(--k5-leading-${size}\\);`),
    )
  for (const tone of ['primary', 'success', 'warning', 'info'])
    assert.match(rule(`.k5-text--${tone}`), new RegExp(`var\\(--k5-${tone}-text\\)`))
  assert.match(rule('.k5-text--danger'), /var\(--k5-destructive-text\)/)
  assert.match(rule('.k5-heading--title'), /letter-spacing: var\(--k5-tracking-title\)/)
  assert.match(rule('.k5-heading--display'), /letter-spacing: var\(--k5-tracking-display\)/)
  assert.match(rule('.k5-heading'), /text-wrap: balance/)
  for (const size of ['sm', 'md']) assert.match(rule(`.k5-container--${size}`), new RegExp(`max-width: var\\(--k5-container-${size}\\)`))
  assert.match(rule('.k5-container'), /max-width: var\(--k5-container-lg\)/)
})
