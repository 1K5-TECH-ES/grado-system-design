import { cloneVNode, defineComponent, h, ref, type PropType } from 'vue'
import { ICON_PATHS, keyShortcuts } from '@1k5-tech-es/grado/classes'
import { Button } from './Button.js'
import { shortcutKeys } from './ShortcutKeys.js'
import { pathIcon } from './PathIcon.js'
import { autoId } from './helpers.js'

export const Tooltip = defineComponent({
  name: 'K5Tooltip',
  props: {
    label: String,
    content: String,
    /** Atajo del control: ['⌘', 'L']. Se pinta tras el texto y, con el slot trigger, el control recibe aria-keyshortcuts. */
    shortcut: Array as PropType<string[]>,
  },
  setup(props, { slots }) {
    const open = ref(false),
      id = autoId('k5-tooltip')
    return () =>
      h(
        'span',
        {
          class: 'k5-tooltip',
          onMouseenter: () => (open.value = true),
          onMouseleave: () => (open.value = false),
          onFocusin: () => (open.value = true),
          onFocusout: () => (open.value = false),
          onKeydown: (event: KeyboardEvent) => {
            // Escape quita el tooltip y nada más: sin preventDefault, el <dialog> que lo contiene también
            // se cerraría. Con el tooltip ya oculto, Escape sigue su camino y cierra lo que haya debajo.
            if (event.key === 'Escape' && open.value) {
              open.value = false
              event.preventDefault()
              event.stopPropagation()
            }
          },
        },
        [
          // Con el slot trigger acompaña a ese control; sin él, pinta el botón de información.
          slots.trigger
            ? slots.trigger().map((vnode) =>
                cloneVNode(vnode, {
                  ...(open.value ? { 'aria-describedby': id } : {}),
                  ...(props.shortcut?.length && !vnode.props?.['aria-keyshortcuts']
                    ? { 'aria-keyshortcuts': keyShortcuts(props.shortcut) }
                    : {}),
                }),
              )
            : h(
                Button,
                {
                  variant: 'ghost',
                  size: 'sm',
                  iconOnly: true,
                  'aria-label': props.label,
                  'aria-describedby': open.value ? id : undefined,
                  onClick: () => (open.value = !open.value),
                },
                { default: () => slots.default?.() ?? pathIcon(ICON_PATHS.info) },
              ),
          open.value
            ? h('span', { role: 'tooltip', id, class: 'k5-tooltip__content' }, [
                slots.content?.() ?? props.content,
                props.shortcut?.length ? shortcutKeys(props.shortcut, 'k5-tooltip__shortcut') : null,
              ])
            : null,
        ],
      )
  },
})
