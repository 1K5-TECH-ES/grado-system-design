import { createElement as h } from 'react'
import * as G from '@1k5-tech-es/grado-react'
import tokens from '@1k5-tech-es/grado/tokens.json' with { type: 'json' }
import { icons } from '../icons.mjs'
import { useAppearance } from '../Layout.mjs'
import { LinkButton, Page, Section, TextLink, useSite, version } from '../ui.mjs'

const brandColors = [...Object.entries(tokens.brand).map(([name, c]) => [name, c.hex]), ['graphite', tokens.neutral.graphite]]
const px = (rem) => `${parseFloat(rem) * 16} px`
const typeSteps = ['title', 'heading', 'lead', 'body', 'caption']
const typeLabel = { title: 'Título', heading: 'Sección', lead: 'Entradilla', body: 'Cuerpo', caption: 'Etiqueta' }
const spaceSteps = ['1', '2', '3', '4', '6', '8', '12', '16']

const swatches = h(
  'span',
  { className: 'docs-swatches', 'aria-hidden': 'true' },
  ['aubergine', 'mint', 'fuchsia'].map((name) => h('i', { key: name, style: { background: `var(--k5-${name})` } })),
)

const paths = (total) => [
  {
    to: '/personalizar',
    icon: icons.customize,
    title: 'Personaliza',
    text: 'Elige tu color principal y recibe paletas que combinan con él, con el contraste comprobado.',
    sample: swatches,
    cta: 'Abrir el configurador',
  },
  {
    to: '/instalacion',
    icon: icons.installation,
    title: 'Instala',
    text: 'Paquetes públicos en GitHub Packages, estilos para Tailwind 3, Tailwind 4 o CSS y ejemplos en React y Vue.',
    sample: h('code', { className: 'docs-command' }, 'npm install @1k5-tech-es/grado'),
    cta: 'Ver la guía',
  },
  {
    to: '/componentes',
    icon: icons.components,
    title: 'Explora',
    text: `${total} componentes con vista previa real, código y tabla de propiedades.`,
    sample: h(
      G.Stack,
      { direction: 'row', gap: '2', wrap: true },
      // Muestra, no control: la clase de Button sobre un <span>.
      h('span', { className: G.buttonClass({ size: 'sm' }), 'aria-hidden': 'true' }, 'Guardar'),
      h(G.Badge, { tone: 'success' }, 'Conectada'),
      h(G.Avatar, { name: 'Lucía Fernández', size: 'sm' }),
    ),
    cta: 'Ver componentes',
  },
]

function PathCard({ to, icon: Icon, title, text, sample, cta }) {
  return h(
    G.Card,
    { className: 'docs-path' },
    h(
      G.CardHeader,
      null,
      h('span', { className: 'docs-icon', 'aria-hidden': 'true' }, h(Icon)),
      h(G.CardTitle, null, title),
      h(G.CardDescription, null, text),
    ),
    h(G.CardContent, null, sample),
    h(G.CardFooter, null, h(TextLink, { to }, cta, h(icons.arrow, { 'aria-hidden': 'true', className: 'docs-arrow' }))),
  )
}

function ThemeCard({ theme, title, text }) {
  const appearance = useAppearance()
  const active = appearance.theme === theme
  return h(
    G.Card,
    { className: 'docs-theme' },
    h('span', { className: `docs-theme__mini docs-theme__mini--${theme}`, 'aria-hidden': 'true' }, h('i'), h('b'), h('em')),
    h(
      G.CardContent,
      { className: 'docs-theme__body' },
      h('div', null, h(G.Heading, { level: 3, size: 'lead' }, title), h(G.Text, { tone: 'muted', size: 'small' }, text)),
      h(
        G.Button,
        { variant: active ? 'secondary' : 'primary', size: 'sm', 'aria-pressed': active, onClick: () => appearance.setTheme(theme) },
        active ? 'En uso' : 'Aplicar',
      ),
    ),
  )
}

const card = (title, description, content) =>
  h(
    G.Card,
    null,
    h(G.CardHeader, null, h(G.CardTitle, null, title), h(G.CardDescription, null, description)),
    h(G.CardContent, null, content),
  )

