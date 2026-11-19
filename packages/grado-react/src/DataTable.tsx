'use client'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { pixelHeight, selectionLabel, visibleColumns, type SortState } from '@1k5-tech-es/grado/patterns'
import { nextSort, sortRows, tableView, toggleAllRows, toggleColumn, toggleRow } from '@1k5-tech-es/grado/core'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { Button } from './Button.js'
import { PathIcon } from './PathIcon.js'
import { Popover } from './Popover.js'
import { useValue } from './hooks.js'
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
  /** false: no se puede ocultar con columnPicker. */
  hideable?: boolean
  /** Valor para toCsv() si no es el del campo: un número sin unidad, una fecha ISO… */
  csvValue?: (row: T) => string | number | null | undefined
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
  /** Datos del servidor: rows es ya la página pedida, en su orden. DataTable solo avisa con onPageChange y onSortChange. */
  manual?: boolean
  /** Con manual, el total de filas en el servidor, para la paginación. */
  totalRows?: number
  /** Claves de las columnas ocultas. */
  hiddenColumns?: string[]
  defaultHiddenColumns?: string[]
  onHiddenColumnsChange?: (keys: string[]) => void
  /** Botón «Columnas» para elegir las que se ven. */
  columnPicker?: boolean
  /**
   * Junta las filas por un campo o por lo que devuelva la función (un estado, un responsable). Cada grupo
   * lleva una fila de título con su total que se pliega. Los grupos salen en el orden en que aparecen en rows.
   */
  groupBy?: (keyof T & string) | ((row: T) => string)
  /** Lo que se pinta en la fila de título de cada grupo; por defecto, su clave. */
  groupLabel?: (key: string) => ReactNode
  /** Claves de los grupos plegados. */
  collapsedGroups?: string[]
  defaultCollapsedGroups?: string[]
  onCollapsedGroupsChange?: (keys: string[]) => void
  /**
   * Alto máximo: la tabla tiene su propio scroll y la cabecera se queda fija. Número en píxeles o medida CSS.
   * Con más de 200 filas a la vista, solo se pintan las que se ven (filas virtuales).
   */
  maxHeight?: number | string
  loading?: boolean
  error?: string
  emptyLabel?: string
  className?: string
}
/**
 * Tabla con orden, selección, acciones y paginación. Sin manual, ordena y pagina las filas que recibe
 * (fíltralas antes); con manual, las filas vienen ya del servidor. rowKey tiene que ser único y estable.
 */
