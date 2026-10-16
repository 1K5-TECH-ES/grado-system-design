'use client'
import { forwardRef } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { type StepItem } from '@1k5-tech-es/grado/patterns'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

export interface StepperProps {
  items: StepItem[]
  value: string
  label?: string
  onValueChange?: (value: string) => void
  className?: string
}
export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper({ items, value, label, onValueChange, className }, ref) {
  const { messages: m } = useGrado()
  const current = items.findIndex((item) => item.id === value)
  return (
    <ol ref={ref} className={cx('k5-stepper', className)} aria-label={label ?? m.progress}>
      {items.map((item, index) => {
        const content = (
          <>
            <span className="k5-stepper__number" aria-hidden="true">
              {index < current ? <PathIcon paths={ICON_PATHS.check} /> : index + 1}
            </span>
            <span className="k5-stepper__text">
              <span>
                {item.label}
                {index < current && <span className="k5-sr-only">{`, ${m.completed}`}</span>}
              </span>
              {item.description && <span className="k5-stepper__description">{item.description}</span>}
            </span>
          </>
        )
        return (
          <li
            key={item.id}
            className="k5-stepper__item"
            aria-current={index === current ? 'step' : undefined}
            data-complete={index < current}
          >
            {onValueChange ? (
              <button type="button" disabled={item.disabled} className="k5-stepper__control" onClick={() => onValueChange(item.id)}>
                {content}
              </button>
            ) : (
              <div className="k5-stepper__control">{content}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
})
