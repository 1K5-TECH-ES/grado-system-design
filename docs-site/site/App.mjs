// La web como aplicación React: AppShell, React Router y una página por ruta.
import { createElement as h, lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import * as G from '@1k5/grado-react'
import { Layout } from './Layout.mjs'
import { routeByPath, routes } from './routes.mjs'
import { SiteProvider } from './ui.mjs'

// Cada página es su propio módulo: el navegador solo descarga la que se visita.
export const pageModules = {
  home: () => import('./pages/Home.mjs'),
  customize: () => import('./pages/Customize.mjs'),
  foundations: () => import('./pages/Foundations.mjs'),
  installation: () => import('./pages/Installation.mjs'),
  components: () => import('./pages/Components.mjs'),
  status: () => import('./pages/Status.mjs'),
  changelog: () => import('./pages/Changelog.mjs'),
}
const lazyPages = Object.fromEntries(Object.entries(pageModules).map(([key, load]) => [key, lazy(load)]))

const useIsomorphicLayoutEffect = typeof document === 'undefined' ? useEffect : useLayoutEffect

/** Va arriba al cambiar de página y al ancla cuando la hay. Se monta dentro de la página, ya pintada. */
function RouteEffects({ title }) {
  const { pathname, hash } = useLocation()
  const last = useRef(null)
  useEffect(() => {
    document.title = `${title} · Grado`
  }, [title])
  useIsomorphicLayoutEffect(() => {
    // El contenido se desplaza dentro del <main> de AppShell, no en la ventana.
    const behavior = last.current === pathname ? 'smooth' : 'instant'
    last.current = pathname
    const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
    if (target) target.scrollIntoView({ behavior })
    else if (behavior === 'instant') document.getElementById('contenido')?.scrollTo({ top: 0, behavior })
  }, [pathname, hash])
  return null
}

/** Los enlaces escritos como <a href> dentro de los textos también navegan sin recargar. */
function useLinkInterception(basename) {
  const navigate = useNavigate()
  useEffect(() => {
    const intercept = (event) => {
      const link = event.target instanceof Element && event.target.closest('a[href]')
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
      if (link.hasAttribute('download') || link.target) return
      const url = new URL(link.href)
      const path = basename === '/' ? url.pathname : url.pathname.slice(basename.length) || '/'
      if (url.origin !== window.location.origin || !routeByPath[path]) return
      event.preventDefault()
      navigate(`${path}${url.search}${url.hash}`)
    }
    document.addEventListener('click', intercept)
    return () => document.removeEventListener('click', intercept)
  }, [navigate, basename])
}

const loading = h('div', { className: 'docs-page docs-page--loading', 'aria-busy': 'true' }, h(G.Spinner, { label: 'Cargando la página' }))

export function App({ data, basename = '/' }) {
  useLinkInterception(basename)
  return h(
    SiteProvider,
    { data },
    h(
      Layout,
      null,
      h(
        Suspense,
        { fallback: loading },
        h(
          Routes,
          null,
          routes.map((route) =>
            h(Route, {
              key: route.key,
              path: route.path,
              element: h('div', { className: 'docs-route' }, h(lazyPages[route.key]), h(RouteEffects, { title: route.title })),
            }),
          ),
          h(Route, { key: 'fallback', path: '*', element: h(lazyPages.home) }),
        ),
      ),
    ),
  )
}

/** Para el build y los tests: la página ya cargada, dentro del mismo armazón. */
export function StaticApp({ data, page: PageComponent, framework }) {
  return h(SiteProvider, { data, framework }, h(Layout, null, h('div', { className: 'docs-route' }, h(PageComponent))))
}
