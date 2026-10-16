# API de @1k5-tech-es/grado-react

Generado por `npm run api`. Si cambia sin querer, alguien ha cambiado la API pública.

Tipos exportados: AccordionItem, AccordionProps, ActionBarProps, AddressInputProps, AddressOption, AddressValue, AlertProps, AppLogoProps, AppSearchProps, AppShellProps, AvatarGroupProps, AvatarItem, AvatarProps, BadgeProps, BannerProps, BannerTone, BarChartProps, BreadcrumbItem, BreadcrumbsProps, ButtonProps, CalendarProps, CardDescriptionProps, CardProps, CardSectionProps, CardTitleProps, ChartPoint, ChartSeries, CheckboxProps, ChoiceOption, ComboboxProps, CommandGroup, CommandItem, CommandPaletteProps, ContainerProps, ContainerSize, ContextMenuProps, CopyButtonProps, DataColumn, DataTableProps, DatePickerProps, DateRangePickerProps, DateRangeValue, DescriptionItem, DescriptionLayout, DescriptionListItem, DescriptionListProps, DialogProps, DonutProps, DonutSegment, DonutSlice, DrawerProps, DropdownMenuProps, EmptyStateProps, EnergyFlowDirection, EnergyFlowProps, EnergyNode, EnergyNodeName, EnergyNodeState, FieldProps, FileUploadProps, FilterBarProps, FilterChipProps, FilterItem, GradoProviderProps, GridColumns, GridMinItemWidth, GridProps, HeadingLevel, HeadingProps, HeadingSize, IbanInputProps, IconButtonProps, IconButtonVariant, IconComponent, InputProps, KbdProps, KpiGroupProps, KpiProps, LineChartProps, LinkProps, LinkTone, LinkUnderline, MenuItem, MessageKey, Messages, MeterLevel, MeterLevelName, MeterProps, MeterVariant, MultiSelectProps, NavGroupProps, NavItemProps, NavProps, NavSectionProps, NifInputProps, NifKind, NumberInputProps, PageHeaderProps, PaginationProps, PasswordInputProps, PhoneCountry, PhoneCountryCode, PhoneInputProps, PopoverAlign, PopoverProps, PopoverSide, ProgressProps, ProgressState, ProgressTone, RadioGroupProps, RowStatusTone, SearchInputProps, SegmentedControlProps, SelectProps, SeparatorOrientation, SeparatorProps, SkeletonProps, SliderMark, SliderProps, SmallSize, SortState, SpaceStep, SparklineProps, SparklineTone, SpinnerProps, StackAlign, StackDirection, StackJustify, StackProps, StatusProps, StatusTone, StepItem, StepperProps, SwitchProps, TabItem, TableProps, TabsProps, TagProps, TextareaProps, TextProps, TextSize, TextTone, TextWeight, TimelineItem, TimelineProps, TimePickerProps, ToastAction, ToasterProps, ToastFunction, ToastItem, ToastOptions, ToastPromiseMessages, ToastProps, ToggleGroupProps, ToggleOption, TooltipProps, UploadItem

## Accordion

ref: HTMLDivElement

```ts
  className?: string
  defaultValue?: string[]
  items: AccordionItem[]
  multiple?: boolean
  onValueChange?: ((value: string[]) => void)
  value?: string[]
```

## ActionBar

ref: HTMLDivElement

```ts
  children?: ReactNode
  className?: string
  clearLabel?: string
  count: number
  inline?: boolean
  label?: string
  onClear?: (() => void)
```

## AddressInput

ref: HTMLInputElement

```ts
  className?: string
  debounce?: number
  defaultValue?: AddressOption | null
  disabled?: boolean
  emptyLabel?: string
  id?: string
  invalid?: boolean
  label?: string
  minChars?: number
  name?: string
  onQueryChange?: ((query: string) => void)
  onValueChange?: ((value: AddressOption | null) => void)
  placeholder?: string
  required?: boolean
  size?: Size
  suggest: (query: string) => Promise<AddressOption[]>
  value?: AddressOption | null
```

## Alert

ref: HTMLDivElement

