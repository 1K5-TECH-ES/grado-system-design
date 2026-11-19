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
      const close = () => {
        dialog.value?.close()
        unlock?.()
        unlock = undefined
        if (previous?.isConnected) previous.focus()
        previous = null
      }
      onMounted(() =>
        watch(
          visible,
          (open) => {
            if (open && dialog.value) {
              previous = document.activeElement as HTMLElement
              dialog.value.showModal()
              unlock = lockScroll(document)
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
            'aria-modal': 'true',
            'aria-labelledby': `${id}-title`,
            'aria-describedby': props.description ? `${id}-description` : undefined,
            class: cx(
              'k5-dialog',
              kind === 'alert' && 'k5-dialog--alert',
              props.fullscreen && 'k5-dialog--fullscreen',
              !props.header && 'k5-dialog--headless',
              kind === 'drawer' && 'k5-drawer',
              kind === 'drawer' && props.side === 'left' && 'k5-drawer--left',
            ),
            onCancel: (event: Event) => {
              event.preventDefault()
              if (props.closeOnEscape) setVisible(false)
            },
            onPointerdown: (event: PointerEvent) => backdrop.down(event),
            onClick: (event: MouseEvent) => {
              if (backdrop.click(event) && props.closeOnOutside && kind !== 'alert') setVisible(false)
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
