import { defineComponent, h, mergeProps, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { backdropGesture, lockScroll } from '@1k5-tech-es/grado/patterns'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { autoId, booleanOptional, model } from './helpers.js'

const closeIcon = () => pathIcon(ICON_PATHS.x)

function makeModal(name: string, kind = 'dialog') {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      title: { type: String, required: true },
      description: String,
      open: booleanOptional,
      defaultOpen: Boolean,
      closeLabel: String,
      closeOnOutside: { type: Boolean, default: true },
      closeOnEscape: { type: Boolean, default: true },
      fullscreen: Boolean,
      header: { type: Boolean, default: true },
      side: { type: String as PropType<'left' | 'right'>, default: 'right' },
      /**
       * Solo Drawer. false: vista previa sin velo. La página sigue usable detrás (por ejemplo, pasar de una
       * fila a otra de la lista) y Escape o el botón de cierre lo cierran.
       */
      modal: { type: Boolean, default: true },
    },
    emits: ['update:open'],
    setup(props, { attrs, slots, emit }) {
      const [visible, setVisible] = model(
        () => props.open,
        props.defaultOpen,
        (value) => emit('update:open', value),
      )
      const dialog = ref<HTMLDialogElement>(),
        id = autoId('k5-dialog'),
        backdrop = backdropGesture(),
        t = useGrado()
      let unlock: (() => void) | undefined,
        previous: HTMLElement | null = null
      const modal = () => kind !== 'drawer' || props.modal
      // Sin velo, el foco vuelve al último control usado fuera del panel (la fila elegida), y solo si estaba dentro.
      const track = (event: FocusEvent) => {
        if (!dialog.value?.contains(event.target as Node)) previous = event.target as HTMLElement
      }
      const close = () => {
        document.removeEventListener('focusin', track)
        const inside = !!dialog.value?.contains(document.activeElement)
        dialog.value?.close()
        unlock?.()
        unlock = undefined
        if ((modal() || inside) && previous?.isConnected) previous.focus()
        previous = null
      }
      onMounted(() =>
        watch(
          visible,
          (open) => {
            if (open && dialog.value) {
              previous = document.activeElement as HTMLElement
              // Sin velo (modal false) la página sigue viva: ni bloqueo de scroll ni foco atrapado.
              if (!modal()) {
                dialog.value.show()
                document.addEventListener('focusin', track)
              } else {
                dialog.value.showModal()
                unlock = lockScroll(document)
              }
            } else close()
          },
          { immediate: true, flush: 'post' },
        ),
      )
      onBeforeUnmount(close)
      // Sin cabecera, el título y la descripción siguen nombrando el diálogo para lectores de pantalla.
      const headless = () => [
        h('h2', { class: 'k5-sr-only', id: `${id}-title` }, slots.title?.() ?? props.title),
        props.description ? h('p', { class: 'k5-sr-only', id: `${id}-description` }, props.description) : null,
      ]
      return () =>
        h(
          'dialog',
          mergeProps(attrs, {
            ref: dialog,
            role: kind === 'alert' ? 'alertdialog' : undefined,
            'aria-modal': modal() ? 'true' : undefined,
            'aria-labelledby': `${id}-title`,
            'aria-describedby': props.description ? `${id}-description` : undefined,
            class: cx(
              'k5-dialog',
              kind === 'alert' && 'k5-dialog--alert',
              props.fullscreen && 'k5-dialog--fullscreen',
              !props.header && 'k5-dialog--headless',
              kind === 'drawer' && 'k5-drawer',
              kind === 'drawer' && props.side === 'left' && 'k5-drawer--left',
              !modal() && 'k5-drawer--modeless',
            ),
            onKeydown: (event: KeyboardEvent) => {
              // Un <dialog> abierto con show() no recibe cancel: Escape se atiende aquí.
              if (!modal() && event.key === 'Escape' && !event.defaultPrevented && props.closeOnEscape) {
                event.preventDefault()
                setVisible(false)
              }
            },
            onCancel: (event: Event) => {
              event.preventDefault()
              if (props.closeOnEscape) setVisible(false)
            },
            onPointerdown: (event: PointerEvent) => backdrop.down(event),
            onClick: (event: MouseEvent) => {
              if (modal() && backdrop.click(event) && props.closeOnOutside && kind !== 'alert') setVisible(false)
            },
          }),
          [
            ...(props.header ? [] : headless()),
            props.header
              ? h('div', { class: 'k5-dialog__header' }, [
                  h('div', { class: 'k5-dialog__heading' }, [
                    h('h2', { class: 'k5-dialog__title', id: `${id}-title` }, slots.title?.() ?? props.title),
                    props.description ? h('p', { class: 'k5-dialog__description', id: `${id}-description` }, props.description) : null,
                  ]),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: 'k5-close',
                      'aria-label': props.closeLabel ?? t.value.messages.close,
                      onClick: () => setVisible(false),
                    },
                    [closeIcon()],
                  ),
                ])
              : null,
            slots.default ? h('div', { class: 'k5-dialog__body' }, slots.default()) : null,
            slots.footer ? h('div', { class: 'k5-dialog__footer' }, slots.footer()) : null,
          ],
        )
    },
  })
}
export const Dialog = makeModal('K5Dialog')
export const AlertDialog = makeModal('K5AlertDialog', 'alert')
export const Drawer = makeModal('K5Drawer', 'drawer')
export const Sheet = Drawer
