// Logo de Grado: una «G» con el anillo del grado (°) sobre menta, el color de producto de la marca.
// Lo usan el build de la web (marco, favicon y vista previa de AppShell) y el configurador.
import { createElement as h } from 'react'
import { palette } from '@1k5-tech-es/grado/tokens'

export const GradoMark = (props) =>
  h(
    'svg',
    { viewBox: '0 0 32 32', ...props },
    h('rect', { width: 32, height: 32, rx: 9, fill: palette.mint }),
    h('path', {
      d: 'M21.15 11.41A7.6 7.6 0 1 0 23.1 16.5H16.5',
      fill: 'none',
      stroke: palette.graphite,
      strokeWidth: 3.2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }),
    h('circle', { cx: 24.6, cy: 7.6, r: 2.3, fill: 'none', stroke: palette.aubergine, strokeWidth: 1.9 }),
  )

/** La marca con el nombre, en el sitio del logo de las aplicaciones de ejemplo. */
export const GradoLogo = ({ className }) =>
  h(
    'span',
    { className: className ? `grado-logo ${className}` : 'grado-logo', role: 'img', 'aria-label': 'Grado' },
    h(GradoMark, { className: 'grado-logo__mark', 'aria-hidden': 'true' }),
    h('span', { className: 'grado-logo__name', 'aria-hidden': 'true' }, 'Grado'),
  )
