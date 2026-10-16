'use client'
import { forwardRef, type MouseEvent } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'
import { errorSummaryTitle, focusField, type ErrorSummaryItem } from '@1k5-tech-es/grado/patterns'
import { useGrado } from './Locale.js'
import { useAutoId } from './hooks.js'

export interface ErrorSummaryProps {
  /** Errores en el orden de los campos. Sin errores no se pinta nada. */
  errors: ErrorSummaryItem[]
  /** Por defecto, «Revisa 2 campos antes de continuar». */
  title?: string
  className?: string
}

/**
 * Lista de errores al principio de un formulario, con un enlace a cada campo. Se anuncia
 * con role="alert" al aparecer. Con react-hook-form o VeeValidate, usa el de su adaptador.
 */
export const ErrorSummary = forwardRef<HTMLDivElement, ErrorSummaryProps>(function ErrorSummary({ errors, title, className }, ref) {
  const { messages: m } = useGrado()
  const id = useAutoId('k5-error-summary')
  if (!errors.length) return null
  const go = (event: MouseEvent<HTMLAnchorElement>, target: string) => {
    if (focusField(target)) event.preventDefault()
  }
  return (
    <div ref={ref} className={cx('k5-error-summary', className)} role="alert" aria-labelledby={`${id}-title`} tabIndex={-1}>
      <h2 className="k5-error-summary__title" id={`${id}-title`}>
        {title ?? errorSummaryTitle(errors.length, m)}
      </h2>
      <ul className="k5-error-summary__list">
        {errors.map((error) => (
          <li key={error.id}>
            <a className="k5-error-summary__link" href={`#${error.id}`} onClick={(event) => go(event, error.id)}>
              {error.label ? `${error.label}: ${error.message}` : error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
})
