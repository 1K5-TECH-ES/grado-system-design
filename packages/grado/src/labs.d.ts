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
export declare function readThemeMode(key?: string): ThemeMode
export declare function saveThemeMode(mode: ThemeMode, key?: string): void
export declare function resolveThemeMode(mode: ThemeMode, prefersDark: boolean): 'light' | 'dark'
export declare function applyThemeMode(mode: ThemeMode, root?: HTMLElement): void
export declare function themeScript(key?: string): string

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
