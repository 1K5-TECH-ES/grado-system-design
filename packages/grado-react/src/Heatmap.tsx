'use client'
import { forwardRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'
import { formatNumber, gridKeyMove, heatLevels, tooltipAlign, weekdayNames } from '@1k5-tech-es/grado/patterns'
import { useGrado } from './Locale.js'
import { useAutoId } from './hooks.js'

export interface HeatmapProps {
  /** Filas de valores: una por día (o lo que sea cada fila), una columna por hora. null: sin dato. */
  data: (number | null)[][]
  /** Nombre de cada fila. Con 7 filas y sin él, los días de la semana empezando en lunes. */
  rowLabels?: string[]
  /** Nombre de cada columna. Con 24 columnas y sin él, las horas (se ve una de cada seis). */
  columnLabels?: string[]
  /** Cabecera de la columna de filas en la tabla accesible: «Día». */
  rowLabel?: string
  unit?: string
  decimals?: number
  /** Color: chart-1 … chart-5. */
  tone?: 1 | 2 | 3 | 4 | 5
  /** Extremos de la escala. Por defecto, el mínimo y el máximo de los datos. */
  min?: number
  max?: number
  title?: ReactNode
  description?: ReactNode
  /** Escala de color con el mínimo y el máximo. Por defecto, true. */
  legend?: boolean
  /** Tarjeta al pasar el ratón y flechas para recorrer las celdas. Por defecto, true. */
  interactive?: boolean
  locale?: string
  className?: string
}

/**
 * Un valor por celda en la intensidad de un color: consumo por hora y día de la semana,
 * producción por mes y año. Para lectores de pantalla, los datos van en una tabla oculta.
 */
export const Heatmap = forwardRef<HTMLElement, HeatmapProps>(function Heatmap(
  {
    data,
    rowLabels,
    columnLabels,
    rowLabel,
    unit,
    decimals = 1,
    tone = 1,
    min,
    max,
    title,
    description,
    legend = true,
    interactive = true,
    locale: localeProp,
    className,
  },
  ref,
) {
  const { messages: m, locale: contextLocale } = useGrado()
  const locale = localeProp ?? contextLocale
  const id = useAutoId('k5-heatmap')
  const [active, setActive] = useState<[number, number] | null>(null)
  const [spoken, setSpoken] = useState('')
  const rows = data.length
  const columns = Math.max(0, ...data.map((row) => row.length))
  const rowNames = rowLabels ?? (rows === 7 ? weekdayNames(locale, 1).map((day) => day.long) : data.map((_, i) => String(i + 1)))
  const rowShort = rowLabels ?? (rows === 7 ? weekdayNames(locale, 1).map((day) => day.short) : rowNames)
  const columnNames = columnLabels ?? Array.from({ length: columns }, (_, i) => (columns === 24 ? `${i} h` : String(i + 1)))
  const scale = heatLevels(data, { min, max })
  const withUnit = (value: number | null | undefined) =>
    value == null ? '—' : unit ? `${formatNumber(value, locale, decimals)} ${unit}` : formatNumber(value, locale, decimals)
  const cellText = (r: number, c: number) => `${rowNames[r]}, ${columnNames[c]}: ${withUnit(data[r]?.[c])}`
  const current = interactive && active && active[0] < rows && active[1] < columns ? active : null
  const hasTitle = title != null
  const body = interactive
    ? {
        role: 'group',
        tabIndex: 0,
        'aria-labelledby': hasTitle ? `${id}-title` : undefined,
        'aria-label': hasTitle ? undefined : m.chartData,
        'aria-describedby': `${id}-hint`,
        onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === 'Escape') return setActive(null)
          const next = gridKeyMove(event.key, current, rows, columns)
          if (!next) return
          event.preventDefault()
          setActive(next)
          setSpoken(cellText(next[0], next[1]))
        },
        onBlur: () => setActive(null),
      }
    : { 'aria-hidden': true as const }
  const x = current ? Math.round(((current[1] + 0.5) / columns) * 10000) / 100 : 0
  return (
    <figure ref={ref} className={cx('k5-chart', 'k5-heatmap', tone !== 1 && `k5-heatmap--tone-${tone}`, className)}>
      {title != null || description != null ? (
        <figcaption className="k5-chart__header">
          {title != null ? (
            <span className="k5-chart__title" id={interactive ? `${id}-title` : undefined}>
              {title}
            </span>
          ) : null}
          {description != null ? <span className="k5-chart__description">{description}</span> : null}
        </figcaption>
      ) : null}
      <div className="k5-heatmap__body" {...body}>
        <div className="k5-heatmap__rows" aria-hidden={interactive || undefined}>
          {rowShort.slice(0, rows).map((name, r) => (
            <span key={r}>{name}</span>
          ))}
        </div>
        <div
          className="k5-heatmap__cells"
          style={{ '--_columns': String(columns) } as CSSProperties}
          aria-hidden={interactive || undefined}
          {...(interactive
            ? {
                onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
                  const cell = (event.target as HTMLElement).closest<HTMLElement>('[data-cell]')
                  if (cell) setActive(cell.dataset.cell!.split(':').map(Number) as [number, number])
                },
                onPointerLeave: () => setActive(null),
              }
            : {})}
        >
          {data.flatMap((row, r) =>
            Array.from({ length: columns }, (_, c) => {
              const level = scale.levels[r]?.[c]
              return (
                <span
                  key={`${r}:${c}`}
                  data-cell={`${r}:${c}`}
                  className={cx('k5-heatmap__cell', level == null && 'k5-heatmap__cell--empty')}
                  style={level == null ? undefined : ({ '--_level': String(level) } as CSSProperties)}
                  data-active={(current && current[0] === r && current[1] === c) || undefined}
                  title={interactive ? undefined : cellText(r, c)}
                />
              )
            }),
          )}
          {current ? (
            <div
              className={`k5-chart__tooltip k5-chart__tooltip--${tooltipAlign(x)}`}
              style={{ left: `${x}%`, bottom: `${Math.round((1 - current[0] / rows) * 10000) / 100}%` }}
            >
              <span className="k5-chart__tooltip-title">{`${rowNames[current[0]]} · ${columnNames[current[1]]}`}</span>
              <span className="k5-chart__tooltip-row">
                <span className="k5-chart__tooltip-value">{withUnit(data[current[0]]?.[current[1]])}</span>
              </span>
            </div>
          ) : null}
        </div>
        <div className="k5-heatmap__axis" style={{ '--_columns': String(columns) } as CSSProperties} aria-hidden="true">
          {columnNames.map((name, c) => (
            <span key={c}>{columnLabels || columns !== 24 || c % 6 === 0 ? name : ''}</span>
          ))}
        </div>
        {interactive ? (
          <>
            <span className="k5-sr-only" id={`${id}-hint`}>
              {m.chartHint}
            </span>
            <span className="k5-sr-only" aria-live="polite">
              {spoken}
            </span>
          </>
        ) : null}
      </div>
      {legend ? (
        <div className="k5-heatmap__legend" aria-hidden="true">
          <span>{withUnit(scale.min)}</span>
          <span className="k5-heatmap__scale" />
          <span>{withUnit(scale.max)}</span>
        </div>
      ) : null}
      <table className="k5-sr-only">
        <caption>{title ?? m.chartData}</caption>
        <thead>
          <tr>
            {rowLabel ? <th scope="col">{rowLabel}</th> : <td />}
            {columnNames.map((name, c) => (
              <th key={c} scope="col">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, r) => (
            <tr key={r}>
              <th scope="row">{rowNames[r]}</th>
              {Array.from({ length: columns }, (_, c) => (
                <td key={c}>{withUnit(row[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
})