```ts
  action?: ReactNode
  children?: ReactNode
  className?: string
  dismissLabel?: string
  onDismiss?: (() => void)
  role?: "status" | "alert" | "none"
  title: ReactNode
  tone?: StatusTone
```

## AlertDialog

ref: HTMLDialogElement

```ts
  children?: ReactNode
  className?: string
  closeLabel?: string
  closeOnOutside?: boolean
  defaultOpen?: boolean
  description?: ReactNode
  footer?: ReactNode
  onOpenChange?: ((open: boolean) => void)
  open?: boolean
  title: ReactNode
```

## AppLogo

ref: SVGSVGElement

```ts
  className?: string
  label?: string
```

## AppSearch

ref: HTMLButtonElement · admite además los atributos HTML de ese elemento

```ts
  label?: string
  shortcut?: string
```

## AppShell

ref: HTMLDivElement · admite además los atributos HTML de ese elemento

```ts
  actions?: ReactNode
  banner?: ReactNode
  brand?: ReactNode
  collapsed?: boolean
  mainId?: string
  menuLabel?: string
  product?: ReactNode
  search?: ReactNode
  sidebar?: ReactNode
  sidebarFooter?: ReactNode
  skipLabel?: string
```

## AreaChart

ref: HTMLElement

```ts
  area?: boolean
  categoryKey: keyof T & string
  categoryLabel?: string
  className?: string
  data: T[]
  decimals?: number
  description?: ReactNode
  height?: string | number
  legend?: boolean
  locale?: string
  series: ChartSeries[]
  title?: ReactNode
  unit?: string
```

## Avatar

ref: HTMLSpanElement · admite además los atributos HTML de ese elemento

```ts
  initials?: string
  name?: string
  size?: Size
  src?: string
  status?: AvatarStatus
```

## AvatarGroup

ref: HTMLDivElement · admite además los atributos HTML de ese elemento

```ts
  items: AvatarItem[]
  max?: number
  size?: Size
```

## Badge

ref: HTMLSpanElement · admite además los atributos HTML de ese elemento

```ts
  icon?: IconComponent
  tone?: BadgeTone
```

## badgeClass

```ts
(options?: { tone?: BadgeTone; }) => string
```

## Banner

ref: HTMLDivElement

```ts
  action?: ReactNode
  children?: ReactNode
  className?: string
  dismissLabel?: string
  onDismiss?: (() => void)
  role?: "status" | "alert" | "none"
  title: ReactNode
  tone?: BannerTone
```

## BarChart

ref: HTMLElement

```ts
  categoryKey: keyof T & string
  categoryLabel?: string
  className?: string
  data: T[]
  decimals?: number
  description?: ReactNode
  height?: string | number
  legend?: boolean
  locale?: string
  series: ChartSeries[]
  stacked?: boolean
  title?: ReactNode
  unit?: string
```

## Breadcrumbs

ref: HTMLElement

```ts
  className?: string
  items: BreadcrumbItem[]
  label?: string
```

## Button

ref: HTMLButtonElement · admite además los atributos HTML de ese elemento

```ts
  block?: boolean
  icon?: IconComponent
  iconOnly?: boolean
  loading?: boolean
  size?: Size
  variant?: ButtonVariant
```

## buttonClass

```ts
(options?: { variant?: ButtonVariant; size?: Size; iconOnly?: boolean; block?: boolean; }) => string
```

## Calendar

ref: HTMLDivElement

```ts
  className?: string
  defaultMonth?: string
  defaultValue?: string | DateRangeValue
  label?: string
  locale?: string
  max?: string
  min?: string
  mode?: "single" | "range"
  month?: string
  onMonthChange?: ((month: string) => void)
  onValueChange?: ((value: string) => void) | ((value: DateRangeValue) => void)
  plain?: boolean
  today?: string
  value?: string | DateRangeValue
  weekStartsOn?: number
```

## Card

ref: HTMLDivElement · admite además los atributos HTML de ese elemento

```ts
  variant?: CardVariant
```

## CardContent

ref: HTMLDivElement · admite además los atributos HTML de ese elemento

```ts
  (sin props propias)
```

## CardDescription

ref: HTMLParagraphElement · admite además los atributos HTML de ese elemento

