'use client'
import { cx } from '@1k5/grado/classes'
import { type TimelineItem } from '@1k5/grado/patterns'
import { useGrado } from './Locale.js'

export interface TimelineProps {
  items: TimelineItem[]
  label?: string
  className?: string
}
export function Timeline({ items, label, className }: TimelineProps) {
  const { messages: m } = useGrado()
  return (
    <ol className={cx('k5-timeline', className)} aria-label={label ?? m.history}>
      {items.map((item) => (
        <li key={item.id} className="k5-timeline__item">
          <span aria-hidden="true" className={cx('k5-timeline__dot', item.tone && `k5-timeline__dot--${item.tone}`)} />
          <strong className="k5-timeline__title">{item.title}</strong>
          {item.description && <span className="k5-timeline__description">{item.description}</span>}
          {item.date && (
            <time className="k5-timeline__date" dateTime={item.dateTime}>
              {item.date}
            </time>
          )}
        </li>
      ))}
    </ol>
  )
}
