'use client'
import { forwardRef, type HTMLAttributes } from 'react'
import { cx, spinnerClass, type Size } from '@1k5-tech-es/grado/classes'
import { useGrado } from './Locale.js'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: Size
  /** Texto para lectores de pantalla. */
  label?: string
  /** Solo decorativo (por ejemplo dentro de un botón que ya tiene aria-busy). */
  decorative?: boolean
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size, label, decorative = false, className, ...rest },
  ref,
) {
  const { messages: m } = useGrado()
  const a11y = decorative ? { 'aria-hidden': true as const } : { role: 'status', 'aria-label': label ?? m.loading }
  return <span ref={ref} {...rest} {...a11y} className={cx(spinnerClass({ size }), className)} />
})
