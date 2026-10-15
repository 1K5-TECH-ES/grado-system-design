'use client'
import type { ReactNode } from 'react'
import { cx, donutClass, type Size } from '@1k5/grado/classes'
import { formatMessage } from '@1k5/grado/messages'
import { donutSlices, formatNumber, formatPercent, type DonutSegment } from '@1k5/grado/patterns'
import { useGrado } from './Locale.js'

export interface DonutProps {
  /** Partes de un total: [{ label: 'Autoconsumo', value: 13.6 }, { label: 'Excedentes', value: 6.4 }]. */
  segments?: DonutSegment[]
  /** Un solo valor sobre max, en lugar de segments. */
  value?: number
  max?: number
  /** Qué mide. Encabeza el nombre accesible y, con un solo valor, la lista oculta. */
  label?: string
  /** Color del valor único: chart-1 … chart-5. */
  tone?: DonutSegment['tone']
  /** Cifra en el centro, por ejemplo «68 %». Con un solo valor, por defecto, su porcentaje. */
  centerValue?: ReactNode
  /** Texto pequeño bajo la cifra del centro: «Autoconsumo». */
  centerLabel?: ReactNode
  size?: Size
  /** Leyenda al lado. Por defecto, con segments. */
  legend?: boolean
  /** Unidad de los valores para la lista oculta: kWh. */
  unit?: string
  decimals?: number
  locale?: string
  className?: string
}

/**
 * Proporción de un total en un anillo. Es una imagen con un nombre que resume los
 * porcentajes; los valores van además en una lista oculta para lectores de pantalla.
 */
export function Donut({
  segments,
  value = 0,
  max = 100,
  label,
  tone,
  centerValue,
  centerLabel,
  size,
  legend,
  unit,
  decimals = 1,
  locale: localeProp,
  className,
}: DonutProps) {
  const { messages: m, locale: contextLocale } = useGrado()
  const locale = localeProp ?? contextLocale
  const single = segments == null
  const items: DonutSegment[] = segments ?? [{ label: label ?? '', value, tone }]
  const slices = donutSlices(
    items.map((s) => s.value),
    single ? max : undefined,
  )
  const withUnit = (n: number) => (unit ? `${formatNumber(n, locale, decimals)} ${unit}` : formatNumber(n, locale, decimals))
  const pct = (i: number) => formatPercent(slices[i].percent / 100, locale)
  const toneOf = (s: DonutSegment, i: number) => s.tone ?? (i % 5) + 1
  const prefix = label ? `${label}: ` : ''
  const summary = single ? `${prefix}${pct(0)}` : `${prefix}${items.map((s, i) => `${s.label} ${pct(i)}`).join(', ')}`
  const details = single
    ? [
        `${prefix}${pct(0)}${unit ? ` (${formatMessage(m.valueOfMax, { value: formatNumber(value, locale, decimals), max: withUnit(max) })})` : ''}`,
      ]
    : items.map((s, i) => `${s.label}: ${unit ? `${withUnit(s.value)} (${pct(i)})` : pct(i)}`)
  const gap = slices.filter((s) => s.length > 0).length > 1 ? 1 : 0
  const center = centerValue ?? (single ? pct(0) : null)
  return (
    <div className={cx(donutClass({ size }), className)}>
      <div className="k5-donut__chart" role="img" aria-label={summary}>
        <svg className="k5-donut__svg" viewBox="0 0 42 42" focusable="false" aria-hidden="true">
          <circle className="k5-donut__track" cx="21" cy="21" r="16" pathLength="100" />
          {slices.map((slice, i) => {
            const length = Math.max(0, Math.round((slice.length - gap) * 100) / 100)
            return length > 0 ? (
              <circle
                key={i}
                className={`k5-donut__segment k5-donut__tone--${toneOf(items[i], i)}`}
                cx="21"
                cy="21"
                r="16"
                pathLength="100"
                strokeDasharray={`${length} ${Math.round((100 - length) * 100) / 100}`}
                strokeDashoffset={String(Math.round((25 - slice.start - gap / 2) * 100) / 100)}
              />
            ) : null
          })}
        </svg>
        {center != null || centerLabel != null ? (
          <span className="k5-donut__center">
            {center != null ? <span className="k5-donut__value">{center}</span> : null}
            {centerLabel != null ? <span className="k5-donut__label">{centerLabel}</span> : null}
          </span>
        ) : null}
      </div>
      {(legend ?? !single) ? (
        <ul className="k5-donut__legend" aria-hidden="true">
          {items.map((s, i) => (
            <li key={i}>
              <span className={`k5-donut__swatch k5-donut__tone--${toneOf(s, i)}`} />
              <span className="k5-donut__name">{s.label}</span>
              <span className="k5-donut__percent">{pct(i)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <ul className="k5-sr-only">
        {details.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>
    </div>
  )
}
