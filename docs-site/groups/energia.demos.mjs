// Web de documentación · grupo «energía» (0.4): demo en vivo de cada ficha (id → componente React).
// No importes doc-helpers.mjs aquí: demos.mjs carga este archivo y doc-helpers carga demos.mjs.
import { createElement as h, useState } from 'react'
import * as G from '@1k5-tech-es/grado-react'

// PVPC de un viernes de octubre. Datos de ejemplo.
const prices = [
  0.112, 0.104, 0.098, 0.095, 0.094, 0.097, 0.108, 0.126, 0.152, 0.168, 0.181, 0.176, 0.171, 0.164, 0.142, 0.138, 0.141, 0.159, 0.196,
  0.214, 0.209, 0.192, 0.168, 0.131,
]
// Una vivienda con aerotermia: picos por la mañana y por la noche, más a mediodía el fin de semana.
const week = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (__, hour) => {
    const base = 0.25 + 0.5 * Math.exp(-((hour - 8) ** 2) / 3) + 1.1 * Math.exp(-((hour - 20.5) ** 2) / 5)
    return Math.round((base + (d >= 5 ? 0.5 * Math.exp(-((hour - 14) ** 2) / 8) : 0)) * 100) / 100
  }),
)
const stack = (...children) => h('div', { className: 'live-stack' }, ...children)

function PriceChartDemo() {
  const [day, setDay] = useState('2026-10-16')
  return stack(
    h(G.SegmentedControl, {
      label: 'Día',
      size: 'sm',
      value: day,
      onValueChange: setDay,
      options: [
        { value: '2026-10-16', label: 'Viernes' },
        { value: '2026-10-17', label: 'Sábado' },
      ],
    }),
    h(G.PriceChart, {
      prices,
      date: day,
      now: '20:15',
      title: 'Precio de la luz',
      description: 'PVPC · datos de ejemplo',
      height: 180,
    }),
  )
}

function BatteryLevelDemo() {
  return h(
    G.Grid,
    { columns: 3, gap: '6' },
    h(G.BatteryLevel, { level: 72, capacity: 10, power: 2.1, reserve: 20 }),
    h(G.BatteryLevel, { level: 22, capacity: 5, power: -1.4 }),
    h(G.BatteryLevel, { level: 8, capacity: 5, power: 0, label: 'Batería del garaje' }),
  )
}

function HeatmapDemo() {
  return h(G.Heatmap, {
    data: week,
    unit: 'kWh',
    title: 'Consumo por hora',
    description: 'Media de octubre · datos de ejemplo',
    rowLabel: 'Día',
  })
}

function EnergyIconsDemo() {
  const icons = [
    ['SolarPanelIcon', 'Placa solar'],
    ['HomeBatteryIcon', 'Batería'],
    ['PowerGridIcon', 'Red'],
    ['HeatPumpIcon', 'Bomba de calor'],
    ['WallboxIcon', 'Cargador'],
    ['ElectricMeterIcon', 'Contador'],
    ['InverterIcon', 'Inversor'],
  ]
  return stack(
    h(
      'div',
      { className: 'demo-row' },
      icons.map(([name, label]) =>
        h(
          'span',
          { key: name, className: 'demo-icon', title: name },
          h(G[name], { title: label }),
          h('span', { className: 'demo-status' }, label),
        ),
      ),
    ),
    h('div', { className: 'demo-row' }, h(G.Button, { icon: G.HeatPumpIcon, variant: 'secondary' }, 'Añadir aerotermia')),
  )
}

export const demos = {
  'price-chart': PriceChartDemo,
  'battery-level': BatteryLevelDemo,
  heatmap: HeatmapDemo,
  'energy-icons': EnergyIconsDemo,
}
