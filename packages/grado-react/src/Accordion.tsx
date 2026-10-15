'use client'
import { type ReactNode } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { PathIcon } from './PathIcon.js'
import { useAutoId, useValue } from './hooks.js'

export interface AccordionItem {
  value: string
  title: string
  content: ReactNode
  disabled?: boolean
}
export interface AccordionProps {
  items: AccordionItem[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  multiple?: boolean
  className?: string
}
export function Accordion({ items, value, defaultValue = [], onValueChange, multiple = false, className }: AccordionProps) {
  const [selected, select] = useValue(value, defaultValue, onValueChange),
    id = useAutoId('k5-accordion')
  return (
    <div className={cx('k5-accordion', className)}>
      {items.map((item, index) => {
        const open = selected.includes(item.value)
        return (
          <div key={item.value} className="k5-accordion__item">
            <h3 className="k5-accordion__heading">
              <button
                type="button"
                className="k5-accordion__trigger"
                id={`${id}-trigger-${index}`}
                disabled={item.disabled}
                aria-expanded={open}
                aria-controls={`${id}-panel-${index}`}
                onClick={() =>
                  select(open ? selected.filter((v) => v !== item.value) : multiple ? [...selected, item.value] : [item.value])
                }
              >
                {item.title}
                <PathIcon paths={ICON_PATHS.chevronDown} className="k5-accordion__icon" />
              </button>
            </h3>
            <div
              className="k5-accordion__panel"
              role="region"
              id={`${id}-panel-${index}`}
              aria-labelledby={`${id}-trigger-${index}`}
              hidden={!open}
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
