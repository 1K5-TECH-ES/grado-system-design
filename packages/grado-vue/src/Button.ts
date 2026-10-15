import { defineComponent, h, type Component, type PropType } from 'vue'
import { buttonClass, type ButtonVariant, type Size } from '@1k5-tech-es/grado/classes'
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
        },
        [
          props.loading ? h(Spinner, { size: 'sm', decorative: true }) : props.icon ? h(props.icon, { 'aria-hidden': 'true' }) : null,
          slots.default?.(),
        ],
      )
  },
})
