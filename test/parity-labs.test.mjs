// Labs (0.6): React y Vue generan el mismo HTML.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as RL from '@1k5-tech-es/grado-react/labs'
import * as VL from '@1k5-tech-es/grado-vue/labs'
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import { normalize } from './normalize.mjs'

const now = new Date('2026-10-16T10:30:00+02:00')
const vue = (render) => renderToString(createSSRApp({ render }))
const same = async (name, props, children) => {
  const react = renderToStaticMarkup(r(RL[name], props, ...(children ? [children] : [])))
  const html = await vue(() => h(VL[name], props, children ? () => children : undefined))
  assert.equal(normalize(html), normalize(react), name)
  return react
}

test('Amount: importe, energía escalada, variación coloreada y vacío', async () => {
  assert.match(await same('Amount', { value: 1234.5, unit: 'eur' }), /<data value="1234.5" class="k5-amount">1234,50\u00a0€<\/data>/)
  await same('Amount', { value: 12500, unit: 'kWh', scale: true })
  assert.match(await same('Amount', { value: -0.04, unit: 'percent', signed: true, colored: true }), /k5-amount--negative/)
  assert.match(await same('Amount', { value: null, unit: 'eur' }), />—</)
})

test('RelativeTime: texto, datetime y title', async () => {
  const html = await same('RelativeTime', { value: new Date(now.getTime() - 300_000), now })
  assert.match(
    html,
    /<time datetime="2026-10-16T08:25:00.000Z" title="16 de octubre de 2026[^"]*" class="k5-relative-time">hace 5 minutos<\/time>/i,
  )
})

test('RelativeTime en alemán con GradoProvider', async () => {
  const props = { value: new Date(now.getTime() - 300_000), now }
  const react = renderToStaticMarkup(r(R.GradoProvider, { locale: 'de-DE' }, r(RL.RelativeTime, props)))
  const html = await vue(() => h(V.GradoProvider, { locale: 'de-DE' }, () => h(VL.RelativeTime, props)))
  assert.equal(normalize(html), normalize(react))
  assert.match(react, />vor 5 Minuten</)
})

test('ScrollArea, VisuallyHidden y ThemeToggle', async () => {
  assert.match(
    await same('ScrollArea', { label: 'Historial', maxHeight: 120, orientation: 'both' }, 'x'),
    /role="region" aria-label="Historial" tabindex="0" class="k5-scroll-area k5-scroll-area--both" style="--_height:120px"/,
  )
  assert.match(await same('VisuallyHidden', { as: 'p' }, 'solo lectores'), /<p class="k5-sr-only">solo lectores<\/p>/)
  // En el servidor no se sabe lo guardado: sale «Sistema».
  assert.match(await same('ThemeToggle', {}), /aria-label="Tema"[\s\S]*aria-checked="true"[^>]*>Sistema/)
})

// ---------- Energía y ventas (0.6) ----------
const tariffs = [
  { id: 'fija', name: 'Precio fijo', energy: 0.145, power: 0.09 },
  { id: 'td', name: '2.0TD', energy: { punta: 0.21, llano: 0.14, valle: 0.09 }, power: { punta: 0.1, valle: 0.01 } },
  { id: 'nocturna', name: 'Nocturna', energy: { punta: 0.25, llano: 0.16, valle: 0.07 }, power: 0.095, monthly: 2 },
]
const consumption = { punta: 900, llano: 1100, valle: 1500 }

test('TariffComparison: la más barata marcada, cuánto más cuesta cada una y sin impuestos', async () => {
  const html = await same('TariffComparison', { tariffs, consumption, power: 4.6, title: 'Tu consumo con cada tarifa' })
  assert.match(
    html,
    /<tr data-cheapest="true"><th scope="row"><span class="k5-tariffs__name">Precio fijo<\/span><span class="k5-badge[^"]*"[^>]*>.*?Más barata/,
  )
  assert.match(html, /Sin impuestos · 3500\u00a0kWh/)
  assert.match(html, /4,08\u00a0€ más al año/)
  const taxed = await same('TariffComparison', {
    tariffs,
    consumption,
    power: 4.6,
    taxes: { electricityTax: 0.0511269632, vat: 0.21 },
    breakdown: false,
  })
  assert.match(taxed, /Con impuestos/)
  assert.doesNotMatch(taxed, />Energía</)
})

test('SignaturePad: vacía, dibujada y escrita, con campo oculto para el formulario', async () => {
  const empty = await same('SignaturePad', { label: 'Firma del titular', required: true, name: 'firma' })
  assert.match(empty, /role="img"/)
  assert.match(empty, /class="k5-sr-only" id="[^"]+-state">Sin firmar</)
  assert.match(empty, /<input type="hidden" name="firma" value=""/)
  const strokes = [
    [
      [40, 120],
      [80, 90],
      [120, 130],
    ],
  ]
  const drawn = await same('SignaturePad', { label: 'Firma', defaultValue: { strokes }, name: 'firma' })
  assert.match(drawn, /<path d="M40 120 Q80 90 100 110 L120 130"/)
  assert.match(drawn, />Firma dibujada</)
  assert.match(drawn, /name="firma" value="data:image\/svg\+xml;charset=utf-8,%3Csvg/)
  const typed = await same('SignaturePad', { label: 'Firma', defaultValue: { typed: 'Lucía Fernández' }, error: 'Firma la oferta' })
  assert.match(typed, /value="Lucía Fernández"/)
  assert.match(typed, /class="k5-field__error"[^>]*>Firma la oferta</)
  assert.match(typed, />Dibujar la firma</)
})

test('SolarForecast: resumen, real hasta ahora, tiempo y tabla oculta', async () => {
  const forecast = [0, 0, 0, 0, 0, 0, 0.2, 0.8, 1.6, 2.4, 3.1, 3.5, 3.6, 3.4, 2.9, 2.2, 1.4, 0.6, 0.1, 0, 0, 0, 0, 0]
  const actual = [0, 0, 0, 0, 0, 0, 0.3, 0.9, 1.8, 2.6, 3.3, 3.8, 3.9]
  const weather = forecast.map((_, i) => (i < 12 ? 'sun' : i < 16 ? 'partly' : 'cloud'))
  const html = await same('SolarForecast', { forecast, actual, weather, title: 'Producción de hoy' })
  assert.match(html, /Previsto <strong>25,8\u00a0kWh<\/strong>/)
  assert.match(html, /Producido <strong>16,6\u00a0kWh<\/strong> hasta las 13:00/)
  assert.match(html, /k5-forecast__status--above">9\u00a0% por encima de lo previsto/)
  assert.match(html, /<th scope="row">12:00–13:00<\/th><td>3,6\u00a0kWh<\/td><td>3,9\u00a0kWh<\/td><td>Nubes y claros<\/td>/)
  assert.match(html, /<th scope="row">13:00–14:00<\/th><td>3,4\u00a0kWh<\/td><td>—<\/td>/)
  assert.equal((html.match(/k5-forecast__weather-slot"><svg/g) ?? []).length, 8)
  await same('SolarForecast', { forecast, title: 'Mañana', interactive: false })
})
