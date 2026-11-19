// Campos especiales (grupo «entradas»): horas, teléfonos, NIF e IBAN con casos reales.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MESSAGES } from '@1k5-tech-es/grado/messages'
import {
  caretAfter,
  formatIban,
  formatPhone,
  formatTime,
  ibanError,
  isValidIban,
  isValidNif,
  isValidPhone,
  nearestTime,
  nifError,
  nifKind,
  normalizeIban,
  normalizeNif,
  normalizeTime,
  parsePhone,
  parseTime,
  phoneCountryOf,
  phoneError,
  PHONE_COUNTRIES,
  significantCount,
  timeError,
  timeSlots,
  toE164,
} from '@1k5-tech-es/grado/patterns'

test('parseTime entiende las formas habituales de escribir una hora', () => {
  for (const [text, time] of [
    ['9', '09:00'],
    ['09', '09:00'],
    ['930', '09:30'],
    ['0930', '09:30'],
    ['9:30', '09:30'],
    ['09.30', '09:30'],
    ['9h30', '09:30'],
    [' 17:05 ', '17:05'],
    ['0', '00:00'],
    ['2359', '23:59'],
  ])
    assert.equal(normalizeTime(text), time, text)
  for (const text of ['', '24', '2400', '9:60', '930a', '12345', 'nueve', '9:3']) assert.equal(parseTime(text), null, text)
  assert.equal(parseTime('9:30'), 570)
  assert.equal(formatTime(570), '09:30')
  assert.equal(formatTime(null), '')
})

test('timeSlots, nearestTime y timeError', () => {
  assert.deepEqual(timeSlots('08:00', '09:00'), ['08:00', '08:15', '08:30', '08:45', '09:00'])
  assert.deepEqual(timeSlots('08:00', '10:00', 60), ['08:00', '09:00', '10:00'])
  assert.equal(timeSlots().length, 96)
  assert.deepEqual(timeSlots('20:00', '08:00'), [])
  const slots = timeSlots('08:00', '20:00', 15)
  assert.equal(slots[nearestTime(slots, '09:37')], '09:30')
  assert.equal(slots[nearestTime(slots, '09:38')], '09:45')
  assert.equal(slots[nearestTime(slots, '6')], '08:00')
  assert.equal(nearestTime(slots, ''), -1)
  assert.equal(timeError(''), '')
  assert.equal(timeError('930', { min: '08:00', max: '20:00' }), '')
  assert.equal(timeError('25:00'), 'Escribe la hora como 09:30.')
  assert.equal(timeError('7', { min: '8' }), 'Elige una hora a partir de las 08:00.')
  assert.equal(timeError('21', { max: '20:00' }), 'Elige una hora hasta las 20:00.')
  assert.equal(timeError('21', { max: '20:00' }, MESSAGES['de-DE']), 'Wähle eine Uhrzeit bis 20:00 Uhr.')
})

