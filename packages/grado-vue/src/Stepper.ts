import { defineComponent, h, type PropType } from 'vue'
import { ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { type StepItem } from '@1k5-tech-es/grado/patterns'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

export const Stepper = defineComponent({
  name: 'K5Stepper',
  props: {
    items: { type: Array as PropType<StepItem[]>, required: true },
    modelValue: { type: String, required: true },
    label: String,
    interactive: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const t = useGrado()
    return () => {
      const current = props.items.findIndex((item) => item.id === props.modelValue)
      return h(
        'ol',
        { class: 'k5-stepper', 'aria-label': props.label ?? t.value.messages.progress },
        props.items.map((item, index) =>
          h(
            'li',
            {
              key: item.id,
              class: 'k5-stepper__item',
              'aria-current': index === current ? 'step' : undefined,
              'data-complete': index < current,
            },
            [
              h(
                props.interactive ? 'button' : 'div',
                {
                  ...(props.interactive
                    ? { type: 'button', disabled: item.disabled, onClick: () => emit('update:modelValue', item.id) }
                    : {}),
                  class: 'k5-stepper__control',
                },
                [
                  h(
                    'span',
                    { class: 'k5-stepper__number', 'aria-hidden': 'true' },
                    index < current ? pathIcon(ICON_PATHS.check) : index + 1,
                  ),
                  h('span', { class: 'k5-stepper__text' }, [
                    h('span', null, [
                      item.label,
                      index < current ? h('span', { class: 'k5-sr-only' }, `, ${t.value.messages.completed}`) : null,
                    ]),
                    item.description ? h('span', { class: 'k5-stepper__description' }, item.description) : null,
                  ]),
                ],
              ),
            ],
          ),
        ),
      )
    }
  },
})
