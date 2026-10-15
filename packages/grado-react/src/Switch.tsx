'use client'
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '@1k5/grado/classes'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> {
  label?: ReactNode
  description?: ReactNode
  onCheckedChange?: (checked: boolean) => void
}

/** Checkbox nativo con role="switch". Sin label, ponle aria-label. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, onCheckedChange, onChange, className, ...rest },
  ref,
) {
  const input = (
    <input
      {...rest}
      ref={ref}
      type="checkbox"
      role="switch"
      className={cx('k5-switch', className)}
      onChange={(event) => {
        onChange?.(event)
        onCheckedChange?.(event.target.checked)
      }}
    />
  )
  if (label == null) return input
  return (
    <label className="k5-switch-field">
      {input}
      <span className="k5-switch-field__text">
        <span className="k5-switch-field__label">{label}</span>
        {description != null ? <span className="k5-switch-field__description">{description}</span> : null}
      </span>
    </label>
  )
})
