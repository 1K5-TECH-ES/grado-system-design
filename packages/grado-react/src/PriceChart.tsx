'use client'
import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'
import {
  formatNumber,
  niceScale,
  priceExtremes,
  priceSlots,
  slotAt,
  slotCenter,
  type PriceSlot,
  type TariffPeriod,
} from '@1k5-tech-es/grado/patterns'
import { useChartInteraction } from './chart-interaction.js'
import { useGrado } from './Locale.js'

export interface PriceChartProps {
  /** Precio de cada franja del día, en orden: 24 (horas) o 96 (cuartos de hora). */
  prices: (number | null)[]
  /** Día de los precios (YYYY-MM-DD). Sábados, domingos y festivos nacionales son valle todo el día. */
  date?: string
  /** Más festivos en los que todo el día es valle (YYYY-MM-DD). */
  holidays?: string[]
  /** Periodo de cada franja si no es el de la 2.0TD en la península (Ceuta, Melilla, otra tarifa). */
  periods?: TariffPeriod[]
  /** Hora de ahora («HH:MM»): marca su franja. */
  now?: string
  unit?: string
  decimals?: number
  title?: ReactNode
  description?: ReactNode
  /** Franjas más barata y más cara bajo el título. Por defecto, true. */
  summary?: boolean
  /** Alto de las barras. Número en píxeles o medida CSS. */
  height?: number | string
  /** Leyenda de los periodos. Por defecto, true. */
  legend?: boolean
  /** Tarjeta con el precio al pasar el ratón y flechas para recorrer las franjas. Por defecto, true. */
  interactive?: boolean
  locale?: string
  className?: string
}

const PERIODS: TariffPeriod[] = ['valle', 'llano', 'punta']
const KEYS = { valle: 'tariffValle', llano: 'tariffLlano', punta: 'tariffPunta' } as const
const percent = (value: number, max: number) => `${Math.round((Math.max(0, value) / max) * 10000) / 100}%`

/**
 * Precio de la luz de un día, por horas o por cuartos de hora, con cada franja del color de su
 * periodo de la tarifa 2.0TD (valle, llano y punta). Para lectores de pantalla, los precios van
 * en una tabla oculta.
 */
export const PriceChart = forwardRef<HTMLElement, PriceChartProps>(function PriceChart(
  {
    prices,
    date,
    holidays,
    periods,
    now,
    unit = '€/kWh',
    decimals = 3,
    title,
    description,
    summary = true,
    height,
    legend = true,
    interactive = true,
    locale: localeProp,
    className,
  },
  ref,
) {
  const { messages: m, locale: contextLocale } = useGrado()
  const locale = localeProp ?? contextLocale
  const slots = priceSlots(prices, { date, holidays, periods })
  const scale = niceScale(Math.max(0, ...slots.map((slot) => slot.price ?? 0)))
  const withUnit = (value: number | null) => (value == null ? '—' : `${formatNumber(value, locale, decimals)} ${unit}`)
  const span = (slot: PriceSlot) => `${slot.start}–${slot.end}`
  const current = slotAt(slots, now)
  const { cheapest, dearest } = priceExtremes(slots)
  const chart = useChartInteraction({
    count: slots.length,
    interactive,
    hasTitle: title != null,
    messages: m,
    row: (i) => ({
      title: span(slots[i]),
      values: [
        {
          key: 'price',
          label: m[KEYS[slots[i].period]],
          text: withUnit(slots[i].price),
          swatch: `k5-chart__swatch k5-price__bar--${slots[i].period}`,
        },
      ],
    }),
  })
  const style = height == null ? undefined : ({ '--_plot': typeof height === 'number' ? `${height}px` : height } as CSSProperties)
  return (
    <figure ref={ref} className={cx('k5-chart', 'k5-price', slots.length > 48 && 'k5-price--fine', className)} style={style}>
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
      {summary && cheapest && dearest ? (
        <p className="k5-price__summary">
          <span>
            {`${m.priceCheapest}: `}
            <strong>{`${span(cheapest)} · ${withUnit(cheapest.price)}`}</strong>
          </span>
          <span>
            {`${m.priceDearest}: `}
            <strong>{`${span(dearest)} · ${withUnit(dearest.price)}`}</strong>
          </span>
        </p>
      ) : null}
      <div className="k5-chart__body" {...chart.body}>
        <div className="k5-chart__axis" {...chart.part}>
          {scale.ticks.map((tick) => (
            <span key={tick} className="k5-chart__tick" style={{ bottom: percent(tick, scale.max) }}>
              {formatNumber(tick, locale, 2)}
            </span>
          ))}
        </div>
        <div className={cx('k5-chart__plot', chart.active != null && 'k5-chart__plot--active')} {...chart.part} {...chart.plot}>
          {scale.ticks.slice(1).map((tick) => (
            <span key={tick} className="k5-chart__gridline" style={{ bottom: percent(tick, scale.max) }} />
          ))}
          <div className="k5-chart__groups">
            {slots.map((slot) => (
              <div
                key={slot.index}
                className="k5-chart__group"
                data-active={slot.index === chart.active || undefined}
                data-current={slot.index === current || undefined}
              >
                <div className="k5-chart__bars">
                  <span
                    className={`k5-chart__bar k5-price__bar--${slot.period}`}
                    style={{ height: percent(slot.price ?? 0, scale.max) }}
                    title={interactive ? undefined : `${span(slot)} · ${m[KEYS[slot.period]]}: ${withUnit(slot.price)}`}
                  />
                </div>
              </div>
            ))}
          </div>
          {current >= 0 ? (
            <span className="k5-price__now" style={{ left: `${slotCenter(current, slots.length)}%` }}>
              {m.priceNow}
            </span>
          ) : null}
          {chart.tooltip}
        </div>
        <div className="k5-chart__categories" {...chart.part}>
          {slots.map((slot) => (
            <span key={slot.index} className="k5-chart__category">
              {slot.start.endsWith(':00') && slot.hour % 6 === 0 ? `${slot.hour} h` : ''}
            </span>
          ))}
        </div>
        {chart.speech}
      </div>
      {legend ? (
        <ul className="k5-chart__legend">
          {PERIODS.map((period) => (
            <li key={period}>
              <span className={`k5-chart__swatch k5-price__bar--${period}`} aria-hidden="true" />
              {m[KEYS[period]]}
            </li>
          ))}
        </ul>
      ) : null}
      <table className="k5-sr-only">
        <caption>{title ?? m.chartData}</caption>
        <thead>
          <tr>
            <th scope="col">{m.priceHour}</th>
            <th scope="col">{m.tariffPeriod}</th>
            <th scope="col">{m.price}</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.index}>
              <th scope="row">{span(slot)}</th>
              <td>{m[KEYS[slot.period]]}</td>
              <td>{withUnit(slot.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
})
