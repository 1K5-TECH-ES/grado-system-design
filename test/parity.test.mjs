// React y Vue tienen que generar el mismo HTML con las mismas props.
// Si este test falla, uno de los dos paquetes se ha separado del otro.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import { normalize } from './normalize.mjs'

const IconR = (props) => r('svg', { 'aria-hidden': props['aria-hidden'], className: 'icono' })
const IconV = (props) => h('svg', { 'aria-hidden': props['aria-hidden'], class: 'icono' })
const text = (s) => () => s
const LinkR = ({ to, ...props }) => r('a', { ...props, href: to })
const LinkV = defineComponent({
  props: { to: String },
  setup(props, { slots }) {
    return () => h('a', { href: props.to }, slots.default?.())
  },
})

const navR = () =>
  r(
    R.Nav,
    null,
    r(
      R.NavSection,
      null,
      r(R.NavItem, { href: '/chat', label: 'Chat', icon: IconR }),
      r(R.NavItem, { as: LinkR, to: '/tickets', label: 'Tickets', icon: IconR, badge: 12, active: true }),
    ),
    r(
      R.NavSection,
      { title: 'Bandejas' },
      r(
        R.NavGroup,
        { label: 'Email', icon: IconR, defaultOpen: true, active: true },
        r(R.NavItem, { href: '/email/soporte', label: 'soporte@1komma5.es', active: true }),
        r(R.NavItem, { href: '/email/ventas', label: 'ventas@1komma5.es' }),
      ),
      r(R.NavGroup, { label: 'WhatsApp', icon: IconR, badge: '3' }, r(R.NavItem, { href: '/wa/1', label: 'Postventa' })),
    ),
  )
const navV = () =>
  h(V.Nav, null, () => [
    h(V.NavSection, null, () => [
      h(V.NavItem, { href: '/chat', label: 'Chat', icon: IconV }),
      h(V.NavItem, { as: LinkV, to: '/tickets', label: 'Tickets', icon: IconV, badge: 12, active: true }),
    ]),
    h(V.NavSection, { title: 'Bandejas' }, () => [
      h(V.NavGroup, { label: 'Email', icon: IconV, defaultOpen: true, active: true }, () => [
        h(V.NavItem, { href: '/email/soporte', label: 'soporte@1komma5.es', active: true }),
        h(V.NavItem, { href: '/email/ventas', label: 'ventas@1komma5.es' }),
      ]),
      h(V.NavGroup, { label: 'WhatsApp', icon: IconV, badge: '3' }, () => [h(V.NavItem, { href: '/wa/1', label: 'Postventa' })]),
    ]),
  ])

