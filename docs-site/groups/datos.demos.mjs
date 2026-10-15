// Web de documentación · grupo «datos y piezas»: demo en vivo de cada ficha (id → componente React).
// No importes doc-helpers.mjs aquí: demos.mjs carga este archivo y doc-helpers carga demos.mjs.
import { createElement as h, useState } from 'react'
import * as G from '@1k5/grado-react'
import { formatNumber } from '@1k5/grado/patterns'

// La vista previa es flex: live-stack hace que la demo ocupe todo el ancho.
const frame = (...children) => h('div', { className: 'live-stack' }, ...children)
const start = (...children) => h('div', { className: 'live-stack live-stack--start' }, ...children)
const row = (...children) => h('div', { className: 'demo-row' }, ...children)
const note = (text) => h('p', { className: 'demo-status', role: 'status' }, text)
const kwp = (value) => `${formatNumber(value, 'es-ES', 1)} kWp`

const installations = [
  ['INS-2041', 'Lucía Fernández', 8.4, 'Produciendo', 'success', true],
  ['INS-2038', 'Javier Ortega', 5.2, 'En obra', 'info'],
  ['INS-2035', 'Marta Ruiz', 6.3, 'Pendiente de legalizar', 'warning'],
  ['INS-2029', 'Las Encinas', 24, 'Incidencia', 'danger'],
]
const legalization = ['Memoria técnica', 'Boletín (CIE)', 'Alta en Industria', 'Acceso y conexión', 'Contrato de compensación']
const provinces = ['Valencia', 'Alicante', 'Castellón', 'Murcia']
const team = [
  { name: 'Lucía Fernández' },
  { name: 'Javier Ortega' },
  { name: 'Marta Ruiz' },
  { name: 'Ana Pérez' },
  { name: 'Carlos Gil' },
  { name: 'Ángel Núñez' },
]

function StatusDemo() {
  return h(
    G.Table,
    { caption: 'Instalaciones · datos de ejemplo' },
    h('thead', null, h('tr', null, h('th', null, 'Cliente'), h('th', { className: 'k5-num' }, 'Potencia'), h('th', null, 'Estado'))),
    h(
      'tbody',
      null,
      ...installations.map(([id, client, power, status, tone, pulse]) =>
        h(
          'tr',
          { key: id },
          h('td', null, client),
          h('td', { className: 'k5-num' }, kwp(power)),
          h('td', null, h(G.Status, { tone, pulse }, status)),
        ),
      ),
    ),
  )
}

function ProgressDemo() {
  const [done, setDone] = useState(2)
  return frame(
    h(G.Progress, { steps: legalization.length, value: done, label: 'Legalización', showLabel: true, showValue: true }),
    row(
      h(G.Button, { variant: 'secondary', size: 'sm', disabled: done === 0, onClick: () => setDone(done - 1) }, 'Paso anterior'),
      h(G.Button, { size: 'sm', disabled: done === legalization.length, onClick: () => setDone(done + 1) }, 'Completar paso'),
    ),
    note(done < legalization.length ? `Siguiente: ${legalization[done]}.` : 'Legalización completada.'),
    h(G.Progress, { value: 64, label: 'memoria-tecnica.pdf', showLabel: true, showValue: true }),
    h(G.Progress, { value: null, size: 'sm', label: 'Calculando la producción estimada', showLabel: true }),
  )
}

function DescriptionListDemo() {
  return frame(
    h(G.DescriptionList, {
      items: [
        { id: 'cliente', term: 'Cliente', description: 'Lucía Fernández' },
        { id: 'direccion', term: 'Dirección', description: 'Calle de Colón 14, 46004 Valencia' },
        { id: 'potencia', term: 'Potencia', description: `${kwp(8.4)} · 14 módulos` },
        { id: 'cups', term: 'CUPS', description: 'ES0021000012345678AB', copy: 'ES0021000012345678AB', mono: true },
        { id: 'catastro', term: 'Ref. catastral', description: '9872023VH5797S0001WX', copy: '9872023VH5797S0001WX', mono: true },
        { id: 'estado', term: 'Estado', description: h(G.Status, { tone: 'success' }, 'Conectada') },
      ],
    }),
  )
}

function CopyButtonDemo() {
  const [copied, setCopied] = useState('')
  return start(
    row(
      h('span', { className: 'k5-num' }, 'INS-2041'),
      h(G.CopyButton, { value: 'INS-2041', label: 'Copiar referencia', onCopy: setCopied }),
      h(G.CopyButton, { value: 'ES0021000012345678AB', iconOnly: true, label: 'Copiar CUPS', onCopy: setCopied }),
    ),
    note(copied ? `En el portapapeles: ${copied}` : 'Pulsa un botón para copiar.'),
  )
}

function TagDemo() {
  const [list, setList] = useState(provinces)
  return start(
    row(
      ...list.map((label) => h(G.Tag, { key: label, label, onRemove: () => setList(list.filter((item) => item !== label)) })),
      h(G.Tag, { label: 'Zaragoza', disabled: true, onRemove: () => {} }),
    ),
    list.length < provinces.length
      ? h(G.Button, { variant: 'ghost', size: 'sm', onClick: () => setList(provinces) }, 'Restablecer provincias')
      : null,
  )
}

function AvatarGroupDemo() {
  return row(
    h(G.AvatarGroup, { items: team, size: 'sm' }),
    h(G.AvatarGroup, { items: team }),
    h(G.AvatarGroup, { items: team.slice(0, 3), size: 'lg' }),
  )
}

function KbdDemo() {
  return frame(
    h('p', null, 'Abre la paleta de comandos con ', h(G.Kbd, { keys: ['Ctrl', 'K'] }), ' (o ', h(G.Kbd, { keys: ['⌘', 'K'] }), ' en Mac).'),
    h('p', null, 'Cierra cualquier diálogo con ', h(G.Kbd, null, 'Esc'), '.'),
  )
}

function SeparatorDemo() {
  return frame(
    h(G.Button, { variant: 'secondary' }, 'Entrar con la cuenta de 1KOMMA5°'),
    h(G.Separator, { label: 'o' }),
    h(G.Button, { variant: 'ghost' }, 'Recibir un enlace por correo'),
    row(
      h('span', null, '8,4 kWp'),
      h(G.Separator, { orientation: 'vertical' }),
      h('span', null, '14 módulos'),
      h(G.Separator, { orientation: 'vertical' }),
      h('span', null, 'Valencia'),
    ),
  )
}

function LinkDemo() {
  // La web no enlaza a sitios externos: el ejemplo abre las notas de la versión en otra pestaña.
  return frame(
    h(
      'p',
      null,
      'Consulta las novedades en las ',
      h(G.Link, { href: '/cambios', external: true, underline: 'always' }, 'notas de la versión'),
      ' sin perder esta página.',
    ),
    row(h(G.Link, { href: '#link' }, 'Ver ficha de la instalación'), h(G.Link, { href: '#link', tone: 'muted' }, 'Historial de cambios')),
  )
}

export const demos = {
  status: StatusDemo,
  progress: ProgressDemo,
  'description-list': DescriptionListDemo,
  'copy-button': CopyButtonDemo,
  tag: TagDemo,
  'avatar-group': AvatarGroupDemo,
  kbd: KbdDemo,
  separator: SeparatorDemo,
  link: LinkDemo,
}
