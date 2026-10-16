// Pruebas en navegador · grupo «labs» (0.6): Amount, RelativeTime, ThemeToggle, ScrollArea,
// useHotkey y VisuallyHidden. Los hooks necesitan un componente de cada framework.
import { createElement as r, useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import * as RL from '@1k5-tech-es/grado-react/labs'
import * as VL from '@1k5-tech-es/grado-vue/labs'

export const initial = {}

// Cuenta las veces que salta «?» (sin modificador) y «mod+j».
function ReactHotkeys() {
  const [help, setHelp] = useState(0)
  const [jump, setJump] = useState(0)
  RL.useHotkey('?', () => setHelp((n) => n + 1))
  RL.useHotkey('mod+j', () => setJump((n) => n + 1))
  return r(
    'div',
    null,
    r('input', { 'aria-label': 'Escribe aquí', id: 'labs-input' }),
    r('output', { id: 'labs-help' }, String(help)),
    r('output', { id: 'labs-jump' }, String(jump)),
  )
}
const VueHotkeys = defineComponent({
  setup() {
    const help = ref(0)
    const jump = ref(0)
    VL.useHotkey('?', () => help.value++)
    VL.useHotkey('mod+j', () => jump.value++)
    return () =>
      h('div', null, [
        h('input', { 'aria-label': 'Escribe aquí', id: 'labs-input' }),
        h('output', { id: 'labs-help' }, String(help.value)),
        h('output', { id: 'labs-jump' }, String(jump.value)),
      ])
  },
})

export function render({ make, section, isVue }) {
  const L = isVue ? VL : RL
  const C = (name, props = {}, ...children) =>
    isVue ? h(L[name], props, children.length ? () => children : undefined) : r(L[name], props, ...children)
  const now = new Date('2026-10-16T10:30:00+02:00')
  return [
    section(
      'labs-amount',
      C('Amount', { value: 1234.5, unit: 'eur' }),
      C('Amount', { value: 12500, unit: 'kWh', scale: true }),
      C('Amount', { value: 6.4, unit: 'kWp' }),
      C('Amount', { value: -0.04, unit: 'percent', signed: true, colored: true }),
      C('Amount', { value: null, unit: 'eur' }),
    ),
    section('labs-tiempo', C('RelativeTime', { value: new Date(now.getTime() - 5 * 60_000), now })),
    section('labs-tema', C('ThemeToggle', { storageKey: 'k5-mode-pruebas' })),
    // Con apply: false solo guarda la elección (una vista previa): <html> no cambia.
    section('labs-tema-vista', C('ThemeToggle', { storageKey: 'k5-mode-vista', apply: false })),
    section(
      'labs-scroll',
      C(
        'ScrollArea',
        { label: 'Historial', maxHeight: 80 },
        ...Array.from({ length: 12 }, (_, i) => make('p', { key: i }, `Línea ${i + 1}`)),
      ),
    ),
    section('labs-atajos', make(isVue ? VueHotkeys : ReactHotkeys)),
    section(
      'labs-tarifas',
      C('TariffComparison', {
        title: 'Tu consumo con cada tarifa',
        consumption: { punta: 900, llano: 1100, valle: 1500 },
        power: 4.6,
        tariffs: [
          { id: 'fija', name: 'Precio fijo', energy: 0.145, power: 0.09 },
          { id: 'td', name: '2.0TD', energy: { punta: 0.21, llano: 0.14, valle: 0.09 }, power: { punta: 0.1, valle: 0.01 } },
        ],
      }),
    ),
    section('labs-firma', C('SignaturePad', { label: 'Firma del titular', name: 'firma', required: true })),
    section(
      'labs-prevision',
      C('SolarForecast', {
        title: 'Producción de hoy',
        forecast: [0, 0, 0, 0, 0, 0, 0.2, 0.8, 1.6, 2.4, 3.1, 3.5, 3.6, 3.4, 2.9, 2.2, 1.4, 0.6, 0.1, 0, 0, 0, 0, 0],
        actual: [0, 0, 0, 0, 0, 0, 0.3, 0.9, 1.8, 2.6, 3.3, 3.8, 3.9],
        weather: Array.from({ length: 24 }, (_, i) => (i < 12 ? 'sun' : i < 16 ? 'partly' : 'cloud')),
      }),
    ),
    section('labs-oculto', make('button', { type: 'button' }, 'Ver', C('VisuallyHidden', null, ' la oferta OF-0418'))),
  ]
}
