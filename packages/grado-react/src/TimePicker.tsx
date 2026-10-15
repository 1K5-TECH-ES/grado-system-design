'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cx, FIELD_ICON_PATHS, ICON_PATHS, type Size } from '@1k5-tech-es/grado/classes'
import { nearestTime, normalizeTime, timeError, timeSlots } from '@1k5-tech-es/grado/patterns'
import { Input, useField } from './Field.js'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { useAutoId, useValue } from './hooks.js'
import { useCheck } from './field-check.js'

export interface TimePickerProps {
  /** «HH:MM» o '' si está vacío. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Minutos entre franjas de la lista. */
  step?: number
  /** Primera y última hora admitidas: «08:00», «20:00». */
  min?: string
  max?: string
  placeholder?: string
  size?: Size
  /** Nombre accesible si no hay Field con etiqueta. */
  label?: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  /** Envía la hora «HH:MM» en un campo oculto. */
  name?: string
  id?: string
  className?: string
  /** El error de formato o de rango, o '' si la hora vale. */
  onErrorChange?: (message: string) => void
}

/**
 * Hora «HH:MM». Se puede escribir («9», «930», «9:30», «09.30»: al salir queda «09:30») o elegir
 * en la lista de franjas, con las flechas y Enter como en Combobox.
 */
export function TimePicker({
  value,
  defaultValue = '',
  onValueChange,
  step = 15,
  min,
  max,
  placeholder,
  size,
  label,
  disabled,
  required,
  invalid,
  name,
  id,
  className,
  onErrorChange,
}: TimePickerProps) {
  const { messages: m } = useGrado()
  const field = useField()
  const inputId = useAutoId('k5-time', id ?? field?.id),
    listId = `${inputId}-list`,
    checkId = `${inputId}-check`
  const [current, setCurrent] = useValue(value, defaultValue, onValueChange)
  // Lo que se está escribiendo; null muestra el valor.
  const [draft, setDraft] = useState<string | null>(null)
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(-1)
  const input = useRef<HTMLInputElement>(null)
  const slots = useMemo(() => timeSlots(min ?? '00:00', max ?? '23:59', step), [min, max, step])
  const text = draft ?? current
  const range = { min, max }
  const check = useCheck(timeError(text, range, m), Boolean(text), onErrorChange)
  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${inputId}-option-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open, inputId])

  const update = (next: string) => {
    if (next !== current) setCurrent(next)
  }
  // Al salir o con Enter: «930» → «09:30». Si no es una hora válida, el texto se queda con su error.
  const commit = () => {
    check.touch()
    if (draft === null) return
    const normalized = normalizeTime(draft)
    if (!draft.trim()) {
      update('')
      setDraft(null)
    } else if (normalized && !timeError(normalized, range)) {
      update(normalized)
      setDraft(null)
    } else {
      update('')
      setDraft(normalized ?? draft)
    }
  }
  const show = () => {
    setOpen(true)
    setActive(nearestTime(slots, text))
  }
  const close = () => {
    setOpen(false)
    setActive(-1)
  }
  const pick = (slot: string) => {
    update(slot)
    setDraft(null)
    check.touch()
    close()
    input.current?.focus()
  }

  return (
    <div
      className={cx('k5-time-picker', className)}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return
        commit()
        close()
      }}
    >
      <div className="k5-time-picker__control">
        <Input
          ref={input}
          id={inputId}
          size={size}
          role="combobox"
          aria-label={label}
          aria-autocomplete="none"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && active >= 0 ? `${inputId}-option-${active}` : undefined}
          aria-describedby={check.message ? checkId : undefined}
          invalid={check.message ? true : invalid}
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder ?? m.timePlaceholder}
          disabled={disabled}
          required={required}
          value={text}
          prefix={<PathIcon paths={FIELD_ICON_PATHS.clock} className="k5-time-picker__icon" />}
          onFocus={show}
          onClick={() => {
            if (!open) show()
          }}
          onChange={(event) => {
            const typed = event.target.value
            setDraft(typed)
            setOpen(true)
            setActive(slots.indexOf(normalizeTime(typed) ?? ''))
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              if (open) close()
              else if (draft !== null) setDraft(null)
              else return
              event.preventDefault()
              event.stopPropagation()
              return
            }
            if (event.key === 'Enter') {
              if (open) event.preventDefault()
              if (open && active >= 0) pick(slots[active])
              else {
                commit()
                close()
              }
              return
            }
            const moves = ['ArrowDown', 'ArrowUp', ...(open ? ['Home', 'End'] : [])]
            if (!moves.includes(event.key) || !slots.length) return
            event.preventDefault()
            setOpen(true)
            const from = active >= 0 ? active : nearestTime(slots, text)
            const last = slots.length - 1
            setActive(
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? last
                  : !open || from < 0
                    ? from >= 0
                      ? from
                      : event.key === 'ArrowDown'
                        ? 0
                        : last
                    : (from + (event.key === 'ArrowDown' ? 1 : -1) + slots.length) % slots.length,
            )
          }}
        />
        {open ? (
          <ul className="k5-combobox__list" id={listId} role="listbox" aria-label={m.timeOptions} tabIndex={-1}>
            {slots.length ? (
              slots.map((slot, index) => (
                <li
                  role="option"
                  id={`${inputId}-option-${index}`}
                  key={slot}
                  aria-selected={slot === current}
                  data-active={index === active}
                  className="k5-combobox__option"
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => setActive(index)}
                  onClick={() => pick(slot)}
                >
                  <span>{slot}</span>
                  <PathIcon paths={ICON_PATHS.check} className="k5-combobox__check" />
                </li>
              ))
            ) : (
              <li role="presentation" className="k5-combobox__empty">
                {m.noResults}
              </li>
            )}
          </ul>
        ) : null}
      </div>
      {check.message ? (
        <p className="k5-field__error" id={checkId} role="alert">
          {check.message}
        </p>
      ) : null}
      {name ? <input type="hidden" name={name} value={current} disabled={disabled} /> : null}
    </div>
  )
}
