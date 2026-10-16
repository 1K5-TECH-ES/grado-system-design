import { computed, defineComponent, h, type PropType } from 'vue'
import { cx } from '@1k5-tech-es/grado/classes'
import { areaPath, chartPoints, formatNumber, linePath, niceScale, type ChartSeries } from '@1k5-tech-es/grado/patterns'
import { useChartInteraction } from './chart-interaction.js'
import { useGrado } from './Locale.js'

const percent = (value: number, max: number) => `${Math.round((Math.max(0, value) / max) * 10000) / 100}%`
const numberOf = (row: Record<string, unknown>, key: string) => {
  const raw = row[key]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : 0
}

const make = (name: string, areaDefault: boolean) =>
  defineComponent({
    name,
    props: {
      data: { type: Array as PropType<Record<string, unknown>[]>, required: true },
      /** Campo con el nombre de cada punto del eje horizontal: «Lun», «12 oct». */
      categoryKey: { type: String, required: true },
      /** Una línea por campo numérico. tone elige el color chart-1 … chart-5. */
      series: { type: Array as PropType<ChartSeries[]>, required: true },
      /** Rellena el área bajo cada línea. */
      area: { type: Boolean, default: areaDefault },
      unit: String,
      title: String,
      description: String,
      categoryLabel: String,
      height: [Number, String],
      decimals: { type: Number, default: 1 },
      locale: String,
      legend: { type: Boolean, default: undefined },
      /** Tarjeta con los valores al pasar el ratón y flechas para recorrer los datos. Por defecto, true. */
      interactive: { type: Boolean, default: true },
    },
    setup(props) {
      const t = useGrado()
      const interaction = useChartInteraction()
      const locale = computed(() => props.locale ?? t.value.locale)
      return () => {
        const m = t.value.messages
        const scale = niceScale(Math.max(0, ...props.data.flatMap((row) => props.series.map((s) => numberOf(row, s.key)))))
        const format = (value: number) => formatNumber(value, locale.value, props.decimals)
        const withUnit = (value: number) => (props.unit ? `${format(value)} ${props.unit}` : format(value))
        const category = (row: Record<string, unknown>) => String(row[props.categoryKey] ?? '')
        const lines = props.series.map((s, j) => ({
          s,
          tone: s.tone ?? (j % 5) + 1,
          points: chartPoints(
            props.data.map((row) => numberOf(row, s.key)),
            scale.max,
          ),
        }))
        const style =
          props.height == null ? undefined : { '--_plot': typeof props.height === 'number' ? `${props.height}px` : props.height }
        const showLegend = props.legend ?? props.series.length > 1
        const chart = interaction({
          count: props.data.length,
          interactive: props.interactive,
          hasTitle: props.title != null,
          messages: m,
          row: (i) => ({
            title: category(props.data[i]),
            values: lines.map(({ s, tone }) => ({
              key: s.key,
              label: s.label,
              text: withUnit(numberOf(props.data[i], s.key)),
              swatch: `k5-chart__swatch k5-chart__swatch--line k5-chart__series--${tone}`,
            })),
          }),
        })
        const at = chart.active
        return h('figure', style ? { class: 'k5-chart k5-chart--line', style } : { class: 'k5-chart k5-chart--line' }, [
          props.title != null || props.description != null
            ? h('figcaption', { class: 'k5-chart__header' }, [
                props.title != null ? h('span', { class: 'k5-chart__title', id: chart.titleId }, props.title) : null,
                props.description != null ? h('span', { class: 'k5-chart__description' }, props.description) : null,
              ])
            : null,
          h('div', { class: 'k5-chart__body', ...chart.body }, [
            h(
              'div',
              { class: 'k5-chart__axis', ...chart.part },
              scale.ticks.map((tick) =>
                h('span', { key: tick, class: 'k5-chart__tick', style: { bottom: percent(tick, scale.max) } }, format(tick)),
              ),
            ),
            h('div', { class: cx('k5-chart__plot', at != null && 'k5-chart__plot--active'), ...chart.part, ...chart.plot }, [
              ...scale.ticks
                .slice(1)
                .map((tick) => h('span', { key: tick, class: 'k5-chart__gridline', style: { bottom: percent(tick, scale.max) } })),
              h(
                'div',
                { class: 'k5-chart__columns' },
                props.data.map((row, i) =>
                  h('span', {
                    key: i,
                    class: 'k5-chart__column',
                    title: props.interactive
                      ? undefined
                      : [category(row), ...props.series.map((s) => `${s.label}: ${withUnit(numberOf(row, s.key))}`)].join(' · '),
                    'data-active': i === at ? true : undefined,
                  }),
                ),
              ),
              h(
                'svg',
                { class: 'k5-chart__svg', viewBox: '0 0 100 100', preserveAspectRatio: 'none', focusable: 'false' },
                lines.map(({ s, tone, points }) =>
                  h('g', { key: s.key, class: `k5-chart__series k5-chart__series--${tone}` }, [
                    props.area ? h('path', { class: 'k5-chart__area', d: areaPath(points) }) : null,
                    h('path', { class: 'k5-chart__line', d: linePath(points) }),
                  ]),
                ),
              ),
              ...lines.map(({ s, tone, points }) =>
                points.length
                  ? h('span', {
                      key: s.key,
                      class: `k5-chart__point k5-chart__series--${tone}`,
                      style: { left: `${points[points.length - 1].x}%`, top: `${points[points.length - 1].y}%` },
                    })
                  : null,
              ),
              ...(at != null
                ? [
                    h('span', { class: 'k5-chart__crosshair', style: { left: `${lines[0]?.points[at]?.x ?? 0}%` } }),
                    ...lines.map(({ s, tone, points }) =>
                      h('span', {
                        key: s.key,
                        class: `k5-chart__point k5-chart__point--active k5-chart__series--${tone}`,
                        style: { left: `${points[at].x}%`, top: `${points[at].y}%` },
                      }),
                    ),
                  ]
                : []),
              chart.tooltip,
            ]),
            h(
              'div',
              { class: 'k5-chart__categories', ...chart.part },
              props.data.map((row, i) => h('span', { key: i, class: 'k5-chart__category' }, category(row))),
            ),
            ...chart.speech,
          ]),
          showLegend
            ? h(
                'ul',
                { class: 'k5-chart__legend' },
                lines.map(({ s, tone }) =>
                  h('li', { key: s.key }, [
                    h('span', { class: `k5-chart__swatch k5-chart__swatch--line k5-chart__series--${tone}`, 'aria-hidden': 'true' }),
                    s.label,
                  ]),
                ),
              )
            : null,
          h('table', { class: 'k5-sr-only' }, [
            h('caption', null, props.title ?? m.chartData),
            h('thead', null, [
              h('tr', null, [
                props.categoryLabel ? h('th', { scope: 'col' }, props.categoryLabel) : h('td'),
                ...props.series.map((s) => h('th', { key: s.key, scope: 'col' }, s.label)),
              ]),
            ]),
            h(
              'tbody',
              null,
              props.data.map((row, i) =>
                h('tr', { key: i }, [
                  h('th', { scope: 'row' }, category(row)),
                  ...props.series.map((s) => h('td', { key: s.key }, withUnit(numberOf(row, s.key)))),
                ]),
              ),
            ),
          ]),
        ])
      }
    },
  })

/**
 * Series temporales con los colores del tema: producción y consumo diarios. Ejes y textos
 * en HTML, líneas en SVG. Para lectores de pantalla, los datos van en una tabla oculta.
 */
export const LineChart = make('K5LineChart', false)
/** LineChart con el área rellena por defecto. */
export const AreaChart = make('K5AreaChart', true)
