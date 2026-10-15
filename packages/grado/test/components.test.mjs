import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { contrast, mix } from '../scripts/lib/color.mjs'
import { MODES, loadTokens } from '../scripts/lib/tokens.mjs'
import * as k5 from '@1k5/grado/classes'

const css = readFileSync(new URL('../dist/grado.css', import.meta.url), 'utf8')
const tokensCss = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8')

test('cada clase que puede generar classes.js existe en grado.css', () => {
  const produced = new Set()
  const add = (s) => s.split(' ').forEach((c) => produced.add(c))
  for (const variant of k5.BUTTON_VARIANTS) {
    for (const size of k5.SIZES) {
      add(k5.buttonClass({ variant, size, iconOnly: true, block: true }))
    }
  }
  for (const tone of k5.BADGE_TONES) add(k5.badgeClass({ tone }))
  for (const kind of ['input', 'select', 'textarea']) for (const size of k5.SIZES) add(k5.controlClass(kind, { size }))
  for (const size of k5.SIZES) add(k5.inputWrapClass({ size }))
  for (const size of k5.SIZES) add(k5.spinnerClass({ size }))
  for (const variant of k5.CARD_VARIANTS) add(k5.cardClass({ variant }))
  add(k5.tableClass({ compact: true }))
  add(k5.emptyClass({ compact: true }))
  add(k5.kpiClass({ tone: 'danger' }))
  for (const size of k5.SIZES) add(k5.avatarClass({ size }))
  add(k5.appShellClass({ collapsed: true, navOpen: true }))
  for (const status of k5.AVATAR_STATUSES) add(`k5-avatar__status--${status}`)
  for (const cls of produced) assert.match(css, new RegExp(`\\.${cls}[\\s{:,.\\[]`), `falta .${cls} en grado.css`)
})

test('grado.css solo usa variables que existen', () => {
  const declared = new Set([...tokensCss.matchAll(/(--k5-[a-z0-9-]+):/g)].map((m) => m[1]))
  const local = new Set([...css.matchAll(/(--_[a-z]+):/g)].map((m) => m[1]))
  for (const [, name] of css.matchAll(/var\((--[a-z0-9_-]+)/g)) {
    assert.ok(declared.has(name) || local.has(name), `grado.css usa ${name}, que no está definida`)
  }
})

test('el texto sobre tintes llega a 4,5 : 1 en todos los temas', () => {
  const tokens = loadTokens()
  const { tint, tokens: derived } = tokens.derived
  for (const [theme, modes] of Object.entries(tokens.themes)) {
    for (const mode of MODES) {
      const c = modes[mode].full.color
      for (const [name, source] of Object.entries(derived)) {
        for (const surface of ['background', 'card']) {
          const bg = mix(c[surface].color, c[source].color, tint)
          const ratio = contrast(c[name].color, bg)
          assert.ok(ratio >= 4.5, `${theme}.${mode}: ${name} sobre ${source} al 10 % en ${surface} = ${ratio.toFixed(2)}`)
        }
      }
    }
  }
})

test('variaciones de KPI: misma lógica que KpiStrip de 1komma5es_help', () => {
  assert.deepEqual(k5.kpiTrend(5.9, 'higher'), { tone: 'good', direction: 'up' })
  assert.deepEqual(k5.kpiTrend(-5.9, 'lower'), { tone: 'good', direction: 'down' })
  assert.deepEqual(k5.kpiTrend(5.9, 'lower'), { tone: 'bad', direction: 'up' })
  assert.deepEqual(k5.kpiTrend(0.3, 'higher'), { tone: 'flat', direction: 'up' })
  assert.deepEqual(k5.kpiTrend(12, 'neutral'), { tone: 'flat', direction: 'up' })
  assert.equal(k5.kpiTrend(null), null)
  assert.equal(k5.formatChange(-14.28), '14,3 %')
})

test('valores no válidos caen en el valor por defecto', () => {
  assert.equal(k5.buttonClass({ variant: 'rojo' }), 'k5-btn k5-btn--primary')
  assert.equal(k5.badgeClass({ tone: 'x' }), 'k5-badge k5-badge--neutral')
})

test('iniciales para el avatar', () => {
  assert.equal(k5.initials('Lucía Fernández'), 'LF')
  assert.equal(k5.initials('  marta  '), 'M')
  assert.equal(k5.initials('ángel núñez garcía'), 'ÁN')
  assert.equal(k5.initials(''), '?')
})
