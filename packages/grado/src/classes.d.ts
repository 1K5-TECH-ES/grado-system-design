export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'destructive' | 'link'
export type Size = 'sm' | 'md' | 'lg'
export type BadgeTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'highlight'
export type CardVariant = 'panel' | 'alert' | 'plain'
export type ControlKind = 'input' | 'select' | 'textarea'
export type KpiBetter = 'higher' | 'lower' | 'neutral'
export type KpiTone = 'default' | 'danger'
export type TrendDirection = 'up' | 'down' | 'flat'
export interface KpiTrend {
  tone: 'good' | 'bad' | 'flat'
  direction: TrendDirection
}

export declare const BUTTON_VARIANTS: readonly ButtonVariant[]
export declare const SIZES: readonly Size[]
export declare const BADGE_TONES: readonly BadgeTone[]
export declare const CARD_VARIANTS: readonly CardVariant[]

export declare function cx(...parts: unknown[]): string
export declare function buttonClass(options?: { variant?: ButtonVariant; size?: Size; iconOnly?: boolean; block?: boolean }): string
export declare function badgeClass(options?: { tone?: BadgeTone }): string
export declare function controlClass(kind?: ControlKind, options?: { size?: Size }): string
export declare function inputWrapClass(options?: { size?: Size }): string
export declare function cardClass(options?: { variant?: CardVariant }): string
export declare function tableClass(options?: { compact?: boolean }): string
export declare function tableWrapClass(options?: { plain?: boolean }): string
export declare function spinnerClass(options?: { size?: Size }): string
export declare function emptyClass(options?: { compact?: boolean }): string
export declare function kpiClass(options?: { tone?: KpiTone }): string
export declare function kpiTrend(change: number | null | undefined, better?: KpiBetter): KpiTrend | null
export declare function formatChange(change: number, locale?: string): string
export declare const TREND_LABELS: Record<TrendDirection, string>
export declare const ARROW_PATHS: Record<TrendDirection, string[]>
export declare const ICON_ATTRS: Record<string, string>

export type AvatarStatus = 'online' | 'away' | 'busy'
export declare const SIDEBAR_ID: string
export declare const AVATAR_STATUSES: readonly AvatarStatus[]
export declare function appShellClass(options?: { collapsed?: boolean; navOpen?: boolean }): string
export declare function avatarClass(options?: { size?: Size }): string
export declare function initials(name?: string): string
export declare const LOGO: { viewBox: string; letters: string[]; ring: string }
export type IconName =
  | 'search'
  | 'menu'
  | 'chevronRight'
  | 'chevronLeft'
  | 'chevronDown'
  | 'chevronsUpDown'
  | 'arrowUp'
  | 'arrowDown'
  | 'x'
  | 'check'
  | 'info'
  | 'circleCheck'
  | 'circleAlert'
  | 'triangleAlert'
  | 'upload'
  | 'file'
  | 'minus'
  | 'plus'
export declare const ICON_PATHS: Record<IconName, string[]>
export declare const STATUS_ICONS: Record<'info' | 'success' | 'warning' | 'danger', IconName>
export declare const AVATAR_STATUS_LABELS: Record<AvatarStatus, string>

// ---------- Datos y piezas (0.3) ----------
export type RowStatusTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger'
export type ProgressTone = 'brand' | 'success' | 'warning' | 'danger'
export type SmallSize = 'sm' | 'md'
export type DescriptionLayout = 'columns' | 'stacked'
export type LinkTone = 'default' | 'muted'
export type LinkUnderline = 'hover' | 'always'
export type SeparatorOrientation = 'horizontal' | 'vertical'
export declare const STATUS_TONES: readonly RowStatusTone[]
export declare const PROGRESS_TONES: readonly ProgressTone[]
export declare const DESCRIPTION_LAYOUTS: readonly DescriptionLayout[]
export declare const LINK_TONES: readonly LinkTone[]
export declare const LINK_UNDERLINES: readonly LinkUnderline[]
export declare function statusClass(options?: { tone?: RowStatusTone; pulse?: boolean }): string
export declare function progressClass(options?: { tone?: ProgressTone; size?: SmallSize; indeterminate?: boolean; steps?: boolean }): string
export declare function descriptionListClass(options?: { layout?: DescriptionLayout }): string
export declare function copyButtonClass(options?: { size?: Size; iconOnly?: boolean; copied?: boolean }): string
export declare function tagClass(options?: { size?: SmallSize; disabled?: boolean }): string
export declare function avatarGroupClass(options?: { size?: Size }): string
export declare function separatorClass(options?: { orientation?: SeparatorOrientation; label?: boolean }): string
export declare function linkClass(options?: { tone?: LinkTone; underline?: LinkUnderline }): string
export declare const DATA_ICON_PATHS: Record<'copy' | 'externalLink', string[]>

