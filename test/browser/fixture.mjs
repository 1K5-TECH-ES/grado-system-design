import { createElement as r, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createApp, defineComponent, h, reactive } from 'vue'
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import * as maquetacion from './groups/maquetacion.fixture.mjs'
import * as datos from './groups/datos.fixture.mjs'
import * as graficos from './groups/graficos.fixture.mjs'
import * as entradas from './groups/entradas.fixture.mjs'
import * as superposiciones from './groups/superposiciones.fixture.mjs'
import * as formularios from './groups/formularios.fixture.mjs'
import * as tablas from './groups/tablas.fixture.mjs'
import * as energia from './groups/energia.fixture.mjs'
import * as labs from './groups/labs.fixture.mjs'
import { cases, missing, renderRefs } from './refs.fixture.mjs'

const groups = [maquetacion, datos, graficos, entradas, superposiciones, formularios, tablas, energia, labs]

const initial = () => ({
  auto: false,
  kwp: 8.4,
  period: 'm',
  provinces: ['md'],
  span: { start: '', end: '' },
  command: false,
  picked: '',
  modal: false,
  alert: false,
  drawer: false,
  preview: null,
  checked: false,
  choice: 'a',
  client: '',
  labels: [{ value: 'urgente', label: 'Urgente' }],
  label: '',
  tab: 'a',
  page: 1,
  toast: false,
  undone: false,
  action: '',
  range: { start: '2026-10-01', end: '2026-10-31' },
  files: [],
  step: 'a',
  filters: [
    { id: 'a', label: 'Estado' },
    { id: 'b', field: 'Provincia', operator: 'es', value: 'Madrid' },
  ],
  query: '',
  accordion: [],
  reduced: false,
  ...Object.assign({}, ...groups.map((g) => g.initial)),
})
function renderUI(framework, state, update) {
  // Para que un test cambie el estado sin tocar la página (un clic cerraría lo que esté abierto).
  window.fixtureUpdate = update
  const isVue = framework === 'vue',
    make = isVue ? h : r,
    G = isVue ? V : R
  const C = (name, props = {}, ...children) => {
    const mapped = { ...props },
      slots = {}
    if (isVue) {
      for (const [from, to] of Object.entries({
        onOpenChange: 'onUpdate:open',
        onValueChange: 'onUpdate:modelValue',
        onPageChange: 'onUpdate:page',
        onCheckedChange: 'onUpdate:modelValue',
        onQueryChange: 'onUpdate:query',
        onSelectionChange: 'onUpdate:selectedKeys',
        onSortChange: 'onUpdate:sort',
      }))
        if (from in mapped) {
          mapped[to] = mapped[from]
          delete mapped[from]
        }
      if ('value' in mapped) {
        mapped.modelValue = mapped.value
        delete mapped.value
      }
      if ('checked' in mapped) {
        mapped.modelValue = mapped.checked
        delete mapped.checked
      }
      if (mapped.onRemove) mapped.removable = true
      if (mapped.onRetry) mapped.retryable = true
      if (name === 'Stepper') mapped.interactive = true
      if (mapped.onClear) mapped.clearable = true
      // Las props con contenido son slots con nombre en Vue.
      for (const [prop, slot] of Object.entries({
        footer: 'footer',
        sidebar: 'sidebar',
        sidebarFooter: 'sidebar-footer',
        actions: 'actions',
        action: 'action',
        search: 'search',
        brand: 'brand',
      }))
        if (mapped[prop] != null && typeof mapped[prop] === 'object') {
          const content = mapped[prop]
          slots[slot] = () => content
          delete mapped[prop]
        }
      if (children.length) slots.default = () => children
      return make(G[name], mapped, slots)
    }
    return make(G[name], props, ...children)
  }
  const button = (label, fn, attrs = {}) => make('button', { type: 'button', onClick: fn, ...attrs }, label)
  const section = (id, ...children) => make('section', { id, style: { padding: '24px', borderBottom: '1px solid #ddd' } }, children)
  const set = (key) => (value) => update({ [key]: value })
  const num = isVue ? { class: 'k5-num' } : { className: 'k5-num' }
  const people = [
    { value: 'a', label: 'Lucía Fernández' },
    { value: 'disabled', label: 'Javier', disabled: true },
    { value: 'b', label: 'Marta Ruiz' },
  ]
  const items = [
    { value: 'a', label: 'Resumen', content: 'Contenido resumen' },
    { value: 'disabled', label: 'Desactivada', disabled: true },
    { value: 'b', label: 'Documentos', content: 'Contenido documentos' },
  ]
  const allRows = [
    { id: '1', name: 'Lucía', power: 10 },
    { id: '2', name: 'Ana', power: 2 },
    { id: '3', name: 'Marta', power: 30 },
    { id: '4', name: 'Javier', power: 8 },
    { id: '5', name: 'Carlos', power: 5 },
  ]
  // Página aparte para el armazón: ocupa toda la ventana y se prueba en móvil.
  if (new URLSearchParams(location.search).get('shell')) {
    return C(
      'AppShell',
      {
        product: 'Sales Coach',
        mainId: 'contenido',
        actions: C('Avatar', { name: 'Lucía Fernández', status: 'online' }),
        sidebar: C(
          'Nav',
          null,
          C(
            'NavSection',
            null,
            C('NavItem', { href: '#tickets', label: 'Tickets', active: true, badge: 12 }),
            C('NavItem', { href: '#clientes', label: 'Clientes' }),
          ),
          C(
            'NavSection',
            { title: 'Bandejas' },
            C('NavGroup', { label: 'Email', defaultOpen: true }, C('NavItem', { href: '#soporte', label: 'soporte@1komma5.es' })),
          ),
        ),
      },
      C('PageHeader', { title: 'Tickets', subtitle: 'Soporte postventa' }),
      make('p', null, 'Contenido de la página'),
    )
  }
  return make('div', null, [
    section(
      'base',
      C('PageHeader', { title: 'Instalaciones', subtitle: 'Datos de ejemplo', as: 'h2' }),
      C('Button', null, 'Guardar'),
      C('Button', { variant: 'secondary', size: 'sm' }, 'Cancelar'),
      C('Button', { variant: 'danger', loading: true }, 'Eliminando'),
      C('Badge', { tone: 'success' }, 'Firmada'),
      C('Avatar', { name: 'Lucía Fernández', status: 'online' }),
      C('Spinner', { label: 'Cargando instalaciones' }),
      C('Switch', { label: 'Respuesta automática', description: 'Fuera del horario', checked: state.auto, onCheckedChange: set('auto') }),
      make('output', null, String(state.auto)),
      C('Field', { label: 'Notas', hint: 'Para el instalador' }, C('Textarea', { rows: 2 })),
      C(
        'Card',
        null,
        C('CardHeader', null, C('CardTitle', null, 'Instalación'), C('CardDescription', null, 'Valencia')),
        C('CardContent', null, '8,4 kWp'),
      ),
      C(
        'Table',
        { caption: 'Instalaciones' },
        make('thead', null, [make('tr', null, [make('th', null, 'Cliente'), make('th', num, 'Potencia')])]),
        make('tbody', null, [make('tr', null, [make('td', null, 'Lucía'), make('td', num, '8,4 kWp')])]),
      ),
      C(
        'KpiGroup',
        null,
        C('Kpi', { label: 'Instalaciones activas', value: '128', change: 10, previous: '116' }),
        C('Kpi', { label: 'Incidencias', value: '7', tone: 'danger', hint: 'Fuera de plazo' }),
      ),
      C('EmptyState', { title: 'Todo al día', description: 'No hay documentos pendientes.' }),
    ),
    section(
      'dialog',
      button('Abrir diálogo', () => update({ modal: true })),
      C(
        'Dialog',
        {
          title: 'Editar',
          description: 'Datos del cliente',
          open: state.modal,
          onOpenChange: set('modal'),
          footer: button('Guardar', () => update({ modal: false })),
        },
        make('label', null, ['Nombre', make('input', { defaultValue: 'Lucía' })]),
        C('Tooltip', { label: 'Ayuda del nombre', content: 'Como aparece en el DNI' }),
      ),
    ),
    section(
      'alert',
      button('Abrir confirmación', () => update({ alert: true })),
      C(
        'AlertDialog',
        {
          title: 'Confirmar eliminación',
          open: state.alert,
          onOpenChange: set('alert'),
          footer: button('Confirmar', () => update({ action: 'confirmed', alert: false })),
        },
        'Confirma la acción',
      ),
    ),
    section(
      'editor',
      button('Abrir editor', () => update({ editor: true })),
      C(
        'Dialog',
        {
          title: 'Plano de cubierta',
          open: state.editor,
          onOpenChange: set('editor'),
          fullscreen: true,
          header: false,
          closeOnEscape: false,
        },
        button('Listo', () => update({ editor: false })),
      ),
    ),
    section(
      'drawer',
      button('Abrir panel', () => update({ drawer: true })),
      C('Drawer', { title: 'Ficha', open: state.drawer, onOpenChange: set('drawer') }, 'Contenido de la ficha'),
    ),
    // Vista previa sin velo (0.9): se pasa de una fila a otra con el panel abierto.
    section(
      'preview',
      button('Fila 1', () => update({ preview: 'Fila 1' })),
      button('Fila 2', () => update({ preview: 'Fila 2' })),
      C(
        'Drawer',
        {
          title: state.preview ?? 'Vista previa',
          modal: false,
          open: state.preview != null,
          onOpenChange: (open) => !open && update({ preview: null }),
        },
        'Detalle de la fila',
      ),
    ),
    section('tabs', C('Tabs', { items, label: 'Ficha', value: state.tab, onValueChange: set('tab') })),
    section(
      'checkbox',
      C('Checkbox', { label: 'Aceptar', checked: state.checked, onCheckedChange: set('checked') }),
      make('output', null, String(state.checked)),
    ),
    section('radio', C('RadioGroup', { label: 'Opciones', options: people, value: state.choice, onValueChange: set('choice') })),
    section(
      'combo',
      C(
        'Field',
        { label: 'Cliente', hint: 'Busca un nombre' },
        C('Combobox', { options: people, value: state.client, onValueChange: set('client'), name: 'cliente' }),
      ),
      make('output', null, state.client),
    ),
    // Combobox con «Crear "…"» (0.9): la app añade la opción y la selecciona.
    section(
      'creatable',
      C(
        'Field',
        { label: 'Etiqueta' },
        C('Combobox', {
          options: state.labels,
          value: state.label,
          onValueChange: set('label'),
          creatable: true,
          onCreate: (query) =>
            update({ labels: [...state.labels, { value: query.toLowerCase(), label: query }], label: query.toLowerCase() }),
        }),
      ),
      make('output', null, state.label),
    ),
    section(
      'menu',
      C('DropdownMenu', {
        label: 'Acciones',
        items: [
          { id: 'edit', label: 'Editar', shortcut: ['⌘', 'e'] },
          { id: 'disabled', label: 'Desactivado', disabled: true },
          { id: 'delete', label: 'Eliminar', danger: true },
        ],
        onAction: set('action'),
      }),
      make('output', null, state.action),
    ),
    section('tooltip', C('Tooltip', { label: 'Ayuda', content: 'Texto de ayuda' }, '?')),
    section(
      'toast',
      button('Notificar', () => update({ toast: true })),
      C('Toast', { title: 'Guardado', open: state.toast, duration: 500, onOpenChange: set('toast') }, 'Cambios guardados'),
    ),
    section('pagination', C('Pagination', { total: 128, pageSize: 10, page: state.page, onPageChange: set('page') })),
    section(
      'range',
      C('DateRangePicker', { label: 'Periodo', value: state.range, onValueChange: set('range'), min: '2026-01-01', max: '2027-12-31' }),
    ),
    section(
      'upload',
      C('FileUpload', {
        accept: '.pdf',
        maxSize: 100,
        multiple: true,
        files: state.files,
        onFilesChange: (files) => update({ files: files.map((file, i) => ({ id: String(i), name: file.name, status: 'success' })) }),
        onRemove: (id) => update({ files: state.files.filter((file) => file.id !== id) }),
      }),
    ),
    section(
      'stepper',
      C('Stepper', {
        items: [
          { id: 'a', label: 'Cliente' },
          { id: 'b', label: 'Oferta' },
        ],
        value: state.step,
        onValueChange: set('step'),
      }),
    ),
    section(
      'filters',
      C('FilterBar', {
        query: state.query,
        onQueryChange: set('query'),
        filters: state.filters,
        onRemoveFilter: (id) => update({ filters: state.filters.filter((f) => f.id !== id) }),
        // Filtro en partes (0.9): el operador alterna y el valor pasa a Valencia.
        editable: true,
        onEditFilter: (id, part) =>
          update({
            filters: state.filters.map((f) =>
              f.id !== id
                ? f
                : part === 'operator'
                  ? { ...f, operator: f.operator === 'es' ? 'no es' : 'es' }
                  : part === 'value'
                    ? { ...f, value: 'Valencia' }
                    : f,
            ),
          }),
        onClear: () => update({ query: '', filters: [] }),
      }),
    ),
    section(
      'accordion',
      C('Accordion', {
        items: [
          { value: 'a', title: 'Primero', content: 'Primer contenido' },
          { value: 'b', title: 'Segundo', content: 'Segundo contenido' },
        ],
        value: state.accordion,
        onValueChange: set('accordion'),
      }),
    ),
    section(
      'number',
      C(
        'Field',
        { label: 'Potencia instalada' },
        C('NumberInput', { value: state.kwp, onValueChange: set('kwp'), step: 0.1, min: 0, max: 20, suffix: 'kWp', name: 'kwp' }),
      ),
      make('output', null, String(state.kwp)),
    ),
    section(
      'segmented',
      C('SegmentedControl', {
        label: 'Periodo',
        options: [
          { value: 'd', label: 'Día' },
          { value: 'w', label: 'Semana' },
          { value: 'm', label: 'Mes' },
          { value: 'y', label: 'Año', disabled: true },
        ],
        value: state.period,
        onValueChange: set('period'),
      }),
      make('output', null, state.period),
    ),
    section(
      'multi',
      C(
        'Field',
        { label: 'Provincias' },
        C('MultiSelect', {
          options: [
            { value: 'md', label: 'Madrid' },
            { value: 'vc', label: 'Valencia' },
            { value: 'se', label: 'Sevilla' },
          ],
          value: state.provinces,
          onValueChange: set('provinces'),
        }),
      ),
      make('output', null, state.provinces.join(',')),
    ),
    section(
      'calendar',
      C('Calendar', { mode: 'range', today: '2026-11-04', min: '2026-11-02', value: state.span, onValueChange: set('span') }),
      make('output', null, `${state.span.start}/${state.span.end}`),
    ),
    section(
      'command',
      button('Abrir paleta', () => update({ command: true })),
      C('CommandPalette', {
        open: state.command,
        onOpenChange: set('command'),
        onSelect: set('picked'),
        groups: [
          {
            label: 'Acciones',
            items: [
              { id: 'offer', label: 'Nueva oferta', shortcut: 'N' },
              { id: 'blocked', label: 'Bloqueada', disabled: true },
            ],
          },
          { label: 'Clientes', items: [{ id: 'lucia', label: 'Lucía Fernández', description: 'Valencia' }] },
        ],
      }),
      make('output', null, state.picked),
    ),
    section(
      'chart',
      C('BarChart', {
        title: 'Producción de octubre',
        description: 'Datos de ejemplo',
        categoryKey: 'semana',
        categoryLabel: 'Semana',
        unit: 'kWh',
        stacked: true,
        data: [
          { semana: 'S1', auto: 210, exc: 85 },
          { semana: 'S2', auto: 185, exc: 70 },
          { semana: 'S3', auto: 160, exc: 55 },
        ],
        series: [
          { key: 'auto', label: 'Autoconsumo' },
          { key: 'exc', label: 'Excedentes' },
        ],
      }),
    ),
    section(
      'toaster',
      button('Avisar', () => {
        G.toast.success('Oferta enviada', {
          duration: 0,
          action: { label: 'Deshacer', shortcut: ['⌘', 'z'], onClick: () => update({ undone: true }) },
        })
        G.toast.error('No se ha podido guardar', { duration: 0 })
        G.toast('Documento subido', { duration: 0 })
        G.toast('Instalación programada', { duration: 0 })
      }),
      button('Cerrar avisos', () => G.toast.dismiss()),
      make('output', null, String(state.undone)),
      C('Toaster', { max: 3 }),
    ),
    section('german', C('GradoProvider', { locale: 'de-DE' }, C('Pagination', { total: 40, pageSize: 10 }))),
    section(
      'table',
      button('Reducir filas', () => update({ reduced: true })),
      C('DataTable', {
        rows: state.reduced ? allRows.slice(0, 1) : allRows,
        columns: [
          { key: 'name', header: 'Cliente', sortable: true },
          { key: 'power', header: 'Potencia', sortable: true },
        ],
        rowKey: 'id',
        caption: 'Clientes',
        pageSize: 2,
        selectable: true,
      }),
    ),
    ...groups.flatMap((g) => g.render({ C, make, section, button, set, state, update, isVue })),
  ])
}
if (new URLSearchParams(location.search).get('framework') === 'vue')
  createApp(
    defineComponent({
      setup() {
        const state = reactive(initial())
        return () => renderUI('vue', state, (patch) => Object.assign(state, patch))
      },
    }),
  ).mount('#app')
else if (new URLSearchParams(location.search).get('refs')) {
  // Cada ref, como «Combobox: input[role=combobox]» si apunta al elemento esperado o «Combobox: DIV.k5-combobox» si no.
  const found = {}
  createRoot(document.querySelector('#app')).render(renderRefs(found))
  setTimeout(() => {
    window.refResults = {
      missing,
      results: cases.map(([name, , selector]) => {
        const node = found[name]
        const seen = node ? `${node.tagName}${node.classList.length ? `.${[...node.classList].join('.')}` : ''}` : 'null'
        return `${name}: ${node?.matches?.(selector) ? selector : seen}`
      }),
    }
  }, 100)
} else
  createRoot(document.querySelector('#app')).render(
    r(function App() {
      const [state, setState] = useState(initial())
      return renderUI('react', state, (patch) => setState((old) => ({ ...old, ...patch })))
    }),
  )
