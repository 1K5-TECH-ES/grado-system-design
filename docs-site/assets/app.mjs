import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Cobertura, adopción y cambios: los calcula el build (docs-site/site-data.mjs).
import data from 'virtual:site-data'
import { App } from '../site/App.mjs'

// La web puede vivir en una subcarpeta: lo que precede a la ruta es la base.
const routeSuffix = /\/(?:personalizar|fundamentos|instalacion|componentes|estado|cambios)$/
const basename = window.location.pathname.replace(routeSuffix, '').replace(/\/$/, '') || '/'

createRoot(document.getElementById('app')).render(createElement(BrowserRouter, { basename }, createElement(App, { data, basename })))