// ---------- Gráficos (0.3) ----------
export type SparklineTone = 'brand' | 'success' | 'danger' | 'neutral'
export type MeterVariant = 'bar' | 'segments'
export type MeterLevelName = 'good' | 'fair' | 'poor' | 'neutral'
export type EnergyNodeName = 'solar' | 'home' | 'battery' | 'grid'
export type EnergyFlowDirection = 'in' | 'out' | 'none'

export declare const SPARKLINE_TONES: readonly SparklineTone[]
export declare const METER_VARIANTS: readonly MeterVariant[]
export declare const METER_LEVELS: readonly MeterLevelName[]
export declare const ENERGY_POSITIONS: Record<EnergyNodeName, 'top' | 'right' | 'bottom' | 'left'>
export declare const ENERGY_ICONS: Record<EnergyNodeName | 'hub' | 'arrow', string[]>

export declare function sparklineClass(options?: { tone?: SparklineTone }): string
export declare function kpiSparklineTone(trend: KpiTrend | null | undefined): SparklineTone
export declare function donutClass(options?: { size?: Size }): string
export declare function meterClass(options?: { variant?: MeterVariant; level?: MeterLevelName }): string
export declare function energyLineClass(node: EnergyNodeName, flow?: EnergyFlowDirection): string
export declare function energyNodeClass(node: EnergyNodeName, flow?: EnergyFlowDirection): string

// ---------- Campos especiales (0.3) ----------
export declare const FIELD_ICON_PATHS: Record<'eye' | 'eyeOff' | 'clock' | 'mapPin', string[]>

// ---------- Superposiciones y acciones (0.3) ----------
export type BannerTone = 'info' | 'success' | 'warning' | 'danger' | 'brand'
export type IconButtonVariant = 'ghost' | 'secondary' | 'primary'
export type PopoverAlign = 'start' | 'center' | 'end'
export type PopoverSide = 'bottom' | 'top'
export declare const BANNER_TONES: BannerTone[]
export declare const ICON_BUTTON_VARIANTS: IconButtonVariant[]
export declare const POPOVER_ALIGNS: PopoverAlign[]
export declare function bannerClass(options?: { tone?: BannerTone }): string
export declare function iconButtonClass(options?: { variant?: IconButtonVariant; size?: Size }): string
export declare function popoverClass(options?: { align?: PopoverAlign; side?: PopoverSide }): string
export declare function actionBarClass(options?: { inline?: boolean }): string
export declare function toggleGroupClass(options?: { size?: Size; iconOnly?: boolean }): string

// ---------- Maquetación y tipografía (0.3) ----------
export type SpaceStep = '0-5' | '1' | '1-5' | '2' | '2-5' | '3' | '3-5' | '4' | '5' | '6' | '8' | '10' | '12' | '16'
export type StackDirection = 'column' | 'row'
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type StackJustify = 'start' | 'center' | 'end' | 'between'
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 'auto'
export type GridMinItemWidth = 'sm' | 'md' | 'lg'
export type ContainerSize = 'sm' | 'md' | 'lg'
export type TextSize = 'caption' | 'small' | 'body' | 'lead'
export type TextTone = 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
export type TextWeight = 'regular' | 'medium' | 'semibold'
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
export type HeadingSize = 'lead' | 'heading' | 'title' | 'display'

export declare const SPACE_STEPS: readonly SpaceStep[]
export declare const STACK_DIRECTIONS: readonly StackDirection[]
export declare const STACK_ALIGNS: readonly StackAlign[]
export declare const STACK_JUSTIFIES: readonly StackJustify[]
export declare const GRID_COLUMNS: readonly GridColumns[]
export declare const GRID_MIN_WIDTHS: readonly GridMinItemWidth[]
export declare const CONTAINER_SIZES: readonly ContainerSize[]
export declare const TEXT_SIZES: readonly TextSize[]
export declare const TEXT_TONES: readonly TextTone[]
export declare const TEXT_WEIGHTS: readonly TextWeight[]
export declare const HEADING_LEVELS: readonly HeadingLevel[]
export declare const HEADING_SIZES: readonly HeadingSize[]

export declare function gapClass(gap?: SpaceStep | number): string
export declare function stackClass(options?: {
  direction?: StackDirection
  gap?: SpaceStep | number
  align?: StackAlign
  justify?: StackJustify
  wrap?: boolean
}): string
export declare function gridClass(options?: { columns?: GridColumns; gap?: SpaceStep | number; minItemWidth?: GridMinItemWidth }): string
export declare function containerClass(options?: { size?: ContainerSize; padded?: boolean }): string
export declare function textClass(options?: {
  size?: TextSize
  tone?: TextTone
  weight?: TextWeight
  truncate?: boolean
  numeric?: boolean
}): string
export declare function headingLevel(level: HeadingLevel | number | string | undefined): HeadingLevel
export declare function headingSize(level: HeadingLevel | number | string | undefined): HeadingSize
export declare function headingClass(options?: { level?: HeadingLevel | number | string; size?: HeadingSize }): string
