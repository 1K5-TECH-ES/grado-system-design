// Las escalas de tokens.json, con los valores reales. Los colores y sombras se pintan con
// variables: cambian con el tema y el modo de la cabecera.
import { createElement as h } from 'react'
import * as G from '@1k5-tech-es/grado-react'
import tokens from '@1k5-tech-es/grado/tokens.json' with { type: 'json' }
import { foundationsToc } from '../routes.mjs'
import { NoteCard, Page, Section } from '../ui.mjs'

const px = (rem) => `${parseFloat(rem) * 16} px`

const principles = [
  ['Un solo acento por vista', 'Berenjena sólido solo en la acción principal y en el elemento activo. El resto, en neutros.'],
  ['Borde o fondo, nunca los dos', 'Un elemento se separa con una línea o con una superficie. Si lleva las dos, sobra una.'],
  ['Jerarquía por tamaño y peso', 'El color queda para el estado. Lo importante es más grande o más grueso, no más saturado.'],
  ['Estado con punto y texto', 'En una fila, Status basta. El fondo tintado queda para avisos y Badge para recuentos y etiquetas.'],
]
const typeUse = {
  caption: 'Etiquetas, badges, ayudas',
  small: 'Navegación, texto secundario',
  body: 'Texto de interfaz',
  lead: 'Subtítulos, texto destacado',
  heading: 'Títulos de sección',
  title: 'Título de página, cifras de KPI',
  display: 'Cifras protagonistas, portadas',
}
const typeSample = {
  caption: 'Actualizado hace 4 min',
  small: 'Suma de todos los módulos',
  body: 'Tejado de teja árabe. Acceso por el patio.',
  lead: 'Seguimiento de obras de autoconsumo',
  heading: 'Producción de octubre',
  title: 'Instalaciones',
  display: '1.042 kWp',
}
const tones = [
  ['primary', 'Marca'],
  ['success', 'Éxito'],
  ['warning', 'Aviso'],
  ['destructive', 'Error'],
  ['info', 'Información'],
]
const elevation = [
  ['0', 'Borde', 'Tarjetas, tablas, campos', { border: '1px solid var(--k5-border)' }],
  ['1', '--k5-shadow-raised', 'Cabecera fija, elemento arrastrado', { boxShadow: 'var(--k5-shadow-raised)' }],
  ['2', '--k5-shadow-popover', 'Menús, Popover, Combobox', { boxShadow: 'var(--k5-shadow-popover)' }],
  ['3', '--k5-shadow-overlay', 'Diálogos, Toast, ActionBar', { boxShadow: 'var(--k5-shadow-overlay)' }],
]
const radii = [
  ['xs', 'Casillas, Kbd'],
  ['sm', 'Elementos pequeños'],
  ['md', 'Controles (igual que --radius)'],
  ['lg', 'Tarjetas pequeñas, Popover'],
  ['panel', 'Tarjetas y tablas'],
  ['full', 'Avatar, Tag, interruptor'],
]
const consolaSize = tokens.themes.consola.light.size
const marcaSize = { ...consolaSize, ...tokens.themes.marca.light.size }
const sizeOf = (theme, key) => (['9999px', '999px'].includes(theme[`radius-${key}`]) ? 'píldora' : px(theme[`radius-${key}`]))
const densityRows = [
  ['compact', 'Compacta', 'Tablas densas y paneles de datos'],
  [null, 'Normal (sin atributo o «default»)', 'La del tema: Consola 32 px, Marca 38 px'],
  ['comfortable', 'Cómoda', 'Pantallas táctiles: se aplica sola con pointer: coarse'],
]
const otherScales = [
  ...Object.entries(tokens.icon.values).map(([k, v]) => [
    `--k5-icon-${k}`,
    px(v),
    { sm: 'Badges, chips, variaciones', md: 'Botones, menús, campos', lg: 'Avisos, estados vacíos' }[k],
  ]),
  ...Object.entries(tokens.container.values).map(([k, v]) => [
    `--k5-container-${k}`,
    px(v),
    { sm: 'Formularios', md: 'Páginas de detalle', lg: 'Listados y paneles' }[k],
  ]),
  ...Object.entries(tokens.border.values).map(([k, v]) => [
    `--k5-border-${k}`,
    v,
    k === 'width' ? 'Bordes y separadores' : 'Indicador activo y foco',
  ]),
  ...Object.entries(tokens.opacity.values).map(([k, v]) => [
    `--k5-opacity-${k}`,
    v,
    k === 'disabled' ? 'Controles desactivados' : 'Texto secundario sobre color',
  ]),
]
const versions = [
  [
    'Versión semántica',
    'Los tres paquetes comparten número. Hasta la 1.0, una versión menor (0.4, 0.5…) puede cambiar el aspecto o una API; cada cambio así aparece en «Al actualizar» del registro de cambios. Desde la 1.0, solo una versión mayor puede romper algo.',
  ],
  [
    'Qué rompe',
    'Quitar o renombrar un componente, una prop, un evento, un valor de una prop, una clase `k5-…` o un token `--k5-…`; cambiar el tipo o el valor por defecto de una prop; cambiar el HTML que la documentación da por bueno (roles, ids, atributos `data-`). No rompe: componentes, props y tokens nuevos, arreglos de accesibilidad y retoques de estilo dentro de los cuatro principios. El informe de la API (`api/`) enseña en cada pull request cualquier cambio de props.',
  ],
  [
    'Obsoleto',
    'Lo que se va a retirar sigue funcionando al menos una versión menor más y se retira en la siguiente versión mayor. Se avisa de cuatro formas: «Obsoleto» en el registro de cambios con su sustituto, un aviso en la consola en desarrollo cuando se puede detectar desde JavaScript, un comentario en el CSS generado y la lista de `npx @1k5-tech-es/grado usage`. Si se puede cambiar sin decidir nada, lo hace `npx @1k5-tech-es/grado migrate`.',
  ],
  [
    'Lo que se retira en 1.0',
    'Los alias tipográficos de 0.3 (`--k5-text-badge`, `-label`, `-nav` y `-section`, y `text-2xs` en Tailwind): usa `caption`, `small` y `heading`. Los textos en alemán e inglés dejan de venir de serie: impórtalos de `@1k5-tech-es/grado/messages/de` o `/en` y pásalos en `messages`.',
  ],
  [
    'Publicación',
    'Cada etiqueta vX.Y.Z publica los paquetes en el registro privado y crea una release con las notas del registro de cambios. El CI ejecuta lint, tests, navegador (también con React 18 y Vue 3.5.0), capturas de cada componente, apps de prueba con Vite, Next y Nuxt y la web en cada pull request.',
  ],
]

