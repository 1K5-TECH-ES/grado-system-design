import { computed, defineComponent, h, ref, watch, type PropType, type VNodeChild } from 'vue'
import { ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { compareValues, pageCount, selectionLabel, visibleColumns, type SortState } from '@1k5-tech-es/grado/patterns'
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
    /** Alto máximo: la tabla tiene su propio scroll y la cabecera se queda fija. Número en píxeles o medida CSS. */
    maxHeight: [Number, String],
    loading: Boolean,
    error: String,
    emptyLabel: String,
  },
  emits: ['update:page', 'update:sort', 'update:selectedKeys', 'update:hiddenColumns'],
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
    const shown = computed(() => visibleColumns(props.columns, hidden.value))
    const total = computed(() => (props.manual ? (props.totalRows ?? props.rows.length) : props.rows.length))
    const size = computed(() => Math.max(1, props.pageSize)),
      count = computed(() => pageCount(total.value, size.value)),
      current = computed(() => Math.min(count.value, Math.max(1, props.page ?? innerPage.value)))
    const keyOf = (row: DataRow) => (typeof props.rowKey === 'function' ? props.rowKey(row) : String(row[props.rowKey]))
    watch(count, () => {
      if (props.page === undefined && !props.manual) innerPage.value = Math.max(1, Math.min(count.value, innerPage.value))
    })
    const sorted = computed(() => {
      const sort = sorting.value,
        column = props.columns.find((col) => col.key === sort?.key && col.sortable)
      if (props.manual || !column || !sort) return props.rows
      return [...props.rows].sort(
        (a, b) =>
          compareValues(column.sortValue ? column.sortValue(a) : a[column.key], column.sortValue ? column.sortValue(b) : b[column.key]) *
          (sort.direction === 'asc' ? 1 : -1),
      )
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
      const next: SortState = { key, direction: sorting.value?.key === key && sorting.value.direction === 'asc' ? 'desc' : 'asc' }
      if (props.sort === undefined) innerSort.value = next
      emit('update:sort', next)
      changePage(1)
    }
    const sortIcon = (key: string) =>
      sorting.value?.key !== key
        ? pathIcon(ICON_PATHS.chevronsUpDown, 'k5-data-table__sort-icon')
        : pathIcon(sorting.value.direction === 'asc' ? ICON_PATHS.arrowUp : ICON_PATHS.arrowDown)
    return () => {
      const m = t.value.messages,
        visible = props.manual ? props.rows : sorted.value.slice((current.value - 1) * size.value, current.value * size.value),
        keys = visible.map(keyOf),
        all = keys.length > 0 && keys.every((key) => selected.value.includes(key)),
        some = keys.some((key) => selected.value.includes(key)),
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
                      'onUpdate:modelValue': (next: boolean) =>
                        setHidden(next ? hidden.value.filter((key: string) => key !== column.key) : [...hidden.value, column.key]),
                    })
                  }),
              ),
          },
        )
      const height = props.maxHeight
      return h(
        'div',
        {
          class: ['k5-data-table', height != null && 'k5-data-table--scroll'],
          ...(height == null ? {} : { style: { '--_height': typeof height === 'number' ? `${height}px` : height } }),
          'aria-busy': props.loading || undefined,
        },
        [
          props.columnPicker ? h('div', { class: 'k5-data-table__toolbar' }, [selection, picker()]) : selection,
          h(
            Table,
            { caption: props.caption },
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
                            'onUpdate:modelValue': (checked: boolean) =>
                              updateSelection(
                                checked ? [...new Set([...selected.value, ...keys])] : selected.value.filter((key) => !keys.includes(key)),
                              ),
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
                h(
                  'tbody',
                  null,
                  props.loading
                    ? Array.from({ length: Math.min(size.value, 3) }, (_, i) =>
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
                        : visible.map((row) => {
                            const key = keyOf(row)
                            return h('tr', { key, 'data-selected': props.selectable && selected.value.includes(key) ? true : undefined }, [
                              props.selectable
                                ? h('td', { class: 'k5-data-table__check' }, [
                                    h(Checkbox, {
                                      'aria-label': formatMessage(m.selectRow, { key }),
                                      modelValue: selected.value.includes(key),
                                      'onUpdate:modelValue': (checked: boolean) =>
                                        updateSelection(
                                          checked
                                            ? [...new Set([...selected.value, key])]
                                            : selected.value.filter((value) => value !== key),
                                        ),
                                    }),
                                  ])
                                : null,
                              ...shown.value.map((column) =>
                                h('td', { key: column.key, ...(column.numeric ? { class: 'k5-num' } : {}) }, [
                                  slots[`cell-${column.key}`]?.({ row }) ??
                                    (column.render ? column.render(row) : String(row[column.key] ?? '')),
                                ]),
                              ),
                              slots.actions ? h('td', { class: 'k5-data-table__actions' }, slots.actions({ row })) : null,
                            ])
                          }),
                ),
              ],
            },
          ),
          // Con datos del servidor la paginación sigue a la vista mientras llega la página.
          !props.error && (props.manual || !props.loading)
            ? h(Pagination, { total: total.value, pageSize: size.value, page: current.value, 'onUpdate:page': changePage })
            : null,
        ],
      )
    }
  },
})
