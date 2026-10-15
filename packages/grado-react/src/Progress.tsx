'use client'
import type { HTMLAttributes } from 'react'
import { cx, progressClass, type ProgressTone, type SmallSize } from '@1k5-tech-es/grado/classes'
import { progressState } from '@1k5-tech-es/grado/patterns'
import { useAutoId } from './hooks.js'
import { useGrado } from './Locale.js'

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Valor actual. null: indeterminado (no se sabe cuánto falta). Con steps, pasos completados. */
  value?: number | null
  max?: number
  /** Nombre accesible. Por defecto, «Progreso». */
  label?: string
  /** Muestra el nombre encima de la barra. */
  showLabel?: boolean
  /** Muestra «64 %» o «Paso 3 de 5». */
  showValue?: boolean
  tone?: ProgressTone
  size?: SmallSize
  /** Variante por pasos: número total de pasos. */
  steps?: number
}

export function Progress({
  value = null,
  max = 100,
  label,
  showLabel = false,
  showValue = false,
  tone,
  size,
  steps,
  className,
  ...rest
}: ProgressProps) {
  const { messages: m, locale } = useGrado()
  const labelId = useAutoId('k5')
  const state = progressState({ value, max, steps, locale, messages: m })
  const name = label ?? m.progress
  const head = showLabel || (showValue && state.text)
  return (
    <div {...rest} className={cx(progressClass({ tone, size, indeterminate: state.indeterminate, steps: state.stepped }), className)}>
      {head ? (
        <div className="k5-progress__head">
          {showLabel ? (
            <span className="k5-progress__label" id={labelId}>
              {name}
            </span>
          ) : null}
          {showValue && state.text ? (
            <span className="k5-progress__value" aria-hidden="true">
              {state.text}
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        className="k5-progress__track"
        role="progressbar"
        aria-labelledby={showLabel ? labelId : undefined}
        aria-label={showLabel ? undefined : name}
        aria-valuemin={0}
        aria-valuemax={state.max}
        aria-valuenow={state.now ?? undefined}
        aria-valuetext={state.text || undefined}
      >
        {state.stepped ? (
          Array.from({ length: state.max }, (_, i) => (
            <span key={i} className={cx('k5-progress__step', i < (state.now ?? 0) && 'k5-progress__step--done')} />
          ))
        ) : (
          <div
            className="k5-progress__bar"
            style={state.indeterminate ? undefined : { width: `${Math.round(state.ratio * 10000) / 100}%` }}
          />
        )}
      </div>
    </div>
  )
}
