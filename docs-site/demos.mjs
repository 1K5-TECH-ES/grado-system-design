import { createElement as h, useEffect, useRef, useState } from 'react'
import * as G from '@1k5-tech-es/grado-react'
import { demos as maquetacionDemos } from './groups/maquetacion.demos.mjs'
import { demos as datosDemos } from './groups/datos.demos.mjs'
import { demos as graficosDemos } from './groups/graficos.demos.mjs'
import { demos as entradasDemos } from './groups/entradas.demos.mjs'
import { demos as superposicionesDemos } from './groups/superposiciones.demos.mjs'

export const choices = [
  { value: 'solar', label: 'Placas solares', description: 'Autoconsumo residencial' },
  { value: 'bateria', label: 'Placas y batería', description: 'Almacena tu energía' },
  { value: 'empresa', label: 'Instalación industrial', disabled: true },
]
export const clients = [
  { value: 'lucia', label: 'Lucía Fernández' },
  { value: 'javier', label: 'Javier Ortega' },
  { value: 'marta', label: 'Marta Ruiz' },
  { value: 'ana', label: 'Ana Pérez', disabled: true },
]
export const menuItems = [
  { id: 'edit', label: 'Editar instalación' },
  { id: 'download', label: 'Descargar informe' },
  { id: 'share', label: 'Compartir', disabled: true },
  { id: 'delete', label: 'Eliminar', danger: true, separator: true },
]
export const steps = [
  { id: 'cliente', label: 'Cliente', description: 'Datos de contacto' },
  { id: 'instalacion', label: 'Instalación', description: 'Dimensionado' },
  { id: 'oferta', label: 'Oferta', description: 'Revisar y enviar' },
]
export const events = [
  {
    id: '1',
    title: 'Instalación conectada',
    description: 'Pruebas de funcionamiento completadas.',
    date: '12 oct 2026 · 10:30',
    dateTime: '2026-10-12T10:30:00+02:00',
    tone: 'success',
  },
  { id: '2', title: 'Documentación revisada', date: '10 oct 2026', dateTime: '2026-10-10', tone: 'info' },
  { id: '3', title: 'Oferta aceptada', date: '2 oct 2026', dateTime: '2026-10-02' },
]
export const rows = [
  { id: '1', cliente: 'Lucía Fernández', potencia: 6.2, estado: 'Conectada' },
  { id: '2', cliente: 'Javier Ortega', potencia: 8.4, estado: 'En obra' },
  { id: '3', cliente: 'Marta Ruiz', potencia: 4.1, estado: 'Pendiente' },
  { id: '4', cliente: 'Ana Pérez', potencia: 12, estado: 'Conectada' },
  { id: '5', cliente: 'Carlos Gil', potencia: 10, estado: 'En obra' },
  { id: '6', cliente: 'Las Encinas', potencia: 24, estado: 'Pendiente' },
  { id: '7', cliente: 'Ángel Núñez', potencia: 5, estado: 'Conectada' },
]
const kwp = (value) => `${value.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWp`
const tones = { Conectada: 'success', 'En obra': 'info', Pendiente: 'warning' }
export const columns = [
  { key: 'cliente', header: 'Cliente', sortable: true },
  { key: 'potencia', header: 'Potencia', sortable: true, numeric: true, render: (item) => kwp(item.potencia) },
  { key: 'estado', header: 'Estado', sortable: true, render: (item) => h(G.Badge, { tone: tones[item.estado] }, item.estado) },
]
export const periods = [
  { value: 'dia', label: 'Día' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'ano', label: 'Año' },
]
export const provinces = [
  { value: 'md', label: 'Madrid' },
  { value: 'vc', label: 'Valencia' },
  { value: 'se', label: 'Sevilla' },
  { value: 'mu', label: 'Murcia' },
  { value: 'ma', label: 'Málaga' },
  { value: 'za', label: 'Zaragoza', disabled: true },
]
export const commands = [
  {
    label: 'Acciones',
    items: [
      { id: 'oferta', label: 'Nueva oferta', shortcut: 'N' },
      { id: 'instalador', label: 'Asignar instalador' },
      { id: 'exportar', label: 'Exportar informe', disabled: true },
    ],
  },
  {
    label: 'Clientes',
    items: [
      { id: 'lucia', label: 'Lucía Fernández', description: 'Valencia · 8,4 kWp', keywords: 'INS-2041' },
      { id: 'javier', label: 'Javier Ortega', description: 'Murcia · 5,2 kWp', keywords: 'INS-1873' },
    ],
  },
]
export const production = [
  { semana: 'S1', auto: 210, exc: 85 },
  { semana: 'S2', auto: 185, exc: 70 },
  { semana: 'S3', auto: 160, exc: 55 },
  { semana: 'S4', auto: 140, exc: 40 },
]
const row = (...children) => h('div', { className: 'demo-row' }, ...children)
const grid2 = (...children) => h('div', { className: 'demo-grid' }, ...children)
const choiceRow = (...children) => h('div', { className: 'demo-row demo-row--choices' }, ...children)
const stack = (...children) => h('div', { className: 'live-stack' }, ...children)
// Un botón que abre algo y, debajo, el resultado: el botón conserva su ancho.
const trigger = (...children) => h('div', { className: 'live-stack live-stack--start' }, ...children)
const status = (text) => h('p', { className: 'demo-status', role: 'status' }, text)

