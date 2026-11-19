import { forwardRef, type HTMLAttributes } from 'react'
import { cx, statusClass, type RowStatusTone, type StatusProgress } from '@1k5-tech-es/grado/classes'

export interface StatusProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: RowStatusTone
  /** El punto late: para estados «en vivo», como una instalación produciendo ahora. */
  pulse?: boolean
  /**
   * Paso de un flujo con orden: backlog, todo, started, waiting, done o canceled. El punto pasa a
   * icono de progreso, que se lee sin color; sin tone, cada paso trae el suyo.
   */
  progress?: StatusProgress
}

/** Estado de una fila con punto de color y texto. En tablas, más discreto que Badge. */
export const Status = forwardRef<HTMLSpanElement, StatusProps>(function Status(
  { tone, pulse, progress, className, children, ...rest },
  ref,
) {
  return (
    <span ref={ref} {...rest} className={cx(statusClass({ tone, pulse, progress }), className)}>
      <span className="k5-status__dot" aria-hidden="true" />
      {children}
    </span>
  )
})
