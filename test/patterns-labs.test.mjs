// Labs (0.6): importes, energía, fechas relativas, tema y atajos de @1k5-tech-es/grado/labs.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatAmount,
  formatDateTime,
  formatEnergy,
  formatEuro,
  formatPower,
  formatRelative,
  hotkeyLabel,
  isTypingTarget,
  matchesHotkey,
  parseHotkey,
  relativeRefresh,
  resolveThemeMode,
  themeScript,
} from '@1k5-tech-es/grado/labs'

const NBSP = ' '
const clean = (text) => text.replaceAll(' ', ' ').replaceAll(' ', ' ')

test('euros: decimales, miles, signo y valores vacíos', () => {
  assert.equal(clean(formatEuro(1234.5)), '1234,50 €')
  assert.equal(clean(formatEuro(1234.5, { grouping: 'always' })), '1.234,50 €')
  assert.equal(clean(formatEuro(11840, { decimals: 0 })), '11.840 €')
  assert.equal(clean(formatEuro(12, { signed: true })), '+12,00 €')
  assert.equal(clean(formatEuro(1234.5, { locale: 'en-GB' })), '€1,234.50')
  for (const empty of [null, undefined, Number.NaN]) assert.equal(formatEuro(empty), '')
})

test('energía y potencia: unidad, escala, pico y espacio duro', () => {
  assert.equal(formatEnergy(7.2), `7,2${NBSP}kWh`)
  assert.equal(clean(formatEnergy(12500, { scale: true })), '12,5 MWh')
  assert.equal(clean(formatEnergy(12500)), '12.500 kWh')
  assert.equal(clean(formatEnergy(2_400_000, { scale: true })), '2,4 GWh')
  assert.equal(clean(formatEnergy(800, { unit: 'MWh', decimals: 2 })), '0,8 MWh')
  assert.equal(clean(formatPower(6.4, { peak: true })), '6,4 kWp')
  assert.equal(clean(formatPower(1500, { scale: true })), '1,5 MW')
  assert.equal(clean(formatPower(-2.1, { signed: true })), '-2,1 kW')
})

test('formatAmount reparte por unidad con los decimales de cada una', () => {
  assert.equal(clean(formatAmount(1234.5, { unit: 'eur' })), '1234,50 €')
  assert.equal(clean(formatAmount(7.25, { unit: 'kWh' })), '7,3 kWh')
  assert.equal(clean(formatAmount(6.4, { unit: 'kWp' })), '6,4 kWp')
  assert.equal(clean(formatAmount(0.123, { unit: 'percent' })), '12 %')
  assert.equal(clean(formatAmount(-0.04, { unit: 'percent', signed: true })), '-4 %')
  assert.equal(clean(formatAmount(3.14159)), '3,14')
  assert.equal(formatAmount(null, { unit: 'eur' }), '')
})

test('fechas relativas: ahora, minutos, ayer, futuro y fecha pasada la semana', () => {
  const now = new Date('2026-10-16T10:30:00+02:00')
  const at = (seconds) => new Date(now.getTime() + seconds * 1000)
  assert.equal(formatRelative(at(-30), { now }), 'ahora')
  assert.equal(formatRelative(at(-300), { now }), 'hace 5 minutos')
  assert.equal(formatRelative(at(-7200), { now }), 'hace 2 horas')
  assert.equal(formatRelative(at(-86_400 * 1.2), { now }), 'ayer')
  assert.equal(formatRelative(at(7200), { now }), 'dentro de 2 horas')
  assert.equal(formatRelative(at(-86_400 * 10), { now }), '6 oct')
  assert.equal(formatRelative(at(-86_400 * 400), { now }), '11 sept 2025')
  assert.equal(formatRelative(at(-86_400 * 10), { now, max: 30 * 86_400 }), 'la semana pasada')
  assert.equal(formatRelative(at(-3600), { now, locale: 'en-GB' }), '1 hour ago')
  assert.equal(formatRelative('no es una fecha', { now }), '')
  assert.match(formatDateTime(now), /^16 de octubre de 2026/)
  assert.equal(relativeRefresh(at(-300), now), 60_000)
  assert.equal(relativeRefresh(at(-7200), now), 3_600_000)
  assert.equal(relativeRefresh(at(-86_400 * 3), now), null)
})

