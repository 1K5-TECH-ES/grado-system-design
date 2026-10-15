import { computed, defineComponent, h, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import { FIELD_ICON_PATHS, ICON_PATHS, type Size } from '@1k5-tech-es/grado/classes'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { nextIndex, type AddressOption } from '@1k5-tech-es/grado/patterns'
import { Input, useField } from './Field.js'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { autoId, booleanOptional, model } from './helpers.js'

/**
 * Dirección con autocompletado asíncrono, sin proveedor incluido: pasa tu función suggest.
 * v-model con la AddressOption elegida (o null). Espera a que se dejen de pulsar teclas y
 * descarta las respuestas que llegan tarde. Emite query-change con el texto escrito.
 */
export const AddressInput = defineComponent({
  name: 'K5AddressInput',
  props: {
    /** Busca direcciones con tu proveedor (Google Places, CartoCiudad, Catastro…). */
    suggest: { type: Function as PropType<(query: string) => Promise<AddressOption[]>>, required: true },
    /** Letras a partir de las que se busca. */
    minChars: { type: Number, default: 3 },
    /** Milisegundos de espera tras la última tecla. */
    debounce: { type: Number, default: 250 },
    modelValue: { type: Object as PropType<AddressOption | null>, default: undefined },
    defaultValue: { type: Object as PropType<AddressOption | null>, default: null },
    placeholder: String,
    /** Nombre accesible si no hay Field con etiqueta. */
    label: String,
    /** Texto cuando no hay sugerencias. Por defecto, «No hay resultados». */
    emptyLabel: String,
    size: String as PropType<Size>,
    disabled: Boolean,
    required: booleanOptional,
    invalid: booleanOptional,
    /** Envía el id de la dirección elegida en un campo oculto. */
    name: String,
    id: String,
  },
  emits: ['update:modelValue', 'query-change'],
  setup(props, { emit }) {
    const t = useGrado()
    const field = useField()
    const auto = autoId('k5-address')
    const inputId = computed(() => props.id ?? field?.value.id ?? auto)
    const [current, setCurrent] = model<AddressOption | null>(
      () => props.modelValue,
      props.defaultValue,
      (value) => emit('update:modelValue', value),
    )
    // Texto que se escribe; null muestra la dirección elegida.
    const query = ref<string | null>(null)
    const options = ref<AddressOption[]>([])
    const loading = ref(false),
      failed = ref(false),
      open = ref(false),
      active = ref(-1),
      root = ref<HTMLElement>()
    let timer: ReturnType<typeof setTimeout> | undefined
    // Cada búsqueda lleva un número; solo se atiende la respuesta de la última.
    let ticket = 0
    onBeforeUnmount(() => clearTimeout(timer))
    watch(
      [active, open],
      () => {
        if (open.value && active.value >= 0)
          document.getElementById(`${inputId.value}-option-${active.value}`)?.scrollIntoView({ block: 'nearest' })
      },
      { flush: 'post' },
    )
    const search = (text: string) => {
      clearTimeout(timer)
      const mine = ++ticket
      const needle = text.trim()
      active.value = -1
      failed.value = false
      if (needle.length < props.minChars) {
        options.value = []
        loading.value = false
        return
      }
      loading.value = true
      timer = setTimeout(() => {
        Promise.resolve()
          .then(() => props.suggest(needle))
          .then(
            (found) => {
              if (mine !== ticket) return
              options.value = found
              loading.value = false
            },
            () => {
              if (mine !== ticket) return
              options.value = []
              failed.value = true
              loading.value = false
            },
          )
      }, props.debounce)
    }
    const close = () => {
      open.value = false
      query.value = null
      active.value = -1
    }
    const pick = (option: AddressOption) => {
      setCurrent(option)
      ticket++
      clearTimeout(timer)
      loading.value = false
      close()
      ;(root.value?.querySelector('input[role="combobox"]') as HTMLInputElement | null)?.focus()
    }
    const status = computed(() => {
      const m = t.value.messages
      if (loading.value) return m.loadingEllipsis
      if ((query.value ?? '').trim().length < props.minChars) return formatMessage(m.addressMinChars, { count: props.minChars })
      if (failed.value) return m.addressFailed
      return options.value.length ? '' : (props.emptyLabel ?? m.noResults)
    })
    const activeOption = computed(() => (status.value ? undefined : options.value[active.value]))
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!open.value && query.value === null) return
        event.preventDefault()
        event.stopPropagation()
        close()
        return
      }
      if (event.key === 'Enter' && open.value) {
        event.preventDefault()
        if (activeOption.value) pick(activeOption.value)
        return
      }
      if (['ArrowDown', 'ArrowUp'].includes(event.key) || (open.value && ['Home', 'End'].includes(event.key))) {
        event.preventDefault()
        if (!open.value) {
          open.value = true
          if (query.value === null) {
            const label = current.value?.label ?? ''
            query.value = label
            search(label)
            return
          }
        }
        const next = status.value ? null : nextIndex(event.key, active.value, options.value.length)
        active.value = next ?? -1
      }
    }
    return () => {
      const m = t.value.messages
      const id = inputId.value,
        listId = `${id}-list`
      return h(
        'div',
        {
          ref: root,
          class: 'k5-address-input',
          onFocusout: (event: FocusEvent) => {
            if (!root.value?.contains(event.relatedTarget as Node)) close()
          },
        },
        [
          h(
            Input,
            {
              id,
              size: props.size,
              role: 'combobox',
              'aria-label': props.label,
              'aria-autocomplete': 'list',
              'aria-expanded': open.value,
              'aria-controls': open.value ? listId : undefined,
              'aria-activedescendant': open.value && activeOption.value ? `${id}-option-${active.value}` : undefined,
              'aria-busy': loading.value || undefined,
              autocomplete: 'off',
              placeholder: props.placeholder ?? m.addressPlaceholder,
              disabled: props.disabled,
              required: props.required,
              invalid: props.invalid,
              modelValue: query.value ?? current.value?.label ?? '',
              'onUpdate:modelValue': (text: string) => {
                query.value = text
                open.value = true
                emit('query-change', text)
                if (!text && current.value) setCurrent(null)
                search(text)
              },
              onKeydown: keydown,
            },
            { prefix: () => pathIcon(FIELD_ICON_PATHS.mapPin, 'k5-address-input__icon') },
          ),
          open.value
            ? h(
                'ul',
                { class: 'k5-combobox__list', id: listId, role: 'listbox', 'aria-label': props.label ?? m.addressOptions, tabindex: -1 },
                status.value
                  ? [h('li', { role: 'presentation', class: 'k5-combobox__empty' }, status.value)]
                  : options.value.map((option, index) =>
                      h(
                        'li',
                        {
                          role: 'option',
                          id: `${id}-option-${index}`,
                          key: option.id,
                          'aria-selected': option.id === current.value?.id,
                          'data-active': index === active.value,
                          class: 'k5-combobox__option k5-address-input__option',
                          onMousedown: (event: MouseEvent) => event.preventDefault(),
                          onMousemove: () => (active.value = index),
                          onClick: () => pick(option),
                        },
                        [
                          h('span', { class: 'k5-address-input__text' }, [
                            h('span', null, option.label),
                            option.description ? h('span', { class: 'k5-address-input__description' }, option.description) : null,
                          ]),
                          pathIcon(ICON_PATHS.check, 'k5-combobox__check'),
                        ],
                      ),
                    ),
              )
            : null,
          props.name ? h('input', { type: 'hidden', name: props.name, value: current.value?.id ?? '', disabled: props.disabled }) : null,
        ],
      )
    }
  },
})
