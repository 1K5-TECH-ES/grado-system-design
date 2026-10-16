import { defineComponent, h, type PropType } from 'vue'
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
import { areaPath, chartPoints, formatNumber, linePath, niceScale } from '@1k5-tech-es/grado/patterns'
import { useChartInteraction } from './chart-interaction.js'
import { useGrado } from './Locale.js'
import { labsMessages } from './labs-messages.js'
import { pathIcon } from './PathIcon.js'

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
export const SolarForecast = defineComponent({
  name: 'K5SolarForecast',
  props: {
    /** Producción prevista de cada franja del día, en kWh: 24 horas o 96 cuartos de hora. */
    forecast: { type: Array as PropType<number[]>, required: true },
    /** Producción real hasta ahora; las franjas sin dato van como null o se omiten. */
    actual: { type: Array as PropType<(number | null)[]>, default: () => [] },
    /** El tiempo previsto de cada franja: sun, partly, cloud o rain. */
    weather: Array as PropType<WeatherKind[]>,
    title: String,
    description: String,
    height: [String, Number],
    /** Tarjeta con los valores al pasar el ratón y flechas para recorrer las horas. Por defecto, true. */
    interactive: { type: Boolean, default: true },
  },
  setup(props) {
    const t = useGrado()
    const interaction = useChartInteraction()
    return () => {
      const core = t.value.messages,
        m = labsMessages(t.value),
        locale = t.value.locale
      const { forecast, actual, weather } = props
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
      const chart = interaction({
        count,
        interactive: props.interactive,
        hasTitle: props.title != null,
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
      const style = props.height == null ? undefined : { '--_plot': typeof props.height === 'number' ? `${props.height}px` : props.height }
      const every = Math.max(1, Math.round(count / 8))
      const last = produced[produced.length - 1]
      return h('figure', { class: 'k5-chart k5-chart--line k5-forecast', ...(style ? { style } : {}) }, [
        h('figcaption', { class: 'k5-chart__header' }, [
          props.title != null ? h('span', { class: 'k5-chart__title', id: chart.titleId }, props.title) : null,
          props.description != null ? h('span', { class: 'k5-chart__description' }, props.description) : null,
          h('span', { class: 'k5-forecast__summary' }, [
            h('span', null, [`${m.forecastExpected} `, h('strong', null, kwh(summary.forecastTotal))]),
            summary.done
              ? h('span', null, [
                  `${m.forecastActual} `,
                  h('strong', null, kwh(summary.actualTotal)),
                  ` ${formatMessage(m.forecastUntil, { time: hour(summary.done - 1).slice(6) })}`,
                ])
              : null,
            status ? h('span', { class: `k5-forecast__status k5-forecast__status--${summary.status}` }, status) : null,
          ]),
        ]),
        h('div', { class: 'k5-chart__body', ...chart.body }, [
          h(
            'div',
            { class: 'k5-chart__axis', ...chart.part },
            scale.ticks.map((tick) =>
              h('span', { key: tick, class: 'k5-chart__tick', style: { bottom: percent(tick, scale.max) } }, formatNumber(tick, locale, 1)),
            ),
          ),
          h('div', { class: cx('k5-chart__plot', chart.active != null && 'k5-chart__plot--active'), ...chart.part, ...chart.plot }, [
            ...scale.ticks
              .slice(1)
              .map((tick) => h('span', { key: tick, class: 'k5-chart__gridline', style: { bottom: percent(tick, scale.max) } })),
            h(
              'div',
              { class: 'k5-chart__columns' },
              forecast.map((_, i) => h('span', { key: i, class: 'k5-chart__column', 'data-active': i === chart.active || undefined })),
            ),
            h('svg', { class: 'k5-chart__svg', viewBox: '0 0 100 100', preserveAspectRatio: 'none', focusable: 'false' }, [
              h('g', { class: 'k5-forecast__expected' }, [
                h('path', { class: 'k5-chart__area', d: areaPath(expected) }),
                h('path', { class: 'k5-chart__line', d: linePath(expected) }),
              ]),
              produced.length
                ? h('g', { class: 'k5-forecast__actual' }, [h('path', { class: 'k5-chart__line', d: linePath(produced) })])
                : null,
            ]),
            last ? h('span', { class: 'k5-chart__point k5-forecast__now', style: { left: `${last.x}%`, top: `${last.y}%` } }) : null,
            chart.active != null
              ? h('span', { class: 'k5-chart__crosshair', style: { left: `${expected[chart.active]?.x ?? 0}%` } })
              : null,
            chart.tooltip,
          ]),
          weather?.length
            ? h(
                'div',
                { class: 'k5-forecast__weather', ...chart.part },
                forecast.map((_, i) =>
                  h(
                    'span',
                    { key: i, class: 'k5-forecast__weather-slot' },
                    i % every === 0 && weather[i] ? [pathIcon(WEATHER_ICON_PATHS[weather[i]])] : [],
                  ),
                ),
              )
            : null,
          h(
            'div',
            { class: 'k5-chart__categories', ...chart.part },
            forecast.map((_, i) =>
              h('span', { key: i, class: 'k5-chart__category' }, i % every === 0 ? `${Math.floor((i * 24) / count)} h` : ''),
            ),
          ),
          ...chart.speech,
        ]),
        h('ul', { class: 'k5-chart__legend' }, [
          h('li', null, [
            h('span', { class: 'k5-chart__swatch k5-forecast__swatch--expected', 'aria-hidden': 'true' }),
            m.forecastExpected,
          ]),
          h('li', null, [h('span', { class: 'k5-chart__swatch k5-forecast__swatch--actual', 'aria-hidden': 'true' }), m.forecastActual]),
        ]),
        h('table', { class: 'k5-sr-only' }, [
          h('caption', null, props.title ?? core.chartData),
          h('thead', null, [
            h('tr', null, [
              h('th', { scope: 'col' }, m.forecastHour),
              h('th', { scope: 'col' }, m.forecastExpected),
              h('th', { scope: 'col' }, m.forecastActual),
              weather?.length ? h('th', { scope: 'col' }, m.forecastWeather) : null,
            ]),
          ]),
          h(
            'tbody',
            null,
            forecast.map((value, i) =>
              h('tr', { key: i }, [
                h('th', { scope: 'row' }, hour(i)),
                h('td', null, kwh(value)),
                h('td', null, known(i) ? kwh(actual[i] as number) : '—'),
                weather?.length ? h('td', null, weather[i] ? m[WEATHER_TEXT[weather[i]]] : '—') : null,
              ]),
            ),
          ),
        ]),
      ])
    }
  },
})
