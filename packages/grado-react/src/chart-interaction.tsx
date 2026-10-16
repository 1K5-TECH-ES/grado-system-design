'use client'
import { useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { Messages } from '@1k5-tech-es/grado/messages'
import { chartKeyMove, chartSlotAt, slotCenter, tooltipAlign } from '@1k5-tech-es/grado/patterns'
import { useAutoId } from './hooks.js'

/** Lo que enseña la tarjeta de un dato: la categoría y el valor de cada serie con su color. */
export interface ChartRow {
  title: string
  values: { key: string; label: string; text: string; swatch: string }[]
}

/**
 * Ratón, teclado y anuncios de BarChart y LineChart. Uso interno. Sin interactive, el cuerpo
 * del gráfico queda como antes: una imagen oculta a los lectores de pantalla, con su tabla aparte.
 */
export function useChartInteraction({
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
  const id = useAutoId('k5-chart')
  const [active, setActive] = useState<number | null>(null)
  // Solo se anuncia lo que se recorre con el teclado: con el ratón sería una ráfaga de avisos.
  const [spoken, setSpoken] = useState('')
  const current = interactive && active != null && active < count ? active : null
  if (!interactive)
    return { active: null, titleId: undefined, body: { 'aria-hidden': true as const }, part: {}, plot: {}, tooltip: null, speech: null }
  const tooltip =
    current == null
      ? null
      : (() => {
          const shown = row(current)
          const x = slotCenter(current, count)
          return (
            <div className={`k5-chart__tooltip k5-chart__tooltip--${tooltipAlign(x)}`} style={{ left: `${x}%` }}>
              <span className="k5-chart__tooltip-title">{shown.title}</span>
              {shown.values.map((value) => (
                <span key={value.key} className="k5-chart__tooltip-row">
                  <span className={value.swatch} />
                  {value.label}
                  <span className="k5-chart__tooltip-value">{value.text}</span>
                </span>
              ))}
            </div>
          )
        })()
  return {
    active: current,
    titleId: hasTitle ? `${id}-title` : undefined,
    body: {
      role: 'group',
      tabIndex: 0,
      'aria-labelledby': hasTitle ? `${id}-title` : undefined,
      'aria-label': hasTitle ? undefined : messages.chartData,
      'aria-describedby': `${id}-hint`,
      onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') return setActive(null)
        const next = chartKeyMove(event.key, current, count)
        if (next === undefined) return
        event.preventDefault()
        setActive(next)
        const shown = row(next)
        setSpoken(`${shown.title}: ${shown.values.map((value) => `${value.label} ${value.text}`).join(', ')}`)
      },
      onBlur: () => setActive(null),
    },
    part: { 'aria-hidden': true as const },
    plot: {
      onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
        const box = event.currentTarget.getBoundingClientRect()
        setActive(chartSlotAt(event.clientX - box.left, box.width, count))
      },
      onPointerLeave: () => setActive(null),
    },
    tooltip,
    speech: (
      <>
        <span className="k5-sr-only" id={`${id}-hint`}>
          {messages.chartHint}
        </span>
        <span className="k5-sr-only" aria-live="polite">
          {spoken}
        </span>
      </>
    ),
  }
}
