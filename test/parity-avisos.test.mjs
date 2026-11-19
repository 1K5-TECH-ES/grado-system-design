// Avisos (0.4): Toaster de React y de Vue generan el mismo HTML para la misma cola.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import { normalize } from './normalize.mjs'

const vue = (render) => renderToString(createSSRApp({ render }))
// Cada paquete tiene su cola: se llenan igual para comparar.
const both = (fn) => [R, V].forEach((G) => fn(G.toast))

test('Toaster vacío: la región ya está en la página', async () => {
  both((toast) => toast.dismiss())
  const react = renderToStaticMarkup(r(R.Toaster))
  assert.equal(react, '<section class="k5-toaster" aria-label="Notificaciones" aria-live="polite"></section>')
  assert.equal(normalize(react), normalize(await vue(() => h(V.Toaster))))
})

test('Toaster con avisos, acción, error y cola', async () => {
  both((toast) => {
    toast.dismiss()
    toast.success('Oferta enviada', { description: 'A Lucía Martín', action: { label: 'Deshacer', onClick() {} } })
    toast.error('No se ha podido guardar')
    toast('Documento subido')
    toast('En la cola')
  })
  const react = renderToStaticMarkup(r(R.Toaster, { max: 3, label: 'Avisos' }))
  assert.match(react, /aria-label="Avisos"/)
  assert.equal((react.match(/class="k5-toast"/g) ?? []).length, 3)
  assert.doesNotMatch(react, /En la cola/)
  assert.match(react, /<div class="k5-alert k5-alert--danger" role="alert">/)
  assert.match(react, /<div class="k5-alert k5-alert--success">/)
  assert.match(react, /class="k5-btn k5-btn--link k5-btn--sm">Deshacer<\/button>/)
  assert.equal(normalize(react), normalize(await vue(() => h(V.Toaster, { max: 3, label: 'Avisos' }))))
  both((toast) => toast.dismiss())
})

test('Toaster en alemán', async () => {
  both((toast) => toast('Gespeichert'))
  const react = renderToStaticMarkup(r(R.GradoProvider, { locale: 'de-DE' }, r(R.Toaster)))
  assert.match(react, /aria-label="Benachrichtigungen"/)
  assert.equal(normalize(react), normalize(await vue(() => h(V.GradoProvider, { locale: 'de-DE' }, () => h(V.Toaster)))))
  both((toast) => toast.dismiss())
})

test('Toaster: la acción con atajo pinta las teclas y lleva aria-keyshortcuts', async () => {
  both((toast) => {
    toast.dismiss()
    toast('Ticket archivado', { action: { label: 'Deshacer', shortcut: ['⌘', 'Z'], onClick() {} } })
  })
  const react = renderToStaticMarkup(r(R.Toaster))
  assert.match(
    react,
    /class="k5-btn k5-btn--link k5-btn--sm" aria-keyshortcuts="Meta\+Z">Deshacer<span class="k5-btn__shortcut" aria-hidden="true"><kbd>⌘<\/kbd><kbd>Z<\/kbd><\/span><\/button>/,
  )
  assert.equal(normalize(react), normalize(await vue(() => h(V.Toaster))))
  both((toast) => toast.dismiss())
})
