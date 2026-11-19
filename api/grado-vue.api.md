# API de @1k5-tech-es/grado-vue

Generado por `npm run api`. Si cambia sin querer, alguien ha cambiado la API pública.

## Accordion

```ts
  defaultValue: Array  // con valor por defecto
  items: Array  // obligatoria
  modelValue: Array
  multiple: Boolean
```

emits: update:modelValue

## ActionBar

```ts
  clearLabel: String
  clearable: Boolean
  count: Number  // obligatoria
  inline: Boolean
  label: String
```

emits: clear

## AddressInput

```ts
  debounce: Number  // con valor por defecto
  defaultValue: Object  // con valor por defecto
  disabled: Boolean
  emptyLabel: String
  id: String
  invalid: Boolean  // con valor por defecto
  label: String
  minChars: Number  // con valor por defecto
  modelValue: Object  // con valor por defecto
  name: String
  placeholder: String
  required: Boolean  // con valor por defecto
  size: String
  suggest: Function  // obligatoria
```

emits: query-change, update:modelValue

## Alert

```ts
  dismissLabel: String
  dismissible: Boolean
  role: String  // con valor por defecto
  title: String  // obligatoria
  tone: String  // con valor por defecto
```

emits: dismiss

## AlertDialog

```ts
  closeLabel: String
  closeOnEscape: Boolean  // con valor por defecto
  closeOnOutside: Boolean  // con valor por defecto
  defaultOpen: Boolean
  description: String
  fullscreen: Boolean
  header: Boolean  // con valor por defecto
  modal: Boolean  // con valor por defecto
  open: Boolean  // con valor por defecto
  side: String  // con valor por defecto
  title: String  // obligatoria
```

emits: update:open

## AppLogo

```ts
  label: String  // con valor por defecto
```

## AppSearch

```ts
  label: String
  shortcut: String
```

## AppShell

```ts
  brandHeader: Boolean
  collapsed: Boolean
  mainId: String  // con valor por defecto
  menuLabel: String
  product: String
  skipLabel: String
```

## AreaChart

```ts
  area: Boolean  // con valor por defecto
  categoryKey: String  // obligatoria
  categoryLabel: String
  data: Array  // obligatoria
  decimals: Number  // con valor por defecto
  description: String
  height: Number | String
  interactive: Boolean  // con valor por defecto
  legend: Boolean  // con valor por defecto
  locale: String
  series: Array  // obligatoria
  title: String
  unit: String
```

## Avatar

```ts
  initials: String
  name: String
  size: String
  src: String
  status: String
```

## AvatarGroup

```ts
  items: Array  // obligatoria
  max: Number  // con valor por defecto
  size: String
```

## Badge

```ts
  icon: Object | Function
  tone: String
```

## badgeClass

function

## Banner

```ts
  dismissLabel: String
  dismissible: Boolean
  role: String
  title: String  // obligatoria
  tone: String  // con valor por defecto
```

emits: dismiss

## BarChart

```ts
  categoryKey: String  // obligatoria
  categoryLabel: String
  data: Array  // obligatoria
  decimals: Number  // con valor por defecto
  description: String
  height: Number | String
  interactive: Boolean  // con valor por defecto
  legend: Boolean  // con valor por defecto
  locale: String
  series: Array  // obligatoria
  stacked: Boolean
  title: String
  unit: String
```

## BatteryLevel

```ts
  capacity: Number
  decimals: Number  // con valor por defecto
  label: String
  level: Number  // obligatoria
  locale: String
  power: Number  // con valor por defecto
  reserve: Number
  size: String  // con valor por defecto
```

## Breadcrumbs

```ts
  items: Array  // obligatoria
  label: String
```

## Button

```ts
  block: Boolean
  disabled: Boolean
  icon: Object | Function
  iconOnly: Boolean
  loading: Boolean
  shortcut: Array
  size: String
  type: String  // con valor por defecto
  variant: String
```

## buttonClass

function

## Calendar

```ts
  defaultMonth: String
  defaultValue: String | Object  // con valor por defecto
  label: String
  locale: String
  max: String
  min: String
  mode: String  // con valor por defecto
  modelValue: String | Object  // con valor por defecto
  month: String
  plain: Boolean
  today: String
  weekStartsOn: Number  // con valor por defecto
```

emits: update:modelValue, update:month

## Card

```ts
  variant: String
```

## CardContent

```ts
  (sin props)
```

## CardDescription

```ts
  (sin props)
```

## CardFooter

```ts
  (sin props)
```

## CardHeader

