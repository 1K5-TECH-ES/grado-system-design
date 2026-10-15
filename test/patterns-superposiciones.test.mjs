// Grupo «superposiciones y acciones»: lógica compartida de ActionBar, ContextMenu y ToggleGroup.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { menuPosition, selectedCount, toggleValues } from '@1k5-tech-es/grado/patterns'
import { MESSAGES } from '@1k5-tech-es/grado/messages'

test('selección de ActionBar con plural en los tres idiomas', () => {
  assert.equal(selectedCount(1), '1 seleccionada')
  assert.equal(selectedCount(3), '3 seleccionadas')
  assert.equal(selectedCount(1, MESSAGES['de-DE']), '1 ausgewählt')
  assert.equal(selectedCount(12, MESSAGES['de-DE']), '12 ausgewählt')
  assert.equal(selectedCount(1, MESSAGES['en-GB']), '1 selected')
  assert.equal(selectedCount(2, MESSAGES['en-GB']), '2 selected')
  // Como selectionLabel, ignora lo que no sea un objeto de textos (array.map pasa el índice).
  assert.equal(selectedCount(5, 0), '5 seleccionadas')
})

test('el menú contextual se queda dentro de la ventana', () => {
  const view = { width: 1000, height: 800 },
    size = { width: 200, height: 150 }
  assert.deepEqual(menuPosition({ x: 100, y: 100 }, size, view), { x: 100, y: 100 })
  // Sin sitio a la derecha o abajo, se abre hacia el otro lado del puntero.
  assert.deepEqual(menuPosition({ x: 900, y: 750 }, size, view), { x: 700, y: 600 })
  // Si tampoco cabe al otro lado, se pega al margen.
  assert.deepEqual(menuPosition({ x: 150, y: 120 }, { width: 900, height: 700 }, view), { x: 92, y: 92 })
  assert.deepEqual(menuPosition({ x: 0, y: 0 }, { width: 2000, height: 100 }, view, 16), { x: 16, y: 16 })
})

test('ToggleGroup: una opción o ninguna, o varias en el orden de las opciones', () => {
  assert.deepEqual(toggleValues([], 'b'), ['b'])
  assert.deepEqual(toggleValues(['b'], 'i'), ['i'])
  assert.deepEqual(toggleValues(['b'], 'b'), [])
  assert.deepEqual(toggleValues(['u'], 'b', 'multiple', ['b', 'i', 'u']), ['b', 'u'])
  assert.deepEqual(toggleValues(['b', 'u'], 'b', 'multiple', ['b', 'i', 'u']), ['u'])
  assert.deepEqual(toggleValues(['u'], 'b', 'multiple'), ['u', 'b'])
})