const SCENARIOS = {
  'botón principal con icono y clase extra': [
    r(R.Button, { icon: IconR, className: 'w-full' }, 'Nuevo ticket'),
    () => h(V.Button, { icon: IconV, class: 'w-full' }, text('Nuevo ticket')),
  ],
  'botón secundario pequeño cargando': [
    r(R.Button, { variant: 'secondary', size: 'sm', loading: true }, 'Guardar'),
    () => h(V.Button, { variant: 'secondary', size: 'sm', loading: true }, text('Guardar')),
  ],
  'botón fantasma solo icono': [
    r(R.Button, { variant: 'ghost', iconOnly: true, icon: IconR, 'aria-label': 'Ajustes' }),
    () => h(V.Button, { variant: 'ghost', iconOnly: true, icon: IconV, 'aria-label': 'Ajustes' }),
  ],
  'botón de borrar grande y de envío': [
    r(R.Button, { variant: 'danger', size: 'lg', type: 'submit', disabled: true }, 'Eliminar cliente'),
    () => h(V.Button, { variant: 'danger', size: 'lg', type: 'submit', disabled: true }, text('Eliminar cliente')),
  ],
  'botón con atajo de teclado': [
    r(R.Button, { shortcut: ['⌘', '↵'] }, 'Crear ticket'),
    () => h(V.Button, { shortcut: ['⌘', '↵'] }, text('Crear ticket')),
  ],
  'botón solo icono con atajo: sin teclas pintadas, con aria-keyshortcuts': [
    r(R.Button, { variant: 'ghost', iconOnly: true, icon: IconR, 'aria-label': 'Asignar', shortcut: ['a'] }),
    () => h(V.Button, { variant: 'ghost', iconOnly: true, icon: IconV, 'aria-label': 'Asignar', shortcut: ['a'] }),
  ],
  'estado con icono de progreso': [
    r('div', null, r(R.Status, { progress: 'started' }, 'En curso'), r(R.Status, { progress: 'done', tone: 'brand' }, 'Resuelto')),
    () =>
      h('div', null, [
        h(V.Status, { progress: 'started' }, text('En curso')),
        h(V.Status, { progress: 'done', tone: 'brand' }, text('Resuelto')),
      ]),
  ],
  // Sin descripción: la normalización de ids de Vue (v-0-1) se come el índice de su id.
  'select como chip de propiedad': [
    r(R.Select, { variant: 'property', 'aria-label': 'Prioridad' }, r('option', { value: 'alta' }, 'Alta')),
    () => h(V.Select, { variant: 'property', 'aria-label': 'Prioridad' }, () => h('option', { value: 'alta' }, 'Alta')),
  ],
  'opciones en tarjeta': [
    r(R.RadioGroup, {
      label: 'Tarifa',
      variant: 'card',
      orientation: 'horizontal',
      defaultValue: 'fija',
      options: [
        { value: 'fija', label: 'Fija · 0,14 €/kWh' },
        { value: 'dinamica', label: 'Dinámica' },
      ],
    }),
    () =>
      h(V.RadioGroup, {
        label: 'Tarifa',
        variant: 'card',
        orientation: 'horizontal',
        defaultValue: 'fija',
        options: [
          { value: 'fija', label: 'Fija · 0,14 €/kWh' },
          { value: 'dinamica', label: 'Dinámica' },
        ],
      }),
  ],
  'panel lateral sin velo': [
    r(R.Drawer, { title: 'Vista previa', modal: false }, 'Detalle'),
    () => h(V.Drawer, { title: 'Vista previa', modal: false }, () => 'Detalle'),
  ],
  'filtro en partes, editable y quitable': [
    r(R.FilterChip, { field: 'Estado', operator: 'es uno de', value: 'Abierta, En obra', onEdit: () => {}, onRemove: () => {} }),
    () => h(V.FilterChip, { field: 'Estado', operator: 'es uno de', value: 'Abierta, En obra', editable: true, removable: true }),
  ],
  'filtro en partes sin operador ni edición': [
    r(R.FilterChip, { field: 'Provincia', value: 'Madrid' }),
    () => h(V.FilterChip, { field: 'Provincia', value: 'Madrid' }),
  ],
  'badges de todos los tonos': [
    r(
      'div',
      null,
      ...['neutral', 'brand', 'info', 'success', 'warning', 'danger', 'highlight'].map((tone) => r(R.Badge, { tone, key: tone }, tone)),
    ),
    () =>
      h(
        'div',
        ['neutral', 'brand', 'info', 'success', 'warning', 'danger', 'highlight'].map((tone) => h(V.Badge, { tone }, text(tone))),
      ),
  ],
  'campo completo con sufijo y error': [
    r(
      R.Field,
      { id: 'kwp', label: 'Potencia instalada', hint: 'Suma de los módulos', error: 'Tiene que ser mayor que 0', required: true },
      r(R.Input, { suffix: 'kWp', defaultValue: '0', inputMode: 'decimal' }),
    ),
    () =>
      h(
        V.Field,
        { id: 'kwp', label: 'Potencia instalada', hint: 'Suma de los módulos', error: 'Tiene que ser mayor que 0', required: true },
        () => h(V.Input, { suffix: 'kWp', modelValue: '0', inputmode: 'decimal' }),
      ),
  ],
  'campo con id automático y textarea': [
    r(R.Field, { label: 'Notas internas' }, r(R.Textarea, { placeholder: 'Escribe una nota', rows: 3 })),
    () => h(V.Field, { label: 'Notas internas' }, () => h(V.Textarea, { placeholder: 'Escribe una nota', rows: 3 })),
  ],
  'input pequeño fuera de un campo': [
    r(R.Input, { size: 'sm', placeholder: 'Buscar en tickets', 'aria-label': 'Buscar' }),
    () => h(V.Input, { size: 'sm', placeholder: 'Buscar en tickets', 'aria-label': 'Buscar' }),
  ],
  'select dentro de un campo': [
    r(
      R.Field,
      { id: 'canal', label: 'Canal' },
      r(R.Select, null, r('option', { value: 'wa' }, 'WhatsApp'), r('option', { value: 'mail' }, 'Email')),
    ),
    () =>
      h(V.Field, { id: 'canal', label: 'Canal' }, () =>
        h(V.Select, null, () => [h('option', { value: 'wa' }, 'WhatsApp'), h('option', { value: 'mail' }, 'Email')]),
      ),
  ],
  'interruptor con etiqueta y descripción': [
    r(R.Switch, { checked: true, label: 'Respuesta automática', description: 'Fuera del horario de oficina', name: 'auto' }),
    () => h(V.Switch, { modelValue: true, label: 'Respuesta automática', description: 'Fuera del horario de oficina', name: 'auto' }),
  ],
  'interruptor sin etiqueta': [r(R.Switch, { 'aria-label': 'Activar avisos' }), () => h(V.Switch, { 'aria-label': 'Activar avisos' })],
  'tarjeta completa': [
    r(
      R.Card,
      null,
      r(R.CardHeader, null, r(R.CardTitle, null, 'Satisfacción del cliente'), r(R.CardDescription, null, 'Últimos 30 días')),
      r(R.CardContent, null, '4,6 / 5'),
      r(R.CardFooter, null, r(R.Button, { variant: 'secondary' }, 'Ver encuestas')),
    ),
    () =>
      h(V.Card, null, () => [
        h(V.CardHeader, null, () => [
          h(V.CardTitle, null, text('Satisfacción del cliente')),
          h(V.CardDescription, null, text('Últimos 30 días')),
        ]),
        h(V.CardContent, null, text('4,6 / 5')),
        h(V.CardFooter, null, () => h(V.Button, { variant: 'secondary' }, text('Ver encuestas'))),
      ]),
  ],
  'tarjeta de alerta con título h2': [
    r(R.Card, { variant: 'alert' }, r(R.CardContent, null, r(R.CardTitle, { as: 'h2' }, 'Pago rechazado'))),
    () => h(V.Card, { variant: 'alert' }, () => h(V.CardContent, null, () => h(V.CardTitle, { as: 'h2' }, text('Pago rechazado')))),
  ],
  'tabla sin caja': [
    r(R.Table, { plain: true }, r('tbody', null, r('tr', null, r('td', null, 'Marta Gil')))),
    () => h(V.Table, { plain: true }, () => [h('tbody', [h('tr', [h('td', 'Marta Gil')])])]),
  ],
  'botón destructive para confirmar': [
    r(R.Button, { variant: 'destructive' }, 'Eliminar instalación'),
    () => h(V.Button, { variant: 'destructive' }, text('Eliminar instalación')),
  ],
  'tabla compacta con título': [
    r(
      R.Table,
      { caption: 'Instalaciones', compact: true, className: 'min-w-[640px]' },
      r('thead', null, r('tr', null, r('th', null, 'Cliente'), r('th', { className: 'k5-num' }, 'kWp'))),
      r('tbody', null, r('tr', null, r('td', null, 'Marta Gil'), r('td', { className: 'k5-num' }, '8,4'))),
    ),
    () =>
      h(V.Table, { caption: 'Instalaciones', compact: true, class: 'min-w-[640px]' }, () => [
        h('thead', [h('tr', [h('th', 'Cliente'), h('th', { class: 'k5-num' }, 'kWp')])]),
        h('tbody', [h('tr', [h('td', 'Marta Gil'), h('td', { class: 'k5-num' }, '8,4')])]),
      ]),
  ],
  indicadores: [
    r(
      R.KpiGroup,
      null,
      r(R.Kpi, {
        label: 'Tickets abiertos',
        value: '128',
        change: -5.9,
        better: 'lower',
        previous: '136',
        selectable: true,
        selected: true,
      }),
      r(R.Kpi, { label: 'Primera respuesta', value: '1 h 12 min', change: 14.3, better: 'lower', previous: '1 h 03 min' }),
      r(R.Kpi, { label: 'Conversaciones', value: '2.140', change: 0.2, better: 'neutral', hint: 'Últimos 30 días' }),
      r(R.Kpi, { label: 'Vencidos', value: '7', tone: 'danger', hint: 'Fuera de SLA' }),
    ),
    () =>
      h(V.KpiGroup, null, () => [
        h(V.Kpi, {
          label: 'Tickets abiertos',
          value: '128',
          change: -5.9,
          better: 'lower',
          previous: '136',
          selectable: true,
          selected: true,
        }),
        h(V.Kpi, { label: 'Primera respuesta', value: '1 h 12 min', change: 14.3, better: 'lower', previous: '1 h 03 min' }),
        h(V.Kpi, { label: 'Conversaciones', value: '2.140', change: 0.2, better: 'neutral', hint: 'Últimos 30 días' }),
        h(V.Kpi, { label: 'Vencidos', value: '7', tone: 'danger', hint: 'Fuera de SLA' }),
      ]),
  ],
  'cabecera de página con acciones': [
    r(R.PageHeader, { title: 'Tickets', subtitle: 'Soporte postventa · España', actions: r(R.Button, null, 'Nuevo ticket') }),
    () =>
      h(
        V.PageHeader,
        { title: 'Tickets', subtitle: 'Soporte postventa · España' },
        { actions: () => h(V.Button, null, text('Nuevo ticket')) },
      ),
  ],
  'cabecera en barra con contenido en medio': [
    r(R.PageHeader, { variant: 'bar', title: 'Tickets', actions: r(R.Button, { size: 'sm' }, 'Nuevo ticket') }, r('span', null, 'Vistas')),
    () =>
      h(
        V.PageHeader,
        { variant: 'bar', title: 'Tickets' },
        { actions: () => h(V.Button, { size: 'sm' }, text('Nuevo ticket')), default: () => h('span', null, 'Vistas') },
      ),
  ],
  'estado vacío': [
    r(R.EmptyState, {
      icon: IconR,
      title: 'No hay tickets',
      description: 'Cuando entre uno nuevo aparecerá aquí.',
      action: r(R.Button, { variant: 'secondary' }, 'Crear ticket'),
    }),
    () =>
      h(
        V.EmptyState,
        { icon: IconV, title: 'No hay tickets', description: 'Cuando entre uno nuevo aparecerá aquí.' },
        { action: () => h(V.Button, { variant: 'secondary' }, text('Crear ticket')) },
      ),
  ],
  'estado vacío compacto y spinner': [
    r('div', null, r(R.EmptyState, { compact: true, description: 'Sin resultados' }), r(R.Spinner, { size: 'lg' })),
    () => h('div', [h(V.EmptyState, { compact: true, description: 'Sin resultados' }), h(V.Spinner, { size: 'lg' })]),
  ],
  'armazón completo': [
    r(
      R.AppShell,
      {
        product: 'Sales Coach',
        search: r(R.AppSearch, { label: 'Buscar clientes o tickets', shortcut: '⌘K' }),
        actions: r(R.Avatar, { name: 'Lucía Fernández', status: 'away' }),
        sidebar: navR(),
        sidebarFooter: r(R.NavItem, { href: '/ajustes', label: 'Ajustes', icon: IconR }),
      },
      r('p', null, 'Contenido'),
    ),
    () =>
      h(
        V.AppShell,
        { product: 'Sales Coach' },
        {
          search: () => h(V.AppSearch, { label: 'Buscar clientes o tickets', shortcut: '⌘K' }),
          actions: () => h(V.Avatar, { name: 'Lucía Fernández', status: 'away' }),
          sidebar: navV,
          'sidebar-footer': () => h(V.NavItem, { href: '/ajustes', label: 'Ajustes', icon: IconV }),
          default: () => h('p', 'Contenido'),
        },
      ),
  ],
  'armazón plegado': [
    r(R.AppShell, { collapsed: true, mainId: 'main', sidebar: navR() }, 'Hola'),
    () => h(V.AppShell, { collapsed: true, mainId: 'main' }, { sidebar: navV, default: text('Hola') }),
  ],
  'armazón sin barra lateral y con marca propia': [
    r(R.AppShell, { brand: r(LinkR, { to: '/' }, r(R.AppLogo, { label: 'Ir a la portada' })) }, 'Hola'),
    () =>
      h(V.AppShell, null, { brand: () => h(LinkV, { to: '/' }, () => h(V.AppLogo, { label: 'Ir a la portada' })), default: text('Hola') }),
  ],
  avatares: [
    r(
      'div',
      null,
      r(R.Avatar, { name: 'marta gil', size: 'sm' }),
      r(R.Avatar, { initials: 'AP', size: 'lg', status: 'online' }),
      r(R.Avatar, { name: 'Andrés Molina', status: 'busy' }),
    ),
    () =>
      h('div', [
        h(V.Avatar, { name: 'marta gil', size: 'sm' }),
        h(V.Avatar, { initials: 'AP', size: 'lg', status: 'online' }),
        h(V.Avatar, { name: 'Andrés Molina', status: 'busy' }),
      ]),
  ],
}