```ts
  (sin props)
```

## CardTitle

```ts
  as: String  // con valor por defecto
```

## Checkbox

```ts
  defaultChecked: Boolean
  description: String
  id: String
  indeterminate: Boolean
  label: String
  modelValue: Boolean  // con valor por defecto
  required: Boolean  // con valor por defecto
```

emits: update:modelValue

## Combobox

```ts
  creatable: Boolean
  defaultValue: String  // con valor por defecto
  disabled: Boolean
  emptyLabel: String
  id: String
  label: String
  loading: Boolean
  modelValue: String
  name: String
  options: Array  // obligatoria
  placeholder: String
  required: Boolean  // con valor por defecto
```

emits: create, queryChange, update:modelValue

## CommandPalette

```ts
  defaultOpen: Boolean
  emptyLabel: String
  groups: Array  // obligatoria
  hotkey: String | Boolean  // con valor por defecto
  label: String
  open: Boolean  // con valor por defecto
  placeholder: String
```

emits: queryChange, select, update:open

## Container

```ts
  as: String | Object | Function  // con valor por defecto
  padded: Boolean  // con valor por defecto
  size: String
```

## containerClass

function

## ContextMenu

```ts
  disabled: Boolean
  items: Array  // obligatoria
  label: String
```

emits: action

## CopyButton

```ts
  copiedLabel: String
  iconOnly: Boolean
  label: String
  size: String
  value: String  // obligatoria
```

emits: copy

## cx

function

## DataTable

```ts
  caption: String  // obligatoria
  collapsedGroups: Array  // con valor por defecto
  columnPicker: Boolean
  columns: Array  // obligatoria
  defaultCollapsedGroups: Array  // con valor por defecto
  defaultHiddenColumns: Array  // con valor por defecto
  defaultSort: Object  // con valor por defecto
  emptyLabel: String
  error: String
  groupBy: String | Function
  groupLabel: Function
  hiddenColumns: Array  // con valor por defecto
  loading: Boolean
  manual: Boolean
  maxHeight: Number | String
  page: Number
  pageSize: Number  // con valor por defecto
  rowKey: String | Function  // obligatoria
  rows: Array  // obligatoria
  selectable: Boolean
  selectedKeys: Array  // con valor por defecto
  sort: Object  // con valor por defecto
  totalRows: Number
```

emits: update:collapsedGroups, update:hiddenColumns, update:page, update:selectedKeys, update:sort

## DatePicker

```ts
  modelValue: String
```

emits: update:modelValue

## DateRangePicker

```ts
  defaultValue: Object  // con valor por defecto
  disabled: Boolean
  label: String  // obligatoria
  max: String
  min: String
  modelValue: Object
  name: String
  required: Boolean
```

emits: update:modelValue

## DEFAULT_LOCALE

string

## DescriptionList

```ts
  items: Array  // obligatoria
  layout: String
```

## Dialog

```ts
  closeLabel: String
  closeOnEscape: Boolean  // con valor por defecto
  closeOnOutside: Boolean  // con valor por defecto
  defaultOpen: Boolean
  description: String
  fullscreen: Boolean
  header: Boolean  // con valor por defecto
  modal: Boolean  // con valor por defecto
  open: Boolean  // con valor por defecto
  side: String  // con valor por defecto
  title: String  // obligatoria
```

emits: update:open

## Donut

```ts
  centerLabel: String
  centerValue: String | Number
  decimals: Number  // con valor por defecto
  label: String
  legend: Boolean  // con valor por defecto
  locale: String
  max: Number  // con valor por defecto
  segments: Array
  size: String
  tone: Number
  unit: String
  value: Number  // con valor por defecto
```

## donutClass

function

## Drawer

```ts
  closeLabel: String
  closeOnEscape: Boolean  // con valor por defecto
  closeOnOutside: Boolean  // con valor por defecto
  defaultOpen: Boolean
  description: String
  fullscreen: Boolean
  header: Boolean  // con valor por defecto
  modal: Boolean  // con valor por defecto
  open: Boolean  // con valor por defecto
  side: String  // con valor por defecto
  title: String  // obligatoria
```

emits: update:open

## DropdownMenu

```ts
  align: String  // con valor por defecto
  disabled: Boolean
  items: Array  // obligatoria
  label: String  // obligatoria
```

emits: action

## ElectricMeterIcon

```ts
  title: String
```

## EmptyState

```ts
  compact: Boolean
  description: String
  icon: Object | Function
  title: String
```

## ENERGY_ICON_PATHS

object

## EnergyFlow

