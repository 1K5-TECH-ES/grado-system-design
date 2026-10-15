import { defineComponent, h, type PropType } from 'vue'
import { ARROW_PATHS, ICON_ATTRS, formatChange, kpiClass, kpiTrend, type KpiBetter, type KpiTone } from '@1k5/grado/classes'
import { useGrado } from './Locale.js'

const TREND_KEYS = { up: 'trendUp', down: 'trendDown', flat: 'trendFlat' } as const

export const KpiGroup = defineComponent({
  name: 'K5KpiGroup',
  props: {
    /** Nombre del grupo para lectores de pantalla. */
    label: String,
  },
  setup(props, { slots }) {
    const t = useGrado()
    return () => h('div', { role: 'group', 'aria-label': props.label ?? t.value.messages.indicators, class: 'k5-kpis' }, slots.default?.())
  },
})

export const Kpi = defineComponent({
  name: 'K5Kpi',
  props: {
    label: { type: [String, Number], required: true },
    value: { type: [String, Number], required: true },
    /** Variación en %, por ejemplo -5.9. */
    change: { type: Number as PropType<number | null>, default: undefined },
    /** Si subir es bueno (higher), malo (lower) o ninguna de las dos (neutral). */
    better: { type: String as PropType<KpiBetter>, default: 'higher' },
    /** Valor del periodo anterior; se muestra como «antes 136». */
    previous: [String, Number],
    previousLabel: String,
    /** Texto si no hay variación. */
    hint: String,
    tone: String as PropType<KpiTone>,
    /** Se puede pulsar (por ejemplo para ver su gráfica). Se pinta como <button>. */
    selectable: Boolean,
    selected: Boolean,
    locale: String,
  },
  setup(props, { slots }) {
    const t = useGrado()
    return () => {
      const m = t.value.messages
      const trend = kpiTrend(props.change, props.better)
      const interactive = props.selectable ? { type: 'button', 'aria-pressed': String(props.selected) } : {}
      return h(props.selectable ? 'button' : 'div', { ...interactive, class: kpiClass({ tone: props.tone }) }, [
        h('span', { class: 'k5-kpi__label' }, String(props.label)),
        h('span', { class: 'k5-kpi__row' }, [h('span', { class: 'k5-kpi__value' }, String(props.value)), slots.default?.()]),
        h('span', { class: 'k5-kpi__foot' }, [
          trend && props.change != null
            ? h('span', { class: `k5-kpi__change k5-kpi__change--${trend.tone}` }, [
                h(
                  'svg',
                  ICON_ATTRS,
                  ARROW_PATHS[trend.direction].map((d) => h('path', { d })),
                ),
                h('span', { class: 'k5-sr-only' }, `${m[TREND_KEYS[trend.direction]]} `),
                formatChange(props.change, props.locale ?? t.value.locale),
              ])
            : null,
          trend && props.previous != null
            ? h('span', `${props.previousLabel ?? m.previous} ${props.previous}`)
            : props.hint != null
              ? h('span', props.hint)
              : null,
        ]),
      ])
    }
  },
})
