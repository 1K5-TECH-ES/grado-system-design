import { defineComponent, h, ref } from 'vue'
import { ICON_PATHS } from '@1k5/grado/classes'
import { Button } from './Button.js'
import { pathIcon } from './PathIcon.js'
import { autoId } from './helpers.js'

export const Tooltip = defineComponent({
  name: 'K5Tooltip',
  props: { label: { type: String, required: true }, content: { type: String, required: true } },
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
          h(
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
          open.value ? h('span', { role: 'tooltip', id, class: 'k5-tooltip__content' }, props.content) : null,
        ],
      )
  },
})
