'use client'
import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { cx, keyShortcuts } from '@1k5-tech-es/grado/classes'
import { menuPosition, moveFocus, type MenuItem } from '@1k5-tech-es/grado/patterns'
import { ShortcutKeys } from './Button.js'
import { useGrado } from './Locale.js'
import { useAutoId } from './hooks.js'

type Point = { x: number; y: number }

export interface ContextMenuProps {
  items: MenuItem[]
  onAction?: (id: string) => void
  /** Nombre de la zona y del menú para lectores de pantalla. Por defecto, «Acciones» en el menú. */
  label?: string
  /** Deja el menú del navegador. */
  disabled?: boolean
  /** La zona: clic derecho, Mayúsculas + F10 o la tecla de menú abren el menú. */
  children?: ReactNode
  className?: string
}

/** ¿Pide el teclado el menú contextual? Mayúsculas + F10 o la tecla de menú. */
const wantsMenu = (event: { key: string; shiftKey: boolean }) => event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')

/** Menú contextual sobre una zona, con el mismo teclado y aspecto que DropdownMenu. */
export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenu(
  { items, onAction, label, disabled = false, children, className },
  ref,
) {
  const { messages: m } = useGrado()
  const [point, setPoint] = useState<Point | null>(null)
  const [at, setAt] = useState<Point | null>(null)
  const zone = useRef<HTMLDivElement>(null),
    menu = useRef<HTMLDivElement>(null),
    back = useRef<HTMLElement | null>(null),
    byKeyboard = useRef(0)
  useImperativeHandle(ref, () => zone.current as HTMLDivElement, [])
  const id = useAutoId('k5-context-menu')
  const open = point !== null
  const show = (next: Point) => {
    const active = document.activeElement as HTMLElement | null
    back.current = active && zone.current?.contains(active) ? active : zone.current
    setPoint(next)
  }
  const close = (restore: boolean) => {
    setPoint(null)
    setAt(null)
    if (restore) (back.current?.isConnected ? back.current : zone.current)?.focus()
  }
  const latest = useRef(close)
  latest.current = close
  // Mide el menú antes de pintarlo y lo coloca dentro de la ventana.
  useLayoutEffect(() => {
    if (!point || !menu.current) return
    const view = document.documentElement
    setAt(
      menuPosition(
        point,
        { width: menu.current.offsetWidth, height: menu.current.offsetHeight },
        { width: view.clientWidth, height: view.clientHeight },
      ),
    )
  }, [point])
  useEffect(() => {
    if (!open) return
    menu.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
    const outside = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node)) latest.current(false)
    }
    const dismiss = (event: Event) => {
      if (!menu.current?.contains(event.target as Node)) latest.current(false)
    }
    document.addEventListener('pointerdown', outside)
    window.addEventListener('scroll', dismiss, true)
    window.addEventListener('resize', dismiss)
    return () => {
      document.removeEventListener('pointerdown', outside)
      window.removeEventListener('scroll', dismiss, true)
      window.removeEventListener('resize', dismiss)
    }
  }, [open])

  return (
    <div
      ref={zone}
      tabIndex={0}
      role={label ? 'group' : undefined}
      aria-label={label}
      className={cx('k5-context-menu', className)}
      onContextMenu={(event) => {
        if (disabled) return
        event.preventDefault()
        // La tecla de menú también lanza contextmenu: ya está abierto desde el teclado.
        if (menu.current?.contains(event.target as Node) || (open && Date.now() - byKeyboard.current < 500)) return
        show({ x: event.clientX, y: event.clientY })
      }}
      onKeyDown={(event) => {
        if (disabled || open || !wantsMenu(event)) return
        event.preventDefault()
        byKeyboard.current = Date.now()
        // Desde el teclado se ancla bajo el elemento con el foco (la zona o algo dentro).
        const box = (event.target as HTMLElement).getBoundingClientRect()
        show({ x: box.left, y: box.bottom })
      }}
      onBlur={(event) => {
        if (open && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close(false)
      }}
    >
      {children}
      {open && (
        <div
          ref={menu}
          id={id}
          role="menu"
          aria-label={label ?? m.actions}
          className="k5-menu__content k5-context-menu__content"
          style={{ left: (at ?? point).x, top: (at ?? point).y }}
          onKeyDown={(event) => {
            event.stopPropagation()
            if (event.key === 'Escape' || wantsMenu(event)) {
              event.preventDefault()
              close(true)
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
                aria-keyshortcuts={item.shortcut?.length ? keyShortcuts(item.shortcut) : undefined}
                onPointerMove={(event) => {
                  if (!item.disabled) event.currentTarget.focus()
                }}
                onClick={() => {
                  close(true)
                  onAction?.(item.id)
                }}
              >
                {item.label}
                {item.shortcut?.length ? <ShortcutKeys keys={item.shortcut} className="k5-menu__shortcut" /> : null}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})
