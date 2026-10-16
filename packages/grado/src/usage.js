// Inventario de uso: qué componentes, props, funciones, clases y tokens de Grado usa una app.
// Sin dependencias. Lo usa bin/grado.mjs («npx @1k5-tech-es/grado usage»).

const IMPORT_NAMED = /import\s+(type\s+)?\{([^}]*)\}\s*from\s*["'](@1k5(?:-tech-es)?\/grado-(?:react|vue)(?:\/[\w-]+)?)["'];?/g
const IMPORT_NAMESPACE = /import\s+\*\s+as\s+([\w$]+)\s+from\s*["'](@1k5(?:-tech-es)?\/grado-(?:react|vue)(?:\/[\w-]+)?)["'];?/g
// Clases k5-… escritas a mano (también en PHP o en plantillas) y tokens --k5-….
const CLASS = /(?<![\w$-])k5-[a-z][a-z0-9_-]*/g
const TOKEN = /--k5-[a-z][a-z0-9-]*/g
const GRADO_PACKAGE = /^@1k5(?:-tech-es)?\/grado(?:-react|-vue)?$/
const TAILWIND_2XS = /(?<![\w-])text-2xs(?![\w-])/g

/** Lo que se retira en 1.0 y lo que lo sustituye. */
export const DEPRECATED = {
  '--k5-text-badge': '--k5-text-caption',
  '--k5-text-label': '--k5-text-caption',
  '--k5-text-nav': '--k5-text-small',
  '--k5-text-section': '--k5-text-heading',
  'text-2xs': 'text-caption',
}

const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const camel = (name) => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
const bump = (map, key, n = 1) => (map[key] = (map[key] ?? 0) + n)

/** Nombre exportado de cada nombre local importado de grado-react o grado-vue. */
export function gradoImports(text) {
  const named = {}
  const namespaces = []
  for (const [, typeOnly, list] of text.matchAll(IMPORT_NAMED)) {
    if (typeOnly) continue
    for (const part of list.split(',')) {
      const spec = part.trim().replace(/^type\s+/, '')
      if (!spec || part.trim().startsWith('type ')) continue
      const [exported, local = exported] = spec.split(/\s+as\s+/).map((s) => s.trim())
      named[local] = exported
    }
  }
  for (const [, local] of text.matchAll(IMPORT_NAMESPACE)) namespaces.push(local)
  return { named, namespaces }
}

/** Atributos de una etiqueta de apertura que empieza en text[start] («<Button …»). end apunta tras el «>». */
function readTag(text, start) {
  let i = start + 1
  while (i < text.length && /[\w$.:-]/.test(text[i])) i++
  const attrs = []
  while (i < text.length) {
    while (/\s/.test(text[i] ?? '')) i++
    const ch = text[i]
    if (ch === undefined || ch === '>') return { attrs, end: i + 1 }
    if (ch === '/' && text[i + 1] === '>') return { attrs, end: i + 2 }
    if (ch === '{') {
      // {...props} en JSX
      i = skipBalanced(text, i)
      continue
    }
    const nameStart = i
    while (i < text.length && !/[\s=/>]/.test(text[i])) i++
    const name = text.slice(nameStart, i)
    if (!name) {
      i++
      continue
    }
    while (/\s/.test(text[i] ?? '')) i++
    if (text[i] !== '=') {
      attrs.push({ name, value: true })
      continue
    }
    i++
    while (/\s/.test(text[i] ?? '')) i++
    const q = text[i]
    if (q === '"' || q === "'" || q === '`') {
      const close = text.indexOf(q, i + 1)
      const end = close < 0 ? text.length : close
      attrs.push({ name, value: text.slice(i + 1, end), quoted: true })
      i = end + 1
    } else if (q === '{') {
      const end = skipBalanced(text, i)
      attrs.push({ name, value: text.slice(i + 1, end - 1).trim(), expression: true })
      i = end
    } else {
      const valueStart = i
      while (i < text.length && !/[\s>]/.test(text[i])) i++
      attrs.push({ name, value: text.slice(valueStart, i), quoted: true })
    }
  }
  return { attrs, end: i }
}

/** Índice tras la llave que cierra la que hay en text[start], saltando cadenas. */
function skipBalanced(text, start) {
  let depth = 0
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"' || ch === "'" || ch === '`') {
      const close = text.indexOf(ch, i + 1)
      if (close < 0) return text.length
      i = close
    } else if (ch === '{') depth++
    else if (ch === '}' && --depth === 0) return i + 1
  }
  return text.length
}

/**
 * Prop normalizada y su valor literal, si lo tiene. Vue: :prop, v-bind:prop, @evento, v-model:prop
 * y nombres en kebab-case. React: prop="x" y prop={'x'}. null para lo que no es una prop (key, ref, slots…).
 */
export function propOf({ name, value, quoted, expression }) {
  if (/^(key|ref|class|className|style|v-if|v-else|v-else-if|v-for|v-show|v-slot|v-bind|v-on)$/.test(name)) return null
  if (name.startsWith('#') || name.startsWith('v-slot:')) return null
  let prop = name
  let literal = null
  if (name.startsWith('@') || name.startsWith('v-on:')) {
    prop = `@${camel(name.replace(/^(@|v-on:)/, '').split('.')[0])}`
  } else if (name === 'v-model') prop = 'v-model'
  else if (name.startsWith('v-model:')) prop = `v-model:${camel(name.slice(8))}`
  else if (name.startsWith(':') || name.startsWith('v-bind:')) {
    const bound = name.replace(/^(:|v-bind:)/, '')
    prop = /^(aria|data)-/.test(bound) ? bound : camel(bound)
    // :tone="'neutral'"
    const match = /^\s*(['"])([\w-]*)\1\s*$/.exec(String(value))
    if (match) literal = match[2]
  } else {
    prop = /^(aria|data)-/.test(name) ? name : camel(name)
    if (quoted) literal = String(value)
    else if (expression) {
      const match = /^(['"`])([\w-]*)\1$/.exec(String(value))
      if (match) literal = match[2]
      else if (/^(true|false|\d+(\.\d+)?)$/.test(String(value))) literal = String(value)
    } else if (value === true) literal = 'true'
  }
  if (literal !== null && (literal.length > 24 || /\s/.test(literal))) literal = null
  return { prop, literal }
}