const html = {}
for (const [name, [reactTree, vueRender]] of Object.entries(SCENARIOS)) {
  test(`mismo HTML en React y Vue: ${name}`, async () => {
    const react = normalize(renderToStaticMarkup(reactTree))
    const vue = normalize(await renderToString(createSSRApp({ render: vueRender })))
    html[name] = react
    assert.equal(vue, react)
  })
}

test('el campo une etiqueta, control, ayuda y error', () => {
  const out = html['campo completo con sufijo y error']
  assert.match(out, /<label class="k5-field__label" for="kwp">/)
  assert.match(out, /<input aria-describedby="kwp-hint kwp-error" aria-invalid="true" class="k5-input" id="kwp"/)
  assert.match(out, /required/)
  assert.match(out, /<p class="k5-field__error" id="kwp-error">/)
})

test('el id automático enlaza etiqueta y control', () => {
  const out = html['campo con id automático y textarea']
  assert.match(out, /for="k5-AUTO"/)
  assert.match(out, /id="k5-AUTO"/)
})

test('el atajo se anuncia con aria-keyshortcuts y se pinta oculto a lectores de pantalla', () => {
  const html = renderToStaticMarkup(r(R.Button, { shortcut: ['⌘', '⇧', 'k'] }, 'Buscar'))
  assert.match(html, /aria-keyshortcuts="Meta\+Shift\+K"/)
  assert.match(html, /<span class="k5-btn__shortcut" aria-hidden="true"><kbd>⌘<\/kbd><kbd>⇧<\/kbd><kbd>k<\/kbd><\/span>/)
})

