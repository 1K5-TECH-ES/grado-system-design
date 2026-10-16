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

// ---------- Datos y piezas (0.3) ----------
export interface DescriptionItem {
  /** Para el slot de Vue con contenido propio y como key. */
  id?: string
  term: string
  description?: string
  /** Añade un CopyButton que copia este valor. */
  copy?: string
  /** Cifra o código (CUPS, referencia catastral): fuente monoespaciada. */
  mono?: boolean
}
export interface AvatarItem {
  name: string
  src?: string
}
export interface ProgressState {
  indeterminate: boolean
  stepped: boolean
  max: number
  now: number | null
  ratio: number
  text: string
}
export declare function formatPercent(ratio: number | null | undefined, locale?: string, decimals?: number): string
export declare function progressState(options?: {
  value?: number | null
  max?: number
  steps?: number
  locale?: string
  messages?: Messages
}): ProgressState
export declare function splitAvatars<T>(items?: T[], max?: number): { shown: T[]; rest: T[] }
export declare function tagFocusTarget(button: Element | null | undefined): HTMLElement | null
export declare function copyText(text: string, env?: { navigator?: Navigator; document?: Document }): Promise<boolean>

// ---------- Gráficos (0.3) ----------
export interface ChartPoint {
  x: number
  y: number
}
export interface DonutSegment {
  label: string
  value: number
  /** Color chart-1 … chart-5. Por defecto, el orden del segmento. */
  tone?: 1 | 2 | 3 | 4 | 5
}
export interface DonutSlice {
  /** Inicio y longitud, de 0 a 100. */
  start: number
  length: number
  /** Porcentaje entero. */
  percent: number
}
export type MeterLevel = 'good' | 'fair' | 'poor' | 'neutral'
export type EnergyNode = 'solar' | 'home' | 'battery' | 'grid'
export interface EnergyNodeState {
  /** 'in': la energía llega al inversor; 'out': sale de él; 'none': no hay flujo. */
  flow: 'in' | 'out' | 'none'
  state: import('./messages.js').MessageKey
}

export declare function sparklinePoints(values: readonly number[] | null | undefined): ChartPoint[]
export declare function chartPoints(values: readonly number[], max: number): ChartPoint[]
export declare function linePath(points: readonly ChartPoint[]): string
export declare function areaPath(points: readonly ChartPoint[], base?: number): string
export declare function donutSlices(values: readonly number[], total?: number): DonutSlice[]
export declare function meterRatio(value: number, min?: number, max?: number): number
export declare function meterLevel(options: {
  value: number
  min?: number
  max?: number
  low?: number
  high?: number
  optimum?: number
}): MeterLevel
export declare function meterSegments(ratio: number, count: number): number
export declare function energyFlow(node: EnergyNode, value: number | null | undefined): EnergyNodeState

// ---------- Campos especiales (0.3) ----------
/** Dirección elegida en AddressInput. */
export interface AddressValue {
  street: string
  postalCode: string
  city: string
  province: string
  /** Referencia catastral, si el proveedor la da. */
  cadastralRef?: string
}
/** Sugerencia de AddressInput: lo que devuelve tu función suggest. */
export interface AddressOption {
  id: string
  /** Texto de la opción y del campo: «Calle de Alcalá, 48». */
  label: string
  /** Segunda línea: «28014 Madrid». */
  description?: string
  value: AddressValue
}
/** Una marca bajo el Slider: { value: 2, label: '2 kWp' }. */
export interface SliderMark {
  value: number
  label: string
}
export type PhoneCountryCode = 'ES' | 'PT' | 'FR' | 'DE' | 'IT' | 'GB'
export interface PhoneCountry {
  code: PhoneCountryCode
  dial: string
  /** Número de ejemplo ya formateado: «612 345 678». */
  example: string
}
export type NifKind = 'dni' | 'nie' | 'cif'

export declare function significantCount(text: string | null | undefined, end?: number): number
export declare function caretAfter(text: string | null | undefined, count: number): number
export declare function parseTime(text: string | null | undefined): number | null
export declare function formatTime(minutes: number | null | undefined): string
export declare function normalizeTime(text: string | null | undefined): string | null
export declare function timeSlots(min?: string, max?: string, step?: number): string[]
export declare function nearestTime(slots: string[], time: string | null | undefined): number
export declare function timeError(text: string | null | undefined, range?: { min?: string; max?: string }, messages?: Messages): string
export declare const PHONE_COUNTRIES: PhoneCountry[]
export declare function phoneCountryOf(text: string | null | undefined): PhoneCountryCode | null
export declare function parsePhone(text: string | null | undefined, country?: string): { country: PhoneCountryCode; digits: string }
export declare function formatPhone(text: string | null | undefined, country?: string): string
export declare function toE164(text: string | null | undefined, country?: string): string
export declare function nationalNumber(e164: string | null | undefined, country?: string): string
export declare function phoneError(text: string | null | undefined, country?: string, messages?: Messages): string
export declare function isValidPhone(text: string | null | undefined, country?: string): boolean
export declare function normalizeNif(text: string | null | undefined): string
export declare function nifKind(text: string | null | undefined): NifKind | null
export declare function nifError(text: string | null | undefined, messages?: Messages): string
export declare function isValidNif(text: string | null | undefined): boolean
export declare const IBAN_LENGTHS: Record<string, number>
export declare function normalizeIban(text: string | null | undefined): string
export declare function formatIban(text: string | null | undefined): string
export declare function ibanError(text: string | null | undefined, messages?: Messages): string
export declare function isValidIban(text: string | null | undefined): boolean

