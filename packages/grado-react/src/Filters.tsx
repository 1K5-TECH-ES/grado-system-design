'use client'
import { forwardRef, useImperativeHandle, useRef, type ReactNode } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { type FilterItem, type FilterPart } from '@1k5-tech-es/grado/patterns'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { Button } from './Button.js'
import { Input } from './Field.js'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

const closeIcon = <PathIcon paths={ICON_PATHS.x} />
const filterParts = (field?: string, operator?: string, value?: string) =>
  field
    ? ((
        [
          ['field', field],
          ['operator', operator],
          ['value', value],
        ] as [FilterPart, string | undefined][]
      ).filter(([, text]) => text) as [FilterPart, string][])
    : null

export interface FilterChipProps {
  /** Texto del filtro en una pieza. Con field, nombra el filtro si quieres otro texto que el de las partes. */
  label?: string
  /** Filtro en partes: campo (Estado), operador (es uno de) y valores (Abierta, En obra). */
  field?: string
  operator?: string
  value?: string
  /** Con field, cada parte es un botón: avisa de cuál se ha pulsado para abrir su selector. */
  onEdit?: (part: FilterPart) => void
  onRemove?: () => void
  className?: string
}
export const FilterChip = forwardRef<HTMLSpanElement, FilterChipProps>(function FilterChip(
  { label: labelProp, field, operator, value, onEdit, onRemove, className },
  ref,
) {
  const { messages: m } = useGrado()
  const parts = filterParts(field, operator, value)
  const label = labelProp ?? parts?.map(([, text]) => text).join(' ') ?? ''
  return (
    <span
      ref={ref}
      className={cx('k5-chip', parts && 'k5-chip--parts', className)}
      role={parts ? 'group' : undefined}
      aria-label={parts ? label : undefined}
    >
      {parts
        ? parts.map(([part, text]) =>
            onEdit ? (
              <button key={part} type="button" className={`k5-chip__part k5-chip__${part}`} onClick={() => onEdit(part)}>
                {text}
              </button>
            ) : (
              <span key={part} className={`k5-chip__part k5-chip__${part}`}>
                {text}
              </span>
            ),
          )
        : label}
      {onRemove && (
        <button type="button" className="k5-chip__remove" aria-label={formatMessage(m.removeFilter, { label })} onClick={onRemove}>
          {closeIcon}
        </button>
      )}
    </span>
  )
})
export interface FilterBarProps {
  query?: string
  onQueryChange?: (query: string) => void
  filters?: FilterItem[]
  onRemoveFilter?: (id: string) => void
  /** Filtros en partes: cada parte es un botón y avisa del filtro y la parte pulsada. */
  onEditFilter?: (id: string, part: FilterPart) => void
  onClear?: () => void
  label?: string
  placeholder?: string
  children?: ReactNode
  className?: string
}
export const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(function FilterBar(
  { query = '', onQueryChange, filters = [], onRemoveFilter, onEditFilter, onClear, label: labelProp, placeholder, children, className },
  ref,
) {
  const { messages: m } = useGrado(),
    label = labelProp ?? m.search,
    root = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => root.current as HTMLDivElement, [])
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
            <FilterChip
              key={filter.id}
              label={filter.label}
              field={filter.field}
              operator={filter.operator}
              value={filter.value}
              onEdit={onEditFilter ? (part) => onEditFilter(filter.id, part) : undefined}
              onRemove={onRemoveFilter ? () => removed(filter.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
})
