'use client'
import { forwardRef } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { type BreadcrumbItem } from '@1k5-tech-es/grado/patterns'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  label?: string
  className?: string
}
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs({ items, label, className }, ref) {
  const { messages: m } = useGrado()
  return (
    <nav ref={ref} className={cx('k5-breadcrumbs', className)} aria-label={label ?? m.breadcrumbs}>
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {index > 0 && <PathIcon paths={ICON_PATHS.chevronRight} className="k5-breadcrumbs__separator" />}
            {item.href && index !== items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
})
