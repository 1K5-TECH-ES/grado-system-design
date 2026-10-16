'use client'
import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'
import { compareTariffs, formatAmount, formatEnergy, type Tariff, type TariffOptions } from '@1k5-tech-es/grado/labs'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { Badge } from './Badge.js'
import { useGrado } from './Locale.js'
import { useLabsMessages } from './labs-messages.js'

export interface TariffComparisonProps extends TariffOptions {
  tariffs: Tariff[]
  title?: ReactNode
  /** Bajo el título. Por defecto, si lleva impuestos y el consumo al año. */
  description?: ReactNode
  /** Columnas de energía y potencia. Por defecto, sí. */
  breakdown?: boolean
  className?: string
}

/**
 * Lo que cuesta al año el mismo consumo con dos o tres tarifas, con la más barata marcada y
 * cuánto más cuesta cada una. Es una tabla: se lee igual con lector de pantalla.
 */
export const TariffComparison = forwardRef<HTMLElement, TariffComparisonProps>(function TariffComparison(
  { tariffs, consumption, power, days, taxes, title, description, breakdown = true, className },
  ref,
) {
  const { locale } = useGrado()
  const m = useLabsMessages()
  const { rows } = compareTariffs(tariffs, { consumption, power, days, taxes })
  const eur = (value: number) => formatAmount(value, { unit: 'eur', locale })
  const kwh = typeof consumption === 'number' ? consumption : (consumption.punta ?? 0) + (consumption.llano ?? 0) + (consumption.valle ?? 0)
  const note = description ?? `${taxes ? m.tariffTaxesIncluded : m.tariffNoTaxes} · ${formatEnergy(kwh, { locale, decimals: 0 })}`
  return (
    <figure ref={ref} className={cx('k5-tariffs', className)}>
      {title != null || note != null ? (
        <figcaption className="k5-tariffs__header">
          {title != null ? <span className="k5-tariffs__title">{title}</span> : null}
          {note ? <span className="k5-tariffs__description">{note}</span> : null}
        </figcaption>
      ) : null}
      <table className="k5-table k5-tariffs__table">
        <thead>
          <tr>
            <th scope="col">{m.tariffName}</th>
            {breakdown ? (
              <>
                <th scope="col" className="k5-num">
                  {m.tariffEnergy}
                </th>
                <th scope="col" className="k5-num">
                  {m.tariffPower}
                </th>
              </>
            ) : null}
            <th scope="col" className="k5-num">
              {m.tariffAnnual}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} data-cheapest={row.cheapest || undefined}>
              <th scope="row">
                <span className="k5-tariffs__name">{row.name}</span>
                {row.cheapest ? <Badge tone="success">{m.tariffCheapest}</Badge> : null}
              </th>
              {breakdown ? (
                <>
                  <td className="k5-num">{eur(row.cost.energy)}</td>
                  <td className="k5-num">{eur(row.cost.power)}</td>
                </>
              ) : null}
              <td className="k5-num">
                <span className="k5-tariffs__total">{eur(row.cost.total)}</span>
                <span className="k5-tariffs__detail">
                  {row.cheapest
                    ? formatMessage(m.tariffMonthly, { value: eur(row.monthly) })
                    : formatMessage(m.tariffMore, { value: eur(row.delta) })}
                </span>
                <span
                  className="k5-tariffs__bar"
                  aria-hidden="true"
                  style={{ '--_ratio': `${Math.round(row.ratio * 1000) / 10}%` } as CSSProperties}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
})
