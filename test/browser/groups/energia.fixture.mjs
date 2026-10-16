// Pruebas en navegador · grupo «energía» (0.4): PriceChart, BatteryLevel, Heatmap e iconos.
export const initial = {}

const prices = [
  0.112, 0.104, 0.098, 0.095, 0.094, 0.097, 0.108, 0.126, 0.152, 0.168, 0.181, 0.176, 0.171, 0.164, 0.142, 0.138, 0.141, 0.159, 0.196,
  0.214, 0.209, 0.192, 0.168, 0.131,
]
const week = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (__, hour) => Math.round((0.2 + (hour >= 19 && hour <= 22 ? 1.1 : 0) + d * 0.05) * 10) / 10),
)

export function render({ C, section }) {
  return [
    section(
      'energia-precio',
      C('PriceChart', { prices, date: '2026-10-16', now: '20:15', title: 'Precio de la luz', description: 'PVPC, €/kWh' }),
    ),
    section(
      'energia-bateria',
      C('BatteryLevel', { level: 72, capacity: 10, power: 2.1, reserve: 20 }),
      C('BatteryLevel', { level: 8, power: -1.4, size: 'sm' }),
    ),
    section('energia-calor', C('Heatmap', { data: week, unit: 'kWh', title: 'Consumo por hora', rowLabel: 'Día' })),
    section(
      'energia-iconos',
      C('SolarPanelIcon'),
      C('HomeBatteryIcon'),
      C('PowerGridIcon'),
      C('HeatPumpIcon', { title: 'Bomba de calor' }),
      C('WallboxIcon'),
      C('ElectricMeterIcon'),
      C('InverterIcon'),
    ),
  ]
}
