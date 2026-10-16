# API de @1k5-tech-es/grado-vue/labs

Generado por `npm run api`. Si cambia sin querer, alguien ha cambiado la API pública.

## Amount

```ts
  colored: Boolean
  decimals: Number
  empty: String  // con valor por defecto
  scale: Boolean
  signed: Boolean
  unit: String  // con valor por defecto
  value: Number  // con valor por defecto
```

## compareTariffs

function

## forecastSummary

function

## formatEnergy

function

## formatEuro

function

## formatPower

function

## formatRelative

function

## hotkeyLabel

function

## isSignatureEmpty

function

## RelativeTime

```ts
  max: Number
  now: Date | String | Number
  value: Date | String | Number  // obligatoria
```

## ScrollArea

```ts
  label: String  // obligatoria
  maxHeight: Number | String
  orientation: String  // con valor por defecto
```

## signatureDataUrl

function

## SignaturePad

```ts
  defaultValue: Object  // con valor por defecto
  disabled: Boolean
  error: String
  hint: String
  id: String
  label: String  // obligatoria
  modelValue: Object  // con valor por defecto
  name: String
  required: Boolean
```

emits: update:modelValue

## signatureSvg

function

## SolarForecast

```ts
  actual: Array  // con valor por defecto
  description: String
  forecast: Array  // obligatoria
  height: String | Number
  interactive: Boolean  // con valor por defecto
  title: String
  weather: Array
```

## TariffComparison

```ts
  breakdown: Boolean  // con valor por defecto
  consumption: Number | Object  // obligatoria
  days: Number  // con valor por defecto
  description: String
  power: Number | Object  // con valor por defecto
  tariffs: Array  // obligatoria
  taxes: Object
  title: String
```

## tariffCost

function

## themeScript

function

## ThemeToggle

```ts
  apply: Boolean  // con valor por defecto
  defaultMode: String  // con valor por defecto
  size: String  // con valor por defecto
  storageKey: String
```

## useHotkey

function

## useTheme

function

## VisuallyHidden

```ts
  as: String  // con valor por defecto
```