test('tema: la elección y la preferencia del sistema; el script del <head> funciona', () => {
  assert.equal(resolveThemeMode('dark', false), 'dark')
  assert.equal(resolveThemeMode('light', true), 'light')
  assert.equal(resolveThemeMode('system', true), 'dark')
  assert.equal(resolveThemeMode('system', false), 'light')
  const run = (stored, prefersDark) => {
    const classes = new Set()
    const env = {
      localStorage: { getItem: () => stored },
      matchMedia: () => ({ matches: prefersDark }),
      document: { documentElement: { classList: { toggle: (name, on) => (on ? classes.add(name) : classes.delete(name)) } } },
    }
    new Function(...Object.keys(env), themeScript('k5-mode'))(...Object.values(env))
    return classes.has('dark')
  }
  assert.equal(run('dark', false), true)
  assert.equal(run('light', true), false)
  assert.equal(run(null, true), true)
  assert.equal(run(null, false), false)
})

test('atajos: parse, coincidencia, campos de texto y etiqueta', () => {
  assert.deepEqual(parseHotkey('mod+k'), { key: 'k', mod: true, ctrl: false, meta: false, alt: false, shift: false })
  assert.deepEqual(parseHotkey('shift+esc').key, 'escape')
  assert.throws(() => parseHotkey('super+k'), /Atajo no válido/)
  const key = (k, mods = {}) => ({ key: k, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mods })
  assert.equal(matchesHotkey(key('k', { ctrlKey: true }), 'mod+k'), true)
  assert.equal(matchesHotkey(key('K', { metaKey: true }), 'mod+k'), true)
  assert.equal(matchesHotkey(key('k'), 'mod+k'), false)
  assert.equal(matchesHotkey(key('k', { ctrlKey: true, shiftKey: true }), 'mod+k'), false)
  assert.equal(matchesHotkey(key('?', { shiftKey: true }), '?'), true)
  assert.equal(matchesHotkey(key('g', { altKey: true }), 'g'), false)
  assert.equal(isTypingTarget({ tagName: 'INPUT', type: 'text' }), true)
  assert.equal(isTypingTarget({ tagName: 'INPUT', type: 'checkbox' }), false)
  assert.equal(isTypingTarget({ tagName: 'DIV', isContentEditable: true }), true)
  assert.equal(isTypingTarget({ tagName: 'BUTTON' }), false)
  assert.equal(hotkeyLabel('mod+k'), 'Ctrl K')
  assert.equal(hotkeyLabel('mod+shift+p', { mac: true }), '⌘ ⇧ P')
  assert.equal(hotkeyLabel('esc'), 'Esc')
})

test('tarifas: energía por periodo o precio único, potencia, cuota e impuestos', async () => {
  const { tariffCost, compareTariffs } = await import('@1k5-tech-es/grado/labs')
  const consumption = { punta: 900, llano: 1100, valle: 1500 }
  assert.deepEqual(tariffCost({ name: 'Fija', energy: 0.145, power: 0.09 }, { consumption, power: 4.6 }), {
    energy: 507.5,
    power: 151.11,
    fixed: 0,
    taxes: 0,
    total: 658.61,
  })
  const td = { name: '2.0TD', energy: { punta: 0.21, llano: 0.14, valle: 0.09 }, power: { punta: 0.1, valle: 0.01 }, monthly: 1 }
  assert.deepEqual(tariffCost(td, { consumption, power: { punta: 4.6, valle: 6.9 }, days: 365 }), {
    energy: 478,
    power: 193.08,
    fixed: 12,
    taxes: 0,
    total: 683.09,
  })
  // Impuesto eléctrico sobre energía y potencia; IVA sobre todo.
  const taxed = tariffCost({ name: 'Fija', energy: 0.1, power: 0 }, { consumption: 1000, taxes: { electricityTax: 0.05, vat: 0.21 } })
  assert.deepEqual(taxed, { energy: 100, power: 0, fixed: 0, taxes: 27.05, total: 127.05 })
  assert.throws(() => tariffCost(td, { consumption: 3500 }), /por periodos/)
  const compared = compareTariffs(
    [
      { id: 'a', name: 'A', energy: 0.2, power: 0 },
      { id: 'b', name: 'B', energy: 0.1, power: 0 },
    ],
    { consumption: 1000 },
  )
  assert.equal(compared.cheapest, 'b')
  assert.deepEqual(
    compared.rows.map((row) => [row.id, row.delta, row.monthly, row.ratio]),
    [
      ['a', 100, 16.67, 1],
      ['b', 0, 8.33, 0.5],
    ],
  )
})

