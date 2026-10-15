// Grupo «datos y piezas»: lógica compartida de Progress, AvatarGroup, Tag y CopyButton.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { copyText, formatPercent, progressState, splitAvatars, tagFocusTarget } from '@1k5-tech-es/grado/patterns'
import { messagesFor } from '@1k5-tech-es/grado/messages'

test('formatPercent: formato de cada idioma', () => {
  assert.equal(formatPercent(0.64), '64\u00a0%')
  assert.equal(formatPercent(0.125, 'es-ES', 1), '12,5\u00a0%')
  assert.equal(formatPercent(0.64, 'en-GB'), '64%')
  assert.equal(formatPercent(null), '')
})

test('progressState: valor, límites, indeterminado y pasos', () => {
  assert.deepEqual(progressState({ value: 64 }), {
    indeterminate: false,
    stepped: false,
    max: 100,
    now: 64,
    ratio: 0.64,
    text: '64\u00a0%',
  })
  assert.equal(progressState({ value: -5 }).now, 0)
  assert.equal(progressState({ value: 12, max: 8 }).text, '100\u00a0%')
  assert.equal(progressState({ value: null }).indeterminate, true)
  assert.equal(progressState({}).indeterminate, true)
  const steps = progressState({ value: 3, steps: 5 })
  assert.equal(steps.text, 'Paso 3 de 5')
  assert.equal(steps.max, 5)
  assert.equal(progressState({ value: 2, steps: 4, messages: messagesFor('de-DE') }).text, 'Schritt 2 von 4')
  assert.equal(progressState({ value: 0.5, max: 2, locale: 'en-GB' }).text, '25%')
})

test('splitAvatars: separa los visibles del resto', () => {
  const people = ['a', 'b', 'c', 'd', 'e', 'f']
  assert.deepEqual(splitAvatars(people, 4), { shown: ['a', 'b', 'c', 'd'], rest: ['e', 'f'] })
  assert.deepEqual(splitAvatars(people.slice(0, 4), 4), { shown: ['a', 'b', 'c', 'd'], rest: [] })
  assert.deepEqual(splitAvatars(people, 0).shown, ['a'])
})

test('copyText: usa el portapapeles y, si falla, execCommand', async () => {
  const copied = []
  assert.equal(await copyText('ES0021', { navigator: { clipboard: { writeText: async (t) => copied.push(t) } } }), true)
  assert.deepEqual(copied, ['ES0021'])

  const removed = []
  let focused = false
  const area = { style: {}, setAttribute() {}, select() {}, remove: () => removed.push(true) }
  const doc = {
    body: { appendChild() {} },
    activeElement: { focus: () => (focused = true) },
    createElement: () => area,
    execCommand: (command) => command === 'copy',
  }
  const failing = { clipboard: { writeText: async () => Promise.reject(new Error('sin permiso')) } }
  assert.equal(await copyText('INS-2041', { navigator: failing, document: doc }), true)
  assert.equal(area.value, 'INS-2041')
  assert.deepEqual(removed, [true])
  assert.equal(focused, true)
  assert.equal(await copyText('x', {}), false)
})

test('tagFocusTarget: pasa al siguiente y, en el último, al anterior', () => {
  const make = (disabled = false) => {
    const button = { disabled }
    const tag = { querySelector: () => button }
    button.closest = () => tag
    return { tag, button }
  }
  const tags = [make(), make(true), make(), make()]
  const parent = { children: tags.map((t) => t.tag) }
  for (const t of tags) t.tag.parentElement = parent
  assert.equal(tagFocusTarget(tags[0].button), tags[2].button)
  assert.equal(tagFocusTarget(tags[3].button), tags[2].button)
  assert.equal(tagFocusTarget(null), null)
})
