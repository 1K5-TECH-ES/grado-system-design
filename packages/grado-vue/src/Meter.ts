import { computed, defineComponent, h, type PropType } from 'vue'
import { cx, meterClass, type MeterVariant } from '@1k5-tech-es/grado/classes'
import { formatNumber, meterLevel, meterRatio, meterSegments } from '@1k5-tech-es/grado/patterns'
import { useGrado } from './Locale.js'

/**
 * Valor dentro de un rango conocido: carga de batería, cobertura solar. El tono (bien,
 * regular, mal) sale de low, high y optimum, con el mismo criterio que <meter> de HTML.
 */
export const Meter = defineComponent({
  name: 'K5Meter',
  props: {
    value: { type: Number, required: true },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    /** Igual que en <meter>: low y high parten el rango en tres zonas; optimum dice cuál es la buena. */
    low: Number,
    high: Number,
    optimum: Number,
    /** Qué mide: «Carga de batería». Es también su nombre accesible. */
    label: String,
    /** Unidad tras el valor: %, kWh. */
    unit: String,
    /** Muestra el valor junto a la etiqueta. */
    showValue: { type: Boolean, default: true },
    /** bar: barra continua; segments: segmentos tipo batería. */
    variant: { type: String as PropType<MeterVariant>, default: 'bar' },
    /** Número de segmentos con variant segments. */
    segments: { type: Number, default: 10 },
    /** Texto que leen los lectores de pantalla en lugar del valor con su unidad. */
    valueText: String,
    decimals: { type: Number, default: 1 },
    locale: String,
  },
  setup(props) {
    const t = useGrado()
    const locale = computed(() => props.locale ?? t.value.locale)
    return () => {
      const { value, min, max } = props
      const ratio = meterRatio(value, min, max)
      const shown = formatNumber(value, locale.value, props.decimals)
      const withUnit = props.unit ? `${shown} ${props.unit}` : shown
      const count = Math.max(1, Math.round(props.segments))
      const on = meterSegments(ratio, count)
      const level = meterLevel({ value, min, max, low: props.low, high: props.high, optimum: props.optimum })
      return h(
        'div',
        {
          class: meterClass({ variant: props.variant, level }),
          role: 'meter',
          'aria-label': props.label ?? t.value.messages.meterLabel,
          'aria-valuenow': Math.min(max, Math.max(min, value)),
          'aria-valuemin': min,
          'aria-valuemax': max,
          'aria-valuetext': props.valueText ?? withUnit,
        },
        [
          props.label != null || props.showValue
            ? h('span', { class: 'k5-meter__head' }, [
                props.label != null ? h('span', { class: 'k5-meter__label' }, props.label) : null,
                props.showValue ? h('span', { class: 'k5-meter__value' }, withUnit) : null,
              ])
            : null,
          props.variant === 'segments'
            ? h(
                'span',
                { class: 'k5-meter__segments' },
                Array.from({ length: count }, (_, i) =>
                  h('span', { key: i, class: cx('k5-meter__segment', i < on && 'k5-meter__segment--on') }),
                ),
              )
            : h('span', { class: 'k5-meter__track' }, [
                h('span', { class: 'k5-meter__fill', style: { width: `${Math.round(ratio * 10000) / 100}%` } }),
              ]),
        ],
      )
    }
  },
})