test('firma: vacía, punto del puntero, trazo suave y SVG exportable', async () => {
  const { isSignatureEmpty, signaturePoint, signaturePath, signatureSvg, signatureDataUrl } = await import('@1k5-tech-es/grado/labs')
  assert.equal(isSignatureEmpty(null), true)
  assert.equal(isSignatureEmpty({ strokes: [[]] }), true)
  assert.equal(isSignatureEmpty({ typed: '  ' }), true)
  assert.equal(isSignatureEmpty({ strokes: [[[1, 2]]] }), false)
  assert.deepEqual(signaturePoint({ left: 10, top: 10, width: 300, height: 100 }, 160, 60), [300, 100])
  assert.deepEqual(signaturePoint({ left: 0, top: 0, width: 300, height: 100 }, 400, -5), [600, 0])
  assert.equal(signaturePath([[5, 5]]), 'M5 5 l0.1 0')
  assert.equal(
    signaturePath([
      [1, 2],
      [5, 6],
      [9, 4],
      [12, 8],
    ]),
    'M1 2 Q5 6 7 5 Q9 4 10.5 6 L12 8',
  )
  const svg = signatureSvg({ typed: 'Ana <López>' })
  assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 600 200"/)
  assert.match(svg, /font-style="italic"[^>]*>Ana &lt;López&gt;<\/text>/)
  assert.match(
    signatureSvg({
      strokes: [
        [
          [1, 1],
          [2, 2],
        ],
      ],
    }),
    /stroke-linecap="round"[^>]*><path d="M1 1 L2 2"\/>/,
  )
  assert.ok(signatureDataUrl({ typed: 'Ana' }).startsWith('data:image/svg+xml;charset=utf-8,%3Csvg'))
})

test('previsión solar: total, real hasta la última hora con dato y desviación', async () => {
  const { forecastSummary, slotLabel } = await import('@1k5-tech-es/grado/labs')
  const forecast = [0, 1, 2, 3, 2, 1]
  assert.deepEqual(forecastSummary({ forecast }), {
    done: 0,
    forecastTotal: 9,
    actualTotal: 0,
    expectedSoFar: 0,
    deviation: null,
    status: null,
  })
  const above = forecastSummary({ forecast, actual: [0, 1.2, 2.4] })
  assert.equal(above.done, 3)
  assert.equal(Math.round(above.deviation * 100), 20)
  assert.equal(above.status, 'above')
  assert.equal(forecastSummary({ forecast, actual: [0, 0.97, 2.02, null] }).status, 'on-track')
  assert.equal(forecastSummary({ forecast, actual: [0, 0.5, 1] }).status, 'below')
  assert.equal(slotLabel(0), '00:00–01:00')
  assert.equal(slotLabel(23), '23:00–00:00')
  assert.equal(slotLabel(5, 96), '01:15–01:30')
})

test('textos de labs: mismas claves en los tres idiomas, aparte de los principales', async () => {
  const { LABS_MESSAGES, labsMessagesFor } = await import('@1k5-tech-es/grado/labs')
  const { MESSAGES } = await import('@1k5-tech-es/grado/messages')
  const keys = Object.keys(LABS_MESSAGES['es-ES']).sort()
  for (const locale of ['de-DE', 'en-GB']) assert.deepEqual(Object.keys(LABS_MESSAGES[locale]).sort(), keys, locale)
  // Una app que no usa labs no descarga sus textos.
  for (const key of keys) assert.ok(!(key in MESSAGES['es-ES']), key)
  assert.equal(labsMessagesFor('de-AT').tariffCheapest, 'Günstigster')
  assert.equal(labsMessagesFor('fr-FR').tariffCheapest, 'Más barata')
  assert.equal(labsMessagesFor('es-ES', { tariffCheapest: 'La mejor', close: 'x' }).tariffCheapest, 'La mejor')
  assert.ok(!('close' in labsMessagesFor('es-ES', { close: 'x' })))
})