```ts
  (sin props propias)
```

## CardFooter

ref: HTMLDivElement · admite además los atributos HTML de ese elemento

```ts
  (sin props propias)
```

## CardHeader

ref: HTMLDivElement · admite además los atributos HTML de ese elemento

```ts
  (sin props propias)
```

## CardTitle

ref: HTMLHeadingElement · admite además los atributos HTML de ese elemento

```ts
  as?: "h2" | "h3" | "h4"
```

## Checkbox

ref: HTMLInputElement · admite además los atributos HTML de ese elemento

```ts
  description?: ReactNode
  indeterminate?: boolean
  label?: ReactNode
  onCheckedChange?: ((checked: boolean) => void)
```

## Combobox

ref: HTMLInputElement

```ts
  className?: string
  defaultValue?: string
  disabled?: boolean
  emptyLabel?: string
  id?: string
  label?: string
  loading?: boolean
  name?: string
  onQueryChange?: ((query: string) => void)
  onValueChange?: ((value: string) => void)
  options: ChoiceOption[]
  placeholder?: string
  required?: boolean
  value?: string
```

## CommandPalette

ref: HTMLDialogElement

```ts
  className?: string
  defaultOpen?: boolean
  emptyLabel?: string
  groups: CommandGroup[]
  hotkey?: string | false
  label?: string
  onOpenChange?: ((open: boolean) => void)
  onQueryChange?: ((query: string) => void)
  onSelect?: ((id: string) => void)
  open?: boolean
  placeholder?: string
```

## Container

ref: HTMLElement · admite además los atributos HTML de ese elemento

```ts
  as?: ElementType
  padded?: boolean
  size?: ContainerSize
```

## containerClass

```ts
(options?: { size?: ContainerSize; padded?: boolean; }) => string
```

## ContextMenu

ref: HTMLDivElement

```ts
  children?: ReactNode
  className?: string
  disabled?: boolean
  items: MenuItem[]
  label?: string
  onAction?: ((id: string) => void)
```

## CopyButton

ref: HTMLButtonElement · admite además los atributos HTML de ese elemento

```ts
  copiedLabel?: string
  iconOnly?: boolean
  label?: string
  onCopy?: ((value: string) => void)
  size?: Size
  value: string
```

## cx

```ts
(...parts: unknown[]) => string
```

## DataTable

ref: HTMLDivElement

```ts
  caption: string
  className?: string
  columns: DataColumn<T>[]
  defaultSort?: SortState | null
  emptyLabel?: string
  error?: string
  loading?: boolean
  onPageChange?: ((page: number) => void)
  onSelectionChange?: ((keys: string[]) => void)
  onSortChange?: ((sort: SortState) => void)
  page?: number
  pageSize?: number
  rowActions?: ((row: T) => ReactNode)
  rowKey: (keyof T & string) | ((row: T) => string)
  rows: T[]
  selectable?: boolean
  selectedKeys?: string[]
  sort?: SortState | null
```

## DatePicker

ref: HTMLInputElement · admite además los atributos HTML de ese elemento

```ts
  onValueChange?: ((value: string) => void)
  size?: "sm" | "md" | "lg"
```

## DateRangePicker

ref: HTMLFieldSetElement

```ts
  className?: string
  defaultValue?: DateRangeValue
  disabled?: boolean
  label: string
  max?: string
  min?: string
  name?: string
  onValueChange?: ((value: DateRangeValue) => void)
  required?: boolean
  value?: DateRangeValue
```

## DEFAULT_LOCALE

```ts
"es-ES"
```

## DescriptionList

ref: HTMLDListElement · admite además los atributos HTML de ese elemento

```ts
  items: DescriptionListItem[]
  layout?: DescriptionLayout
```

## Dialog

ref: HTMLDialogElement

```ts
  children?: ReactNode
  className?: string
  closeLabel?: string
  closeOnOutside?: boolean
  defaultOpen?: boolean
  description?: ReactNode
  footer?: ReactNode
  onOpenChange?: ((open: boolean) => void)
  open?: boolean
  title: ReactNode
```

## Donut

ref: HTMLDivElement

