# API de @1k5-tech-es/grado-react/labs

Generado por `npm run api`. Si cambia sin querer, alguien ha cambiado la API pública.

Tipos exportados: AmountProps, AmountUnit, HotkeyOptions, RelativeTimeProps, ScrollAreaProps, SignaturePadProps, SignatureValue, SolarForecastProps, Tariff, TariffComparisonProps, ThemeMode, ThemeOptions, ThemeToggleProps, VisuallyHiddenProps, WeatherKind

## Amount

ref: HTMLDataElement · admite además los atributos HTML de ese elemento

```ts
  colored?: boolean
  decimals?: number
  empty?: ReactNode
  scale?: boolean
  signed?: boolean
  unit?: AmountUnit
  value: number | null
```

## compareTariffs

```ts
(tariffs: Tariff[], options: TariffOptions) => { cheapest: string | null; rows: TariffRow[]; }
```

## forecastSummary

```ts
(options: { forecast?: number[]; actual?: (number | null | undefined)[]; tolerance?: number; }) => ForecastSummary
```

## formatEnergy

```ts
(kwh: number | null | undefined, options?: EnergyOptions) => string
```

## formatEuro

```ts
(value: number | null | undefined, options?: EuroOptions) => string
```

## formatPower

```ts
(kw: number | null | undefined, options?: PowerOptions) => string
```

## formatRelative

```ts
(value: DateInput, options?: { now?: DateInput; locale?: string; max?: number; }) => string
```

## hotkeyLabel

```ts
(hotkey: string, options?: { mac?: boolean; }) => string
```

## isSignatureEmpty

```ts
(value: SignatureValue | null | undefined) => boolean
```

## RelativeTime

ref: HTMLTimeElement · admite además los atributos HTML de ese elemento

```ts
  max?: number
  now?: DateInput
  value: DateInput
```

## ScrollArea

ref: HTMLDivElement · admite además los atributos HTML de ese elemento

```ts
  label: string
  maxHeight?: string | number
  orientation?: "vertical" | "horizontal" | "both"
```

## signatureDataUrl

```ts
(value: SignatureValue | null | undefined, options?: SignatureSvgOptions) => string
```

## SignaturePad

ref: HTMLDivElement

```ts
  className?: string
  defaultValue?: SignatureValue | null
  disabled?: boolean
  error?: string
  hint?: string
  id?: string
  label: string
  name?: string
  onChange?: ((value: SignatureValue | null) => void)
  required?: boolean
  value?: SignatureValue | null
```

## signatureSvg

```ts
(value: SignatureValue | null | undefined, options?: SignatureSvgOptions) => string
```

## SolarForecast

ref: HTMLElement

```ts
  actual?: (number | null)[]
  className?: string
  description?: ReactNode
  forecast: number[]
  height?: string | number
  interactive?: boolean
  title?: ReactNode
  weather?: WeatherKind[]
```

## TariffComparison

ref: HTMLElement

```ts
  breakdown?: boolean
  className?: string
  consumption: number | PeriodValues
  days?: number
  description?: ReactNode
  power?: number | { punta?: number; valle?: number; }
  tariffs: Tariff[]
  taxes?: { electricityTax?: number; vat?: number; }
  title?: ReactNode
```

## tariffCost

```ts
(tariff: Tariff, options: TariffOptions) => TariffCost
```

## themeScript

```ts
(key?: string) => string
```

## ThemeToggle

ref: sin ref

```ts
  apply?: boolean
  className?: string
  size?: Size
  storageKey?: string
```

## useHotkey

```ts
(hotkey: string, handler: (event: KeyboardEvent) => void, options?: HotkeyOptions) => void
```

## useTheme

```ts
({ storageKey, apply }?: ThemeOptions) => { mode: ThemeMode; setMode: (next: ThemeMode) => void; resolved: "dark" | "light"; }
```

## VisuallyHidden

ref: HTMLElement · admite además los atributos HTML de ese elemento

```ts
  as?: ElementType
```
