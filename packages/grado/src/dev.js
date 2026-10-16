// Avisos para quien desarrolla con Grado: salen en la consola una sola vez y nunca en
// producción. Con un bundler, process.env.NODE_ENV se sustituye al compilar; sin bundler
// no existe process y no se avisa.

const seen = new Set()

/** true en desarrollo (bundler en modo dev, tests de Node); false en producción y sin bundler. */
export function isDev() {
  try {
    return process.env.NODE_ENV !== 'production'
  } catch {
    return false
  }
}

/** Escribe el aviso una vez por clave. */
export function warnOnce(key, message) {
  if (seen.has(key) || !isDev()) return
  seen.add(key)
  console.warn(`[Grado] ${message}`)
}
