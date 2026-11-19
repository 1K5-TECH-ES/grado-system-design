'use client'
import { forwardRef } from 'react'
import { cx, statusClass } from '@1k5-tech-es/grado/classes'
import { Avatar } from './Avatar.js'
import { type TimelineItem } from '@1k5-tech-es/grado/patterns'
import { useGrado } from './Locale.js'

export interface TimelineProps {
  items: TimelineItem[]
  label?: string
  className?: string
}
export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(function Timeline({ items, label, className }, ref) {
  const { messages: m } = useGrado()
  return (
    <ol ref={ref} className={cx('k5-timeline', className)} aria-label={label ?? m.history}>
      {items.map((item) => (
        <li key={item.id} className="k5-timeline__item">
          {item.author ? (
            <span aria-hidden="true" className="k5-timeline__icon">
              <Avatar name={item.author} size="sm" />
            </span>
          ) : item.progress ? (
            <span aria-hidden="true" className={cx('k5-timeline__icon', statusClass({ tone: item.tone, progress: item.progress }))}>
              <span className="k5-status__dot" />
            </span>
          ) : (
            <span aria-hidden="true" className={cx('k5-timeline__dot', item.tone && `k5-timeline__dot--${item.tone}`)} />
          )}
          <strong className="k5-timeline__title">
            {item.author ? <span className="k5-timeline__author">{item.author} </span> : null}
            {item.title}
          </strong>
          {item.description && <span className="k5-timeline__description">{item.description}</span>}
          {item.comment && <p className="k5-timeline__comment">{item.comment}</p>}
          {item.date && (
            <time className="k5-timeline__date" dateTime={item.dateTime}>
              {item.date}
            </time>
          )}
        </li>
      ))}
    </ol>
  )
})