```ts
  battery: Number
  batteryLevel: Number
  decimals: Number  // con valor por defecto
  grid: Number
  home: Number  // obligatoria
  locale: String
  solar: Number  // obligatoria
  title: String
  unit: String  // con valor por defecto
```

## energyLineClass

function

## energyNodeClass

function

## ErrorSummary

```ts
  errors: Array  // obligatoria
  title: String
```

## Field

```ts
  error: String
  hint: String
  id: String
  label: String
  required: Boolean
```

## FIELD_KEY

symbol

## FileUpload

```ts
  accept: String
  disabled: Boolean
  files: Array  // con valor por defecto
  hint: String
  label: String
  maxSize: Number
  multiple: Boolean
  removable: Boolean
  retryable: Boolean
```

emits: filesChange, reject, remove, retry

## FilterBar

```ts
  clearable: Boolean
  editable: Boolean
  filters: Array  // con valor por defecto
  label: String
  placeholder: String
  query: String  // con valor por defecto
  searchable: Boolean  // con valor por defecto
```

emits: clear, editFilter, removeFilter, update:query

## FilterChip

```ts
  editable: Boolean
  field: String
  label: String
  operator: String
  removable: Boolean
  value: String
```

emits: edit, remove

## focusField

function

## formatMessage

function

## gapClass

function

## Grado

object

## GRADO_KEY

symbol

## GradoProvider

```ts
  locale: String
  messages: Object
```

## Grid

```ts
  as: String | Object | Function  // con valor por defecto
  columns: Number | String
  gap: String | Number
  minItemWidth: String
```

## gridClass

function

## Heading

```ts
  as: String | Object | Function
  level: Number | String  // obligatoria
  size: String
```

## headingClass

function

## Heatmap

```ts
  columnLabels: Array
  data: Array  // obligatoria
  decimals: Number  // con valor por defecto
  description: String
  interactive: Boolean  // con valor por defecto
  legend: Boolean  // con valor por defecto
  locale: String
  max: Number
  min: Number
  rowLabel: String
  rowLabels: Array
  title: String
  tone: Number  // con valor por defecto
  unit: String
```

## HeatPumpIcon

```ts
  title: String
```

## HomeBatteryIcon

```ts
  title: String
```

## IbanInput

```ts
  defaultValue: String  // con valor por defecto
  id: String
  invalid: Boolean  // con valor por defecto
  modelValue: String  // con valor por defecto
  size: String
```

emits: error-change, update:modelValue

## IconButton

```ts
  defaultPressed: Boolean  // con valor por defecto
  disabled: Boolean
  icon: Object | Function  // obligatoria
  label: String  // obligatoria
  pressed: Boolean  // con valor por defecto
  size: String
  type: String  // con valor por defecto
  variant: String  // con valor por defecto
```

emits: update:pressed

## Input

```ts
  id: String
  invalid: Boolean  // con valor por defecto
  modelValue: String | Number
  prefix: String
  required: Boolean  // con valor por defecto
  size: String
  suffix: String
```

emits: update:modelValue

## InverterIcon

```ts
  title: String
```

## isOffPeakDay

function

## Kbd

```ts
  keys: Array
```

## Kpi

```ts
  better: String  // con valor por defecto
  change: Number  // con valor por defecto
  hint: String
  label: String | Number  // obligatoria
  locale: String
  previous: String | Number
  previousLabel: String
  selectable: Boolean
  selected: Boolean
  tone: String
  trend: Array
  value: String | Number  // obligatoria
```

## KpiGroup

```ts
  label: String
```

## LineChart

```ts
  area: Boolean  // con valor por defecto
  categoryKey: String  // obligatoria
  categoryLabel: String
  data: Array  // obligatoria
  decimals: Number  // con valor por defecto
  description: String
  height: Number | String
  interactive: Boolean  // con valor por defecto
  legend: Boolean  // con valor por defecto
  locale: String
  series: Array  // obligatoria
  title: String
  unit: String
```

## Link

```ts
  as: String | Object | Function  // con valor por defecto
  external: Boolean
  tone: String
  underline: String
```

## MESSAGES

object

## messagesFor

function

## Meter

```ts
  decimals: Number  // con valor por defecto
  high: Number
  label: String
  locale: String
  low: Number
  max: Number  // con valor por defecto
  min: Number  // con valor por defecto
  optimum: Number
  segments: Number  // con valor por defecto
  showValue: Boolean  // con valor por defecto
  unit: String
  value: Number  // obligatoria
  valueText: String
  variant: String  // con valor por defecto
```

