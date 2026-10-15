// Grupo «superposiciones y acciones»: React y Vue generan el mismo HTML con las mismas props.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import { normalize } from './normalize.mjs'

const IconR = (props) => r('svg', { 'aria-hidden': props['aria-hidden'], className: 'icono' })
const IconV = (props) => h('svg', { 'aria-hidden': props['aria-hidden'], class: 'icono' })
const text = (s) => () => s
// Ids automáticos con prefijo propio (k5-popover-…, k5-context-menu-…): el mismo marcador en los dos.
const same = (html) => normalize(html).replace(/(k5-[a-z-]+-)(?:_R_[A-Za-z0-9]*_|v-[0-9-]+)/g, '$1AUTO')

const items = [
  { id: 'abrir', label: 'Abrir ficha' },
  { id: 'cups', label: 'Copiar CUPS', disabled: true },
  { id: 'baja', label: 'Dar de baja', danger: true, separator: true },
]
const formats = [
  { value: 'b', label: 'Negrita', icon: undefined },
  { value: 'i', label: 'Cursiva' },
  { value: 'u', label: 'Subrayado', disabled: true },
]
const withIcons = (Icon) => formats.map((option) => ({ ...option, icon: Icon }))

const SCENARIOS = {
  'popover cerrado con texto': [
    r(R.Popover, { label: 'Datos del suministro' }, 'Contenido'),
    () => h(V.Popover, { label: 'Datos del suministro' }, text('Contenido')),
  ],
  'popover abierto con título, arriba y al final': [
    r(
      R.Popover,
      { label: 'Suministro', title: 'ES0021000000000001AB', defaultOpen: true, align: 'end', side: 'top', id: 'cups' },
      r('p', null, 'Tarifa 2.0TD'),
    ),
    () =>
      h(V.Popover, { label: 'Suministro', title: 'ES0021000000000001AB', defaultOpen: true, align: 'end', side: 'top', id: 'cups' }, () =>
        h('p', 'Tarifa 2.0TD'),
      ),
  ],
  'popover abierto y centrado con disparador propio': [
    r(R.Popover, { trigger: r(R.IconButton, { icon: IconR, label: 'Ver CUPS' }), open: true, align: 'center' }, 'Potencia 4,6 kW'),
    () =>
      h(
        V.Popover,
        { open: true, align: 'center' },
        { trigger: () => h(V.IconButton, { icon: IconV, label: 'Ver CUPS' }), default: text('Potencia 4,6 kW') },
      ),
  ],
  'banner de aviso con acción y cerrar': [
    r(
      R.Banner,
      { tone: 'warning', title: 'Mantenimiento', action: r(R.Button, { variant: 'link' }, 'Ver detalles'), onDismiss: () => {} },
      'El portal de la distribuidora no responde.',
    ),
    () =>
      h(
        V.Banner,
        { tone: 'warning', title: 'Mantenimiento', dismissible: true },
        {
          default: text('El portal de la distribuidora no responde.'),
          action: () => h(V.Button, { variant: 'link' }, text('Ver detalles')),
        },
      ),
  ],
  'banners de error (alert), marca y sin rol': [
    r(
      'div',
      null,
      r(R.Banner, { tone: 'danger', title: 'Sin conexión' }),
      r(R.Banner, { tone: 'brand', title: 'Novedad', dismissLabel: 'Ocultar', onDismiss: () => {} }, 'Ya puedes firmar ofertas.'),
      r(R.Banner, { tone: 'success', title: 'Listo', role: 'none' }),
    ),
    () =>
      h('div', [
        h(V.Banner, { tone: 'danger', title: 'Sin conexión' }),
        h(V.Banner, { tone: 'brand', title: 'Novedad', dismissLabel: 'Ocultar', dismissible: true }, text('Ya puedes firmar ofertas.')),
        h(V.Banner, { tone: 'success', title: 'Listo', role: 'none' }),
      ]),
  ],
  'barra de acciones en línea con quitar selección': [
    r(R.ActionBar, { count: 3, inline: true, onClear: () => {} }, r(R.Button, { variant: 'secondary', size: 'sm' }, 'Exportar')),
    () =>
      h(V.ActionBar, { count: 3, inline: true, clearable: true }, () =>
        h(V.Button, { variant: 'secondary', size: 'sm' }, text('Exportar')),
      ),
  ],
  'barra de acciones flotante con una fila y texto propio': [
    r(
      'div',
      null,
      r(R.ActionBar, { count: 1 }),
      r(R.ActionBar, { count: 2, label: 'Dos instalaciones', clearLabel: 'Cancelar', onClear: () => {} }),
    ),
    () =>
      h('div', [
        h(V.ActionBar, { count: 1 }),
        h(V.ActionBar, { count: 2, label: 'Dos instalaciones', clearLabel: 'Cancelar', clearable: true }),
      ]),
  ],
  'barra de acciones vacía': [r('div', null, r(R.ActionBar, { count: 0 })), () => h('div', [h(V.ActionBar, { count: 0 })])],
  'barra de acciones en alemán': [
    r(R.GradoProvider, { locale: 'de-DE' }, r(R.ActionBar, { count: 4, onClear: () => {} })),
    () => h(V.GradoProvider, { locale: 'de-DE' }, () => h(V.ActionBar, { count: 4, clearable: true })),
  ],
  'menú contextual cerrado, con y sin nombre': [
    r('div', null, r(R.ContextMenu, { items, label: 'Instalación de Lucía' }, r('p', null, 'Zona')), r(R.ContextMenu, { items }, 'Zona')),
    () =>
      h('div', [
        h(V.ContextMenu, { items, label: 'Instalación de Lucía' }, () => h('p', 'Zona')),
        h(V.ContextMenu, { items }, text('Zona')),
      ]),
  ],
  'botones de icono: normal, conmutados y desactivado': [
    r(
      'div',
      null,
      r(R.IconButton, { icon: IconR, label: 'Ajustes' }),
      r(R.IconButton, { icon: IconR, label: 'Fijar', variant: 'secondary', pressed: true }),
      r(R.IconButton, { icon: IconR, label: 'Silenciar', size: 'sm', defaultPressed: false }),
      r(R.IconButton, { icon: IconR, label: 'Borrar', variant: 'primary', size: 'lg', disabled: true }),
    ),
    () =>
      h('div', [
        h(V.IconButton, { icon: IconV, label: 'Ajustes' }),
        h(V.IconButton, { icon: IconV, label: 'Fijar', variant: 'secondary', pressed: true }),
        h(V.IconButton, { icon: IconV, label: 'Silenciar', size: 'sm', defaultPressed: false }),
        h(V.IconButton, { icon: IconV, label: 'Borrar', variant: 'primary', size: 'lg', disabled: true }),
      ]),
  ],
  'grupo conmutable de una opción': [
    r(R.ToggleGroup, { label: 'Formato', options: formats, value: 'i' }),
    () => h(V.ToggleGroup, { label: 'Formato', options: formats, modelValue: 'i' }),
  ],
  'grupo conmutable múltiple solo con iconos, pequeño': [
    r(R.ToggleGroup, {
      label: 'Formato',
      type: 'multiple',
      options: withIcons(IconR),
      defaultValue: ['b', 'u'],
      iconOnly: true,
      size: 'sm',
    }),
    () =>
      h(V.ToggleGroup, {
        label: 'Formato',
        type: 'multiple',
        options: withIcons(IconV),
        defaultValue: ['b', 'u'],
        iconOnly: true,
        size: 'sm',
      }),
  ],
  'grupo conmutable desactivado y grande, sin selección': [
    r(R.ToggleGroup, { label: 'Filtros', type: 'multiple', options: withIcons(IconR), disabled: true, size: 'lg' }),
    () => h(V.ToggleGroup, { label: 'Filtros', type: 'multiple', options: withIcons(IconV), disabled: true, size: 'lg' }),
  ],
  'armazón con banner bajo la cabecera': [
    r(
      R.AppShell,
      {
        product: 'Kompilot',
        banner: r(R.Banner, { tone: 'warning', title: 'Mantenimiento' }, 'Portal de i-DE sin servicio'),
        sidebar: r(R.Nav, null, r(R.NavItem, { href: '/', label: 'Inicio' })),
      },
      'Hola',
    ),
    () =>
      h(
        V.AppShell,
        { product: 'Kompilot' },
        {
          banner: () => h(V.Banner, { tone: 'warning', title: 'Mantenimiento' }, text('Portal de i-DE sin servicio')),
          sidebar: () => h(V.Nav, null, () => h(V.NavItem, { href: '/', label: 'Inicio' })),
          default: text('Hola'),
        },
      ),
  ],
}

