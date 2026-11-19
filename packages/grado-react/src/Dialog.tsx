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
const Modal = forwardRef<HTMLDialogElement, DialogProps & { alert?: boolean; side?: 'left' | 'right' }>(function Modal(
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
    const previous = dialog.ownerDocument.activeElement as HTMLElement | null
    dialog.showModal()
    const unlock = lockScroll(dialog.ownerDocument)
    return () => {
      dialog.close()
      unlock()
      if (previous?.isConnected) previous.focus()
    }
  }, [visible])
  return (
    <dialog
      {...rest}
      ref={ref}
      role={alert ? 'alertdialog' : undefined}
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      className={cx(
        'k5-dialog',
        alert && 'k5-dialog--alert',
        fullscreen && 'k5-dialog--fullscreen',
        !header && 'k5-dialog--headless',
        side && 'k5-drawer',
        side === 'left' && 'k5-drawer--left',
        className,
      )}
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
        if (backdrop.click(event) && closeOnOutside && !alert) setVisible(false)
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
}
export const Drawer = forwardRef<HTMLDialogElement, DrawerProps>(function Drawer({ side = 'right', ...props }, ref) {
  return <Modal {...props} ref={ref} side={side} />
})
export const Sheet = Drawer
