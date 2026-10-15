import { defineComponent, h, type PropType, type VNodeChild } from 'vue'
import { ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { pathIcon } from './PathIcon.js'
import { autoId, model } from './helpers.js'

export interface AccordionItem {
  value: string
  title: string
  content?: VNodeChild
  disabled?: boolean
}
export const Accordion = defineComponent({
  name: 'K5Accordion',
  props: {
    items: { type: Array as PropType<AccordionItem[]>, required: true },
    modelValue: Array as PropType<string[]>,
    defaultValue: { type: Array as PropType<string[]>, default: () => [] },
    multiple: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const [selected, select] = model(
        () => props.modelValue,
        props.defaultValue,
        (value) => emit('update:modelValue', value),
      ),
      id = autoId('k5-accordion')
    return () =>
      h(
        'div',
        { class: 'k5-accordion' },
        props.items.map((item, index) => {
          const open = selected.value.includes(item.value)
          return h('div', { key: item.value, class: 'k5-accordion__item' }, [
            h('h3', { class: 'k5-accordion__heading' }, [
              h(
                'button',
                {
                  type: 'button',
                  class: 'k5-accordion__trigger',
                  id: `${id}-trigger-${index}`,
                  disabled: item.disabled,
                  'aria-expanded': open,
                  'aria-controls': `${id}-panel-${index}`,
                  onClick: () =>
                    select(
                      open
                        ? selected.value.filter((value: string) => value !== item.value)
                        : props.multiple
                          ? [...selected.value, item.value]
                          : [item.value],
                    ),
                },
                [item.title, pathIcon(ICON_PATHS.chevronDown, 'k5-accordion__icon')],
              ),
            ]),
            h(
              'div',
              {
                class: 'k5-accordion__panel',
                role: 'region',
                id: `${id}-panel-${index}`,
                'aria-labelledby': `${id}-trigger-${index}`,
                hidden: !open,
              },
              [slots[item.value]?.() ?? item.content],
            ),
          ])
        }),
      )
  },
})
