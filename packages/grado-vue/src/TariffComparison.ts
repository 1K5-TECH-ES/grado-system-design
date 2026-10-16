import { defineComponent, h, type PropType } from 'vue'
import { compareTariffs, formatAmount, formatEnergy, type PeriodValues, type Tariff } from '@1k5-tech-es/grado/labs'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { Badge } from './Badge.js'
import { useGrado } from './Locale.js'
import { labsMessages } from './labs-messages.js'

/**
 * Lo que cuesta al año el mismo consumo con dos o tres tarifas, con la más barata marcada y
 * cuánto más cuesta cada una. Es una tabla: se lee igual con lector de pantalla.
 */
export const TariffComparison = defineComponent({
  name: 'K5TariffComparison',
  props: {
    tariffs: { type: Array as PropType<Tariff[]>, required: true },
    /** kWh por periodo de la 2.0TD ({ punta, llano, valle }) o en total si las tarifas tienen un solo precio. */
    consumption: { type: [Number, Object] as PropType<number | PeriodValues>, required: true },
    /** Potencia contratada en kW: una cifra o { punta, valle }. */
    power: { type: [Number, Object] as PropType<number | { punta?: number; valle?: number }>, default: 0 },
    days: { type: Number, default: 365 },
    taxes: Object as PropType<{ electricityTax?: number; vat?: number }>,
    title: String,
    /** Bajo el título. Por defecto, si lleva impuestos y el consumo al año. */
    description: String,
    /** Columnas de energía y potencia. Por defecto, sí. */
    breakdown: { type: Boolean, default: true },
  },
  setup(props) {
    const t = useGrado()
    return () => {
      const m = labsMessages(t.value),
        locale = t.value.locale
      const { rows } = compareTariffs(props.tariffs, {
        consumption: props.consumption,
        power: props.power,
        days: props.days,
        taxes: props.taxes,
      })
      const eur = (value: number) => formatAmount(value, { unit: 'eur', locale })
      const c = props.consumption
      const kwh = typeof c === 'number' ? c : (c.punta ?? 0) + (c.llano ?? 0) + (c.valle ?? 0)
      const note =
        props.description ?? `${props.taxes ? m.tariffTaxesIncluded : m.tariffNoTaxes} · ${formatEnergy(kwh, { locale, decimals: 0 })}`
      const num = { class: 'k5-num' }
      return h('figure', { class: 'k5-tariffs' }, [
        h('figcaption', { class: 'k5-tariffs__header' }, [
          props.title != null ? h('span', { class: 'k5-tariffs__title' }, props.title) : null,
          note ? h('span', { class: 'k5-tariffs__description' }, note) : null,
        ]),
        h('table', { class: 'k5-table k5-tariffs__table' }, [
          h('thead', null, [
            h('tr', null, [
              h('th', { scope: 'col' }, m.tariffName),
              ...(props.breakdown
                ? [h('th', { scope: 'col', ...num }, m.tariffEnergy), h('th', { scope: 'col', ...num }, m.tariffPower)]
                : []),
              h('th', { scope: 'col', ...num }, m.tariffAnnual),
            ]),
          ]),
          h(
            'tbody',
            null,
            rows.map((row) =>
              h('tr', { key: row.id, 'data-cheapest': row.cheapest || undefined }, [
                h('th', { scope: 'row' }, [
                  h('span', { class: 'k5-tariffs__name' }, row.name),
                  row.cheapest ? h(Badge, { tone: 'success' }, () => m.tariffCheapest) : null,
                ]),
                ...(props.breakdown ? [h('td', num, eur(row.cost.energy)), h('td', num, eur(row.cost.power))] : []),
                h('td', num, [
                  h('span', { class: 'k5-tariffs__total' }, eur(row.cost.total)),
                  h(
                    'span',
                    { class: 'k5-tariffs__detail' },
                    row.cheapest
                      ? formatMessage(m.tariffMonthly, { value: eur(row.monthly) })
                      : formatMessage(m.tariffMore, { value: eur(row.delta) }),
                  ),
                  h('span', {
                    class: 'k5-tariffs__bar',
                    'aria-hidden': 'true',
                    style: { '--_ratio': `${Math.round(row.ratio * 1000) / 10}%` },
                  }),
                ]),
              ]),
            ),
          ),
        ]),
      ])
    }
  },
})
