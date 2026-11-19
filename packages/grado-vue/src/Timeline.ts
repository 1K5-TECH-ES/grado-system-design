import { defineComponent, h, type PropType } from 'vue'
import { cx, statusClass } from '@1k5-tech-es/grado/classes'
import { Avatar } from './Avatar.js'
import { type TimelineItem } from '@1k5-tech-es/grado/patterns'
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
            item.author
              ? h('span', { 'aria-hidden': 'true', class: 'k5-timeline__icon' }, [h(Avatar, { name: item.author, size: 'sm' })])
              : item.progress
                ? h(
                    'span',
                    { 'aria-hidden': 'true', class: cx('k5-timeline__icon', statusClass({ tone: item.tone, progress: item.progress })) },
                    [h('span', { class: 'k5-status__dot' })],
                  )
                : h('span', { 'aria-hidden': 'true', class: cx('k5-timeline__dot', item.tone && `k5-timeline__dot--${item.tone}`) }),
            h('strong', { class: 'k5-timeline__title' }, [
              item.author ? h('span', { class: 'k5-timeline__author' }, `${item.author} `) : null,
              item.title,
            ]),
            item.description ? h('span', { class: 'k5-timeline__description' }, item.description) : null,
            item.comment ? h('p', { class: 'k5-timeline__comment' }, item.comment) : null,
            item.date ? h('time', { class: 'k5-timeline__date', datetime: item.dateTime }, item.date) : null,
          ]),
        ),
      )
  },
})