test('teléfonos: formato al escribir, E.164 y validación', () => {
  assert.equal(formatPhone('612345678'), '612 345 678')
  assert.equal(formatPhone('6123'), '612 3')
  assert.equal(formatPhone('612 34-56 78'), '612 345 678')
  assert.equal(toE164('612 345 678'), '+34612345678')
  assert.equal(toE164(''), '')
  assert.equal(formatPhone('+34612345678'), '612 345 678')
  assert.equal(formatPhone('0612345678', 'FR'), '06 12 34 56 78')
  assert.equal(toE164('06 12 34 56 78', 'FR'), '+33612345678')
  assert.equal(toE164('07400 123456', 'GB'), '+447400123456')
  assert.equal(toE164('06 1234 5678', 'IT'), '+390612345678', 'Italia conserva el 0 de los fijos')
  assert.deepEqual(parsePhone('+351 912 345 678', 'ES'), { country: 'PT', digits: '912345678' })
  assert.deepEqual(parsePhone('0049 151 23456789'), { country: 'DE', digits: '15123456789' })
  assert.equal(phoneCountryOf('+44 7400 123456'), 'GB')
  assert.equal(phoneCountryOf('612345678'), null)
  // España: 9 cifras; móviles por 6 o 7, fijos por 8 o 9.
  for (const valid of ['612345678', '712345678', '912345678', '+34 876 543 210']) assert.ok(isValidPhone(valid, 'ES'), valid)
  assert.equal(phoneError('61234567'), 'Un teléfono español tiene 9 cifras.')
  assert.equal(phoneError('6123456789'), 'Un teléfono español tiene 9 cifras.')
  assert.equal(phoneError('512345678'), 'Un teléfono español empieza por 6, 7, 8 o 9.')
  assert.equal(phoneError(''), '')
  assert.ok(isValidPhone('912345678', 'PT'))
  assert.ok(!isValidPhone('91234567', 'PT'))
  assert.ok(isValidPhone('06 12 34 56 78', 'FR'))
  assert.ok(isValidPhone('0151 23456789', 'DE'))
  assert.ok(isValidPhone('312 345 6789', 'IT'))
  assert.ok(isValidPhone('07400 123456', 'GB'))
  assert.equal(phoneError('12', 'GB'), 'El número no tiene una longitud válida para ese país.')
  assert.ok(!isValidPhone(''))
  assert.deepEqual(
    PHONE_COUNTRIES.map((c) => `${c.code} ${c.dial}`),
    ['ES +34', 'PT +351', 'FR +33', 'DE +49', 'IT +39', 'GB +44'],
  )
})

test('NIF: DNI, NIE y CIF con su control', () => {
  assert.equal(normalizeNif(' 12.345.678-z '), '12345678Z')
  assert.equal(normalizeNif('ESB12345674'), 'B12345674')
  assert.deepEqual(['12345678Z', 'X1234567L', 'B12345674', 'Q2826000H', '?'].map(nifKind), ['dni', 'nie', 'cif', 'cif', null])
  // Válidos.
  for (const nif of [
    '12345678Z',
    '00000000T',
    'X1234567L',
    'Y1234567X',
    'Z1234567R',
    'B12345674',
    'A58818501',
    'Q2826000H',
    'G12345674',
    'G1234567D',
  ])
    assert.ok(isValidNif(nif), nif)
  // Inválidos, con su mensaje.
  assert.equal(nifError('12345678A'), 'La letra del DNI no coincide.')
  assert.equal(nifError('1234567Z'), 'El DNI tiene 8 cifras y una letra.')
  assert.equal(nifError('X1234567A'), 'La letra del NIE no coincide.')
  assert.equal(nifError('X12345678'), 'El NIE tiene una letra (X, Y o Z), 7 cifras y otra letra.')
  assert.equal(nifError('B12345675'), 'El carácter de control del CIF no coincide.')
  assert.equal(nifError('B1234567D'), 'El carácter de control del CIF no coincide.', 'una sociedad limitada lleva número')
  assert.equal(nifError('Q28260008'), 'El carácter de control del CIF no coincide.', 'un organismo público lleva letra')
  assert.equal(nifError('B123'), 'El CIF tiene una letra, 7 cifras y un carácter de control.')
  assert.equal(nifError('I12345678'), 'Escribe un DNI, NIE o CIF.')
  assert.equal(nifError(''), '')
  assert.equal(nifError('12345678A', MESSAGES['en-GB']), 'The DNI letter does not match.')
  assert.ok(!isValidNif(''))
})

