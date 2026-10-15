import { computed, defineComponent, h, ref, watch, type PropType } from 'vue'
import { ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { filterOptions, type ChoiceOption } from '@1k5-tech-es/grado/patterns'
import { Input, useField } from './Field.js'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { autoId, booleanOptional, model } from './helpers.js'

export const Combobox = defineComponent({
  name: 'K5Combobox',
  props: {
    options: { type: Array as PropType<ChoiceOption[]>, required: true },
    modelValue: String,
    defaultValue: { type: String, default: '' },
    label: String,
    placeholder: String,
    disabled: Boolean,
    required: booleanOptional,
    loading: Boolean,
    emptyLabel: String,
    name: String,
    id: String,
  },
  emits: ['update:modelValue', 'queryChange'],
  setup(props, { emit }) {
    const [selected, select] = model(
      () => props.modelValue,
      props.defaultValue,
      (value) => emit('update:modelValue', value),
    )
    const open = ref(false),
      query = ref(''),
      active = ref(-1),
      root = ref<HTMLElement>(),
      field = useField(),
      auto = autoId('k5-combobox'),
      t = useGrado()
    const placeholder = computed(() => props.placeholder ?? t.value.messages.searchPlaceholder)
    const id = computed(() => props.id ?? field?.value.id ?? auto),
      filtered = computed(() => filterOptions(props.options, query.value))
    const pick = (option: ChoiceOption) => {
      if (option.disabled) return
      select(option.value)
      query.value = ''
      open.value = false
      ;(root.value?.querySelector('input[role="combobox"]') as HTMLInputElement)?.focus()
    }
    watch(
      [active, open],
      () => {
        if (open.value && active.value >= 0)
          document.getElementById(`${id.value}-option-${active.value}`)?.scrollIntoView({ block: 'nearest' })
      },
      { flush: 'post' },
    )
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        open.value = false
        query.value = ''
        return
      }
      if (event.key === 'Enter' && open.value) {
        event.preventDefault()
        const option = filtered.value[active.value]
        if (!props.loading && option) pick(option)
        return
      }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        if (!open.value && ['Home', 'End'].includes(event.key)) return
        event.preventDefault()
        open.value = true
        const enabled = filtered.value.map((option, i) => (option.disabled ? -1 : i)).filter((i) => i >= 0),
          position = enabled.indexOf(active.value)
        active.value =
          event.key === 'Home'
            ? (enabled[0] ?? -1)
            : event.key === 'End'
              ? (enabled[enabled.length - 1] ?? -1)
              : (enabled[
                  position < 0
                    ? event.key === 'ArrowDown'
                      ? 0
                      : enabled.length - 1
                    : (position + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length
                ] ?? -1)
      }
    }
    return () =>
      h(
        'div',
        {
          ref: root,
          class: 'k5-combobox',
          onFocusout: (event: FocusEvent) => {
            if (!root.value?.contains(event.relatedTarget as Node)) {
              open.value = false
              query.value = ''
              active.value = -1
            }
          },
        },
        [
          props.name ? h('input', { type: 'hidden', name: props.name, value: selected.value, disabled: props.disabled }) : null,
          h(Input, {
            id: id.value,
            role: 'combobox',
            'aria-label': props.label,
            'aria-autocomplete': 'list',
            'aria-expanded': open.value,
            'aria-controls': open.value ? `${id.value}-list` : undefined,
            'aria-activedescendant':
              open.value && filtered.value[active.value] && !filtered.value[active.value].disabled
                ? `${id.value}-option-${active.value}`
                : undefined,
            'aria-busy': props.loading || undefined,
            autocomplete: 'off',
            placeholder: open.value
              ? (props.options.find((option) => option.value === selected.value)?.label ?? placeholder.value)
              : placeholder.value,
            disabled: props.disabled,
            required: props.required,
            modelValue: open.value ? query.value : (props.options.find((option) => option.value === selected.value)?.label ?? ''),
            onFocus: () => {
              open.value = true
              active.value = -1
            },
            onClick: () => (open.value = true),
            'onUpdate:modelValue': (value: string) => {
              query.value = value
              emit('queryChange', value)
              active.value = -1
              open.value = true
              if (!value) select('')
            },
            onKeydown: keydown,
          }),
          open.value
            ? h(
                'ul',
                {
                  class: 'k5-combobox__list',
                  id: `${id.value}-list`,
                  role: 'listbox',
                  'aria-label': props.label ?? t.value.messages.options,
                },
                props.loading || !filtered.value.length
                  ? [
                      h(
                        'li',
                        { role: 'presentation', class: 'k5-combobox__empty' },
                        props.loading ? t.value.messages.loadingEllipsis : (props.emptyLabel ?? t.value.messages.noResults),
                      ),
                    ]
                  : filtered.value.map((option, index) =>
                      h(
                        'li',
                        {
                          role: 'option',
                          id: `${id.value}-option-${index}`,
                          key: option.value,
                          'aria-selected': option.value === selected.value,
                          'aria-disabled': option.disabled || undefined,
                          'data-active': index === active.value,
                          class: 'k5-combobox__option',
                          onMousedown: (event: MouseEvent) => event.preventDefault(),
                          onMousemove: () => {
                            if (!option.disabled) active.value = index
                          },
                          onClick: () => pick(option),
                        },
                        [h('span', null, option.label), pathIcon(ICON_PATHS.check, 'k5-combobox__check')],
                      ),
                    ),
              )
            : null,
        ],
      )
  },
})
