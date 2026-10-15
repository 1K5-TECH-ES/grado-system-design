'use client'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import {
  addDays,
  addMonths,
  clampDate,
  dateLabel,
  monthTitle,
  monthWeeks,
  nextRange,
  startOfWeek,
  todayIso,
  weekdayNames,
  type DateRangeValue,
} from '@1k5-tech-es/grado/patterns'
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

const KEY_MOVES: Record<string, (iso: string, shift: boolean, weekStartsOn: number) => string> = {
  ArrowLeft: (iso) => addDays(iso, -1),
  ArrowRight: (iso) => addDays(iso, 1),
  ArrowUp: (iso) => addDays(iso, -7),
  ArrowDown: (iso) => addDays(iso, 7),
  Home: (iso, _, start) => startOfWeek(iso, start),
  End: (iso, _, start) => addDays(startOfWeek(iso, start), 6),
  PageUp: (iso, shift) => addMonths(iso, shift ? -12 : -1),
  PageDown: (iso, shift) => addMonths(iso, shift ? 12 : 1),
}

/**
 * Un mes para elegir una fecha (mode="single") o un periodo (mode="range": primer clic,
 * inicio; segundo, final). Flechas: días y semanas. Re Pág / Av Pág: meses (con
 * Mayúsculas, años). Inicio y Fin: principio y final de la semana.
 */
export function Calendar(props: CalendarProps) {
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
  const single = typeof current === 'string' ? current : ''
  const span = typeof current === 'object' && current ? current : { start: '', end: '' }
  const anchor = (range ? span.start : single) || clampDate(today, min, max)
  const [visible, setVisible] = useValue(month, defaultMonth ?? anchor.slice(0, 7), onMonthChange)
  const [focusDate, setFocusDate] = useState<string | null>(null)
  const moved = useRef(false)
  const grid = useRef<HTMLTableElement>(null)
  const id = useAutoId('k5-calendar')
  const names = weekdayNames(locale, weekStartsOn)
  const weeks = monthWeeks(visible, weekStartsOn)
  const inMonth = (iso: string | null | undefined) => Boolean(iso && iso.startsWith(visible))
  const tabbable = [focusDate, range ? span.start : single, today, `${visible}-01`].find(inMonth) as string
  const blocked = (iso: string) => Boolean((min && iso < min) || (max && iso > max))

  useEffect(() => {
    if (!moved.current || !focusDate) return
    moved.current = false
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate}"]`)?.focus()
  }, [focusDate, visible])

  const go = (target: string, focus = false) => {
    const next = clampDate(target, min, max)
    setFocusDate(next)
    moved.current = focus
    if (!next.startsWith(visible)) setVisible(next.slice(0, 7))
  }
  const choose = (iso: string) => {
    setFocusDate(iso)
    setCurrent(range ? nextRange(span, iso) : iso)
  }
  const onKey = (event: KeyboardEvent<HTMLTableElement>) => {
    const from = (event.target as HTMLElement).dataset.date
    const move = KEY_MOVES[event.key]
    if (!from || !move) return
    event.preventDefault()
    go(move(from, event.shiftKey, weekStartsOn), true)
  }
  const shiftMonth = (months: number) => {
    const next = addMonths(`${visible}-01`, months).slice(0, 7)
    setVisible(next)
    setFocusDate(null)
  }
  const prevBlocked = Boolean(min && `${visible}-01` <= min)
  const nextBlocked = Boolean(max && addMonths(`${visible}-01`, 1) > max)

  return (
    <div className={cx('k5-calendar', plain && 'k5-calendar--plain', className)} role="group" aria-label={label ?? m.calendar}>
      <div className="k5-calendar__header">
        <button
          type="button"
          className="k5-btn k5-btn--ghost k5-btn--icon k5-btn--sm"
          aria-label={m.previousMonth}
          disabled={prevBlocked}
          onClick={() => shiftMonth(-1)}
        >
          <PathIcon paths={ICON_PATHS.chevronLeft} />
        </button>
        <span className="k5-calendar__title" id={`${id}-title`} aria-live="polite">
          {monthTitle(visible, locale)}
        </span>
        <button
          type="button"
          className="k5-btn k5-btn--ghost k5-btn--icon k5-btn--sm"
          aria-label={m.nextMonth}
          disabled={nextBlocked}
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
            {names.map((name) => (
              <th key={name.long} scope="col" abbr={name.long}>
                {name.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0].iso}>
              {week.map((day) => {
                if (day.outside)
                  return (
                    <td key={day.iso}>
                      <span className="k5-calendar__outside" aria-hidden="true">
                        {day.day}
                      </span>
                    </td>
                  )
                // En un periodo, todos sus días constan como seleccionados; los extremos van en sólido.
                const endpoint = range ? day.iso === span.start || day.iso === span.end : day.iso === single
                const between = Boolean(range && span.start && span.end && day.iso >= span.start && day.iso <= span.end)
                return (
                  <td
                    key={day.iso}
                    aria-selected={endpoint || between}
                    data-endpoint={endpoint ? true : undefined}
                    data-in-range={between ? true : undefined}
                    data-range-start={between && day.iso === span.start ? true : undefined}
                    data-range-end={between && day.iso === span.end ? true : undefined}
                  >
                    <button
                      type="button"
                      className="k5-calendar__day"
                      data-date={day.iso}
                      tabIndex={day.iso === tabbable ? 0 : -1}
                      aria-label={dateLabel(day.iso, locale)}
                      aria-current={day.iso === today ? 'date' : undefined}
                      disabled={blocked(day.iso)}
                      onClick={() => choose(day.iso)}
                    >
                      {day.day}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