/**
 * Inventario de un archivo. path decide si se buscan etiquetas (código) o solo clases y tokens (estilos).
 * Devuelve { components, functions, classes, tokens }, con usos y props por componente.
 */
export function usageOf(text, { path = '' } = {}) {
  const result = { components: {}, functions: {}, classes: {}, tokens: {}, deprecated: {} }
  const styles = /\.(css|scss|sass|less)$/.test(path)
  for (const [token] of text.matchAll(TOKEN)) {
    bump(result.tokens, token)
    if (DEPRECATED[token]) bump(result.deprecated, token)
  }
  // Clase de Tailwind del preset de Grado, también con @apply y con prefijos (md:text-2xs).
  for (const match of text.matchAll(TAILWIND_2XS)) bump(result.deprecated, match[0])
  if (!styles) {
    for (const [cls] of text.matchAll(CLASS)) bump(result.classes, cls)
  } else {
    for (const [, cls] of text.matchAll(/\.(k5-[a-z][a-z0-9_-]*)/g)) bump(result.classes, cls)
  }
  if (styles) return result

  const { named, namespaces } = gradoImports(text)
  const body = text.replace(IMPORT_NAMED, '').replace(IMPORT_NAMESPACE, '')
  const component = (name) => (result.components[name] ??= { uses: 0, props: {} })

  // Etiquetas: <Local …>, <ns.Name …> y, en plantillas de Vue, <local-kebab …>.
  const tags = []
  for (const [local, exported] of Object.entries(named)) {
    if (!/^[A-Z]/.test(exported)) continue
    tags.push([escapeRe(local), exported])
    // <button> es HTML: solo cuenta la forma kebab si lleva guion (<app-shell>).
    if (/\.vue$/.test(path) && kebab(local).includes('-')) tags.push([escapeRe(kebab(local)), exported])
  }
  for (const ns of namespaces) tags.push([`${escapeRe(ns)}\\.([A-Z][\\w$]*)`, null])
  for (const [pattern, exported] of tags) {
    const re = new RegExp(`<(${pattern})(?=[\\s/>])`, 'g')
    for (const match of body.matchAll(re)) {
      const name = exported ?? match[2]
      const entry = component(name)
      entry.uses++
      for (const attr of readTag(body, match.index).attrs) {
        const prop = propOf(attr)
        if (!prop) continue
        const stats = (entry.props[prop.prop] ??= { count: 0, values: {} })
        stats.count++
        if (prop.literal !== null) bump(stats.values, prop.literal)
      }
    }
  }

  // Referencias que no son etiquetas: toast(), toast.success(), cx(), :as="Button", h(Button)…
  for (const [local, exported] of Object.entries(named)) {
    const re = new RegExp(`(?<![\\w$.<-])${escapeRe(local)}(?![\\w$-])`, 'g')
    const refs = [...body.matchAll(re)].filter((m) => body[m.index - 1] !== '/' && body.slice(m.index - 2, m.index) !== '</').length
    if (/^[A-Z]/.test(exported)) {
      if (refs && !result.components[exported]) component(exported).uses += refs
    } else if (refs) bump(result.functions, exported, refs)
  }
  for (const ns of namespaces) {
    for (const [, name] of body.matchAll(new RegExp(`(?<!<)\\b${escapeRe(ns)}\\.([\\w$]+)`, 'g'))) {
      if (/^[A-Z]/.test(name)) {
        if (!result.components[name]) component(name).uses++
      } else bump(result.functions, name)
    }
  }
  return result
}