// forwardRef pierde el parámetro de tipo: el cast del final lo recupera.
export const DataTable = forwardRef(function DataTable<T extends object>(
  {
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
    manual = false,
    totalRows,
    hiddenColumns,
    defaultHiddenColumns = [],
    onHiddenColumnsChange,
    columnPicker = false,
    groupBy,
    groupLabel,
    collapsedGroups,
    defaultCollapsedGroups = [],
    onCollapsedGroupsChange,
    maxHeight,
    loading,
    error,
    emptyLabel,
    className,
  }: DataTableProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { messages: m } = useGrado()
  const root = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => root.current as HTMLDivElement, [])
  // Filas virtuales: dónde está el scroll, cuánto se ve y cuánto mide una fila.
  const [scroll, setScroll] = useState({ top: 0, viewport: pixelHeight(maxHeight) ?? 600, rowHeight: 0 })
  const [innerPage, setInnerPage] = useState(1),
    [innerSort, setInnerSort] = useState<SortState | null>(defaultSort),
    [innerSelected, setInnerSelected] = useState<string[]>([])
  const sorting = sort === undefined ? innerSort : sort
  const selected = selectedKeys ?? innerSelected
  const [hidden, setHidden] = useValue(hiddenColumns, defaultHiddenColumns, onHiddenColumnsChange)
  const [collapsed, setCollapsed] = useValue(collapsedGroups, defaultCollapsedGroups, onCollapsedGroupsChange)
  const shown = visibleColumns(columns, hidden)
  // Página, orden, selección y filas virtuales salen del núcleo común (@1k5-tech-es/grado/core), como en Vue.
  const sorted = useMemo(() => sortRows(rows, columns, sorting, manual), [rows, columns, sorting, manual])
  const view = tableView({
    rows,
    columns,
    rowKey,
    sort: sorting,
    page: page ?? innerPage,
    pageSize,
    manual,
    totalRows,
    selected,
    maxHeight,
    loading,
    error,
    scroll,
    sorted,
    groupBy,
    collapsed,
  })
  const { keyOf, total, size, count, current, visible, keys, all, some, groups, range } = view
  const virtual = range != null
  // Clamp uncontrolled pagination when filtering or deleting the last page.
  useEffect(() => {
    if (page === undefined && !manual) setInnerPage((old) => Math.max(1, Math.min(count, old)))
  }, [count, page, manual])
  useEffect(() => {
    const wrap = root.current?.querySelector<HTMLElement>('.k5-table-wrap')
    if (!virtual || !wrap) return
    let frame = 0
    const measure = () => {
      frame = 0
      const row = wrap.querySelector<HTMLElement>('tbody tr:not(.k5-data-table__spacer)')
      const next = { top: wrap.scrollTop, viewport: wrap.clientHeight, rowHeight: row?.offsetHeight ?? 0 }
      setScroll((old) => (old.top === next.top && old.viewport === next.viewport && old.rowHeight === next.rowHeight ? old : next))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    wrap.addEventListener('scroll', schedule, { passive: true })
    const resize = new ResizeObserver(schedule)
    resize.observe(wrap)
    return () => {
      wrap.removeEventListener('scroll', schedule)
      resize.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [virtual])
  const updateSelection = (next: string[]) => {
    if (selectedKeys === undefined) setInnerSelected(next)
    onSelectionChange?.(next)
  }
  const changePage = (next: number) => {
    if (page === undefined) setInnerPage(next)
    onPageChange?.(next)
  }
  const changeSort = (key: string) => {
    const next = nextSort(sorting, key)
    if (sort === undefined) setInnerSort(next)
    onSortChange?.(next)
    changePage(1)
  }
  const span = shown.length + Number(selectable) + Number(!!rowActions)
  const sortIcon = (key: string) =>
    sorting?.key !== key ? (
      <PathIcon paths={ICON_PATHS.chevronsUpDown} className="k5-data-table__sort-icon" />
    ) : (
      <PathIcon paths={sorting.direction === 'asc' ? ICON_PATHS.arrowUp : ICON_PATHS.arrowDown} />
    )
  const renderRow = (row: T, i: number) => {
    const key = keyOf(row)
    return (
      <tr
        key={key}
        aria-rowindex={range ? range.start + i + 2 : undefined}
        data-selected={selectable && selected.includes(key) ? true : undefined}
      >
        {selectable && (
          <td className="k5-data-table__check">
            <Checkbox
              aria-label={formatMessage(m.selectRow, { key })}
              checked={selected.includes(key)}
              onCheckedChange={(checked) => updateSelection(toggleRow(selected, key, checked))}
            />
          </td>
        )}
        {shown.map((column) => (
          <td key={column.key} className={column.numeric ? 'k5-num' : undefined}>
            {column.render ? column.render(row) : String(row[column.key] ?? '')}
          </td>
        ))}
        {rowActions && <td className="k5-data-table__actions">{rowActions(row)}</td>}
      </tr>
    )
  }
  const skeletonRows = Array.from({ length: Math.min(size, 3) }, (_, i) => i)
  const selection = selectable ? (
    <span className="k5-data-table__selection" role="status">
      {selectionLabel(selected.length, m)}
    </span>
  ) : null
  return (
    <div
      ref={root}
      className={cx('k5-data-table', maxHeight != null && 'k5-data-table--scroll', className)}
      style={
        maxHeight == null ? undefined : ({ '--_height': typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight } as CSSProperties)
      }
      aria-busy={loading || undefined}
    >
      {columnPicker ? (
        <div className="k5-data-table__toolbar">
          {selection}
          <Popover
            label={m.columns}
            align="end"
            trigger={
              <Button variant="secondary" size="sm">
                {m.columns}
              </Button>
            }
          >
            <div className="k5-data-table__columns">
              {columns
                .filter((column) => column.hideable !== false)
                .map((column) => {
                  const on = !hidden.includes(column.key)
                  return (
                    <Checkbox
                      key={column.key}
                      label={column.header}
                      checked={on}
                      // Siempre queda al menos una columna a la vista.
                      disabled={on && shown.length === 1}
                      onCheckedChange={(next) => setHidden(toggleColumn(hidden, column.key, next))}
                    />
                  )
                })}
            </div>
          </Popover>
        </div>
      ) : (
        selection
      )}
      {/* Con filas virtuales, el lector de pantalla sabe cuántas hay y dónde está cada una. */}
      <Table caption={caption} aria-rowcount={range ? visible.length + 1 : undefined}>
        <thead>
          <tr>
            {selectable && (
              <th scope="col" className="k5-data-table__check">
                <Checkbox
                  aria-label={m.selectPage}
                  checked={all}
                  indeterminate={some && !all}
                  disabled={loading || !!error || keys.length === 0}
                  onCheckedChange={(checked) => updateSelection(toggleAllRows(selected, keys, checked))}
                />
              </th>
            )}
            {shown.map((column) => (
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
        {groups && !loading && !error && visible.length ? (
          groups.map((group) => (
            <tbody key={group.key} className="k5-data-table__group">
              <tr className="k5-data-table__group-row">
                <th scope="rowgroup" colSpan={span}>
                  <button
                    type="button"
                    className="k5-data-table__group-toggle"
                    aria-expanded={!group.collapsed}
                    onClick={() => setCollapsed(toggleRow(collapsed, group.key, !group.collapsed))}
                  >
                    <PathIcon paths={ICON_PATHS.chevronDown} />
                    <span>{groupLabel ? groupLabel(group.key) : group.key || m.noGroup}</span>
                    <span className="k5-data-table__group-count">{group.count}</span>
                  </button>
                </th>
              </tr>
              {group.collapsed ? null : group.rows.map(renderRow)}
            </tbody>
          ))
        ) : (
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
              <>
                {range && range.before > 0 ? (
                  <tr className="k5-data-table__spacer" aria-hidden="true" style={{ height: range.before }}>
                    <td colSpan={span} />
                  </tr>
                ) : null}
                {(range ? visible.slice(range.start, range.end) : visible).map(renderRow)}
                {range && range.after > 0 ? (
                  <tr className="k5-data-table__spacer" aria-hidden="true" style={{ height: range.after }}>
                    <td colSpan={span} />
                  </tr>
                ) : null}
              </>
            )}
          </tbody>
        )}
      </Table>
      {/* Con datos del servidor la paginación sigue a la vista mientras llega la página. */}
      {!error && (manual || !loading) && <Pagination total={total} pageSize={size} page={current} onPageChange={changePage} />}
    </div>
  )
}) as unknown as <T extends object>(props: DataTableProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement | null
