'use client'
import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'
import { dateSuggestions, rangeError, shortDateLabel, todayIso, type DateRangeValue } from '@1k5-tech-es/grado/patterns'
import { Combobox } from './Combobox.js'
import { Input } from './Field.js'
import { useGrado } from './Locale.js'
import { useAutoId, useValue } from './hooks.js'

export type DatePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  size?: 'sm' | 'md' | 'lg'
  onValueChange?: (value: string) => void
  /**
   * Se escribe la fecha («mañana», «viernes», «en 2 semanas», «20/11») y se elige de la lista, en el idioma
   * de GradoProvider. Es un Combobox: el valor sigue siendo YYYY-MM-DD y name lo envía igual.
   */
  natural?: boolean
  /** Con natural, el día de hoy (YYYY-MM-DD) del que parten «mañana» o «en 2 semanas». Por defecto, el del navegador. */
  today?: string
}
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { onValueChange, onChange, natural, today, ...props },
  ref,
) {
  if (natural) return <NaturalDatePicker {...props} ref={ref} today={today} onValueChange={onValueChange} />
  return (
    <Input
      {...props}
      ref={ref}
      type="date"
      onChange={(event) => {
        onChange?.(event)
        onValueChange?.(event.target.value)
      }}
    />
  )
})
type NaturalProps = Omit<DatePickerProps, 'natural' | 'onChange'>
const NaturalDatePicker = forwardRef<HTMLInputElement, NaturalProps>(function NaturalDatePicker(
  { value, defaultValue = '', onValueChange, today, min, max, placeholder, name, disabled, required, id, className, ...rest },
  ref,
) {
  const { locale, messages: m } = useGrado()
  const [query, setQuery] = useState('')
  const [current, select] = useValue(value === undefined ? undefined : String(value), String(defaultValue), onValueChange)
  const now = today ?? todayIso()
  const options = dateSuggestions(query, { today: now, locale, min: min as string, max: max as string }).map((option) => ({
    ...option,
    keywords: query,
  }))
  // La fecha elegida sigue en la lista para que el campo la muestre aunque no salga entre las propuestas.
  if (current && !options.some((option) => option.value === current))
    options.push({ value: current, label: shortDateLabel(current, { today: now, locale }), keywords: '' })
  return (
    <Combobox
      ref={ref}
      options={options}
      value={current}
      onValueChange={select}
      onQueryChange={setQuery}
      label={rest['aria-label']}
      placeholder={placeholder ?? m.datePlaceholder}
      emptyLabel={m.dateHint}
      name={name}
      disabled={disabled}
      required={required}
      id={id}
      className={className}
    />
  )
})
export interface DateRangePickerProps {
  label: string
  value?: DateRangeValue
  defaultValue?: DateRangeValue
  onValueChange?: (value: DateRangeValue) => void
  min?: string
  max?: string
  required?: boolean
  disabled?: boolean
  name?: string
  className?: string
}
export const DateRangePicker = forwardRef<HTMLFieldSetElement, DateRangePickerProps>(function DateRangePicker(
  { label, value, defaultValue = { start: '', end: '' }, onValueChange, min, max, required, disabled, name, className },
  ref,
) {
  const [range, select] = useValue(value, defaultValue, onValueChange),
    id = useAutoId('k5-range'),
    { messages: m } = useGrado(),
    error = rangeError(range.start, range.end, min, max, m)
  return (
    <fieldset ref={ref} className={cx('k5-date-range', className)} disabled={disabled}>
      <legend>{label}</legend>
      <div className="k5-date-range__fields">
        <label>
          {m.dateFrom}
          <DatePicker
            name={name ? `${name}[start]` : undefined}
            value={range.start}
            min={min}
            max={range.end && (!max || range.end < max) ? range.end : max}
            required={required}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={!!error || undefined}
            onValueChange={(start) => select({ ...range, start })}
          />
        </label>
        <label>
          {m.dateTo}
          <DatePicker
            name={name ? `${name}[end]` : undefined}
            value={range.end}
            min={range.start && (!min || range.start > min) ? range.start : min}
            max={max}
            required={required}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={!!error || undefined}
            onValueChange={(end) => select({ ...range, end })}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="k5-field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </fieldset>
  )
})
