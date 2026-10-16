'use client'
import { forwardRef, type CSSProperties, type ForwardedRef, type ReactElement, type ReactNode, type Ref } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'
import { areaPath, chartPoints, formatNumber, linePath, niceScale, type ChartSeries } from '@1k5-tech-es/grado/patterns'
import { useChartInteraction } from './chart-interaction.js'
import { useGrado } from './Locale.js'

export interface LineChartProps<T extends object> {
  data: T[]
  /** Campo con el nombre de cada punto del eje horizontal: «Lun», «12 oct». */
  categoryKey: keyof T & string
  /** Una línea por campo numérico. tone elige el color chart-1 … chart-5. */
  series: ChartSeries[]
  /** Rellena el área bajo cada línea. */
  area?: boolean
  /** Unidad para la tabla accesible y los títulos: kWh, kW. */
  unit?: string
  title?: ReactNode
  description?: ReactNode
  /** Cabecera de la columna de categorías en la tabla accesible: «Día». */
  categoryLabel?: string
  /** Alto de la zona de líneas. Número en píxeles o medida CSS. */
  height?: number | string
  decimals?: number
  locale?: string
  /** Leyenda debajo. Por defecto, solo con más de una serie. */
  legend?: boolean
  /** Tarjeta con los valores al pasar el ratón y flechas para recorrer los datos. Por defecto, true. */
  interactive?: boolean
  className?: string
}

const percent = (value: number, max: number) => `${Math.round((Math.max(0, value) / max) * 10000) / 100}%`
const numberOf = (row: object, key: string) => {
  const raw = (row as Record<string, unknown>)[key]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : 0
}

/**
 * Series temporales con los colores del tema: producción y consumo diarios. Ejes y textos
 * en HTML, líneas en SVG. Para lectores de pantalla, los datos van en una tabla oculta.
 */
// forwardRef pierde el parámetro de tipo: el cast del final lo recupera.
export const LineChart = forwardRef(function LineChart<T extends object>(
  {
    data,
    categoryKey,
    series,
    area = false,
    unit,
    title,
    description,
    categoryLabel,
    height,
    decimals = 1,
    locale: localeProp,
    legend,
    interactive = true,
    className,
  }: LineChartProps<T>,
  ref: ForwardedRef<HTMLElement>,
) {
  const { messages: m, locale: contextLocale } = useGrado()
  const locale = localeProp ?? contextLocale
  const scale = niceScale(Math.max(0, ...data.flatMap((row) => series.map((s) => numberOf(row, s.key)))))
  const format = (value: number) => formatNumber(value, locale, decimals)
  const withUnit = (value: number) => (unit ? `${format(value)} ${unit}` : format(value))
  const category = (row: T) => String((row as Record<string, unknown>)[categoryKey] ?? '')
  const lines = series.map((s, j) => ({
    s,
    tone: s.tone ?? (j % 5) + 1,
    points: chartPoints(
      data.map((row) => numberOf(row, s.key)),
      scale.max,
    ),
  }))
  const chart = useChartInteraction({
    count: data.length,
    interactive,
    hasTitle: title != null,
    messages: m,
    row: (i) => ({
      title: category(data[i]),
      values: lines.map(({ s, tone }) => ({
        key: s.key,
        label: s.label,
        text: withUnit(numberOf(data[i], s.key)),
        swatch: `k5-chart__swatch k5-chart__swatch--line k5-chart__series--${tone}`,
      })),
    }),
  })
  const style = height == null ? undefined : ({ '--_plot': typeof height === 'number' ? `${height}px` : height } as CSSProperties)
  return (
    <figure ref={ref} className={cx('k5-chart', 'k5-chart--line', className)} style={style}>
      {title != null || description != null ? (
        <figcaption className="k5-chart__header">
          {title != null ? (
            <span className="k5-chart__title" id={chart.titleId}>
              {title}
            </span>
          ) : null}
          {description != null ? <span className="k5-chart__description">{description}</span> : null}
        </figcaption>
      ) : null}
      <div className="k5-chart__body" {...chart.body}>
        <div className="k5-chart__axis" {...chart.part}>
          {scale.ticks.map((tick) => (
            <span key={tick} className="k5-chart__tick" style={{ bottom: percent(tick, scale.max) }}>
              {format(tick)}
            </span>
          ))}
        </div>
        <div className={cx('k5-chart__plot', chart.active != null && 'k5-chart__plot--active')} {...chart.part} {...chart.plot}>
          {scale.ticks.slice(1).map((tick) => (
            <span key={tick} className="k5-chart__gridline" style={{ bottom: percent(tick, scale.max) }} />
          ))}
          <div className="k5-chart__columns">
            {data.map((row, i) => (
              <span
                key={i}
                className="k5-chart__column"
                title={
                  interactive
                    ? undefined
                    : [category(row), ...series.map((s) => `${s.label}: ${withUnit(numberOf(row, s.key))}`)].join(' · ')
                }
                data-active={i === chart.active || undefined}
              />
            ))}
          </div>
          <svg className="k5-chart__svg" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            {lines.map(({ s, tone, points }) => (
              <g key={s.key} className={`k5-chart__series k5-chart__series--${tone}`}>
                {area ? <path className="k5-chart__area" d={areaPath(points)} /> : null}
                <path className="k5-chart__line" d={linePath(points)} />
              </g>
            ))}
          </svg>
          {lines.map(({ s, tone, points }) =>
            points.length ? (
              <span
                key={s.key}
                className={`k5-chart__point k5-chart__series--${tone}`}
                style={{ left: `${points[points.length - 1].x}%`, top: `${points[points.length - 1].y}%` }}
              />
            ) : null,
          )}
          {chart.active != null ? (
            <>
              <span className="k5-chart__crosshair" style={{ left: `${lines[0]?.points[chart.active]?.x ?? 0}%` }} />
              {lines.map(({ s, tone, points }) => (
                <span
                  key={s.key}
                  className={`k5-chart__point k5-chart__point--active k5-chart__series--${tone}`}
                  style={{ left: `${points[chart.active!].x}%`, top: `${points[chart.active!].y}%` }}
                />
              ))}
            </>
          ) : null}
          {chart.tooltip}
        </div>
        <div className="k5-chart__categories" {...chart.part}>
          {data.map((row, i) => (
            <span key={i} className="k5-chart__category">
              {category(row)}
            </span>
          ))}
        </div>
        {chart.speech}
      </div>
      {(legend ?? series.length > 1) ? (
        <ul className="k5-chart__legend">
          {lines.map(({ s, tone }) => (
            <li key={s.key}>
              <span className={`k5-chart__swatch k5-chart__swatch--line k5-chart__series--${tone}`} aria-hidden="true" />
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
}) as unknown as <T extends object>(props: LineChartProps<T> & { ref?: Ref<HTMLElement> }) => ReactElement | null

/** LineChart con el área rellena por defecto. */
export const AreaChart = forwardRef(function AreaChart<T extends object>(props: LineChartProps<T>, ref: ForwardedRef<HTMLElement>) {
  return <LineChart {...props} ref={ref} area={props.area ?? true} />
}) as unknown as <T extends object>(props: LineChartProps<T> & { ref?: Ref<HTMLElement> }) => ReactElement | null
