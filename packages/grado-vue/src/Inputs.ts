import { computed, defineComponent, h, mergeProps, ref, watch, type PropType } from 'vue'
import { cx, ICON_PATHS, type Size } from '@1k5/grado/classes'
import { formatMessage } from '@1k5/grado/messages'
import {
  clampNumber,
  decimalsOf,
  filterOptions,
  formatNumber,
  nextIndex,
  parseNumber,
  stepNumber,
  type ChoiceOption,
} from '@1k5/grado/patterns'
import { useControl, useField } from './Field.js'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { autoId, booleanOptional, model } from './helpers.js'

/**
 * Campo numérico que entiende la coma decimal («8,4») y devuelve un número (8.4) con
 * v-model. Flechas: un paso. Re Pág / Av Pág: diez. Inicio y Fin: mínimo y máximo.
 * Slots #prefix y #suffix, o las props del mismo nombre.
 */
export const NumberInput = defineComponent({
  name: 'K5NumberInput',
  inheritAttrs: false,
  props: {
    modelValue: { type: Number as PropType<number | null>, default: undefined },
    defaultValue: { type: Number as PropType<number | null>, default: null },
    min: Number,
    max: Number,
    step: { type: Number, default: 1 },
    decimals: Number,
    locale: String,
    prefix: String,
    suffix: String,
    size: String as PropType<Size>,
    invalid: booleanOptional,
    required: booleanOptional,
    disabled: Boolean,
    readonly: Boolean,
    hideSteppers: Boolean,
    decrementLabel: String,
    incrementLabel: String,
    id: String,
    name: String,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, slots, expose }) {
    const t = useGrado()
    const field = useField()
    const auto = autoId('k5-number')
    const inputId = computed(() => props.id ?? field?.value.id ?? auto)
    const control = useControl(
      {
        get id() {
          return inputId.value
        },
        get required() {
          return props.required
        },
        get invalid() {
          return props.invalid
        },
      },
      attrs,
    )
    const [current, setCurrent] = model<number | null>(
      () => props.modelValue,
      props.defaultValue,
      (value) => emit('update:modelValue', value),
    )
    const draft = ref<string | null>(null)
    const input = ref<HTMLInputElement>()
    expose({ focus: () => input.value?.focus(), input })
    const locale = computed(() => props.locale ?? t.value.locale)
    const digits = computed(() => props.decimals ?? decimalsOf(props.step))
    const round = (n: number) => Math.round(n * 10 ** digits.value) / 10 ** digits.value
    const update = (next: number | null) => {
      if (next !== current.value) setCurrent(next)
    }
    const stepBy = (times: number) => {
      draft.value = null
      update(stepNumber(current.value, props.step, times, props.min, props.max))
    }
    // Si el valor cambia desde fuera mientras no se escribe, el texto lo sigue.
    watch(
      () => props.modelValue,
      () => {
        if (typeof document !== 'undefined' && document.activeElement !== input.value) draft.value = null
      },
    )
    const onKeydown = (event: KeyboardEvent) => {
      if (props.disabled || props.readonly) return
      const big = event.shiftKey ? 10 : 1
      const { min, max } = props
      // Inicio y Fin solo saltan si hay mínimo o máximo; si no, mueven el cursor del texto.
      const moves: Record<string, () => void> = {
        ArrowUp: () => stepBy(big),
        ArrowDown: () => stepBy(-big),
        PageUp: () => stepBy(10),
        PageDown: () => stepBy(-10),
        ...(min != null ? { Home: () => update(min) } : {}),
        ...(max != null ? { End: () => update(max) } : {}),
      }
      if (!moves[event.key]) return
      event.preventDefault()
      draft.value = null
      moves[event.key]()
    }
    return () => {
      const m = t.value.messages
      const value = current.value
      const formatted = formatNumber(value, locale.value, digits.value)
      const locked = props.disabled || props.readonly
      const prefix = slots.prefix?.() ?? props.prefix
      const suffix = slots.suffix?.() ?? props.suffix
      const { class: className, ...rest } = attrs
      return h('div', { class: cx('k5-number', props.size && props.size !== 'md' && `k5-number--${props.size}`, className as string) }, [
        props.hideSteppers
          ? null
          : h(
              'button',
              {
                type: 'button',
                class: 'k5-number__step',
                tabindex: -1,
                'aria-label': props.decrementLabel ?? m.decrease,
                'aria-controls': inputId.value,
                disabled: locked || (props.min != null && value != null && value <= props.min),
                onMousedown: (event: MouseEvent) => event.preventDefault(),
                onClick: () => stepBy(-1),
              },
              [pathIcon(ICON_PATHS.minus)],
            ),
        prefix ? h('span', { class: 'k5-number__affix k5-number__affix--prefix' }, prefix) : null,
        h(
          'input',
          mergeProps(rest, control(), {
            ref: input,
            type: 'text',
            role: 'spinbutton',
            inputmode: 'decimal',
            autocomplete: 'off',
            class: 'k5-number__input',
            'aria-valuenow': value ?? undefined,
            'aria-valuemin': props.min,
            'aria-valuemax': props.max,
            'aria-valuetext': value == null ? undefined : props.suffix ? `${formatted} ${props.suffix}` : formatted,
            disabled: props.disabled,
            readonly: props.readonly,
            value: draft.value ?? formatted,
            onInput: (event: Event) => {
              const text = (event.target as HTMLInputElement).value
              draft.value = text
              const parsed = parseNumber(text, locale.value)
              if (parsed === null) update(null)
              else if (!Number.isNaN(parsed)) update(round(parsed))
            },
            onBlur: () => {
              if (draft.value === null) return
              const parsed = parseNumber(draft.value, locale.value)
              if (parsed !== null && !Number.isNaN(parsed)) update(clampNumber(round(parsed), props.min, props.max))
              draft.value = null
            },
            onKeydown,
          }),
        ),
        suffix ? h('span', { class: 'k5-number__affix' }, suffix) : null,
        props.hideSteppers
          ? null
          : h(
              'button',
              {
                type: 'button',
                class: 'k5-number__step',
                tabindex: -1,
                'aria-label': props.incrementLabel ?? m.increase,
                'aria-controls': inputId.value,
                disabled: locked || (props.max != null && value != null && value >= props.max),
                onMousedown: (event: MouseEvent) => event.preventDefault(),
                onClick: () => stepBy(1),
              },
              [pathIcon(ICON_PATHS.plus)],
            ),
        props.name ? h('input', { type: 'hidden', name: props.name, value: value ?? '', disabled: props.disabled }) : null,
      ])
    }
  },
})

