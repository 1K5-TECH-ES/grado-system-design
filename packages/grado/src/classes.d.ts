export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
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