const head = (...labels) =>
  h(
    'thead',
    null,
    h(
      'tr',
      null,
      labels.map((label) => h('th', { key: label, scope: 'col' }, label)),
    ),
  )

export default function Foundations() {
  return h(
    Page,
    {
      title: 'Fundamentos',
      subtitle:
        'Las escalas de las que salen todos los componentes. Todo vive en tokens.json y se publica como CSS, Tailwind, JavaScript, formato W3C y Tokens Studio para Figma.',
      toc: foundationsToc,
    },
    h(
      Section,
      {
        id: 'principios',
        title: 'Principios',
        description: 'Cuatro reglas para que cualquier pantalla se vea sobria. Se revisan en cada pull request.',
      },
      h(
        G.Grid,
        { columns: 'auto', minItemWidth: 'sm' },
        principles.map(([title, text]) => h(NoteCard, { key: title, title }, text)),
      ),
    ),
    h(
      Section,
      {
        id: 'tipografia',
        title: 'Tipografía',
        description:
          'Barlow en siete pasos, cada uno con su interlineado: `--k5-text-*` y `--k5-leading-*`. En Tailwind, `text-caption` … `text-display`. Los nombres antiguos (`text-badge`, `text-label`, `text-nav`, `text-section`) siguen funcionando como alias.',
      },
      h(
        G.Card,
        { className: 'docs-rows' },
        Object.entries(tokens.typography.scale).map(([step, { size, leading }]) =>
          h(
            'div',
            { key: step, className: 'docs-row' },
            h(
              'div',
              { className: 'docs-row__meta' },
              h('code', null, `--k5-text-${step}`),
              h(G.Text, { as: 'span', size: 'small', tone: 'muted' }, `${px(size)} / ${px(leading)} · ${typeUse[step]}`),
            ),
            h(
              'p',
              {
                className: 'docs-type-sample',
                style: {
                  fontSize: `var(--k5-text-${step})`,
                  lineHeight: `var(--k5-leading-${step})`,
                  ...(['title', 'display'].includes(step) ? { fontWeight: 600, letterSpacing: `var(--k5-tracking-${step})` } : {}),
                },
              },
              typeSample[step],
            ),
          ),
        ),
      ),
    ),
    h(
      Section,
      {
        id: 'color',
        title: 'Escala tonal',
        description:
          'Cada color de estado tiene cuatro pasos: fondo suave, borde, sólido y texto. Se calculan en el build para cada tema y modo, y el texto llega siempre a 4,5 : 1 sobre su fondo suave. Cambia el tema arriba para verlos.',
      },
      h(
        G.Table,
        { caption: 'Escala tonal de los colores de estado' },
        head('Color', 'subtle', 'border', 'sólido', 'text'),
        h(
          'tbody',
          null,
          tones.map(([name, label]) =>
            h(
              'tr',
              { key: name },
              h('th', { scope: 'row' }, h(G.Stack, { gap: '0-5' }, label, h('code', null, name))),
              ['subtle', 'border', '', 'text'].map((step) => {
                const variable = `--k5-${name}${step ? `-${step}` : ''}`
                return h(
                  'td',
                  { key: step },
                  h(
                    G.Stack,
                    { direction: 'row', gap: '2' },
                    step === 'text'
                      ? h(
                          'span',
                          {
                            className: 'docs-swatch docs-swatch--text',
                            style: { background: `var(--k5-${name}-subtle)`, color: `var(${variable})` },
                          },
                          'Aa',
                        )
                      : h('span', { className: 'docs-swatch', style: { background: `var(${variable})` } }),
                    h('code', null, variable),
                  ),
                )
              }),
            ),
          ),
        ),
      ),
    ),
    h(
      Section,
      {
        id: 'elevacion',
        title: 'Elevación',
        description: 'Cuatro niveles. Lo que está en la página no flota: las tarjetas se separan con borde, no con sombra.',
      },
      h(
        G.Grid,
        { columns: 'auto', minItemWidth: 'sm' },
        elevation.map(([level, token, use, style]) =>
          h(
            'div',
            { key: level, className: 'docs-elevation', style },
            h(G.Heading, { level: 3, size: 'title' }, level),
            h('code', null, token),
            h(G.Text, { as: 'span', size: 'small', tone: 'muted' }, use),
          ),
        ),
      ),
    ),
    h(
      Section,
      {
        id: 'radios',
        title: 'Radios',
        description:
          'Una escala con nombre; cada tema decide cuánto vale cada paso. `--k5-radius-*` y, en Tailwind, `rounded-xs`, `rounded-panel`…',
      },
      h(
        G.Table,
        { caption: 'Radios por tema' },
        head('Token', 'Uso', 'Consola', 'Marca'),
        h(
          'tbody',
          null,
          radii.map(([key, use]) =>
            h(
              'tr',
              { key },
              h(
                'td',
                null,
                h(
                  G.Stack,
                  { direction: 'row', gap: '3' },
                  h('span', { className: 'docs-radius', style: { borderRadius: `var(--k5-radius-${key})` }, 'aria-hidden': 'true' }),
                  h('code', null, `--k5-radius-${key}`),
                ),
              ),
              h('td', null, use),
              h('td', null, sizeOf(consolaSize, key)),
              h('td', null, sizeOf(marcaSize, key)),
            ),
          ),
        ),
      ),
    ),
    h(
      Section,
      {
        id: 'espaciado',
        title: 'Espaciado',
        description: 'Escala de 4 px con los nombres de Tailwind: `--k5-space-4` = 16 px. Stack y Grid la usan con `gap`.',
      },
      h(
        G.Card,
        { className: 'docs-rows' },
        Object.entries(tokens.space.values)
          .sort(([, a], [, b]) => parseFloat(a) - parseFloat(b))
          .map(([key, value]) =>
            h(
              'div',
              { key, className: 'docs-row docs-row--space' },
              h('code', null, `--k5-space-${key}`),
              h('span', { className: 'docs-bar', style: { width: `var(--k5-space-${key})` }, 'aria-hidden': 'true' }),
              h(G.Text, { as: 'span', size: 'small', tone: 'muted' }, px(value)),
            ),
          ),
      ),
    ),
    h(
      Section,
      {
        id: 'densidad',
        title: 'Densidad',
        description:
          'La altura de los controles cambia con `data-k5-density` en cualquier contenedor. Sin atributo manda el tema, salvo con puntero táctil, que usa la cómoda; `data-k5-density="default"` fija la del tema también ahí.',
      },
      h(
        G.Card,
        { className: 'docs-rows' },
        densityRows.map(([key, label, use]) =>
          h(
            'div',
            { key: label, className: 'docs-row docs-row--density', ...(key ? { 'data-k5-density': key } : {}) },
            h(
              'div',
              { className: 'docs-row__meta' },
              h(G.Text, { as: 'span', weight: 'semibold' }, label),
              h(G.Text, { as: 'span', size: 'small', tone: 'muted' }, use),
            ),
            h(
              G.Stack,
              { direction: 'row', gap: '2', wrap: true },
              h(G.Input, { 'aria-label': `Potencia, densidad ${label.toLowerCase()}`, defaultValue: '8,4 kWp', readOnly: true }),
              h(G.Button, { variant: 'secondary' }, 'Cancelar'),
              h(G.Button, null, 'Guardar'),
            ),
          ),
        ),
      ),
    ),
    h(
      Section,
      {
        id: 'otras-escalas',
        title: 'Iconos, contenedores, bordes y opacidad',
        description: 'Escalas pequeñas, iguales en todos los temas.',
      },
      h(
        G.Table,
        { caption: 'Otras escalas' },
        head('Token', 'Valor', 'Uso'),
        h(
          'tbody',
          null,
          otherScales.map(([token, value, use]) =>
            h('tr', { key: token }, h('td', null, h('code', null, token)), h('td', null, value), h('td', null, use)),
          ),
        ),
      ),
    ),
    h(
      Section,
      { id: 'versiones', title: 'Versiones y deprecación', description: 'Cómo cambia Grado sin romper las aplicaciones que lo usan.' },
      h(
        G.Grid,
        { columns: 'auto', minItemWidth: 'lg' },
        versions.map(([title, text]) => h(NoteCard, { key: title, title }, text)),
      ),
    ),
  )
}
