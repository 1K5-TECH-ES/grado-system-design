// Piezas compartidas de las páginas. Todo se compone con @1k5-tech-es/grado-react; aquí solo hay
// lo que Grado no trae como componente (bloque de código, índice de página).
import { createContext, createElement as h, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as G from '@1k5-tech-es/grado-react'
import gradoPackage from '@1k5-tech-es/grado/package.json' with { type: 'json' }
import { rich } from './text.mjs'

export const version = gradoPackage.version

// Preferencias guardadas: el almacenamiento puede estar desactivado.
export const storage = {
  read(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback
    } catch {
      return fallback
    }
  },
  save(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* sin almacenamiento local: se sigue sin recordar */
    }
  },
}

// ── Datos del build y preferencias de la web ─────────────────────────────
export const SiteContext = createContext({ data: null, framework: 'react', setFramework: () => {} })
export const useSite = () => useContext(SiteContext)

export function SiteProvider({ data, framework: initial = 'react', children }) {
  const [framework, setFrameworkState] = useState(initial)
  useEffect(() => {
    const saved = storage.read('grado-docs-framework', 'react')
    if (saved === 'vue') setFrameworkState('vue')
  }, [])
  const setFramework = (value) => {
    setFrameworkState(value)
    storage.save('grado-docs-framework', value)
  }
  return h(SiteContext.Provider, { value: { data, framework, setFramework } }, children)
}

export function FrameworkSwitch() {
  const { framework, setFramework } = useSite()
  return h(G.SegmentedControl, {
    label: 'Framework de los ejemplos',
    size: 'sm',
    value: framework,
    onValueChange: setFramework,
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
    ],
  })
}

// ── Enlaces ──────────────────────────────────────────────────────────────
/** Enlace interno con aspecto de botón: buttonClass() sobre el Link del router. */
export const LinkButton = ({ to, variant = 'primary', size, icon: Icon, children }) =>
  h(Link, { to, className: G.buttonClass({ variant, size }) }, Icon ? h(Icon, { 'aria-hidden': 'true' }) : null, children)

/** Enlace de texto de Grado sobre el Link del router. */
export const TextLink = ({ to, children, ...rest }) => h(G.Link, { as: Link, to, ...rest }, children)

// ── Código ───────────────────────────────────────────────────────────────
/** Código con su etiqueta y CopyButton. Los archivos largos se pueden plegar. */
export function CodeBlock({ code, label = 'Código', collapsible = false }) {
  const [open, setOpen] = useState(false)
  const lines = code.split('\n').length
  const folds = collapsible && lines > 14
  return h(
    'div',
    { className: `code-block${folds && !open ? ' code-block--collapsed' : ''}` },
    h('div', { className: 'code-block__bar' }, h('span', null, label), h(G.CopyButton, { value: code, size: 'sm' })),
    h('pre', { tabIndex: 0 }, h('code', null, code)),
    folds &&
      h(
        G.Button,
        {
          variant: 'ghost',
          size: 'sm',
          block: true,
          className: 'code-block__expand',
          'aria-expanded': open,
          onClick: () => setOpen(!open),
        },
        open ? 'Contraer' : `Ver el archivo completo · ${lines} líneas`,
      ),
  )
}

/** El mismo ejemplo en React y en Vue: se ve el del framework elegido. */
export function FrameworkCode({ react, vue, reactLabel = 'React · TSX', vueLabel = 'Vue · SFC' }) {
  const { framework } = useSite()
  return framework === 'vue' ? h(CodeBlock, { code: vue, label: vueLabel }) : h(CodeBlock, { code: react, label: reactLabel })
}

// ── Estructura de página ─────────────────────────────────────────────────
/** Sección con título, entradilla opcional y una acción a la derecha. */
export function Section({ id, title, description, action, children }) {
  const titleId = `${id}-titulo`
  return h(
    'section',
    { className: 'docs-section', id, 'aria-labelledby': titleId },
    h(
      'div',
      { className: 'docs-section__head' },
      h(
        'div',
        null,
        h(G.Heading, { level: 2, size: 'heading', id: titleId }, title),
        description ? h(G.Text, { tone: 'muted', size: 'small' }, rich(description)) : null,
      ),
      action ?? null,
    ),
    children,
  )
}

/** Tarjeta con título y texto: notas, principios, criterios. */
export const NoteCard = ({ title, children }) =>
  h(G.Card, null, h(G.CardHeader, null, h(G.CardTitle, null, title)), h(G.CardContent, null, h(G.Text, { tone: 'muted' }, rich(children))))

export const footer = h(
  'footer',
  { className: 'docs-footer' },
  h(G.Text, { as: 'span', size: 'small', tone: 'muted' }, `Grado° ${version} · Sistema de diseño de 1KOMMA5° España`),
  h(G.Text, { as: 'span', size: 'small', tone: 'muted' }, 'Una identidad. Muchas aplicaciones.'),
)

/** Página: PageHeader, contenido, índice opcional a la derecha y pie. */
export function Page({ title, subtitle, actions, toc = [], children }) {
  const body = h('div', { className: 'docs-page__body' }, h(G.PageHeader, { title, subtitle: rich(subtitle), actions }), children, footer)
  if (!toc.length) return h('div', { className: 'docs-page' }, body)
  return h(
    'div',
    { className: 'docs-page docs-page--toc' },
    body,
    h(
      'div',
      { className: 'docs-toc' },
      h(
        G.Nav,
        { label: 'Índice de página' },
        h(
          G.NavSection,
          { title: 'En esta página' },
          toc.map(([id, label]) => h(G.NavItem, { key: id, href: `#${id}`, label })),
        ),
      ),
    ),
  )
}
