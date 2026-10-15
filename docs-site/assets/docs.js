// El marco es el AppShell de Grado generado como HTML estático: este script le da el
// comportamiento que en una app ponen los componentes (cajón, grupos, búsqueda).
let navScroll = 0

export function initDocs() {
  const controller = new AbortController()
  const listener = { signal: controller.signal }
  const root = document.documentElement
  const all = (selector, scope = document) => [...scope.querySelectorAll(selector)]
  const save = (key, value) => {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* sin almacenamiento local: se sigue sin recordar */
    }
  }
  const read = (key, fallback) => {
    try {
      return localStorage.getItem(key) || fallback
    } catch {
      return fallback
    }
  }
  const normalize = (value) => value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
  let noticeTimer
  function notify(message) {
    const notice = document.querySelector('#notice')
    notice.textContent = message
    notice.classList.add('visible')
    clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => notice.classList.remove('visible'), 3000)
  }

  // Tema y modo: el marco y los componentes siguen el mismo tema.
  function syncTheme() {
    const theme = root.dataset.k5Theme
    const mode = root.classList.contains('dark') ? 'dark' : 'light'
    all('[data-set-theme]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.setTheme === theme)))
    all('[data-set-mode]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.setMode === mode)))
    save('grado-docs-tema', theme)
    save('grado-docs-mode', mode)
  }
  function setFramework(framework) {
    if (!['react', 'vue'].includes(framework)) framework = 'react'
    all('[data-framework]').forEach((panel) => {
      panel.hidden = panel.dataset.framework !== framework
    })
    all('[data-set-framework]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.setFramework === framework)))
    save('grado-docs-framework', framework)
  }

  // Armazón: cajón en móvil y grupos plegables de la barra lateral.
  const app = document.querySelector('.docs-shell')
  const sidebar = document.getElementById('docs-navigation')
  const menu = app.querySelector('.k5-app__menu')
  const nav = sidebar.querySelector('.k5-app__nav')
  const isOpen = () => app.classList.contains('k5-app--nav-open')
  function setMenu(open, restoreFocus = false) {
    app.classList.toggle('k5-app--nav-open', open)
    menu.setAttribute('aria-expanded', String(open))
    if (open) requestAnimationFrame(() => sidebar.querySelector('a, button')?.focus())
    else if (restoreFocus) menu.focus()
  }
  function setGroup(button, open) {
    document.getElementById(button.getAttribute('aria-controls')).hidden = !open
    button.setAttribute('aria-expanded', String(open))
  }
  nav.scrollTop = navScroll
  nav.addEventListener(
    'scroll',
    () => {
      navScroll = nav.scrollTop
    },
    listener,
  )

  // Componentes: marca el enlace del ancla actual y abre su grupo.
  function activeAnchor() {
    all('[data-component-link]').forEach((link) => {
      const active = document.body.dataset.page === 'components' && new URL(link.href).hash === location.hash
      if (!active) {
        link.removeAttribute('aria-current')
        return
      }
      link.setAttribute('aria-current', 'location')
      setGroup(link.closest('.k5-nav-group').querySelector(':scope > .k5-nav-item'), true)
    })
  }
  window.addEventListener('hashchange', activeAnchor, listener)

  // Búsqueda: AppSearch abre un diálogo con páginas, guías y componentes.
  const dialog = document.getElementById('docs-search-dialog')
  const search = document.getElementById('docs-search')
  const options = all('[data-search-link]', dialog)
  const visible = () => options.filter((option) => !option.hidden)
  let active = -1
  function highlight(index) {
    const list = visible()
    options.forEach((option) => option.removeAttribute('data-active'))
    active = list.length ? (index + list.length) % list.length : -1
    const option = list[active]
    if (option) {
      option.dataset.active = 'true'
      option.scrollIntoView({ block: 'nearest' })
      search.setAttribute('aria-activedescendant', option.id)
    } else search.removeAttribute('aria-activedescendant')
  }
  function filter() {
    const query = normalize(search.value)
    options.forEach((option) => {
      option.hidden = !normalize(option.dataset.searchLink).includes(query)
    })
    all('[data-search-group]', dialog).forEach((group) => {
      group.hidden = !group.querySelector('[data-search-link]:not([hidden])')
    })
    dialog.querySelector('.docs-search__empty').hidden = visible().length > 0
    highlight(0)
  }
  function openSearch() {
    if (dialog.open) return
    if (isOpen()) setMenu(false)
    search.value = ''
    filter()
    dialog.showModal()
    search.focus()
  }
  search.addEventListener('input', filter, listener)
  search.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        highlight(active + (event.key === 'ArrowDown' ? 1 : -1))
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        visible()[active]?.click()
      }
    },
    listener,
  )
  // Un clic en el fondo llega al propio <dialog>.
  dialog.addEventListener(
    'click',
    (event) => {
      if (event.target === dialog || event.target.closest('[data-search-link]')) dialog.close()
    },
    listener,
  )
  dialog.addEventListener(
    'pointermove',
    (event) => {
      const option = event.target.closest('[data-search-link]')
      if (option && option.dataset.active !== 'true') highlight(visible().indexOf(option))
    },
    listener,
  )

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && isOpen()) setMenu(false, true)
      const typing = event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable]')
      const slash = event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey
      if (slash || (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey))) {
        event.preventDefault()
        openSearch()
      }
    },
    listener,
  )

  async function copy(button) {
    const text = button.closest('.code-block').querySelector('code').textContent
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(text)
    } catch {
      const input = document.createElement('textarea')
      input.value = text
      input.style.cssText = 'position:fixed;left:-9999px;top:0'
      document.body.append(input)
      input.select()
      const success = document.execCommand('copy')
      input.remove()
      button.focus()
      if (!success) {
        notify('Selecciona el código y cópialo con el teclado.')
        return
      }
    }
    button.textContent = 'Copiado ✓'
    notify('Código copiado')
    setTimeout(() => {
      button.innerHTML = 'Copiar <span aria-hidden="true">⧉</span>'
    }, 1800)
  }
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target instanceof Element ? event.target : event.target.parentElement
      if (target.closest('.k5-app__menu') === menu) setMenu(!isOpen())
      if (target.matches('.docs-shell > .k5-app__backdrop')) setMenu(false, true)
      if (target.closest('#docs-navigation a')) setMenu(false)
      if (target.closest('[data-search-open]')) openSearch()
      // Grupos de la barra lateral y de la vista previa estática de AppShell; las demos en vivo los gestionan solas.
      const group = target.closest('.k5-nav-group > .k5-nav-item')
      if (group && !group.closest('[data-live-demo]')) setGroup(group, group.getAttribute('aria-expanded') !== 'true')
      const copyButton = target.closest('[data-copy]')
      if (copyButton) void copy(copyButton)
      const frameworkButton = target.closest('[data-set-framework]')
      if (frameworkButton) setFramework(frameworkButton.dataset.setFramework)
      const themeButton = target.closest('[data-set-theme]')
      if (themeButton) {
        root.dataset.k5Theme = themeButton.dataset.setTheme
        syncTheme()
        if (themeButton.closest('.theme-card')) notify(`Tema ${themeButton.dataset.setTheme} activado`)
      }
      const modeButton = target.closest('[data-set-mode]')
      if (modeButton) {
        root.classList.toggle('dark', modeButton.dataset.setMode === 'dark')
        syncTheme()
      }
      const view = target.closest('[data-view]')
      if (view) {
        const example = view.closest('.example')
        const codeView = view.dataset.view === 'code'
        example.querySelector('[data-preview]').hidden = codeView
        example.querySelector('[data-code]').hidden = !codeView
        all('[data-view]', example).forEach((button) => button.setAttribute('aria-pressed', String(button === view)))
      }
      const style = target.closest('[data-style]')
      if (style) {
        all('[data-style-panel]').forEach((panel) => {
          panel.hidden = panel.dataset.stylePanel !== style.dataset.style
        })
        all('[data-style]').forEach((button) => button.setAttribute('aria-pressed', String(button === style)))
      }
      const preview = target.closest('.demo-preview')
      if (preview && !target.closest('[data-live-demo]') && target.closest('.k5-btn:not(:disabled)'))
        notify('Ejemplo de componente: conecta esta acción a tu aplicación.')
      const navigation = target.closest('.shell-preview a.k5-nav-item')
      if (navigation) {
        event.preventDefault()
        all('.shell-preview a.k5-nav-item').forEach((item) => item.removeAttribute('aria-current'))
        navigation.setAttribute('aria-current', 'page')
        notify(`Navegación de ejemplo: ${navigation.textContent.trim()}`)
      }
    },
    listener,
  )
  setFramework(read('grado-docs-framework', 'react'))
  syncTheme()
  activeAnchor()
  return () => {
    controller.abort()
    clearTimeout(noticeTimer)
    if (dialog.open) dialog.close()
  }
}
