// Formateadores Intl reutilizables. Crear uno cuesta unas 30 veces más que usarlo, y los
// componentes formatean en cada render: los 42 días del calendario, cada punto de un gráfico,
// cada comparación al ordenar una tabla. Uso interno de patterns.js y classes.js.

function cached(Formatter) {
  const cache = new Map()
  return (locale, options) => {
    const key = `${locale}|${options ? JSON.stringify(options) : ''}`
    let formatter = cache.get(key)
    if (!formatter) {
      formatter = new Formatter(locale, options)
      cache.set(key, formatter)
    }
    return formatter
  }
}

export const numberFormat = cached(Intl.NumberFormat)
export const dateTimeFormat = cached(Intl.DateTimeFormat)
export const collator = cached(Intl.Collator)
