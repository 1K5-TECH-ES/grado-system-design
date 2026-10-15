// Armazón de la web: el AppShell de Grado, como el de cualquier aplicación. La búsqueda es
// CommandPalette, el tema y el modo son SegmentedControl y la navegación usa NavLink.
import { createElement as h, useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import * as G from '@1k5/grado-react'
import { GradoMark } from '../brand.mjs'
import { icons } from './icons.mjs'
import { routes, searchGroups } from './routes.mjs'
import { storage, useSite } from './ui.mjs'

const root = () => (typeof document === 'undefined' ? null : document.documentElement)

/** Tema y modo de toda la web. theme.js los aplica antes de pintar; aquí se cambian. */
export function useAppearance() {
  const [theme, setThemeState] = useState(() => root()?.dataset.k5Theme ?? 'marca')
  const [mode, setModeState] = useState(() => (root()?.classList.contains('dark') ? 'dark' : 'light'))
  // Otro control (las tarjetas de tema de Inicio) también puede cambiarlos.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeState(root().dataset.k5Theme)
      setModeState(root().classList.contains('dark') ? 'dark' : 'light')
    })
    observer.observe(root(), { attributes: true, attributeFilter: ['class', 'data-k5-theme'] })
    return () => observer.disconnect()
  }, [])
  const setTheme = (value) => {
    root().dataset.k5Theme = value
    storage.save('grado-docs-tema', value)
  }
  const setMode = (value) => {
    root().classList.toggle('dark', value === 'dark')
    storage.save('grado-docs-mode', value)
  }
  return { theme, mode, setTheme, setMode }
}

function AppearanceSwitches() {
  const { theme, mode, setTheme, setMode } = useAppearance()
  return h(
    'div',
    { className: 'docs-switches' },
    h(G.SegmentedControl, {
      label: 'Tema',
      size: 'sm',
      value: theme,
      onValueChange: setTheme,
      options: [
        { value: 'consola', label: 'Consola' },
        { value: 'marca', label: 'Marca' },
      ],
    }),
    h(G.SegmentedControl, {
      label: 'Modo de color',
      size: 'sm',
      value: mode,
      onValueChange: setMode,
      options: [
        { value: 'light', label: 'Claro' },
        { value: 'dark', label: 'Oscuro' },
      ],
    }),
  )
}

const brand = h(
  Link,
  { to: '/', className: 'docs-brand', 'aria-label': 'Grado, sistema de diseño. Inicio' },
  h(GradoMark, { className: 'docs-brand__mark', 'aria-hidden': 'true' }),
  h(
    'span',
    { className: 'docs-brand__text' },
    h('span', { className: 'docs-brand__name' }, 'Grado'),
    h('span', { className: 'docs-brand__tag' }, 'Sistema de diseño'),
  ),
)

function Sidebar() {
  const { families } = useSite().data
  const total = families.reduce((sum, group) => sum + group.items.length, 0)
  const location = useLocation()
  const current = location.pathname === '/componentes' ? decodeURIComponent(location.hash.slice(1)) : ''
  const groupOf = (id) => families.find((group) => group.items.some((c) => c.id === id))?.name
  const currentGroup = groupOf(current)
  const [open, setOpen] = useState(() => new Set())
  // Al llegar al ancla de un componente se abre su grupo.
  useEffect(() => {
    if (currentGroup) setOpen((set) => (set.has(currentGroup) ? set : new Set(set).add(currentGroup)))
  }, [currentGroup])
  const toggle = (name, value) =>
    setOpen((set) => {
      const next = new Set(set)
      if (value) next.add(name)
      else next.delete(name)
      return next
    })
  return h(
    G.Nav,
    { label: 'Documentación' },
    h(
      G.NavSection,
      null,
      routes.map((route) =>
        h(G.NavItem, {
          key: route.key,
          as: NavLink,
          to: route.path,
          end: true,
          label: route.label,
          icon: route.icon,
          badge: route.key === 'components' ? total : route.badge,
        }),
      ),
    ),
    h(
      G.NavSection,
      { title: 'Componentes' },
      families.map((group) =>
        h(
          G.NavGroup,
          {
            key: group.name,
            label: group.name,
            icon: icons[group.name],
            active: currentGroup === group.name,
            open: open.has(group.name),
            onOpenChange: (value) => toggle(group.name, value),
          },
          group.items.map((c) =>
            h(G.NavItem, {
              key: c.id,
              as: Link,
              to: `/componentes#${c.id}`,
              label: c.name,
              'aria-current': current === c.id ? 'location' : undefined,
            }),
          ),
        ),
      ),
    ),
  )
}

export function Layout({ children }) {
  const { families } = useSite().data
  const groups = useMemo(() => searchGroups(families), [families])
  const navigate = useNavigate()
  const [searching, setSearching] = useState(false)
  // «/» abre la búsqueda fuera de los campos; Ctrl/⌘ + K lo gestiona CommandPalette.
  useEffect(() => {
    const onKey = (event) => {
      const typing = event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable]')
      if (event.key !== '/' || typing || event.ctrlKey || event.metaKey || event.altKey) return
      event.preventDefault()
      setSearching(true)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  const switches = h(AppearanceSwitches)
  return h(
    G.AppShell,
    {
      className: 'docs-shell',
      brand,
      search: h(G.AppSearch, {
        label: 'Buscar componentes y guías',
        shortcut: '/',
        'aria-haspopup': 'dialog',
        onClick: () => setSearching(true),
      }),
      actions: switches,
      sidebar: h(Sidebar),
      sidebarFooter: h('div', { className: 'docs-sidebar-footer' }, switches),
    },
    children,
    h(G.CommandPalette, {
      groups,
      open: searching,
      onOpenChange: setSearching,
      label: 'Buscar en la documentación',
      placeholder: 'Buscar componentes y guías…',
      emptyLabel: 'No hay resultados.',
      onSelect: (to) => navigate(to),
    }),
  )
}
