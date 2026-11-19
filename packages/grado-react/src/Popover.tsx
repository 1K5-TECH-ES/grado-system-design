'use client'
import {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cx, popoverClass, type PopoverAlign, type PopoverSide } from '@1k5-tech-es/grado/classes'
import { overflowsSide } from '@1k5-tech-es/grado/patterns'
import { Button } from './Button.js'
import { useAutoId, useValue } from './hooks.js'

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

export interface PopoverProps {
  /** Control que abre el panel: un Button, un IconButton… Recibe aria-haspopup, aria-expanded y aria-controls. */
  trigger?: ReactElement
  /** Sin trigger, pinta un Button secondary con este texto. También nombra el panel si no hay title. */
  label?: string
  /** Título del panel; le da nombre accesible (aria-labelledby). */
  title?: ReactNode
  children?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Borde del disparador con el que se alinea el panel. Si no cabe, se abre hacia el otro lado. */
  align?: PopoverAlign
  side?: PopoverSide
  id?: string
  className?: string
}

/** Contenido libre anclado a un control, sin bloquear la página. Escape y clic fuera lo cierran. */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    trigger,
    label,
    title,
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    align = 'start',
    side = 'bottom',
    id: idProp,
    className,
  },
  ref,
) {
  const [open, setOpen] = useValue(openProp, defaultOpen, onOpenChange)
  const root = useRef<HTMLDivElement>(null),
    panel = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => root.current as HTMLDivElement, [])
  const id = useAutoId('k5-popover', idProp),
    titleId = `${id}-title`
  const toggler = () => root.current?.querySelector<HTMLElement>('[aria-haspopup="dialog"]')
  const close = (restore: boolean) => {
    setOpen(false)
    if (restore) toggler()?.focus()
  }
  // Si el panel no cabe por su lado (ventana o contenedor con scroll), se alinea con el otro borde.
  const [placed, setPlaced] = useState<PopoverAlign>(align)
  useLayoutEffect(() => {
    setPlaced(align)
    if (!open || !panel.current) return
    if (align !== 'end' && overflowsSide(panel.current, 'right')) setPlaced('end')
    else if (align !== 'start' && overflowsSide(panel.current, 'left')) setPlaced('start')
  }, [open, align])
  const latest = useRef(close)
  latest.current = close
  // Si la app cierra el panel con el foco dentro (una opción que elige y cierra), el foco se
  // quedaría en <body> al desaparecer el panel: vuelve al disparador, como con Escape. Después del
  // evento: con Enter, el disparador enfocado a mitad de la pulsación la recibiría y volvería a abrir.
  const focusInside = useRef(false)
  useEffect(() => {
    if (open || !focusInside.current) return
    focusInside.current = false
    const timer = setTimeout(() => {
      const active = document.activeElement
      if (!active || active === document.body) toggler()?.focus()
    })
    return () => clearTimeout(timer)
  }, [open])
  // Abierto desde el principio: escucha los clics fuera, pero no mueve el foco.
  const mounted = useRef(false)
  useEffect(() => {
    const first = !mounted.current
    mounted.current = true
    if (!open) return
    // Al abrir, el foco pasa al primer elemento enfocable del panel o, si no hay, al panel.
    if (!first) (panel.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panel.current)?.focus()
    const outside = (event: PointerEvent) => {
      const node = event.target as Element
      if (root.current?.contains(node)) return
      const inside = root.current?.contains(document.activeElement)
      // El clic fuera decide él adónde va el foco.
      focusInside.current = false
      latest.current(false)
      // El foco vuelve al disparador salvo que el clic caiga en otro control.
      if (inside && !node.closest?.(FOCUSABLE)) setTimeout(() => toggler()?.focus())
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  const triggerProps = {
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': open,
    'aria-controls': open ? id : undefined,
  }
  const toggle = () => setOpen(!open)
  const control = isValidElement<{ onClick?: (event: MouseEvent<HTMLElement>) => void }>(trigger) ? (
    cloneElement(trigger, {
      ...triggerProps,
      onClick: (event: MouseEvent<HTMLElement>) => {
        trigger.props.onClick?.(event)
        if (!event.defaultPrevented) toggle()
      },
    } as Record<string, unknown>)
  ) : (
    <Button variant="secondary" {...triggerProps} onClick={toggle}>
      {label}
    </Button>
  )
  const hasTitle = title != null && title !== false && title !== ''
  return (
    <div
      ref={root}
      className={cx('k5-popover', className)}
      onBlur={(event) => {
        if (open && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close(false)
      }}
      onKeyDown={(event) => {
        if (!open || event.key !== 'Escape') return
        event.preventDefault()
        event.stopPropagation()
        close(true)
      }}
    >
      {control}
      {open && (
        <div
          ref={panel}
          id={id}
          role="dialog"
          tabIndex={-1}
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-label={hasTitle ? undefined : label}
          className={popoverClass({ align: placed, side })}
          onFocus={() => (focusInside.current = true)}
          onBlur={(event) => {
            // Sin relatedTarget, el foco no se ha ido a otro sitio: el panel está desapareciendo.
            if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) focusInside.current = false
          }}
        >
          {hasTitle && (
            <p id={titleId} className="k5-popover__title">
              {title}
            </p>
          )}
          {children}
        </div>
      )}
    </div>
  )
})
