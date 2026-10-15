'use client'
import { forwardRef, useEffect, useRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'
import { type ChoiceOption } from '@1k5-tech-es/grado/patterns'
import { useField } from './Field.js'
import { useAutoId, useValue } from './hooks.js'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: ReactNode
  description?: ReactNode
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean) => void
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate = false, onCheckedChange, className, onChange, id, ...props },
  ref,
) {
  const field = useField(),
    input = useRef<HTMLInputElement | null>(null),
    autoId = useAutoId('k5-checkbox', id ?? field?.id)
  useEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate
  }, [indeterminate])
  const control = (
    <input
      {...props}
      type="checkbox"
      id={autoId}
      ref={(node) => {
        input.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={cx('k5-checkbox', className)}
      aria-checked={indeterminate ? 'mixed' : undefined}
      aria-invalid={props['aria-invalid'] ?? (field?.invalid || undefined)}
      aria-describedby={cx(props['aria-describedby'], field?.describedBy, description && `${autoId}-description`) || undefined}
      required={props.required ?? field?.required}
      onChange={(event) => {
        onChange?.(event)
        onCheckedChange?.(event.target.checked)
      }}
    />
  )
  return label ? (
    <label className="k5-checkbox-field" htmlFor={autoId}>
      {control}
      <span className="k5-choice__text">
        <span>{label}</span>
        {description && (
          <span id={`${autoId}-description`} className="k5-choice__description">
            {description}
          </span>
        )}
      </span>
    </label>
  ) : (
    control
  )
})
export interface RadioGroupProps {
  label: string
  options: ChoiceOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  required?: boolean
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  className?: string
}
export function RadioGroup({
  label,
  options,
  value,
  defaultValue = '',
  onValueChange,
  name,
  required,
  disabled,
  orientation = 'vertical',
  className,
}: RadioGroupProps) {
  const [selected, select] = useValue(value, defaultValue, onValueChange),
    id = useAutoId('k5-radio')
  return (
    <fieldset className={cx('k5-radio-group', orientation === 'horizontal' && 'k5-radio-group--horizontal', className)} disabled={disabled}>
      <legend>{label}</legend>
      <div className="k5-radio-group__options">
        {options.map((option, index) => (
          <label className="k5-radio-option" key={option.value}>
            <input
              type="radio"
              className="k5-radio"
              name={name ?? id}
              value={option.value}
              checked={selected === option.value}
              disabled={option.disabled}
              required={required}
              aria-describedby={option.description ? `${id}-${index}-description` : undefined}
              onChange={() => select(option.value)}
            />
            <span className="k5-choice__text">
              <span>{option.label}</span>
              {option.description && (
                <span id={`${id}-${index}-description`} className="k5-choice__description">
                  {option.description}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
