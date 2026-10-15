import { defineComponent, h, mergeProps } from 'vue'

/** Checkbox nativo con role="switch". Usa v-model. Sin label, ponle aria-label. */
export const Switch = defineComponent({
  name: 'K5Switch',
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, default: undefined },
    /** También como slot por defecto. */
    label: String,
    description: String,
  },
  emits: { 'update:modelValue': (value: boolean) => typeof value === 'boolean' },
  setup(props, { attrs, emit, slots }) {
    return () => {
      const input = h(
        'input',
        mergeProps({ class: 'k5-switch' }, attrs, {
          type: 'checkbox',
          role: 'switch',
          ...(props.modelValue !== undefined ? { checked: props.modelValue } : {}),
          onChange: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).checked),
        }),
      )
      const label = slots.default?.() ?? props.label
      if (!label) return input
      return h('label', { class: 'k5-switch-field' }, [
        input,
        h('span', { class: 'k5-switch-field__text' }, [
          h('span', { class: 'k5-switch-field__label' }, label),
          props.description ? h('span', { class: 'k5-switch-field__description' }, props.description) : null,
        ]),
      ])
    }
  },
})
