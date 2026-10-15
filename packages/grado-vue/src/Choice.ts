import { defineComponent, h, mergeProps, onMounted, ref, watch, type PropType } from 'vue'
import { cx } from '@1k5-tech-es/grado/classes'
import { type ChoiceOption } from '@1k5-tech-es/grado/patterns'
import { useField } from './Field.js'
import { autoId, booleanOptional, model } from './helpers.js'

export const Checkbox = defineComponent({
  name: 'K5Checkbox',
  inheritAttrs: false,
  props: {
    modelValue: booleanOptional,
    defaultChecked: Boolean,
    label: String,
    description: String,
    indeterminate: Boolean,
    id: String,
    required: booleanOptional,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, expose }) {
    const field = useField(),
      auto = autoId('k5-checkbox'),
      input = ref<HTMLInputElement>()
    const [checked, change] = model(
      () => props.modelValue,
      props.defaultChecked,
      (value) => emit('update:modelValue', value),
    )
    onMounted(() =>
      watch(
        () => props.indeterminate,
        (value) => {
          if (input.value) input.value.indeterminate = value
        },
        { immediate: true, flush: 'post' },
      ),
    )
    expose({ focus: () => input.value?.focus(), input })
    return () => {
      const id = props.id ?? field?.value.id ?? auto
      const control = h(
        'input',
        mergeProps(attrs, {
          ref: input,
          type: 'checkbox',
          id,
          checked: checked.value,
          class: 'k5-checkbox',
          'aria-checked': props.indeterminate ? 'mixed' : undefined,
          'aria-invalid': attrs['aria-invalid'] ?? (field?.value.invalid || undefined),
          'aria-describedby':
            cx(attrs['aria-describedby'], field?.value.describedBy, props.description && `${id}-description`) || undefined,
          required: props.required ?? field?.value.required,
          onChange: (event: Event) => change((event.target as HTMLInputElement).checked),
        }),
      )
      return props.label
        ? h('label', { class: 'k5-checkbox-field', for: id }, [
            control,
            h('span', { class: 'k5-choice__text' }, [
              h('span', null, props.label),
              props.description ? h('span', { id: `${id}-description`, class: 'k5-choice__description' }, props.description) : null,
            ]),
          ])
        : control
    }
  },
})
export const RadioGroup = defineComponent({
  name: 'K5RadioGroup',
  props: {
    label: { type: String, required: true },
    options: { type: Array as PropType<ChoiceOption[]>, required: true },
    modelValue: String,
    defaultValue: { type: String, default: '' },
    name: String,
    required: Boolean,
    disabled: Boolean,
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'vertical' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const [selected, select] = model(
        () => props.modelValue,
        props.defaultValue,
        (value) => emit('update:modelValue', value),
      ),
      id = autoId('k5-radio')
    return () =>
      h(
        'fieldset',
        { class: cx('k5-radio-group', props.orientation === 'horizontal' && 'k5-radio-group--horizontal'), disabled: props.disabled },
        [
          h('legend', null, props.label),
          h(
            'div',
            { class: 'k5-radio-group__options' },
            props.options.map((option, index) =>
              h('label', { class: 'k5-radio-option', key: option.value }, [
                h('input', {
                  type: 'radio',
                  class: 'k5-radio',
                  name: props.name ?? id,
                  value: option.value,
                  checked: selected.value === option.value,
                  disabled: option.disabled,
                  required: props.required,
                  'aria-describedby': option.description ? `${id}-${index}-description` : undefined,
                  onChange: () => select(option.value),
                }),
                h('span', { class: 'k5-choice__text' }, [
                  h('span', null, option.label),
                  option.description
                    ? h('span', { id: `${id}-${index}-description`, class: 'k5-choice__description' }, option.description)
                    : null,
                ]),
              ]),
            ),
          ),
        ],
      )
  },
})
