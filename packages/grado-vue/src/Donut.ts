import { computed, defineComponent, h, type PropType } from 'vue'
import { donutClass, type Size } from '@1k5-tech-es/grado/classes'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { donutSlices, formatNumber, formatPercent, type DonutSegment } from '@1k5-tech-es/grado/patterns'
import { useGrado } from './Locale.js'

/**
 * Proporción de un total en un anillo. Es una imagen con un nombre que resume los
 * porcentajes; los valores van además en una lista oculta para lectores de pantalla.
 */
export const Donut = defineComponent({
  name: 'K5Donut',
  props: {
    /** Partes de un total: [{ label: 'Autoconsumo', value: 13.6 }, { label: 'Excedentes', value: 6.4 }]. */
    segments: Array as PropType<DonutSegment[]>,
    /** Un solo valor sobre max, en lugar de segments. */
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    /** Qué mide. Encabeza el nombre accesible y, con un solo valor, la lista oculta. */
    label: String,
    /** Color del valor único: chart-1 … chart-5. */
    tone: Number as PropType<DonutSegment['tone']>,
    /** Cifra en el centro, por ejemplo «68 %». Con un solo valor, por defecto, su porcentaje. */
    centerValue: [String, Number],
    /** Texto pequeño bajo la cifra del centro: «Autoconsumo». */
    centerLabel: String,
    size: String as PropType<Size>,
    /** Leyenda al lado. Por defecto, con segments. */
    legend: { type: Boolean, default: undefined },
    /** Unidad de los valores para la lista oculta: kWh. */
    unit: String,
    decimals: { type: Number, default: 1 },
    locale: String,
  },
  setup(props) {
    const t = useGrado()
    const locale = computed(() => props.locale ?? t.value.locale)
    return () => {
      const m = t.value.messages
      const single = props.segments == null
      const items: DonutSegment[] = props.segments ?? [{ label: props.label ?? '', value: props.value, tone: props.tone }]
      const slices = donutSlices(
        items.map((s) => s.value),
        single ? props.max : undefined,
      )
      const num = (n: number) => formatNumber(n, locale.value, props.decimals)
      const withUnit = (n: number) => (props.unit ? `${num(n)} ${props.unit}` : num(n))
      const pct = (i: number) => formatPercent(slices[i].percent / 100, locale.value)
      const toneOf = (s: DonutSegment, i: number) => s.tone ?? (i % 5) + 1
      const prefix = props.label ? `${props.label}: ` : ''
      const summary = single ? `${prefix}${pct(0)}` : `${prefix}${items.map((s, i) => `${s.label} ${pct(i)}`).join(', ')}`
      const details = single
        ? [
            `${prefix}${pct(0)}${props.unit ? ` (${formatMessage(m.valueOfMax, { value: num(props.value), max: withUnit(props.max) })})` : ''}`,
          ]
        : items.map((s, i) => `${s.label}: ${props.unit ? `${withUnit(s.value)} (${pct(i)})` : pct(i)}`)
      const gap = slices.filter((s) => s.length > 0).length > 1 ? 1 : 0
      const center = props.centerValue ?? (single ? pct(0) : null)
      return h('div', { class: donutClass({ size: props.size }) }, [
        h('div', { class: 'k5-donut__chart', role: 'img', 'aria-label': summary }, [
          h('svg', { class: 'k5-donut__svg', viewBox: '0 0 42 42', focusable: 'false', 'aria-hidden': 'true' }, [
            h('circle', { class: 'k5-donut__track', cx: '21', cy: '21', r: '16', pathLength: '100' }),
            ...slices.map((slice, i) => {
              const length = Math.max(0, Math.round((slice.length - gap) * 100) / 100)
              return length > 0
                ? h('circle', {
                    key: i,
                    class: `k5-donut__segment k5-donut__tone--${toneOf(items[i], i)}`,
                    cx: '21',
                    cy: '21',
                    r: '16',
                    pathLength: '100',
                    'stroke-dasharray': `${length} ${Math.round((100 - length) * 100) / 100}`,
                    'stroke-dashoffset': String(Math.round((25 - slice.start - gap / 2) * 100) / 100),
                  })
                : null
            }),
          ]),
          center != null || props.centerLabel != null
            ? h('span', { class: 'k5-donut__center' }, [
                center != null ? h('span', { class: 'k5-donut__value' }, String(center)) : null,
                props.centerLabel != null ? h('span', { class: 'k5-donut__label' }, props.centerLabel) : null,
              ])
            : null,
        ]),
        (props.legend ?? !single)
          ? h(
              'ul',
              { class: 'k5-donut__legend', 'aria-hidden': 'true' },
              items.map((s, i) =>
                h('li', { key: i }, [
                  h('span', { class: `k5-donut__swatch k5-donut__tone--${toneOf(s, i)}` }),
                  h('span', { class: 'k5-donut__name' }, s.label),
                  h('span', { class: 'k5-donut__percent' }, pct(i)),
                ]),
              ),
            )
          : null,
        h(
          'ul',
          { class: 'k5-sr-only' },
          details.map((text, i) => h('li', { key: i }, text)),
        ),
      ])
    }
  },
})
