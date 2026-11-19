'use client'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type DialogHTMLAttributes, type ReactNode } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { backdropGesture, lockScroll } from '@1k5-tech-es/grado/patterns'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { useAutoId, useValue } from './hooks.js'

const closeIcon = <PathIcon paths={ICON_PATHS.x} />

export interface DialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'title' | 'open' | 'children'> {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  closeLabel?: string
  closeOnOutside?: boolean
  /** false: Escape no cierra; la app lo usa para lo suyo (cancelar una acción en curso). */
  closeOnEscape?: boolean
  /** Ocupa la ventana menos un margen de 1 rem: editores, visores de planos. */
  fullscreen?: boolean
  /** false: sin cabecera ni botón de cierre. El título sigue nombrando el diálogo para lectores de pantalla y el cuerpo va sin márgenes. */
  header?: boolean
}
const Modal = forwardRef<HTMLDialogElement, DialogProps & { alert?: boolean; side?: 'left' | 'right'; modal?: boolean }>(function Modal(
  {
    title,
    description,
    children,
    footer,
    open,
    defaultOpen = false,
    onOpenChange,
    closeLabel,
    closeOnOutside = true,
    closeOnEscape = true,
    fullscreen = false,
    header = true,
    className,
    alert = false,
    side,
    modal = true,
    ...rest
  },
  forwarded,
) {
  const { messages: m } = useGrado()
  const [visible, setVisible] = useValue(open, defaultOpen, onOpenChange)
  const ref = useRef<HTMLDialogElement>(null)
  useImperativeHandle(forwarded, () => ref.current as HTMLDialogElement, [])
  const id = useAutoId('k5-dialog')
  const [backdrop] = useState(backdropGesture)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !visible) return
    const doc = dialog.ownerDocument
    let previous = doc.activeElement as HTMLElement | null
    // Sin velo (modal false) la página sigue viva: ni bloqueo de scroll ni foco atrapado. Al cerrar,
    // el foco vuelve al último control usado fuera del panel (la fila elegida), y solo si estaba dentro.
    const track = (event: FocusEvent) => {
      if (!dialog.contains(event.target as Node)) previous = event.target as HTMLElement
    }
    if (!modal) {
      dialog.show()
      doc.addEventListener('focusin', track)
    } else dialog.showModal()
    const unlock = modal ? lockScroll(doc) : undefined
    return () => {
      doc.removeEventListener('focusin', track)
      const inside = dialog.contains(doc.activeElement)
      dialog.close()
      unlock?.()
      if ((modal || inside) && previous?.isConnected) previous.focus()
    }
  }, [visible, modal])
  return (
    <dialog
      {...rest}
      ref={ref}
      role={alert ? 'alertdialog' : undefined}
      aria-modal={modal ? 'true' : undefined}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      className={cx(
        'k5-dialog',
        alert && 'k5-dialog--alert',
        fullscreen && 'k5-dialog--fullscreen',
        !header && 'k5-dialog--headless',
        side && 'k5-drawer',
        side === 'left' && 'k5-drawer--left',
        !modal && 'k5-drawer--modeless',
        className,
      )}
      onKeyDown={(event) => {
        rest.onKeyDown?.(event)
        // Un <dialog> abierto con show() no recibe cancel: Escape se atiende aquí.
        if (!modal && event.key === 'Escape' && !event.defaultPrevented && closeOnEscape) {
          event.preventDefault()
          setVisible(false)
        }
      }}
      onCancel={(event) => {
        rest.onCancel?.(event)
        event.preventDefault()
        if (closeOnEscape) setVisible(false)
      }}
      onPointerDown={(event) => {
        rest.onPointerDown?.(event)
        backdrop.down(event)
      }}
      onClick={(event) => {
        rest.onClick?.(event)
        if (modal && backdrop.click(event) && closeOnOutside && !alert) setVisible(false)
      }}
    >
      {header ? (
        <div className="k5-dialog__header">
          <div className="k5-dialog__heading">
            <h2 className="k5-dialog__title" id={`${id}-title`}>
              {title}
            </h2>
            {description && (
              <p className="k5-dialog__description" id={`${id}-description`}>
                {description}
              </p>
            )}
          </div>
          <button type="button" className="k5-close" aria-label={closeLabel ?? m.close} onClick={() => setVisible(false)}>
            {closeIcon}
          </button>
        </div>
      ) : (
        <>
          <h2 className="k5-sr-only" id={`${id}-title`}>
            {title}
          </h2>
          {description && (
            <p className="k5-sr-only" id={`${id}-description`}>
              {description}
            </p>
          )}
        </>
      )}
      {children != null && children !== false && <div className="k5-dialog__body">{children}</div>}
      {footer && <div className="k5-dialog__footer">{footer}</div>}
    </dialog>
  )
})
export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(function Dialog(props, ref) {
  return <Modal {...props} ref={ref} />
})
export const AlertDialog = forwardRef<HTMLDialogElement, DialogProps>(function AlertDialog(props, ref) {
  return <Modal {...props} ref={ref} alert />
})
export interface DrawerProps extends DialogProps {
  side?: 'left' | 'right'
  /**
   * false: vista previa sin velo. La página sigue usable detrás (por ejemplo, pasar de una fila a otra
   * de la lista) y Escape o el botón de cierre lo cierran. Por defecto, modal como Dialog.
   */
  modal?: boolean
}
export const Drawer = forwardRef<HTMLDialogElement, DrawerProps>(function Drawer({ side = 'right', modal = true, ...props }, ref) {
  return <Modal {...props} ref={ref} side={side} modal={modal} />
})
export const Sheet = Drawer
