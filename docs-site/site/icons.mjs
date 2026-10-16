// Iconos de Lucide, con el mismo trazo que los de Grado.
import { createElement as h } from 'react'

const lucide = (...paths) =>
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
      ...paths.map((d) => h('path', { key: d, d })),
    )
  }
export const icons = {
  arrow: lucide('M5 12h14', 'm12 5 7 7-7 7'),
  home: lucide(
    'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8',
    'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  ),
  customize: lucide(
    'M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z',
    'M13.5 6.5h.01',
    'M17.5 10.5h.01',
    'M8.5 7.5h.01',
    'M6.5 12.5h.01',
  ),
  installation: lucide('M12 15V3', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5'),
  components: lucide('M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'),
  foundations: lucide('M4 7V4h16v3', 'M9 20h6', 'M12 4v16'),
  Acciones: lucide(
    'M14 4.1 12 6',
    'm5.1 8-2.9-.8',
    'm6 12-1.9 2',
    'M7.2 2.2 8 5.1',
    'M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z',
  ),
  Formularios: lucide('M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'),
  Datos: lucide('M3 3v16a2 2 0 0 0 2 2h16', 'M18 17V9', 'M13 17V5', 'M8 17v-3'),
  Estructura: lucide('M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M3 9h18', 'M9 21V9'),
  Navegación: lucide(
    'M12 13v8',
    'M12 3v3',
    'M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a2 2 0 0 1-1.387-.56l-2.306-2.22a1 1 0 0 1 0-1.44l2.306-2.22A2 2 0 0 1 6 6z',
  ),
  Superposiciones: lucide(
    'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z',
    'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65',
    'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65',
  ),
  // Matraz de Lucide (flask-conical).
  Labs: lucide(
    'M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2',
    'M6.453 15h11.094',
    'M8.5 2h7',
  ),
  Respuesta: lucide('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'),
  search: lucide('M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0', 'm21 21-4.3-4.3'),
  status: lucide('M22 12h-4l-3 9L9 3l-3 9H2'),
  changelog: lucide('M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5', 'M12 7v5l4 2'),
  chevron: lucide('m6 9 6 6 6-6'),
  check: lucide('M20 6 9 17l-5-5'),
  x: lucide('M18 6 6 18', 'm6 6 12 12'),
  circleCheck: lucide('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20', 'm9 12 2 2 4-4'),
  circleX: lucide('M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20', 'm15 9-6 6', 'm9 9 6 6'),
  a11y: lucide(
    'M17 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0',
    'm18 19 1-7-6 1',
    'm5 8 3-3 5.5 3-2.36 3.5',
    'M4.24 14.5a5 5 0 0 0 6.88 6',
    'M13.76 17.5a5 5 0 0 0-6.88-6',
  ),
}
