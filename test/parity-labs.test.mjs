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
