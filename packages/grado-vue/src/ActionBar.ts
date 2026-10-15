import { defineComponent, h } from 'vue'
import { actionBarClass, ICON_PATHS } from '@1k5/grado/classes'
import { moveFocus, selectedCount } from '@1k5/grado/patterns'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

const ITEMS = 'button, a[href]'

/**
 * Barra flotante de acciones en lote mientras hay filas elegidas en una tabla.
 * Slot por defecto: los botones de las acciones.
 */
export const ActionBar = defineComponent({
  name: 'K5ActionBar',
  props: {
    /** Filas elegidas. Con 0 la barra no se pinta. */
    count: { type: Number, required: true },
    /** Texto de la selección. Por defecto «3 seleccionadas», en el idioma activo. */
    label: String,
    /** Muestra «Quitar selección», que emite clear; Escape dentro de la barra también. */
    clearable: Boolean,
    clearLabel: String,
    /** En su sitio en vez de flotar abajo: para documentación y ejemplos. */
    inline: Boolean,
  },
  emits: ['clear'],
  setup(props, { emit, slots }) {
    const t = useGrado()
    // Al quitar la selección la barra desaparece: el foco vuelve a donde estaba antes de entrar.
    let before: HTMLElement | null = null
    const clear = () => {
      const back = before
      emit('clear')
      if (back?.isConnected) back.focus()
    }
    return () => {
      if (!props.count) return null
      const text = props.label ?? selectedCount(props.count, t.value.messages)
      return h(
        'div',
        {
          role: 'toolbar',
          'aria-label': text,
          class: actionBarClass({ inline: props.inline }),
          onFocusin: (event: FocusEvent) => {
            const from = event.relatedTarget as HTMLElement | null
            if (!(event.currentTarget as HTMLElement).contains(from)) before = from
          },
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'Escape' && props.clearable) {
              event.preventDefault()
              clear()
            } else if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
              moveFocus(event, event.currentTarget as HTMLElement, ITEMS, true)
          },
        },
        [
          h('span', { class: 'k5-action-bar__count' }, text),
          h('div', { class: 'k5-action-bar__actions' }, slots.default?.()),
          props.clearable
            ? h('button', { type: 'button', class: 'k5-btn k5-btn--ghost k5-btn--sm k5-action-bar__clear', onClick: clear }, [
                pathIcon(ICON_PATHS.x),
                props.clearLabel ?? t.value.messages.clearSelection,
              ])
            : null,
        ],
      )
    }
  },
})
