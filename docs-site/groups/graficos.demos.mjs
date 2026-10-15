// Web de documentación · grupo «gráficos»: demo en vivo de cada ficha (id → componente React).
// No importes doc-helpers.mjs aquí: demos.mjs carga este archivo y doc-helpers carga demos.mjs.
import { createElement as h, useState } from 'react'
import * as G from '@1k5/grado-react'

// Últimos 7 días de una vivienda con 8,4 kWp en Valencia. Datos de ejemplo.
const week = [
  { dia: 'Jue 8', produccion: 31.2, consumo: 18.4 },
  { dia: 'Vie 9', produccion: 28.6, consumo: 17.9 },
  { dia: 'Sáb 10', produccion: 12.3, consumo: 19.5 },
  { dia: 'Dom 11', produccion: 25.1, consumo: 16.2 },
  { dia: 'Lun 12', produccion: 33.8, consumo: 21.0 },
  { dia: 'Mar 13', produccion: 34.5, consumo: 24.3 },
  { dia: 'Mié 14', produccion: 30.9, consumo: 22.7 },
]
const series = [
  { key: 'produccion', label: 'Producción' },
  { key: 'consumo', label: 'Consumo' },
]
const stack = (...children) => h('div', { className: 'live-stack' }, ...children)

function SparklineDemo() {
  return h(
    G.KpiGroup,
    { label: 'Energía de la vivienda' },
    h(G.Kpi, { label: 'Producción hoy', value: '30,9 kWh', change: 8.4, previous: '28,5 kWh', trend: week.map((d) => d.produccion) }),
    h(G.Kpi, {
      label: 'Consumo hoy',
      value: '22,7 kWh',
      change: -6.6,
      better: 'lower',
      previous: '24,3 kWh',
      trend: week.map((d) => d.consumo),
    }),
    h(
      'div',
      { style: { display: 'grid', gap: 'var(--k5-space-1)' } },
      h('span', { className: 'demo-status' }, 'Sparkline suelta, con área'),
      h(G.Sparkline, { data: [61, 63, 58, 64, 66, 66, 68], area: true, height: 40, label: 'Autoconsumo de la semana: del 61 % al 68 %' }),
    ),
  )
}

function LineChartDemo() {
  const [area, setArea] = useState('linea')
  return stack(
    h(G.SegmentedControl, {
      label: 'Tipo de gráfico',
      size: 'sm',
      value: area,
      onValueChange: setArea,
      options: [
        { value: 'linea', label: 'Líneas' },
        { value: 'area', label: 'Áreas' },
      ],
    }),
    h(G.LineChart, {
      title: 'Producción frente a consumo',
      description: 'kWh por día · últimos 7 días · datos de ejemplo',
      data: week,
      categoryKey: 'dia',
      categoryLabel: 'Día',
      series,
      unit: 'kWh',
      area: area === 'area',
      height: 200,
    }),
  )
}

function DonutDemo() {
  return h(
    'div',
    { className: 'live-stack', style: { gap: 'var(--k5-space-6)' } },
    h(G.Donut, {
      label: 'Energía producida hoy',
      segments: [
        { label: 'Autoconsumo', value: 21 },
        { label: 'Excedentes', value: 9.9 },
      ],
      unit: 'kWh',
      centerValue: '68 %',
      centerLabel: 'Autoconsumo',
    }),
    h(G.Donut, { value: 6.8, max: 10, label: 'Cobertura solar', unit: 'kWh', size: 'sm', tone: 2 }),
  )
}

function MeterDemo() {
  const [level, setLevel] = useState(72)
  return stack(
    h(G.Meter, { label: 'Carga de batería', value: level, low: 20, high: 50, optimum: 100, unit: '%', variant: 'segments' }),
    h(G.Meter, { label: 'Cobertura solar del consumo', value: 68, low: 30, high: 60, optimum: 100, unit: '%' }),
    h(
      G.Field,
      { label: 'Carga de la batería', hint: 'Por debajo de 50 % pasa a regular y de 20 % a mal.' },
      h(G.NumberInput, { value: level, onValueChange: (v) => setLevel(v ?? 0), min: 0, max: 100, step: 5, suffix: '%' }),
    ),
  )
}

const MOMENTS = {
  mediodia: { solar: 5.8, home: 2.1, battery: 1.6, grid: -2.1, batteryLevel: 72 },
  tarde: { solar: 0.6, home: 3.4, battery: -2.2, grid: 0.6, batteryLevel: 41 },
  noche: { solar: 0, home: 0.9, battery: 0, grid: 0.9, batteryLevel: 12 },
}
function EnergyFlowDemo() {
  const [moment, setMoment] = useState('mediodia')
  return stack(
    h(G.SegmentedControl, {
      label: 'Momento del día',
      size: 'sm',
      value: moment,
      onValueChange: setMoment,
      options: [
        { value: 'mediodia', label: 'Mediodía' },
        { value: 'tarde', label: 'Tarde' },
        { value: 'noche', label: 'Noche' },
      ],
    }),
    h(G.EnergyFlow, { title: 'Vivienda de Lucía Fernández · Valencia', ...MOMENTS[moment] }),
  )
}

export const demos = {
  sparkline: SparklineDemo,
  'line-chart': LineChartDemo,
  donut: DonutDemo,
  meter: MeterDemo,
  'energy-flow': EnergyFlowDemo,
}