```ts
  centerLabel?: ReactNode
  centerValue?: ReactNode
  className?: string
  decimals?: number
  label?: string
  legend?: boolean
  locale?: string
  max?: number
  segments?: DonutSegment[]
  size?: Size
  tone?: 1 | 2 | 3 | 4 | 5
  unit?: string
  value?: number
```

## donutClass

```ts
(options?: { size?: Size; }) => string
```

## Drawer

ref: HTMLDialogElement

```ts
  children?: ReactNode
  className?: string
  closeLabel?: string
  closeOnOutside?: boolean
  defaultOpen?: boolean
  description?: ReactNode
  footer?: ReactNode
  onOpenChange?: ((open: boolean) => void)
  open?: boolean
  side?: "left" | "right"
  title: ReactNode
```

## DropdownMenu

ref: HTMLDivElement

```ts
  align?: "start" | "end"
  className?: string
  disabled?: boolean
  items: MenuItem[]
  label: string
  onAction?: ((id: string) => void)
```

## EmptyState

ref: HTMLDivElement · admite además los atributos HTML de ese elemento

```ts
  action?: ReactNode
  compact?: boolean
  description?: ReactNode
  icon?: IconComponent
  title?: ReactNode
```

## EnergyFlow

ref: HTMLElement

```ts
  battery?: number
  batteryLevel?: number
  className?: string
  decimals?: number
  grid?: number
  home: number
  locale?: string
  solar: number
  title?: string
  unit?: string
```

## energyLineClass

```ts
(node: EnergyNodeName, flow?: EnergyFlowDirection) => string
```

## energyNodeClass

```ts
(node: EnergyNodeName, flow?: EnergyFlowDirection) => string
```

## Field

ref: HTMLDivElement

```ts
  children: ReactNode
  className?: string
  error?: ReactNode
  hint?: ReactNode
  id?: string
  label?: ReactNode
  required?: boolean
```

## FileUpload

ref: HTMLDivElement

```ts
  accept?: string
  className?: string
  disabled?: boolean
  files?: UploadItem[]
  hint?: string
  label?: string
  maxSize?: number
  multiple?: boolean
  onFilesChange?: ((files: File[]) => void)
  onReject?: ((errors: string[]) => void)
  onRemove?: ((id: string) => void)
  onRetry?: ((id: string) => void)
```

## FilterBar

ref: HTMLDivElement

```ts
  children?: ReactNode
  className?: string
  filters?: FilterItem[]
  label?: string
  onClear?: (() => void)
  onQueryChange?: ((query: string) => void)
  onRemoveFilter?: ((id: string) => void)
  placeholder?: string
  query?: string
```

## FilterChip

ref: HTMLSpanElement

```ts
  className?: string
  label: string
  onRemove?: (() => void)
```

## formatMessage

```ts
(template: string, values?: Record<string, string | number | null | undefined>) => string
```

## gapClass

```ts
(gap?: SpaceStep | number) => string
```

## GradoProvider

ref: sin ref

```ts
  children?: ReactNode
  locale?: string
  messages?: Partial<Messages>
```

## Grid

ref: HTMLElement · admite además los atributos HTML de ese elemento

```ts
  as?: ElementType
  columns?: GridColumns
  gap?: SpaceStep
  minItemWidth?: GridMinItemWidth
```

## gridClass

```ts
(options?: { columns?: GridColumns; gap?: SpaceStep | number; minItemWidth?: GridMinItemWidth; }) => string
```

## Heading

ref: HTMLHeadingElement · admite además los atributos HTML de ese elemento

```ts
  as?: ElementType
  level: HeadingLevel
  size?: HeadingSize
```

## headingClass

```ts
(options?: { level?: HeadingLevel | number | string; size?: HeadingSize; }) => string
```

## IbanInput

ref: HTMLInputElement · admite además los atributos HTML de ese elemento

```ts
  defaultValue?: string
  invalid?: boolean
  onErrorChange?: ((message: string) => void)
  onValueChange?: ((value: string) => void)
  size?: Size
  value?: string
```

## IconButton

ref: HTMLButtonElement · admite además los atributos HTML de ese elemento

