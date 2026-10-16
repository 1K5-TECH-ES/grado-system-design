'use client'
import { forwardRef, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { todayIso, type DateRangeValue } from '@1k5-tech-es/grado/patterns'
import { calendarAnchor, calendarChoose, calendarMove, calendarShift, calendarView } from '@1k5-tech-es/grado/core'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { useAutoId, useValue } from './hooks.js'

interface CalendarBaseProps {
  /** Fechas ISO límite: YYYY-MM-DD. */
  min?: string
  max?: string
  /** Mes visible, YYYY-MM. Úsalo con onMonthChange. */
  month?: string
  defaultMonth?: string
  onMonthChange?: (month: string) => void
  /** Fecha de hoy (YYYY-MM-DD). Solo para tests o para otra zona horaria. */
  today?: string
  /** 1 = lunes (por defecto), 0 = domingo. */
  weekStartsOn?: number
  locale?: string
  /** Nombre accesible del calendario. */
  label?: string
  /** Sin borde ni fondo, para ponerlo dentro de una tarjeta o un Drawer. */
  plain?: boolean
  className?: string
}
interface CalendarSingleProps extends CalendarBaseProps {
  mode?: 'single'
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}
interface CalendarRangeProps extends CalendarBaseProps {
  mode: 'range'
  value?: DateRangeValue
  defaultValue?: DateRangeValue
  onValueChange?: (value: DateRangeValue) => void
}
export type CalendarProps = CalendarSingleProps | CalendarRangeProps

/**
 * Un mes para elegir una fecha (mode="single") o un periodo (mode="range": primer clic,
 * inicio; segundo, final). Flechas: días y semanas. Re Pág / Av Pág: meses (con
 * Mayúsculas, años). Inicio y Fin: principio y final de la semana.
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const {
    mode = 'single',
    min,
    max,
    month,
    defaultMonth,
    onMonthChange,
    today: todayProp,
    weekStartsOn = 1,
    locale: localeProp,
    label,
    plain = false,
    className,
  } = props
  const { messages: m, locale: contextLocale } = useGrado()
  const locale = localeProp ?? contextLocale
  const today = todayProp ?? todayIso()
  const range = mode === 'range'
  const [current, setCurrent] = useValue<string | DateRangeValue>(
    props.value,
    props.defaultValue ?? (range ? { start: '', end: '' } : ''),
    props.onValueChange as (value: string | DateRangeValue) => void,
  )
  const [visible, setVisible] = useValue(month, defaultMonth ?? calendarAnchor(current, { mode, today, min, max }), onMonthChange)
  const [focusDate, setFocusDate] = useState<string | null>(null)
  const moved = useRef(false)
  const grid = useRef<HTMLTableElement>(null)
  const id = useAutoId('k5-calendar')
  // Rejilla, teclado y periodo salen del núcleo común (@1k5-tech-es/grado/core), como en Vue.
  const view = calendarView({ visible, value: current, mode, today, min, max, focusDate, weekStartsOn, locale })

  useEffect(() => {
    if (!moved.current || !focusDate) return
    moved.current = false
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate}"]`)?.focus()
  }, [focusDate, visible])

  const choose = (iso: string) => {
    setFocusDate(iso)
    setCurrent(calendarChoose(current, iso, mode))
  }
  const onKey = (event: KeyboardEvent<HTMLTableElement>) => {
    const next = calendarMove(event.key, (event.target as HTMLElement).dataset.date, { shift: event.shiftKey, weekStartsOn, min, max })
    if (!next) return
    event.preventDefault()
    setFocusDate(next)
    moved.current = true
    if (!next.startsWith(visible)) setVisible(next.slice(0, 7))
  }
  const shiftMonth = (months: number) => {
    setVisible(calendarShift(visible, months))
    setFocusDate(null)
  }

  return (
    <div ref={ref} className={cx('k5-calendar', plain && 'k5-calendar--plain', className)} role="group" aria-label={label ?? m.calendar}>
      <div className="k5-calendar__header">
        <button
          type="button"
          className="k5-btn k5-btn--ghost k5-btn--icon k5-btn--sm"
          aria-label={m.previousMonth}
          disabled={view.prevBlocked}
          onClick={() => shiftMonth(-1)}
        >
          <PathIcon paths={ICON_PATHS.chevronLeft} />
        </button>
        <span className="k5-calendar__title" id={`${id}-title`} aria-live="polite">
          {view.title}
        </span>
        <button
          type="button"
          className="k5-btn k5-btn--ghost k5-btn--icon k5-btn--sm"
          aria-label={m.nextMonth}
          disabled={view.nextBlocked}
          onClick={() => shiftMonth(1)}
        >
          <PathIcon paths={ICON_PATHS.chevronRight} />
        </button>
      </div>
      <table
        ref={grid}
        className="k5-calendar__grid"
        role="grid"
        aria-labelledby={`${id}-title`}
        aria-multiselectable={range || undefined}
        onKeyDown={onKey}
      >
        <thead>
          <tr>
            {view.names.map((name) => (
              <th key={name.long} scope="col" abbr={name.long}>
                {name.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {view.weeks.map((week) => (
            <tr key={week[0].iso}>
              {week.map((day) =>
                day.outside ? (
                  <td key={day.iso}>
                    <span className="k5-calendar__outside" aria-hidden="true">
                      {day.day}
                    </span>
                  </td>
                ) : (
                  // En un periodo, todos sus días constan como seleccionados; los extremos van en sólido.
                  <td
                    key={day.iso}
                    aria-selected={day.selected}
                    data-endpoint={day.endpoint ? true : undefined}
                    data-in-range={day.between ? true : undefined}
                    data-range-start={day.rangeStart ? true : undefined}
                    data-range-end={day.rangeEnd ? true : undefined}
                  >
                    <button
                      type="button"
                      className="k5-calendar__day"
                      data-date={day.iso}
                      tabIndex={day.tabbable ? 0 : -1}
                      aria-label={day.label}
                      aria-current={day.today ? 'date' : undefined}
                      disabled={day.disabled}
                      onClick={() => choose(day.iso)}
                    >
                      {day.day}
                    </button>
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
})
