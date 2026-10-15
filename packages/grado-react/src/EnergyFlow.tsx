'use client'
import { Fragment } from 'react'
import { ENERGY_ICONS, cx, energyLineClass, energyNodeClass } from '@1k5-tech-es/grado/classes'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { energyFlow, formatNumber, formatPercent, type EnergyNode } from '@1k5-tech-es/grado/patterns'
import { useGrado } from './Locale.js'

export interface EnergyFlowProps {
  /** Producción de las placas (≥ 0). */
  solar: number
  /** Consumo de la vivienda (≥ 0). */
  home: number
  /** Batería: positivo = cargando, negativo = descargando. Sin valor, no aparece. */
  battery?: number
  /** Red: positivo = importando, negativo = exportando. Sin valor, no aparece. */
  grid?: number
  /** Carga de la batería, de 0 a 100. */
  batteryLevel?: number
  unit?: string
  title?: string
  decimals?: number
  locale?: string
  className?: string
}

const NAMES = { solar: 'energySolar', home: 'energyHome', battery: 'energyBattery', grid: 'energyGrid' } as const

function Icon({ paths, className }: { paths: string[]; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

/**
 * Flujo de energía en vivo de una vivienda: placas, casa, batería y red alrededor del
 * inversor. Las líneas muestran el sentido con flechas y, si se permite movimiento, con
 * un trazo animado. Es una imagen con un resumen como nombre y una lista oculta con los datos.
 */
export function EnergyFlow({
  solar,
  home,
  battery,
  grid,
  batteryLevel,
  unit = 'kW',
  title,
  decimals = 1,
  locale: localeProp,
  className,
}: EnergyFlowProps) {
  const { messages: m, locale: contextLocale } = useGrado()
  const locale = localeProp ?? contextLocale
  const values: Record<EnergyNode, number | undefined> = { solar, home, battery, grid }
  const nodes = (['solar', 'grid', 'home', 'battery'] as const)
    .filter((node) => values[node] != null)
    .map((node) => {
      const value = values[node] ?? 0
      const { flow, state } = energyFlow(node, value)
      const level = node === 'battery' && batteryLevel != null ? formatPercent(Math.min(100, Math.max(0, batteryLevel)) / 100, locale) : ''
      const amount = `${formatNumber(Math.abs(value), locale, decimals)} ${unit}`
      const detail = [`${m[NAMES[node]]}: ${amount}`, m[state], level ? formatMessage(m.batteryLevel, { level }) : '']
      return { node, flow, amount, state: m[state], level, text: detail.filter(Boolean).join(' · ') }
    })
  const heading = title ?? m.energyFlow
  return (
    <figure className={cx('k5-energy', battery == null && 'k5-energy--no-battery', className)}>
      <figcaption className="k5-energy__title">{heading}</figcaption>
      <div className="k5-energy__diagram" role="img" aria-label={`${heading}. ${nodes.map((n) => n.text).join('. ')}`}>
        {nodes.map((n) => (
          <Fragment key={n.node}>
            <div className={energyNodeClass(n.node, n.flow)}>
              <span className="k5-energy__icon">
                <Icon paths={ENERGY_ICONS[n.node]} />
              </span>
              <span className="k5-energy__name">{m[NAMES[n.node]]}</span>
              <span className="k5-energy__value">{n.amount}</span>
              <span className="k5-energy__state">{n.state}</span>
              {n.level ? <span className="k5-energy__level">{n.level}</span> : null}
            </div>
            <span className={energyLineClass(n.node, n.flow)}>
              {n.flow !== 'none' ? <Icon className="k5-energy__arrow" paths={ENERGY_ICONS.arrow} /> : null}
            </span>
          </Fragment>
        ))}
        <span className="k5-energy__hub">
          <Icon paths={ENERGY_ICONS.hub} />
        </span>
      </div>
      <ul className="k5-sr-only">
        {nodes.map((n) => (
          <li key={n.node}>{n.text}</li>
        ))}
      </ul>
    </figure>
  )
}
