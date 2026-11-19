# API de @1k5-tech-es/grado

Generado por `npm run api`. Si cambia sin querer, alguien ha cambiado la API pública.

## dist/tailwind-preset.d.ts

```ts
import type { Config } from 'tailwindcss';
declare const preset: Partial<Config>;
export default preset;
```

## dist/tokens.d.ts

```ts
export type ThemeName = "consola" | "marca" | "campo";
export type ThemeMode = 'light' | 'dark';
export type ColorToken = "background" | "foreground" | "card" | "card-foreground" | "popover" | "popover-foreground" | "primary" | "primary-foreground" | "secondary" | "secondary-foreground" | "muted" | "muted-foreground" | "tertiary-foreground" | "accent" | "accent-foreground" | "destructive" | "destructive-foreground" | "success" | "success-foreground" | "warning" | "warning-foreground" | "warning-strong" | "info" | "info-foreground" | "border" | "input" | "ring" | "header" | "header-foreground" | "brand-pink" | "sidebar" | "sidebar-foreground" | "sidebar-primary" | "sidebar-primary-foreground" | "sidebar-accent" | "sidebar-accent-foreground" | "sidebar-border" | "sidebar-ring" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "primary-text" | "success-text" | "warning-text" | "destructive-text" | "info-text" | "primary-subtle" | "primary-border" | "success-subtle" | "success-border" | "warning-subtle" | "warning-border" | "destructive-subtle" | "destructive-border" | "info-subtle" | "info-border";
export type ShadowToken = "raised" | "overlay" | "popover";
export type SizeToken = "radius" | "control-h-sm" | "control-h" | "control-h-lg" | "radius-panel" | "radius-badge" | "radius-xs" | "radius-sm" | "radius-md" | "radius-lg" | "radius-full" | "text-ui" | "leading-ui" | "row-h" | "text-title-ui" | "leading-title-ui";
export type PaletteName = "aubergine" | "aubergine-75" | "aubergine-50" | "aubergine-25" | "aubergine-10" | "mint" | "mint-75" | "mint-50" | "mint-25" | "mint-10" | "fuchsia" | "fuchsia-75" | "fuchsia-50" | "fuchsia-25" | "fuchsia-10" | "graphite" | "graphite-75" | "graphite-50" | "graphite-25" | "graphite-10" | "white" | "black";
export type BrandName = "aubergine" | "mint" | "fuchsia";
export interface BrandColor {
    hex: string;
    rgb: string;
    cmyk: string;
    pantone: string;
    oracal: string;
    usage: string;
}
export interface ThemeValues {
    color: Record<ColorToken, string>;
    shadow: Record<ShadowToken, string>;
    size: Record<SizeToken, string>;
}
export declare const brand: Record<BrandName, BrandColor>;
export declare const palette: Record<PaletteName, string>;
export type SpaceToken = "1" | "2" | "3" | "4" | "5" | "6" | "8" | "10" | "12" | "16" | "0-5" | "1-5" | "2-5" | "3-5";
export type MotionToken = "duration-fast" | "duration-base" | "duration-slow" | "duration-slower" | "ease-standard" | "ease-out" | "ease-emphasized";
export type LayerToken = "sticky" | "overlay" | "drawer" | "dropdown" | "tooltip" | "toast" | "skip-link";
export type BreakpointToken = "sm" | "md";
export type IconToken = "sm" | "md" | "lg";
export type ContainerToken = "sm" | "md" | "lg";
export type DensityName = "compact" | "comfortable";
export declare const typography: Record<string, string>;
export declare const space: Record<SpaceToken, string>;
export declare const motion: Record<MotionToken, string>;
export declare const z: Record<LayerToken, number>;
export declare const breakpoint: Record<BreakpointToken, string>;
export declare const icon: Record<IconToken, string>;
export declare const container: Record<ContainerToken, string>;
export declare const border: Record<string, string>;
export declare const opacity: Record<string, number>;
export declare const density: Record<DensityName, Partial<Record<SizeToken, string>>>;
export declare const themes: Record<ThemeName, Record<ThemeMode, ThemeValues>>;
declare const tokens: {
    brand: typeof brand;
    palette: typeof palette;
    typography: typeof typography;
    space: typeof space;
    motion: typeof motion;
    z: typeof z;
    breakpoint: typeof breakpoint;
    icon: typeof icon;
    container: typeof container;
    border: typeof border;
    opacity: typeof opacity;
    density: typeof density;
    themes: typeof themes;
};
export default tokens;
```

## src/classes.d.ts

