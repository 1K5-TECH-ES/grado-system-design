'use client'
import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'
import { batteryClass, cx } from '@1k5-tech-es/grado/classes'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { batteryState, formatNumber, formatPercent } from '@1k5-tech-es/grado/patterns'
import { useGrado } from './Locale.js'

const STATES = { charging: 'energyCharging', discharging: 'energyDischarging', idle: 'energyBatteryIdle' } as const

export interface BatteryLevelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> {
  /** Carga, de 0 a 100. */
  level: number
  /** Capacidad en kWh: añade «7,2 de 10 kWh». */
  capacity?: number
  /** Potencia en kW: positiva, cargando; negativa, descargando. Sin ella no se dice el estado. */
  power?: number | null
  /** Reserva para cortes de luz, de 0 a 100: una línea a esa altura. */
  reserve?: number
  /** Qué batería es. Por defecto, «Batería». */
  label?: string
  size?: 'sm' | 'md'
  decimals?: number
  locale?: string
}

/**
 * Carga de la batería de casa: porcentaje, energía guardada y si está cargando o descargando.
 * Es un role="meter" con todo el texto en aria-valuetext.
 */
export const BatteryLevel = forwardRef<HTMLDivElement, BatteryLevelProps>(function BatteryLevel(
  { level, capacity, power, reserve, label, size = 'md', decimals = 1, locale: localeProp, className, ...rest },
  ref,
) {
  const { messages: m, locale: contextLocale } = useGrado()
  const locale = localeProp ?? contextLocale
  const clamped = Math.min(100, Math.max(0, Number.isFinite(level) ? level : 0))
  const percent = formatPercent(clamped / 100, locale)
  const energy =
    capacity != null
      ? formatMessage(m.batteryEnergy, {
          value: formatNumber((capacity * clamped) / 100, locale, decimals),
          capacity: `${formatNumber(capacity, locale, decimals)} kWh`,
        })
      : ''
  const state = batteryState(power)
  const status =
    power == null ? '' : state === 'idle' ? m[STATES.idle] : `${m[STATES[state]]} · ${formatNumber(Math.abs(power), locale, decimals)} kW`
  const reserveText =
    reserve != null ? formatMessage(m.batteryReserve, { level: formatPercent(Math.min(100, Math.max(0, reserve)) / 100, locale) }) : ''
  const name = label ?? m.energyBattery
  return (
    <div
      ref={ref}
      {...rest}
      className={cx(batteryClass({ level: clamped, size }), className)}
      role="meter"
      aria-label={name}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={[percent, energy, status, reserveText].filter(Boolean).join(', ')}
    >
      <div className="k5-battery__head">
        <span className="k5-battery__label">{name}</span>
        <span className="k5-battery__value">{percent}</span>
      </div>
      <div className="k5-battery__body" aria-hidden="true">
        <div className="k5-battery__cell">
          <span className="k5-battery__fill" style={{ width: `${clamped}%` }} />
          {reserve != null ? (
            <span className="k5-battery__reserve" style={{ '--_at': String(Math.min(100, Math.max(0, reserve)) / 100) } as CSSProperties} />
          ) : null}
        </div>
        <span className="k5-battery__cap" />
      </div>
      {energy || status ? (
        <div className="k5-battery__foot">
          <span>{energy}</span>
          {status ? <span className={`k5-battery__state k5-battery__state--${state}`}>{status}</span> : null}
        </div>
      ) : null}
    </div>
  )
})
