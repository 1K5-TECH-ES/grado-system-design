import { defineComponent, h, ref, type PropType } from 'vue'
import { dateSuggestions, rangeError, shortDateLabel, todayIso, type DateRangeValue } from '@1k5-tech-es/grado/patterns'
import { Combobox } from './Combobox.js'
import { Input } from './Field.js'
import { useGrado } from './Locale.js'
import { autoId, model } from './helpers.js'

export const DatePicker = defineComponent({
  name: 'K5DatePicker',
  inheritAttrs: false,
  props: {
    modelValue: String,
    /**
     * Se escribe la fecha («mañana», «viernes», «en 2 semanas», «20/11») y se elige de la lista, en el idioma
     * de GradoProvider. Es un Combobox: el valor sigue siendo YYYY-MM-DD y name lo envía igual.
     */
    natural: Boolean,
    /** Con natural, el día de hoy (YYYY-MM-DD) del que parten «mañana» o «en 2 semanas». Por defecto, el del navegador. */
    today: String,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const t = useGrado()
    const [current, select] = model(
      () => props.modelValue,
      '',
      (value: string) => emit('update:modelValue', value),
    )
    const query = ref('')
    return () => {
      if (!props.natural)
        return h(Input, {
          ...attrs,
          type: 'date',
          modelValue: props.modelValue,
          'onUpdate:modelValue': (value: string) => emit('update:modelValue', value),
        })
      const { locale, messages: m } = t.value
      const now = props.today ?? todayIso()
      const a = attrs as Record<string, unknown>
      const options = dateSuggestions(query.value, {
        today: now,
        locale,
        min: a.min as string | undefined,
        max: a.max as string | undefined,
      }).map((option) => ({ ...option, keywords: query.value }))
      // La fecha elegida sigue en la lista para que el campo la muestre aunque no salga entre las propuestas.
      if (current.value && !options.some((option) => option.value === current.value))
        options.push({ value: current.value, label: shortDateLabel(current.value, { today: now, locale }), keywords: '' })
      return h(Combobox, {
        options,
        modelValue: current.value,
        'onUpdate:modelValue': select,
        onQueryChange: (value: string) => (query.value = value),
        label: a['aria-label'] as string | undefined,
        placeholder: (a.placeholder as string | undefined) ?? m.datePlaceholder,
        emptyLabel: m.dateHint,
        name: a.name as string | undefined,
        disabled: a.disabled === '' || a.disabled === true,
        required: a.required === '' || a.required === true ? true : undefined,
        id: a.id as string | undefined,
        class: a.class,
      })
    }
  },
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
