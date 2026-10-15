// Web de documentación · grupo «maquetación y tipografía»: demo en vivo de cada ficha (id → componente React).
// No importes doc-helpers.mjs aquí: demos.mjs carga este archivo y doc-helpers carga demos.mjs.
import { createElement as h, useState } from 'react'
import * as G from '@1k5-tech-es/grado-react'
import { formatNumber } from '@1k5-tech-es/grado/patterns'

// La vista previa es flex: live-stack hace que la demo ocupe todo el ancho.
const frame = (...children) => h('div', { className: 'live-stack' }, ...children)
// El selector de la demo, con su ancho y no estirado.
const control = (props) => h(G.Stack, { align: 'start' }, h(G.SegmentedControl, props))
const kwp = (value) => `${formatNumber(value, 'es-ES', 1)} kWp`
const installations = [
  ['Lucía Fernández', 'Valencia', 8.4, 'Conectada', 'success'],
  ['Javier Ortega', 'Murcia', 5.2, 'En obra', 'info'],
  ['Marta Ruiz', 'Sevilla', 6.6, 'Pendiente', 'warning'],
]

function StackDemo() {
  const [direction, setDirection] = useState('row')
  return frame(
    control({
      label: 'Dirección',
      value: direction,
      onValueChange: setDirection,
      options: [
        { value: 'row', label: 'Fila' },
        { value: 'column', label: 'Columna' },
      ],
    }),
    h(
      G.Stack,
      { direction, justify: direction === 'row' ? 'between' : undefined, gap: '4', wrap: true },
      h(
        G.Stack,
        { gap: '0-5' },
        h(G.Heading, { level: 4, size: 'heading' }, 'Lucía Fernández'),
        h(G.Text, { tone: 'muted', size: 'small' }, `Valencia · ${kwp(8.4)} · Placas y batería`),
      ),
      h(
        G.Stack,
        { direction: 'row', gap: '2', wrap: true },
        h(G.Button, { variant: 'secondary' }, 'Ver ficha'),
        h(G.Button, null, 'Nueva oferta'),
      ),
    ),
  )
}

function GridDemo() {
  const [columns, setColumns] = useState('3')
  return frame(
    control({
      label: 'Columnas',
      value: columns,
      onValueChange: setColumns,
      options: [
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: 'auto', label: 'Automáticas' },
      ],
    }),
    h(
      G.Grid,
      { columns: columns === 'auto' ? 'auto' : Number(columns), minItemWidth: 'sm', gap: '4' },
      ...installations.map(([name, city, power, status, tone]) =>
        h(
          G.Card,
          { key: name },
          h(
            G.CardContent,
            null,
            h(
              G.Stack,
              { gap: '1', align: 'start' },
              h(G.Text, { weight: 'semibold', truncate: true }, name),
              h(G.Text, { size: 'small', tone: 'muted' }, `${city} · ${kwp(power)}`),
              h(G.Badge, { tone }, status),
            ),
          ),
        ),
      ),
    ),
  )
}

function ContainerDemo() {
  const [size, setSize] = useState('sm')
  return frame(
    control({
      label: 'Ancho máximo',
      value: size,
      onValueChange: setSize,
      options: [
        { value: 'sm', label: 'sm · 40rem' },
        { value: 'md', label: 'md · 60rem' },
        { value: 'lg', label: 'lg · 80rem' },
      ],
    }),
    h(
      G.Container,
      { size, padded: false },
      h(
        G.Card,
        null,
        h(
          G.CardContent,
          null,
          h(
            G.Stack,
            { gap: '2' },
            h(G.Heading, { level: 4, size: 'lead' }, 'Solicitud de estudio'),
            h(
              G.Text,
              { tone: 'muted' },
              'Un formulario se lee mejor en una columna estrecha: sm para formularios, md para fichas y lg para listados.',
            ),
          ),
        ),
      ),
    ),
  )
}

function TextDemo() {
  return frame(
    h(
      G.Stack,
      { gap: '3' },
      h(G.Text, { size: 'lead' }, 'Ahorra hasta un 70 % en la factura de la luz con autoconsumo.'),
      h(G.Text, null, 'La instalación de Lucía Fernández tiene 16 módulos y una batería de 10 kWh.'),
      h(G.Text, { size: 'small', tone: 'muted' }, 'Última lectura del contador: hoy a las 10:30.'),
      h(G.Text, { size: 'caption', tone: 'muted', numeric: true }, 'CUPS ES0021000012345678AB'),
      h(
        G.Stack,
        { direction: 'row', gap: '4', wrap: true },
        h(G.Text, { as: 'span', tone: 'success', weight: 'medium' }, 'Conectada'),
        h(G.Text, { as: 'span', tone: 'warning', weight: 'medium' }, 'Pendiente de legalizar'),
        h(G.Text, { as: 'span', tone: 'danger', weight: 'medium' }, 'Inversor sin respuesta'),
        h(G.Text, { as: 'span', tone: 'info', weight: 'medium' }, 'Revisión programada'),
      ),
    ),
  )
}

function HeadingDemo() {
  // level 4 dentro de la ficha (su nombre ya es un h3); size cambia solo el tamaño.
  return frame(
    h(
      G.Stack,
      { gap: '3' },
      h(G.Heading, { level: 4, size: 'display' }, `${formatNumber(1042)} kWp instalados`),
      h(G.Heading, { level: 4, size: 'title' }, 'Instalaciones en Valencia'),
      h(G.Heading, { level: 4, size: 'heading' }, 'Documentación de la obra'),
      h(G.Heading, { level: 4 }, 'Datos del suministro'),
    ),
  )
}

export const demos = {
  stack: StackDemo,
  grid: GridDemo,
  container: ContainerDemo,
  text: TextDemo,
  heading: HeadingDemo,
}
