'use client'
import type { HTMLAttributes } from 'react'
import { cx, spinnerClass, type Size } from '@1k5/grado/classes'
import { useGrado } from './Locale.js'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: Size
  /** Texto para lectores de pantalla. */
  label?: string
  /** Solo decorativo (por ejemplo dentro de un botón que ya tiene aria-busy). */
  decorative?: boolean
}

export function Spinner({ size, label, decorative = false, className, ...rest }: SpinnerProps) {
  const { messages: m } = useGrado()
  const a11y = decorative ? { 'aria-hidden': true as const } : { role: 'status', 'aria-label': label ?? m.loading }
  return <span {...rest} {...a11y} className={cx(spinnerClass({ size }), className)} />
}
