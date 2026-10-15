import { defineComponent, h, type PropType, type VNode } from 'vue'
import { ICON_PATHS, tagClass, type SmallSize } from '@1k5/grado/classes'
import { formatMessage } from '@1k5/grado/messages'
import { tagFocusTarget } from '@1k5/grado/patterns'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

/** Texto plano de un slot sencillo, para nombrar el botón de quitar. */
const textOf = (nodes: VNode[] | undefined): string =>
  (nodes ?? []).map((node) => (typeof node.children === 'string' ? node.children : '')).join('')

/** Etiqueta que se puede quitar, como una provincia de una zona de trabajo. */
export const Tag = defineComponent({
  name: 'K5Tag',
  props: {
    /** Texto de la etiqueta. También da nombre al botón de quitar. */
    label: String,
    /** Muestra el botón de quitar (evento remove). */
    removable: Boolean,
    /** Nombre del botón de quitar. Por defecto, «Quitar {label}». */
    removeLabel: String,
    size: String as PropType<SmallSize>,
    disabled: Boolean,
  },
  emits: ['remove'],
  setup(props, { emit, slots }) {
    const t = useGrado()
    const remove = (event: MouseEvent) => {
      // El botón va a desaparecer: el foco pasa a la etiqueta vecina antes de quitarla.
      tagFocusTarget(event.currentTarget as HTMLElement)?.focus()
      emit('remove')
    }
    return () => {
      const content = slots.default?.()
      const text = props.label ?? textOf(content)
      return h('span', { class: tagClass({ size: props.size, disabled: props.disabled }) }, [
        h('span', { class: 'k5-tag__label' }, content ?? props.label),
        props.removable
          ? h(
              'button',
              {
                type: 'button',
                class: 'k5-tag__remove',
                'aria-label': props.removeLabel ?? formatMessage(t.value.messages.removeItem, { label: text }),
                disabled: props.disabled,
                onClick: remove,
              },
              [pathIcon(ICON_PATHS.x)],
            )
          : null,
      ])
    }
  },
})
