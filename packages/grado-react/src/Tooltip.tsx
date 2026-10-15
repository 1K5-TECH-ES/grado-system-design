'use client'
import { useState, type ReactNode } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { Button } from './Button.js'
import { PathIcon } from './PathIcon.js'
import { useAutoId } from './hooks.js'

export interface TooltipProps {
  label: string
  content: ReactNode
  children?: ReactNode
  className?: string
}
export function Tooltip({ label, content, children = <PathIcon paths={ICON_PATHS.info} />, className }: TooltipProps) {
  const [open, setOpen] = useState(false),
    id = useAutoId('k5-tooltip')
  return (
    <span
      className={cx('k5-tooltip', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setOpen(false)
          event.stopPropagation()
        }
      }}
    >
      <Button variant="ghost" size="sm" iconOnly aria-label={label} aria-describedby={open ? id : undefined} onClick={() => setOpen(!open)}>
        {children}
      </Button>
      {open && (
        <span role="tooltip" id={id} className="k5-tooltip__content">
          {content}
        </span>
      )}
    </span>
  )
}
