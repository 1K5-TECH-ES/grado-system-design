// Formularios (0.4): la validación que comparten los adaptadores de react-hook-form y VeeValidate.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkValue, errorSummaryTitle, fieldId, isEmptyValue } from '@1k5-tech-es/grado/patterns'
import { MESSAGES } from '@1k5-tech-es/grado/messages'

test('qué cuenta como vacío para un campo obligatorio', () => {
  for (const value of ['', '   ', null, undefined, [], false, { start: '', end: '' }]) assert.ok(isEmptyValue(value), JSON.stringify(value))
  for (const value of ['a', 0, 8.4, ['md'], true, { start: '2026-10-01', end: '' }, { id: 'x' }])
    assert.ok(!isEmptyValue(value), JSON.stringify(value))
})

test('checkValue: obligatorio, luego formato, luego las comprobaciones en orden', async () => {
  const max = (value) => value <= 15 || 'Como mucho 15 kWp'
  const slow = async (value) => (value === 13 ? 'El 13 no' : true)
  assert.equal(await checkValue('', {}, { required: true }), 'Este campo es obligatorio')
  assert.equal(await checkValue('', {}, { required: true, messages: MESSAGES['en-GB'] }), 'This field is required')
  assert.equal(await checkValue('', {}), '')
  assert.equal(
    await checkValue('12345678A', {}, { required: true, formatError: 'La letra del DNI no coincide.' }),
    'La letra del DNI no coincide.',
  )
  assert.equal(await checkValue(20, {}, { checks: [max, slow] }), 'Como mucho 15 kWp')
  assert.equal(await checkValue(13, {}, { checks: [max, slow] }), 'El 13 no')
  assert.equal(await checkValue(8.4, {}, { checks: max }), '')
  // Las comprobaciones reciben todos los valores, para comparar campos.
  const same = (value, values) => value === values.iban || 'No coincide con el IBAN'
  assert.equal(await checkValue('ES91', { iban: 'ES92' }, { checks: same }), 'No coincide con el IBAN')
  // Como en react-hook-form, false es «no vale» con un texto genérico; null y undefined, «vale».
  assert.equal(await checkValue('x', {}, { checks: [() => null, () => undefined, () => true] }), '')
  assert.equal(await checkValue('x', {}, { checks: (value) => value.length > 3 }), 'El valor no es válido')
})

test('título del resumen e id de cada campo', () => {
  assert.equal(errorSummaryTitle(1), 'Revisa 1 campo antes de continuar')
  assert.equal(errorSummaryTitle(3), 'Revisa 3 campos antes de continuar')
  assert.equal(errorSummaryTitle(2, MESSAGES['de-DE']), 'Bitte prüfe 2 Felder, bevor du fortfährst')
  assert.equal(errorSummaryTitle(1, MESSAGES['en-GB']), 'Check 1 field before you continue')
  assert.equal(fieldId('k5-form-1', 'titular.nif'), 'k5-form-1-titular-nif')
  assert.equal(fieldId('k5-form-1', 'lineas[0].kwp'), 'k5-form-1-lineas-0-kwp')
})
