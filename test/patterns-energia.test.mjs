// Energía (0.4): tarifa 2.0TD, franjas de precio, estado de la batería y escala del mapa de calor.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  batteryState,
  gridKeyMove,
  heatLevels,
  isOffPeakDay,
  priceExtremes,
  priceSlots,
  slotAt,
  tariffPeriod,
} from '@1k5-tech-es/grado/patterns'
import { batteryClass, ENERGY_ICON_PATHS } from '@1k5-tech-es/grado/classes'

test('periodos 2.0TD de un día laborable en la península', () => {
  const day = Array.from({ length: 24 }, (_, hour) => tariffPeriod(hour)[0]).join('')
  // v = valle, l = llano, p = punta
  assert.equal(day, 'vvvvvvvvllppppllllppppll')
  assert.equal(tariffPeriod(19, true), 'valle')
})

test('días enteros en valle: fin de semana y festivos nacionales de fecha fija', () => {
  assert.ok(isOffPeakDay('2026-10-17')) // sábado
  assert.ok(isOffPeakDay('2026-10-18')) // domingo
  assert.ok(isOffPeakDay('2026-10-12')) // Fiesta Nacional, lunes
  assert.ok(isOffPeakDay('2026-12-08'))
  assert.ok(!isOffPeakDay('2026-10-16'))
  assert.ok(!isOffPeakDay('2026-04-03')) // Viernes Santo: cambia de fecha, no cuenta
  assert.ok(isOffPeakDay('2026-04-03', ['2026-04-03']))
  assert.ok(!isOffPeakDay(undefined))
})

test('franjas de 1 hora y de 15 minutos, con su periodo y la de ahora', () => {
  const hourly = priceSlots(
    Array.from({ length: 24 }, (_, i) => i / 100),
    { date: '2026-10-16' },
  )
  assert.deepEqual(
    hourly.slice(7, 11).map((s) => `${s.start}–${s.end} ${s.period}`),
    ['07:00–08:00 valle', '08:00–09:00 llano', '09:00–10:00 llano', '10:00–11:00 punta'],
  )
  assert.equal(hourly[23].end, '00:00')
  const quarters = priceSlots(Array(96).fill(0.1))
  assert.deepEqual([quarters[1].start, quarters[1].end, quarters[95].start], ['00:15', '00:30', '23:45'])
  assert.equal(quarters[41].period, 'punta') // 10:15
  assert.equal(slotAt(hourly, '20:15'), 20)
  assert.equal(slotAt(quarters, '20:15'), 81)
  assert.equal(slotAt(hourly, '25:00'), -1)
  assert.equal(slotAt(hourly), -1)
  assert.deepEqual(
    priceSlots([0.1, 0.2], { periods: ['punta', 'valle'] }).map((s) => s.period),
    ['punta', 'valle'],
  )
})

test('franja más barata y más cara: la primera si se repiten; sin precios, ninguna', () => {
  const slots = priceSlots([0.2, 0.1, null, 0.1, 0.3, 0.3])
  const { cheapest, dearest } = priceExtremes(slots)
  assert.equal(cheapest.index, 1)
  assert.equal(dearest.index, 4)
  assert.deepEqual(priceExtremes(priceSlots([null, null])), { cheapest: null, dearest: null })
})

test('batería: estado por la potencia y tono por la carga', () => {
  assert.equal(batteryState(2.1), 'charging')
  assert.equal(batteryState(-0.8), 'discharging')
  assert.equal(batteryState(0.03), 'idle')
  assert.equal(batteryState(null), 'idle')
  assert.equal(batteryClass({ level: 72 }), 'k5-battery k5-battery--high')
  assert.equal(batteryClass({ level: 25 }), 'k5-battery k5-battery--medium')
  assert.equal(batteryClass({ level: 10, size: 'sm' }), 'k5-battery k5-battery--low k5-battery--sm')
})

test('mapa de calor: escala entre el mínimo y el máximo, huecos y teclas', () => {
  assert.deepEqual(
    heatLevels([
      [1, 2],
      [3, null],
    ]),
    {
      min: 1,
      max: 3,
      levels: [
        [0, 0.5],
        [1, null],
      ],
    },
  )
  assert.deepEqual(heatLevels([[5, 5]]).levels, [[0.5, 0.5]])
  assert.deepEqual(heatLevels([[0, 10]], { max: 5 }).levels, [[0, 1]])
  assert.deepEqual(gridKeyMove('ArrowDown', null, 7, 24), [0, 0])
  assert.deepEqual(gridKeyMove('ArrowDown', [6, 3], 7, 24), [6, 3])
  assert.deepEqual(gridKeyMove('ArrowUp', [2, 3], 7, 24), [1, 3])
  assert.deepEqual(gridKeyMove('End', [2, 3], 7, 24), [2, 23])
  assert.equal(gridKeyMove('Enter', [2, 3], 7, 24), undefined)
})

test('iconos de energía: siete, todos con trazos dentro de 24 × 24', () => {
  assert.deepEqual(Object.keys(ENERGY_ICON_PATHS), [
    'solarPanel',
    'homeBattery',
    'powerGrid',
    'heatPump',
    'wallbox',
    'electricMeter',
    'inverter',
  ])
  for (const [name, paths] of Object.entries(ENERGY_ICON_PATHS)) {
    assert.ok(paths.length > 0, name)
    for (const d of paths) for (const n of d.match(/-?\d*\.?\d+/g)) assert.ok(Math.abs(Number(n)) <= 24, `${name}: ${n}`)
  }
})
