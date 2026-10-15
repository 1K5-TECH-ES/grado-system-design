'use client'
import { cx, meterClass, type MeterVariant } from '@1k5-tech-es/grado/classes'
import { formatNumber, meterLevel, meterRatio, meterSegments } from '@1k5-tech-es/grado/patterns'
import { useGrado } from './Locale.js'

export interface MeterProps {
  value: number
  min?: number
  max?: number
  /** Igual que en <meter>: low y high parten el rango en tres zonas; optimum dice cuál es la buena. */
  low?: number
  high?: number
  optimum?: number
  /** Qué mide: «Carga de batería». Es también su nombre accesible. */
  label?: string
  /** Unidad tras el valor: %, kWh. */
  unit?: string
  /** Muestra el valor junto a la etiqueta. */
  showValue?: boolean
  /** bar: barra continua; segments: segmentos tipo batería. */
  variant?: MeterVariant
  /** Número de segmentos con variant segments. */
  segments?: number
  /** Texto que leen los lectores de pantalla en lugar del valor con su unidad. */
  valueText?: string
  decimals?: number
  locale?: string
  className?: string
}

/**
 * Valor dentro de un rango conocido: carga de batería, cobertura solar. El tono (bien,
 * regular, mal) sale de low, high y optimum, con el mismo criterio que <meter> de HTML.
 */
export function Meter({
  value,
  min = 0,
  max = 100,
  low,
  high,
  optimum,
  label,
  unit,
  showValue = true,
  variant = 'bar',
  segments = 10,
  valueText,
  decimals = 1,
  locale: localeProp,
  className,
}: MeterProps) {
  const { messages: m, locale: contextLocale } = useGrado()
  const locale = localeProp ?? contextLocale
  const ratio = meterRatio(value, min, max)
  const now = Math.min(max, Math.max(min, value))
  const shown = formatNumber(value, locale, decimals)
  const text = valueText ?? (unit ? `${shown} ${unit}` : shown)
  const count = Math.max(1, Math.round(segments))
  const on = meterSegments(ratio, count)
  return (
    <div
      className={cx(meterClass({ variant, level: meterLevel({ value, min, max, low, high, optimum }) }), className)}
      role="meter"
      aria-label={label ?? m.meterLabel}
      aria-valuenow={now}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={text}
    >
      {label != null || showValue ? (
        <span className="k5-meter__head">
          {label != null ? <span className="k5-meter__label">{label}</span> : null}
          {showValue ? <span className="k5-meter__value">{unit ? `${shown} ${unit}` : shown}</span> : null}
        </span>
      ) : null}
      {variant === 'segments' ? (
        <span className="k5-meter__segments">
          {Array.from({ length: count }, (_, i) => (
            <span key={i} className={cx('k5-meter__segment', i < on && 'k5-meter__segment--on')} />
          ))}
        </span>
      ) : (
        <span className="k5-meter__track">
          <span className="k5-meter__fill" style={{ width: `${Math.round(ratio * 10000) / 100}%` }} />
        </span>
      )}
    </div>
  )
}
