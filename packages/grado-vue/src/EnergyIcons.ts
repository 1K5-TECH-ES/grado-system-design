import { defineComponent, h } from 'vue'
import { ENERGY_ICON_PATHS, type EnergyIconName } from '@1k5-tech-es/grado/classes'

// Mismo trazo y tamaño que Lucide: se pueden pasar como icon a Button, NavItem, EmptyState…
const icon = (name: EnergyIconName, component: string) =>
  defineComponent({
    name: component,
    props: {
      /** Nombre para lectores de pantalla. Sin él, el icono es decorativo (aria-hidden). */
      title: String,
    },
    setup(props) {
      return () =>
        h(
          'svg',
          {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '24',
            height: '24',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '1.5',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'aria-hidden': props.title ? undefined : 'true',
            role: props.title ? 'img' : undefined,
            class: 'k5-energy-icon',
          },
          [props.title ? h('title', props.title) : null, ...ENERGY_ICON_PATHS[name].map((d) => h('path', { key: d, d }))],
        )
    },
  })

/** Placa solar. */
export const SolarPanelIcon = icon('solarPanel', 'K5SolarPanelIcon')
/** Batería de casa. */
export const HomeBatteryIcon = icon('homeBattery', 'K5HomeBatteryIcon')
/** Red eléctrica (torre de la línea). */
export const PowerGridIcon = icon('powerGrid', 'K5PowerGridIcon')
/** Bomba de calor (aerotermia). */
export const HeatPumpIcon = icon('heatPump', 'K5HeatPumpIcon')
/** Cargador del coche eléctrico. */
export const WallboxIcon = icon('wallbox', 'K5WallboxIcon')
/** Contador de la luz. */
export const ElectricMeterIcon = icon('electricMeter', 'K5ElectricMeterIcon')
/** Inversor: de continua a alterna. */
export const InverterIcon = icon('inverter', 'K5InverterIcon')
