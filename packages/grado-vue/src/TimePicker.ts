import { computed, defineComponent, h, ref, watch, type PropType } from 'vue'
import { FIELD_ICON_PATHS, ICON_PATHS, type Size } from '@1k5/grado/classes'
import { nearestTime, normalizeTime, timeError, timeSlots } from '@1k5/grado/patterns'
import { Input, useField } from './Field.js'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { autoId, booleanOptional, model } from './helpers.js'
import { useCheck } from './field-check.js'

/**
 * Hora «HH:MM» con v-model. Se puede escribir («9», «930», «9:30», «09.30»: al salir queda «09:30»)
 * o elegir en la lista de franjas, con las flechas y Enter como en Combobox. Emite error-change.
 */
export const TimePicker = defineComponent({
  name: 'K5TimePicker',
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    /** Minutos entre franjas de la lista. */
    step: { type: Number, default: 15 },
    /** Primera y última hora admitidas: «08:00», «20:00». */
    min: String,
    max: String,
    placeholder: String,
    size: String as PropType<Size>,
    /** Nombre accesible si no hay Field con etiqueta. */
    label: String,
    disabled: Boolean,
    required: booleanOptional,
    invalid: booleanOptional,
    /** Envía la hora «HH:MM» en un campo oculto. */
    name: String,
    id: String,
  },
  emits: ['update:modelValue', 'error-change'],
  setup(props, { emit }) {
    const t = useGrado()
    const field = useField()
    const auto = autoId('k5-time')
    const inputId = computed(() => props.id ?? field?.value.id ?? auto)
    const [current, setCurrent] = model(
      () => props.modelValue,
      props.defaultValue,
      (value) => emit('update:modelValue', value),
    )
    // Lo que se está escribiendo; null muestra el valor.
    const draft = ref<string | null>(null)
    const open = ref(false),
      active = ref(-1),
      root = ref<HTMLElement>()
    const slots = computed(() => timeSlots(props.min ?? '00:00', props.max ?? '23:59', props.step))
    const text = computed(() => draft.value ?? current.value)
    const range = () => ({ min: props.min, max: props.max })
    const check = useCheck(
      () => timeError(text.value, range(), t.value.messages),
      Boolean(text.value),
      (message) => emit('error-change', message),
    )
    watch(
      [active, open],
      () => {
        if (open.value && active.value >= 0)
          document.getElementById(`${inputId.value}-option-${active.value}`)?.scrollIntoView({ block: 'nearest' })
      },
      { flush: 'post' },
    )
    const update = (next: string) => {
      if (next !== current.value) setCurrent(next)
    }
    // Al salir o con Enter: «930» → «09:30». Si no es una hora válida, el texto se queda con su error.
    const commit = () => {
      check.touch()
      const typed = draft.value
      if (typed === null) return
      const normalized = normalizeTime(typed)
      if (!typed.trim()) {
        update('')
        draft.value = null
      } else if (normalized && !timeError(normalized, range())) {
        update(normalized)
        draft.value = null
      } else {
        update('')
        draft.value = normalized ?? typed
      }
    }
    const show = () => {
      open.value = true
      active.value = nearestTime(slots.value, text.value)
    }
    const close = () => {
      open.value = false
      active.value = -1
    }
    const focus = () => (root.value?.querySelector('input[role="combobox"]') as HTMLInputElement | null)?.focus()
    const pick = (slot: string) => {
      update(slot)
      draft.value = null
      check.touch()
      close()
      focus()
    }
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (open.value) close()
        else if (draft.value !== null) draft.value = null
        else return
        event.preventDefault()
        event.stopPropagation()
        return
      }
      if (event.key === 'Enter') {
        if (open.value) event.preventDefault()
        if (open.value && active.value >= 0) pick(slots.value[active.value])
        else {
          commit()
          close()
        }
        return
      }
      const list = slots.value
      const moves = ['ArrowDown', 'ArrowUp', ...(open.value ? ['Home', 'End'] : [])]
      if (!moves.includes(event.key) || !list.length) return
      event.preventDefault()
      const wasOpen = open.value
      open.value = true
      const from = active.value >= 0 ? active.value : nearestTime(list, text.value)
      const last = list.length - 1
      active.value =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? last
            : !wasOpen || from < 0
              ? from >= 0
                ? from
                : event.key === 'ArrowDown'
                  ? 0
                  : last
              : (from + (event.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length
    }
    return () => {
      const m = t.value.messages
      const id = inputId.value,
        listId = `${id}-list`,
        checkId = `${id}-check`
      const message = check.message()
      return h(
        'div',
        {
          ref: root,
          class: 'k5-time-picker',
          onFocusout: (event: FocusEvent) => {
            if (root.value?.contains(event.relatedTarget as Node)) return
            commit()
            close()
          },
        },
        [
          h('div', { class: 'k5-time-picker__control' }, [
            h(
              Input,
              {
                id,
                size: props.size,
                role: 'combobox',
                'aria-label': props.label,
                'aria-autocomplete': 'none',
                'aria-expanded': open.value,
                'aria-controls': open.value ? listId : undefined,
                'aria-activedescendant': open.value && active.value >= 0 ? `${id}-option-${active.value}` : undefined,
                'aria-describedby': message ? checkId : undefined,
                invalid: message ? true : props.invalid,
                inputmode: 'numeric',
                autocomplete: 'off',
                placeholder: props.placeholder ?? m.timePlaceholder,
                disabled: props.disabled,
                required: props.required,
                modelValue: text.value,
                onFocus: show,
                onClick: () => {
                  if (!open.value) show()
                },
                'onUpdate:modelValue': (typed: string) => {
                  draft.value = typed
                  open.value = true
                  active.value = slots.value.indexOf(normalizeTime(typed) ?? '')
                },
                onKeydown: keydown,
              },
              { prefix: () => pathIcon(FIELD_ICON_PATHS.clock, 'k5-time-picker__icon') },
            ),
            open.value
              ? h(
                  'ul',
                  { class: 'k5-combobox__list', id: listId, role: 'listbox', 'aria-label': m.timeOptions, tabindex: -1 },
                  slots.value.length
                    ? slots.value.map((slot, index) =>
                        h(
                          'li',
                          {
                            role: 'option',
                            id: `${id}-option-${index}`,
                            key: slot,
                            'aria-selected': slot === current.value,
                            'data-active': index === active.value,
                            class: 'k5-combobox__option',
                            onMousedown: (event: MouseEvent) => event.preventDefault(),
                            onMousemove: () => (active.value = index),
                            onClick: () => pick(slot),
                          },
                          [h('span', null, slot), pathIcon(ICON_PATHS.check, 'k5-combobox__check')],
                        ),
                      )
                    : [h('li', { role: 'presentation', class: 'k5-combobox__empty' }, m.noResults)],
                )
              : null,
          ]),
          message ? h('p', { class: 'k5-field__error', id: checkId, role: 'alert' }, message) : null,
          props.name ? h('input', { type: 'hidden', name: props.name, value: current.value, disabled: props.disabled }) : null,
        ],
      )
    }
  },
})
