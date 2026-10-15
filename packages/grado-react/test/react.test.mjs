import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as G from '@1k5-tech-es/grado-react'

test('los controles reenvían ref (react-hook-form los necesita)', () => {
  for (const name of ['Button', 'Input', 'Textarea', 'Select', 'Switch']) {
    assert.equal(G[name].$$typeof, Symbol.for('react.forward_ref'), `${name} debe usar forwardRef`)
  }
})

test('un Input fuera de Field no inventa atributos', () => {
  const html = renderToStaticMarkup(r(G.Input, { name: 'q' }))
  assert.equal(html, '<input class="k5-input" name="q"/>')
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
