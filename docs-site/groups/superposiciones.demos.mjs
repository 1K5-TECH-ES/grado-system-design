// Web de documentación · grupo «superposiciones y acciones»: demo en vivo de cada ficha (id → componente React).
// No importes doc-helpers.mjs aquí: demos.mjs carga este archivo y doc-helpers carga demos.mjs.
import { createElement as h, useState } from 'react'
import * as G from '@1k5-tech-es/grado-react'
import { formatNumber } from '@1k5-tech-es/grado/patterns'

// Iconos de Lucide dibujados a mano, para no depender de lucide-react en la web.
const icon = (...paths) =>
  function Icon(props) {
    return h(
      'svg',
      {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...props,
      },
      ...paths.map((d) => h('path', { d, key: d })),
    )
  }
const Pin = icon(
  'M12 17v5',
  'M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z',
)
const Bell = icon('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0')
const Download = icon('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3')
const Settings = icon('M20 7h-9', 'M14 17H5', 'M17 17a3 3 0 1 0 0-.01', 'M7 7a3 3 0 1 0 0-.01')
const Sun = icon(
  'M12 2v2',
  'M12 20v2',
  'M4.93 4.93l1.41 1.41',
  'M17.66 17.66l1.41 1.41',
  'M2 12h2',
  'M20 12h2',
  'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
)
const Chart = icon('M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3')
const Info = icon('M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0', 'M12 16v-4', 'M12 8h.01')

const stack = (...children) => h('div', { className: 'live-stack' }, ...children)
const start = (...children) => h('div', { className: 'live-stack live-stack--start' }, ...children)
const row = (...children) => h('div', { className: 'demo-row' }, ...children)
const status = (text) => h('p', { className: 'demo-status', role: 'status' }, text)
const kw = (value) => `${formatNumber(value, 'es-ES', 1)} kW`
const datum = (name, value) => h('p', { style: { margin: '0 0 0.5rem' } }, h('span', { className: 'demo-status' }, name), h('br'), value)

function PopoverDemo() {
  const [message, setMessage] = useState('')
  return start(
    row(
      h(
        G.Popover,
        { label: 'Ver suministro', title: 'CUPS ES0021000000000001AB' },
        datum('Distribuidora', 'i-DE Redes Eléctricas Inteligentes'),
        datum('Tarifa de acceso', '2.0TD'),
        datum('Potencia contratada', `P1 ${kw(4.6)} · P2 ${kw(4.6)}`),
        h(G.Button, { variant: 'secondary', size: 'sm', onClick: () => setMessage('CUPS copiado (demostración).') }, 'Copiar CUPS'),
      ),
      h(
        G.Popover,
        { trigger: h(G.IconButton, { icon: Info, label: 'Qué es el CUPS' }), label: 'Qué es el CUPS', align: 'center' },
        'Código Universal del Punto de Suministro: identifica la conexión de la vivienda a la red.',
      ),
    ),
    message && status(message),
  )
}

function BannerDemo() {
  const [visible, setVisible] = useState(true)
  return stack(
    visible
      ? h(
          G.Banner,
          {
            tone: 'warning',
            title: 'Mantenimiento del portal de i-DE.',
            action: h(G.Button, { variant: 'link' }, 'Ver estado'),
            onDismiss: () => setVisible(false),
          },
          'El sábado, de 8:00 a 12:00, las altas de autoconsumo quedarán en cola.',
        )
      : start(h(G.Button, { variant: 'secondary', onClick: () => setVisible(true) }, 'Mostrar el aviso de nuevo')),
    h(G.Banner, { tone: 'brand', title: 'Novedad.' }, 'Ya puedes firmar ofertas desde la ficha del cliente.'),
    h(G.Banner, { tone: 'danger', title: 'Sin conexión con Datadis.' }, 'Las curvas de consumo no se actualizan.'),
  )
}

const installations = [
  { id: '1', cliente: 'Lucía Fernández', provincia: 'Valencia', potencia: 8.4 },
  { id: '2', cliente: 'Javier Ortega', provincia: 'Murcia', potencia: 5.2 },
  { id: '3', cliente: 'Marta Ruiz', provincia: 'Sevilla', potencia: 4.1 },
  { id: '4', cliente: 'Ana Pérez', provincia: 'Málaga', potencia: 12 },
]
const installationColumns = [
  { key: 'cliente', header: 'Cliente' },
  { key: 'provincia', header: 'Provincia' },
  { key: 'potencia', header: 'Potencia', numeric: true, render: (item) => `${formatNumber(item.potencia, 'es-ES', 1)} kWp` },
]

