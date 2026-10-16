'use client'
import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'
import {
  forecastSummary,
  formatAmount,
  formatEnergy,
  slotLabel,
  WEATHER_ICON_PATHS,
  type LabsMessageKey,
  type WeatherKind,
} from '@1k5-tech-es/grado/labs'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { areaPath, chartPoints, linePath, niceScale, formatNumber } from '@1k5-tech-es/grado/patterns'
import { useChartInteraction } from './chart-interaction.js'
import { useGrado } from './Locale.js'
import { useLabsMessages } from './labs-messages.js'
import { PathIcon } from './PathIcon.js'

export interface SolarForecastProps {
  /** Producción prevista de cada franja del día, en kWh: 24 horas o 96 cuartos de hora. */
  forecast: number[]
  /** Producción real hasta ahora; las franjas sin dato van como null o se omiten. */
  actual?: (number | null)[]
  /** El tiempo previsto de cada franja: sun, partly, cloud o rain. */
  weather?: WeatherKind[]
  title?: ReactNode
  description?: ReactNode
  height?: string | number
  /** Tarjeta con los valores al pasar el ratón y flechas para recorrer las horas. Por defecto, true. */
  interactive?: boolean
  className?: string
}

const percent = (value: number, max: number) => `${Math.round((Math.max(0, value) / max) * 10000) / 100}%`
const WEATHER_TEXT: Record<WeatherKind, LabsMessageKey> = {
  sun: 'weatherSun',
  partly: 'weatherPartly',
  cloud: 'weatherCloud',
  rain: 'weatherRain',
}

/**
 * La producción solar prevista para hoy frente a la real, hora a hora, con el tiempo. El resumen
 * dice cuánto se espera en el día y si va por encima o por debajo de lo previsto.
 */