```ts
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'destructive' | 'link';
export type Size = 'sm' | 'md' | 'lg';
export type BadgeTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'highlight';
export type CardVariant = 'panel' | 'alert' | 'plain';
export type ControlKind = 'input' | 'select' | 'textarea';
export type KpiBetter = 'higher' | 'lower' | 'neutral';
export type KpiTone = 'default' | 'danger';
export type TrendDirection = 'up' | 'down' | 'flat';
export interface KpiTrend {
    tone: 'good' | 'bad' | 'flat';
    direction: TrendDirection;
}
export declare const BUTTON_VARIANTS: readonly ButtonVariant[];
export declare const SIZES: readonly Size[];
export declare const BADGE_TONES: readonly BadgeTone[];
export declare const CARD_VARIANTS: readonly CardVariant[];
export declare function cx(...parts: unknown[]): string;
export declare function keyShortcuts(keys?: string[]): string;
export declare function buttonClass(options?: {
    variant?: ButtonVariant;
    size?: Size;
    iconOnly?: boolean;
    block?: boolean;
}): string;
export declare function badgeClass(options?: {
    tone?: BadgeTone;
}): string;
export declare function controlClass(kind?: ControlKind, options?: {
    size?: Size;
}): string;
export declare function inputWrapClass(options?: {
    size?: Size;
}): string;
export declare function cardClass(options?: {
    variant?: CardVariant;
}): string;
export declare function tableClass(options?: {
    compact?: boolean;
}): string;
export declare function tableWrapClass(options?: {
    plain?: boolean;
}): string;
export declare function spinnerClass(options?: {
    size?: Size;
}): string;
export declare function emptyClass(options?: {
    compact?: boolean;
}): string;
export declare function kpiClass(options?: {
    tone?: KpiTone;
}): string;
export declare function kpiTrend(change: number | null | undefined, better?: KpiBetter): KpiTrend | null;
export declare function formatChange(change: number, locale?: string): string;
export declare const TREND_LABELS: Record<TrendDirection, string>;
export declare const ARROW_PATHS: Record<TrendDirection, string[]>;
export declare const ICON_ATTRS: Record<string, string>;
export type AvatarStatus = 'online' | 'away' | 'busy';
export declare const SIDEBAR_ID: string;
export declare const AVATAR_STATUSES: readonly AvatarStatus[];
export declare function appShellClass(options?: {
    collapsed?: boolean;
    navOpen?: boolean;
    brandHeader?: boolean;
}): string;
export declare function avatarClass(options?: {
    size?: Size;
}): string;
export declare function initials(name?: string): string;
export declare const LOGO: {
    viewBox: string;
    letters: string[];
    ring: string;
};
export type IconName = 'search' | 'menu' | 'chevronRight' | 'chevronLeft' | 'chevronDown' | 'chevronsUpDown' | 'arrowUp' | 'arrowDown' | 'x' | 'check' | 'info' | 'circleCheck' | 'circleAlert' | 'triangleAlert' | 'upload' | 'file' | 'minus' | 'plus';
export declare const ICON_PATHS: Record<IconName, string[]>;
export declare const STATUS_ICONS: Record<'info' | 'success' | 'warning' | 'danger', IconName>;
export declare const AVATAR_STATUS_LABELS: Record<AvatarStatus, string>;
export type RowStatusTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger';
export type ProgressTone = 'brand' | 'success' | 'warning' | 'danger';
export type SmallSize = 'sm' | 'md';
export type DescriptionLayout = 'columns' | 'stacked';
export type LinkTone = 'default' | 'muted';
export type LinkUnderline = 'hover' | 'always';
export type SeparatorOrientation = 'horizontal' | 'vertical';
export declare const STATUS_TONES: readonly RowStatusTone[];
export declare const PROGRESS_TONES: readonly ProgressTone[];
export declare const DESCRIPTION_LAYOUTS: readonly DescriptionLayout[];
export declare const LINK_TONES: readonly LinkTone[];
export declare const LINK_UNDERLINES: readonly LinkUnderline[];
export type StatusProgress = 'backlog' | 'todo' | 'started' | 'waiting' | 'done' | 'canceled';
export declare const STATUS_PROGRESS: Record<StatusProgress, RowStatusTone>;
export declare function statusClass(options?: {
    tone?: RowStatusTone;
    pulse?: boolean;
    progress?: StatusProgress;
}): string;
export declare function progressClass(options?: {
    tone?: ProgressTone;
    size?: SmallSize;
    indeterminate?: boolean;
    steps?: boolean;
}): string;
export declare function descriptionListClass(options?: {
    layout?: DescriptionLayout;
}): string;
export declare function copyButtonClass(options?: {
    size?: Size;
    iconOnly?: boolean;
    copied?: boolean;
}): string;
export declare function tagClass(options?: {
    size?: SmallSize;
    disabled?: boolean;
}): string;
export declare function avatarGroupClass(options?: {
    size?: Size;
}): string;
export declare function separatorClass(options?: {
    orientation?: SeparatorOrientation;
    label?: boolean;
}): string;
export declare function linkClass(options?: {
    tone?: LinkTone;
    underline?: LinkUnderline;
}): string;
export declare const DATA_ICON_PATHS: Record<'copy' | 'externalLink', string[]>;
export type SparklineTone = 'brand' | 'success' | 'danger' | 'neutral';
export type MeterVariant = 'bar' | 'segments';
export type MeterLevelName = 'good' | 'fair' | 'poor' | 'neutral';
export type EnergyNodeName = 'solar' | 'home' | 'battery' | 'grid';
export type EnergyFlowDirection = 'in' | 'out' | 'none';
export declare const SPARKLINE_TONES: readonly SparklineTone[];
export declare const METER_VARIANTS: readonly MeterVariant[];
export declare const METER_LEVELS: readonly MeterLevelName[];
export declare const ENERGY_POSITIONS: Record<EnergyNodeName, 'top' | 'right' | 'bottom' | 'left'>;
export declare const ENERGY_ICONS: Record<EnergyNodeName | 'hub' | 'arrow', string[]>;
export declare function sparklineClass(options?: {
    tone?: SparklineTone;
}): string;
export declare function kpiSparklineTone(trend: KpiTrend | null | undefined): SparklineTone;
export declare function donutClass(options?: {
    size?: Size;
}): string;
export declare function meterClass(options?: {
    variant?: MeterVariant;
    level?: MeterLevelName;
}): string;
export declare function energyLineClass(node: EnergyNodeName, flow?: EnergyFlowDirection): string;
export declare function energyNodeClass(node: EnergyNodeName, flow?: EnergyFlowDirection): string;
export declare const FIELD_ICON_PATHS: Record<'eye' | 'eyeOff' | 'clock' | 'mapPin', string[]>;
export type BannerTone = 'info' | 'success' | 'warning' | 'danger' | 'brand';
export type IconButtonVariant = 'ghost' | 'secondary' | 'primary';
export type PopoverAlign = 'start' | 'center' | 'end';
export type PopoverSide = 'bottom' | 'top';
export declare const BANNER_TONES: BannerTone[];
export declare const ICON_BUTTON_VARIANTS: IconButtonVariant[];
export declare const POPOVER_ALIGNS: PopoverAlign[];
export declare function bannerClass(options?: {
    tone?: BannerTone;
}): string;
export declare function iconButtonClass(options?: {
    variant?: IconButtonVariant;
    size?: Size;
}): string;
export declare function popoverClass(options?: {
    align?: PopoverAlign;
    side?: PopoverSide;
}): string;
export declare function actionBarClass(options?: {
    inline?: boolean;
}): string;
export declare function toggleGroupClass(options?: {
    size?: Size;
    iconOnly?: boolean;
}): string;
export type SpaceStep = '0-5' | '1' | '1-5' | '2' | '2-5' | '3' | '3-5' | '4' | '5' | '6' | '8' | '10' | '12' | '16';
export type StackDirection = 'column' | 'row';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between';
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 'auto';
export type GridMinItemWidth = 'sm' | 'md' | 'lg';
export type ContainerSize = 'sm' | 'md' | 'lg';
export type TextSize = 'caption' | 'small' | 'body' | 'lead';
export type TextTone = 'default' | 'muted' | 'tertiary' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type TextWeight = 'regular' | 'medium' | 'semibold';
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'lead' | 'heading' | 'title' | 'display';
export declare const SPACE_STEPS: readonly SpaceStep[];
export declare const STACK_DIRECTIONS: readonly StackDirection[];
export declare const STACK_ALIGNS: readonly StackAlign[];
export declare const STACK_JUSTIFIES: readonly StackJustify[];
export declare const GRID_COLUMNS: readonly GridColumns[];
export declare const GRID_MIN_WIDTHS: readonly GridMinItemWidth[];
export declare const CONTAINER_SIZES: readonly ContainerSize[];
export declare const TEXT_SIZES: readonly TextSize[];
export declare const TEXT_TONES: readonly TextTone[];
export declare const TEXT_WEIGHTS: readonly TextWeight[];
export declare const HEADING_LEVELS: readonly HeadingLevel[];
export declare const HEADING_SIZES: readonly HeadingSize[];
export declare function gapClass(gap?: SpaceStep | number): string;
export declare function stackClass(options?: {
    direction?: StackDirection;
    gap?: SpaceStep | number;
    align?: StackAlign;
    justify?: StackJustify;
    wrap?: boolean;
}): string;
export declare function gridClass(options?: {
    columns?: GridColumns;
    gap?: SpaceStep | number;
    minItemWidth?: GridMinItemWidth;
}): string;
export declare function containerClass(options?: {
    size?: ContainerSize;
    padded?: boolean;
}): string;
export declare function textClass(options?: {
    size?: TextSize;
    tone?: TextTone;
    weight?: TextWeight;
    truncate?: boolean;
    numeric?: boolean;
}): string;
export declare function headingLevel(level: HeadingLevel | number | string | undefined): HeadingLevel;
export declare function headingSize(level: HeadingLevel | number | string | undefined): HeadingSize;
export declare function headingClass(options?: {
    level?: HeadingLevel | number | string;
    size?: HeadingSize;
}): string;
export type EnergyIconName = 'solarPanel' | 'homeBattery' | 'powerGrid' | 'heatPump' | 'wallbox' | 'electricMeter' | 'inverter';
export declare const ENERGY_ICON_PATHS: Record<EnergyIconName, string[]>;
export declare function batteryClass(options?: {
    level?: number;
    size?: 'sm' | 'md';
}): string;
```

