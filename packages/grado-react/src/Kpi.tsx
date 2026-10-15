'use client'
import type { HTMLAttributes, ReactNode } from 'react'
import {
  ARROW_PATHS,
  cx,
  formatChange,
  kpiClass,
  kpiSparklineTone,
  kpiTrend,
  type KpiBetter,
  type KpiTone,
  type TrendDirection,
} from '@1k5-tech-es/grado/classes'
import { useGrado } from './Locale.js'
import { Sparkline } from './Sparkline.js'

const TREND_KEYS = { up: 'trendUp', down: 'trendDown', flat: 'trendFlat' } as const

export interface KpiGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Nombre del grupo para lectores de pantalla. */
  label?: string
}

export function KpiGroup({ label, className, ...rest }: KpiGroupProps) {
  const { messages: m } = useGrado()
  return <div {...rest} role="group" aria-label={label ?? m.indicators} className={cx('k5-kpis', className)} />
}

function TrendArrow({ direction }: { direction: TrendDirection }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ARROW_PATHS[direction].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

export interface KpiProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  label: ReactNode
  value: ReactNode
  /** Variación en %, por ejemplo -5.9. */
  change?: number | null
  /** Si subir es bueno (higher), malo (lower) o ninguna de las dos (neutral). */
  better?: KpiBetter
  /** Valor del periodo anterior; se muestra como «antes 136». */
  previous?: ReactNode
  previousLabel?: string
  /** Texto si no hay variación. */
  hint?: ReactNode
  tone?: KpiTone
  /** Se puede pulsar (por ejemplo para ver su gráfica). Se pinta como <button>. */
  selectable?: boolean
  selected?: boolean
  locale?: string
  /** Serie reciente (por ejemplo, los últimos 7 días): se dibuja como sparkline decorativa bajo la cifra. */
  trend?: number[]
  /** Se coloca junto al valor. */
  children?: ReactNode
}

export function Kpi({
  label,
  value,
  change,
  better = 'higher',
  previous,
  previousLabel,
  hint,
  tone,
  selectable = false,
  selected = false,
  locale,
  trend: series,
  className,
  children,
  ...rest
}: KpiProps) {
  const { messages: m, locale: contextLocale } = useGrado()
  const trend = kpiTrend(change, better)
  const Tag = selectable ? 'button' : 'div'
  const interactive = selectable ? { type: 'button' as const, 'aria-pressed': selected } : {}
  return (
    <Tag {...rest} {...interactive} className={cx(kpiClass({ tone }), className)}>
      <span className="k5-kpi__label">{label}</span>
      <span className="k5-kpi__row">
        <span className="k5-kpi__value">{value}</span>
        {children}
      </span>
      {series?.length ? <Sparkline className="k5-kpi__trend" data={series} tone={kpiSparklineTone(trend)} height={28} /> : null}
      <span className="k5-kpi__foot">
        {trend && change != null ? (
          <span className={`k5-kpi__change k5-kpi__change--${trend.tone}`}>
            <TrendArrow direction={trend.direction} />
            <span className="k5-sr-only">{`${m[TREND_KEYS[trend.direction]]} `}</span>
            {formatChange(change, locale ?? contextLocale)}
          </span>
        ) : null}
        {trend && previous != null ? (
          <span>
            {`${previousLabel ?? m.previous} `}
            {previous}
          </span>
        ) : hint != null ? (
          <span>{hint}</span>
        ) : null}
      </span>
    </Tag>
  )
}
