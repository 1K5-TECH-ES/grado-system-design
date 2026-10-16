'use client'
import { forwardRef } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { pageCount, pageItems } from '@1k5-tech-es/grado/patterns'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { useValue } from './hooks.js'

export interface PaginationProps {
  total: number
  pageSize?: number
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  label?: string
  className?: string
}
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { total, pageSize = 10, page, defaultPage = 1, onPageChange, label, className },
  ref,
) {
  const { messages: m } = useGrado()
  const [selected, select] = useValue(page, defaultPage, onPageChange),
    count = pageCount(total, pageSize),
    current = Math.max(1, Math.min(count, selected))
  return (
    <nav ref={ref} className={cx('k5-pagination', className)} aria-label={label ?? m.pagination}>
      <span aria-live="polite">
        {total > 0
          ? formatMessage(m.pageRange, {
              from: (current - 1) * Math.max(1, pageSize) + 1,
              to: Math.min(total, current * Math.max(1, pageSize)),
              total,
            })
          : m.noResultsCount}
      </span>
      <div className="k5-pagination__controls">
        <button type="button" aria-label={m.previousPage} disabled={current === 1} onClick={() => select(current - 1)}>
          <PathIcon paths={ICON_PATHS.chevronLeft} />
        </button>
        {pageItems(current, count).map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`gap-${index}`} className="k5-pagination__ellipsis" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              type="button"
              key={item}
              aria-label={formatMessage(m.pageN, { page: item })}
              aria-current={item === current ? 'page' : undefined}
              onClick={() => select(item)}
            >
              {item}
            </button>
          ),
        )}
        <button type="button" aria-label={m.nextPage} disabled={current === count} onClick={() => select(current + 1)}>
          <PathIcon paths={ICON_PATHS.chevronRight} />
        </button>
      </div>
    </nav>
  )
})
