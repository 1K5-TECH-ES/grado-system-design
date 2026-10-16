// Piezas comunes de los Web Components: crear nodos, iconos, ids y textos. Sin dependencias
// fuera de @1k5-tech-es/grado.
import { ICON_ATTRS } from '@1k5-tech-es/grado/classes'
import { messagesFor } from '@1k5-tech-es/grado/messages'

const SVG = 'http://www.w3.org/2000/svg'

/** Un elemento con atributos (los null o false no se ponen) e hijos (texto o nodos). */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag)
  setAttrs(node, attrs)
  for (const child of [].concat(children)) if (child != null && child !== false) node.append(child)
  return node
}

/** Pone o quita atributos: null, undefined y false lo quitan; true lo deja vacío. */
export function setAttrs(node, attrs) {
  for (const [name, value] of Object.entries(attrs)) {
    if (value == null || value === false) node.removeAttribute(name)
    else node.setAttribute(name, value === true ? '' : String(value))
  }
  return node
}

/** Icono de trazos, como PathIcon de React y Vue. */
export function icon(paths, className) {
  const svg = document.createElementNS(SVG, 'svg')
  // Mismo trazo que PathIcon de React y pathIcon de Vue.
  for (const [name, value] of Object.entries({ ...ICON_ATTRS, 'stroke-width': '2' })) svg.setAttribute(name, String(value))
  if (className) svg.setAttribute('class', className)
  for (const d of paths) {
    const path = document.createElementNS(SVG, 'path')
    path.setAttribute('d', d)
    svg.append(path)
  }
  return svg
}

let counter = 0
/** id único con prefijo: k5-combobox-e1. */
export const uid = (prefix) => `${prefix}-e${++counter}`

/** Textos en el idioma de <html lang> (o el de un ancestro con lang); español si no hay. */
export function texts(node) {
  const lang = node.closest('[lang]')?.getAttribute('lang') || 'es-ES'
  return messagesFor(lang.includes('-') ? lang : `${lang}-${lang.toUpperCase()}`)
}

/** Define el elemento si no lo está ya (dos copias del paquete en la página no chocan). */
export function define(name, constructor) {
  if (!customElements.get(name)) customElements.define(name, constructor)
}

/** Evento change que burbujea, como el de un campo nativo. */
export const changed = (node) => node.dispatchEvent(new Event('change', { bubbles: true }))