const html = {}
for (const [name, [reactTree, vueRender]] of Object.entries(SCENARIOS)) {
  test(`mismo HTML en React y Vue: ${name}`, async () => {
    const react = same(renderToStaticMarkup(reactTree))
    const vue = same(await renderToString(createSSRApp({ render: vueRender })))
    html[name] = react
    assert.equal(vue, react)
  })
}

test('popover: disparador y panel enlazados, con nombre', () => {
  const closed = html['popover cerrado con texto']
  assert.match(closed, /aria-expanded="false"/)
  assert.match(closed, /aria-haspopup="dialog"/)
  assert.doesNotMatch(closed, /role="dialog"/)
  const open = html['popover abierto con título, arriba y al final']
  assert.match(open, /aria-controls="cups"/)
  assert.match(open, /aria-labelledby="cups-title" class="[^"]*" id="cups" role="dialog" tabindex="-1"/)
  assert.match(open, /<p class="k5-popover__title" id="cups-title">/)
  assert.match(open, /k5-popover__content--end k5-popover__content--top/)
  const custom = html['popover abierto y centrado con disparador propio']
  assert.match(custom, /aria-controls="k5-popover-AUTO" aria-expanded="true" aria-haspopup="dialog" aria-label="Ver CUPS"/)
  assert.match(custom, /k5-popover__content--center/)
})

