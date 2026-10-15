import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { LiveDemo } from '../demos.mjs'
import { Configurator, loadFonts, savedThemeVariables } from '../configurator.mjs'

export function initLiveDemos() {
  const roots = []
  for (const element of document.querySelectorAll('[data-live-demo]')) {
    const root = createRoot(element, { identifierPrefix: `live-${element.dataset.liveDemo}-` })
    root.render(createElement(LiveDemo, { id: element.dataset.liveDemo }))
    roots.push(root)
  }
  const configurator = document.querySelector('[data-configurator]')
  if (configurator) {
    const root = createRoot(configurator, { identifierPrefix: 'cfg-' })
    root.render(createElement(Configurator))
    roots.push(root)
  }

  // Componentes: ver las vistas previas con el tema creado en Personalizar.
  const previewSwitch = document.querySelector('[data-preview-theme-switch]')
  let observer
  if (previewSwitch) {
    const root = document.documentElement
    const buttons = [...previewSwitch.querySelectorAll('[data-preview-theme]')]
    const missing = document.querySelector('[data-preview-theme-missing]')
    let custom = new URLSearchParams(location.search).get('vista') === 'mi-tema'
    const apply = () => {
      const saved = custom ? savedThemeVariables(root.classList.contains('dark') ? 'dark' : 'light') : null
      if (custom && !saved) custom = false
      if (saved) loadFonts([saved.font])
      missing.hidden = !(!saved && buttons.some((b) => b.dataset.previewTheme === 'custom' && b.dataset.clicked))
      for (const preview of document.querySelectorAll('.demo-preview')) {
        preview.removeAttribute('style')
        preview.removeAttribute('data-k5-theme')
        if (saved) {
          for (const [name, value] of Object.entries(saved.vars)) preview.style.setProperty(name, value)
          preview.dataset.k5Theme = saved.base
        }
      }
      buttons.forEach((button) =>
        button.setAttribute('aria-pressed', String((button.dataset.previewTheme === 'custom') === Boolean(saved))),
      )
      previewSwitch.querySelector('[data-preview-theme-code]').textContent = saved ? saved.code : ''
    }
    previewSwitch.addEventListener('click', (event) => {
      const button = event.target.closest('[data-preview-theme]')
      if (!button) return
      button.dataset.clicked = 'true'
      custom = button.dataset.previewTheme === 'custom'
      apply()
    })
    observer = new MutationObserver(apply)
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-k5-theme'] })
    apply()
  }
  return () => {
    observer?.disconnect()
    roots.forEach((root) => root.unmount())
  }
}
