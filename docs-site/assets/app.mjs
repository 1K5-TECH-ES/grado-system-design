import { createElement, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { initDocs } from './docs.js'

const loadLiveDemos = () => import('./live-demos.mjs')

const routes = {
  '/': 'home',
  '/personalizar': 'customize',
  '/instalacion': 'installation',
  '/componentes': 'components',
  '/estado': 'status',
  '/cambios': 'changelog',
}
const routeSuffix = /\/(?:personalizar|instalacion|componentes|estado|cambios)$/
const basename = window.location.pathname.replace(routeSuffix, '').replace(/\/$/, '') || '/'
const routePath = (pathname) => (basename === '/' ? pathname : pathname.slice(basename.length) || '/')

function LoadedPage({ page, pageKey }) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = `${page.title} · Grado`
    document.body.dataset.page = pageKey
    const disposeDocs = initDocs()
    let disposed = false
    let disposeDemos = () => {}
    if (pageKey === 'customize' || pageKey === 'components')
      loadLiveDemos().then(({ initLiveDemos }) => {
        if (!disposed) disposeDemos = initLiveDemos()
      })
    return () => {
      disposed = true
      disposeDemos()
      disposeDocs()
    }
  }, [page, pageKey, location.search])

  // El contenido se desplaza dentro del <main> de AppShell, no en la ventana. Se espera a
  // que la página de la ruta esté pintada; al llegar a una página el salto es instantáneo.
  const current = (routes[location.pathname] ?? 'home') === pageKey
  const scrolled = useRef(null)
  useEffect(() => {
    if (!current) return
    const behavior = scrolled.current === page ? 'smooth' : 'instant'
    scrolled.current = page
    if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior }))
    else document.getElementById('contenido')?.scrollTo({ top: 0, behavior })
  }, [current, page, location.hash])

  useEffect(() => {
    const intercept = (event) => {
      const link = event.target.closest('a[href]')
      if (
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        link.hasAttribute('download')
      )
        return
      const url = new URL(link.href)
      const path = routePath(url.pathname)
      if (url.origin !== window.location.origin || !routes[path]) return
      event.preventDefault()
      navigate(`${path}${url.search}${url.hash}`)
    }
    document.addEventListener('click', intercept)
    return () => document.removeEventListener('click', intercept)
  }, [navigate])

  return createElement('div', { className: 'docs-app', dangerouslySetInnerHTML: { __html: page.html } })
}

// Mientras llega la página nueva se mantiene la anterior: el armazón no parpadea.
const cache = new Map()
function Page({ pageKey }) {
  const [loaded, setLoaded] = useState(null)
  useEffect(() => {
    if (cache.has(pageKey)) {
      setLoaded({ key: pageKey, page: cache.get(pageKey) })
      return
    }
    const controller = new AbortController()
    fetch(`assets/pages/${pageKey}.json`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`No se pudo cargar ${pageKey}`)
        return response.json()
      })
      .then((page) => {
        cache.set(pageKey, page)
        setLoaded({ key: pageKey, page })
      })
      .catch((error) => {
        if (error.name !== 'AbortError') throw error
      })
    return () => controller.abort()
  }, [pageKey])
  return loaded
    ? createElement(LoadedPage, { page: loaded.page, pageKey: loaded.key })
    : createElement('main', { className: 'route-loading', 'aria-busy': 'true' }, 'Cargando…')
}

function App() {
  const location = useLocation()
  const pageKey = routes[location.pathname] ?? 'home'
  return createElement(Page, { pageKey })
}

createRoot(document.getElementById('app')).render(createElement(BrowserRouter, { basename }, createElement(App)))
