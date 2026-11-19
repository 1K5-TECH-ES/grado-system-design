import { h } from 'vue'

/** Teclas de un atajo pintadas junto a un texto. Ocultas a lectores de pantalla: el control lleva aria-keyshortcuts. */
export function shortcutKeys(keys: string[], className: string) {
  return h(
    'span',
    { class: className, 'aria-hidden': 'true' },
    keys.map((key) => h('kbd', key)),
  )
}
