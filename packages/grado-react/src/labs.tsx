'use client'
// Labs: utilidades que las apps escribían cada una a su manera. Fuera de la promesa de la 1.0:
// pueden cambiar en una versión menor hasta que pasen al paquete principal.
//   import { Amount, RelativeTime, ThemeToggle } from '@1k5-tech-es/grado-react/labs'
import {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cx } from '@1k5-tech-es/grado/classes'
import {
  applyThemeMode,
  formatAmount,
  formatDateTime,
  formatRelative,
  isTypingTarget,
  matchesHotkey,
  parseHotkey,
  readThemeMode,
  relativeRefresh,
  resolveThemeMode,
  saveThemeMode,
  THEME_STORAGE_KEY,
  type AmountUnit,
  type DateInput,
  type ThemeMode,
} from '@1k5-tech-es/grado/labs'
import { useGrado } from './Locale.js'
import { useLabsMessages } from './labs-messages.js'
import { SegmentedControl } from './Inputs.js'
import type { Size } from '@1k5-tech-es/grado/classes'

export { formatEuro, formatEnergy, formatPower, formatRelative, themeScript, hotkeyLabel } from '@1k5-tech-es/grado/labs'
export type { AmountUnit, ThemeMode } from '@1k5-tech-es/grado/labs'

// ---------- Amount ----------

export interface AmountProps extends Omit<HTMLAttributes<HTMLDataElement>, 'children'> {
  value: number | null | undefined
  /** eur, kWh, kW, kWp, percent (0.12 → 12 %) o number. */
  unit?: AmountUnit
  /** Por defecto: 2 en euros y números, 1 en energía y potencia, 0 en porcentajes. */
  decimals?: number
  /** Cambia de unidad con cifras grandes: 12 500 kWh → 12,5 MWh. */
  scale?: boolean
  /** Con signo: «+12,00 €». Para variaciones. */
  signed?: boolean
  /** Verde si es positivo y rojo si es negativo. Para variaciones; mejor con signed. */
  colored?: boolean
  /** Texto si no hay valor. Por defecto «—». */
  empty?: ReactNode
}

/**
 * Un importe, una energía o una potencia con su formato en español y cifras alineadas:
 * «1234,50 €», «7,2 kWh», «6,4 kWp». Es un <data> con el número sin formato en value.
 */
export const Amount = forwardRef<HTMLDataElement, AmountProps>(function Amount(
  { value, unit = 'number', decimals, scale, signed, colored, empty = '—', className, ...rest },
  ref,
) {
  const { locale } = useGrado()
  const known = value != null && !Number.isNaN(value)
  return (
    <data
      ref={ref}
      {...rest}
      value={known ? String(value) : ''}
      className={cx(
        'k5-amount',
        colored && known && value > 0 && 'k5-amount--positive',
        colored && known && value < 0 && 'k5-amount--negative',
        className,
      )}
    >
      {known ? formatAmount(value, { unit, locale, decimals, scale, signed }) : empty}
    </data>
  )
})

// ---------- RelativeTime ----------

export interface RelativeTimeProps extends Omit<HTMLAttributes<HTMLTimeElement>, 'children'> {
  value: DateInput
  /** «Ahora» de referencia. Por defecto, el reloj; útil en tests y en el servidor. */
  now?: DateInput
  /** Segundos a partir de los que se pone la fecha y no «hace…». Por defecto, una semana. */
  max?: number
}

/**
 * «hace 5 minutos», «ayer», «16 oct». Se actualiza sola (cada minuto la primera hora) y lleva
 * la fecha completa en title y en datetime.
 */
export const RelativeTime = forwardRef<HTMLTimeElement, RelativeTimeProps>(function RelativeTime(
  { value, now, max, className, title, ...rest },
  ref,
) {
  const { locale } = useGrado()
  const [, tick] = useState(0)
  const date = value instanceof Date ? value : new Date(value)
  const valid = !Number.isNaN(date.getTime())
  useEffect(() => {
    if (now != null || !valid) return
    const every = relativeRefresh(date)
    if (!every) return
    const timer = setInterval(() => tick((n) => n + 1), every)
    return () => clearInterval(timer)
  }, [now, valid, date.getTime()]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <time
      ref={ref}
      {...rest}
      dateTime={valid ? date.toISOString() : undefined}
      title={title ?? (valid ? formatDateTime(date, { locale }) : undefined)}
      className={cx('k5-relative-time', className)}
      // En el servidor y en el navegador «ahora» no es el mismo instante.
      suppressHydrationWarning
    >
      {valid ? formatRelative(date, { now: now ?? Date.now(), locale, max }) : ''}
    </time>
  )
})

// ---------- Tema ----------

const THEME_EVENT = 'k5-theme-change'

export interface ThemeOptions {
  /** Clave en localStorage. Por defecto «k5-mode». */
  storageKey?: string
  /** Pone o quita la clase dark en <html>. false: solo guarda y devuelve la elección (una vista previa, un ajuste que se aplica en otro sitio). */
  apply?: boolean
  /** El modo sin nada guardado. Por defecto «system»; «light» para una app que es clara salvo que se elija otra cosa. */
  defaultMode?: ThemeMode
}

