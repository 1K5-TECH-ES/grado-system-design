import { defineComponent, h } from 'vue'
import { ICON_PATHS } from '@1k5/grado/classes'
import { pageCount, pageItems } from '@1k5/grado/patterns'
import { pathIcon } from './PathIcon.js'
import { formatMessage } from '@1k5/grado/messages'
import { useGrado } from './Locale.js'
import { model } from './helpers.js'

export const Pagination = defineComponent({
  name: 'K5Pagination',
  props: {
    total: { type: Number, required: true },
    pageSize: { type: Number, default: 10 },
    page: Number,
    defaultPage: { type: Number, default: 1 },
    label: String,
  },
  emits: ['update:page'],
  setup(props, { emit }) {
    const [selected, select] = model(
        () => props.page,
        props.defaultPage,
        (value) => emit('update:page', value),
      ),
      t = useGrado()
    return () => {
      const m = t.value.messages,
        count = pageCount(props.total, props.pageSize),
        current = Math.max(1, Math.min(count, selected.value))
      return h('nav', { class: 'k5-pagination', 'aria-label': props.label ?? m.pagination }, [
        h(
          'span',
          { 'aria-live': 'polite' },
          props.total > 0
            ? formatMessage(m.pageRange, {
                from: (current - 1) * Math.max(1, props.pageSize) + 1,
                to: Math.min(props.total, current * Math.max(1, props.pageSize)),
                total: props.total,
              })
            : m.noResultsCount,
        ),
        h('div', { class: 'k5-pagination__controls' }, [
          h('button', { type: 'button', 'aria-label': m.previousPage, disabled: current === 1, onClick: () => select(current - 1) }, [
            pathIcon(ICON_PATHS.chevronLeft),
          ]),
          ...pageItems(current, count).map((item, index) =>
            item === 'ellipsis'
              ? h('span', { key: `gap-${index}`, class: 'k5-pagination__ellipsis', 'aria-hidden': 'true' }, '…')
              : h(
                  'button',
                  {
                    type: 'button',
                    key: item,
                    'aria-label': formatMessage(m.pageN, { page: item }),
                    'aria-current': item === current ? 'page' : undefined,
                    onClick: () => select(item),
                  },
                  item,
                ),
          ),
          h('button', { type: 'button', 'aria-label': m.nextPage, disabled: current === count, onClick: () => select(current + 1) }, [
            pathIcon(ICON_PATHS.chevronRight),
          ]),
        ]),
      ])
    }
  },
})
