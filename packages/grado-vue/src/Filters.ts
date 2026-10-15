import { defineComponent, h, ref, type PropType } from 'vue'
import { ICON_PATHS } from '@1k5/grado/classes'
import { type FilterItem } from '@1k5/grado/patterns'
import { Button } from './Button.js'
import { Input } from './Field.js'
import { pathIcon } from './PathIcon.js'
import { formatMessage } from '@1k5/grado/messages'
import { useGrado } from './Locale.js'

const closeIcon = () => pathIcon(ICON_PATHS.x)

export const FilterChip = defineComponent({
  name: 'K5FilterChip',
  props: { label: { type: String, required: true }, removable: Boolean },
  emits: ['remove'],
  setup: (props, { emit }) => {
    const t = useGrado()
    return () =>
      h('span', { class: 'k5-chip' }, [
        props.label,
        props.removable
          ? h(
              'button',
              {
                type: 'button',
                class: 'k5-chip__remove',
                'aria-label': formatMessage(t.value.messages.removeFilter, { label: props.label }),
                onClick: () => emit('remove'),
              },
              [closeIcon()],
            )
          : null,
      ])
  },
})
export const FilterBar = defineComponent({
  name: 'K5FilterBar',
  props: {
    query: { type: String, default: '' },
    filters: { type: Array as PropType<FilterItem[]>, default: () => [] },
    searchable: { type: Boolean, default: true },
    clearable: Boolean,
    label: String,
    placeholder: String,
  },
  emits: ['update:query', 'removeFilter', 'clear'],
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
                h(FilterChip, { key: filter.id, label: filter.label, removable: true, onRemove: () => removed(filter.id) }),
              ),
            )
          : null,
      ])
  },
})
