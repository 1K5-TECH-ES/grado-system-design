'use client'
import { forwardRef, useSyncExternalStore } from 'react'
import { buttonClass, cx } from '@1k5-tech-es/grado/classes'
import { createToastStore, visibleToasts, type ToastItem } from '@1k5-tech-es/grado/patterns'
import { Toast } from './Alert.js'
import { useGrado } from './Locale.js'

const store = createToastStore()

/**
 * Añade un aviso a la cola de Toaster desde cualquier sitio, también fuera de un componente:
 * toast.success('Oferta enviada'), toast.error(…), toast.promise(guardar(), { loading, success, error }).
 */
export const toast = store.toast

export interface ToasterProps {
  /** Avisos a la vez. Los demás esperan su turno. */
  max?: number
  /** Nombre de la región para lectores de pantalla. Por defecto, «Notificaciones». */
  label?: string
  className?: string
}

/** Pinta los avisos de toast(). Ponlo una vez, al final de la app (por ejemplo, junto a AppShell). */
export const Toaster = forwardRef<HTMLElement, ToasterProps>(function Toaster({ max = 3, label, className }, ref) {
  const { messages: m } = useGrado()
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
  const act = (item: ToastItem) => {
    item.action?.onClick()
    toast.dismiss(item.id)
  }
  // La región siempre está en la página: así los lectores de pantalla anuncian lo que entra en ella.
  return (
    <section ref={ref} className={cx('k5-toaster', className)} aria-label={label ?? m.notifications} aria-live="polite">
      {visibleToasts(items, max).map((item) => (
        <Toast
          key={item.id}
          open
          title={item.title}
          tone={item.tone}
          duration={item.duration}
          role={item.tone === 'danger' ? 'alert' : 'none'}
          action={
            item.action ? (
              <button type="button" className={buttonClass({ variant: 'link', size: 'sm' })} onClick={() => act(item)}>
                {item.action.label}
              </button>
            ) : undefined
          }
          onOpenChange={(open) => {
            if (!open) toast.dismiss(item.id)
          }}
        >
          {item.description}
        </Toast>
      ))}
    </section>
  )
})