// ---------- Superposiciones y acciones (0.3) ----------
export declare function selectedCount(count: number, messages?: Messages): string
export declare function menuPosition(
  point: { x: number; y: number },
  size: { width: number; height: number },
  viewport: { width: number; height: number },
  margin?: number,
): { x: number; y: number }
export declare function toggleValues(current: string[], value: string, type?: 'single' | 'multiple', order?: string[]): string[]

// ---------- Avisos (0.4) ----------
export interface ToastAction {
  label: string
  /** El aviso se cierra después de llamarla. */
  onClick: () => void
}
export interface ToastOptions {
  /** Con el id de un aviso que ya está en la cola, lo sustituye en su sitio. */
  id?: string
  tone?: StatusTone
  description?: string
  action?: ToastAction
  /** Milisegundos desde que se ve; 0 lo deja hasta que se cierre. Por defecto, 5000. */
  duration?: number
}
export interface ToastItem {
  id: string
  title: string
  tone: StatusTone
  description?: string
  action?: ToastAction
  duration: number
}
export interface ToastPromiseMessages<T> {
  loading: string
  success: string | ((value: T) => string)
  error: string | ((reason: unknown) => string)
}
export interface ToastFunction {
  /** Añade un aviso a la cola y devuelve su id. */
  (title: string, options?: ToastOptions): string
  success(title: string, options?: Omit<ToastOptions, 'tone'>): string
  warning(title: string, options?: Omit<ToastOptions, 'tone'>): string
  /** Tono danger: se anuncia con role="alert". */
  error(title: string, options?: Omit<ToastOptions, 'tone'>): string
  info(title: string, options?: Omit<ToastOptions, 'tone'>): string
  /** Cierra un aviso; sin id, todos. */
  dismiss(id?: string): void
  /** Un aviso que dice «cargando» mientras la promesa sigue y luego el resultado. Devuelve la misma promesa. */
  promise<T>(work: Promise<T> | (() => Promise<T>), messages: ToastPromiseMessages<T>): Promise<T>
}
export interface ToastStore {
  toast: ToastFunction
  subscribe(listener: () => void): () => void
  getSnapshot(): readonly ToastItem[]
}
export declare function createToastStore(): ToastStore
export declare function visibleToasts(items: readonly ToastItem[], max?: number): ToastItem[]

// ---------- Formularios (0.4) ----------
/** Comprobación de FormField: true (o nada) si el valor vale; si no, el texto del error o false. */
// any por defecto: una comprobación como (kwp: number) => … tiene que poder pasarse sin tipos de más.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldCheck<V = any, T = any> = (
  value: V,
  values: T,
) => string | boolean | null | undefined | Promise<string | boolean | null | undefined>
export declare function isEmptyValue(value: unknown): boolean
export declare function errorSummaryTitle(count: number, messages?: Messages): string
export declare function fieldId(prefix: string, name: string): string
export declare function checkValue<V, T>(
  value: V,
  values: T,
  options?: { required?: boolean; formatError?: string; checks?: FieldCheck<V, T> | FieldCheck<V, T>[]; messages?: Messages },
): Promise<string>
export interface ErrorSummaryItem {
  /** id del control: el enlace lo enfoca. */
  id: string
  message: string
  /** Nombre del campo, delante del mensaje: «NIF del titular: …». */
  label?: string
}
export declare function focusField(id: string, doc?: Document): boolean

// ---------- Tablas con datos del servidor (0.4) ----------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CsvColumn<T = any> {
  key: string
  header: string
  /** Lo que va en el CSV si no es el valor del campo: un número sin unidad, una fecha ISO… */
  csvValue?: (row: T) => string | number | null | undefined
}
export declare function visibleColumns<C extends { key: string; hideable?: boolean }>(columns: C[], hidden?: string[]): C[]
export declare function toCsv<T>(rows: T[], columns: CsvColumn<T>[], options?: { locale?: string; separator?: string }): string
export declare function downloadCsv(filename: string, csv: string, doc?: Document): void

// ---------- Gráficos interactivos (0.4) ----------
export declare function chartSlotAt(offset: number, width: number, count: number): number | null
export declare function chartKeyMove(key: string, current: number | null, count: number): number | undefined
export declare function tooltipAlign(x: number): 'before' | 'after'
export declare function slotCenter(index: number, count: number): number

// ---------- Energía (0.4) ----------
export type TariffPeriod = 'valle' | 'llano' | 'punta'
export interface PriceSlot {
  index: number
  /** «HH:MM». */
  start: string
  end: string
  hour: number
  period: TariffPeriod
  price: number | null
}
export declare const NATIONAL_HOLIDAYS: string[]
export declare function isOffPeakDay(date?: string, holidays?: string[]): boolean
export declare function tariffPeriod(hour: number, offPeak?: boolean): TariffPeriod
export declare function priceSlots(
  prices: (number | null)[],
  options?: { date?: string; holidays?: string[]; periods?: TariffPeriod[] },
): PriceSlot[]
export declare function priceExtremes(slots: PriceSlot[]): { cheapest: PriceSlot | null; dearest: PriceSlot | null }
export declare function slotAt(slots: PriceSlot[], time?: string): number
export type BatteryState = 'charging' | 'discharging' | 'idle'
export declare function batteryState(power?: number | null): BatteryState
export declare function heatLevels(
  rows: (number | null)[][],
  options?: { min?: number; max?: number },
): { min: number; max: number; levels: (number | null)[][] }
export declare function gridKeyMove(
  key: string,
  current: [number, number] | null,
  rows: number,
  columns: number,
): [number, number] | undefined
