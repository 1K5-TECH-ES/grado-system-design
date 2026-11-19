// Núcleo común (0.6): estado y teclado sin framework. Lo usan grado-react, grado-vue y grado-elements.
import type { ChoiceOption, DateRangeValue, SortState, VirtualWindow } from './patterns.js'

// ---------- Combobox ----------
export interface ComboboxState {
  open: boolean
  query: string
  active: number
}
export type ComboboxEvent =
  | { type: 'focus' }
  | { type: 'click' }
  | { type: 'input'; value: string }
  | { type: 'key'; key: string }
  | { type: 'hover'; index: number }
  | { type: 'leave' }
  | { type: 'pick'; option: ChoiceOption }
export interface ComboboxResult {
  state: ComboboxState
  select?: string
  query?: string
  focusInput?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
}
export declare function comboboxState(): ComboboxState
export declare function comboboxReduce(
  state: ComboboxState,
  event: ComboboxEvent,
  context?: { filtered?: ChoiceOption[]; loading?: boolean },
): ComboboxResult
export interface ComboboxView {
  chosen: ChoiceOption | undefined
  activeOption: ChoiceOption | undefined
  listId: string
  optionId: (index: number) => string
  activeDescendant: string | undefined
  inputValue: string
  inputPlaceholder: string
}
/** Valor de la opción «Crear "…"»: al elegirla, el combobox avisa con onCreate en lugar de seleccionar. */
export declare const COMBOBOX_CREATE: string
/** Añade «Crear "…"» al final si lo escrito no es ya una opción (sin distinguir mayúsculas). */
export declare function withCreateOption(filtered: ChoiceOption[], query: string, options: ChoiceOption[], label: string): ChoiceOption[]
export declare function comboboxView(
  state: ComboboxState,
  options: { options: ChoiceOption[]; filtered: ChoiceOption[]; selected: string; id: string; placeholder: string },
): ComboboxView

// ---------- Calendar ----------
export interface CalendarDayView {
  iso: string
  day: number
  outside: boolean
  endpoint?: boolean
  between?: boolean
  selected?: boolean
  rangeStart?: boolean
  rangeEnd?: boolean
  today?: boolean
  disabled?: boolean
  tabbable?: boolean
  label?: string
}
export interface CalendarView {
  title: string
  names: { short: string; long: string }[]
  weeks: CalendarDayView[][]
  prevBlocked: boolean
  nextBlocked: boolean
}
export declare function calendarMove(
  key: string,
  from: string | undefined,
  options?: { shift?: boolean; weekStartsOn?: number; min?: string; max?: string },
): string | null
export declare function calendarChoose(value: string | DateRangeValue, iso: string, mode?: 'single' | 'range'): string | DateRangeValue
export declare function calendarAnchor(
  value: string | DateRangeValue | undefined,
  options: { mode?: 'single' | 'range'; today: string; min?: string; max?: string },
): string
export declare function calendarView(options: {
  visible: string
  value: string | DateRangeValue | undefined
  mode?: 'single' | 'range'
  today: string
  min?: string
  max?: string
  focusDate?: string | null
  weekStartsOn?: number
  locale?: string
}): CalendarView
export declare function calendarShift(visible: string, months: number): string

// ---------- DataTable ----------
export declare function nextSort(sort: SortState | null | undefined, key: string): SortState
export declare function toggleAllRows(selected: string[], keys: string[], checked: boolean): string[]
export declare function toggleRow(selected: string[], key: string, checked: boolean): string[]
export declare function toggleColumn(hidden: string[], key: string, visible: boolean): string[]
export interface TableColumnLike {
  key: string
  sortable?: boolean
  sortValue?: (row: never) => unknown
}
export declare function sortRows<T>(rows: T[], columns: TableColumnLike[], sort: SortState | null | undefined, manual?: boolean): T[]
/** Un campo de la fila o una función que da la clave de su grupo. */
export type GroupBy<T> = string | ((row: T) => string)
/** Filas juntas por grupo, en el orden en que cada grupo aparece en order (por defecto, rows). */
export declare function groupRows<T>(rows: T[], groupBy: GroupBy<T> | null | undefined, order?: T[]): T[]
export interface TableGroup<T> {
  key: string
  /** Las filas del grupo en esta página. */
  rows: T[]
  /** Cuántas filas tiene el grupo entre todas las que recibe la tabla. */
  count: number
  collapsed: boolean
}
export interface TableView<T> {
  keyOf: (row: T) => string
  total: number
  size: number
  count: number
  current: number
  visible: T[]
  keys: string[]
  all: boolean
  some: boolean
  groups: TableGroup<T>[] | null
  range: VirtualWindow | null
}
export declare function tableView<T>(options: {
  rows: T[]
  columns: TableColumnLike[]
  rowKey: string | ((row: T) => string)
  sort?: SortState | null
  page: number
  pageSize?: number
  manual?: boolean
  totalRows?: number
  selected?: string[]
  maxHeight?: number | string
  loading?: boolean
  error?: string
  scroll?: { top: number; viewport: number; rowHeight: number }
  sorted?: T[]
  groupBy?: GroupBy<T>
  collapsed?: string[]
}): TableView<T>
