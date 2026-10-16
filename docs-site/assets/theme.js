// Apply a saved preference before the first paint. Storage can be disabled.
// La web es una app de Grado: Marca por defecto. La clave del tema es nueva para
// que quien visitó la versión anterior (Consola guardado) también vea Marca.
;(() => {
  let mode = 'light'
  let theme = 'marca'
  try {
    mode = localStorage.getItem('grado-docs-mode') || 'light'
    theme = localStorage.getItem('grado-docs-tema') || 'marca'
  } catch {
    /* sin almacenamiento local: se sigue sin recordar */
  }
  const params = new URLSearchParams(location.search)
  mode = params.get('modo') || mode
  theme = params.get('tema') || theme
  document.documentElement.classList.toggle('dark', mode === 'dark')
  document.documentElement.dataset.k5Theme = ['consola', 'campo'].includes(theme) ? theme : 'marca'
})()
