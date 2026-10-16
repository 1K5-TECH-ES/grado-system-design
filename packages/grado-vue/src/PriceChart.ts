import { computed, defineComponent, h, type PropType } from 'vue'
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

const PERIODS: TariffPeriod[] = ['valle', 'llano', 'punta']
const KEYS = { valle: 'tariffValle', llano: 'tariffLlano', punta: 'tariffPunta' } as const
const percent = (value: number, max: number) => `${Math.round((Math.max(0, value) / max) * 10000) / 100}%`

/**
 * Precio de la luz de un día, por horas o por cuartos de hora, con cada franja del color de su
 * periodo de la tarifa 2.0TD (valle, llano y punta). Para lectores de pantalla, los precios van
 * en una tabla oculta.
 */
export const PriceChart = defineComponent({
  name: 'K5PriceChart',
  props: {
    /** Precio de cada franja del día, en orden: 24 (horas) o 96 (cuartos de hora). */
    prices: { type: Array as PropType<(number | null)[]>, required: true },
    /** Día de los precios (YYYY-MM-DD). Sábados, domingos y festivos nacionales son valle todo el día. */
    date: String,
    /** Más festivos en los que todo el día es valle (YYYY-MM-DD). */
    holidays: Array as PropType<string[]>,
    /** Periodo de cada franja si no es el de la 2.0TD en la península. */
    periods: Array as PropType<TariffPeriod[]>,
    /** Hora de ahora («HH:MM»): marca su franja. */
    now: String,
    unit: { type: String, default: '€/kWh' },
    decimals: { type: Number, default: 3 },
    title: String,
    description: String,
    /** Franjas más barata y más cara bajo el título. */
    summary: { type: Boolean, default: true },
    height: [Number, String],
    legend: { type: Boolean, default: true },
    /** Tarjeta con el precio al pasar el ratón y flechas para recorrer las franjas. */
    interactive: { type: Boolean, default: true },
    locale: String,
  },
  setup(props) {
    const t = useGrado()
    const interaction = useChartInteraction()
    const locale = computed(() => props.locale ?? t.value.locale)
    return () => {
      const m = t.value.messages
      const slots = priceSlots(props.prices, { date: props.date, holidays: props.holidays, periods: props.periods })
      const scale = niceScale(Math.max(0, ...slots.map((slot) => slot.price ?? 0)))
      const withUnit = (value: number | null) =>
        value == null ? '—' : `${formatNumber(value, locale.value, props.decimals)} ${props.unit}`
      const span = (slot: PriceSlot) => `${slot.start}–${slot.end}`
      const current = slotAt(slots, props.now)
      const { cheapest, dearest } = priceExtremes(slots)
      const chart = interaction({
        count: slots.length,
        interactive: props.interactive,
        hasTitle: props.title != null,
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
      const height = props.height
      return h(
        'figure',
        {
          class: cx('k5-chart', 'k5-price', slots.length > 48 && 'k5-price--fine'),
          ...(height == null ? {} : { style: { '--_plot': typeof height === 'number' ? `${height}px` : height } }),
        },
        [
          props.title != null || props.description != null
            ? h('figcaption', { class: 'k5-chart__header' }, [
                props.title != null ? h('span', { class: 'k5-chart__title', id: chart.titleId }, props.title) : null,
                props.description != null ? h('span', { class: 'k5-chart__description' }, props.description) : null,
              ])
            : null,
          props.summary && cheapest && dearest
            ? h('p', { class: 'k5-price__summary' }, [
                h('span', null, [`${m.priceCheapest}: `, h('strong', `${span(cheapest)} · ${withUnit(cheapest.price)}`)]),
                h('span', null, [`${m.priceDearest}: `, h('strong', `${span(dearest)} · ${withUnit(dearest.price)}`)]),
              ])
            : null,
          h('div', { class: 'k5-chart__body', ...chart.body }, [
            h(
              'div',
              { class: 'k5-chart__axis', ...chart.part },
              scale.ticks.map((tick) =>
                h(
                  'span',
                  { key: tick, class: 'k5-chart__tick', style: { bottom: percent(tick, scale.max) } },
                  formatNumber(tick, locale.value, 2),
                ),
              ),
            ),
            h('div', { class: cx('k5-chart__plot', chart.active != null && 'k5-chart__plot--active'), ...chart.part, ...chart.plot }, [
              ...scale.ticks
                .slice(1)
                .map((tick) => h('span', { key: tick, class: 'k5-chart__gridline', style: { bottom: percent(tick, scale.max) } })),
              h(
                'div',
                { class: 'k5-chart__groups' },
                slots.map((slot) =>
                  h(
                    'div',
                    {
                      key: slot.index,
                      class: 'k5-chart__group',
                      'data-active': slot.index === chart.active ? true : undefined,
                      'data-current': slot.index === current ? true : undefined,
                    },
                    [
                      h('div', { class: 'k5-chart__bars' }, [
                        h('span', {
                          class: `k5-chart__bar k5-price__bar--${slot.period}`,
                          style: { height: percent(slot.price ?? 0, scale.max) },
                          title: props.interactive ? undefined : `${span(slot)} · ${m[KEYS[slot.period]]}: ${withUnit(slot.price)}`,
                        }),
                      ]),
                    ],
                  ),
                ),
              ),
              current >= 0
                ? h('span', { class: 'k5-price__now', style: { left: `${slotCenter(current, slots.length)}%` } }, m.priceNow)
                : null,
              chart.tooltip,
            ]),
            h(
              'div',
              { class: 'k5-chart__categories', ...chart.part },
              slots.map((slot) =>
                h(
                  'span',
                  { key: slot.index, class: 'k5-chart__category' },
                  slot.start.endsWith(':00') && slot.hour % 6 === 0 ? `${slot.hour} h` : '',
                ),
              ),
            ),
            ...chart.speech,
          ]),
          props.legend
            ? h(
                'ul',
                { class: 'k5-chart__legend' },
                PERIODS.map((period) =>
                  h('li', { key: period }, [
                    h('span', { class: `k5-chart__swatch k5-price__bar--${period}`, 'aria-hidden': 'true' }),
                    m[KEYS[period]],
                  ]),
                ),
              )
            : null,
          h('table', { class: 'k5-sr-only' }, [
            h('caption', null, props.title ?? m.chartData),
            h('thead', null, [
              h('tr', null, [
                h('th', { scope: 'col' }, m.priceHour),
                h('th', { scope: 'col' }, m.tariffPeriod),
                h('th', { scope: 'col' }, m.price),
              ]),
            ]),
            h(
              'tbody',
              null,
              slots.map((slot) =>
                h('tr', { key: slot.index }, [
                  h('th', { scope: 'row' }, span(slot)),
                  h('td', null, m[KEYS[slot.period]]),
                  h('td', null, withUnit(slot.price)),
                ]),
              ),
            ),
          ]),
        ],
      )
    }
  },
})
