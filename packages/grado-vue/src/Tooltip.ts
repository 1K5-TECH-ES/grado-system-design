import { cloneVNode, defineComponent, h, ref } from 'vue'
import { ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { Button } from './Button.js'
import { pathIcon } from './PathIcon.js'
import { autoId } from './helpers.js'

export const Tooltip = defineComponent({
  name: 'K5Tooltip',
  props: { label: String, content: String },
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
            if (event.key === 'Escape') {
              open.value = false
              event.stopPropagation()
            }
          },
        },
        [
          // Con el slot trigger acompaña a ese control; sin él, pinta el botón de información.
          slots.trigger
            ? slots.trigger().map((vnode) => cloneVNode(vnode, open.value ? { 'aria-describedby': id } : {}))
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
          open.value ? h('span', { role: 'tooltip', id, class: 'k5-tooltip__content' }, slots.content?.() ?? props.content) : null,
        ],
      )
  },
})
