'use client'
import { useRef, type ReactNode } from 'react'
import { cx, ICON_PATHS } from '@1k5/grado/classes'
import { type FilterItem } from '@1k5/grado/patterns'
import { formatMessage } from '@1k5/grado/messages'
import { Button } from './Button.js'
import { Input } from './Field.js'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

const closeIcon = <PathIcon paths={ICON_PATHS.x} />

export interface FilterChipProps {
  label: string
  onRemove?: () => void
  className?: string
}
export function FilterChip({ label, onRemove, className }: FilterChipProps) {
  const { messages: m } = useGrado()
  return (
    <span className={cx('k5-chip', className)}>
      {label}
      {onRemove && (
        <button type="button" className="k5-chip__remove" aria-label={formatMessage(m.removeFilter, { label })} onClick={onRemove}>
          {closeIcon}
        </button>
      )}
    </span>
  )
}
export interface FilterBarProps {
  query?: string
  onQueryChange?: (query: string) => void
  filters?: FilterItem[]
  onRemoveFilter?: (id: string) => void
  onClear?: () => void
  label?: string
  placeholder?: string
  children?: ReactNode
  className?: string
}
export function FilterBar({
  query = '',
  onQueryChange,
  filters = [],
  onRemoveFilter,
  onClear,
  label: labelProp,
  placeholder,
  children,
  className,
}: FilterBarProps) {
  const { messages: m } = useGrado(),
    label = labelProp ?? m.search,
    root = useRef<HTMLDivElement>(null)
  // Al quitar un filtro su botón desaparece: el foco vuelve al buscador para no perderse.
  const removed = (id: string) => {
    onRemoveFilter?.(id)
    root.current?.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
  }
  return (
    <div ref={root} role="search" aria-label={label} className={cx('k5-filter-bar', className)}>
      {onQueryChange && (
        <div className="k5-filter-bar__search">
          <Input
            type="search"
            prefix={<PathIcon paths={ICON_PATHS.search} />}
            aria-label={label}
            placeholder={placeholder ?? m.searchPlaceholder}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
      )}
      {children}
      {onClear && (query || filters.length > 0) && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          {m.clearFilters}
        </Button>
      )}
      {filters.length > 0 && (
        <div className="k5-filter-bar__chips">
          {filters.map((filter) => (
            <FilterChip key={filter.id} label={filter.label} onRemove={onRemoveFilter ? () => removed(filter.id) : undefined} />
          ))}
        </div>
      )}
    </div>
  )
}