## src/core.d.ts

```ts
import type { ChoiceOption, DateRangeValue, SortState, VirtualWindow } from './patterns.js';
export interface ComboboxState {
    open: boolean;
    query: string;
    active: number;
}
export type ComboboxEvent = {
    type: 'focus';
} | {
    type: 'click';
} | {
    type: 'input';
    value: string;
} | {
    type: 'key';
    key: string;
} | {
    type: 'hover';
    index: number;
} | {
    type: 'leave';
} | {
    type: 'pick';
    option: ChoiceOption;
};
export interface ComboboxResult {
    state: ComboboxState;
    select?: string;
    query?: string;
    focusInput?: boolean;
    preventDefault?: boolean;
    stopPropagation?: boolean;
}
export declare function comboboxState(): ComboboxState;
export declare function comboboxReduce(state: ComboboxState, event: ComboboxEvent, context?: {
    filtered?: ChoiceOption[];
    loading?: boolean;
}): ComboboxResult;
export interface ComboboxView {
    chosen: ChoiceOption | undefined;
    activeOption: ChoiceOption | undefined;
    listId: string;
    optionId: (index: number) => string;
    activeDescendant: string | undefined;
    inputValue: string;
    inputPlaceholder: string;
}
export declare function comboboxView(state: ComboboxState, options: {
    options: ChoiceOption[];
    filtered: ChoiceOption[];
    selected: string;
    id: string;
    placeholder: string;
}): ComboboxView;
export interface CalendarDayView {
    iso: string;
    day: number;
    outside: boolean;
    endpoint?: boolean;
    between?: boolean;
    selected?: boolean;
    rangeStart?: boolean;
    rangeEnd?: boolean;
    today?: boolean;
    disabled?: boolean;
    tabbable?: boolean;
    label?: string;
}
export interface CalendarView {
    title: string;
    names: {
        short: string;
        long: string;
    }[];
    weeks: CalendarDayView[][];
    prevBlocked: boolean;
    nextBlocked: boolean;
}
export declare function calendarMove(key: string, from: string | undefined, options?: {
    shift?: boolean;
    weekStartsOn?: number;
    min?: string;
    max?: string;
}): string | null;
export declare function calendarChoose(value: string | DateRangeValue, iso: string, mode?: 'single' | 'range'): string | DateRangeValue;
export declare function calendarAnchor(value: string | DateRangeValue | undefined, options: {
    mode?: 'single' | 'range';
    today: string;
    min?: string;
    max?: string;
}): string;
export declare function calendarView(options: {
    visible: string;
    value: string | DateRangeValue | undefined;
    mode?: 'single' | 'range';
    today: string;
    min?: string;
    max?: string;
    focusDate?: string | null;
    weekStartsOn?: number;
    locale?: string;
}): CalendarView;
export declare function calendarShift(visible: string, months: number): string;
export declare function nextSort(sort: SortState | null | undefined, key: string): SortState;
export declare function toggleAllRows(selected: string[], keys: string[], checked: boolean): string[];
export declare function toggleRow(selected: string[], key: string, checked: boolean): string[];
export declare function toggleColumn(hidden: string[], key: string, visible: boolean): string[];
export interface TableColumnLike {
    key: string;
    sortable?: boolean;
    sortValue?: (row: never) => unknown;
}
export declare function sortRows<T>(rows: T[], columns: TableColumnLike[], sort: SortState | null | undefined, manual?: boolean): T[];
export type GroupBy<T> = string | ((row: T) => string);
export declare function groupRows<T>(rows: T[], groupBy: GroupBy<T> | null | undefined, order?: T[]): T[];
export interface TableGroup<T> {
    key: string;
    rows: T[];
    count: number;
    collapsed: boolean;
}
export interface TableView<T> {
    keyOf: (row: T) => string;
    total: number;
    size: number;
    count: number;
    current: number;
    visible: T[];
    keys: string[];
    all: boolean;
    some: boolean;
    groups: TableGroup<T>[] | null;
    range: VirtualWindow | null;
}
export declare function tableView<T>(options: {
    rows: T[];
    columns: TableColumnLike[];
    rowKey: string | ((row: T) => string);
    sort?: SortState | null;
    page: number;
    pageSize?: number;
    manual?: boolean;
    totalRows?: number;
    selected?: string[];
    maxHeight?: number | string;
    loading?: boolean;
    error?: string;
    scroll?: {
        top: number;
        viewport: number;
        rowHeight: number;
    };
    sorted?: T[];
    groupBy?: GroupBy<T>;
    collapsed?: string[];
}): TableView<T>;
```

