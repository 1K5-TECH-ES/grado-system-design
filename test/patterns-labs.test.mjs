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
