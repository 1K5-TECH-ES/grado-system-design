// Grupo «datos y piezas»: React y Vue tienen que generar el mismo HTML con las mismas props.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as R from '@1k5/grado-react'
import * as V from '@1k5/grado-vue'
import { normalize } from './normalize.mjs'

const text = (s) => () => s
const noop = () => {}
const LinkR = ({ to, ...props }) => r('a', { ...props, href: to })
const LinkV = defineComponent({
  props: { to: String },
  setup(props, { slots }) {
    return () => h('a', { href: props.to }, slots.default?.())
  },
})

const TONES = ['neutral', 'brand', 'info', 'success', 'warning', 'danger']
const team = [
  { name: 'Lucía Fernández' },
  { name: 'Javier Ortega', src: '/equipo/javier.jpg' },
  { name: 'Marta Ruiz' },
  { name: 'Ana Pérez' },
  { name: 'Carlos Gil' },
  { name: 'Ángel Núñez' },
]
const ficha = [
  { id: 'cliente', term: 'Cliente', description: 'Lucía Fernández' },
  { id: 'potencia', term: 'Potencia', description: '8,4 kWp' },
  { id: 'cups', term: 'CUPS', description: 'ES0021000012345678AB', copy: 'ES0021000012345678AB', mono: true },
]

const SCENARIOS = {
  'status de todos los tonos y en vivo': [
    r(
      'div',
      null,
      ...TONES.map((tone) => r(R.Status, { key: tone, tone }, tone)),
      r(R.Status, { tone: 'success', pulse: true }, 'Produciendo'),
    ),
    () =>
      h('div', null, [
        ...TONES.map((tone) => h(V.Status, { tone }, text(tone))),
        h(V.Status, { tone: 'success', pulse: true }, text('Produciendo')),
      ]),
  ],
  'status neutro por defecto con clase extra': [
    r(R.Status, { className: 'fila' }, 'Pendiente'),
    () => h(V.Status, { class: 'fila' }, text('Pendiente')),
  ],
  'progreso con nombre y valor': [
    r(R.Progress, { value: 64, label: 'Subida de la memoria técnica', showLabel: true, showValue: true }),
    () => h(V.Progress, { value: 64, label: 'Subida de la memoria técnica', showLabel: true, showValue: true }),
  ],
  'progreso indeterminado pequeño': [
    r(R.Progress, { value: null, size: 'sm', label: 'Calculando producción' }),
    () => h(V.Progress, { value: null, size: 'sm', label: 'Calculando producción' }),
  ],
  'progreso por pasos': [
    r(R.Progress, { steps: 5, value: 3, label: 'Legalización', showLabel: true, showValue: true, tone: 'success' }),
    () => h(V.Progress, { steps: 5, value: 3, label: 'Legalización', showLabel: true, showValue: true, tone: 'success' }),
  ],
  'progreso por encima del máximo y sin nombre': [
    r(R.Progress, { value: 130, max: 120, tone: 'danger', showValue: true }),
    () => h(V.Progress, { value: 130, max: 120, tone: 'danger', showValue: true }),
  ],
  'ficha en columnas con copia y cifra': [r(R.DescriptionList, { items: ficha }), () => h(V.DescriptionList, { items: ficha })],
  'ficha apilada': [
    r(R.DescriptionList, { items: ficha.slice(0, 2), layout: 'stacked', className: 'ficha' }),
    () => h(V.DescriptionList, { items: ficha.slice(0, 2), layout: 'stacked', class: 'ficha' }),
  ],
  'botón de copiar con texto': [r(R.CopyButton, { value: 'INS-2041' }), () => h(V.CopyButton, { value: 'INS-2041' })],
  'botón de copiar solo icono, mediano y con clase': [
    r(R.CopyButton, { value: 'ES0021000012345678AB', iconOnly: true, label: 'Copiar CUPS', size: 'md', className: 'extra' }),
    () => h(V.CopyButton, { value: 'ES0021000012345678AB', iconOnly: true, label: 'Copiar CUPS', size: 'md', class: 'extra' }),
  ],
  'tag con botón de quitar': [
    r(R.Tag, { label: 'Valencia', onRemove: noop }),
    () => h(V.Tag, { label: 'Valencia', removable: true, onRemove: noop }),
  ],
  'tag pequeño desactivado con contenido': [
    r(R.Tag, { size: 'sm', disabled: true, onRemove: noop }, 'Murcia'),
    () => h(V.Tag, { size: 'sm', disabled: true, removable: true }, text('Murcia')),
  ],
  'tag sin quitar y nombre de botón propio': [
    r('div', null, r(R.Tag, { label: 'Sevilla' }), r(R.Tag, { label: 'Málaga', onRemove: noop, removeLabel: 'Quitar provincia Málaga' })),
    () =>
      h('div', null, [
        h(V.Tag, { label: 'Sevilla' }),
        h(V.Tag, { label: 'Málaga', removable: true, removeLabel: 'Quitar provincia Málaga' }),
      ]),
  ],
  'grupo de avatares con resto': [r(R.AvatarGroup, { items: team, size: 'sm' }), () => h(V.AvatarGroup, { items: team, size: 'sm' })],
  'grupo de avatares que caben': [
    r(R.AvatarGroup, { items: team.slice(0, 3), max: 3 }),
    () => h(V.AvatarGroup, { items: team.slice(0, 3), max: 3 }),
  ],
  'avatar con foto': [
    r(R.Avatar, { name: 'Javier Ortega', src: '/equipo/javier.jpg', size: 'lg' }),
    () => h(V.Avatar, { name: 'Javier Ortega', src: '/equipo/javier.jpg', size: 'lg' }),
  ],
  'atajo y tecla suelta': [
    r('p', null, r(R.Kbd, { keys: ['Ctrl', 'K'] }), r(R.Kbd, null, 'Esc')),
    () => h('p', null, [h(V.Kbd, { keys: ['Ctrl', 'K'] }), h(V.Kbd, null, text('Esc'))]),
  ],
  separadores: [
    r(
      'div',
      null,
      r(R.Separator),
      r(R.Separator, { orientation: 'vertical', decorative: false }),
      r(R.Separator, { label: 'o' }),
      r(R.Separator, { label: 'o', decorative: false }),
    ),
    () =>
      h('div', null, [
        h(V.Separator),
        h(V.Separator, { orientation: 'vertical', decorative: false }),
        h(V.Separator, { label: 'o' }),
        h(V.Separator, { label: 'o', decorative: false }),
      ]),
  ],
  enlaces: [
    r(
      'p',
      null,
      r(R.Link, { href: '/instalaciones/INS-2041' }, 'Ver ficha'),
      r(R.Link, { href: 'https://www.sedecatastro.gob.es', external: true, tone: 'muted', underline: 'always' }, 'Sede del Catastro'),
      r(R.Link, { as: LinkR, to: '/clientes/lucia', className: 'extra' }, 'Lucía Fernández'),
    ),
    () =>
      h('p', null, [
        h(V.Link, { href: '/instalaciones/INS-2041' }, text('Ver ficha')),
        h(
          V.Link,
          { href: 'https://www.sedecatastro.gob.es', external: true, tone: 'muted', underline: 'always' },
          text('Sede del Catastro'),
        ),
        h(V.Link, { as: LinkV, to: '/clientes/lucia', class: 'extra' }, text('Lucía Fernández')),
      ]),
  ],
}