```ts
  defaultPressed?: boolean
  icon: IconComponent
  label: string
  onPressedChange?: ((pressed: boolean) => void)
  pressed?: boolean
  size?: Size
  variant?: IconButtonVariant
```

## Input

ref: HTMLInputElement · admite además los atributos HTML de ese elemento

```ts
  invalid?: boolean
  prefix?: ReactNode
  size?: Size
  suffix?: ReactNode
```

## Kbd

ref: HTMLElement · admite además los atributos HTML de ese elemento

```ts
  keys?: string[]
```

## Kpi

ref: HTMLElement · admite además los atributos HTML de ese elemento

```ts
  better?: KpiBetter
  change?: number | null
  children?: ReactNode
  hint?: ReactNode
  label: ReactNode
  locale?: string
  previous?: ReactNode
  previousLabel?: string
  selectable?: boolean
  selected?: boolean
  tone?: KpiTone
  trend?: number[]
  value: ReactNode
```

## KpiGroup

ref: HTMLDivElement · admite además los atributos HTML de ese elemento

```ts
  label?: string
```

## LineChart

ref: HTMLElement

```ts
  area?: boolean
  categoryKey: keyof T & string
  categoryLabel?: string
  className?: string
  data: T[]
  decimals?: number
  description?: ReactNode
  height?: string | number
  legend?: boolean
  locale?: string
  series: ChartSeries[]
  title?: ReactNode
  unit?: string
```

## Link

ref: HTMLAnchorElement

```ts
  as?: C
  children?: ReactNode
  className?: string
  external?: boolean
  tone?: LinkTone
  underline?: LinkUnderline
```

## MESSAGES

```ts
Record<LocaleName, Messages>
```

## messagesFor

```ts
(locale?: string, overrides?: Partial<Messages>) => Messages
```

## Meter

ref: HTMLDivElement

```ts
  className?: string
  decimals?: number
  high?: number
  label?: string
  locale?: string
  low?: number
  max?: number
  min?: number
  optimum?: number
  segments?: number
  showValue?: boolean
  unit?: string
  value: number
  valueText?: string
  variant?: MeterVariant
```

## meterClass

```ts
(options?: { variant?: MeterVariant; level?: MeterLevelName; }) => string
```

## MultiSelect

ref: HTMLInputElement

```ts
  className?: string
  defaultValue?: string[]
  disabled?: boolean
  emptyLabel?: string
  id?: string
  label?: string
  loading?: boolean
  name?: string
  onQueryChange?: ((query: string) => void)
  onValueChange?: ((value: string[]) => void)
  options: ChoiceOption[]
  placeholder?: string
  required?: boolean
  value?: string[]
```

## Nav

ref: HTMLElement · admite además los atributos HTML de ese elemento

```ts
  label?: string
```

## NavGroup

ref: HTMLDivElement

```ts
  active?: boolean
  badge?: ReactNode
  children?: ReactNode
  className?: string
  defaultOpen?: boolean
  icon?: IconComponent
  label: string
  onOpenChange?: ((open: boolean) => void)
  open?: boolean
```

## NavItem

ref: HTMLAnchorElement

```ts
  active?: boolean
  as?: C
  badge?: ReactNode
  className?: string
  icon?: IconComponent
  label: string
```

## NavSection

ref: HTMLDivElement · admite además los atributos HTML de ese elemento

```ts
  title?: ReactNode
```

## NifInput

ref: HTMLInputElement · admite además los atributos HTML de ese elemento

```ts
  defaultValue?: string
  invalid?: boolean
  onErrorChange?: ((message: string) => void)
  onValueChange?: ((value: string) => void)
  size?: Size
  value?: string
```

## NumberInput

ref: HTMLInputElement · admite además los atributos HTML de ese elemento

```ts
  decimals?: number
  decrementLabel?: string
  defaultValue?: number | null
  hideSteppers?: boolean
  incrementLabel?: string
  invalid?: boolean
  locale?: string
  max?: number
  min?: number
  onValueChange?: ((value: number | null) => void)
  prefix?: ReactNode
  size?: Size
  step?: number
  suffix?: ReactNode
  value?: number | null
```

## PageHeader

ref: HTMLElement · admite además los atributos HTML de ese elemento

