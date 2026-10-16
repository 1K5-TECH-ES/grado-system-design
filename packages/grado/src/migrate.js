// Codemod de Grado: lo que se puede cambiar sin decidir nada se cambia; lo que pide una decisión
// se avisa con archivo y línea. Sin dependencias. Lo usa bin/grado.mjs («npx @1k5-tech-es/grado migrate»).

const PACKAGE = /^@1k5(?:-tech-es)?\/(grado(?:-react|-vue)?)$/
const SCOPE = /@1k5\/(grado(?:-react|-vue)?)(?![\w-])/g
// Alias de tamaño de 0.3: mismo valor que el paso nuevo de la escala.
const SIZE_ALIASES = { badge: 'caption', label: 'caption', nav: 'small', section: 'heading' }
const SIZE = /--k5-text-(badge|label|nav|section)(?![\w-])/g
// k5-unit ya no existe: se quita de las listas de clases, con el espacio que la separa.
const UNIT = [/ +k5-unit(?![\w-])/g, /(?<![\w.-])k5-unit +/g, /(?<![\w.-])k5-unit(?![\w-])/g]
const DANGER = /variant\s*[=:]\s*\{?\s*["'`]danger["'`]/g
const HIGHLIGHT = /tone\s*[=:]\s*\{?\s*["'`]highlight["'`]/g
// text-2xs del preset de Tailwind: se retira en 1.0. Solo se avisa, el nombre puede ser de la app.
const TEXT_2XS = /(?<![\w-])text-2xs(?![\w-])/g
// GradoProvider o el plugin en alemán o inglés: desde 1.0 hay que pasar sus textos en messages.
const LOCALE = /locale\s*[=:]\s*\{?\s*["'`]?\s*["'`](de|en)(?:-[A-Z]{2})?["'`]/g

export const RULES = {
  scope: '@1k5/… → @1k5-tech-es/…',
  size: '--k5-text-badge|label|nav|section → caption, small, heading',
  unit: 'k5-unit retirado',
  dependencies: 'dependencias de Grado',
}

export const WARNINGS = {
  danger:
    'variant="danger" es texto rojo sin fondo desde 0.3. Si es el botón que confirma un borrado (en un AlertDialog), usa variant="destructive".',
  highlight: 'Badge tone="highlight" es un punto fucsia sobre un tinte suave desde 0.3. Revisa que siga destacando lo que toca.',
  unitCss: 'Tu CSS usa .k5-unit, que Grado ya no define. Quita la regla si solo servía para las columnas numéricas (usa k5-num).',
  density:
    'Ningún archivo pone data-k5-density. Desde 0.3, con pantalla táctil los controles miden 44 px. Para mantener la altura del tema, pon data-k5-density="default" en <html>.',
  vendor: 'La dependencia apuntaba a un .tgz. Ya puedes borrar ese archivo: el paquete viene ahora de GitHub Packages.',
  npmrc: 'Falta el registro de GitHub Packages. Añadido a .npmrc; exporta GITHUB_TOKEN con un token classic con read:packages.',
  text2xs: 'text-2xs (Tailwind) se retira en 1.0: usa text-caption, que mide lo mismo. Si text-2xs es tuyo y no de Grado, ignora el aviso.',
  messagesDe:
    "Grado 1.0 solo traerá los textos en español. Importa los alemanes y pásalos: import de from '@1k5-tech-es/grado/messages/de' y messages={de} (Vue: messages: de).",
  messagesEn:
    "Grado 1.0 solo traerá los textos en español. Importa los ingleses y pásalos: import en from '@1k5-tech-es/grado/messages/en' y messages={en} (Vue: messages: en).",
}

/** «0.1», «0.2»… de una versión o rango de npm («^0.1.0», «file:vendor/1k5-grado-0.2.0.tgz»). */
export function minorOf(spec) {
  const match = /(\d+)\.(\d+)\.\d+/.exec(String(spec ?? ''))
  return match ? `${match[1]}.${match[2]}` : null
}

/** a < b para versiones «0.1», «0.10»… */
export const olderThan = (a, b) => {
  const [x1, y1] = a.split('.').map(Number),
    [x2, y2] = b.split('.').map(Number)
  return x1 < x2 || (x1 === x2 && y1 < y2)
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length

function count(text, pattern) {
  pattern.lastIndex = 0
  return (text.match(pattern) ?? []).length
}

/**
 * Cambia un archivo de código o de estilos. from es la versión de la que se viene («0.1»).
 * Devuelve el texto nuevo, cuántos cambios hizo cada regla y los avisos con su línea.
 */
export function migrateSource(text, { path = '', from = '0.1' } = {}) {
  const changes = {}
  const warnings = []
  const css = /\.(css|scss|sass|less)$/.test(path)
  let next = text

  const scope = count(next, SCOPE)
  if (scope) {
    next = next.replace(SCOPE, '@1k5-tech-es/$1')
    changes.scope = scope
  }
  const size = count(next, SIZE)
  if (size) {
    next = next.replace(SIZE, (_, alias) => `--k5-text-${SIZE_ALIASES[alias]}`)
    changes.size = size
  }
  if (olderThan(from, '0.3')) {
    if (css) {
      for (const match of next.matchAll(/\.k5-unit(?![\w-])/g)) warnings.push({ rule: 'unitCss', line: lineOf(next, match.index) })
    } else {
      let unit = 0
      for (const pattern of UNIT) {
        unit += count(next, pattern)
        next = next.replace(pattern, '')
      }
      if (unit) changes.unit = unit
    }
    for (const [rule, pattern] of [
      ['danger', DANGER],
      ['highlight', HIGHLIGHT],
    ]) {
      pattern.lastIndex = 0
      for (const match of next.matchAll(pattern)) warnings.push({ rule, line: lineOf(next, match.index) })
    }
  }
  // Avisos que valen desde cualquier versión: lo que se retira en 1.0 y no se cambia solo.
  TEXT_2XS.lastIndex = 0
  for (const match of next.matchAll(TEXT_2XS)) warnings.push({ rule: 'text2xs', line: lineOf(next, match.index) })
  // Solo si en esa línea no se pasan ya los textos.
  LOCALE.lastIndex = 0
  for (const match of next.matchAll(LOCALE)) {
    const line = lineOf(next, match.index)
    if (!/messages/.test(next.split('\n')[line - 1])) warnings.push({ rule: match[1] === 'de' ? 'messagesDe' : 'messagesEn', line })
  }
  return { text: next, changes, warnings }
}

const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

/**
 * package.json: los paquetes de Grado pasan a @1k5-tech-es/… y a ^version, en el mismo orden.
 * from es la versión más antigua de Grado que aparecía, o null si no había ninguna.
 */
export function migratePackageJson(text, version) {
  const data = JSON.parse(text)
  const indent = /\n([ \t]+)"/.exec(text)?.[1] ?? '  '
  const warnings = []
  let changed = 0
  let from = null
  for (const field of DEPENDENCY_FIELDS) {
    const deps = data[field]
    if (!deps || typeof deps !== 'object') continue
    const rebuilt = {}
    for (const [name, spec] of Object.entries(deps)) {
      const match = PACKAGE.exec(name)
      if (!match) {
        rebuilt[name] = spec
        continue
      }
      const minor = minorOf(spec)
      if (minor && (!from || olderThan(minor, from))) from = minor
      const target = `@1k5-tech-es/${match[1]}`
      // En peerDependencies se deja el rango que hubiera, solo con el nombre nuevo.
      const wanted = field === 'peerDependencies' ? spec : `^${version}`
      if (/^(file:|link:)|\.tgz$/.test(String(spec))) warnings.push({ rule: 'vendor', line: lineOf(text, text.indexOf(`"${name}"`)) })
      if (target !== name || wanted !== spec) changed++
      rebuilt[target] = wanted
    }
    data[field] = rebuilt
  }
  const output = changed ? `${JSON.stringify(data, null, indent)}\n` : text
  return { text: output, changes: changed ? { dependencies: changed } : {}, warnings, from }
}

/** .npmrc con el registro de @1k5-tech-es. null si ya lo tiene. */
export function npmrcWithRegistry(text = '') {
  if (/^@1k5-tech-es:registry=/m.test(text)) return null
  const lines = ['@1k5-tech-es:registry=https://npm.pkg.github.com']
  if (!/^\/\/npm\.pkg\.github\.com\/:_authToken=/m.test(text)) lines.push('//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}')
  return `${text}${text && !text.endsWith('\n') ? '\n' : ''}${lines.join('\n')}\n`
}
