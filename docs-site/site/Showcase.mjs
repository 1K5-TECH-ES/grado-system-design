// Pantalla de ejemplo de la portada: Sales Coach · Tickets, montada solo con componentes de Grado
// (la misma escena que la propuesta «Precisión» de 0.9). Datos de ejemplo.
import { createElement as h, useState } from 'react'
import * as G from '@1k5-tech-es/grado-react'

const icon = (...paths) =>
  function Icon(props) {
    return h(
      'svg',
      {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...props,
      },
      ...paths.map((d) => h('path', { key: d, d })),
    )
  }
const Inbox = icon(
  'M22 12h-6l-2 3h-4l-2-3H2',
  'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11',
)
const User = icon('M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8')
const Chat = icon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z')
const Ticket = icon(
  'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z',
  'M13 5v2',
  'M13 17v2',
  'M13 11v2',
)
const Users = icon(
  'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
  'M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  'M22 21v-2a4 4 0 0 0-3-3.87',
  'M16 3.13a4 4 0 0 1 0 7.75',
)
const Book = icon('M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z', 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z')
const Chart = icon('M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3')
const Plus = icon('M5 12h14', 'M12 5v14')
const Sliders = icon('M20 7h-9', 'M14 17H5', 'M17 17a3 3 0 1 0 0-.01', 'M7 7a3 3 0 1 0 0-.01')

const STATES = [
  ['En curso', 'started'],
  ['Abierto', 'todo'],
  ['Esperando al cliente', 'waiting'],
  ['Nuevo', 'backlog'],
]
const LABEL_TONE = {
  Monitorización: 'info',
  Facturación: 'warning',
  Inversor: 'danger',
  Batería: 'success',
  Legalización: 'brand',
  Cargador: 'highlight',
}
const ROWS = [
  {
    id: 'K5-4808',
    titulo: 'La app muestra 0 kWh de producción desde el lunes',
    estado: 'En curso',
    etiqueta: 'Monitorización',
    agente: 'Lucía Fernández',
    fecha: '18 nov',
  },
  {
    id: 'K5-4803',
    titulo: 'Cambio de titular del contrato de compensación',
    estado: 'En curso',
    etiqueta: 'Facturación',
    agente: 'Ana Pérez',
    fecha: '17 nov',
  },
  {
    id: 'K5-4821',
    titulo: 'El inversor no se conecta tras el corte de luz',
    estado: 'Abierto',
    etiqueta: 'Inversor',
    agente: 'Marta Ruiz',
    fecha: '19 nov',
  },
  {
    id: 'K5-4799',
    titulo: 'Batería al 100 % pero no descarga por la noche',
    estado: 'Abierto',
    etiqueta: 'Batería',
    agente: 'Marta Ruiz',
    fecha: '16 nov',
  },
  {
    id: 'K5-4819',
    titulo: 'Ampliación de 6,2 a 8,4 kWp: ¿hace falta nueva legalización?',
    estado: 'Esperando al cliente',
    etiqueta: 'Legalización',
    agente: 'Ana Pérez',
    fecha: '15 nov',
  },
  {
    id: 'K5-4812',
    titulo: 'Presupuesto de cargador para el garaje comunitario',
    estado: 'Nuevo',
    etiqueta: 'Cargador',
    agente: '',
    fecha: '14 nov',
  },
]
const COLUMNS = [
  { key: 'id', header: 'Ticket', render: (row) => h('span', { className: 'docs-showcase__id' }, row.id) },
  { key: 'titulo', header: 'Asunto', render: (row) => h('span', { className: 'docs-showcase__title' }, row.titulo) },
  { key: 'etiqueta', header: 'Etiqueta', render: (row) => h(G.Badge, { tone: LABEL_TONE[row.etiqueta] }, row.etiqueta) },
  {
    key: 'agente',
    header: 'Agente',
    render: (row) => (row.agente ? h(G.Avatar, { name: row.agente, size: 'sm' }) : h(G.Text, { as: 'span', tone: 'tertiary' }, '—')),
  },
  {
    key: 'fecha',
    header: 'Fecha',
    numeric: true,
    render: (row) => h(G.Text, { as: 'span', size: 'caption', tone: 'tertiary' }, row.fecha),
  },
]
const STEP = Object.fromEntries(STATES)

export function Showcase() {
  const [view, setView] = useState('abiertos')
  const [filters, setFilters] = useState([
    { id: 'estado', field: 'Estado', operator: 'es uno de', value: 'Abierto, En curso +2' },
    { id: 'zona', field: 'Zona', operator: 'es', value: 'Andalucía' },
  ])
  const nav = (label, Icon, extra = {}) =>
    h(G.NavItem, { href: '#', label, icon: Icon, onClick: (event) => event.preventDefault(), ...extra })
  return h(
    'div',
    { className: 'docs-showcase', role: 'region', 'aria-label': 'Ejemplo: Sales Coach, lista de tickets hecha con componentes de Grado' },
    h(
      'div',
      { className: 'docs-showcase__side' },
      h('div', { className: 'docs-showcase__team' }, h(G.Avatar, { name: 'Sales Coach', size: 'sm' }), h('b', null, 'Sales Coach')),
      h(
        G.Nav,
        { label: 'Ejemplo de navegación' },
        h(G.NavSection, null, nav('Bandeja', Inbox, { badge: 3 }), nav('Mis tickets', User), nav('Chat', Chat)),
        h(
          G.NavSection,
          { title: 'Postventa España' },
          nav('Tickets', Ticket, { active: true }),
          nav('Clientes', Users),
          nav('Base de conocimiento', Book),
          nav('Estadísticas', Chart),
        ),
      ),
    ),
    h(
      'div',
      { className: 'docs-showcase__main' },
      h(
        G.PageHeader,
        {
          variant: 'bar',
          as: 'h2',
          title: 'Tickets',
          actions: h(
            G.Stack,
            { direction: 'row', gap: '1-5' },
            h(G.Button, { variant: 'secondary', size: 'sm', icon: Sliders }, 'Vista'),
            h(G.Button, { size: 'sm', icon: Plus, shortcut: ['C'] }, 'Nuevo ticket'),
          ),
        },
        h(G.SegmentedControl, {
          label: 'Vista',
          size: 'sm',
          value: view,
          onValueChange: setView,
          options: [
            { value: 'todos', label: 'Todos' },
            { value: 'abiertos', label: 'Abiertos' },
            { value: 'semana', label: 'Esta semana' },
          ],
        }),
      ),
      h(
        'div',
        { className: 'docs-showcase__filters' },
        h(G.FilterBar, {
          label: 'Filtros de ejemplo',
          filters,
          onEditFilter: () => {},
          onRemoveFilter: (id) => setFilters((list) => list.filter((filter) => filter.id !== id)),
        }),
      ),
      h(
        G.KpiGroup,
        { label: 'Indicadores de ejemplo', className: 'docs-showcase__kpis' },
        h(G.Kpi, { label: 'Tickets abiertos', value: '128', change: -5.9, better: 'lower' }),
        h(G.Kpi, { label: 'Primera respuesta', value: '1 h 12 min', change: -14.3, better: 'lower' }),
        h(G.Kpi, { label: 'Resueltos', value: '342', change: 10.0 }),
        h(G.Kpi, { label: 'Satisfacción', value: '4,6 / 5', change: 4.5 }),
      ),
      h(G.DataTable, {
        className: 'docs-showcase__list',
        caption: 'Tickets de ejemplo',
        rows: ROWS,
        columns: COLUMNS,
        rowKey: 'id',
        groupBy: 'estado',
        groupLabel: (key) => h(G.Status, { progress: STEP[key] }, key),
        pageSize: 20,
      }),
    ),
  )
}