const html = {}
for (const [name, [reactTree, vueRender]] of Object.entries(SCENARIOS)) {
  test(`mismo HTML en React y Vue: ${name}`, async () => {
    // React 19 añade <link rel="preload"> por cada <img> en el servidor; Vue no. No es parte del componente.
    const react = normalize(renderToStaticMarkup(reactTree)).replace(/<link as="image" href="[^"]*" rel="preload">/g, '')
    const vue = normalize(await renderToString(createSSRApp({ render: vueRender })))
    html[name] = react
    assert.equal(vue, react)
  })
}

test('Status: punto oculto y texto sin color', () => {
  assert.match(
    html['status de todos los tonos y en vivo'],
    /<span class="k5-status k5-status--warning"><span aria-hidden="true" class="k5-status__dot"><\/span>warning<\/span>/,
  )
  assert.match(html['status de todos los tonos y en vivo'], /class="k5-status k5-status--pulse k5-status--success"/)
  assert.match(html['status neutro por defecto con clase extra'], /class="fila k5-status k5-status--neutral"/)
})

test('Progress: progressbar con valor, nombre y texto en español', () => {
  const out = html['progreso con nombre y valor']
  assert.match(out, /<span class="k5-progress__label" id="k5-AUTO">Subida de la memoria técnica<\/span>/)
  assert.match(out, /aria-labelledby="k5-AUTO"/)
  assert.match(out, /aria-valuemax="100" aria-valuemin="0" aria-valuenow="64" aria-valuetext="64\u00a0%"/)
  assert.match(out, /style="width:64%"/)
  const busy = html['progreso indeterminado pequeño']
  assert.match(busy, /k5-progress--indeterminate/)
  assert.doesNotMatch(busy, /aria-valuenow|aria-valuetext|style=/)
  assert.match(busy, /aria-label="Calculando producción"/)
  const steps = html['progreso por pasos']
  assert.match(steps, /aria-valuemax="5" aria-valuemin="0" aria-valuenow="3" aria-valuetext="Paso 3 de 5"/)
  assert.equal(steps.match(/k5-progress__step--done/g).length, 3)
  assert.equal(steps.match(/<span class="k5-progress__step/g).length, 5)
  const over = html['progreso por encima del máximo y sin nombre']
  assert.match(over, /aria-label="Progreso"/)
  assert.match(over, /aria-valuenow="120" aria-valuetext="100\u00a0%"/)
})

test('DescriptionList: dl con pares y botón de copiar con nombre', () => {
  const out = html['ficha en columnas con copia y cifra']
  assert.match(out, /^<dl class="k5-dl"><div class="k5-dl__item"><dt class="k5-dl__term">Cliente<\/dt><dd class="k5-dl__description">/)
  assert.match(out, /<dd class="k5-dl__description k5-dl__description--mono">/)
  assert.match(out, /aria-label="Copiar CUPS"/)
  assert.match(html['ficha apilada'], /class="ficha k5-dl k5-dl--stacked"/)
})

test('CopyButton: botón ghost y región que anuncia el resultado', () => {
  const out = html['botón de copiar con texto']
  assert.match(out, /<span class="k5-copy"><button class="k5-btn k5-btn--ghost k5-btn--sm k5-copy__button" type="button">/)
  assert.match(out, /<\/svg>Copiar<\/button><span class="k5-sr-only" role="status"><\/span><\/span>$/)
  const icon = html['botón de copiar solo icono, mediano y con clase']
  assert.match(icon, /<span class="extra k5-copy">/)
  assert.match(icon, /aria-label="Copiar CUPS" class="k5-btn k5-btn--ghost k5-btn--icon k5-copy__button" title="Copiar CUPS"/)
})

test('Tag: botón de quitar con nombre y estado desactivado', () => {
  assert.match(html['tag con botón de quitar'], /<button aria-label="Quitar Valencia" class="k5-tag__remove" type="button">/)
  assert.match(html['tag pequeño desactivado con contenido'], /class="k5-tag k5-tag--disabled k5-tag--sm"/)
  assert.match(html['tag pequeño desactivado con contenido'], /aria-label="Quitar Murcia" class="k5-tag__remove" disabled/)
  assert.doesNotMatch(html['tag sin quitar y nombre de botón propio'].split('Málaga')[0], /button/)
  assert.match(html['tag sin quitar y nombre de botón propio'], /aria-label="Quitar provincia Málaga"/)
})

test('AvatarGroup: muestra max y anuncia el resto', () => {
  const out = html['grupo de avatares con resto']
  assert.equal(out.match(/role="img"/g).length, 4)
  assert.match(out, /<span aria-hidden="true">\+2<\/span><span class="k5-sr-only">y 2 más<\/span>/)
  assert.match(out, /title="Carlos Gil, Ángel Núñez"/)
  assert.doesNotMatch(html['grupo de avatares que caben'], /k5-avatar-group__more/)
  assert.match(html['avatar con foto'], /<img alt class="k5-avatar__image" src="\/equipo\/javier.jpg">/)
})

test('Kbd, Separator y Link: marcado y accesibilidad', () => {
  assert.match(
    html['atajo y tecla suelta'],
    /<kbd class="k5-kbd"><kbd class="k5-kbd__key">Ctrl<\/kbd><span class="k5-kbd__sep">\+<\/span><kbd class="k5-kbd__key">K<\/kbd><\/kbd>/,
  )
  const sep = html['separadores']
  assert.match(sep, /<div aria-hidden="true" class="k5-separator"><\/div>/)
  assert.match(sep, /<div aria-orientation="vertical" class="k5-separator k5-separator--vertical" role="separator"><\/div>/)
  assert.match(sep, /<div aria-label="o" aria-orientation="horizontal" class="k5-separator k5-separator--label" role="separator">/)
  const links = html['enlaces']
  assert.match(links, /<a class="k5-link" href="\/instalaciones\/INS-2041">Ver ficha<\/a>/)
  assert.match(
    links,
    /class="k5-link k5-link--muted k5-link--underline" href="https:\/\/www.sedecatastro.gob.es" rel="noopener noreferrer" target="_blank"/,
  )
  assert.match(links, /<span class="k5-sr-only"> \(se abre en otra pestaña\)<\/span><\/a>/)
  assert.match(links, /<a class="extra k5-link" href="\/clientes\/lucia">Lucía Fernández<\/a>/)
})
