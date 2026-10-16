// Avisos (0.4): la cola de toast() que comparten React y Vue.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createToastStore, visibleToasts } from '@1k5-tech-es/grado/patterns'

test('toast() añade avisos por orden de llegada con su tono y duración', () => {
  const { toast, getSnapshot } = createToastStore()
  const first = toast('Documento subido')
  toast.success('Oferta enviada', { description: 'A Lucía Martín', action: { label: 'Deshacer', onClick() {} } })
  toast.error('No se ha podido guardar', { duration: 0 })
  toast.warning('Falta la factura')
  toast.info('Hay una versión nueva')
  assert.equal(first, 'k5-toast-1')
  assert.deepEqual(
    getSnapshot().map(({ title, tone, duration }) => [title, tone, duration]),
    [
      ['Documento subido', 'info', 5000],
      ['Oferta enviada', 'success', 5000],
      ['No se ha podido guardar', 'danger', 0],
      ['Falta la factura', 'warning', 5000],
      ['Hay una versión nueva', 'info', 5000],
    ],
  )
  assert.equal(getSnapshot()[1].description, 'A Lucía Martín')
  assert.equal(getSnapshot()[1].action.label, 'Deshacer')
})

test('cada almacén lleva su propia cola y avisa a quien escucha', () => {
  const a = createToastStore(),
    b = createToastStore()
  let calls = 0
  const stop = a.subscribe(() => calls++)
  a.toast('Uno')
  b.toast('Otro')
  assert.equal(calls, 1)
  assert.equal(a.getSnapshot().length, 1)
  stop()
  a.toast('Dos')
  assert.equal(calls, 1)
})

test('dismiss quita un aviso o todos, y un id repetido actualiza en su sitio', () => {
  const { toast, getSnapshot } = createToastStore()
  const a = toast('Uno'),
    b = toast('Dos')
  toast('Tres')
  toast.success('Dos, ya guardado', { id: b })
  assert.deepEqual(
    getSnapshot().map((item) => item.title),
    ['Uno', 'Dos, ya guardado', 'Tres'],
  )
  toast.dismiss(a)
  assert.deepEqual(
    getSnapshot().map((item) => item.title),
    ['Dos, ya guardado', 'Tres'],
  )
  toast.dismiss()
  assert.deepEqual(getSnapshot(), [])
})

test('toast.promise pasa de «cargando» al resultado en el mismo aviso', async () => {
  const { toast, getSnapshot } = createToastStore()
  const value = await toast.promise(Promise.resolve(3), {
    loading: 'Enviando la oferta…',
    success: (n) => `${n} ofertas enviadas`,
    error: 'No se han podido enviar',
  })
  assert.equal(value, 3)
  await Promise.resolve()
  assert.deepEqual(
    getSnapshot().map(({ title, tone, duration }) => [title, tone, duration]),
    [['3 ofertas enviadas', 'success', 5000]],
  )
  const failing = toast.promise(() => Promise.reject(new Error('sin red')), {
    loading: 'Guardando…',
    success: 'Guardado',
    error: (reason) => `Error: ${reason.message}`,
  })
  assert.equal(getSnapshot()[1].title, 'Guardando…')
  assert.equal(getSnapshot()[1].duration, 0)
  await assert.rejects(failing)
  await Promise.resolve()
  assert.equal(getSnapshot()[1].title, 'Error: sin red')
  assert.equal(getSnapshot()[1].tone, 'danger')
})

test('solo se ven los primeros de la cola; el resto espera', () => {
  const { toast, getSnapshot } = createToastStore()
  for (const title of ['A', 'B', 'C', 'D']) toast(title)
  assert.deepEqual(
    visibleToasts(getSnapshot()).map((item) => item.title),
    ['A', 'B', 'C'],
  )
  assert.deepEqual(
    visibleToasts(getSnapshot(), 1).map((item) => item.title),
    ['A'],
  )
  // Un máximo absurdo sigue enseñando uno.
  assert.equal(visibleToasts(getSnapshot(), 0).length, 1)
  toast.dismiss(getSnapshot()[0].id)
  assert.deepEqual(
    visibleToasts(getSnapshot()).map((item) => item.title),
    ['B', 'C', 'D'],
  )
})
