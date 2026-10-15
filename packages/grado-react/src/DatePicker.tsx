'use client'
import { forwardRef, type InputHTMLAttributes } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'
import { rangeError, type DateRangeValue } from '@1k5-tech-es/grado/patterns'
import { Input } from './Field.js'
import { useGrado } from './Locale.js'
import { useAutoId, useValue } from './hooks.js'

export type DatePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  size?: 'sm' | 'md' | 'lg'
  onValueChange?: (value: string) => void
}
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker({ onValueChange, onChange, ...props }, ref) {
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
export function DateRangePicker({
  label,
  value,
  defaultValue = { start: '', end: '' },
  onValueChange,
  min,
  max,
  required,
  disabled,
  name,
  className,
}: DateRangePickerProps) {
  const [range, select] = useValue(value, defaultValue, onValueChange),
    id = useAutoId('k5-range'),
    { messages: m } = useGrado(),
    error = rangeError(range.start, range.end, min, max, m)
  return (
    <fieldset className={cx('k5-date-range', className)} disabled={disabled}>
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
}