function ActionBarDemo() {
  const [selected, setSelected] = useState(['1', '2', '4'])
  const [message, setMessage] = useState('')
  const act = (text) => () => setMessage(`${text}: ${selected.length} instalaciones (demostración).`)
  // Una sola columna que no crece con la tabla: en móvil la tabla se desplaza y la barra se ajusta al ancho.
  return h(
    'div',
    { className: 'live-stack', style: { gridTemplateColumns: 'minmax(0, 1fr)' } },
    h(G.DataTable, {
      rows: installations,
      columns: installationColumns,
      rowKey: 'id',
      caption: 'Instalaciones',
      selectable: true,
      selectedKeys: selected,
      onSelectionChange: setSelected,
    }),
    // En tu aplicación, sin inline: flota abajo y en el centro de la ventana.
    h(
      G.ActionBar,
      { count: selected.length, inline: true, onClear: () => setSelected([]) },
      h(G.Button, { variant: 'secondary', size: 'sm', icon: Download, onClick: act('Exportadas') }, 'Exportar'),
      h(G.Button, { variant: 'ghost', size: 'sm', onClick: act('Asignadas') }, 'Asignar instalador'),
    ),
    message && status(message),
  )
}

const contextItems = [
  { id: 'abrir', label: 'Abrir ficha' },
  { id: 'cups', label: 'Copiar CUPS' },
  { id: 'informe', label: 'Descargar informe', disabled: true },
  { id: 'baja', label: 'Dar de baja', danger: true, separator: true },
]

function ContextMenuDemo() {
  const [message, setMessage] = useState('')
  return start(
    h(
      G.ContextMenu,
      {
        label: 'Instalación de Lucía Fernández',
        items: contextItems,
        onAction: (id) => setMessage(`Acción elegida: ${contextItems.find((item) => item.id === id).label}`),
      },
      h(
        G.Card,
        null,
        h(
          G.CardHeader,
          null,
          h(G.CardTitle, null, 'Lucía Fernández'),
          h(G.CardDescription, null, `Valencia · ${formatNumber(8.4, 'es-ES', 1)} kWp · clic derecho o Mayúsculas + F10`),
        ),
      ),
    ),
    message && status(message),
  )
}

function IconButtonDemo() {
  const [pinned, setPinned] = useState(true)
  const [alerts, setAlerts] = useState(false)
  return stack(
    row(
      h(G.IconButton, { icon: Settings, label: 'Ajustes' }),
      h(G.IconButton, { icon: Download, label: 'Descargar informe', variant: 'secondary' }),
      h(G.IconButton, { icon: Chart, label: 'Ver producción', variant: 'primary' }),
      h(G.IconButton, { icon: Pin, label: 'Fijar instalación', pressed: pinned, onPressedChange: setPinned }),
      h(G.IconButton, { icon: Bell, label: 'Avisos de la instalación', variant: 'secondary', pressed: alerts, onPressedChange: setAlerts }),
      h(G.IconButton, { icon: Settings, label: 'Ajustes (sin permiso)', disabled: true }),
    ),
    status(`${pinned ? 'Fijada' : 'Sin fijar'} · avisos ${alerts ? 'activados' : 'desactivados'}`),
  )
}

const statuses = [
  { value: 'conectada', label: 'Conectadas' },
  { value: 'obra', label: 'En obra' },
  { value: 'pendiente', label: 'Pendientes' },
]
const columnsShown = [
  { value: 'produccion', label: 'Producción', icon: Sun },
  { value: 'grafico', label: 'Gráfico', icon: Chart },
  { value: 'avisos', label: 'Avisos', icon: Bell },
]

function ToggleGroupDemo() {
  const [state, setState] = useState('obra')
  const [shown, setShown] = useState(['produccion', 'avisos'])
  return stack(
    row(
      h(G.ToggleGroup, { label: 'Estado de la instalación', options: statuses, value: state, onValueChange: setState }),
      h(G.ToggleGroup, {
        label: 'Columnas visibles',
        type: 'multiple',
        iconOnly: true,
        options: columnsShown,
        value: shown,
        onValueChange: setShown,
      }),
    ),
    status(
      `Estado: ${statuses.find((item) => item.value === state)?.label.toLowerCase() ?? 'todos'} · columnas: ${
        shown.map((value) => columnsShown.find((item) => item.value === value).label.toLowerCase()).join(', ') || 'ninguna'
      }`,
    ),
  )
}

export const demos = {
  popover: PopoverDemo,
  banner: BannerDemo,
  'action-bar': ActionBarDemo,
  'context-menu': ContextMenuDemo,
  'icon-button': IconButtonDemo,
  'toggle-group': ToggleGroupDemo,
}
