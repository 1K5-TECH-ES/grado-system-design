import { defineComponent, h, ref, type PropType } from 'vue'
import { ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { type FilterItem, type FilterPart } from '@1k5-tech-es/grado/patterns'
import { Button } from './Button.js'
import { Input } from './Field.js'
import { pathIcon } from './PathIcon.js'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { useGrado } from './Locale.js'

const closeIcon = () => pathIcon(ICON_PATHS.x)
const filterParts = (field?: string, operator?: string, value?: string) =>
  field
    ? ((
        [
          ['field', field],
          ['operator', operator],
          ['value', value],
        ] as [FilterPart, string | undefined][]
      ).filter(([, text]) => text) as [FilterPart, string][])
    : null

export const FilterChip = defineComponent({
  name: 'K5FilterChip',
  props: {
    /** Texto del filtro en una pieza. Con field, nombra el filtro si quieres otro texto que el de las partes. */
    label: String,
    /** Filtro en partes: campo (Estado), operador (es uno de) y valores (Abierta, En obra). */
    field: String,
    operator: String,
    value: String,
    /** Con field, cada parte es un botón y emite edit con la parte pulsada ('field', 'operator' o 'value'). */
    editable: Boolean,
    removable: Boolean,
  },
  emits: ['remove', 'edit'],
  setup: (props, { emit }) => {
    const t = useGrado()
    return () => {
      const parts = filterParts(props.field, props.operator, props.value)
      const label = props.label ?? parts?.map(([, text]) => text).join(' ') ?? ''
      return h('span', { class: ['k5-chip', parts && 'k5-chip--parts'], ...(parts ? { role: 'group', 'aria-label': label } : {}) }, [
        ...(parts
          ? parts.map(([part, text]) =>
              props.editable
                ? h(
                    'button',
                    { key: part, type: 'button', class: `k5-chip__part k5-chip__${part}`, onClick: () => emit('edit', part) },
                    text,
                  )
                : h('span', { key: part, class: `k5-chip__part k5-chip__${part}` }, text),
            )
          : [label]),
        props.removable
          ? h(
              'button',
              {
                type: 'button',
                class: 'k5-chip__remove',
                'aria-label': formatMessage(t.value.messages.removeFilter, { label }),
                onClick: () => emit('remove'),
              },
              [closeIcon()],
            )
          : null,
      ])
    }
  },
})
export const FilterBar = defineComponent({
  name: 'K5FilterBar',
  props: {
    query: { type: String, default: '' },
    filters: { type: Array as PropType<FilterItem[]>, default: () => [] },
    searchable: { type: Boolean, default: true },
    clearable: Boolean,
    /** Filtros en partes: cada parte es un botón y emite edit-filter con el id y la parte pulsada. */
    editable: Boolean,
    label: String,
    placeholder: String,
  },
  emits: ['update:query', 'removeFilter', 'editFilter', 'clear'],
  setup: (props, { emit, slots }) => {
    const t = useGrado(),
      root = ref<HTMLElement>()
    // Al quitar un filtro su botón desaparece: el foco vuelve al buscador para no perderse.
    const removed = (id: string) => {
      emit('removeFilter', id)
      root.value?.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
    }
    return () =>
      h('div', { ref: root, role: 'search', 'aria-label': props.label ?? t.value.messages.search, class: 'k5-filter-bar' }, [
        props.searchable
          ? h('div', { class: 'k5-filter-bar__search' }, [
              h(
                Input,
                {
                  type: 'search',
                  'aria-label': props.label ?? t.value.messages.search,
                  placeholder: props.placeholder ?? t.value.messages.searchPlaceholder,
                  modelValue: props.query,
                  'onUpdate:modelValue': (query: string) => emit('update:query', query),
                },
                { prefix: () => pathIcon(ICON_PATHS.search) },
              ),
            ])
          : null,
        slots.default?.(),
        props.clearable && (props.query || props.filters.length)
          ? h(Button, { variant: 'ghost', size: 'sm', onClick: () => emit('clear') }, { default: () => t.value.messages.clearFilters })
          : null,
        props.filters.length
          ? h(
              'div',
              { class: 'k5-filter-bar__chips' },
              props.filters.map((filter) =>
                h(FilterChip, {
                  key: filter.id,
                  label: filter.label,
                  field: filter.field,
                  operator: filter.operator,
                  value: filter.value,
                  editable: props.editable,
                  removable: true,
                  onRemove: () => removed(filter.id),
                  onEdit: (part: FilterPart) => emit('editFilter', filter.id, part),
                }),
              ),
            )
          : null,
      ])
  },
})
