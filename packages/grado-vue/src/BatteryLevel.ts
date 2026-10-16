import { computed, defineComponent, h, type PropType } from 'vue'
import { batteryClass } from '@1k5-tech-es/grado/classes'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { batteryState, formatNumber, formatPercent } from '@1k5-tech-es/grado/patterns'
import { useGrado } from './Locale.js'

const STATES = { charging: 'energyCharging', discharging: 'energyDischarging', idle: 'energyBatteryIdle' } as const

/**
 * Carga de la batería de casa: porcentaje, energía guardada y si está cargando o descargando.
 * Es un role="meter" con todo el texto en aria-valuetext.
 */
export const BatteryLevel = defineComponent({
  name: 'K5BatteryLevel',
  props: {
    /** Carga, de 0 a 100. */
    level: { type: Number, required: true },
    /** Capacidad en kWh: añade «7,2 de 10 kWh». */
    capacity: Number,
    /** Potencia en kW: positiva, cargando; negativa, descargando. Sin ella no se dice el estado. */
    power: { type: Number as PropType<number | null>, default: undefined },
    /** Reserva para cortes de luz, de 0 a 100: una línea a esa altura. */
    reserve: Number,
    /** Qué batería es. Por defecto, «Batería». */
    label: String,
    size: { type: String as PropType<'sm' | 'md'>, default: 'md' },
    decimals: { type: Number, default: 1 },
    locale: String,
  },
  setup(props) {
    const t = useGrado()
    const locale = computed(() => props.locale ?? t.value.locale)
    return () => {
      const m = t.value.messages
      const clamped = Math.min(100, Math.max(0, Number.isFinite(props.level) ? props.level : 0))
      const percent = formatPercent(clamped / 100, locale.value)
      const energy =
        props.capacity != null
          ? formatMessage(m.batteryEnergy, {
              value: formatNumber((props.capacity * clamped) / 100, locale.value, props.decimals),
              capacity: `${formatNumber(props.capacity, locale.value, props.decimals)} kWh`,
            })
          : ''
      const state = batteryState(props.power)
      const status =
        props.power == null
          ? ''
          : state === 'idle'
            ? m[STATES.idle]
            : `${m[STATES[state]]} · ${formatNumber(Math.abs(props.power), locale.value, props.decimals)} kW`
      const reserve = props.reserve == null ? null : Math.min(100, Math.max(0, props.reserve))
      const reserveText = reserve != null ? formatMessage(m.batteryReserve, { level: formatPercent(reserve / 100, locale.value) }) : ''
      const name = props.label ?? m.energyBattery
      return h(
        'div',
        {
          class: batteryClass({ level: clamped, size: props.size }),
          role: 'meter',
          'aria-label': name,
          'aria-valuenow': clamped,
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuetext': [percent, energy, status, reserveText].filter(Boolean).join(', '),
        },
        [
          h('div', { class: 'k5-battery__head' }, [
            h('span', { class: 'k5-battery__label' }, name),
            h('span', { class: 'k5-battery__value' }, percent),
          ]),
          h('div', { class: 'k5-battery__body', 'aria-hidden': 'true' }, [
            h('div', { class: 'k5-battery__cell' }, [
              h('span', { class: 'k5-battery__fill', style: { width: `${clamped}%` } }),
              reserve != null ? h('span', { class: 'k5-battery__reserve', style: { '--_at': String(reserve / 100) } }) : null,
            ]),
            h('span', { class: 'k5-battery__cap' }),
          ]),
          energy || status
            ? h('div', { class: 'k5-battery__foot' }, [
                h('span', null, energy),
                status ? h('span', { class: `k5-battery__state k5-battery__state--${state}` }, status) : null,
              ])
            : null,
        ],
      )
    }
  },
})
