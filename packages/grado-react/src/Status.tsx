import type { HTMLAttributes } from 'react'
import { cx, statusClass, type RowStatusTone } from '@1k5-tech-es/grado/classes'

export interface StatusProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: RowStatusTone
  /** El punto late: para estados «en vivo», como una instalación produciendo ahora. */
  pulse?: boolean
}

/** Estado de una fila con punto de color y texto. En tablas, más discreto que Badge. */
export function Status({ tone, pulse, className, children, ...rest }: StatusProps) {
  return (
    <span {...rest} className={cx(statusClass({ tone, pulse }), className)}>
      <span className="k5-status__dot" aria-hidden="true" />
      {children}
    </span>
  )
}
