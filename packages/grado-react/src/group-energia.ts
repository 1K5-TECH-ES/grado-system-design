// Componentes del grupo «energía» (0.4).
export { PriceChart, type PriceChartProps } from './PriceChart.js'
export { BatteryLevel, type BatteryLevelProps } from './BatteryLevel.js'
export { Heatmap, type HeatmapProps } from './Heatmap.js'
export {
  SolarPanelIcon,
  HomeBatteryIcon,
  PowerGridIcon,
  HeatPumpIcon,
  WallboxIcon,
  ElectricMeterIcon,
  InverterIcon,
  type EnergyIconProps,
} from './EnergyIcons.js'
export {
  NATIONAL_HOLIDAYS,
  isOffPeakDay,
  tariffPeriod,
  priceSlots,
  priceExtremes,
  type TariffPeriod,
  type PriceSlot,
  type BatteryState,
} from '@1k5-tech-es/grado/patterns'
export { ENERGY_ICON_PATHS, type EnergyIconName } from '@1k5-tech-es/grado/classes'
