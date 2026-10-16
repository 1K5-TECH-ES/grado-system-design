// Gráficos de 0.3: React y Vue generan el mismo HTML con las mismas props.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import { normalize } from './normalize.mjs'

const week = [
  { dia: 'Lun', produccion: 31.2, consumo: 18.4 },
  { dia: 'Mar', produccion: 28.6, consumo: 17.9 },
  { dia: 'Mié', produccion: 12.3, consumo: 19.5 },
  { dia: 'Jue', produccion: 25.1, consumo: 16.2 },
  { dia: 'Vie', produccion: 33.8, consumo: 21.0 },
  { dia: 'Sáb', produccion: 34.5, consumo: 24.3 },
  { dia: 'Dom', produccion: 30.9, consumo: 22.7 },
]
const series = [
  { key: 'produccion', label: 'Producción' },
  { key: 'consumo', label: 'Consumo' },
]
const same = (name, props) => [r(R[name], props), () => h(V[name], props)]

const SCENARIOS = {
  'sparkline decorativa con área': same('Sparkline', { data: [4, 6, 5, 9, 7, 11], tone: 'success', area: true }),
  'sparkline con nombre y datos iguales': same('Sparkline', { data: [3, 3, 3], label: 'Consumo estable', height: 24, tone: 'neutral' }),
  'sparkline vacía': same('Sparkline', { data: [] }),
  'gráfico de líneas con dos series': same('LineChart', {
    title: 'Producción y consumo',
    description: 'kWh por día · últimos 7 días',
    data: week,
    categoryKey: 'dia',
    categoryLabel: 'Día',
    series,
    unit: 'kWh',
    height: 200,
  }),
  'gráfico de área con una serie y tono': same('AreaChart', {
    data: week,
    categoryKey: 'dia',
    series: [{ key: 'produccion', label: 'Producción', tone: 2 }],
    unit: 'kWh',
    decimals: 0,
  }),
  'gráfico de líneas sin área aunque sea AreaChart': same('AreaChart', { data: week.slice(0, 2), categoryKey: 'dia', series, area: false }),
  'gráfico de líneas sin interacción': same('LineChart', {
    data: week.slice(0, 3),
    categoryKey: 'dia',
    series,
    unit: 'kWh',
    interactive: false,
  }),
  'gráfico de barras sin interacción y con título': same('BarChart', {
    title: 'Semanas',
    data: week.slice(0, 2),
    categoryKey: 'dia',
    series,
    interactive: false,
  }),
  'donut con segmentos y centro': same('Donut', {
    label: 'Energía producida',
    segments: [
      { label: 'Autoconsumo', value: 13.6 },
      { label: 'Excedentes', value: 6.4 },
    ],
    unit: 'kWh',
    centerValue: '68 %',
    centerLabel: 'Autoconsumo',
  }),
  'donut de un solo valor, pequeño': same('Donut', { value: 6.8, max: 10, label: 'Cobertura', unit: 'kWh', size: 'sm', tone: 2 }),
  'donut grande con tres segmentos y sin leyenda': same('Donut', {
    segments: [
      { label: 'Placas', value: 1, tone: 2 },
      { label: 'Batería', value: 1, tone: 1 },
      { label: 'Red', value: 1, tone: 5 },
    ],
    size: 'lg',
    legend: false,
  }),
  'medidor de barra con umbrales': same('Meter', { value: 72, low: 20, high: 50, optimum: 100, label: 'Carga de batería', unit: '%' }),
  'medidor por segmentos en zona mala': same('Meter', {
    value: 15,
    low: 20,
    high: 50,
    optimum: 100,
    label: 'Carga de batería',
    unit: '%',
    variant: 'segments',
    segments: 8,
  }),
  'medidor sin umbrales ni valor visible': same('Meter', { value: 4.2, max: 6, label: 'Cobertura solar', unit: 'kWh', showValue: false }),
  'flujo de energía completo': same('EnergyFlow', { solar: 5.8, home: 2.1, battery: 1.6, grid: -2.1, batteryLevel: 72 }),
  'flujo de energía sin batería ni red, de noche': same('EnergyFlow', { solar: 0, home: 0.9, title: 'Vivienda de Lucía Fernández' }),
  'flujo de energía descargando e importando': same('EnergyFlow', { solar: 0.4, home: 3.2, battery: -1.8, grid: 1, batteryLevel: 35 }),
  'kpi con tendencia': [
    r(R.Kpi, { label: 'Producción', value: '31,2 kWh', change: 8.4, previous: '28,8 kWh', trend: [22, 25, 24, 28, 27, 30, 31] }),
    () => h(V.Kpi, { label: 'Producción', value: '31,2 kWh', change: 8.4, previous: '28,8 kWh', trend: [22, 25, 24, 28, 27, 30, 31] }),
  ],
  'kpi con tendencia mala y seleccionable': [
    r(R.Kpi, { label: 'Consumo de red', value: '6,4 kWh', change: 12, better: 'lower', selectable: true, trend: [4, 5, 6, 6.4] }),
    () => h(V.Kpi, { label: 'Consumo de red', value: '6,4 kWh', change: 12, better: 'lower', selectable: true, trend: [4, 5, 6, 6.4] }),
  ],
}

