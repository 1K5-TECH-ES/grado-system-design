// Labs: fuera de la promesa de la 1.0. Pueden cambiar en una versión menor.

export interface EuroOptions {
  locale?: string
  decimals?: number
  grouping?: 'always' | 'auto' | 'min2'
  signed?: boolean
}
export declare function formatEuro(value: number | null | undefined, options?: EuroOptions): string

export interface EnergyOptions {
  locale?: string
  decimals?: number
  unit?: 'kWh' | 'MWh' | 'GWh'
  scale?: boolean
  signed?: boolean
}
export declare function formatEnergy(kwh: number | null | undefined, options?: EnergyOptions): string

export interface PowerOptions {
  locale?: string
  decimals?: number
  unit?: 'kW' | 'MW' | 'GW'
  scale?: boolean
  peak?: boolean
  signed?: boolean
}
export declare function formatPower(kw: number | null | undefined, options?: PowerOptions): string

export type AmountUnit = 'eur' | 'kWh' | 'kW' | 'kWp' | 'percent' | 'number'
export declare const AMOUNT_UNITS: AmountUnit[]
export declare function formatAmount(
  value: number | null | undefined,
  options?: { unit?: AmountUnit; locale?: string; decimals?: number; scale?: boolean; signed?: boolean },
): string

export type DateInput = Date | string | number
export declare function formatRelative(value: DateInput, options?: { now?: DateInput; locale?: string; max?: number }): string
export declare function formatDateTime(value: DateInput, options?: { locale?: string }): string
export declare function relativeRefresh(value: DateInput, now?: DateInput): number | null

export type ThemeMode = 'light' | 'dark' | 'system'
export declare const THEME_MODES: ThemeMode[]
export declare const THEME_STORAGE_KEY: string
export declare function readThemeMode(key?: string, defaultMode?: ThemeMode): ThemeMode
export declare function saveThemeMode(mode: ThemeMode, key?: string, defaultMode?: ThemeMode): void
export declare function resolveThemeMode(mode: ThemeMode, prefersDark: boolean): 'light' | 'dark'
export declare function applyThemeMode(mode: ThemeMode, root?: HTMLElement): void
export declare function themeScript(key?: string, defaultMode?: ThemeMode): string

export interface Hotkey {
  key: string
  mod: boolean
  ctrl: boolean
  meta: boolean
  alt: boolean
  shift: boolean
}
export declare function parseHotkey(hotkey: string): Hotkey
export declare function matchesHotkey(
  event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>,
  hotkey: string | Hotkey,
): boolean
export declare function isTypingTarget(target: EventTarget | null): boolean
export declare function hotkeyLabel(hotkey: string, options?: { mac?: boolean }): string

// ---------- Comparador de tarifas (0.6) ----------
export interface PeriodValues {
  punta?: number
  llano?: number
  valle?: number
}
export interface Tariff {
  id?: string
  name: string
  /** €/kWh: un precio o uno por periodo. */
  energy: number | PeriodValues
  /** €/kW y día: uno o por periodo (punta y valle). */
  power: number | { punta?: number; valle?: number }
  /** Cuota fija al mes, en euros. */
  monthly?: number
}
export interface TariffOptions {
  consumption: number | PeriodValues
  power?: number | { punta?: number; valle?: number }
  days?: number
  taxes?: { electricityTax?: number; vat?: number }
}
export interface TariffCost {
  energy: number
  power: number
  fixed: number
  taxes: number
  total: number
}
export declare function tariffCost(tariff: Tariff, options: TariffOptions): TariffCost
export interface TariffRow {
  id: string
  name: string
  cost: TariffCost
  cheapest: boolean
  delta: number
  monthly: number
  ratio: number
}
export declare function compareTariffs(tariffs: Tariff[], options: TariffOptions): { cheapest: string | null; rows: TariffRow[] }

// ---------- Firma (0.6) ----------
export type SignaturePoint = [number, number]
export type SignatureValue = { strokes: SignaturePoint[][] } | { typed: string }
export declare const SIGNATURE_SIZE: { width: number; height: number }
export declare function isSignatureEmpty(value: SignatureValue | null | undefined): boolean
export declare function signaturePoint(
  rect: { left: number; top: number; width: number; height: number },
  clientX: number,
  clientY: number,
  size?: { width: number; height: number },
): SignaturePoint
export declare function signaturePath(stroke: SignaturePoint[]): string
export interface SignatureSvgOptions {
  size?: { width: number; height: number }
  color?: string
  font?: string
}
export declare function signatureSvg(value: SignatureValue | null | undefined, options?: SignatureSvgOptions): string
export declare function signatureDataUrl(value: SignatureValue | null | undefined, options?: SignatureSvgOptions): string

// ---------- Previsión de producción solar (0.6) ----------
export type WeatherKind = 'sun' | 'partly' | 'cloud' | 'rain'
export declare const WEATHER_ICON_PATHS: Record<WeatherKind, string[]>
export declare const WEATHER_KINDS: WeatherKind[]
export interface ForecastSummary {
  done: number
  forecastTotal: number
  actualTotal: number
  expectedSoFar: number
  deviation: number | null
  status: 'above' | 'below' | 'on-track' | null
}
export declare function forecastSummary(options: {
  forecast?: number[]
  actual?: (number | null | undefined)[]
  tolerance?: number
}): ForecastSummary
export declare function slotLabel(index: number, count?: number): string

// ---------- Textos de labs (0.6) ----------
export type LabsMessageKey =
  | 'themeLabel'
  | 'themeLight'
  | 'themeDark'
  | 'themeSystem'
  | 'tariffName'
  | 'tariffAnnual'
  | 'tariffMonthly'
  | 'tariffCheapest'
  | 'tariffMore'
  | 'tariffEnergy'
  | 'tariffPower'
  | 'tariffTaxesIncluded'
  | 'tariffNoTaxes'
  | 'signatureHint'
  | 'signatureClear'
  | 'signatureTypeInstead'
  | 'signatureDrawInstead'
  | 'signatureTypedLabel'
  | 'signatureEmpty'
  | 'signatureDrawn'
  | 'signatureTyped'
  | 'forecastExpected'
  | 'forecastActual'
  | 'forecastUntil'
  | 'forecastAbove'
  | 'forecastBelow'
  | 'forecastOnTrack'
  | 'forecastWeather'
  | 'forecastHour'
  | 'weatherSun'
  | 'weatherPartly'
  | 'weatherCloud'
  | 'weatherRain'
export type LabsMessages = Record<LabsMessageKey, string>
export declare const LABS_MESSAGES: Record<'es-ES' | 'de-DE' | 'en-GB', LabsMessages>
export declare function labsMessagesFor(locale?: string, overrides?: Partial<Record<string, string>>): LabsMessages