```ts
  actions?: ReactNode
  as?: "h2" | "h1"
  subtitle?: ReactNode
  title: ReactNode
```

## Pagination

ref: HTMLElement

```ts
  className?: string
  defaultPage?: number
  label?: string
  onPageChange?: ((page: number) => void)
  page?: number
  pageSize?: number
  total: number
```

## PasswordInput

ref: HTMLInputElement · admite además los atributos HTML de ese elemento

```ts
  autoComplete?: string
  defaultValue?: string
  hideLabel?: string
  invalid?: boolean
  onValueChange?: ((value: string) => void)
  showLabel?: string
  size?: Size
  value?: string
```

## PhoneInput

ref: HTMLInputElement · admite además los atributos HTML de ese elemento

```ts
  countries?: PhoneCountryCode[]
  country?: PhoneCountryCode
  countryLabel?: string
  defaultCountry?: PhoneCountryCode
  defaultValue?: string
  invalid?: boolean
  onCountryChange?: ((country: PhoneCountryCode) => void)
  onErrorChange?: ((message: string) => void)
  onValueChange?: ((value: string) => void)
  size?: Size
  value?: string
```

## Popover

ref: HTMLDivElement

```ts
  align?: PopoverAlign
  children?: ReactNode
  className?: string
  defaultOpen?: boolean
  id?: string
  label?: string
  onOpenChange?: ((open: boolean) => void)
  open?: boolean
  side?: PopoverSide
  title?: ReactNode
  trigger?: ReactElement<unknown, string | React.JSXElementConstructor<any>>
```

## Progress

ref: HTMLDivElement · admite además los atributos HTML de ese elemento

```ts
  label?: string
  max?: number
  showLabel?: boolean
  showValue?: boolean
  size?: SmallSize
  steps?: number
  tone?: ProgressTone
  value?: number | null
```

## RadioGroup

ref: HTMLFieldSetElement

```ts
  className?: string
  defaultValue?: string
  disabled?: boolean
  label: string
  name?: string
  onValueChange?: ((value: string) => void)
  options: ChoiceOption[]
  orientation?: "horizontal" | "vertical"
  required?: boolean
  value?: string
```

## SearchInput

ref: HTMLInputElement · admite además los atributos HTML de ese elemento

```ts
  clearLabel?: string
  defaultValue?: string
  invalid?: boolean
  label?: string
  loading?: boolean
  onClear?: (() => void)
  onValueChange?: ((value: string) => void)
  size?: Size
  value?: string
```

## SegmentedControl

ref: HTMLDivElement

```ts
  block?: boolean
  className?: string
  defaultValue?: string
  disabled?: boolean
  label: string
  name?: string
  onValueChange?: ((value: string) => void)
  options: ChoiceOption[]
  size?: Size
  value?: string
```

## Select

ref: HTMLSelectElement · admite además los atributos HTML de ese elemento

```ts
  invalid?: boolean
  size?: Size
```

## Separator

ref: HTMLDivElement · admite además los atributos HTML de ese elemento

```ts
  decorative?: boolean
  label?: string
  orientation?: SeparatorOrientation
```

## Sheet

ref: HTMLDialogElement

```ts
  children?: ReactNode
  className?: string
  closeLabel?: string
  closeOnOutside?: boolean
  defaultOpen?: boolean
  description?: ReactNode
  footer?: ReactNode
  onOpenChange?: ((open: boolean) => void)
  open?: boolean
  side?: "left" | "right"
  title: ReactNode
```

## Skeleton

ref: HTMLSpanElement · admite además los atributos HTML de ese elemento

```ts
  circle?: boolean
  height?: Property.Height<string | number>
  width?: Property.Width<string | number>
```

## Slider

ref: HTMLInputElement · admite además los atributos HTML de ese elemento

```ts
  defaultValue?: number
  formatValue?: ((value: number) => string)
  invalid?: boolean
  label?: string
  locale?: string
  marks?: SliderMark[]
  max?: number
  min?: number
  onValueChange?: ((value: number) => void)
  showValue?: boolean
  step?: number
  unit?: string
  value?: number
```

## Sparkline

ref: HTMLSpanElement

