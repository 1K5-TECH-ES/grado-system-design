'use client'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { moveFocus, overflowsSide, type MenuItem } from '@1k5-tech-es/grado/patterns'
import { Button } from './Button.js'
import { PathIcon } from './PathIcon.js'
import { useAutoId } from './hooks.js'

export interface DropdownMenuProps {
  label: string
  items: MenuItem[]
  onAction?: (id: string) => void
  disabled?: boolean
  align?: 'start' | 'end'
  className?: string
}
export function DropdownMenu({ label, items, onAction, disabled, align = 'end', className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null),
    menu = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null)
  const first = useRef<'first' | 'last'>('first'),
    id = useAutoId('k5-menu')
  // Si el menú no cabe por el lado pedido (ventana o contenedor con scroll), se abre hacia el otro.
  const [flipped, setFlipped] = useState(false)
  useLayoutEffect(() => {
    if (!open) {
      setFlipped(false)
      return
    }
    if (menu.current && overflowsSide(menu.current, align === 'end' ? 'left' : 'right')) setFlipped(true)
  }, [open, align])
  useEffect(() => {
    if (!open) return
    const buttons = menu.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
    if (buttons?.length) buttons[first.current === 'last' ? buttons.length - 1 : 0].focus()
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  return (
    <div
      className={cx('k5-menu', className)}
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <Button
        ref={trigger}
        variant="secondary"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          first.current = 'first'
          setOpen(!open)
        }}
        onKeyDown={(event) => {
          if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault()
            first.current = event.key === 'ArrowUp' ? 'last' : 'first'
            setOpen(true)
          }
        }}
      >
        {label}
        <PathIcon paths={ICON_PATHS.chevronDown} className="k5-menu__chevron" />
      </Button>
      {open && (
        <div
          ref={menu}
          className={cx('k5-menu__content', (align === 'start') !== flipped && 'k5-menu__content--start')}
          role="menu"
          aria-label={label}
          id={id}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              setOpen(false)
              trigger.current?.focus()
            } else moveFocus(event, event.currentTarget, '[role="menuitem"]')
          }}
        >
          {items.map((item) => (
            <div role="none" key={item.id}>
              {item.separator && <div role="separator" className="k5-menu__separator" />}
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                disabled={item.disabled}
                className={cx('k5-menu__item', item.danger && 'k5-menu__item--danger')}
                onPointerMove={(event) => {
                  if (!item.disabled) event.currentTarget.focus()
                }}
                onClick={() => {
                  setOpen(false)
                  trigger.current?.focus()
                  onAction?.(item.id)
                }}
              >
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
