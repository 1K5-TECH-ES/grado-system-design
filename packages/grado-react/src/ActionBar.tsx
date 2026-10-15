'use client'
import { useRef, type ReactNode } from 'react'
import { actionBarClass, cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { moveFocus, selectedCount } from '@1k5-tech-es/grado/patterns'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

const ITEMS = 'button, a[href]'

export interface ActionBarProps {
  /** Filas elegidas. Con 0 la barra no se pinta. */
  count: number
  /** Texto de la selección. Por defecto «3 seleccionadas», en el idioma activo. */
  label?: string
  /** Botones de las acciones en lote. */
  children?: ReactNode
  /** «Quitar selección»: con él aparece el botón, y Escape dentro de la barra lo llama. */
  onClear?: () => void
  clearLabel?: string
  /** En su sitio en vez de flotar abajo: para documentación y ejemplos. */
  inline?: boolean
  className?: string
}

/** Barra flotante de acciones en lote mientras hay filas elegidas en una tabla. */
export function ActionBar({ count, label, children, onClear, clearLabel, inline = false, className }: ActionBarProps) {
  const { messages: m } = useGrado()
  // Al quitar la selección la barra desaparece: el foco vuelve a donde estaba antes de entrar.
  const before = useRef<HTMLElement | null>(null)
  if (!count) return null
  const text = label ?? selectedCount(count, m)
  const clear = () => {
    const back = before.current
    onClear?.()
    if (back?.isConnected) back.focus()
  }
  return (
    <div
      role="toolbar"
      aria-label={text}
      className={cx(actionBarClass({ inline }), className)}
      onFocus={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) before.current = event.relatedTarget as HTMLElement | null
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && onClear) {
          event.preventDefault()
          clear()
        } else if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) moveFocus(event, event.currentTarget, ITEMS, true)
      }}
    >
      <span className="k5-action-bar__count">{text}</span>
      <div className="k5-action-bar__actions">{children}</div>
      {onClear && (
        <button type="button" className="k5-btn k5-btn--ghost k5-btn--sm k5-action-bar__clear" onClick={clear}>
          <PathIcon paths={ICON_PATHS.x} />
          {clearLabel ?? m.clearSelection}
        </button>
      )}
    </div>
  )
}
