import { createElement as h, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { useLocation } from 'react-router-dom'
import * as G from '@1k5/grado-react'
import { byCategory, components } from '../../catalog.mjs'
import { guidelines } from '../../guidelines.mjs'
import { loadFonts, savedThemeVariables } from '../../configurator.mjs'
import { icons } from '../icons.mjs'
import { useAppearance } from '../Layout.mjs'
import { rich, slug } from '../text.mjs'
import { FrameworkCode, FrameworkSwitch, Page, TextLink } from '../ui.mjs'

// AppShell dentro de una vista previa: su <main> y el id de su barra lateral chocarían con los
// de la web. Se pinta como HTML estático, con el <main> convertido en <div>.
function StaticPreview({ node }) {
  const [html, setHtml] = useState('')
  useEffect(() => {
    // Se pinta en un nodo suelto con el React DOM que ya usa la web y se copia el resultado.
    const element = document.createElement('div')
    const root = createRoot(element, { identifierPrefix: 'preview-' })
    flushSync(() => root.render(node))
    setHtml(
      element.innerHTML
        .replace(/<main\b/g, '<div')
        .replace(/<\/main>/g, '</div>')
        .replace(/"k5-app-sidebar"/g, '"demo-app-sidebar"'),
    )
    root.unmount()
  }, [node])
  return html ? h('div', { dangerouslySetInnerHTML: { __html: html } }) : h(G.Skeleton, { height: '18rem' })
}

const staticPreviews = new Set(['app-shell'])

const GuideList = ({ title, items, tone, icon: Icon, itemIcon: ItemIcon }) =>
  h(
    'div',
    { className: `docs-guide docs-guide--${tone}` },
    h('h4', null, h(Icon, { 'aria-hidden': 'true' }), title),
    h(
      'ul',
      null,
      items.map((item) => h('li', { key: item }, ItemIcon ? h(ItemIcon, { 'aria-hidden': 'true' }) : null, h('span', null, rich(item)))),
    ),
  )

function Guide({ id }) {
  const g = guidelines[id]
  if (!g) return null
  return h(
    'div',
    { className: 'docs-guide-grid', role: 'group', 'aria-label': 'Guía de uso' },
    h(GuideList, { title: 'Cuándo usarlo', items: g.use, tone: 'use', icon: icons.circleCheck, itemIcon: icons.check }),
    h(GuideList, { title: 'Qué evitar', items: g.avoid, tone: 'avoid', icon: icons.circleX, itemIcon: icons.x }),
    g.a11y?.length ? h(GuideList, { title: 'Accesibilidad', items: g.a11y, tone: 'a11y', icon: icons.a11y }) : null,
  )
}

const PropsTable = ({ rows }) =>
  h(
    G.Table,
    { caption: 'Propiedades principales', compact: true },
    h(
      'thead',
      null,
      h(
        'tr',
        null,
        h('th', { scope: 'col' }, 'Propiedad'),
        h('th', { scope: 'col' }, 'Valores / uso'),
        h('th', { scope: 'col' }, 'Por defecto'),
      ),
    ),
    h(
      'tbody',
      null,
      rows.map(([name, type, def]) =>
        h('tr', { key: name }, h('td', null, h('code', null, name)), h('td', null, type), h('td', null, def)),
      ),
    ),
  )

function ComponentSection({ c, theme }) {
  const preview = h(
    'div',
    { className: 'demo-preview demo-preview--live', ...theme },
    staticPreviews.has(c.id) ? h(StaticPreview, { node: c.preview }) : c.preview,
  )
  return h(
    'section',
    { id: c.id, className: 'docs-component', 'aria-labelledby': `${c.id}-titulo` },
    h(
      G.Card,
      null,
      h(
        G.CardHeader,
        { className: 'docs-component__head' },
        h(G.CardTitle, { id: `${c.id}-titulo` }, h('a', { href: `#${c.id}`, className: 'docs-anchor' }, c.name)),
        h(G.CardDescription, null, rich(c.description)),
      ),
      h(
        G.CardContent,
        { className: 'docs-component__body' },
        h(G.Tabs, {
          label: `Ejemplo de ${c.name}`,
          items: [
            { value: 'preview', label: 'Vista previa', content: preview },
            { value: 'code', label: 'Código', content: h(FrameworkCode, { react: c.react, vue: c.vue }) },
          ],
        }),
        h(Guide, { id: c.id }),
        h(G.Accordion, {
          items: [
            {
              value: 'props',
              title: 'Propiedades y uso',
              content: h(
                'div',
                null,
                h(PropsTable, { rows: c.props }),
                c.note ? h(G.Text, { size: 'small', tone: 'muted', className: 'docs-note' }, rich(c.note)) : null,
              ),
            },
          ],
        }),
      ),
    ),
  )
}

/** Vistas previas con el tema creado en Personalizar («Mi tema») o con el de la web. */
function usePreviewTheme() {
  const { search } = useLocation()
  const { mode } = useAppearance()
  const [custom, setCustom] = useState(() => new URLSearchParams(search).get('vista') === 'mi-tema')
  const [asked, setAsked] = useState(false)
  const [saved, setSaved] = useState(null)
  useEffect(() => {
    const next = custom ? savedThemeVariables(mode) : null
    if (next) loadFonts([next.font])
    setSaved(next)
  }, [custom, mode])
  const choose = (value) => {
    setAsked(value === 'custom')
    setCustom(value === 'custom')
  }
  const props = saved ? { style: saved.vars, 'data-k5-theme': saved.base } : {}
  return { value: saved ? 'custom' : 'site', choose, missing: asked && custom && !saved, code: saved?.code ?? '', props }
}

export default function Components() {
  const preview = usePreviewTheme()
  return h(
    Page,
    {
      title: 'Componentes',
      subtitle:
        'Piezas pequeñas para construir algo consistente. Explora sus estados, pruébalas con tu tema y lleva el código a tu aplicación.',
      actions: h(
        G.Stack,
        { direction: 'row', gap: '2', wrap: true },
        h(G.SegmentedControl, {
          label: 'Tema de las vistas previas',
          size: 'sm',
          value: preview.value,
          onValueChange: preview.choose,
          options: [
            { value: 'site', label: 'Tema de la web' },
            { value: 'custom', label: preview.code ? `Mi tema · ${preview.code}` : 'Mi tema' },
          ],
        }),
        h(FrameworkSwitch),
      ),
    },
    h(
      G.Stack,
      { gap: '4' },
      preview.missing
        ? h(
            G.Alert,
            {
              tone: 'warning',
              title: 'Todavía no has creado un tema',
              action: h(TextLink, { to: '/personalizar' }, 'Créalo en Personalizar'),
            },
            'Vuelve después para ver aquí los componentes con tus colores.',
          )
        : null,
      h(
        G.Text,
        { size: 'small', tone: 'muted' },
        `${components.length} componentes en ${byCategory.length} familias. Las vistas previas usan los componentes reales; los datos y las acciones de negocio son demostrativos.`,
      ),
    ),
    byCategory.map((group) => {
      const Icon = icons[group.name]
      const id = `familia-${slug(group.name)}`
      return h(
        'section',
        { key: group.name, className: 'docs-family', id, 'aria-labelledby': `${id}-titulo` },
        h(
          G.Heading,
          { level: 2, size: 'heading', id: `${id}-titulo`, className: 'docs-family__title' },
          h('span', { className: 'docs-icon', 'aria-hidden': 'true' }, h(Icon)),
          group.name,
          h(G.Badge, null, String(group.items.length)),
        ),
        group.items.map((c) => h(ComponentSection, { key: c.id, c, theme: preview.props })),
      )
    }),
  )
}
