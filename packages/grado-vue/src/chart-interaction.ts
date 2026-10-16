import { h, ref, type Ref } from 'vue'
import type { Messages } from '@1k5-tech-es/grado/messages'
import { chartKeyMove, chartSlotAt, slotCenter, tooltipAlign } from '@1k5-tech-es/grado/patterns'
import { autoId } from './helpers.js'

/** Lo que enseña la tarjeta de un dato: la categoría y el valor de cada serie con su color. */
export interface ChartRow {
  title: string
  values: { key: string; label: string; text: string; swatch: string }[]
}

/**
 * Ratón, teclado y anuncios de BarChart y LineChart. Uso interno: se llama en setup() y
 * view() en cada render. Sin interactive, el cuerpo del gráfico queda como antes.
 */
export function useChartInteraction() {
  const id = autoId('k5-chart')
  const active: Ref<number | null> = ref(null)
  // Solo se anuncia lo que se recorre con el teclado: con el ratón sería una ráfaga de avisos.
  const spoken = ref('')
  return function view({
    count,
    interactive,
    hasTitle,
    messages,
    row,
  }: {
    count: number
    interactive: boolean
    hasTitle: boolean
    messages: Messages
    row: (index: number) => ChartRow
  }) {
    const current = interactive && active.value != null && active.value < count ? active.value : null
    if (!interactive)
      return { active: null, titleId: undefined, body: { 'aria-hidden': 'true' }, part: {}, plot: {}, tooltip: null, speech: [] }
    const tooltip = () => {
      if (current == null) return null
      const shown = row(current)
      const x = slotCenter(current, count)
      return h('div', { class: `k5-chart__tooltip k5-chart__tooltip--${tooltipAlign(x)}`, style: { left: `${x}%` } }, [
        h('span', { class: 'k5-chart__tooltip-title' }, shown.title),
        ...shown.values.map((value) =>
          h('span', { key: value.key, class: 'k5-chart__tooltip-row' }, [
            h('span', { class: value.swatch }),
            value.label,
            h('span', { class: 'k5-chart__tooltip-value' }, value.text),
          ]),
        ),
      ])
    }
    return {
      active: current,
      titleId: hasTitle ? `${id}-title` : undefined,
      body: {
        role: 'group',
        tabindex: 0,
        'aria-labelledby': hasTitle ? `${id}-title` : undefined,
        'aria-label': hasTitle ? undefined : messages.chartData,
        'aria-describedby': `${id}-hint`,
        onKeydown: (event: KeyboardEvent) => {
          if (event.key === 'Escape') return (active.value = null)
          const next = chartKeyMove(event.key, current, count)
          if (next === undefined) return
          event.preventDefault()
          active.value = next
          const shown = row(next)
          spoken.value = `${shown.title}: ${shown.values.map((value) => `${value.label} ${value.text}`).join(', ')}`
        },
        onBlur: () => (active.value = null),
      },
      part: { 'aria-hidden': 'true' },
      plot: {
        onPointermove: (event: PointerEvent) => {
          const box = (event.currentTarget as HTMLElement).getBoundingClientRect()
          active.value = chartSlotAt(event.clientX - box.left, box.width, count)
        },
        onPointerleave: () => (active.value = null),
      },
      tooltip: tooltip(),
      speech: [
        h('span', { class: 'k5-sr-only', id: `${id}-hint` }, messages.chartHint),
        h('span', { class: 'k5-sr-only', 'aria-live': 'polite' }, spoken.value),
      ],
    }
  }
}
