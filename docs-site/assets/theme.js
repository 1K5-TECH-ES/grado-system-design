// Apply a saved preference before the first paint. Storage can be disabled.
// La web abre en Consola desde 0.9, donde se ve el rediseño «Precisión». La clave del tema es
// nueva para que quien guardó Marca cuando era el tema por defecto también vea Consola.
;(() => {
  let mode = 'light'
  let theme = 'consola'
  try {
    mode = localStorage.getItem('grado-docs-mode') || 'light'
    theme = localStorage.getItem('grado-docs-tema-0.9') || 'consola'
  } catch {
    /* sin almacenamiento local: se sigue sin recordar */
  }
  const params = new URLSearchParams(location.search)
  mode = params.get('modo') || mode
  theme = params.get('tema') || theme
  document.documentElement.classList.toggle('dark', mode === 'dark')
  document.documentElement.dataset.k5Theme = ['marca', 'campo'].includes(theme) ? theme : 'consola'
})()