## src/labs.d.ts

```ts
export interface EuroOptions {
    locale?: string;
    decimals?: number;
    grouping?: 'always' | 'auto' | 'min2';
    signed?: boolean;
}
export declare function formatEuro(value: number | null | undefined, options?: EuroOptions): string;
export interface EnergyOptions {
    locale?: string;
    decimals?: number;
    unit?: 'kWh' | 'MWh' | 'GWh';
    scale?: boolean;
    signed?: boolean;
}
export declare function formatEnergy(kwh: number | null | undefined, options?: EnergyOptions): string;
export interface PowerOptions {
    locale?: string;
    decimals?: number;
    unit?: 'kW' | 'MW' | 'GW';
    scale?: boolean;
    peak?: boolean;
    signed?: boolean;
}
export declare function formatPower(kw: number | null | undefined, options?: PowerOptions): string;
export type AmountUnit = 'eur' | 'kWh' | 'kW' | 'kWp' | 'percent' | 'number';
export declare const AMOUNT_UNITS: AmountUnit[];
export declare function formatAmount(value: number | null | undefined, options?: {
    unit?: AmountUnit;
    locale?: string;
    decimals?: number;
    scale?: boolean;
    signed?: boolean;
}): string;
export type DateInput = Date | string | number;
export declare function formatRelative(value: DateInput, options?: {
    now?: DateInput;
    locale?: string;
    max?: number;
}): string;
export declare function formatDateTime(value: DateInput, options?: {
    locale?: string;
}): string;
export declare function relativeRefresh(value: DateInput, now?: DateInput): number | null;
export type ThemeMode = 'light' | 'dark' | 'system';
export declare const THEME_MODES: ThemeMode[];
export declare const THEME_STORAGE_KEY: string;
export declare function readThemeMode(key?: string, defaultMode?: ThemeMode): ThemeMode;
export declare function saveThemeMode(mode: ThemeMode, key?: string, defaultMode?: ThemeMode): void;
export declare function resolveThemeMode(mode: ThemeMode, prefersDark: boolean): 'light' | 'dark';
export declare function applyThemeMode(mode: ThemeMode, root?: HTMLElement): void;
export declare function themeScript(key?: string, defaultMode?: ThemeMode): string;
export interface Hotkey {
    key: string;
    mod: boolean;
    ctrl: boolean;
    meta: boolean;
    alt: boolean;
    shift: boolean;
}
export declare function parseHotkey(hotkey: string): Hotkey;
export declare function matchesHotkey(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>, hotkey: string | Hotkey): boolean;
export declare function isTypingTarget(target: EventTarget | null): boolean;
export declare function hotkeyLabel(hotkey: string, options?: {
    mac?: boolean;
}): string;
export interface PeriodValues {
    punta?: number;
    llano?: number;
    valle?: number;
}
export interface Tariff {
    id?: string;
    name: string;
    energy: number | PeriodValues;
    power: number | {
        punta?: number;
        valle?: number;
    };
    monthly?: number;
}
export interface TariffOptions {
    consumption: number | PeriodValues;
    power?: number | {
        punta?: number;
        valle?: number;
    };
    days?: number;
    taxes?: {
        electricityTax?: number;
        vat?: number;
    };
}
export interface TariffCost {
    energy: number;
    power: number;
    fixed: number;
    taxes: number;
    total: number;
}
export declare function tariffCost(tariff: Tariff, options: TariffOptions): TariffCost;
export interface TariffRow {
    id: string;
    name: string;
    cost: TariffCost;
    cheapest: boolean;
    delta: number;
    monthly: number;
    ratio: number;
}
export declare function compareTariffs(tariffs: Tariff[], options: TariffOptions): {
    cheapest: string | null;
    rows: TariffRow[];
};
export type SignaturePoint = [
    number,
    number
];
export type SignatureValue = {
    strokes: SignaturePoint[][];
} | {
    typed: string;
};
export declare const SIGNATURE_SIZE: {
    width: number;
    height: number;
};
export declare function isSignatureEmpty(value: SignatureValue | null | undefined): boolean;
export declare function signaturePoint(rect: {
    left: number;
    top: number;
    width: number;
    height: number;
}, clientX: number, clientY: number, size?: {
    width: number;
    height: number;
}): SignaturePoint;
export declare function signaturePath(stroke: SignaturePoint[]): string;
export interface SignatureSvgOptions {
    size?: {
        width: number;
        height: number;
    };
    color?: string;
    font?: string;
}
export declare function signatureSvg(value: SignatureValue | null | undefined, options?: SignatureSvgOptions): string;
export declare function signatureDataUrl(value: SignatureValue | null | undefined, options?: SignatureSvgOptions): string;
export type WeatherKind = 'sun' | 'partly' | 'cloud' | 'rain';
export declare const WEATHER_ICON_PATHS: Record<WeatherKind, string[]>;
export declare const WEATHER_KINDS: WeatherKind[];
export interface ForecastSummary {
    done: number;
    forecastTotal: number;
    actualTotal: number;
    expectedSoFar: number;
    deviation: number | null;
    status: 'above' | 'below' | 'on-track' | null;
}
export declare function forecastSummary(options: {
    forecast?: number[];
    actual?: (number | null | undefined)[];
    tolerance?: number;
}): ForecastSummary;
export declare function slotLabel(index: number, count?: number): string;
export type LabsMessageKey = 'themeLabel' | 'themeLight' | 'themeDark' | 'themeSystem' | 'tariffName' | 'tariffAnnual' | 'tariffMonthly' | 'tariffCheapest' | 'tariffMore' | 'tariffEnergy' | 'tariffPower' | 'tariffTaxesIncluded' | 'tariffNoTaxes' | 'signatureHint' | 'signatureClear' | 'signatureTypeInstead' | 'signatureDrawInstead' | 'signatureTypedLabel' | 'signatureEmpty' | 'signatureDrawn' | 'signatureTyped' | 'forecastExpected' | 'forecastActual' | 'forecastUntil' | 'forecastAbove' | 'forecastBelow' | 'forecastOnTrack' | 'forecastWeather' | 'forecastHour' | 'weatherSun' | 'weatherPartly' | 'weatherCloud' | 'weatherRain';
export type LabsMessages = Record<LabsMessageKey, string>;
export declare const LABS_MESSAGES: Record<'es-ES' | 'de-DE' | 'en-GB', LabsMessages>;
export declare function labsMessagesFor(locale?: string, overrides?: Partial<Record<string, string>>): LabsMessages;
```

