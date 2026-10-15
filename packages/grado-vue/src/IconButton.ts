import { defineComponent, h, type Component, type PropType } from 'vue'
import { iconButtonClass, type IconButtonVariant, type Size } from '@1k5/grado/classes'
import { booleanOptional, model } from './helpers.js'

/** Botón de solo icono con nombre obligatorio. Con pressed (v-model:pressed), botón conmutador. */
export const IconButton = defineComponent({
  name: 'K5IconButton',
  props: {
    icon: { type: [Object, Function] as PropType<Component>, required: true },
    /** Nombre del botón: aria-label y title. Obligatorio, porque no hay texto visible. */
    label: { type: String, required: true },
    variant: { type: String as PropType<IconButtonVariant>, default: 'ghost' },
    size: String as PropType<Size>,
    /** Botón conmutador: aria-pressed y estado visual. Sin pressed ni defaultPressed es un botón normal. */
    pressed: booleanOptional,
    defaultPressed: booleanOptional,
    disabled: Boolean,
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, default: 'button' },
  },
  emits: ['update:pressed'],
  setup(props, { emit }) {
    const [on, setOn] = model(
      () => props.pressed,
      props.defaultPressed ?? false,
      (value) => emit('update:pressed', value),
    )
    return () => {
      const toggle = props.pressed !== undefined || props.defaultPressed !== undefined
      return h(
        'button',
        {
          type: props.type,
          class: iconButtonClass({ variant: props.variant, size: props.size }),
          'aria-label': props.label,
          title: props.label,
          'aria-pressed': toggle ? String(on.value) : undefined,
          disabled: props.disabled,
          onClick: (event: MouseEvent) => {
            if (toggle && !event.defaultPrevented) setOn(!on.value)
          },
        },
        [h(props.icon, { 'aria-hidden': 'true' })],
      )
    }
  },
})
