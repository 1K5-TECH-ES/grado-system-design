import { computed, defineComponent, h } from 'vue'
import { ENERGY_ICONS, cx, energyLineClass, energyNodeClass } from '@1k5-tech-es/grado/classes'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { energyFlow, formatNumber, formatPercent, type EnergyNode } from '@1k5-tech-es/grado/patterns'
import { useGrado } from './Locale.js'

const NAMES = { solar: 'energySolar', home: 'energyHome', battery: 'energyBattery', grid: 'energyGrid' } as const
const ICON = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'aria-hidden': 'true',
  focusable: 'false',
}
const icon = (paths: string[], className?: string) =>
  h(
    'svg',
    className ? { ...ICON, class: className } : ICON,
    paths.map((d) => h('path', { key: d, d })),
  )

/**
 * Flujo de energía en vivo de una vivienda: placas, casa, batería y red alrededor del
 * inversor. Las líneas muestran el sentido con flechas y, si se permite movimiento, con
 * un trazo animado. Es una imagen con un resumen como nombre y una lista oculta con los datos.
 */
export const EnergyFlow = defineComponent({
  name: 'K5EnergyFlow',
  props: {
    /** Producción de las placas (≥ 0). */
    solar: { type: Number, required: true },
    /** Consumo de la vivienda (≥ 0). */
    home: { type: Number, required: true },
    /** Batería: positivo = cargando, negativo = descargando. Sin valor, no aparece. */
    battery: Number,
    /** Red: positivo = importando, negativo = exportando. Sin valor, no aparece. */
    grid: Number,
    /** Carga de la batería, de 0 a 100. */
    batteryLevel: Number,
    unit: { type: String, default: 'kW' },
    title: String,
    decimals: { type: Number, default: 1 },
    locale: String,
  },
  setup(props) {
    const t = useGrado()
    const locale = computed(() => props.locale ?? t.value.locale)
    return () => {
      const m = t.value.messages
      const values: Record<EnergyNode, number | undefined> = {
        solar: props.solar,
        home: props.home,
        battery: props.battery,
        grid: props.grid,
      }
      const nodes = (['solar', 'grid', 'home', 'battery'] as const)
        .filter((node) => values[node] != null)
        .map((node) => {
          const value = values[node] ?? 0
          const { flow, state } = energyFlow(node, value)
          const level =
            node === 'battery' && props.batteryLevel != null
              ? formatPercent(Math.min(100, Math.max(0, props.batteryLevel)) / 100, locale.value)
              : ''
          const amount = `${formatNumber(Math.abs(value), locale.value, props.decimals)} ${props.unit}`
          const detail = [`${m[NAMES[node]]}: ${amount}`, m[state], level ? formatMessage(m.batteryLevel, { level }) : '']
          return { node, flow, amount, state: m[state], level, text: detail.filter(Boolean).join(' · ') }
        })
      const heading = props.title ?? m.energyFlow
      return h('figure', { class: cx('k5-energy', props.battery == null && 'k5-energy--no-battery') }, [
        h('figcaption', { class: 'k5-energy__title' }, heading),
        h('div', { class: 'k5-energy__diagram', role: 'img', 'aria-label': `${heading}. ${nodes.map((n) => n.text).join('. ')}` }, [
          ...nodes.flatMap((n) => [
            h('div', { key: n.node, class: energyNodeClass(n.node, n.flow) }, [
              h('span', { class: 'k5-energy__icon' }, [icon(ENERGY_ICONS[n.node])]),
              h('span', { class: 'k5-energy__name' }, m[NAMES[n.node]]),
              h('span', { class: 'k5-energy__value' }, n.amount),
              h('span', { class: 'k5-energy__state' }, n.state),
              n.level ? h('span', { class: 'k5-energy__level' }, n.level) : null,
            ]),
            h('span', { key: `${n.node}-line`, class: energyLineClass(n.node, n.flow) }, [
              n.flow !== 'none' ? icon(ENERGY_ICONS.arrow, 'k5-energy__arrow') : null,
            ]),
          ]),
          h('span', { class: 'k5-energy__hub' }, [icon(ENERGY_ICONS.hub)]),
        ]),
        h(
          'ul',
          { class: 'k5-sr-only' },
          nodes.map((n) => h('li', { key: n.node }, n.text)),
        ),
      ])
    }
  },
})
