# API de @1k5-tech-es/grado-react/labs

Generado por `npm run api`. Si cambia sin querer, alguien ha cambiado la API pública.

Tipos exportados: AmountProps, AmountUnit, HotkeyOptions, RelativeTimeProps, ScrollAreaProps, ThemeMode, ThemeOptions, ThemeToggleProps, VisuallyHiddenProps

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
