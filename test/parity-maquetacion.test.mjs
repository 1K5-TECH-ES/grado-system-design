// Maquetación y tipografía: React y Vue generan el mismo HTML para las mismas props.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import { normalize } from './normalize.mjs'

// Un mismo árbol en los dos: [componente, props, ...hijos]. Los hijos son texto u otros nodos.
// En Vue la clase extra va en class; en React, en className.
const vueProps = (props) => {
  if (!props?.className) return props
  const { className, ...rest } = props
  return { ...rest, class: className }
}
const both = ([name, props, ...children]) => [
  r(R[name], props, ...children.map((c) => (Array.isArray(c) ? both(c)[0] : c))),
  () => h(V[name], vueProps(props), () => children.map((c) => (Array.isArray(c) ? both(c)[1]() : c))),
]

const SCENARIOS = {
  'stack por defecto': ['Stack', null, ['Text', null, 'Lucía Fernández'], ['Text', { tone: 'muted' }, 'Valencia · 8,4 kWp']],
  'stack en fila, con hueco, alineación, reparto y salto': [
    'Stack',
    { direction: 'row', gap: '2', align: 'baseline', justify: 'between', wrap: true, className: 'extra', id: 'acciones' },
    'Instalaciones',
    'Exportar',
  ],
  'stack como lista con hueco 0-5': [
    'Stack',
    { as: 'ul', gap: '0-5' },
    ['Text', { as: 'li' }, 'Madrid'],
    ['Text', { as: 'li' }, 'Sevilla'],
  ],
  'grid automática por defecto': ['Grid', null, 'Panel 1', 'Panel 2'],
  'grid de tres columnas con hueco 6': ['Grid', { columns: 3, gap: '6', as: 'section', 'aria-label': 'Indicadores' }, 'A', 'B', 'C'],
  'grid automática con elementos anchos': ['Grid', { columns: 'auto', minItemWidth: 'lg', gap: '3' }, 'A'],
  'container por defecto': ['Container', null, 'Contenido'],
  'container estrecho sin margen como main': ['Container', { size: 'sm', padded: false, as: 'main' }, 'Formulario'],
  'text con todas las opciones': [
    'Text',
    { as: 'span', size: 'caption', tone: 'success', weight: 'semibold', truncate: true, numeric: true },
    '12,4 kWh',
  ],
  'text de todos los tonos y tamaños': [
    'Stack',
    { gap: '1' },
    ['Text', { size: 'lead', tone: 'primary' }, 'Autoconsumo'],
    ['Text', { size: 'small', tone: 'warning', weight: 'medium' }, 'Pendiente de legalizar'],
    ['Text', { tone: 'danger' }, 'Incidencia abierta'],
    ['Text', { tone: 'info' }, 'En revisión'],
    ['Text', { tone: 'default', weight: 'regular', size: 'body' }, 'Normal'],
  ],
  'heading con tamaño por nivel': [
    'Stack',
    null,
    ['Heading', { level: 1 }, 'Instalaciones'],
    ['Heading', { level: 2 }, 'Resumen'],
    ['Heading', { level: 4 }, 'Documentos'],
  ],
  'heading con tamaño y etiqueta propios': [
    'Stack',
    null,
    ['Heading', { level: 2, size: 'display' }, '1.042 kWp'],
    ['Heading', { level: 3, as: 'legend', className: 'extra' }, 'Datos del cliente'],
  ],
}

const html = {}
for (const [name, tree] of Object.entries(SCENARIOS)) {
  test(`mismo HTML en React y Vue: ${name}`, async () => {
    const [reactTree, vueRender] = both(tree)
    const react = normalize(renderToStaticMarkup(reactTree))
    const vue = normalize(await renderToString(createSSRApp({ render: vueRender })))
    html[name] = react
    assert.equal(vue, react)
  })
}

test('Stack y Grid solo usan clases, sin estilos en línea', () => {
  for (const out of Object.values(html)) assert.doesNotMatch(out, /style=/)
  assert.match(html['stack por defecto'], /^<div class="k5-gap-4 k5-stack">/)
  assert.match(
    html['stack en fila, con hueco, alineación, reparto y salto'],
    /class="extra k5-align-baseline k5-gap-2 k5-justify-between k5-stack k5-stack--row k5-stack--wrap" id="acciones"/,
  )
  assert.match(html['stack como lista con hueco 0-5'], /^<ul class="k5-gap-0-5 k5-stack"><li class="k5-text">Madrid<\/li>/)
})

test('Grid: automática por defecto, columnas fijas y ancho mínimo', () => {
  assert.match(html['grid automática por defecto'], /^<div class="k5-gap-4 k5-grid k5-grid--auto">/)
  assert.match(html['grid de tres columnas con hueco 6'], /^<section aria-label="Indicadores" class="k5-gap-6 k5-grid k5-grid--cols-3">/)
  assert.match(html['grid automática con elementos anchos'], /class="k5-gap-3 k5-grid k5-grid--auto k5-grid--min-lg"/)
})

test('Container: lg con margen por defecto; sm sin margen', () => {
  assert.match(html['container por defecto'], /^<div class="k5-container">/)
  assert.match(html['container estrecho sin margen como main'], /^<main class="k5-container k5-container--flush k5-container--sm">/)
})

test('Text: párrafo por defecto y modificadores solo cuando cambian algo', () => {
  assert.match(
    html['text con todas las opciones'],
    /^<span class="k5-text k5-text--caption k5-text--numeric k5-text--semibold k5-text--success k5-text--truncate">/,
  )
  assert.match(html['text de todos los tonos y tamaños'], /<p class="k5-text">Normal<\/p>/)
})

test('Heading: h<level> con el tamaño de su nivel, salvo que se pida otro', () => {
  const out = html['heading con tamaño por nivel']
  assert.match(out, /<h1 class="k5-heading k5-heading--title">Instalaciones<\/h1>/)
  assert.match(out, /<h2 class="k5-heading k5-heading--heading">Resumen<\/h2>/)
  assert.match(out, /<h4 class="k5-heading k5-heading--lead">Documentos<\/h4>/)
  const custom = html['heading con tamaño y etiqueta propios']
  assert.match(custom, /<h2 class="k5-heading k5-heading--display">1.042 kWp<\/h2>/)
  assert.match(custom, /<legend class="extra k5-heading k5-heading--lead">Datos del cliente<\/legend>/)
})