// Demos de 0.3, por grupo: cada una es su propio componente, con sus propios hooks.
const groupDemos = Object.assign({}, maquetacionDemos, datosDemos, graficosDemos, entradasDemos, superposicionesDemos)

export function LiveDemo({ id }) {
  return groupDemos[id] ? h(groupDemos[id]) : h(CoreDemo, { id })
}

function CoreDemo({ id }) {
  const [open, setOpen] = useState(false),
    [message, setMessage] = useState(''),
    [value, setValue] = useState(''),
    [checked, setChecked] = useState(false)
  const [query, setQuery] = useState(''),
    [filters, setFilters] = useState([
      { id: 'status', label: 'Estado: en obra' },
      { id: 'owner', label: 'Responsable: Marta' },
    ])
  const [files, setFiles] = useState([
      { id: 'example', name: 'memoria-ejemplo.pdf', status: 'error', error: 'Ejemplo de error de subida. Puedes reintentarlo.' },
    ]),
    [mode, setMode] = useState('ready')
  const [number, setNumber] = useState(8.4),
    [many, setMany] = useState(['md', 'vc']),
    [span, setSpan] = useState({ start: '2026-11-03', end: '2026-11-10' })
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const upload = (id) => {
    setFiles((list) => list.map((file) => (file.id === id ? { ...file, status: 'uploading', progress: 40 } : file)))
    timers.current.push(
      setTimeout(
        () => setFiles((list) => list.map((file) => (file.id === id ? { ...file, status: 'success', progress: 100 } : file))),
        1200,
      ),
    )
  }
  if (['dialog', 'alert-dialog', 'drawer'].includes(id)) {
    const Component = id === 'dialog' ? G.Dialog : id === 'alert-dialog' ? G.AlertDialog : G.Drawer
    return trigger(
      h(
        G.Button,
        { variant: id === 'alert-dialog' ? 'danger' : 'secondary', onClick: () => setOpen(true) },
        id === 'dialog' ? 'Editar instalación' : id === 'alert-dialog' ? 'Eliminar instalación' : 'Abrir detalle',
      ),
      h(
        Component,
        {
          title: id === 'alert-dialog' ? '¿Eliminar esta instalación?' : 'Instalación de Lucía Fernández',
          description: id === 'alert-dialog' ? 'Esta acción requiere tu confirmación.' : 'Autoconsumo residencial · Valencia',
          open,
          onOpenChange: setOpen,
          footer: row(
            h(G.Button, { variant: 'secondary', onClick: () => setOpen(false) }, 'Cancelar'),
            h(
              G.Button,
              {
                variant: id === 'alert-dialog' ? 'destructive' : 'primary',
                onClick: () => {
                  setOpen(false)
                  setMessage(id === 'alert-dialog' ? 'Eliminación confirmada (demostración).' : 'Cambios guardados (demostración).')
                },
              },
              id === 'alert-dialog' ? 'Eliminar' : 'Guardar',
            ),
          ),
        },
        id === 'alert-dialog'
          ? h('p', null, 'En tu aplicación, conecta esta confirmación a la acción de eliminar.')
          : h(G.Field, { label: 'Nombre de la instalación' }, h(G.Input, { defaultValue: 'Casa de Lucía' })),
      ),
      message && status(message),
    )
  }
  if (id === 'tabs')
    return h(G.Tabs, {
      label: 'Ficha de instalación',
      items: [
        { value: 'resumen', label: 'Resumen', content: 'Instalación de 8,4 kWp con batería de 10 kWh.' },
        { value: 'documentos', label: 'Documentos', content: 'Memoria técnica · Certificado de instalación' },
        { value: 'actividad', label: 'Actividad', content: 'Última revisión: documentación aprobada.' },
        { value: 'proxima', label: 'Próximamente', disabled: true, content: '' },
      ],
    })
  if (id === 'checkbox')
    return choiceRow(
      h(G.Checkbox, {
        label: 'Incluir batería',
        description: 'Almacena los excedentes de producción',
        checked,
        onCheckedChange: setChecked,
      }),
      h(G.Checkbox, { label: 'Selección parcial', indeterminate: true, checked: false, readOnly: true }),
      h(G.Checkbox, { label: 'No disponible', disabled: true }),
    )
  if (id === 'radio-group') return h(G.RadioGroup, { label: 'Tipo de instalación', options: choices, defaultValue: 'solar' })
  if (id === 'dropdown-menu')
    return trigger(
      h(G.DropdownMenu, {
        label: 'Acciones',
        items: menuItems,
        onAction: (action) => setMessage(`Acción elegida: ${menuItems.find((item) => item.id === action).label}`),
      }),
      message && status(message),
    )
  if (id === 'toast')
    return row(
      h(G.Button, { onClick: () => setOpen(true), variant: 'secondary' }, 'Mostrar notificación'),
      h(
        G.Toast,
        { open, onOpenChange: setOpen, title: 'Cambios guardados', tone: 'success', duration: 5000 },
        'La instalación se ha actualizado.',
      ),
    )
  if (id === 'toaster')
    return row(
      h(
        G.Button,
        {
          variant: 'secondary',
          onClick: () =>
            G.toast.success('Oferta enviada', {
              description: 'A Lucía Fernández',
              action: { label: 'Deshacer', onClick: () => G.toast('Envío deshecho') },
            }),
        },
        'Enviar oferta',
      ),
      h(
        G.Button,
        {
          variant: 'secondary',
          onClick: () =>
            G.toast.promise(new Promise((done) => setTimeout(done, 1500)), {
              loading: 'Guardando la instalación…',
              success: 'Instalación guardada',
              error: 'No se ha podido guardar',
            }),
        },
        'Guardar',
      ),
    )
  if (id === 'alert')
    return stack(
      h(G.Alert, { title: 'Documentación pendiente', tone: 'warning' }, 'Añade el certificado de instalación para continuar.'),
      h(G.Alert, { title: 'Instalación conectada', tone: 'success' }, 'Todas las comprobaciones se han completado.'),
    )
  if (id === 'tooltip')
    return h(
      'span',
      { className: 'demo-inline' },
      h('span', null, 'Potencia pico'),
      h(G.Tooltip, { label: 'Información sobre potencia pico', content: 'Potencia máxima de los módulos en condiciones estándar.' }),
    )
  if (id === 'skeleton')
    return h(
      'div',
      { className: 'live-stack', role: 'status', 'aria-label': 'Cargando ficha' },
      row(h(G.Skeleton, { circle: true, width: 40, height: 40 }), h(G.Skeleton, { width: '55%', height: 18 })),
      h(G.Skeleton, { height: 12 }),
      h(G.Skeleton, { width: '75%', height: 12 }),
      h(G.Skeleton, { height: 64 }),
    )
  if (id === 'combobox')
    return stack(
      h(
        G.Field,
        { label: 'Cliente', hint: 'Busca por nombre. Prueba “Lucia”, sin tilde.' },
        h(G.Combobox, { options: clients, value, onValueChange: setValue, placeholder: 'Buscar cliente…' }),
      ),
      status(value ? `Seleccionado: ${clients.find((client) => client.value === value)?.label}` : 'Ningún cliente seleccionado'),
    )
  if (id === 'pagination') return h(G.Pagination, { total: 128, pageSize: 10 })
  if (id === 'date-picker')
    return h(
      G.Field,
      { label: 'Fecha de instalación' },
      h(G.DatePicker, { defaultValue: '2026-10-20', min: '2026-01-01', max: '2027-12-31' }),
    )
  if (id === 'date-range-picker')
    return h(G.DateRangePicker, {
      label: 'Periodo del informe',
      defaultValue: { start: '2026-10-01', end: '2026-10-31' },
      min: '2026-01-01',
      max: '2027-12-31',
    })
  if (id === 'file-upload')
    return stack(
      h(G.FileUpload, {
        accept: '.pdf,image/*',
        maxSize: 5 * 1024 * 1024,
        multiple: true,
        hint: 'PDF e imágenes · Máximo 5 MB por archivo · Subida simulada',
        files,
        onFilesChange: (incoming) => {
          const added = incoming.map((file, index) => ({ id: `${Date.now()}-${index}`, name: file.name, status: 'uploading', progress: 0 }))
          setFiles((list) => [...list, ...added])
          added.forEach((file) => upload(file.id))
        },
        onRemove: (key) => setFiles((list) => list.filter((file) => file.id !== key)),
        onRetry: upload,
      }),
      h('p', { className: 'demo-status' }, 'Los archivos permanecen en tu navegador; esta demostración no los envía.'),
    )
  if (id === 'stepper') return h(G.Stepper, { items: steps, value: value || 'instalacion', onValueChange: setValue })
  if (id === 'timeline') return h(G.Timeline, { items: events })
  if (id === 'filter-bar')
    return stack(
      h(G.FilterBar, {
        query,
        onQueryChange: setQuery,
        filters,
        onRemoveFilter: (key) => setFilters((items) => items.filter((item) => item.id !== key)),
        onClear: () => {
          setQuery('')
          setFilters([])
        },
        label: 'Buscar instalaciones',
      }),
      status(`${filters.length === 1 ? '1 filtro activo' : `${filters.length} filtros activos`}${query ? ` · Búsqueda: ${query}` : ''}`),
    )
  if (id === 'data-table')
    return stack(
      row(
        h(G.Button, { size: 'sm', variant: 'ghost', onClick: () => setMode(mode === 'loading' ? 'ready' : 'loading') }, 'Carga'),
        h(G.Button, { size: 'sm', variant: 'ghost', onClick: () => setMode(mode === 'error' ? 'ready' : 'error') }, 'Error'),
        h(G.Button, { size: 'sm', variant: 'ghost', onClick: () => setMode(mode === 'empty' ? 'ready' : 'empty') }, 'Vacío'),
        h(G.Button, { size: 'sm', variant: 'ghost', onClick: () => setMode('ready') }, 'Restablecer'),
      ),
      h(G.DataTable, {
        rows: mode === 'empty' ? [] : rows,
        columns,
        rowKey: 'id',
        caption: 'Instalaciones · datos de ejemplo',
        selectable: true,
        pageSize: 3,
        loading: mode === 'loading',
        error: mode === 'error' ? 'No se pudieron cargar las instalaciones.' : undefined,
        rowActions: (item) =>
          h(G.Button, { variant: 'ghost', size: 'sm', onClick: () => setMessage(`Has abierto la ficha de ${item.cliente}.`) }, 'Ver'),
      }),
      message && status(message),
    )
  if (id === 'accordion')
    return h(G.Accordion, {
      items: [
        {
          value: 'documentos',
          title: '¿Qué documentación necesito?',
          content: 'Memoria técnica, certificado de instalación y datos del titular.',
        },
        { value: 'plazo', title: '¿Cómo consulto el estado?', content: 'Desde la ficha de instalación, en la pestaña Actividad.' },
      ],
    })
  if (id === 'number-input')
    return stack(
      grid2(
        h(
          G.Field,
          { label: 'Potencia instalada', hint: 'Prueba a escribir 8,45 o a usar las flechas.' },
          h(G.NumberInput, { value: number, onValueChange: setNumber, step: 0.1, min: 0, max: 50, suffix: 'kWp' }),
        ),
        h(
          G.Field,
          { label: 'Precio por kWh' },
          h(G.NumberInput, { defaultValue: 0.15, step: 0.01, min: 0, prefix: '€', hideSteppers: true }),
        ),
      ),
      status(number == null ? 'Sin valor' : `Valor recibido: ${number} (número)`),
    )
  if (id === 'segmented-control')
    return stack(
      h(G.SegmentedControl, { label: 'Periodo', value: value || 'mes', onValueChange: setValue, options: periods }),
      status(`Mostrando: ${periods.find((p) => p.value === (value || 'mes')).label.toLowerCase()}`),
    )
  if (id === 'multi-select')
    return stack(
      h(
        G.Field,
        { label: 'Provincias', hint: 'Enter marca o desmarca. Retroceso quita la última.' },
        h(G.MultiSelect, { options: provinces, value: many, onValueChange: setMany, placeholder: 'Buscar provincia…' }),
      ),
      status(
        many.length ? `Elegidas: ${many.map((v) => provinces.find((p) => p.value === v).label).join(', ')}` : 'Ninguna provincia elegida',
      ),
    )
  if (id === 'calendar')
    return h(
      'div',
      { className: 'demo-row demo-row--top' },
      h(G.Calendar, { mode: 'range', value: span, onValueChange: setSpan, min: '2026-01-01' }),
      status(span.end ? `Del ${span.start} al ${span.end}` : span.start ? `Desde ${span.start}: elige el final` : 'Elige el primer día'),
    )
  if (id === 'command-palette')
    return trigger(
      h(G.AppSearch, { label: 'Buscar acciones y clientes', shortcut: 'Ctrl K', onClick: () => setOpen(true) }),
      h(G.CommandPalette, {
        open,
        onOpenChange: setOpen,
        groups: commands,
        onSelect: (picked) => setMessage(`Has elegido: ${commands.flatMap((g) => g.items).find((item) => item.id === picked).label}`),
        hotkey: false,
      }),
      message && status(message),
    )
  if (id === 'bar-chart')
    return h(G.BarChart, {
      title: 'Producción de octubre',
      description: 'kWh por semana · datos de ejemplo',
      categoryKey: 'semana',
      categoryLabel: 'Semana',
      unit: 'kWh',
      stacked: true,
      height: 200,
      data: production,
      series: [
        { key: 'auto', label: 'Autoconsumo' },
        { key: 'exc', label: 'Excedentes' },
      ],
    })
  if (id === 'breadcrumbs')
    return h(G.Breadcrumbs, {
      items: [{ label: 'Inicio', href: './' }, { label: 'Componentes', href: 'componentes' }, { label: 'Breadcrumbs' }],
    })
  return null
}
