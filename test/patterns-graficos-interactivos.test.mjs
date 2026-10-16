// Gráficos interactivos (0.4): qué dato hay bajo el puntero, a cuál lleva cada tecla y dónde va la tarjeta.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chartKeyMove, chartSlotAt, slotCenter, tooltipAlign } from '@1k5-tech-es/grado/patterns'

test('dato bajo el puntero: franjas iguales, sin salirse de los bordes', () => {
  assert.equal(chartSlotAt(0, 700, 7), 0)
  assert.equal(chartSlotAt(99, 700, 7), 0)
  assert.equal(chartSlotAt(100, 700, 7), 1)
  assert.equal(chartSlotAt(699, 700, 7), 6)
  assert.equal(chartSlotAt(800, 700, 7), 6)
  assert.equal(chartSlotAt(-20, 700, 7), 0)
  assert.equal(chartSlotAt(10, 0, 7), null)
  assert.equal(chartSlotAt(10, 700, 0), null)
})

test('teclas: flechas sin dar la vuelta, Inicio y Fin; el resto no es suyo', () => {
  assert.equal(chartKeyMove('ArrowRight', null, 7), 0)
  assert.equal(chartKeyMove('ArrowLeft', null, 7), 6)
  assert.equal(chartKeyMove('ArrowRight', 6, 7), 6)
  assert.equal(chartKeyMove('ArrowLeft', 0, 7), 0)
  assert.equal(chartKeyMove('ArrowRight', 2, 7), 3)
  assert.equal(chartKeyMove('Home', 4, 7), 0)
  assert.equal(chartKeyMove('End', 1, 7), 6)
  assert.equal(chartKeyMove('Enter', 1, 7), undefined)
  assert.equal(chartKeyMove('ArrowRight', null, 0), undefined)
})

test('la tarjeta va a un lado de su dato, hacia el centro del gráfico', () => {
  assert.equal(tooltipAlign(7.14), 'after')
  assert.equal(tooltipAlign(50), 'after')
  assert.equal(tooltipAlign(64.29), 'before')
  assert.equal(tooltipAlign(92.86), 'before')
  assert.equal(slotCenter(0, 7), 7.14)
  assert.equal(slotCenter(6, 7), 92.86)
})
