'use client'
import type { CSSProperties, ReactNode } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'
import { formatNumber, niceScale, type ChartSeries } from '@1k5-tech-es/grado/patterns'
import { useGrado } from './Locale.js'

export interface BarChartProps<T extends object> {
  data: T[]
  /** Campo con el nombre de cada barra o grupo: «S1», «Octubre». */
  categoryKey: keyof T & string
  /** Una serie por campo numérico. tone elige el color chart-1 … chart-5. */
  series: ChartSeries[]
  /** Apila las series en una sola barra en lugar de ponerlas una al lado de otra. */
  stacked?: boolean
  /** Unidad para la tabla accesible y los títulos de las barras: kWh, €. */
  unit?: string
  title?: ReactNode
  description?: ReactNode
  /** Cabecera de la columna de categorías en la tabla accesible: «Semana». */
  categoryLabel?: string
  /** Alto de la zona de barras. Número en píxeles o medida CSS. */
  height?: number | string
  decimals?: number
  locale?: string
  /** Leyenda debajo. Por defecto, solo con más de una serie. */
  legend?: boolean
  className?: string
}

const percent = (value: number, max: number) => `${Math.round((Math.max(0, value) / max) * 10000) / 100}%`
const numberOf = (row: object, key: string) => {
  const raw = (row as Record<string, unknown>)[key]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : 0
}

/**
 * Barras agrupadas o apiladas con los colores del tema. El dibujo es decorativo para los
 * lectores de pantalla: los datos van en una tabla oculta con los mismos valores.
 */
export function BarChart<T extends object>({
  data,
  categoryKey,
  series,
  stacked = false,
  unit,
  title,
  description,
  categoryLabel,
  height,
  decimals = 1,
  locale: localeProp,
  legend,
  className,
}: BarChartProps<T>) {
  const { messages: m, locale: contextLocale } = useGrado()
  const locale = localeProp ?? contextLocale
  const totals = data.map((row) => {
    const values = series.map((s) => numberOf(row, s.key))
    return stacked ? values.reduce((a, b) => a + b, 0) : Math.max(0, ...values)
  })
  const scale = niceScale(Math.max(0, ...totals))
  const format = (value: number) => formatNumber(value, locale, decimals)
  const withUnit = (value: number) => (unit ? `${format(value)} ${unit}` : format(value))
  const tone = (s: ChartSeries, index: number) => s.tone ?? (index % 5) + 1
  const category = (row: T) => String((row as Record<string, unknown>)[categoryKey] ?? '')
  const style = height == null ? undefined : ({ '--_plot': typeof height === 'number' ? `${height}px` : height } as CSSProperties)
  return (
    <figure className={cx('k5-chart', className)} style={style}>
      {title != null || description != null ? (
        <figcaption className="k5-chart__header">
          {title != null ? <span className="k5-chart__title">{title}</span> : null}
          {description != null ? <span className="k5-chart__description">{description}</span> : null}
        </figcaption>
      ) : null}
      <div className="k5-chart__body" aria-hidden="true">
        <div className="k5-chart__axis">
          {scale.ticks.map((tick) => (
            <span key={tick} className="k5-chart__tick" style={{ bottom: percent(tick, scale.max) }}>
              {format(tick)}
            </span>
          ))}
        </div>
        <div className="k5-chart__plot">
          {scale.ticks.slice(1).map((tick) => (
            <span key={tick} className="k5-chart__gridline" style={{ bottom: percent(tick, scale.max) }} />
          ))}
          <div className="k5-chart__groups">
            {data.map((row, i) => (
              <div key={i} className="k5-chart__group">
                <div className={cx('k5-chart__bars', stacked && 'k5-chart__bars--stacked')}>
                  {series.map((s, j) => (
                    <span
                      key={s.key}
                      className={`k5-chart__bar k5-chart__bar--${tone(s, j)}`}
                      style={{ height: percent(numberOf(row, s.key), scale.max) }}
                      title={`${category(row)} · ${s.label}: ${withUnit(numberOf(row, s.key))}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="k5-chart__categories">
          {data.map((row, i) => (
            <span key={i} className="k5-chart__category">
              {category(row)}
            </span>
          ))}
        </div>
      </div>
      {(legend ?? series.length > 1) ? (
        <ul className="k5-chart__legend">
          {series.map((s, j) => (
            <li key={s.key}>
              <span className={`k5-chart__swatch k5-chart__bar--${tone(s, j)}`} aria-hidden="true" />
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}
      <table className="k5-sr-only">
        <caption>{title ?? m.chartData}</caption>
        <thead>
          <tr>
            {categoryLabel ? <th scope="col">{categoryLabel}</th> : <td />}
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <th scope="row">{category(row)}</th>
              {series.map((s) => (
                <td key={s.key}>{withUnit(numberOf(row, s.key))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