test('cada paso de progreso trae su tono, y tone manda si se da', () => {
  const html = renderToStaticMarkup(
    r('div', null, r(R.Status, { progress: 'started' }, 'a'), r(R.Status, { progress: 'done', tone: 'brand' }, 'b')),
  )
  assert.match(html, /class="k5-status k5-status--warning k5-status--progress k5-status--started"/)
  assert.match(html, /class="k5-status k5-status--brand k5-status--progress k5-status--done"/)
  assert.match(renderToStaticMarkup(r(R.Status, { progress: 'otro' }, 'c')), /class="k5-status k5-status--neutral"/)
})

test('un botón cargando queda desactivado y lo anuncia', () => {
  const out = html['botón secundario pequeño cargando']
  assert.match(out, /aria-busy="true"/)
  assert.match(out, /<button aria-busy="true" class="k5-btn k5-btn--secondary k5-btn--sm" disabled type="button">/)
})

test('los KPI marcan la variación buena o mala según better', () => {
  const out = html['indicadores']
  assert.match(out, /k5-kpi__change--good[^]*Baja <\/span>5,9 %/)
  assert.match(out, /k5-kpi__change--bad[^]*Sube <\/span>14,3 %/)
  assert.match(out, /k5-kpi__change--flat/)
  assert.match(out, /aria-pressed="true"/)
})

