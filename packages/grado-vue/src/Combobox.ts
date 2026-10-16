import { computed, defineComponent, h, ref, watch, type PropType } from 'vue'
import { ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { filterOptions, type ChoiceOption } from '@1k5-tech-es/grado/patterns'
import { comboboxReduce, comboboxState, comboboxView, type ComboboxEvent, type ComboboxState } from '@1k5-tech-es/grado/core'
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
    const state = ref<ComboboxState>(comboboxState()),
      root = ref<HTMLElement>(),
      field = useField(),
      auto = autoId('k5-combobox'),
      t = useGrado()
    const placeholder = computed(() => props.placeholder ?? t.value.messages.searchPlaceholder)
    const id = computed(() => props.id ?? field?.value.id ?? auto),
      filtered = computed(() => filterOptions(props.options, state.value.query))
    watch(
      () => [state.value.active, state.value.open],
      () => {
        const { open, active } = state.value
        if (open && active >= 0) document.getElementById(`${id.value}-option-${active}`)?.scrollIntoView({ block: 'nearest' })
      },
      { flush: 'post' },
    )
    // Cada evento pasa por el núcleo común (@1k5-tech-es/grado/core), igual que en React y en grado-elements.
    const send = (event: ComboboxEvent, dom?: Event) => {
      const result = comboboxReduce(state.value, event, { filtered: filtered.value, loading: props.loading })
      if (result.preventDefault) dom?.preventDefault()
      if (result.stopPropagation) dom?.stopPropagation()
      state.value = result.state
      if (result.query !== undefined) emit('queryChange', result.query)
      if (result.select !== undefined) select(result.select)
      if (result.focusInput) (root.value?.querySelector('input[role="combobox"]') as HTMLInputElement)?.focus()
    }
    return () => {
      const view = comboboxView(state.value, {
        options: props.options,
        filtered: filtered.value,
        selected: selected.value,
        id: id.value,
        placeholder: placeholder.value,
      })
      const open = state.value.open
      return h(
        'div',
        {
          ref: root,
          class: 'k5-combobox',
          onFocusout: (event: FocusEvent) => {
            if (!root.value?.contains(event.relatedTarget as Node)) send({ type: 'leave' })
          },
        },
        [
          props.name ? h('input', { type: 'hidden', name: props.name, value: selected.value, disabled: props.disabled }) : null,
          h(Input, {
            id: id.value,
            role: 'combobox',
            'aria-label': props.label,
            'aria-autocomplete': 'list',
            'aria-expanded': open,
            'aria-controls': open ? view.listId : undefined,
            'aria-activedescendant': view.activeDescendant,
            'aria-busy': props.loading || undefined,
            autocomplete: 'off',
            placeholder: view.inputPlaceholder,
            disabled: props.disabled,
            required: props.required,
            modelValue: view.inputValue,
            onFocus: () => send({ type: 'focus' }),
            onClick: () => send({ type: 'click' }),
            'onUpdate:modelValue': (value: string) => send({ type: 'input', value }),
            onKeydown: (event: KeyboardEvent) => send({ type: 'key', key: event.key }, event),
          }),
          open
            ? h(
                'ul',
                {
                  class: 'k5-combobox__list',
                  id: view.listId,
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
                          id: view.optionId(index),
                          key: option.value,
                          'aria-selected': option.value === selected.value,
                          'aria-disabled': option.disabled || undefined,
                          'data-active': index === state.value.active,
                          class: 'k5-combobox__option',
                          onMousedown: (event: MouseEvent) => event.preventDefault(),
                          onMousemove: () => send({ type: 'hover', index }),
                          onClick: () => send({ type: 'pick', option }),
                        },
                        [h('span', null, option.label), pathIcon(ICON_PATHS.check, 'k5-combobox__check')],
                      ),
                    ),
              )
            : null,
        ],
      )
    }
  },
})
