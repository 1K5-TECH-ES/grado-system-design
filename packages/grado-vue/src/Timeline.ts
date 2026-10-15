import { defineComponent, h, type PropType } from 'vue'
import { cx } from '@1k5/grado/classes'
import { type TimelineItem } from '@1k5/grado/patterns'
import { useGrado } from './Locale.js'

export const Timeline = defineComponent({
  name: 'K5Timeline',
  props: { items: { type: Array as PropType<TimelineItem[]>, required: true }, label: String },
  setup: (props) => {
    const t = useGrado()
    return () =>
      h(
        'ol',
        { class: 'k5-timeline', 'aria-label': props.label ?? t.value.messages.history },
        props.items.map((item) =>
          h('li', { key: item.id, class: 'k5-timeline__item' }, [
            h('span', { 'aria-hidden': 'true', class: cx('k5-timeline__dot', item.tone && `k5-timeline__dot--${item.tone}`) }),
            h('strong', { class: 'k5-timeline__title' }, item.title),
            item.description ? h('span', { class: 'k5-timeline__description' }, item.description) : null,
            item.date ? h('time', { class: 'k5-timeline__date', datetime: item.dateTime }, item.date) : null,
          ]),
        ),
      )
  },
})
