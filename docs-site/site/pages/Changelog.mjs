import { createElement as h } from 'react'
import * as G from '@1k5-tech-es/grado-react'
import { rich } from '../text.mjs'
import { Page, useSite } from '../ui.mjs'

const Block = ({ block }) =>
  block.type === 'heading'
    ? h(G.Heading, { level: 3, size: 'lead' }, rich(block.text))
    : block.type === 'list'
      ? h(
          'ul',
          { className: 'docs-list' },
          block.items.map((item, i) => h('li', { key: i }, rich(item))),
        )
      : h(G.Text, null, rich(block.text))

export default function Changelog() {
  const { intro, versions } = useSite().data.changelog
  return h(
    Page,
    { title: 'Cambios', subtitle: intro },
    h(
      'div',
      { className: 'docs-changelog' },
      h(
        G.Card,
        { className: 'docs-changelog__index' },
        h(G.CardHeader, null, h(G.CardTitle, { as: 'h2' }, 'Versiones')),
        h(
          G.CardContent,
          null,
          h(
            G.Nav,
            { label: 'Versiones' },
            versions.map((v) => h(G.NavItem, { key: v.id, href: `#${v.id}`, label: v.number })),
          ),
        ),
      ),
      h(
        G.Stack,
        { gap: '6' },
        versions.map((v) =>
          h(
            G.Card,
            { key: v.id },
            h(
              G.CardHeader,
              null,
              h(G.CardTitle, { as: 'h2', id: v.id, className: 'docs-version' }, v.number),
              v.note ? h(G.Badge, { tone: v.note.includes('sin publicar') ? 'warning' : 'neutral' }, v.note) : null,
            ),
            h(
              G.CardContent,
              { className: 'docs-prose' },
              v.blocks.map((block, i) => h(Block, { key: i, block })),
            ),
          ),
        ),
      ),
    ),
  )
}
