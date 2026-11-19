import { defineComponent, h, type Component, type PropType } from 'vue'
import { buttonClass, keyShortcuts, type ButtonVariant, type Size } from '@1k5-tech-es/grado/classes'
import { Spinner } from './Spinner.js'

/** Para enlaces o RouterLink, usa buttonClass() de @1k5-tech-es/grado/classes. */
export const Button = defineComponent({
  name: 'K5Button',
  props: {
    variant: String as PropType<ButtonVariant>,
    size: String as PropType<Size>,
    /** Icono delante del texto. */
    icon: [Object, Function] as PropType<Component>,
    /** Botón cuadrado solo con icono. Ponle aria-label. */
    iconOnly: Boolean,
    /** Ocupa todo el ancho. */
    block: Boolean,
    /** Muestra un spinner y desactiva el botón. */
    loading: Boolean,
    /**
     * Atajo de teclado que activa la acción: ['C'], ['⌘', '↵']. Se pinta dentro del botón (no en los de
     * solo icono: ahí va en el Tooltip) y se anuncia con aria-keyshortcuts. La app escucha la tecla.
     */
    shortcut: Array as PropType<string[]>,
    disabled: Boolean,
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'button',
        {
          type: props.type,
          class: buttonClass({ variant: props.variant, size: props.size, iconOnly: props.iconOnly, block: props.block }),
          disabled: props.disabled || props.loading,
          'aria-busy': props.loading ? 'true' : undefined,
          'aria-keyshortcuts': props.shortcut?.length ? keyShortcuts(props.shortcut) : undefined,
        },
        [
          props.loading ? h(Spinner, { size: 'sm', decorative: true }) : props.icon ? h(props.icon, { 'aria-hidden': 'true' }) : null,
          slots.default?.(),
          props.shortcut?.length && !props.iconOnly ? shortcutKeys(props.shortcut, 'k5-btn__shortcut') : null,
        ],
      )
  },
})

/** Teclas de un atajo pintadas junto a un texto. Ocultas a lectores de pantalla: el control lleva aria-keyshortcuts. */
export function shortcutKeys(keys: string[], className: string) {
  return h(
    'span',
    { class: className, 'aria-hidden': 'true' },
    keys.map((key) => h('kbd', key)),
  )
}
