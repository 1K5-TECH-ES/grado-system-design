// Energía (0.4): PriceChart, BatteryLevel, Heatmap e iconos generan el mismo HTML en React y Vue.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import { normalize } from './normalize.mjs'

const vue = (render) => renderToString(createSSRApp({ render }))
const same = (name, props) => [r(R[name], props), () => h(V[name], props)]

// Un viernes de octubre: valle hasta las 8, puntas de 10 a 14 y de 18 a 22.
const prices = [
  0.112, 0.104, 0.098, 0.095, 0.094, 0.097, 0.108, 0.126, 0.152, 0.168, 0.181, 0.176, 0.171, 0.164, 0.142, 0.138, 0.141, 0.159, 0.196,
  0.214, 0.209, 0.192, 0.168, 0.131,
]
const week = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (__, hour) => Math.round((0.2 + (hour >= 19 && hour <= 22 ? 1.1 : 0) + d * 0.05) * 10) / 10),
)

const SCENARIOS = {
  'precio de un viernes con la franja de ahora': same('PriceChart', {
    prices,
    date: '2026-10-16',
    now: '20:15',
    title: 'Precio de la luz',
    description: 'PVPC, €/kWh',
  }),
  'precio de un sábado: todo valle, sin resumen ni leyenda': same('PriceChart', {
    prices,
    date: '2026-10-17',
    summary: false,
    legend: false,
  }),
  'precio por cuartos de hora, sin interacción': same('PriceChart', {
    prices: Array.from({ length: 96 }, (_, i) => prices[Math.floor(i / 4)]),
    interactive: false,
    height: 160,
  }),
  'batería cargando con capacidad y reserva': same('BatteryLevel', { level: 72, capacity: 10, power: 2.1, reserve: 20 }),
  'batería baja descargando, pequeña': same('BatteryLevel', { level: 8, power: -1.4, size: 'sm', label: 'Batería del garaje' }),
  'batería media en reposo': same('BatteryLevel', { level: 22, capacity: 5, power: 0 }),
  'mapa de calor de la semana': same('Heatmap', {
    data: week,
    unit: 'kWh',
    title: 'Consumo por hora',
    rowLabel: 'Día',
  }),
  'mapa de calor propio con huecos y tono': same('Heatmap', {
    data: [
      [120, 340, null],
      [410, 380, 290],
    ],
    rowLabels: ['2025', '2026'],
    columnLabels: ['Ene', 'Feb', 'Mar'],
    tone: 2,
    interactive: false,
  }),
  'icono decorativo': same('HeatPumpIcon', {}),
  'icono con nombre': same('WallboxIcon', { title: 'Cargador' }),
}

const html = {}
for (const [name, [react, vueRender]] of Object.entries(SCENARIOS)) {
  test(`mismo HTML en React y Vue: ${name}`, async () => {
    html[name] = normalize(renderToStaticMarkup(react))
    assert.equal(html[name], normalize(await vue(vueRender)))
  })
}

test('PriceChart: periodos 2.0TD, franja de ahora, resumen y tabla', () => {
  const out = html['precio de un viernes con la franja de ahora']
  assert.equal((out.match(/k5-chart__bar k5-price__bar--valle/g) ?? []).length, 8)
  assert.equal((out.match(/k5-chart__bar k5-price__bar--punta/g) ?? []).length, 8)
  assert.equal((out.match(/k5-chart__bar k5-price__bar--llano/g) ?? []).length, 8)
  assert.match(out, /Más barato: <strong>04:00–05:00 · 0,094 €\/kWh<\/strong>/)
  assert.match(out, /Más caro: <strong>19:00–20:00 · 0,214 €\/kWh<\/strong>/)
  assert.match(out, /<div class="k5-chart__group" data-current="true">/)
  assert.match(out, />Ahora</)
  assert.match(out, /<th scope="row">20:00–21:00<\/th><td>Punta<\/td><td>0,209 €\/kWh<\/td>/)
  const saturday = html['precio de un sábado: todo valle, sin resumen ni leyenda']
  assert.equal((saturday.match(/k5-price__bar--valle/g) ?? []).length, 24)
  assert.doesNotMatch(saturday, /k5-price__summary|k5-chart__legend/)
  assert.match(html['precio por cuartos de hora, sin interacción'], /class="k5-chart k5-price k5-price--fine"/)
})

test('BatteryLevel: meter con todo el texto en aria-valuetext y tono por carga', () => {
  const full = html['batería cargando con capacidad y reserva']
  assert.match(full, /aria-valuetext="72\s%, 7,2 de 10 kWh, Cargando · 2,1 kW, Reserva: 20\s%"/)
  assert.match(full, /class="k5-battery k5-battery--high"/)
  assert.match(full, /style="--_at:0.2"/)
  const low = html['batería baja descargando, pequeña']
  assert.match(low, /class="k5-battery k5-battery--low k5-battery--sm"/)
  assert.match(low, /k5-battery__state--discharging">Descargando · 1,4 kW</)
  assert.match(html['batería media en reposo'], /k5-battery--medium[\s\S]*>En reposo</)
})

test('Heatmap: días de la semana, horas cada seis, escala y tabla', () => {
  const out = html['mapa de calor de la semana']
  assert.equal((out.match(/class="k5-heatmap__cell"/g) ?? []).length, 7 * 24)
  assert.match(out, /<div aria-hidden="true" class="k5-heatmap__rows"><span>L<\/span><span>M<\/span><span>X<\/span>/)
  assert.match(out, /<span>0 h<\/span><span><\/span>/)
  assert.match(out, /<th scope="row">lunes<\/th>/)
  assert.match(out, /<div aria-hidden="true" class="k5-heatmap__legend"><span>0,2 kWh<\/span>/)
  const own = html['mapa de calor propio con huecos y tono']
  assert.match(own, /k5-heatmap--tone-2/)
  assert.match(own, /class="k5-heatmap__cell k5-heatmap__cell--empty"/)
  assert.match(own, /title="2025, Mar: —"/)
})

test('iconos de energía: decorativos sin title, imagen con nombre con title', () => {
  assert.match(html['icono decorativo'], /^<svg aria-hidden="true" class="k5-energy-icon"/)
  assert.match(html['icono con nombre'], /role="img"[^>]*><title>Cargador<\/title>/)
})
