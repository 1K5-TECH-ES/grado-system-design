import { createElement as h } from 'react'
import * as G from '@1k5-tech-es/grado-react'
import { Page, Section, TextLink, useSite, version } from '../ui.mjs'

const columns = [
  ['react', 'React'],
  ['vue', 'Vue'],
  ['parity', 'Mismo HTML'],
  ['browser', 'Navegador'],
  ['visual', 'Captura'],
  ['guide', 'Guía'],
]
const adoptionTone = { migrando: 'info', adoptada: 'success', pendiente: 'neutral' }
const adoptionLabel = { migrando: 'Migrando', adoptada: 'Adoptada', pendiente: 'Pendiente' }

// «6 · Button, AppShell, Nav…» con la fecha del inventario. Sin inventario, «—».
function componentList(app) {
  const names = Object.keys(app.componentes ?? {})
  if (!names.length) return '—'
  const shown = names.slice(0, 4).join(', ') + (names.length > 4 ? '…' : '')
  return h(
    G.Stack,
    { gap: '1' },
    h('span', null, `${names.length} · ${shown}`),
    app.inventario ? h(G.Text, { size: 'caption', tone: 'muted' }, `Inventario del ${app.inventario}`) : null,
  )
}

const Yes = ({ ok }) => (ok ? h(G.Status, { tone: 'success' }, 'Sí') : h(G.Status, { tone: 'neutral' }, 'No'))

export default function Status() {
  const { coverage, apps } = useSite().data
  const percentOf = (key) => `${Math.round((coverage.filter((row) => row[key]).length / coverage.length) * 100)} %`
  return h(
    Page,
    {
      title: 'Estado',
      subtitle:
        'Qué está probado de cada componente y qué versión usa cada aplicación. Se genera con la web a partir de los tests del repositorio.',
    },
    h(
      G.KpiGroup,
      { label: 'Cobertura' },
      h(G.Kpi, { label: 'Componentes', value: String(coverage.length), hint: 'Con la misma API en React y Vue' }),
      h(G.Kpi, { label: 'Probados en navegador', value: percentOf('browser'), hint: 'Teclado, foco y axe' }),
      h(G.Kpi, { label: 'Con captura de referencia', value: percentOf('visual'), hint: 'Regresión visual' }),
      h(G.Kpi, { label: 'Con guía de uso', value: percentOf('guide'), hint: 'Cuándo usarlo y qué evitar' }),
    ),
    h(
      Section,
      {
        id: 'cobertura',
        title: 'Cobertura por componente',
        description:
          '**Mismo HTML**: React y Vue generan el mismo marcado (tests de paridad). **Navegador**: teclado, foco y axe-core en 2 temas × 2 modos. **Captura**: tiene su propia captura de referencia en 2 temas × 2 modos (regresión visual). **Figma**: enlace al componente en la librería de diseño, cuando exista.',
      },
      h(
        G.Table,
        { caption: 'Cobertura de cada componente', compact: true, className: 'docs-status-table' },
        h(
          'thead',
          null,
          h(
            'tr',
            null,
            h('th', { scope: 'col' }, 'Componente'),
            columns.map(([key, label]) => h('th', { key, scope: 'col' }, label)),
            h('th', { scope: 'col' }, 'Figma'),
          ),
        ),
        h(
          'tbody',
          null,
          coverage.map((row) =>
            h(
              'tr',
              { key: row.id },
              h('th', { scope: 'row' }, h(TextLink, { to: `/componentes#${row.id}` }, row.name)),
              columns.map(([key]) => h('td', { key }, h(Yes, { ok: row[key] }))),
              h('td', null, row.figma ? h(G.Link, { href: row.figma, external: true }, 'Abrir') : '—'),
            ),
          ),
        ),
      ),
    ),
    h(
      Section,
      {
        id: 'adopcion',
        title: 'Adopción por aplicación',
        description: `Sale de \`docs-site/adoption.json\`. \`npx @1k5-tech-es/grado usage --adoption …\` cuenta los componentes de cada app; el estado se mantiene a mano. Versión actual de Grado: ${version}.`,
      },
      h(
        G.Table,
        { caption: 'Aplicaciones que usan Grado' },
        h(
          'thead',
          null,
          h(
            'tr',
            null,
            h('th', { scope: 'col' }, 'Aplicación'),
            h('th', { scope: 'col' }, 'Estado'),
            h('th', { scope: 'col' }, 'Versión'),
            h('th', { scope: 'col' }, 'Componentes'),
            h('th', { scope: 'col' }, 'Detalle'),
          ),
        ),
        h(
          'tbody',
          null,
          apps.map((app) =>
            h(
              'tr',
              { key: app.app },
              h('th', { scope: 'row' }, app.app),
              h('td', null, h(G.Badge, { tone: adoptionTone[app.estado] ?? 'neutral' }, adoptionLabel[app.estado] ?? app.estado)),
              h('td', null, app.version ? h('code', null, app.version) : '—'),
              h('td', null, componentList(app)),
              h('td', null, app.detalle || '—'),
            ),
          ),
        ),
      ),
    ),
  )
}
