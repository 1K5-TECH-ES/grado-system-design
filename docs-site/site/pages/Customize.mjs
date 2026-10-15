import { createElement as h } from 'react'
import * as G from '@1k5-tech-es/grado-react'
import { Configurator } from '../../configurator.mjs'
import { footer, NoteCard, Section } from '../ui.mjs'

const notes = [
  ['Derivación consistente', 'Los grises reciben un matiz del color principal y los tonos se calculan con las mismas fórmulas que Grado.'],
  [
    'Integración reversible',
    '`grado-tema.css` redefine las variables semánticas. Se importa después de Grado y puede retirarse sin modificar la librería.',
  ],
  [
    'Contraste comprobado',
    'El panel revisa las combinaciones que más se ven, en claro y en oscuro. Revisa también estados y gráficos dentro de tu producto.',
  ],
]

export default function Customize() {
  return h(
    'div',
    { className: 'docs-page' },
    h(Configurator),
    h(
      Section,
      { id: 'como-funciona', title: 'Criterio del sistema', description: 'Cómo construye Grado tu tema.' },
      h(
        G.Grid,
        { columns: 'auto', minItemWidth: 'lg' },
        notes.map(([title, text]) => h(NoteCard, { key: title, title }, text)),
      ),
    ),
    footer,
  )
}