## src/messages.d.ts

```ts
export type MessageKey = 'close' | 'dismiss' | 'notifications' | 'fieldRequired' | 'fieldInvalid' | 'columns' | 'chartHint' | 'tariffValle' | 'tariffLlano' | 'tariffPunta' | 'tariffPeriod' | 'priceHour' | 'price' | 'priceCheapest' | 'priceDearest' | 'priceNow' | 'batteryEnergy' | 'batteryReserve' | 'errorSummaryOne' | 'errorSummaryMany' | 'loading' | 'loadingEllipsis' | 'loadingData' | 'search' | 'searchPlaceholder' | 'noResults' | 'options' | 'menu' | 'skipToContent' | 'mainNavigation' | 'indicators' | 'previous' | 'trendUp' | 'trendDown' | 'trendFlat' | 'statusOnline' | 'statusAway' | 'statusBusy' | 'pagination' | 'previousPage' | 'nextPage' | 'pageN' | 'pageRange' | 'noGroup' | 'noResultsCount' | 'dateFrom' | 'dateTo' | 'rangeInverted' | 'rangeMin' | 'rangeMax' | 'uploadLabel' | 'uploadHint' | 'uploadSingle' | 'uploadTooBig' | 'uploadFormat' | 'uploadFailed' | 'uploading' | 'uploadDone' | 'retry' | 'retryFile' | 'removeFile' | 'progress' | 'completed' | 'history' | 'removeFilter' | 'clearFilters' | 'breadcrumbs' | 'selectPage' | 'selectRow' | 'actions' | 'selectedNone' | 'selectedOne' | 'selectedMany' | 'decrease' | 'increase' | 'removeItem' | 'calendar' | 'previousMonth' | 'nextMonth' | 'today' | 'commandPalette' | 'commandPlaceholder' | 'chartData' | 'total' | 'copy' | 'copied' | 'copyFailed' | 'copyNamed' | 'progressStep' | 'avatarMore' | 'opensInNewTab' | 'meterLabel' | 'valueOfMax' | 'energyFlow' | 'energySolar' | 'energyHome' | 'energyBattery' | 'energyGrid' | 'energyProducing' | 'energyNoProduction' | 'energyConsuming' | 'energyNoConsumption' | 'energyCharging' | 'energyDischarging' | 'energyBatteryIdle' | 'energyImporting' | 'energyExporting' | 'energyGridIdle' | 'batteryLevel' | 'clearSearch' | 'showPassword' | 'hidePassword' | 'timePlaceholder' | 'timeOptions' | 'timeInvalid' | 'timeMin' | 'timeMax' | 'phoneCountry' | 'phoneInvalid' | 'phoneSpainLength' | 'phoneSpainStart' | 'nifDniFormat' | 'nifDniLetter' | 'nifNieFormat' | 'nifNieLetter' | 'nifCifFormat' | 'nifCifControl' | 'nifInvalid' | 'ibanCountry' | 'ibanLength' | 'ibanInvalid' | 'ibanChecksum' | 'addressPlaceholder' | 'addressOptions' | 'addressMinChars' | 'addressFailed' | 'selectedCountOne' | 'selectedCountMany' | 'clearSelection';
export type Messages = Record<MessageKey, string>;
export type LocaleName = 'es-ES' | 'de-DE' | 'en-GB';
export declare const DEFAULT_LOCALE: 'es-ES';
export declare const MESSAGES: Record<LocaleName, Messages>;
export declare function messagesFor(locale?: string, overrides?: Partial<Messages>): Messages;
export declare function formatMessage(template: string, values?: Record<string, string | number | null | undefined>): string;
```