test('IBAN: formato de cuatro en cuatro, longitud por país y módulo 97', () => {
  assert.equal(normalizeIban('es91 2100-0418 4502 0005 1332'), 'ES9121000418450200051332')
  assert.equal(formatIban('ES9121000418450200051332'), 'ES91 2100 0418 4502 0005 1332')
  assert.equal(formatIban('es91210'), 'ES91 210')
  for (const iban of [
    'ES9121000418450200051332',
    'ES7620770024003102575766',
    'DE89370400440532013000',
    'GB29NWBK60161331926819',
    'PT50000201231234567890154',
  ])
    assert.ok(isValidIban(iban), iban)
  assert.ok(!isValidIban('ES9121000418450200051333'), 'un dígito cambiado')
  assert.equal(ibanError('ES9121000418450200051333'), 'Los dígitos de control del IBAN no coinciden. Revisa las cifras.')
  assert.equal(ibanError('ES91210004184502000513'), 'Un IBAN de ES tiene 24 caracteres.')
  assert.equal(ibanError('2100 0418'), 'El IBAN empieza por el código del país y dos cifras: ES91…')
  assert.equal(ibanError('ZZ12345'), 'Un IBAN tiene entre 15 y 34 caracteres.')
  assert.equal(ibanError(''), '')
  assert.ok(!isValidIban(''))
})

test('el cursor se queda detrás de la misma cifra al reformatear', () => {
  assert.equal(significantCount('612 34', 5), 4)
  assert.equal(caretAfter('612 345 678', 4), 5)
  assert.equal(caretAfter('612 345 678', 3), 3)
  assert.equal(caretAfter('ES91 2100', 5), 6)
  assert.equal(caretAfter('abc', 0), 0)
  assert.equal(caretAfter('abc', 9), 3)
})

// Fechas escritas (0.9): DatePicker natural. Jueves 19 de noviembre de 2026.
test('dateSuggestions: palabras, días de la semana, plazos y fechas en tres idiomas', async () => {
  const { dateSuggestions, shortDateLabel } = await import('@1k5-tech-es/grado/patterns')
  const today = '2026-11-19'
  const es = (q, extra = {}) => dateSuggestions(q, { today, ...extra })
  const values = (list) => list.map((item) => item.value)
  assert.deepEqual(values(es('')), ['2026-11-19', '2026-11-20', '2026-11-23', '2026-11-30'], 'hoy, mañana, la próxima semana y fin de mes')
  assert.equal(es('')[1].label, 'Mañana · vie, 20 nov')
  assert.deepEqual(values(es('ma')), ['2026-11-20', '2026-11-21', '2026-11-24'], 'mañana, pasado mañana y martes')
  assert.deepEqual(values(es('Próximo VIERNES')), ['2026-11-20'])
  assert.deepEqual(values(es('en 2 semanas')), ['2026-12-03'])
  assert.deepEqual(values(es('2w')), ['2026-12-03'])
  assert.deepEqual(values(es('una semana')), ['2026-11-26'])
  assert.deepEqual(
    values(es('3')),
    ['2026-12-03', '2026-11-22', '2026-12-10', '2027-02-19'],
    'el día 3 y dentro de 3 días, semanas y meses',
  )
  assert.deepEqual(values(es('20/11')), ['2026-11-20'])
  assert.deepEqual(values(es('18/11')), ['2027-11-18'], 'sin año: la próxima vez que llega')
  assert.deepEqual(values(es('20.11.27')), ['2027-11-20'])
  assert.deepEqual(values(es('1 de diciembre')), ['2026-12-01'])
  assert.deepEqual(values(es('2027-01-05')), ['2027-01-05'])
  assert.deepEqual(values(es('31/02')), [], 'fecha imposible')
  assert.deepEqual(values(es('zzz')), [])
  assert.deepEqual(values(es('', { min: '2026-11-20', max: '2026-11-25' })), ['2026-11-20', '2026-11-23'], 'dentro de min y max')
  assert.deepEqual(
    dateSuggestions('in 2 wochen', { today, locale: 'de-DE' }).map((item) => item.label),
    ['In 2 Wochen · Do., 3. Dez.'],
  )
  assert.deepEqual(values(dateSuggestions('übermorgen', { today, locale: 'de-DE' })), ['2026-11-21'])
  assert.deepEqual(values(dateSuggestions('next fri', { today, locale: 'en-GB' })), ['2026-11-20'])
  assert.equal(shortDateLabel('2027-01-05', { today }), 'mar, 5 ene 2027')
})
