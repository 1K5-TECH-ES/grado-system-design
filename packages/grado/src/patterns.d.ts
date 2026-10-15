import type { Messages } from './messages.js'

export type StatusTone = 'info' | 'success' | 'warning' | 'danger'
export interface ChoiceOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  keywords?: string
}
export interface MenuItem {
  id: string
  label: string
  disabled?: boolean
  danger?: boolean
  separator?: boolean
}
export interface BreadcrumbItem {
  label: string
  href?: string
}
export interface StepItem {
  id: string
  label: string
  description?: string
  disabled?: boolean
}
export interface TimelineItem {
  id: string
  title: string
  description?: string
  date?: string
  dateTime?: string
  tone?: StatusTone
}
export interface FilterItem {
  id: string
  label: string
}
export interface UploadItem {
  id: string
  name: string
  status?: 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
}
export interface DateRangeValue {
  start: string
  end: string
}
export interface SortState {
  key: string
  direction: 'asc' | 'desc'
}
export declare function normalizeSearch(value: unknown): string
export declare function filterOptions<T extends ChoiceOption>(options: T[], query: string): T[]
export declare function pageCount(total: number, pageSize: number): number
export declare function pageItems(page: number, count: number): Array<number | 'ellipsis'>
export declare function compareValues(a: unknown, b: unknown): number
export declare function fileError(
  file: Pick<File, 'name' | 'size' | 'type'>,
  accept?: string,
  maxSize?: number,
  options?: { messages?: Messages; locale?: string },
): string
export declare function rangeError(start?: string, end?: string, min?: string, max?: string, messages?: Messages): string
export declare function lockScroll(doc: Document): () => void
export declare function moveFocus(
  event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'preventDefault'>,
  container: HTMLElement,
  selector: string,
  horizontal?: boolean,
): void
export declare function nextIndex(key: string, index: number, length: number): number | null
export declare function overflowsSide(element: Element, side: 'left' | 'right'): boolean
export declare function selectionLabel(count: number, messages?: Messages): string

// Componentes nuevos
export interface CommandItem {
  id: string
  label: string
  description?: string
  keywords?: string
  shortcut?: string
  disabled?: boolean
}
export interface CommandGroup {
  label: string
  items: CommandItem[]
}
export interface ChartSeries {
  key: string
  label: string
  /** Color chart-1 … chart-5. Por defecto, el orden de la serie. */ tone?: 1 | 2 | 3 | 4 | 5
}
export interface CalendarDay {
  iso: string
  day: number
  outside: boolean
}

export declare function parseNumber(text: string | null | undefined, locale?: string): number | null
export declare function decimalsOf(step: number): number
export declare function formatNumber(value: number | null | undefined, locale?: string, decimals?: number): string
export declare function clampNumber(value: number, min?: number, max?: number): number
export declare function stepNumber(value: number | null | undefined, step: number, times: number, min?: number, max?: number): number
export declare function toIso(year: number, month: number, day: number): string
export declare function parseIso(iso: string | null | undefined): { year: number; month: number; day: number } | null
export declare function todayIso(now?: Date): string
export declare function addDays(iso: string, days: number): string
export declare function addMonths(iso: string, months: number): string
export declare function weekday(iso: string): number
export declare function startOfWeek(iso: string, weekStartsOn?: number): string
export declare function clampDate(iso: string, min?: string, max?: string): string
export declare function monthWeeks(month: string, weekStartsOn?: number): CalendarDay[][]
export declare function weekdayNames(locale?: string, weekStartsOn?: number): Array<{ short: string; long: string }>
export declare function monthTitle(month: string, locale?: string): string
export declare function dateLabel(iso: string, locale?: string): string
export declare function nextRange(range: DateRangeValue | null | undefined, iso: string): DateRangeValue
export declare function niceScale(max: number, count?: number): { max: number; step: number; ticks: number[] }
export declare function filterGroups<T extends CommandGroup>(groups: T[], query: string): T[]
export declare function isShortcut(
  event: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey'>,
  key: string | false | null | undefined,
): boolean