## src/messages/de.d.ts

```ts
import type { Messages } from '../messages.js';
export declare const de: Messages;
export default de;
```

## src/messages/en.d.ts

```ts
import type { Messages } from '../messages.js';
export declare const en: Messages;
export default en;
```

## src/patterns.d.ts

```ts
import type { Messages } from './messages.js';
export type StatusTone = 'info' | 'success' | 'warning' | 'danger';
export interface ChoiceOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
    keywords?: string;
}
export interface MenuItem {
    id: string;
    label: string;
    disabled?: boolean;
    danger?: boolean;
    separator?: boolean;
    shortcut?: string[];
}
export interface BreadcrumbItem {
    label: string;
    href?: string;
}
export interface StepItem {
    id: string;
    label: string;
    description?: string;
    disabled?: boolean;
}
export interface TimelineItem {
    id: string;
    title: string;
    description?: string;
    date?: string;
    dateTime?: string;
    tone?: StatusTone;
}
export type FilterPart = 'field' | 'operator' | 'value';
export interface FilterItem {
    id: string;
    label?: string;
    field?: string;
    operator?: string;
    value?: string;
}
export interface UploadItem {
    id: string;
    name: string;
    status?: 'uploading' | 'success' | 'error';
    progress?: number;
    error?: string;
}
export interface DateRangeValue {
    start: string;
    end: string;
}
export interface SortState {
    key: string;
    direction: 'asc' | 'desc';
}
export declare function normalizeSearch(value: unknown): string;
export declare function filterOptions<T extends ChoiceOption>(options: T[], query: string): T[];
export declare function pageCount(total: number, pageSize: number): number;
export declare function pageItems(page: number, count: number): Array<number | 'ellipsis'>;
export declare function compareValues(a: unknown, b: unknown): number;
export declare function fileError(file: Pick<File, 'name' | 'size' | 'type'>, accept?: string, maxSize?: number, options?: {
    messages?: Messages;
    locale?: string;
}): string;
export declare function rangeError(start?: string, end?: string, min?: string, max?: string, messages?: Messages): string;
export declare function lockScroll(doc: Document): () => void;
export declare function backdropGesture(): {
    down(event: Pick<MouseEvent, 'target' | 'currentTarget' | 'clientX' | 'clientY'>): void;
    click(event: Pick<MouseEvent, 'target' | 'currentTarget' | 'clientX' | 'clientY'>): boolean;
};
export declare function moveFocus(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'preventDefault'>, container: HTMLElement, selector: string, horizontal?: boolean): void;
export declare function nextIndex(key: string, index: number, length: number): number | null;
export declare function overflowsSide(element: Element, side: 'left' | 'right'): boolean;
export declare function selectionLabel(count: number, messages?: Messages): string;
export interface CommandItem {
    id: string;
    label: string;
    description?: string;
    keywords?: string;
    shortcut?: string;
    disabled?: boolean;
}
export interface CommandGroup {
    label: string;
    items: CommandItem[];
}
export interface ChartSeries {
    key: string;
    label: string;
    tone?: 1 | 2 | 3 | 4 | 5;
}
export interface CalendarDay {
    iso: string;
    day: number;
    outside: boolean;
}
export declare function parseNumber(text: string | null | undefined, locale?: string): number | null;
export declare function decimalsOf(step: number): number;
export declare function formatNumber(value: number | null | undefined, locale?: string, decimals?: number): string;
export declare function clampNumber(value: number, min?: number, max?: number): number;
export declare function stepNumber(value: number | null | undefined, step: number, times: number, min?: number, max?: number): number;
export declare function toIso(year: number, month: number, day: number): string;
export declare function parseIso(iso: string | null | undefined): {
    year: number;
    month: number;
    day: number;
} | null;
export declare function todayIso(now?: Date): string;
export declare function addDays(iso: string, days: number): string;
export declare function addMonths(iso: string, months: number): string;
export declare function weekday(iso: string): number;
export declare function startOfWeek(iso: string, weekStartsOn?: number): string;
export declare function clampDate(iso: string, min?: string, max?: string): string;
export declare function monthWeeks(month: string, weekStartsOn?: number): CalendarDay[][];
export declare function weekdayNames(locale?: string, weekStartsOn?: number): Array<{
    short: string;
    long: string;
}>;
export declare function monthTitle(month: string, locale?: string): string;
export declare function dateLabel(iso: string, locale?: string): string;
export declare function nextRange(range: DateRangeValue | null | undefined, iso: string): DateRangeValue;
export declare function niceScale(max: number, count?: number): {
    max: number;
    step: number;
    ticks: number[];
};
export declare function filterGroups<T extends CommandGroup>(groups: T[], query: string): T[];
export declare function isShortcut(event: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'altKey'>, key: string | false | null | undefined): boolean;
export interface DescriptionItem {
    id?: string;
    term: string;
    description?: string;
    copy?: string;
    mono?: boolean;
}
export interface AvatarItem {
    name: string;
    src?: string;
}
export interface ProgressState {
    indeterminate: boolean;
    stepped: boolean;
    max: number;
    now: number | null;
    ratio: number;
    text: string;
}
export declare function formatPercent(ratio: number | null | undefined, locale?: string, decimals?: number): string;
export declare function progressState(options?: {
    value?: number | null;
    max?: number;
    steps?: number;
    locale?: string;
    messages?: Messages;
}): ProgressState;
export declare function splitAvatars<T>(items?: T[], max?: number): {
    shown: T[];
    rest: T[];
};
export declare function tagFocusTarget(button: Element | null | undefined): HTMLElement | null;
export declare function copyText(text: string, env?: {
    navigator?: Navigator;
    document?: Document;
}): Promise<boolean>;
export interface ChartPoint {
    x: number;
    y: number;
}
export interface DonutSegment {
    label: string;
    value: number;
    tone?: 1 | 2 | 3 | 4 | 5;
}
export interface DonutSlice {
    start: number;
    length: number;
    percent: number;
}
export type MeterLevel = 'good' | 'fair' | 'poor' | 'neutral';
export type EnergyNode = 'solar' | 'home' | 'battery' | 'grid';
export interface EnergyNodeState {
    flow: 'in' | 'out' | 'none';
    state: import('./messages.js').MessageKey;
}
export declare function sparklinePoints(values: readonly number[] | null | undefined): ChartPoint[];
export declare function chartPoints(values: readonly number[], max: number): ChartPoint[];
export declare function linePath(points: readonly ChartPoint[]): string;
export declare function areaPath(points: readonly ChartPoint[], base?: number): string;
export declare function donutSlices(values: readonly number[], total?: number): DonutSlice[];
export declare function meterRatio(value: number, min?: number, max?: number): number;
export declare function meterLevel(options: {
    value: number;
    min?: number;
    max?: number;
    low?: number;
    high?: number;
    optimum?: number;
}): MeterLevel;
export declare function meterSegments(ratio: number, count: number): number;
export declare function energyFlow(node: EnergyNode, value: number | null | undefined): EnergyNodeState;
export interface AddressValue {
    street: string;
    postalCode: string;
    city: string;
    province: string;
    cadastralRef?: string;
}
export interface AddressOption {
    id: string;
    label: string;
    description?: string;
    value: AddressValue;
}
export interface SliderMark {
    value: number;
    label: string;
}
export type PhoneCountryCode = 'ES' | 'PT' | 'FR' | 'DE' | 'IT' | 'GB';
export interface PhoneCountry {
    code: PhoneCountryCode;
    dial: string;
    example: string;
}
export type NifKind = 'dni' | 'nie' | 'cif';
export declare function significantCount(text: string | null | undefined, end?: number): number;
export declare function caretAfter(text: string | null | undefined, count: number): number;
export declare function parseTime(text: string | null | undefined): number | null;
export declare function formatTime(minutes: number | null | undefined): string;
export declare function normalizeTime(text: string | null | undefined): string | null;
export declare function timeSlots(min?: string, max?: string, step?: number): string[];
export declare function nearestTime(slots: string[], time: string | null | undefined): number;
export declare function timeError(text: string | null | undefined, range?: {
    min?: string;
    max?: string;
}, messages?: Messages): string;
export declare const PHONE_COUNTRIES: PhoneCountry[];
export declare function phoneCountryOf(text: string | null | undefined): PhoneCountryCode | null;
export declare function parsePhone(text: string | null | undefined, country?: string): {
    country: PhoneCountryCode;
    digits: string;
};
export declare function formatPhone(text: string | null | undefined, country?: string): string;
export declare function toE164(text: string | null | undefined, country?: string): string;
export declare function nationalNumber(e164: string | null | undefined, country?: string): string;
export declare function phoneError(text: string | null | undefined, country?: string, messages?: Messages): string;
export declare function isValidPhone(text: string | null | undefined, country?: string): boolean;
export declare function normalizeNif(text: string | null | undefined): string;
export declare function nifKind(text: string | null | undefined): NifKind | null;
export declare function nifError(text: string | null | undefined, messages?: Messages): string;
export declare function isValidNif(text: string | null | undefined): boolean;
export declare const IBAN_LENGTHS: Record<string, number>;
export declare function normalizeIban(text: string | null | undefined): string;
export declare function formatIban(text: string | null | undefined): string;
export declare function ibanError(text: string | null | undefined, messages?: Messages): string;
export declare function isValidIban(text: string | null | undefined): boolean;
export declare function selectedCount(count: number, messages?: Messages): string;
export declare function menuPosition(point: {
    x: number;
    y: number;
}, size: {
    width: number;
    height: number;
}, viewport: {
    width: number;
    height: number;
}, margin?: number): {
    x: number;
    y: number;
};
export declare function toggleValues(current: string[], value: string, type?: 'single' | 'multiple', order?: string[]): string[];
export interface ToastAction {
    label: string;
    onClick: () => void;
}
export interface ToastOptions {
    id?: string;
    tone?: StatusTone;
    description?: string;
    action?: ToastAction;
    duration?: number;
}
export interface ToastItem {
    id: string;
    title: string;
    tone: StatusTone;
    description?: string;
    action?: ToastAction;
    duration: number;
}
export interface ToastPromiseMessages<T> {
    loading: string;
    success: string | ((value: T) => string);
    error: string | ((reason: unknown) => string);
}
export interface ToastFunction {
    (title: string, options?: ToastOptions): string;
    success(title: string, options?: Omit<ToastOptions, 'tone'>): string;
    warning(title: string, options?: Omit<ToastOptions, 'tone'>): string;
    error(title: string, options?: Omit<ToastOptions, 'tone'>): string;
    info(title: string, options?: Omit<ToastOptions, 'tone'>): string;
    dismiss(id?: string): void;
    promise<T>(work: Promise<T> | (() => Promise<T>), messages: ToastPromiseMessages<T>): Promise<T>;
}
export interface ToastStore {
    toast: ToastFunction;
    subscribe(listener: () => void): () => void;
    getSnapshot(): readonly ToastItem[];
}
export declare function createToastStore(): ToastStore;
export declare function visibleToasts(items: readonly ToastItem[], max?: number): ToastItem[];
export type FieldCheck<V = any, T = any> = (value: V, values: T) => string | boolean | null | undefined | Promise<string | boolean | null | undefined>;
export declare function isEmptyValue(value: unknown): boolean;
export declare function errorSummaryTitle(count: number, messages?: Messages): string;
export declare function fieldId(prefix: string, name: string): string;
export declare function checkValue<V, T>(value: V, values: T, options?: {
    required?: boolean;
    formatError?: string;
    checks?: FieldCheck<V, T> | FieldCheck<V, T>[];
    messages?: Messages;
}): Promise<string>;
export interface ErrorSummaryItem {
    id: string;
    message: string;
    label?: string;
}
export declare function focusField(id: string, doc?: Document): boolean;
export interface CsvColumn<T = any> {
    key: string;
    header: string;
    csvValue?: (row: T) => string | number | null | undefined;
}
export declare function visibleColumns<C extends {
    key: string;
    hideable?: boolean;
}>(columns: C[], hidden?: string[]): C[];
export declare function toCsv<T>(rows: T[], columns: CsvColumn<T>[], options?: {
    locale?: string;
    separator?: string;
}): string;
export declare function downloadCsv(filename: string, csv: string, doc?: Document): void;
export declare function chartSlotAt(offset: number, width: number, count: number): number | null;
export declare function chartKeyMove(key: string, current: number | null, count: number): number | undefined;
export declare function tooltipAlign(x: number): 'before' | 'after';
export declare function slotCenter(index: number, count: number): number;
export type TariffPeriod = 'valle' | 'llano' | 'punta';
export interface PriceSlot {
    index: number;
    start: string;
    end: string;
    hour: number;
    period: TariffPeriod;
    price: number | null;
}
export declare const NATIONAL_HOLIDAYS: string[];
export declare function isOffPeakDay(date?: string, holidays?: string[]): boolean;
export declare function tariffPeriod(hour: number, offPeak?: boolean): TariffPeriod;
export declare function priceSlots(prices: (number | null)[], options?: {
    date?: string;
    holidays?: string[];
    periods?: TariffPeriod[];
}): PriceSlot[];
export declare function priceExtremes(slots: PriceSlot[]): {
    cheapest: PriceSlot | null;
    dearest: PriceSlot | null;
};
export declare function slotAt(slots: PriceSlot[], time?: string): number;
export type BatteryState = 'charging' | 'discharging' | 'idle';
export declare function batteryState(power?: number | null): BatteryState;
export declare function heatLevels(rows: (number | null)[][], options?: {
    min?: number;
    max?: number;
}): {
    min: number;
    max: number;
    levels: (number | null)[][];
};
export declare function gridKeyMove(key: string, current: [
    number,
    number
] | null, rows: number, columns: number): [
    number,
    number
] | undefined;
export declare const VIRTUAL_ROWS: number;
export interface VirtualWindow {
    start: number;
    end: number;
    before: number;
    after: number;
}
export declare function virtualWindow(options: {
    count: number;
    rowHeight?: number;
    scrollTop?: number;
    viewport?: number;
    overscan?: number;
}): VirtualWindow;
export declare function pixelHeight(value: number | string | null | undefined): number | null;
```
