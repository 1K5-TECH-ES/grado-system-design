'use client'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { compareValues, pageCount, selectionLabel, type SortState } from '@1k5-tech-es/grado/patterns'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { Checkbox, Pagination, Skeleton } from './Patterns.js'
import { Table } from './Table.js'

export interface DataColumn<T> {
  key: keyof T & string
  header: string
  sortable?: boolean
  /** Alinea a la derecha con cifras tabulares: importes, kWp, kWh. */
  numeric?: boolean
  render?: (row: T) => ReactNode
  sortValue?: (row: T) => unknown
}
export interface DataTableProps<T extends object> {
  rows: T[]
  columns: DataColumn<T>[]
  rowKey: (keyof T & string) | ((row: T) => string)
  caption: string
  pageSize?: number
  page?: number
  onPageChange?: (page: number) => void
  sort?: SortState | null
  defaultSort?: SortState | null
  onSortChange?: (sort: SortState) => void
  selectable?: boolean
  selectedKeys?: string[]
  onSelectionChange?: (keys: string[]) => void
  rowActions?: (row: T) => ReactNode
  loading?: boolean
  error?: string
  emptyLabel?: string
  className?: string
}
/** Client-side table. Filter rows before passing them; rowKey must be stable and unique. */
export function DataTable<T extends object>({
  rows,
  columns,
  rowKey,
  caption,
  pageSize = 10,
  page,
  onPageChange,
  sort,
  defaultSort = null,
  onSortChange,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  rowActions,
  loading,
  error,
  emptyLabel,
  className,
}: DataTableProps<T>) {
  const { messages: m } = useGrado()
  const [innerPage, setInnerPage] = useState(1),
    [innerSort, setInnerSort] = useState<SortState | null>(defaultSort),
    [innerSelected, setInnerSelected] = useState<string[]>([])
  const sorting = sort === undefined ? innerSort : sort
  const selected = selectedKeys ?? innerSelected
  const size = Math.max(1, pageSize),
    count = pageCount(rows.length, size),
    current = Math.min(count, Math.max(1, page ?? innerPage))
  const keyOf = (row: T) => (typeof rowKey === 'function' ? rowKey(row) : String(row[rowKey]))
  // Clamp uncontrolled pagination when filtering or deleting the last page.
  useEffect(() => {
    if (page === undefined) setInnerPage((old) => Math.max(1, Math.min(count, old)))
  }, [count, page])
  const sorted = useMemo(() => {
    const column = columns.find((col) => col.key === sorting?.key && col.sortable)
    if (!column || !sorting) return rows
    return [...rows].sort(
      (a, b) =>
        compareValues(column.sortValue ? column.sortValue(a) : a[column.key], column.sortValue ? column.sortValue(b) : b[column.key]) *
        (sorting.direction === 'asc' ? 1 : -1),
    )
  }, [rows, columns, sorting])
  const visible = sorted.slice((current - 1) * size, current * size),
    keys = visible.map(keyOf)
  const all = keys.length > 0 && keys.every((key) => selected.includes(key)),
    some = keys.some((key) => selected.includes(key))
  const updateSelection = (next: string[]) => {
    if (selectedKeys === undefined) setInnerSelected(next)
    onSelectionChange?.(next)
  }
  const changePage = (next: number) => {
    if (page === undefined) setInnerPage(next)
    onPageChange?.(next)
  }
  const changeSort = (key: string) => {
    const next: SortState = { key, direction: sorting?.key === key && sorting.direction === 'asc' ? 'desc' : 'asc' }
    if (sort === undefined) setInnerSort(next)
    onSortChange?.(next)
    changePage(1)
  }
  const span = columns.length + Number(selectable) + Number(!!rowActions)
  const sortIcon = (key: string) =>
    sorting?.key !== key ? (
      <PathIcon paths={ICON_PATHS.chevronsUpDown} className="k5-data-table__sort-icon" />
    ) : (
      <PathIcon paths={sorting.direction === 'asc' ? ICON_PATHS.arrowUp : ICON_PATHS.arrowDown} />
    )
  const skeletonRows = Array.from({ length: Math.min(size, 3) }, (_, i) => i)
  return (
    <div className={cx('k5-data-table', className)} aria-busy={loading || undefined}>
      {selectable && (
        <span className="k5-data-table__selection" role="status">
          {selectionLabel(selected.length, m)}
        </span>
      )}
      <Table caption={caption}>
        <thead>
          <tr>
            {selectable && (
              <th scope="col" className="k5-data-table__check">
                <Checkbox
                  aria-label={m.selectPage}
                  checked={all}
                  indeterminate={some && !all}
                  disabled={loading || !!error || keys.length === 0}
                  onCheckedChange={(checked) =>
                    updateSelection(checked ? [...new Set([...selected, ...keys])] : selected.filter((key) => !keys.includes(key)))
                  }
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                scope="col"
                key={column.key}
                className={column.numeric ? 'k5-num' : undefined}
                aria-sort={sorting?.key === column.key ? (sorting.direction === 'asc' ? 'ascending' : 'descending') : undefined}
              >
                {column.sortable ? (
                  <button type="button" className="k5-data-table__sort" disabled={loading} onClick={() => changeSort(column.key)}>
                    {column.header}
                    {sortIcon(column.key)}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
            {rowActions && (
              <th scope="col" className="k5-data-table__actions">
                <span className="k5-sr-only">{m.actions}</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            skeletonRows.map((i) => (
              <tr key={i}>
                <td colSpan={span} className="k5-data-table__loading">
                  {i === 0 && (
                    <span className="k5-sr-only" role="status">
                      {m.loadingData}
                    </span>
                  )}
                  <Skeleton height="0.875rem" width={`${90 - i * 15}%`} />
                </td>
              </tr>
            ))
          ) : error ? (
            <tr>
              <td colSpan={span} className="k5-data-table__empty">
                <span role="alert">{error}</span>
              </td>
            </tr>
          ) : !visible.length ? (
            <tr>
              <td colSpan={span} className="k5-data-table__empty">
                {emptyLabel ?? m.noResults}
              </td>
            </tr>
          ) : (
            visible.map((row) => {
              const key = keyOf(row)
              return (
                <tr key={key} data-selected={selectable && selected.includes(key) ? true : undefined}>
                  {selectable && (
                    <td className="k5-data-table__check">
                      <Checkbox
                        aria-label={formatMessage(m.selectRow, { key })}
                        checked={selected.includes(key)}
                        onCheckedChange={(checked) =>
                          updateSelection(checked ? [...new Set([...selected, key])] : selected.filter((value) => value !== key))
                        }
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={column.numeric ? 'k5-num' : undefined}>
                      {column.render ? column.render(row) : String(row[column.key] ?? '')}
                    </td>
                  ))}
                  {rowActions && <td className="k5-data-table__actions">{rowActions(row)}</td>}
                </tr>
              )
            })
          )}
        </tbody>
      </Table>
      {!loading && !error && <Pagination total={rows.length} pageSize={size} page={current} onPageChange={changePage} />}
    </div>
  )
}
