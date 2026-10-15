import { defineComponent, h, nextTick, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import { cx } from '@1k5-tech-es/grado/classes'
import { menuPosition, moveFocus, type MenuItem } from '@1k5-tech-es/grado/patterns'
import { useGrado } from './Locale.js'
import { autoId } from './helpers.js'

type Point = { x: number; y: number }

/** ¿Pide el teclado el menú contextual? Mayúsculas + F10 o la tecla de menú. */
const wantsMenu = (event: KeyboardEvent) => event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')

/**
 * Menú contextual sobre una zona, con el mismo teclado y aspecto que DropdownMenu.
 * Slot por defecto: la zona. Clic derecho, Mayúsculas + F10 o la tecla de menú abren el menú.
 */
export const ContextMenu = defineComponent({
  name: 'K5ContextMenu',
  props: {
    items: { type: Array as PropType<MenuItem[]>, required: true },
    /** Nombre de la zona y del menú para lectores de pantalla. Por defecto, «Acciones» en el menú. */
    label: String,
    /** Deja el menú del navegador. */
    disabled: Boolean,
  },
  emits: ['action'],
  setup(props, { emit, slots }) {
    const t = useGrado()
    const point = ref<Point | null>(null),
      zone = ref<HTMLElement>(),
      menu = ref<HTMLElement>(),
      id = autoId('k5-context-menu')
    let back: HTMLElement | null = null,
      byKeyboard = 0
    const show = (next: Point) => {
      const active = document.activeElement as HTMLElement | null
      back = active && zone.value?.contains(active) ? active : (zone.value ?? null)
      point.value = next
    }
    const close = (restore: boolean) => {
      point.value = null
      if (restore) (back?.isConnected ? back : zone.value)?.focus()
    }
    const outside = (event: Event) => {
      if (!menu.value?.contains(event.target as Node)) close(false)
    }
    const listen = (on: boolean) => {
      const method = on ? 'addEventListener' : 'removeEventListener'
      document[method]('pointerdown', outside)
      window[method]('scroll', outside, true)
      window[method]('resize', outside)
    }
    // Mide el menú antes de pintarlo y lo coloca dentro de la ventana.
    watch(point, async (value, old) => {
      if (!value) return listen(false)
      await nextTick()
      if (!menu.value || point.value !== value) return
      const view = document.documentElement
      const at = menuPosition(
        value,
        { width: menu.value.offsetWidth, height: menu.value.offsetHeight },
        { width: view.clientWidth, height: view.clientHeight },
      )
      menu.value.style.left = `${at.x}px`
      menu.value.style.top = `${at.y}px`
      if (!old) {
        menu.value.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
        listen(true)
      }
    })
    onBeforeUnmount(() => listen(false))

    return () =>
      h(
        'div',
        {
          ref: zone,
          tabindex: 0,
          role: props.label ? 'group' : undefined,
          'aria-label': props.label,
          class: 'k5-context-menu',
          onContextmenu: (event: MouseEvent) => {
            if (props.disabled) return
            event.preventDefault()
            // La tecla de menú también lanza contextmenu: ya está abierto desde el teclado.
            if (menu.value?.contains(event.target as Node) || (point.value && Date.now() - byKeyboard < 500)) return
            show({ x: event.clientX, y: event.clientY })
          },
          onKeydown: (event: KeyboardEvent) => {
            if (props.disabled || point.value || !wantsMenu(event)) return
            event.preventDefault()
            byKeyboard = Date.now()
            // Desde el teclado se ancla bajo el elemento con el foco (la zona o algo dentro).
            const box = (event.target as HTMLElement).getBoundingClientRect()
            show({ x: box.left, y: box.bottom })
          },
          onFocusout: (event: FocusEvent) => {
            const next = event.relatedTarget as Node | null
            if (point.value && next && !zone.value?.contains(next)) close(false)
          },
        },
        [
          slots.default?.(),
          point.value
            ? h(
                'div',
                {
                  ref: menu,
                  id,
                  role: 'menu',
                  'aria-label': props.label ?? t.value.messages.actions,
                  class: 'k5-menu__content k5-context-menu__content',
                  style: { left: `${point.value.x}px`, top: `${point.value.y}px` },
                  onKeydown: (event: KeyboardEvent) => {
                    event.stopPropagation()
                    if (event.key === 'Escape' || wantsMenu(event)) {
                      event.preventDefault()
                      close(true)
                    } else moveFocus(event, event.currentTarget as HTMLElement, '[role="menuitem"]')
                  },
                },
                props.items.map((item) =>
                  h('div', { role: 'none', key: item.id }, [
                    item.separator ? h('div', { role: 'separator', class: 'k5-menu__separator' }) : null,
                    h(
                      'button',
                      {
                        type: 'button',
                        role: 'menuitem',
                        tabindex: -1,
                        disabled: item.disabled,
                        class: cx('k5-menu__item', item.danger && 'k5-menu__item--danger'),
                        onPointermove: (event: PointerEvent) => {
                          if (!item.disabled) (event.currentTarget as HTMLElement).focus()
                        },
                        onClick: () => {
                          close(true)
                          emit('action', item.id)
                        },
                      },
                      item.label,
                    ),
                  ]),
                ),
              )
            : null,
        ],
      )
  },
})
