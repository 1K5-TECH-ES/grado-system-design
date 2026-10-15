import { defineComponent, h, type PropType } from 'vue'
import { rangeError, type DateRangeValue } from '@1k5/grado/patterns'
import { Input } from './Field.js'
import { useGrado } from './Locale.js'
import { autoId, model } from './helpers.js'

export const DatePicker = defineComponent({
  name: 'K5DatePicker',
  inheritAttrs: false,
  props: { modelValue: String },
  emits: ['update:modelValue'],
  setup:
    (props, { attrs, emit }) =>
    () =>
      h(Input, {
        ...attrs,
        type: 'date',
        modelValue: props.modelValue,
        'onUpdate:modelValue': (value: string) => emit('update:modelValue', value),
      }),
})
export const DateRangePicker = defineComponent({
  name: 'K5DateRangePicker',
  props: {
    label: { type: String, required: true },
    modelValue: Object as PropType<DateRangeValue>,
    defaultValue: { type: Object as PropType<DateRangeValue>, default: () => ({ start: '', end: '' }) },
    min: String,
    max: String,
    required: Boolean,
    disabled: Boolean,
    name: String,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const [range, select] = model(
        () => props.modelValue,
        props.defaultValue,
        (value) => emit('update:modelValue', value),
      ),
      id = autoId('k5-range'),
      t = useGrado()
    return () => {
      const m = t.value.messages,
        error = rangeError(range.value.start, range.value.end, props.min, props.max, m)
      return h('fieldset', { class: 'k5-date-range', disabled: props.disabled }, [
        h('legend', null, props.label),
        h('div', { class: 'k5-date-range__fields' }, [
          h('label', null, [
            m.dateFrom,
            h(DatePicker, {
              name: props.name ? `${props.name}[start]` : undefined,
              modelValue: range.value.start,
              min: props.min,
              max: range.value.end && (!props.max || range.value.end < props.max) ? range.value.end : props.max,
              required: props.required,
              'aria-describedby': error ? `${id}-error` : undefined,
              'aria-invalid': !!error || undefined,
              'onUpdate:modelValue': (start: string) => select({ ...range.value, start }),
            }),
          ]),
          h('label', null, [
            m.dateTo,
            h(DatePicker, {
              name: props.name ? `${props.name}[end]` : undefined,
              modelValue: range.value.end,
              min: range.value.start && (!props.min || range.value.start > props.min) ? range.value.start : props.min,
              max: props.max,
              required: props.required,
              'aria-describedby': error ? `${id}-error` : undefined,
              'aria-invalid': !!error || undefined,
              'onUpdate:modelValue': (end: string) => select({ ...range.value, end }),
            }),
          ]),
        ]),
        error ? h('p', { role: 'alert', class: 'k5-field__error', id: `${id}-error` }, error) : null,
      ])
    }
  },
})