export default function Home() {
  const { families } = useSite().data
  const total = families.reduce((sum, group) => sum + group.items.length, 0)
  return h(
    Page,
    {
      title: 'Sistema de diseño Grado',
      subtitle:
        'Tokens, componentes y patrones para que todas las plataformas de 1KOMMA5° España se vean y funcionen igual. Para React, Vue y HTML.',
      actions: h(
        G.Stack,
        { direction: 'row', gap: '2', wrap: true },
        h(LinkButton, { to: '/instalacion', variant: 'secondary', icon: icons.installation }, 'Instalar'),
        h(LinkButton, { to: '/componentes', icon: icons.components }, 'Explorar componentes'),
      ),
    },
    h(
      G.KpiGroup,
      { label: 'Grado en cifras' },
      h(G.Kpi, { label: 'Componentes', value: String(total), hint: `En ${families.length} familias` }),
      h(G.Kpi, { label: 'Frameworks', value: '3', hint: 'React · Vue · HTML' }),
      h(G.Kpi, { label: 'Temas', value: '2', hint: 'Consola y Marca' }),
      h(G.Kpi, { label: 'Versión', value: version, hint: 'En GitHub Packages' }),
    ),
    h(
      Section,
      { id: 'introduccion', title: 'Empieza aquí', description: 'Tres pasos para llevar Grado a tu aplicación.' },
      h(
        G.Grid,
        { columns: 'auto', minItemWidth: 'lg' },
        paths(total).map((path) => h(PathCard, { key: path.to, ...path })),
      ),
    ),
    h(
      Section,
      {
        id: 'fundamentos',
        title: 'Fundamentos',
        description:
          '`tokens.json` define color, tipografía, tamaños y radios. Cada aplicación recibe los mismos valores mediante CSS, Tailwind o JavaScript.',
        action: h(LinkButton, { to: '/fundamentos', variant: 'secondary', size: 'sm' }, 'Ver todas las escalas'),
      },
      h(
        G.Grid,
        { columns: 'auto', minItemWidth: 'lg' },
        card(
          'Color',
          'Los colores de la guía de marca.',
          h(
            'ul',
            { className: 'docs-brand-colors' },
            brandColors.map(([name, hex]) =>
              h(
                'li',
                { key: name },
                h('i', { style: { background: hex }, 'aria-hidden': 'true' }),
                h(G.Text, { as: 'span', weight: 'semibold' }, name[0].toUpperCase() + name.slice(1)),
                h('code', null, hex),
              ),
            ),
          ),
        ),
        card(
          'Tipografía',
          'Inter, incluida en el paquete.',
          h(
            'ul',
            { className: 'docs-scale-list' },
            typeSteps.map((step) =>
              h(
                'li',
                { key: step },
                h('span', { style: { fontSize: `var(--k5-text-${step})`, lineHeight: `var(--k5-leading-${step})` } }, typeLabel[step]),
                h('code', null, px(tokens.typography.scale[step].size)),
              ),
            ),
          ),
        ),
        card(
          'Espaciado',
          'Escala de 4 px para rellenos, márgenes y huecos.',
          h(
            'ul',
            { className: 'docs-scale-list' },
            spaceSteps.map((step) =>
              h(
                'li',
                { key: step },
                h('code', null, `space-${step}`),
                h('span', { className: 'docs-bar', style: { width: `var(--k5-space-${step})` }, 'aria-hidden': 'true' }),
                h(G.Text, { as: 'span', size: 'small', tone: 'muted' }, px(tokens.space.values[step])),
              ),
            ),
          ),
        ),
      ),
    ),
    h(
      Section,
      { id: 'temas', title: 'Temas', description: 'Los tres comparten tokens y componentes. Aplica uno para ver toda la web con él.' },
      h(
        G.Grid,
        { columns: 3 },
        h(ThemeCard, { theme: 'consola', title: 'Consola', text: 'Cabecera berenjena y barra lateral clara. Para herramientas internas.' }),
        h(ThemeCard, { theme: 'marca', title: 'Marca', text: 'Barra lateral berenjena y fondo lila. Para lo que ve el cliente.' }),
        h(ThemeCard, {
          theme: 'campo',
          title: 'Campo',
          text: 'Alto contraste (7 : 1) y controles de 44 px. Para técnicos con la tablet al sol.',
        }),
      ),
    ),
    h(
      Section,
      {
        id: 'indice',
        title: 'Biblioteca',
        description: `${total} componentes con la misma API en React y Vue, y CSS para cualquier interfaz web.`,
        action: h(LinkButton, { to: '/componentes', variant: 'secondary', size: 'sm' }, 'Ver todos'),
      },
      h(
        G.Table,
        { caption: 'Componentes por familia' },
        h(
          'thead',
          null,
          h(
            'tr',
            null,
            h('th', { scope: 'col' }, 'Familia'),
            h('th', { scope: 'col' }, 'Componentes'),
            h('th', { scope: 'col', className: 'k5-num' }, 'Total'),
          ),
        ),
        h(
          'tbody',
          null,
          families.map((group) => {
            const Icon = icons[group.name]
            return h(
              'tr',
              { key: group.name },
              h(
                'th',
                { scope: 'row' },
                h(G.Stack, { direction: 'row', gap: '2' }, h(Icon, { 'aria-hidden': 'true', className: 'docs-row-icon' }), group.name),
              ),
              h(
                'td',
                null,
                h(
                  'span',
                  { className: 'docs-inline-links' },
                  group.items.map((c) => h(TextLink, { key: c.id, to: `/componentes#${c.id}` }, c.name)),
                ),
              ),
              h('td', { className: 'k5-num' }, group.items.length),
            )
          }),
        ),
      ),
    ),
  )
}
