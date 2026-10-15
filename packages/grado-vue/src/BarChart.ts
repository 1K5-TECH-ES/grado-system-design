import { computed, defineComponent, h, type PropType } from 'vue'
import { cx } from '@1k5-tech-es/grado/classes'
import { formatNumber, niceScale, type ChartSeries } from '@1k5-tech-es/grado/patterns'
import { useGrado } from './Locale.js'

const percent = (value: number, max: number) => `${Math.round((Math.max(0, value) / max) * 10000) / 100}%`
const numberOf = (row: Record<string, unknown>, key: string) => {
  const raw = row[key]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : 0
}

/**
 * Barras agrupadas o apiladas con los colores del tema. El dibujo es decorativo para los
 * lectores de pantalla: los datos van en una tabla oculta con los mismos valores.
 */
export const BarChart = defineComponent({
  name: 'K5BarChart',
  props: {
    data: { type: Array as PropType<Record<string, unknown>[]>, required: true },
    /** Campo con el nombre de cada barra o grupo: «S1», «Octubre». */
    categoryKey: { type: String, required: true },
    /** Una serie por campo numérico. tone elige el color chart-1 … chart-5. */
    series: { type: Array as PropType<ChartSeries[]>, required: true },
    stacked: Boolean,
    unit: String,
    title: String,
    description: String,
    categoryLabel: String,
    height: [Number, String],
    decimals: { type: Number, default: 1 },
    locale: String,
    legend: { type: Boolean, default: undefined },
  },
  setup(props) {
    const t = useGrado()
    const locale = computed(() => props.locale ?? t.value.locale)
    return () => {
      const m = t.value.messages
      const totals = props.data.map((row) => {
        const values = props.series.map((s) => numberOf(row, s.key))
        return props.stacked ? values.reduce((a, b) => a + b, 0) : Math.max(0, ...values)
      })
      const scale = niceScale(Math.max(0, ...totals))
      const format = (value: number) => formatNumber(value, locale.value, props.decimals)
      const withUnit = (value: number) => (props.unit ? `${format(value)} ${props.unit}` : format(value))
      const tone = (s: ChartSeries, index: number) => s.tone ?? (index % 5) + 1
      const category = (row: Record<string, unknown>) => String(row[props.categoryKey] ?? '')
      const style = props.height == null ? undefined : { '--_plot': typeof props.height === 'number' ? `${props.height}px` : props.height }
      const showLegend = props.legend ?? props.series.length > 1
      return h('figure', { class: 'k5-chart', style }, [
        props.title != null || props.description != null
          ? h('figcaption', { class: 'k5-chart__header' }, [
              props.title != null ? h('span', { class: 'k5-chart__title' }, props.title) : null,
              props.description != null ? h('span', { class: 'k5-chart__description' }, props.description) : null,
            ])
          : null,
        h('div', { class: 'k5-chart__body', 'aria-hidden': 'true' }, [
          h(
            'div',
            { class: 'k5-chart__axis' },
            scale.ticks.map((tick) =>
              h('span', { key: tick, class: 'k5-chart__tick', style: { bottom: percent(tick, scale.max) } }, format(tick)),
            ),
          ),
          h('div', { class: 'k5-chart__plot' }, [
            ...scale.ticks
              .slice(1)
              .map((tick) => h('span', { key: tick, class: 'k5-chart__gridline', style: { bottom: percent(tick, scale.max) } })),
            h(
              'div',
              { class: 'k5-chart__groups' },
              props.data.map((row, i) =>
                h('div', { key: i, class: 'k5-chart__group' }, [
                  h(
                    'div',
                    { class: cx('k5-chart__bars', props.stacked && 'k5-chart__bars--stacked') },
                    props.series.map((s, j) =>
                      h('span', {
                        key: s.key,
                        class: `k5-chart__bar k5-chart__bar--${tone(s, j)}`,
                        style: { height: percent(numberOf(row, s.key), scale.max) },
                        title: `${category(row)} · ${s.label}: ${withUnit(numberOf(row, s.key))}`,
                      }),
                    ),
                  ),
                ]),
              ),
            ),
          ]),
          h(
            'div',
            { class: 'k5-chart__categories' },
            props.data.map((row, i) => h('span', { key: i, class: 'k5-chart__category' }, category(row))),
          ),
        ]),
        showLegend
          ? h(
              'ul',
              { class: 'k5-chart__legend' },
              props.series.map((s, j) =>
                h('li', { key: s.key }, [
                  h('span', { class: `k5-chart__swatch k5-chart__bar--${tone(s, j)}`, 'aria-hidden': 'true' }),
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
