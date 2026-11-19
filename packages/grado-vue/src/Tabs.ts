import { defineComponent, h, type PropType, type VNodeChild } from 'vue'
import { cx } from '@1k5-tech-es/grado/classes'
import { moveFocus } from '@1k5-tech-es/grado/patterns'
import { autoId, model } from './helpers.js'

export interface TabItem {
  value: string
  label: string
  content?: VNodeChild
  disabled?: boolean
}
export const Tabs = defineComponent({
  name: 'K5Tabs',
  props: {
    items: { type: Array as PropType<TabItem[]>, required: true },
    label: { type: String, required: true },
    modelValue: String,
    defaultValue: String,
    /** line: subrayado. pill: sobre un fondo gris. view: pastillas pequeñas con borde, para cambiar de vista una lista. */
    variant: { type: String as PropType<'line' | 'pill' | 'view'>, default: 'line' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const [selected, select] = model(
        () => props.modelValue,
        props.defaultValue ?? props.items.find((item) => !item.disabled)?.value ?? '',
        (value) => emit('update:modelValue', value),
      ),
      id = autoId('k5-tabs')
    return () => {
      const current = props.items.some((item) => item.value === selected.value && !item.disabled)
        ? selected.value
        : props.items.find((item) => !item.disabled)?.value
      return h('div', { class: cx('k5-tabs', ['pill', 'view'].includes(props.variant) && `k5-tabs--${props.variant}`) }, [
        h(
          'div',
          {
            class: 'k5-tabs__list',
            role: 'tablist',
            'aria-label': props.label,
            onKeydown: (event: KeyboardEvent) => moveFocus(event, event.currentTarget as HTMLElement, '[role="tab"]', true),
          },
          props.items.map((item, i) =>
            h(
              'button',
              {
                type: 'button',
                key: item.value,
                id: `${id}-tab-${i}`,
                role: 'tab',
                class: 'k5-tabs__tab',
                tabindex: item.value === current ? 0 : -1,
                disabled: item.disabled,
                'aria-selected': item.value === current,
                'aria-controls': `${id}-panel-${i}`,
                onClick: () => select(item.value),
                onFocus: () => select(item.value),
              },
              item.label,
            ),
          ),
        ),
        ...props.items.map((item, i) =>
          h(
            'div',
            {
              key: item.value,
              role: 'tabpanel',
              class: 'k5-tabs__panel',
              id: `${id}-panel-${i}`,
              'aria-labelledby': `${id}-tab-${i}`,
              tabindex: 0,
              hidden: item.value !== current,
            },
            [slots[item.value]?.() ?? item.content],
          ),
        ),
      ])
    }
  },
})
