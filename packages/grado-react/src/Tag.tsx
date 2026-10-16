'use client'
import { forwardRef, type HTMLAttributes, type MouseEvent, type ReactNode } from 'react'
import { cx, ICON_PATHS, tagClass, type SmallSize } from '@1k5-tech-es/grado/classes'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { tagFocusTarget } from '@1k5-tech-es/grado/patterns'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Texto de la etiqueta. También da nombre al botón de quitar. */
  label?: string
  /** Contenido en lugar de label. */
  children?: ReactNode
  /** Muestra el botón de quitar. */
  onRemove?: () => void
  /** Nombre del botón de quitar. Por defecto, «Quitar {label}». */
  removeLabel?: string
  size?: SmallSize
  disabled?: boolean
}

/** Etiqueta que se puede quitar, como una provincia de una zona de trabajo. */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { label, children, onRemove, removeLabel, size, disabled = false, className, ...rest },
  ref,
) {
  const { messages: m } = useGrado()
  const text = label ?? (typeof children === 'string' || typeof children === 'number' ? String(children) : '')
  const remove = (event: MouseEvent<HTMLButtonElement>) => {
    // El botón va a desaparecer: el foco pasa a la etiqueta vecina antes de quitarla.
    tagFocusTarget(event.currentTarget)?.focus()
    onRemove?.()
  }
  return (
    <span ref={ref} {...rest} className={cx(tagClass({ size, disabled }), className)}>
      <span className="k5-tag__label">{children ?? label}</span>
      {onRemove ? (
        <button
          type="button"
          className="k5-tag__remove"
          aria-label={removeLabel ?? formatMessage(m.removeItem, { label: text })}
          disabled={disabled}
          onClick={remove}
        >
          <PathIcon paths={ICON_PATHS.x} />
        </button>
      ) : null}
    </span>
  )
})