const html = {}
for (const [name, [reactTree, vueRender]] of Object.entries(SCENARIOS)) {
  test(`mismo HTML en React y Vue: ${name}`, async () => {
    const react = normalize(renderToStaticMarkup(reactTree))
    const vue = normalize(await renderToString(createSSRApp({ render: vueRender })))
    html[name] = react
    assert.equal(vue, react)
  })
}

test('la sparkline es decorativa sin label y una imagen con label; el último punto va marcado', () => {
  const plain = html['sparkline decorativa con área']
  assert.match(plain, /^<span aria-hidden="true" class="k5-sparkline k5-sparkline--success" style="--_height:32px">/)
  assert.match(plain, /class="k5-sparkline__area"/)
  assert.match(plain, /<span class="k5-sparkline__dot" style="left:100%;top:0%">/)
  const flat = html['sparkline con nombre y datos iguales']
  assert.match(flat, /aria-label="Consumo estable"[^>]*role="img"/)
  assert.match(flat, /d="M0 50 L50 50 L100 50"/)
  assert.doesNotMatch(html['sparkline vacía'], /k5-sparkline__dot|<path/)
})

test('el gráfico de líneas dibuja un punto por día, marca el último y lleva tabla y leyenda', () => {
  const out = html['gráfico de líneas con dos series']
  const lines = [...out.matchAll(/class="k5-chart__line" d="([^"]+)"/g)].map((m) => m[1])
  assert.equal(lines.length, 2)
  for (const d of lines) assert.equal(d.split(/[ML]/).filter((p) => p.trim()).length, 7)
  assert.equal([...out.matchAll(/k5-chart__point /g)].length, 2)
  assert.equal([...out.matchAll(/class="k5-chart__column"/g)].length, 7)
  // Interactivo por defecto: grupo con foco y pista para el teclado, sin el title nativo de cada columna.
  const body = out.match(/<div[^>]*class="k5-chart__body"[^>]*>/)[0]
  for (const attribute of [/role="group"/, /tabindex="0"/, /aria-labelledby="[^"]+-title"/, /aria-describedby="[^"]+-hint"/])
    assert.match(body, attribute)
  assert.doesNotMatch(out, /title="Lun/)
  assert.match(out, /Usa las flechas para recorrer los datos\./)
  assert.match(out, /<th scope="row">Lun<\/th><td>31,2 kWh<\/td><td>18,4 kWh<\/td>/)
  assert.match(out, /<th scope="col">Día<\/th>/)
  assert.match(out, /k5-chart__swatch--line/)
  assert.doesNotMatch(out, /k5-chart__area/)
  const area = html['gráfico de área con una serie y tono']
  assert.match(area, /class="k5-chart__area"/)
  assert.match(area, /k5-chart__series--2/)
  assert.doesNotMatch(area, /k5-chart__legend/)
  assert.doesNotMatch(html['gráfico de líneas sin área aunque sea AreaChart'], /k5-chart__area/)
  // Sin interacción, el cuerpo vuelve a ser una imagen oculta con title nativo en cada columna.
  const still = html['gráfico de líneas sin interacción']
  assert.match(still, /<div aria-hidden="true" class="k5-chart__body">/)
  assert.doesNotMatch(still, /tabindex|aria-live/)
  assert.match(still, /title="Lun · Producción: /)
})

test('el donut resume los porcentajes en su nombre y los detalla en una lista oculta', () => {
  const out = html['donut con segmentos y centro']
  assert.match(out, /aria-label="Energía producida: Autoconsumo 68\s%, Excedentes 32\s%" class="k5-donut__chart" role="img"/)
  assert.match(out, /<li>Autoconsumo: 13,6 kWh \(68\s%\)<\/li><li>Excedentes: 6,4 kWh \(32\s%\)<\/li>/)
  assert.equal([...out.matchAll(/k5-donut__segment /g)].length, 2)
  assert.match(out, /<span class="k5-donut__value">68 %<\/span><span class="k5-donut__label">Autoconsumo<\/span>/)
  const single = html['donut de un solo valor, pequeño']
  assert.match(single, /aria-label="Cobertura: 68\s%"/)
  assert.match(single, /<li>Cobertura: 68\s% \(6,8 de 10 kWh\)<\/li>/)
  assert.match(single, /k5-donut k5-donut--sm/)
  assert.doesNotMatch(single, /k5-donut__legend/)
  // Tres tercios: los porcentajes suman 100.
  assert.match(html['donut grande con tres segmentos y sin leyenda'], /Placas 34\s%, Batería 33\s%, Red 33\s%/)
})

test('el medidor expone role meter con sus valores y el tono sale de low, high y optimum', () => {
  const bar = html['medidor de barra con umbrales']
  assert.match(
    bar,
    /aria-label="Carga de batería" aria-valuemax="100" aria-valuemin="0" aria-valuenow="72" aria-valuetext="72 %" class="k5-meter k5-meter--good" role="meter"/,
  )
  assert.match(bar, /<span class="k5-meter__fill" style="width:72%">/)
  const segments = html['medidor por segmentos en zona mala']
  assert.match(segments, /k5-meter--poor k5-meter--segments/)
  assert.equal([...segments.matchAll(/class="k5-meter__segment[ "]/g)].length, 8)
  assert.equal([...segments.matchAll(/k5-meter__segment--on/g)].length, 1)
  const plain = html['medidor sin umbrales ni valor visible']
  assert.match(plain, /k5-meter--neutral/)
  assert.doesNotMatch(plain, /k5-meter__value/)
  assert.match(plain, /aria-valuetext="4,2 kWh"/)
})

test('el flujo de energía resume cada nodo y marca el sentido de cada línea', () => {
  const out = html['flujo de energía completo']
  assert.match(
    out,
    /aria-label="Flujo de energía\. Placas: 5,8 kW · Produciendo\. Red: 2,1 kW · Exportando\. Casa: 2,1 kW · Consumiendo\. Batería: 1,6 kW · Cargando · Carga: 72\s%"/,
  )
  assert.match(out, /k5-energy__line--down k5-energy__line--solar/)
  assert.match(out, /k5-energy__line--grid k5-energy__line--left/)
  assert.match(out, /k5-energy__line--home k5-energy__line--right/)
  assert.match(out, /k5-energy__line--battery k5-energy__line--down/)
  assert.equal([...out.matchAll(/k5-energy__arrow/g)].length, 4)
  assert.equal([...out.matchAll(/<li>/g)].length, 4)
  assert.match(out, /<span class="k5-energy__state">Cargando<\/span><span class="k5-energy__level">72\s%<\/span>/)
  const night = html['flujo de energía sin batería ni red, de noche']
  assert.match(night, /k5-energy--no-battery/)
  assert.doesNotMatch(night, /k5-energy__node--battery|k5-energy__node--grid/)
  assert.match(night, /k5-energy__line--off k5-energy__line--solar/)
  assert.match(night, /<figcaption class="k5-energy__title">Vivienda de Lucía Fernández<\/figcaption>/)
  assert.equal([...night.matchAll(/k5-energy__arrow/g)].length, 1)
  const evening = html['flujo de energía descargando e importando']
  assert.match(evening, /k5-energy__line--battery k5-energy__line--up/)
  assert.match(evening, /k5-energy__line--grid k5-energy__line--right/)
  assert.match(evening, /Batería: 1,8 kW · Descargando · Carga: 35\s%/)
  assert.match(evening, /Red: 1 kW · Importando/)
})

test('el kpi con trend pinta una sparkline decorativa del color de la variación', () => {
  assert.match(html['kpi con tendencia'], /<span aria-hidden="true" class="k5-kpi__trend k5-sparkline k5-sparkline--success"/)
  assert.match(html['kpi con tendencia mala y seleccionable'], /k5-sparkline--danger/)
})
