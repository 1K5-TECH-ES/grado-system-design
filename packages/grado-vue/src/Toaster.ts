import { defineComponent, h, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { buttonClass } from '@1k5-tech-es/grado/classes'
import { createToastStore, visibleToasts, type ToastItem } from '@1k5-tech-es/grado/patterns'
import { Toast } from './Alert.js'
import { useGrado } from './Locale.js'

const store = createToastStore()

/**
 * Añade un aviso a la cola de Toaster desde cualquier sitio, también fuera de un componente:
 * toast.success('Oferta enviada'), toast.error(…), toast.promise(guardar(), { loading, success, error }).
 */
export const toast = store.toast

/** Pinta los avisos de toast(). Ponlo una vez, al final de la app (por ejemplo, junto a AppShell). */
export const Toaster = defineComponent({
  name: 'K5Toaster',
  props: {
    /** Avisos a la vez. Los demás esperan su turno. */
    max: { type: Number, default: 3 },
    /** Nombre de la región para lectores de pantalla. Por defecto, «Notificaciones». */
    label: String,
  },
  setup(props) {
    const t = useGrado()
    const items = shallowRef<readonly ToastItem[]>(store.getSnapshot())
    let stop = () => {}
    onMounted(() => {
      items.value = store.getSnapshot()
      stop = store.subscribe(() => (items.value = store.getSnapshot()))
    })
    onBeforeUnmount(() => stop())
    const act = (item: ToastItem) => {
      item.action?.onClick()
      toast.dismiss(item.id)
    }
    // La región siempre está en la página: así los lectores de pantalla anuncian lo que entra en ella.
    return () =>
      h(
        'section',
        { class: 'k5-toaster', 'aria-label': props.label ?? t.value.messages.notifications, 'aria-live': 'polite' },
        visibleToasts(items.value, props.max).map((item) =>
          h(
            Toast,
            {
              key: item.id,
              open: true,
              title: item.title,
              tone: item.tone,
              duration: item.duration,
              role: item.tone === 'danger' ? 'alert' : 'none',
              'onUpdate:open': (open: boolean) => {
                if (!open) toast.dismiss(item.id)
              },
            },
            {
              default: item.description ? () => item.description : undefined,
              action: item.action
                ? () =>
                    h(
                      'button',
                      { type: 'button', class: buttonClass({ variant: 'link', size: 'sm' }), onClick: () => act(item) },
                      item.action?.label,
                    )
                : undefined,
            },
          ),
        ),
      )
  },
})