/** Junta el inventario de varios archivos. files cuenta en cuántos archivos aparece cada componente. */
export function mergeUsage(list) {
  const total = { components: {}, functions: {}, classes: {}, tokens: {}, deprecated: {} }
  for (const usage of list) {
    for (const [name, { uses, props }] of Object.entries(usage.components)) {
      const entry = (total.components[name] ??= { uses: 0, files: 0, props: {} })
      entry.uses += uses
      entry.files++
      for (const [prop, { count, values }] of Object.entries(props)) {
        const stats = (entry.props[prop] ??= { count: 0, values: {} })
        stats.count += count
        for (const [value, n] of Object.entries(values)) bump(stats.values, value, n)
      }
    }
    for (const key of ['functions', 'classes', 'tokens', 'deprecated'])
      for (const [name, n] of Object.entries(usage[key] ?? {})) bump(total[key], name, n)
  }
  return total
}

/** Paquetes de Grado de un package.json con su versión: { '@1k5/grado-vue': '0.1.0' }. */
export function gradoPackages(text) {
  const data = JSON.parse(text)
  const found = {}
  for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
    for (const [name, spec] of Object.entries(data[field] ?? {})) {
      if (!GRADO_PACKAGE.test(name)) continue
      found[name] = /(\d+\.\d+\.\d+(?:-[\w.]+)?)/.exec(String(spec))?.[1] ?? String(spec)
    }
  }
  return found
}

const byCount = (entries) => entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

/** { Button: 142, … } ordenado de más a menos usos. */
export function componentCounts(usage) {
  return Object.fromEntries(byCount(Object.entries(usage.components).map(([name, { uses }]) => [name, uses])))
}

/**
 * adoption.json con el inventario de una app: versión, componentes y fecha. El estado y el
 * detalle no se tocan; una app nueva entra como «migrando».
 */
export function withAdoption(adoption, { app, version, components, date }) {
  const apps = adoption.apps ?? []
  const index = apps.findIndex((entry) => entry.app.toLowerCase() === app.toLowerCase())
  const base = index >= 0 ? apps[index] : { app, estado: 'migrando', version: null, detalle: '' }
  const entry = { ...base, version: version ?? base.version, componentes: components, inventario: date }
  const next = index >= 0 ? apps.map((a, i) => (i === index ? entry : a)) : [...apps, entry]
  return { ...adoption, apps: next }
}

/** Las props más usadas de un componente, con su valor más frecuente: «variant: ghost 48 · primary 61». */
export function propSummary(props, limit = 3) {
  return byCount(Object.entries(props).map(([prop, { count }]) => [prop, count]))
    .slice(0, limit)
    .map(([prop, count]) => {
      const values = byCount(Object.entries(props[prop].values)).slice(0, 3)
      return values.length ? `${prop}: ${values.map(([v, n]) => `${v} ${n}`).join(' · ')}` : `${prop} ${count}`
    })
    .join('   ')
}