test('banner: role alert en danger y status en el resto', () => {
  const out = html['banners de error (alert), marca y sin rol']
  assert.match(out, /class="k5-banner k5-banner--danger" role="alert"/)
  assert.match(out, /class="k5-banner k5-banner--brand" role="status"/)
  assert.match(out, /class="k5-banner k5-banner--success">/)
  assert.match(
    html['armazón con banner bajo la cabecera'],
    /<\/header><div class="k5-app__banner"><div class="k5-banner k5-banner--warning"/,
  )
})

test('barra de acciones: plural, toolbar con nombre y nada con 0', () => {
  assert.match(
    html['barra de acciones en línea con quitar selección'],
    /aria-label="3 seleccionadas" class="k5-action-bar k5-action-bar--inline" role="toolbar"/,
  )
  assert.match(html['barra de acciones en línea con quitar selección'], /Quitar selección/)
  assert.match(html['barra de acciones flotante con una fila y texto propio'], /aria-label="1 seleccionada"/)
  assert.equal(html['barra de acciones vacía'], '<div></div>')
  assert.match(html['barra de acciones en alemán'], /4 ausgewählt[\s\S]*Auswahl aufheben/)
})

test('botones de icono y grupo conmutable: aria-pressed y foco itinerante', () => {
  const icons = html['botones de icono: normal, conmutados y desactivado']
  assert.match(icons, /aria-label="Ajustes" class="k5-btn k5-btn--ghost k5-btn--icon" title="Ajustes"/)
  assert.match(icons, /aria-label="Fijar" aria-pressed="true"/)
  assert.match(icons, /aria-label="Silenciar" aria-pressed="false"/)
  const single = html['grupo conmutable de una opción']
  assert.equal([...single.matchAll(/tabindex="0"/g)].length, 1)
  assert.match(single, /aria-pressed="true" class="k5-toggle-group__item" tabindex="0" type="button"><span>Cursiva/)
  const multi = html['grupo conmutable múltiple solo con iconos, pequeño']
  assert.match(multi, /class="k5-toggle-group k5-toggle-group--icon k5-toggle-group--sm"/)
  assert.match(multi, /aria-label="Negrita" aria-pressed="true"/)
  assert.doesNotMatch(multi, /<span>/)
  assert.doesNotMatch(html['grupo conmutable desactivado y grande, sin selección'], /tabindex="0"/)
})
