// Lógica compartida de los gráficos de 0.3: puntos, trazos, porciones, medidor y flujo de energía.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  areaPath,
  chartPoints,
  donutSlices,
  energyFlow,
  linePath,
  meterLevel,
  meterRatio,
  meterSegments,
  sparklinePoints,
} from '@1k5/grado/patterns'

test('sparklinePoints escala del mínimo al máximo y deja plana una serie constante', () => {
  assert.deepEqual(sparklinePoints([2, 6, 4]), [
    { x: 0, y: 100 },
    { x: 50, y: 0 },
    { x: 100, y: 50 },
  ])
  assert.deepEqual(
    sparklinePoints([5, 5, 5]).map((p) => p.y),
    [50, 50, 50],
  )
  // Un solo valor: una línea plana de lado a lado.
  assert.deepEqual(sparklinePoints([7]), [
    { x: 0, y: 50 },
    { x: 100, y: 50 },
  ])
  assert.deepEqual(sparklinePoints([]), [])
  assert.deepEqual(sparklinePoints(null), [])
  assert.equal(sparklinePoints([1, Number.NaN, 3]).length, 2)
})

test('chartPoints centra cada valor en su columna y recorta a la escala', () => {
  assert.deepEqual(chartPoints([0, 50, 100, 150, -5], 100), [
    { x: 10, y: 100 },
    { x: 30, y: 50 },
    { x: 50, y: 0 },
    { x: 70, y: 0 },
    { x: 90, y: 100 },
  ])
  assert.deepEqual(chartPoints([0], 0), [{ x: 50, y: 100 }])
})

test('linePath y areaPath', () => {
  const points = [
    { x: 0, y: 40 },
    { x: 50, y: 10 },
    { x: 100, y: 60 },
  ]
  assert.equal(linePath(points), 'M0 40 L50 10 L100 60')
  assert.equal(areaPath(points), 'M0 40 L50 10 L100 60 L100 100 L0 100 Z')
  assert.equal(areaPath([]), '')
})

test('donutSlices reparte el total y los porcentajes suman 100', () => {
  assert.deepEqual(donutSlices([13.6, 6.4]), [
    { start: 0, length: 68, percent: 68 },
    { start: 68, length: 32, percent: 32 },
  ])
  assert.deepEqual(
    donutSlices([1, 1, 1]).map((s) => s.percent),
    [34, 33, 33],
  )
  // Con total: un solo valor sobre su máximo, sin pasar del 100 %.
  assert.deepEqual(donutSlices([6.8], 10), [{ start: 0, length: 68, percent: 68 }])
  assert.deepEqual(donutSlices([12], 10), [{ start: 0, length: 100, percent: 100 }])
  assert.deepEqual(donutSlices([0, 0]), [
    { start: 0, length: 0, percent: 0 },
    { start: 0, length: 0, percent: 0 },
  ])
  // Los negativos cuentan como 0.
  assert.deepEqual(
    donutSlices([-3, 5]).map((s) => s.percent),
    [0, 100],
  )
})

test('meterRatio y meterSegments', () => {
  assert.equal(meterRatio(72), 0.72)
  assert.equal(meterRatio(4.2, 0, 6), 0.7)
  assert.equal(meterRatio(-1), 0)
  assert.equal(meterRatio(120), 1)
  assert.equal(meterRatio(5, 10, 10), 0)
  assert.equal(meterSegments(0.72, 10), 7)
  assert.equal(meterSegments(0.15, 8), 1)
  assert.equal(meterSegments(1.2, 10), 10)
})

test('meterLevel sigue el criterio de <meter> de HTML', () => {
  const battery = { low: 20, high: 50, optimum: 100 }
  assert.equal(meterLevel({ value: 72, ...battery }), 'good')
  assert.equal(meterLevel({ value: 50, ...battery }), 'good')
  assert.equal(meterLevel({ value: 35, ...battery }), 'fair')
  assert.equal(meterLevel({ value: 10, ...battery }), 'poor')
  // optimum bajo: menos es mejor (por ejemplo, consumo de red).
  const grid = { low: 30, high: 70, optimum: 0 }
  assert.equal(meterLevel({ value: 10, ...grid }), 'good')
  assert.equal(meterLevel({ value: 50, ...grid }), 'fair')
  assert.equal(meterLevel({ value: 90, ...grid }), 'poor')
  // optimum en medio: fuera de [low, high] es regular, nunca malo.
  const middle = { low: 30, high: 70, optimum: 50 }
  assert.equal(meterLevel({ value: 50, ...middle }), 'good')
  assert.equal(meterLevel({ value: 90, ...middle }), 'fair')
  assert.equal(meterLevel({ value: 72 }), 'neutral')
})

test('energyFlow: sentido respecto al inversor y texto de estado', () => {
  assert.deepEqual(energyFlow('solar', 5.8), { flow: 'in', state: 'energyProducing' })
  assert.deepEqual(energyFlow('solar', 0), { flow: 'none', state: 'energyNoProduction' })
  assert.deepEqual(energyFlow('home', 2.1), { flow: 'out', state: 'energyConsuming' })
  assert.deepEqual(energyFlow('home', 0), { flow: 'none', state: 'energyNoConsumption' })
  assert.deepEqual(energyFlow('battery', 1.6), { flow: 'out', state: 'energyCharging' })
  assert.deepEqual(energyFlow('battery', -1.6), { flow: 'in', state: 'energyDischarging' })
  assert.deepEqual(energyFlow('battery', 0), { flow: 'none', state: 'energyBatteryIdle' })
  assert.deepEqual(energyFlow('grid', 1.2), { flow: 'in', state: 'energyImporting' })
  assert.deepEqual(energyFlow('grid', -2.1), { flow: 'out', state: 'energyExporting' })
  assert.deepEqual(energyFlow('grid', null), { flow: 'none', state: 'energyGridIdle' })
})