## meterClass

function

## MultiSelect

```ts
  defaultValue: Array  // con valor por defecto
  disabled: Boolean
  emptyLabel: String
  id: String
  label: String
  loading: Boolean
  modelValue: Array  // con valor por defecto
  name: String
  options: Array  // obligatoria
  placeholder: String
  required: Boolean  // con valor por defecto
```

emits: queryChange, update:modelValue

## NATIONAL_HOLIDAYS

array

## Nav

```ts
  label: String
```

## NavGroup

```ts
  active: Boolean
  badge: String | Number
  defaultOpen: Boolean
  icon: Object | Function
  label: String  // obligatoria
  open: Boolean  // con valor por defecto
```

emits: update:open

## NavItem

```ts
  active: Boolean  // con valor por defecto
  as: String | Object | Function  // con valor por defecto
  badge: String | Number
  icon: Object | Function
  label: String  // obligatoria
```

## NavSection

```ts
  title: String
```

## NifInput

```ts
  defaultValue: String  // con valor por defecto
  id: String
  invalid: Boolean  // con valor por defecto
  modelValue: String  // con valor por defecto
  size: String
```

emits: error-change, update:modelValue

## NumberInput

```ts
  decimals: Number
  decrementLabel: String
  defaultValue: Number  // con valor por defecto
  disabled: Boolean
  hideSteppers: Boolean
  id: String
  incrementLabel: String
  invalid: Boolean  // con valor por defecto
  locale: String
  max: Number
  min: Number
  modelValue: Number  // con valor por defecto
  name: String
  prefix: String
  readonly: Boolean
  required: Boolean  // con valor por defecto
  size: String
  step: Number  // con valor por defecto
  suffix: String
```

emits: update:modelValue

## PageHeader

```ts
  as: String  // con valor por defecto
  subtitle: String
  title: String  // obligatoria
  variant: String
```

## Pagination

```ts
  defaultPage: Number  // con valor por defecto
  label: String
  page: Number
  pageSize: Number  // con valor por defecto
  total: Number  // obligatoria
```

emits: update:page

## PasswordInput

```ts
  autocomplete: String  // con valor por defecto
  defaultValue: String  // con valor por defecto
  disabled: Boolean
  hideLabel: String
  id: String
  invalid: Boolean  // con valor por defecto
  modelValue: String  // con valor por defecto
  required: Boolean  // con valor por defecto
  showLabel: String
  size: String
```

emits: update:modelValue

## PhoneInput

```ts
  countries: Array
  country: String
  countryLabel: String
  defaultCountry: String
  defaultValue: String  // con valor por defecto
  disabled: Boolean
  id: String
  invalid: Boolean  // con valor por defecto
  modelValue: String  // con valor por defecto
  placeholder: String
  size: String
```

emits: error-change, update:country, update:modelValue

## Popover

```ts
  align: String  // con valor por defecto
  defaultOpen: Boolean
  id: String
  label: String
  open: Boolean  // con valor por defecto
  side: String  // con valor por defecto
  title: String
```

emits: update:open

## PowerGridIcon

```ts
  title: String
```

## PriceChart

```ts
  date: String
  decimals: Number  // con valor por defecto
  description: String
  height: Number | String
  holidays: Array
  interactive: Boolean  // con valor por defecto
  legend: Boolean  // con valor por defecto
  locale: String
  now: String
  periods: Array
  prices: Array  // obligatoria
  summary: Boolean  // con valor por defecto
  title: String
  unit: String  // con valor por defecto
```

## priceExtremes

function

## priceSlots

function

## Progress

```ts
  label: String
  max: Number  // con valor por defecto
  showLabel: Boolean
  showValue: Boolean
  size: String
  steps: Number
  tone: String
  value: Number  // con valor por defecto
```

## RadioGroup

```ts
  defaultValue: String  // con valor por defecto
  disabled: Boolean
  label: String  // obligatoria
  modelValue: String
  name: String
  options: Array  // obligatoria
  orientation: String  // con valor por defecto
  required: Boolean
  variant: String  // con valor por defecto
```

emits: update:modelValue

## SearchInput

```ts
  clearLabel: String
  defaultValue: String  // con valor por defecto
  disabled: Boolean
  id: String
  invalid: Boolean  // con valor por defecto
  label: String
  loading: Boolean
  modelValue: String  // con valor por defecto
  placeholder: String
  readonly: Boolean
  required: Boolean  // con valor por defecto
  size: String
```

emits: clear, update:modelValue

## SegmentedControl

