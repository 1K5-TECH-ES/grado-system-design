'use client'
import { forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { lockScroll } from '@1k5-tech-es/grado/patterns'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { useAutoId, useValue } from './hooks.js'

const closeIcon = <PathIcon paths={ICON_PATHS.x} />

export interface DialogProps {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  closeLabel?: string
  closeOnOutside?: boolean
  className?: string
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
    className,
    alert = false,
    side,
  },
  forwarded,
) {
  const { messages: m } = useGrado()
  const [visible, setVisible] = useValue(open, defaultOpen, onOpenChange)
  const ref = useRef<HTMLDialogElement>(null)
  useImperativeHandle(forwarded, () => ref.current as HTMLDialogElement, [])
  const id = useAutoId('k5-dialog')
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
      ref={ref}
      role={alert ? 'alertdialog' : undefined}
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      className={cx('k5-dialog', alert && 'k5-dialog--alert', side && 'k5-drawer', side === 'left' && 'k5-drawer--left', className)}
      onCancel={(event) => {
        event.preventDefault()
        setVisible(false)
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && closeOnOutside && !alert) {
          const rect = event.currentTarget.getBoundingClientRect()
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)
            setVisible(false)
        }
      }}
    >
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