```ts
  area?: boolean
  className?: string
  data: number[]
  height?: number
  label?: string
  tone?: SparklineTone
```

## sparklineClass

```ts
(options?: { tone?: SparklineTone; }) => string
```

## Spinner

ref: HTMLSpanElement · admite además los atributos HTML de ese elemento

```ts
  decorative?: boolean
  label?: string
  size?: Size
```

## Stack

ref: HTMLElement · admite además los atributos HTML de ese elemento

```ts
  align?: StackAlign
  as?: ElementType
  direction?: StackDirection
  gap?: SpaceStep
  justify?: StackJustify
  wrap?: boolean
```

## stackClass

```ts
(options?: { direction?: StackDirection; gap?: SpaceStep | number; align?: StackAlign; justify?: StackJustify; wrap?: boolean; }) => string
```

## Status

ref: HTMLSpanElement · admite además los atributos HTML de ese elemento

```ts
  pulse?: boolean
  tone?: RowStatusTone
```

## Stepper

ref: HTMLOListElement

```ts
  className?: string
  items: StepItem[]
  label?: string
  onValueChange?: ((value: string) => void)
  value: string
```

## Switch

ref: HTMLInputElement · admite además los atributos HTML de ese elemento

```ts
  description?: ReactNode
  label?: ReactNode
  onCheckedChange?: ((checked: boolean) => void)
```

## Table

ref: HTMLTableElement · admite además los atributos HTML de ese elemento

```ts
  caption?: ReactNode
  compact?: boolean
  plain?: boolean
```

## Tabs

ref: HTMLDivElement

```ts
  className?: string
  defaultValue?: string
  items: TabItem[]
  label: string
  onValueChange?: ((value: string) => void)
  value?: string
  variant?: "line" | "pill"
```

## Tag

ref: HTMLSpanElement · admite además los atributos HTML de ese elemento

```ts
  children?: ReactNode
  disabled?: boolean
  label?: string
  onRemove?: (() => void)
  removeLabel?: string
  size?: SmallSize
```

## Text

ref: HTMLElement · admite además los atributos HTML de ese elemento

```ts
  as?: ElementType
  numeric?: boolean
  size?: TextSize
  tone?: TextTone
  truncate?: boolean
  weight?: TextWeight
```

## Textarea

ref: HTMLTextAreaElement · admite además los atributos HTML de ese elemento

```ts
  invalid?: boolean
```

## textClass

```ts
(options?: { size?: TextSize; tone?: TextTone; weight?: TextWeight; truncate?: boolean; numeric?: boolean; }) => string
```

## Timeline

ref: HTMLOListElement

```ts
  className?: string
  items: TimelineItem[]
  label?: string
```

## TimePicker

ref: HTMLInputElement

```ts
  className?: string
  defaultValue?: string
  disabled?: boolean
  id?: string
  invalid?: boolean
  label?: string
  max?: string
  min?: string
  name?: string
  onErrorChange?: ((message: string) => void)
  onValueChange?: ((value: string) => void)
  placeholder?: string
  required?: boolean
  size?: Size
  step?: number
  value?: string
```

## toast

```ts
ToastFunction
```

## Toast

ref: HTMLDivElement

```ts
  action?: ReactNode
  children?: ReactNode
  className?: string
  dismissLabel?: string
  duration?: number
  onOpenChange: (open: boolean) => void
  open: boolean
  role?: "status" | "alert" | "none"
  title: ReactNode
  tone?: StatusTone
```

## Toaster

ref: HTMLElement

```ts
  className?: string
  label?: string
  max?: number
```

## ToggleGroup

ref: HTMLDivElement

```ts
  className?: string
  defaultValue?: string | string[]
  disabled?: boolean
  iconOnly?: boolean
  label: string
  onValueChange?: ((value: string) => void) | ((value: string[]) => void)
  options: ToggleOption[]
  size?: Size
  type?: "single" | "multiple"
  value?: string | string[]
```

## Tooltip

ref: HTMLSpanElement

```ts
  children?: ReactNode
  className?: string
  content: ReactNode
  label: string
```

## useField

```ts
() => FieldContextValue | null
```

## useGrado

```ts
() => GradoContextValue
```