test('el armazón enlaza menú y barra lateral y marca la página actual', () => {
  const out = html['armazón completo']
  assert.match(out, /<a class="k5-app__skip" href="#contenido">Saltar al contenido<\/a>/)
  assert.match(out, /aria-controls="k5-app-sidebar" aria-expanded="false" aria-label="Menú"/)
  assert.match(out, /<aside class="k5-app__sidebar" id="k5-app-sidebar">/)
  assert.match(out, /<main class="k5-app__main" id="contenido" tabindex="-1">/)
  assert.match(out, /<a aria-current="page" class="k5-nav-item" href="\/tickets">/)
  assert.match(out, /aria-expanded="true"[^>]*data-active="true"/)
  assert.match(out, /<div class="k5-nav-group__items" hidden id="k5-group-AUTO">/)
  assert.match(out, /aria-label="Lucía Fernández · Ausente"/)
})

test('plegado: los elementos llevan su nombre como title', () => {
  assert.match(html['armazón plegado'], /<a class="k5-nav-item" href="\/chat" title="Chat">/)
})

test('FilterChip en partes: grupo con la frase entera, una parte por botón y quitar con la frase', () => {
  const html = renderToStaticMarkup(
    r(R.FilterChip, { field: 'Estado', operator: 'es uno de', value: 'Abierta, En obra', onEdit: () => {}, onRemove: () => {} }),
  )
  assert.match(html, /^<span class="k5-chip k5-chip--parts" role="group" aria-label="Estado es uno de Abierta, En obra">/)
  assert.match(html, /<button type="button" class="k5-chip__part k5-chip__field">Estado<\/button>/)
  assert.match(html, /<button type="button" class="k5-chip__part k5-chip__operator">es uno de<\/button>/)
  assert.match(html, /aria-label="Quitar filtro: Estado es uno de Abierta, En obra"/)
  // Sin onEdit, las partes son texto; sin field, el chip de siempre.
  assert.match(
    renderToStaticMarkup(r(R.FilterChip, { field: 'Provincia', value: 'Madrid' })),
    /<span class="k5-chip__part k5-chip__value">Madrid<\/span>/,
  )
  assert.equal(renderToStaticMarkup(r(R.FilterChip, { label: 'Estado: abierto' })), '<span class="k5-chip">Estado: abierto</span>')
})

test('Drawer sin velo: sin aria-modal y con su clase; Dialog sigue modal', () => {
  const html = renderToStaticMarkup(r(R.Drawer, { title: 'Vista previa', modal: false }, 'Detalle'))
  assert.match(html, /class="k5-dialog k5-drawer k5-drawer--modeless"/)
  assert.doesNotMatch(html, /aria-modal/)
  assert.match(renderToStaticMarkup(r(R.Drawer, { title: 'Ficha' }, 'Detalle')), /aria-modal="true"/)
})
