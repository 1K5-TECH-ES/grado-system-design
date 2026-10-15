// Gráficos de 0.3: cada clase que generan los helpers existe en grado.css.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as k5 from '@1k5-tech-es/grado/classes'

const css = readFileSync(new URL('../dist/grado.css', import.meta.url), 'utf8')

test('cada clase de los gráficos existe en grado.css', () => {
  const produced = new Set()
  const add = (s) => s.split(' ').forEach((c) => produced.add(c))
  for (const tone of k5.SPARKLINE_TONES) add(k5.sparklineClass({ tone }))
  for (const size of k5.SIZES) add(k5.donutClass({ size }))
  for (const variant of k5.METER_VARIANTS) for (const level of k5.METER_LEVELS) add(k5.meterClass({ variant, level }))
  for (const node of Object.keys(k5.ENERGY_POSITIONS)) {
    for (const flow of ['in', 'out', 'none']) {
      add(k5.energyLineClass(node, flow))
      add(k5.energyNodeClass(node, flow))
    }
  }
  for (const n of [1, 2, 3, 4, 5]) add(`k5-chart__series--${n} k5-donut__tone--${n}`)
  add('k5-chart__line k5-chart__area k5-chart__point k5-chart__column k5-chart__swatch--line k5-kpi__trend')
  add('k5-sparkline__line k5-sparkline__area k5-sparkline__dot k5-donut__segment k5-donut__center k5-meter__segment--on k5-meter__fill')
  add('k5-energy k5-energy--no-battery k5-energy__diagram k5-energy__hub k5-energy__arrow k5-energy__state k5-energy__level')
  // La línea sin flujo usa el gris por defecto: no necesita regla propia.
  produced.delete('k5-energy__line--off')
  for (const cls of produced) assert.match(css, new RegExp(`\\.${cls}[\\s{:,.\\[]`), `falta .${cls} en grado.css`)
})

test('helpers de los gráficos: valores no válidos caen en el valor por defecto', () => {
  assert.equal(k5.sparklineClass({ tone: 'rojo' }), 'k5-sparkline k5-sparkline--brand')
  assert.equal(k5.donutClass(), 'k5-donut')
  assert.equal(k5.meterClass({ variant: 'pila', level: 'x' }), 'k5-meter k5-meter--neutral')
  assert.equal(k5.energyLineClass('grid', 'out'), 'k5-energy__line k5-energy__line--grid k5-energy__line--left')
  assert.equal(k5.energyLineClass('battery', 'in'), 'k5-energy__line k5-energy__line--battery k5-energy__line--up')
  assert.equal(k5.energyLineClass('home', 'none'), 'k5-energy__line k5-energy__line--home k5-energy__line--off')
  assert.equal(k5.kpiSparklineTone({ tone: 'bad', direction: 'up' }), 'danger')
  assert.equal(k5.kpiSparklineTone(null), 'neutral')
})