export const SolarForecast = forwardRef<HTMLElement, SolarForecastProps>(function SolarForecast(
  { forecast, actual = [], weather, title, description, height, interactive = true, className },
  ref,
) {
  const { messages: core, locale } = useGrado()
  const m = useLabsMessages()
  const count = forecast.length
  const summary = forecastSummary({ forecast, actual })
  const known = (i: number) => i < summary.done && typeof actual[i] === 'number'
  const scale = niceScale(Math.max(0, ...forecast, ...actual.map((v) => (typeof v === 'number' ? v : 0))))
  const expected = chartPoints(forecast, scale.max)
  const produced = chartPoints(
    actual.slice(0, summary.done).map((v) => (typeof v === 'number' ? v : 0)),
    scale.max,
  ).map((point, i) => ({ ...point, x: expected[i]?.x ?? point.x }))
  const kwh = (value: number) => formatEnergy(value, { locale, decimals: 1 })
  const hour = (i: number) => slotLabel(i, count)
  const status =
    summary.status === 'above'
      ? formatMessage(m.forecastAbove, { value: formatAmount(summary.deviation, { unit: 'percent', locale }) })
      : summary.status === 'below'
        ? formatMessage(m.forecastBelow, { value: formatAmount(-(summary.deviation ?? 0), { unit: 'percent', locale }) })
        : summary.status === 'on-track'
          ? m.forecastOnTrack
          : null
  const chart = useChartInteraction({
    count,
    interactive,
    hasTitle: title != null,
    messages: core,
    row: (i) => ({
      title: hour(i),
      values: [
        {
          key: 'expected',
          label: m.forecastExpected,
          text: kwh(forecast[i] ?? 0),
          swatch: 'k5-chart__swatch k5-forecast__swatch--expected',
        },
        ...(known(i)
          ? [
              {
                key: 'actual',
                label: m.forecastActual,
                text: kwh(actual[i] as number),
                swatch: 'k5-chart__swatch k5-forecast__swatch--actual',
              },
            ]
          : []),
        ...(weather?.[i]
          ? [{ key: 'weather', label: m.forecastWeather, text: m[WEATHER_TEXT[weather[i]]], swatch: 'k5-forecast__swatch--none' }]
          : []),
      ],
    }),
  })
  const style = height == null ? undefined : ({ '--_plot': typeof height === 'number' ? `${height}px` : height } as CSSProperties)
  const every = Math.max(1, Math.round(count / 8))
  return (
    <figure ref={ref} className={cx('k5-chart', 'k5-chart--line', 'k5-forecast', className)} style={style}>
      <figcaption className="k5-chart__header">
        {title != null ? (
          <span className="k5-chart__title" id={chart.titleId}>
            {title}
          </span>
        ) : null}
        {description != null ? <span className="k5-chart__description">{description}</span> : null}
        <span className="k5-forecast__summary">
          <span>
            {m.forecastExpected} <strong>{kwh(summary.forecastTotal)}</strong>
          </span>
          {summary.done ? (
            <span>
              {m.forecastActual} <strong>{kwh(summary.actualTotal)}</strong>{' '}
              {formatMessage(m.forecastUntil, { time: hour(summary.done - 1).slice(6) })}
            </span>
          ) : null}
          {status ? <span className={`k5-forecast__status k5-forecast__status--${summary.status}`}>{status}</span> : null}
        </span>
      </figcaption>
      <div className="k5-chart__body" {...chart.body}>
        <div className="k5-chart__axis" {...chart.part}>
          {scale.ticks.map((tick) => (
            <span key={tick} className="k5-chart__tick" style={{ bottom: percent(tick, scale.max) }}>
              {formatNumber(tick, locale, 1)}
            </span>
          ))}
        </div>
        <div className={cx('k5-chart__plot', chart.active != null && 'k5-chart__plot--active')} {...chart.part} {...chart.plot}>
          {scale.ticks.slice(1).map((tick) => (
            <span key={tick} className="k5-chart__gridline" style={{ bottom: percent(tick, scale.max) }} />
          ))}
          <div className="k5-chart__columns">
            {forecast.map((_, i) => (
              <span key={i} className="k5-chart__column" data-active={i === chart.active || undefined} />
            ))}
          </div>
          <svg className="k5-chart__svg" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            <g className="k5-forecast__expected">
              <path className="k5-chart__area" d={areaPath(expected)} />
              <path className="k5-chart__line" d={linePath(expected)} />
            </g>
            {produced.length ? (
              <g className="k5-forecast__actual">
                <path className="k5-chart__line" d={linePath(produced)} />
              </g>
            ) : null}
          </svg>
          {produced.length ? (
            <span
              className="k5-chart__point k5-forecast__now"
              style={{ left: `${produced[produced.length - 1].x}%`, top: `${produced[produced.length - 1].y}%` }}
            />
          ) : null}
          {chart.active != null ? <span className="k5-chart__crosshair" style={{ left: `${expected[chart.active]?.x ?? 0}%` }} /> : null}
          {chart.tooltip}
        </div>
        {weather?.length ? (
          <div className="k5-forecast__weather" {...chart.part}>
            {forecast.map((_, i) => (
              <span key={i} className="k5-forecast__weather-slot">
                {i % every === 0 && weather[i] ? <PathIcon paths={WEATHER_ICON_PATHS[weather[i]]} /> : null}
              </span>
            ))}
          </div>
        ) : null}
        <div className="k5-chart__categories" {...chart.part}>
          {forecast.map((_, i) => (
            <span key={i} className="k5-chart__category">
              {i % every === 0 ? `${Math.floor((i * 24) / count)} h` : ''}
            </span>
          ))}
        </div>
        {chart.speech}
      </div>
      <ul className="k5-chart__legend">
        <li>
          <span className="k5-chart__swatch k5-forecast__swatch--expected" aria-hidden="true" />
          {m.forecastExpected}
        </li>
        <li>
          <span className="k5-chart__swatch k5-forecast__swatch--actual" aria-hidden="true" />
          {m.forecastActual}
        </li>
      </ul>
      <table className="k5-sr-only">
        <caption>{title ?? core.chartData}</caption>
        <thead>
          <tr>
            <th scope="col">{m.forecastHour}</th>
            <th scope="col">{m.forecastExpected}</th>
            <th scope="col">{m.forecastActual}</th>
            {weather?.length ? <th scope="col">{m.forecastWeather}</th> : null}
          </tr>
        </thead>
        <tbody>
          {forecast.map((value, i) => (
            <tr key={i}>
              <th scope="row">{hour(i)}</th>
              <td>{kwh(value)}</td>
              <td>{known(i) ? kwh(actual[i] as number) : '—'}</td>
              {weather?.length ? <td>{weather[i] ? m[WEATHER_TEXT[weather[i]]] : '—'}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
})
