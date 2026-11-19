import { forwardRef, type SVGAttributes } from 'react'
import { cx, ENERGY_ICON_PATHS, type EnergyIconName } from '@1k5-tech-es/grado/classes'

export interface EnergyIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'children'> {
  /** Nombre para lectores de pantalla. Sin él, el icono es decorativo (aria-hidden). */
  title?: string
}

// Mismo trazo y tamaño que Lucide: se pueden pasar como icon a Button, NavItem, EmptyState…
const icon = (name: EnergyIconName, label: string) => {
  const Icon = forwardRef<SVGSVGElement, EnergyIconProps>(function EnergyIcon({ title, className, ...rest }, ref) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={title ? undefined : true}
        role={title ? 'img' : undefined}
        {...rest}
        className={cx('k5-energy-icon', className)}
      >
        {title ? <title>{title}</title> : null}
        {ENERGY_ICON_PATHS[name].map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    )
  })
  Icon.displayName = label
  return Icon
}

/** Placa solar. */
export const SolarPanelIcon = icon('solarPanel', 'SolarPanelIcon')
/** Batería de casa. */
export const HomeBatteryIcon = icon('homeBattery', 'HomeBatteryIcon')
/** Red eléctrica (torre de la línea). */
export const PowerGridIcon = icon('powerGrid', 'PowerGridIcon')
/** Bomba de calor (aerotermia). */
export const HeatPumpIcon = icon('heatPump', 'HeatPumpIcon')
/** Cargador del coche eléctrico. */
export const WallboxIcon = icon('wallbox', 'WallboxIcon')
/** Contador de la luz. */
export const ElectricMeterIcon = icon('electricMeter', 'ElectricMeterIcon')
/** Inversor: de continua a alterna. */
export const InverterIcon = icon('inverter', 'InverterIcon')
