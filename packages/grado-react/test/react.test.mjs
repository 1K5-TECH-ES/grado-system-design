import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as G from '@1k5-tech-es/grado-react'

test('todos los componentes reenvían ref (react-hook-form y los popovers la necesitan)', () => {
  // GradoProvider no pinta nada; las constantes van en mayúsculas (MESSAGES, ENERGY_ICON_PATHS…).
  const components = Object.entries(G).filter(([name]) => /^[A-Z][a-z]/.test(name) && name !== 'GradoProvider')
  for (const [name, value] of components) assert.equal(value.$$typeof, Symbol.for('react.forward_ref'), `${name} debe usar forwardRef`)
  assert.ok(components.length > 90)
})

test('un Input fuera de Field no inventa atributos', () => {
  // React 18 y 19 escriben los atributos en distinto orden.
  const html = renderToStaticMarkup(r(G.Input, { name: 'q' }))
  const attrs = [...html.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => `${name}=${value}`).sort()
  assert.match(html, /^<input [^>]*\/>$/)
  assert.deepEqual(attrs, ['class=k5-input', 'name=q'])
})

test('aria-describedby propio se suma al del Field', () => {
  const html = renderToStaticMarkup(r(G.Field, { id: 'x', hint: 'Ayuda' }, r(G.Input, { 'aria-describedby': 'extra' })))
  assert.match(html, /aria-describedby="extra x-hint"/)
})

test('useField devuelve null fuera de un Field', () => {
  let seen = 'sin llamar'
  const Probe = () => {
    seen = G.useField()
    return null
  }
  renderToStaticMarkup(r(Probe))
  assert.equal(seen, null)
})