/**
 * Tema claro, oscuro o del sistema: lo guarda en localStorage y pone la clase dark en <html>.
 * Todos los useTheme con la misma clave se enteran del cambio. Para que no parpadee al cargar,
 * pon themeScript() en un <script> del <head>.
 */
export function useTheme({ storageKey = THEME_STORAGE_KEY, apply = true, defaultMode = 'system' }: ThemeOptions = {}) {
  const [mode, setState] = useState<ThemeMode>(defaultMode)
  const [prefersDark, setPrefersDark] = useState(false)
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const sync = () => {
      const next = readThemeMode(storageKey, defaultMode)
      setState(next)
      setPrefersDark(media.matches)
      if (apply) applyThemeMode(next)
    }
    sync()
    media.addEventListener('change', sync)
    window.addEventListener(THEME_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      media.removeEventListener('change', sync)
      window.removeEventListener(THEME_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [storageKey, apply, defaultMode])
  const setMode = useCallback(
    (next: ThemeMode) => {
      saveThemeMode(next, storageKey, defaultMode)
      // Aplica aunque no haya almacenamiento (modo privado): los demás se enteran por el evento.
      if (apply) applyThemeMode(next)
      setState(next)
      window.dispatchEvent(new Event(THEME_EVENT))
    },
    [storageKey, apply, defaultMode],
  )
  return { mode, setMode, resolved: resolveThemeMode(mode, prefersDark) }
}

export interface ThemeToggleProps extends ThemeOptions {
  size?: Size
  className?: string
}

/** Claro, Oscuro o Sistema, con useTheme. */
export function ThemeToggle({ size = 'sm', storageKey, apply, defaultMode, className }: ThemeToggleProps) {
  const m = useLabsMessages()
  const { mode, setMode } = useTheme({ storageKey, apply, defaultMode })
  return (
    <SegmentedControl
      className={className}
      size={size}
      label={m.themeLabel}
      value={mode}
      onValueChange={(value) => setMode(value as ThemeMode)}
      options={[
        { value: 'light', label: m.themeLight },
        { value: 'dark', label: m.themeDark },
        { value: 'system', label: m.themeSystem },
      ]}
    />
  )
}

// ---------- ScrollArea ----------

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** Nombre de la zona para lectores de pantalla: «Mensajes», «Historial». */
  label: string
  /** Alto máximo: número en píxeles o medida CSS. Sin él, el del contenedor. */
  maxHeight?: number | string
  /** vertical (por defecto), horizontal o both. */
  orientation?: 'vertical' | 'horizontal' | 'both'
}

/**
 * Zona con su propio scroll y barra fina del color de la marca. Se puede recorrer con el teclado:
 * recibe el foco con Tab y las flechas la desplazan.
 */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { label, maxHeight, orientation = 'vertical', className, style, children, ...rest },
  ref,
) {
  const height = maxHeight == null ? undefined : typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      tabIndex={0}
      {...rest}
      className={cx('k5-scroll-area', orientation !== 'vertical' && `k5-scroll-area--${orientation}`, className)}
      style={height ? ({ '--_height': height, ...style } as CSSProperties) : style}
    >
      {children}
    </div>
  )
})

// ---------- Atajos ----------

export interface HotkeyOptions {
  enabled?: boolean
  /** Si salta con el foco en un campo de texto. Por defecto, solo los atajos con Ctrl/⌘ o Alt. */
  allowInInputs?: boolean
  /** Evita lo que haría el navegador con ese atajo (Ctrl+K busca en la barra). Por defecto, sí. */
  preventDefault?: boolean
}

/** Llama a handler con el atajo: useHotkey('mod+k', abrir), useHotkey('?', ayuda). mod es ⌘ en Mac y Ctrl en el resto. */
export function useHotkey(hotkey: string, handler: (event: KeyboardEvent) => void, options: HotkeyOptions = {}) {
  const { enabled = true, preventDefault = true } = options
  const latest = useRef(handler)
  latest.current = handler
  const parsed = parseHotkey(hotkey)
  const inInputs = options.allowInInputs ?? (parsed.mod || parsed.ctrl || parsed.meta || parsed.alt)
  useEffect(() => {
    if (!enabled) return
    const want = parseHotkey(hotkey)
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || !matchesHotkey(event, want)) return
      if (!inInputs && isTypingTarget(event.target)) return
      if (preventDefault) event.preventDefault()
      latest.current(event)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [hotkey, enabled, inInputs, preventDefault])
}

// ---------- VisuallyHidden ----------

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLElement> {
  /** Etiqueta del elemento. Por defecto, span. */
  as?: ElementType
}

/** Texto solo para lectores de pantalla: «(se abre en otra pestaña)», el nombre de un icono… */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden(
  { as = 'span', className, ...rest },
  ref,
) {
  return createElement(as, { ref, ...rest, className: cx('k5-sr-only', className) })
})

// ---------- Energía y ventas (0.6) ----------

export { TariffComparison, type TariffComparisonProps } from './TariffComparison.js'
export { SignaturePad, type SignaturePadProps } from './SignaturePad.js'
export { SolarForecast, type SolarForecastProps } from './SolarForecast.js'
export {
  compareTariffs,
  tariffCost,
  isSignatureEmpty,
  signatureSvg,
  signatureDataUrl,
  forecastSummary,
  type Tariff,
  type SignatureValue,
  type WeatherKind,
} from '@1k5-tech-es/grado/labs'