/** Una opción entre pocas (de dos a cinco) que cambia la vista al momento. v-model. */
export const SegmentedControl = defineComponent({
  name: 'K5SegmentedControl',
  props: {
    options: { type: Array as PropType<ChoiceOption[]>, required: true },
    modelValue: String,
    defaultValue: String,
    /** Nombre del grupo para lectores de pantalla: «Periodo». */
    label: { type: String, required: true },
    size: String as PropType<Size>,
    block: Boolean,
    disabled: Boolean,
    name: String,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const first = () => props.options.find((option) => !option.disabled)?.value ?? ''
    const [selected, select] = model(
      () => props.modelValue,
      props.defaultValue ?? first(),
      (value) => emit('update:modelValue', value),
    )
    const onKeydown = (event: KeyboardEvent) => {
      const radios = [...(event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')]
      const next = nextIndex(event.key, radios.indexOf(document.activeElement as HTMLButtonElement), radios.length)
      if (next === null) return
      event.preventDefault()
      radios[next].focus()
      select(radios[next].dataset.value ?? '')
    }
    return () => {
      const focusable = props.options.some((option) => option.value === selected.value && !option.disabled) ? selected.value : first()
      return h(
        'div',
        {
          role: 'radiogroup',
          'aria-label': props.label,
          'aria-disabled': props.disabled || undefined,
          class: cx(
            'k5-segmented',
            props.size && props.size !== 'md' && `k5-segmented--${props.size}`,
            props.block && 'k5-segmented--block',
          ),
          onKeydown,
        },
        [
          ...props.options.map((option) =>
            h(
              'button',
              {
                key: option.value,
                type: 'button',
                role: 'radio',
                class: 'k5-segmented__option',
                'data-value': option.value,
                'aria-checked': option.value === selected.value,
                tabindex: option.value === focusable ? 0 : -1,
                disabled: props.disabled || option.disabled,
                onClick: () => select(option.value),
              },
              option.label,
            ),
          ),
          props.name ? h('input', { type: 'hidden', name: props.name, value: selected.value, disabled: props.disabled }) : null,
        ],
      )
    }
  },
})

/**
 * Varias opciones con búsqueda y v-model (array). Enter marca o desmarca; la lista sigue
 * abierta. Retroceso con el buscador vacío quita la última opción elegida.
 */
export const MultiSelect = defineComponent({
  name: 'K5MultiSelect',
  props: {
    options: { type: Array as PropType<ChoiceOption[]>, required: true },
    modelValue: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: () => [] },
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
    const t = useGrado()
    const field = useField()
    const auto = autoId('k5-multi')
    const [selected, select] = model<string[]>(
      () => props.modelValue,
      props.defaultValue,
      (value) => emit('update:modelValue', value),
    )
    const open = ref(false),
      query = ref(''),
      active = ref(-1),
      input = ref<HTMLInputElement>(),
      root = ref<HTMLElement>()
    const id = computed(() => props.id ?? field?.value.id ?? auto)
    const filtered = computed(() => filterOptions(props.options, query.value))
    watch(
      [active, open],
      () => {
        if (open.value && active.value >= 0)
          document.getElementById(`${id.value}-option-${active.value}`)?.scrollIntoView({ block: 'nearest' })
      },
      { flush: 'post' },
    )
    const toggle = (option: ChoiceOption) => {
      if (option.disabled || props.disabled) return
      select(
        selected.value.includes(option.value)
          ? selected.value.filter((v: string) => v !== option.value)
          : [...selected.value, option.value],
      )
      query.value = ''
      emit('queryChange', '')
    }
    const remove = (value: string) => {
      select(selected.value.filter((item: string) => item !== value))
      input.value?.focus()
    }
    const close = () => {
      open.value = false
      query.value = ''
      active.value = -1
    }
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (open.value) {
          event.preventDefault()
          event.stopPropagation()
        }
        close()
        return
      }
      if (event.key === 'Backspace' && !query.value && selected.value.length) {
        select(selected.value.slice(0, -1))
        return
      }
      if (event.key === 'Enter' && open.value) {
        event.preventDefault()
        const option = filtered.value[active.value]
        if (!props.loading && option) toggle(option)
        return
      }
      if (['ArrowDown', 'ArrowUp'].includes(event.key) || (open.value && ['Home', 'End'].includes(event.key))) {
        event.preventDefault()
        open.value = true
        const enabled = filtered.value.map((option, i) => (option.disabled ? -1 : i)).filter((i) => i >= 0)
        const next = nextIndex(event.key, enabled.indexOf(active.value), enabled.length)
        active.value = next === null ? -1 : enabled[next]
      }
    }
    return () => {
      const m = t.value.messages
      const f = field?.value
      const listId = `${id.value}-list`
      const activeOption = filtered.value[active.value]
      const chosen = selected.value.map(
        (v: string) => props.options.find((option: ChoiceOption) => option.value === v) ?? { value: v, label: v },
      )
      return h(
        'div',
        {
          ref: root,
          class: 'k5-multi-select',
          onFocusout: (event: FocusEvent) => {
            if (!root.value?.contains(event.relatedTarget as Node)) close()
          },
        },
        [
          h(
            'div',
            {
              class: 'k5-multi-select__control',
              onMousedown: (event: MouseEvent) => {
                if (event.target === event.currentTarget) {
                  event.preventDefault()
                  input.value?.focus()
                }
              },
            },
            [
              ...chosen.map((option: ChoiceOption & { label: string }) =>
                h('span', { class: 'k5-chip', key: option.value }, [
                  option.label,
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'k5-chip__remove',
                      'aria-label': formatMessage(m.removeItem, { label: option.label }),
                      disabled: props.disabled,
                      onClick: () => remove(option.value),
                    },
                    [pathIcon(ICON_PATHS.x)],
                  ),
                ]),
              ),
              h('input', {
                ref: input,
                id: id.value,
                class: 'k5-multi-select__input',
                role: 'combobox',
                'aria-label': props.label,
                'aria-autocomplete': 'list',
                'aria-expanded': open.value,
                'aria-controls': open.value ? listId : undefined,
                'aria-activedescendant':
                  open.value && activeOption && !activeOption.disabled ? `${id.value}-option-${active.value}` : undefined,
                'aria-describedby': f?.describedBy,
                'aria-invalid': f?.invalid || undefined,
                'aria-busy': props.loading || undefined,
                required: (props.required ?? f?.required) && selected.value.length === 0 ? true : undefined,
                autocomplete: 'off',
                placeholder: selected.value.length ? undefined : (props.placeholder ?? m.searchPlaceholder),
                disabled: props.disabled,
                value: query.value,
                onFocus: () => {
                  open.value = true
                },
                onClick: () => {
                  open.value = true
                },
                onInput: (event: Event) => {
                  query.value = (event.target as HTMLInputElement).value
                  emit('queryChange', query.value)
                  active.value = -1
                  open.value = true
                },
                onKeydown,
              }),
            ],
          ),
          open.value
            ? h(
                'ul',
                {
                  class: 'k5-combobox__list',
                  id: listId,
                  role: 'listbox',
                  'aria-multiselectable': 'true',
                  'aria-label': props.label ?? m.options,
                },
                props.loading || !filtered.value.length
                  ? [
                      h(
                        'li',
                        { role: 'presentation', class: 'k5-combobox__empty' },
                        props.loading ? m.loadingEllipsis : (props.emptyLabel ?? m.noResults),
                      ),
                    ]
                  : filtered.value.map((option, index) =>
                      h(
                        'li',
                        {
                          role: 'option',
                          id: `${id.value}-option-${index}`,
                          key: option.value,
                          'aria-selected': selected.value.includes(option.value),
                          'aria-disabled': option.disabled || undefined,
                          'data-active': index === active.value,
                          class: 'k5-combobox__option',
                          onMousedown: (event: MouseEvent) => event.preventDefault(),
                          onMousemove: () => {
                            if (!option.disabled) active.value = index
                          },
                          onClick: () => toggle(option),
                        },
                        [h('span', null, option.label), pathIcon(ICON_PATHS.check, 'k5-combobox__check')],
                      ),
                    ),
              )
            : null,
          ...(props.name
            ? selected.value.map((v: string) =>
                h('input', { key: v, type: 'hidden', name: props.name, value: v, disabled: props.disabled }),
              )
            : []),
        ],
      )
    }
  },
})
