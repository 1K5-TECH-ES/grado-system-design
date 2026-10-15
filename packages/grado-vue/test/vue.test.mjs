import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as G from '@1k5/grado-vue'

const render = (template, data = {}) => renderToString(createSSRApp({ template, components: G, data: () => data }))

test('v-model en plantilla: Input, Switch y Textarea', async () => {
  const html = await render('<Input v-model="kwp" suffix="kWp" /><Switch v-model="auto" label="Auto" /><Textarea v-model="nota" />', {
    kwp: '8,4',
    auto: true,
    nota: 'Llamar el lunes',
  })
  assert.match(html, /<input class="k5-input" value="8,4">/)
  assert.match(html, /<input class="k5-switch" type="checkbox" role="switch" checked>/)
  assert.match(html, /<textarea class="k5-textarea">Llamar el lunes<\/textarea>/)
})

test('slots con nombre en plantilla: #actions y #action', async () => {
  const html = await render(
    '<PageHeader title="Tickets"><template #actions><Button>Nuevo ticket</Button></template></PageHeader>' +
      '<EmptyState title="Vacío"><template #action><Button variant="secondary">Crear</Button></template></EmptyState>',
  )
  assert.match(html, /k5-page-header__actions"><button type="button" class="k5-btn k5-btn--primary">/)
  assert.match(html, /k5-empty__action"><button type="button" class="k5-btn k5-btn--secondary">/)
})

test('los componentes con v-model declaran update:modelValue', () => {
  for (const name of ['Input', 'Textarea', 'Select', 'Switch']) {
    assert.ok('update:modelValue' in G[name].emits, `${name} debe emitir update:modelValue`)
  }
})

test('class y atributos van al control en los componentes de formulario', async () => {
  const html = await render('<Input class="w-40" data-test="q" aria-label="Buscar" />')
  assert.match(html, /<input class="k5-input w-40" data-test="q" aria-label="Buscar">/)
})
