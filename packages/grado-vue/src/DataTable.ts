import { computed, defineComponent, h, onBeforeUnmount, ref, watch, type PropType, type VNodeChild } from 'vue'
import { ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { pixelHeight, selectionLabel, VIRTUAL_ROWS, visibleColumns, type SortState } from '@1k5-tech-es/grado/patterns'
import { nextSort, sortRows, tableView, toggleAllRows, toggleColumn, toggleRow } from '@1k5-tech-es/grado/core'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { Button } from './Button.js'
import { model } from './helpers.js'
import { pathIcon } from './PathIcon.js'
import { Popover } from './Popover.js'
import { useGrado } from './Locale.js'
import { Checkbox, Pagination, Skeleton } from './Patterns.js'
import { Table } from './Table.js'

export type DataRow = Record<string, unknown>
export interface DataColumn {
  key: string
  header: string
  sortable?: boolean
  /** Alinea a la derecha con cifras tabulares: importes, kWp, kWh. */
  numeric?: boolean
  render?: (row: DataRow) => VNodeChild
  sortValue?: (row: DataRow) => unknown
  /** false: no se puede ocultar con columnPicker. */
  hideable?: boolean
  /** Valor para toCsv() si no es el del campo: un número sin unidad, una fecha ISO… */
  csvValue?: (row: DataRow) => string | number | null | undefined
}
// Fila vacía que guarda el alto de las filas virtuales que no se pintan.
const spacer = (height: number, span: number) =>
  h('tr', { class: 'k5-data-table__spacer', 'aria-hidden': 'true', style: { height: `${height}px` } }, [h('td', { colspan: span })])

export const DataTable = defineComponent({
  name: 'K5DataTable',
  props: {
    rows: { type: Array as PropType<DataRow[]>, required: true },
    columns: { type: Array as PropType<DataColumn[]>, required: true },
    rowKey: { type: [String, Function] as PropType<string | ((row: DataRow) => string)>, required: true },
    caption: { type: String, required: true },
    pageSize: { type: Number, default: 10 },
    page: Number,
    sort: { type: Object as PropType<SortState | null>, default: undefined },
    defaultSort: { type: Object as PropType<SortState | null>, default: null },
    selectable: Boolean,
    selectedKeys: { type: Array as PropType<string[]>, default: undefined },
    /** Datos del servidor: rows es ya la página pedida, en su orden. DataTable solo avisa con update:page y update:sort. */
    manual: Boolean,
    /** Con manual, el total de filas en el servidor, para la paginación. */
    totalRows: Number,
    /** Claves de las columnas ocultas (v-model:hiddenColumns). */
    hiddenColumns: { type: Array as PropType<string[]>, default: undefined },
    defaultHiddenColumns: { type: Array as PropType<string[]>, default: () => [] },
    /** Botón «Columnas» para elegir las que se ven. */
    columnPicker: Boolean,
    /**
     * Junta las filas por un campo o por lo que devuelva la función (un estado, un responsable). Cada grupo
     * lleva una fila de título con su total que se pliega. Los grupos salen en el orden en que aparecen en rows.
     */
    groupBy: [String, Function] as PropType<string | ((row: DataRow) => string)>,
    /** Lo que se pinta en la fila de título de cada grupo; por defecto, su clave. También con el slot group ({ group }). */
    groupLabel: Function as PropType<(key: string) => VNodeChild>,
    /** Claves de los grupos plegados (v-model:collapsedGroups). */
    collapsedGroups: { type: Array as PropType<string[]>, default: undefined },
    defaultCollapsedGroups: { type: Array as PropType<string[]>, default: () => [] },
    /**
     * Alto máximo: la tabla tiene su propio scroll y la cabecera se queda fija. Número en píxeles o medida CSS.
     * Con más de 200 filas a la vista, solo se pintan las que se ven (filas virtuales).
     */
    maxHeight: [Number, String],
    loading: Boolean,
    error: String,
    emptyLabel: String,
  },
  emits: ['update:page', 'update:sort', 'update:selectedKeys', 'update:hiddenColumns', 'update:collapsedGroups'],
  setup(props, { emit, slots }) {
    const t = useGrado()
    const innerPage = ref(1),
      innerSort = ref<SortState | null>(props.defaultSort),
      innerSelected = ref<string[]>([])
    const sorting = computed(() => (props.sort === undefined ? innerSort.value : props.sort)),
      selected = computed(() => props.selectedKeys ?? innerSelected.value)
    const [hidden, setHidden] = model<string[]>(
      () => props.hiddenColumns,
      props.defaultHiddenColumns,
      (keys: string[]) => emit('update:hiddenColumns', keys),
    )
    const [collapsed, setCollapsed] = model<string[]>(
      () => props.collapsedGroups,
      props.defaultCollapsedGroups,
      (keys: string[]) => emit('update:collapsedGroups', keys),
    )
    const shown = computed(() => visibleColumns(props.columns, hidden.value))
    // Página, orden, selección y filas virtuales salen del núcleo común (@1k5-tech-es/grado/core), como en React.
    const sorted = computed(() => sortRows(props.rows, props.columns, sorting.value, props.manual))
    const scroll = ref({ top: 0, viewport: pixelHeight(props.maxHeight) ?? 600, rowHeight: 0 })
    const view = computed(() =>
      tableView({
        rows: props.rows,
        columns: props.columns,
        rowKey: props.rowKey,
        sort: sorting.value,
        page: props.page ?? innerPage.value,
        pageSize: props.pageSize,
        manual: props.manual,
        totalRows: props.totalRows,
        selected: selected.value,
        maxHeight: props.maxHeight,
        loading: props.loading,
        error: props.error,
        scroll: scroll.value,
        sorted: sorted.value,
        groupBy: props.groupBy,
        collapsed: collapsed.value,
      }),
    )
    const count = computed(() => view.value.count)
    watch(count, () => {
      if (props.page === undefined && !props.manual) innerPage.value = Math.max(1, Math.min(count.value, innerPage.value))
    })
    const updateSelection = (keys: string[]) => {
      if (props.selectedKeys === undefined) innerSelected.value = keys
      emit('update:selectedKeys', keys)
    }
    const changePage = (page: number) => {
      if (props.page === undefined) innerPage.value = page
      emit('update:page', page)
    }
    const changeSort = (key: string) => {
      const next = nextSort(sorting.value, key)
      if (props.sort === undefined) innerSort.value = next
      emit('update:sort', next)
      changePage(1)
    }
    // Filas virtuales: dónde está el scroll, cuánto se ve y cuánto mide una fila.
    const root = ref<HTMLElement | null>(null)
    // Solo depende de si hay filas virtuales, no de su tramo: así medir no vuelve a enganchar los eventos.
    const virtual = computed(
      () => !props.groupBy && props.maxHeight != null && !props.loading && !props.error && view.value.visible.length > VIRTUAL_ROWS,
    )
    let stop: (() => void) | null = null
    watch(
      [virtual, root],
      () => {
        stop?.()
        stop = null
        const wrap = root.value?.querySelector<HTMLElement>('.k5-table-wrap')
        if (!virtual.value || !wrap) return
        let frame = 0
        const measure = () => {
          frame = 0
          const row = wrap.querySelector<HTMLElement>('tbody tr:not(.k5-data-table__spacer)')
          const next = { top: wrap.scrollTop, viewport: wrap.clientHeight, rowHeight: row?.offsetHeight ?? 0 }
          const old = scroll.value
          if (old.top !== next.top || old.viewport !== next.viewport || old.rowHeight !== next.rowHeight) scroll.value = next
        }
        const schedule = () => {
          if (!frame) frame = requestAnimationFrame(measure)
        }
        measure()
        wrap.addEventListener('scroll', schedule, { passive: true })
        const resize = new ResizeObserver(schedule)
        resize.observe(wrap)
        stop = () => {
          wrap.removeEventListener('scroll', schedule)
          resize.disconnect()
          cancelAnimationFrame(frame)
        }
      },
      { flush: 'post' },
    )
    onBeforeUnmount(() => stop?.())
    const sortIcon = (key: string) =>
      sorting.value?.key !== key
        ? pathIcon(ICON_PATHS.chevronsUpDown, 'k5-data-table__sort-icon')
        : pathIcon(sorting.value.direction === 'asc' ? ICON_PATHS.arrowUp : ICON_PATHS.arrowDown)
    return () => {
      const m = t.value.messages,
        { visible, keys, range, all, some, groups, keyOf, total, size, current } = view.value,
        span = shown.value.length + Number(props.selectable) + Number(!!slots.actions)
      const selection = props.selectable
        ? h('span', { class: 'k5-data-table__selection', role: 'status' }, selectionLabel(selected.value.length, m))
        : null
      const picker = () =>
        h(
          Popover,
          { label: m.columns, align: 'end' },
          {
            trigger: () => h(Button, { variant: 'secondary', size: 'sm' }, () => m.columns),
            default: () =>
              h(
                'div',
                { class: 'k5-data-table__columns' },
                props.columns
                  .filter((column) => column.hideable !== false)
                  .map((column) => {
                    const on = !hidden.value.includes(column.key)
                    return h(Checkbox, {
                      key: column.key,
                      label: column.header,
                      modelValue: on,
                      // Siempre queda al menos una columna a la vista.
                      disabled: on && shown.value.length === 1,
                      'onUpdate:modelValue': (next: boolean) => setHidden(toggleColumn(hidden.value, column.key, next)),
                    })
                  }),
              ),
          },
        )
      const bodyRow = (row: DataRow, i: number) => {
        const key = keyOf(row)
        return h(
          'tr',
          {
            key,
            ...(range ? { 'aria-rowindex': range.start + i + 2 } : {}),
            'data-selected': props.selectable && selected.value.includes(key) ? true : undefined,
          },
          [
            props.selectable
              ? h('td', { class: 'k5-data-table__check' }, [
                  h(Checkbox, {
                    'aria-label': formatMessage(m.selectRow, { key }),
                    modelValue: selected.value.includes(key),
                    'onUpdate:modelValue': (checked: boolean) => updateSelection(toggleRow(selected.value, key, checked)),
                  }),
                ])
              : null,
            ...shown.value.map((column) =>
              h('td', { key: column.key, ...(column.numeric ? { class: 'k5-num' } : {}) }, [
                slots[`cell-${column.key}`]?.({ row }) ?? (column.render ? column.render(row) : String(row[column.key] ?? '')),
              ]),
            ),
            slots.actions ? h('td', { class: 'k5-data-table__actions' }, slots.actions({ row })) : null,
          ],
        )
      }
      const groupRow = (group: NonNullable<typeof groups>[number]) =>
        h('tbody', { key: group.key, class: 'k5-data-table__group' }, [
          h('tr', { class: 'k5-data-table__group-row' }, [
            h('th', { scope: 'rowgroup', colspan: span }, [
              h(
                'button',
                {
                  type: 'button',
                  class: 'k5-data-table__group-toggle',
                  'aria-expanded': !group.collapsed,
                  onClick: () => setCollapsed(toggleRow(collapsed.value, group.key, !group.collapsed)),
                },
                [
                  pathIcon(ICON_PATHS.chevronDown),
                  h('span', null, [
                    slots.group?.({ group: group.key }) ?? (props.groupLabel ? props.groupLabel(group.key) : group.key || m.noGroup),
                  ]),
                  h('span', { class: 'k5-data-table__group-count' }, String(group.count)),
                ],
              ),
            ]),
          ]),
          ...(group.collapsed ? [] : group.rows.map(bodyRow)),
        ])
      const height = props.maxHeight
      return h(
        'div',
        {
          ref: root,
          class: ['k5-data-table', height != null && 'k5-data-table--scroll'],
          ...(height == null ? {} : { style: { '--_height': typeof height === 'number' ? `${height}px` : height } }),
          'aria-busy': props.loading || undefined,
        },
        [
          props.columnPicker ? h('div', { class: 'k5-data-table__toolbar' }, [selection, picker()]) : selection,
          h(
            Table,
            // Con filas virtuales, el lector de pantalla sabe cuántas hay y dónde está cada una.
            { caption: props.caption, ...(range ? { 'aria-rowcount': visible.length + 1 } : {}) },
            {
              default: () => [
                h('thead', null, [
                  h('tr', null, [
                    props.selectable
                      ? h('th', { scope: 'col', class: 'k5-data-table__check' }, [
                          h(Checkbox, {
                            'aria-label': m.selectPage,
                            modelValue: all,
                            indeterminate: some && !all,
                            disabled: props.loading || !!props.error || keys.length === 0,
                            'onUpdate:modelValue': (checked: boolean) => updateSelection(toggleAllRows(selected.value, keys, checked)),
                          }),
                        ])
                      : null,
                    ...shown.value.map((column) =>
                      h(
                        'th',
                        {
                          scope: 'col',
                          key: column.key,
                          ...(column.numeric ? { class: 'k5-num' } : {}),
                          'aria-sort':
                            sorting.value?.key === column.key
                              ? sorting.value.direction === 'asc'
                                ? 'ascending'
                                : 'descending'
                              : undefined,
                        },
                        column.sortable
                          ? [
                              h(
                                'button',
                                {
                                  type: 'button',
                                  class: 'k5-data-table__sort',
                                  disabled: props.loading,
                                  onClick: () => changeSort(column.key),
                                },
                                [column.header, sortIcon(column.key)],
                              ),
                            ]
                          : column.header,
                      ),
                    ),
                    slots.actions
                      ? h('th', { scope: 'col', class: 'k5-data-table__actions' }, [h('span', { class: 'k5-sr-only' }, m.actions)])
                      : null,
                  ]),
                ]),
                groups && !props.loading && !props.error && visible.length
                  ? groups.map(groupRow)
                  : h(
                      'tbody',
                      null,
                      props.loading
                        ? Array.from({ length: Math.min(size, 3) }, (_, i) =>
                            h('tr', { key: i }, [
                              h('td', { colspan: span, class: 'k5-data-table__loading' }, [
                                i === 0 ? h('span', { class: 'k5-sr-only', role: 'status' }, m.loadingData) : null,
                                h(Skeleton, { height: '0.875rem', width: `${90 - i * 15}%` }),
                              ]),
                            ]),
                          )
                        : props.error
                          ? [
                              h('tr', null, [
                                h('td', { colspan: span, class: 'k5-data-table__empty' }, [h('span', { role: 'alert' }, props.error)]),
                              ]),
                            ]
                          : !visible.length
                            ? [h('tr', null, [h('td', { colspan: span, class: 'k5-data-table__empty' }, props.emptyLabel ?? m.noResults)])]
                            : [
                                range && range.before > 0 ? spacer(range.before, span) : null,
                                ...(range ? visible.slice(range.start, range.end) : visible).map(bodyRow),
                                range && range.after > 0 ? spacer(range.after, span) : null,
                              ],
                    ),
              ],
            },
          ),
          // Con datos del servidor la paginación sigue a la vista mientras llega la página.
          !props.error && (props.manual || !props.loading)
            ? h(Pagination, { total, pageSize: size, page: current, 'onUpdate:page': changePage })
            : null,
        ],
      )
    }
  },
})
