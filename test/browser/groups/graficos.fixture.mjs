// Pruebas en navegador · grupo «gráficos»: lo que se pinta en la página de pruebas.
// render recibe los ayudantes de fixture.mjs y devuelve una lista de section(id, ...hijos).
// C(nombre, props, ...hijos) pinta el componente en React o en Vue con las mismas props;
// en Vue, value → modelValue y onValueChange → onUpdate:modelValue. isVue para lo demás.
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'

export const initial = {}

const week = [
  { dia: 'Lun', produccion: 31.2, consumo: 18.4 },
  { dia: 'Mar', produccion: 28.6, consumo: 17.9 },
  { dia: 'Mié', produccion: 12.3, consumo: 19.5 },
  { dia: 'Jue', produccion: 25.1, consumo: 16.2 },
  { dia: 'Vie', produccion: 33.8, consumo: 21.0 },
  { dia: 'Sáb', produccion: 34.5, consumo: 24.3 },
  { dia: 'Dom', produccion: 30.9, consumo: 22.7 },
]
const series = [
  { key: 'produccion', label: 'Producción' },
  { key: 'consumo', label: 'Consumo' },
]

// render({ C, make, section, button, set, state, update, isVue })
export function render({ C, make, section, isVue }) {
  // value es un dato (no un v-model) en Donut y Meter: se pintan sin la traducción de C().
  const D = (name, props) => make(isVue ? V[name] : R[name], props)
  return [
    section(
      'graficos-lineas',
      C('Sparkline', { data: [22, 25, 24, 28, 27, 30, 31], tone: 'success', area: true, label: 'Producción de la semana: al alza' }),
      C('LineChart', {
        title: 'Producción y consumo',
        description: 'kWh por día · últimos 7 días',
        data: week,
        categoryKey: 'dia',
        categoryLabel: 'Día',
        series,
        unit: 'kWh',
        height: 180,
      }),
      C('AreaChart', { title: 'Producción', data: week, categoryKey: 'dia', series: [series[0]], unit: 'kWh', height: 120 }),
    ),
    section(
      'graficos-donut',
      C('Donut', {
        label: 'Energía producida hoy',
        segments: [
          { label: 'Autoconsumo', value: 13.6 },
          { label: 'Excedentes', value: 6.4 },
        ],
        unit: 'kWh',
        centerValue: '68 %',
        centerLabel: 'Autoconsumo',
      }),
      D('Donut', { value: 6.8, max: 10, label: 'Cobertura solar', unit: 'kWh', size: 'sm', tone: 2 }),
    ),
    section(
      'graficos-meter',
      D('Meter', { value: 72, low: 20, high: 50, optimum: 100, label: 'Carga de batería', unit: '%' }),
      D('Meter', { value: 72, low: 20, high: 50, optimum: 100, label: 'Batería por segmentos', unit: '%', variant: 'segments' }),
    ),
    section('graficos-energia', C('EnergyFlow', { solar: 5.8, home: 2.1, battery: 1.6, grid: -2.1, batteryLevel: 72 })),
    section('graficos-noche', C('EnergyFlow', { solar: 0, home: 0.9, title: 'De noche, sin batería' })),
    section(
      'graficos-kpi',
      C(
        'KpiGroup',
        { label: 'Producción y consumo' },
        C('Kpi', { label: 'Producción hoy', value: '31,2 kWh', change: 8.4, previous: '28,8 kWh', trend: [22, 25, 24, 28, 27, 30, 31] }),
        C('Kpi', { label: 'Consumo de red', value: '6,4 kWh', change: 12, better: 'lower', trend: [4, 5, 6, 5.2, 6.4] }),
      ),
    ),
  ]
}
