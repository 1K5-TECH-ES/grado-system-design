// Web de documentación · grupo «labs» (0.6): demo en vivo de cada ficha (id → componente React).
// No importes doc-helpers.mjs aquí: demos.mjs carga este archivo y doc-helpers carga demos.mjs.
import { createElement as h, useState } from 'react'
import * as G from '@1k5-tech-es/grado-react'
import * as L from '@1k5-tech-es/grado-react/labs'

const stack = (...children) => h('div', { className: 'live-stack' }, ...children)
const row = (...children) => h('div', { className: 'demo-row' }, ...children)
// Fecha fija: la demo y sus capturas salen siempre igual.
const NOW = new Date('2026-10-16T10:30:00+02:00')
const ago = (seconds) => new Date(NOW.getTime() - seconds * 1000)

function AmountDemo() {
  return row(
    h(L.Amount, { value: 11840, unit: 'eur', decimals: 0 }),
    h(L.Amount, { value: 12500, unit: 'kWh', scale: true }),
    h(L.Amount, { value: 6.4, unit: 'kWp' }),
    h(L.Amount, { value: 1120, unit: 'eur', signed: true, colored: true }),
    h(L.Amount, { value: -0.04, unit: 'percent', signed: true, colored: true }),
  )
}

function RelativeTimeDemo() {
  return h(G.DescriptionList, {
    items: [
      { term: 'Último mensaje', description: h(L.RelativeTime, { value: ago(300), now: NOW }) },
      { term: 'Lectura del contador', description: h(L.RelativeTime, { value: ago(26 * 3600), now: NOW }) },
      { term: 'Alta del cliente', description: h(L.RelativeTime, { value: ago(40 * 86_400), now: NOW }) },
    ],
  })
}

function ThemeToggleDemo() {
  // La demo no cambia el tema de la web: guarda en su propia clave y no toca <html>.
  return h(L.ThemeToggle, { storageKey: 'grado-docs-demo-tema', apply: false })
}

function ScrollAreaDemo() {
  const events = [
    'Oferta enviada',
    'Visita técnica programada',
    'Documentación recibida',
    'Legalización iniciada',
    'Instalación programada',
    'Instalación terminada',
    'Alta en la distribuidora',
    'Primera lectura',
  ]
  return h(
    L.ScrollArea,
    { label: 'Historial de la instalación', maxHeight: 132, style: { width: '100%', maxWidth: '22rem' } },
    h(G.Stack, { gap: '2' }, ...events.map((text, i) => h(G.Text, { key: text, size: 'small' }, `${i + 1}. ${text}`))),
  )
}

function UseHotkeyDemo() {
  const [count, setCount] = useState(0)
  L.useHotkey('mod+j', () => setCount((n) => n + 1))
  return stack(
    h(G.Text, { size: 'small' }, 'Pulsa ', h(G.Kbd, { keys: L.hotkeyLabel('mod+j').split(' ') }), ' en esta página.'),
    h(G.Text, { size: 'small', tone: 'muted' }, `Veces: ${count}`),
  )
}

function VisuallyHiddenDemo() {
  return row(
    h(G.Button, { variant: 'secondary', size: 'sm' }, 'Ver', h(L.VisuallyHidden, null, ' la oferta OF-0418')),
    h(G.Text, { size: 'small', tone: 'muted' }, 'Un lector de pantalla dice «Ver la oferta OF-0418».'),
  )
}

export const demos = {
  amount: AmountDemo,
  'relative-time': RelativeTimeDemo,
  'theme-toggle': ThemeToggleDemo,
  'scroll-area': ScrollAreaDemo,
  'use-hotkey': UseHotkeyDemo,
  'visually-hidden': VisuallyHiddenDemo,
}