```ts
  block: Boolean
  defaultValue: String
  disabled: Boolean
  label: String  // obligatoria
  modelValue: String
  name: String
  options: Array  // obligatoria
  size: String
```

emits: update:modelValue

## Select

```ts
  id: String
  invalid: Boolean  // con valor por defecto
  modelValue: String
  required: Boolean  // con valor por defecto
  size: String
  variant: String
```

emits: update:modelValue

## Separator

```ts
  decorative: Boolean  // con valor por defecto
  label: String
  orientation: String  // con valor por defecto
```

## Sheet

```ts
  closeLabel: String
  closeOnEscape: Boolean  // con valor por defecto
  closeOnOutside: Boolean  // con valor por defecto
  defaultOpen: Boolean
  description: String
  fullscreen: Boolean
  header: Boolean  // con valor por defecto
  modal: Boolean  // con valor por defecto
  open: Boolean  // con valor por defecto
  side: String  // con valor por defecto
  title: String  // obligatoria
```

emits: update:open

## Skeleton

```ts
  circle: Boolean
  height: String | Number  // con valor por defecto
  width: String | Number  // con valor por defecto
```

## Slider

```ts
  defaultValue: Number  // con valor por defecto
  formatValue: Function
  id: String
  invalid: Boolean  // con valor por defecto
  label: String
  locale: String
  marks: Array
  max: Number  // con valor por defecto
  min: Number  // con valor por defecto
  modelValue: Number  // con valor por defecto
  required: Boolean  // con valor por defecto
  showValue: Boolean
  step: Number  // con valor por defecto
  unit: String
```

emits: update:modelValue

## SolarPanelIcon

```ts
  title: String
```

## Sparkline

```ts
  area: Boolean
  data: Array  // obligatoria
  height: Number  // con valor por defecto
  label: String
  tone: String
```

## sparklineClass

function

## Spinner

```ts
  decorative: Boolean
  label: String
  size: String
```

## Stack

```ts
  align: String
  as: String | Object | Function  // con valor por defecto
  direction: String
  gap: String | Number
  justify: String
  wrap: Boolean
```

## stackClass

function

## Status

```ts
  progress: String
  pulse: Boolean
  tone: String
```

## Stepper

```ts
  interactive: Boolean
  items: Array  // obligatoria
  label: String
  modelValue: String  // obligatoria
```

emits: update:modelValue

## Switch

```ts
  description: String
  label: String
  modelValue: Boolean  // con valor por defecto
```

emits: update:modelValue

## Table

```ts
  caption: String
  compact: Boolean
  plain: Boolean
```

## Tabs

```ts
  defaultValue: String
  items: Array  // obligatoria
  label: String  // obligatoria
  modelValue: String
  variant: String  // con valor por defecto
```

emits: update:modelValue

## Tag

```ts
  disabled: Boolean
  label: String
  removable: Boolean
  removeLabel: String
  size: String
```

emits: remove

## tariffPeriod

function

## Text

```ts
  as: String | Object | Function  // con valor por defecto
  numeric: Boolean
  size: String
  tone: String
  truncate: Boolean
  weight: String
```

## Textarea

```ts
  id: String
  invalid: Boolean  // con valor por defecto
  modelValue: String
  required: Boolean  // con valor por defecto
```

emits: update:modelValue

## textClass

function

## Timeline

```ts
  items: Array  // obligatoria
  label: String
```

## TimePicker

```ts
  defaultValue: String  // con valor por defecto
  disabled: Boolean
  id: String
  invalid: Boolean  // con valor por defecto
  label: String
  max: String
  min: String
  modelValue: String  // con valor por defecto
  name: String
  placeholder: String
  required: Boolean  // con valor por defecto
  size: String
  step: Number  // con valor por defecto
```

emits: error-change, update:modelValue

## toast

function

## Toast

```ts
  dismissLabel: String
  duration: Number  // con valor por defecto
  open: Boolean
  role: String  // con valor por defecto
  title: String  // obligatoria
  tone: String  // con valor por defecto
```

emits: update:open

## Toaster

```ts
  label: String
  max: Number  // con valor por defecto
```

## ToggleGroup

```ts
  defaultValue: String | Array
  disabled: Boolean
  iconOnly: Boolean
  label: String  // obligatoria
  modelValue: String | Array
  options: Array  // obligatoria
  size: String
  type: String  // con valor por defecto
```

emits: update:modelValue

## Tooltip

```ts
  content: String
  label: String
  shortcut: Array
```

## useField

function

## useGrado

function

## WallboxIcon

```ts
  title: String
```
