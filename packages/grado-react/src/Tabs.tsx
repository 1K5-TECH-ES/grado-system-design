'use client'
import { type ReactNode } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'
import { moveFocus } from '@1k5-tech-es/grado/patterns'
import { useAutoId, useValue } from './hooks.js'

export interface TabItem {
  value: string
  label: string
  content: ReactNode
  disabled?: boolean
}
export interface TabsProps {
  items: TabItem[]
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  variant?: 'line' | 'pill'
  className?: string
}
export function Tabs({ items, label, value, defaultValue, onValueChange, variant = 'line', className }: TabsProps) {
  const [selected, select] = useValue(value, defaultValue ?? items.find((item) => !item.disabled)?.value ?? '', onValueChange),
    id = useAutoId('k5-tabs')
  const current = items.some((item) => item.value === selected && !item.disabled) ? selected : items.find((item) => !item.disabled)?.value
  return (
    <div className={cx('k5-tabs', variant === 'pill' && 'k5-tabs--pill', className)}>
      <div
        className="k5-tabs__list"
        role="tablist"
        aria-label={label}
        onKeyDown={(event) => moveFocus(event, event.currentTarget, '[role="tab"]', true)}
      >
        {items.map((item, i) => (
          <button
            type="button"
            key={item.value}
            id={`${id}-tab-${i}`}
            role="tab"
            className="k5-tabs__tab"
            tabIndex={item.value === current ? 0 : -1}
            disabled={item.disabled}
            aria-selected={item.value === current}
            aria-controls={`${id}-panel-${i}`}
            onClick={() => select(item.value)}
            onFocus={() => select(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, i) => (
        <div
          key={item.value}
          role="tabpanel"
          className="k5-tabs__panel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          tabIndex={0}
          hidden={item.value !== current}
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
