'use client'
import { cloneElement, forwardRef, isValidElement, useState, type ReactElement, type ReactNode } from 'react'
import { cx, ICON_PATHS, keyShortcuts } from '@1k5-tech-es/grado/classes'
import { Button } from './Button.js'
import { ShortcutKeys } from './ShortcutKeys.js'
import { PathIcon } from './PathIcon.js'
import { useAutoId } from './hooks.js'

export interface TooltipProps {
  /** Nombre del botón de información. Con trigger no se usa: el control ya tiene el suyo. */
  label?: string
  content: ReactNode
  children?: ReactNode
  /** Control al que acompaña (un Button, un IconButton, un enlace) en lugar del botón de información. Recibe aria-describedby mientras se ve. */
  trigger?: ReactElement
  /** Atajo del control: ['⌘', 'L']. Se pinta tras el texto y, con trigger, el control recibe aria-keyshortcuts. */
  shortcut?: string[]
  className?: string
}
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  { label, content, children = <PathIcon paths={ICON_PATHS.info} />, trigger, shortcut, className },
  ref,
) {
  const [open, setOpen] = useState(false),
    id = useAutoId('k5-tooltip')
  return (
    <span
      ref={ref}
      className={cx('k5-tooltip', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => {
        // Escape quita el tooltip y nada más: sin preventDefault, el <dialog> que lo contiene también
        // se cerraría. Con el tooltip ya oculto, Escape sigue su camino y cierra lo que haya debajo.
        if (event.key === 'Escape' && open) {
          setOpen(false)
          event.preventDefault()
          event.stopPropagation()
        }
      }}
    >
      {isValidElement<{ 'aria-describedby'?: string; 'aria-keyshortcuts'?: string }>(trigger) ? (
        cloneElement(trigger, {
          'aria-describedby': open ? id : trigger.props['aria-describedby'],
          'aria-keyshortcuts': trigger.props['aria-keyshortcuts'] ?? (shortcut?.length ? keyShortcuts(shortcut) : undefined),
        })
      ) : (
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label={label}
          aria-describedby={open ? id : undefined}
          onClick={() => setOpen(!open)}
        >
          {children}
        </Button>
      )}
      {open && (
        <span role="tooltip" id={id} className="k5-tooltip__content">
          {content}
          {shortcut?.length ? <ShortcutKeys keys={shortcut} className="k5-tooltip__shortcut" /> : null}
        </span>
      )}
    </span>
  )
})
