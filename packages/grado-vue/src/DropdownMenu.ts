import { defineComponent, h, onBeforeUnmount, ref, watch, type PropType } from 'vue'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { moveFocus, overflowsSide, type MenuItem } from '@1k5-tech-es/grado/patterns'
import { Button } from './Button.js'
import { pathIcon } from './PathIcon.js'
import { autoId } from './helpers.js'

export const DropdownMenu = defineComponent({
  name: 'K5DropdownMenu',
  props: {
    label: { type: String, required: true },
    items: { type: Array as PropType<MenuItem[]>, required: true },
    disabled: Boolean,
    align: { type: String as PropType<'start' | 'end'>, default: 'end' },
  },
  emits: ['action'],
  setup(props, { emit }) {
    const open = ref(false),
      root = ref<HTMLElement>(),
      menu = ref<HTMLElement>(),
      id = autoId('k5-menu')
    // Si el menú no cabe por el lado pedido (ventana o contenedor con scroll), se abre hacia el otro.
    const flipped = ref(false)
    watch(
      open,
      (value) => {
        flipped.value = false
        if (value && menu.value && overflowsSide(menu.value, props.align === 'end' ? 'left' : 'right')) flipped.value = true
      },
      { flush: 'post' },
    )
    let first = 'first'
    const trigger = () => root.value?.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')
    const outside = (event: PointerEvent) => {
      if (!root.value?.contains(event.target as Node)) open.value = false
    }
    watch(
      open,
      (value) => {
        if (value) {
          const buttons = menu.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
          if (buttons?.length) buttons[first === 'last' ? buttons.length - 1 : 0].focus()
          document.addEventListener('pointerdown', outside)
        } else document.removeEventListener('pointerdown', outside)
      },
      { flush: 'post' },
    )
    onBeforeUnmount(() => document.removeEventListener('pointerdown', outside))
    return () =>
      h(
        'div',
        {
          ref: root,
          class: 'k5-menu',
          onFocusout: (event: FocusEvent) => {
            if (!root.value?.contains(event.relatedTarget as Node)) open.value = false
          },
        },
        [
          h(
            Button,
            {
              variant: 'secondary',
              disabled: props.disabled,
              'aria-haspopup': 'menu',
              'aria-expanded': open.value,
              'aria-controls': open.value ? id : undefined,
              onClick: () => {
                first = 'first'
                open.value = !open.value
              },
              onKeydown: (event: KeyboardEvent) => {
                if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
                  event.preventDefault()
                  first = event.key === 'ArrowUp' ? 'last' : 'first'
                  open.value = true
                }
              },
            },
            { default: () => [props.label, pathIcon(ICON_PATHS.chevronDown, 'k5-menu__chevron')] },
          ),
          open.value
            ? h(
                'div',
                {
                  ref: menu,
                  class: cx('k5-menu__content', (props.align === 'start') !== flipped.value && 'k5-menu__content--start'),
                  role: 'menu',
                  'aria-label': props.label,
                  id,
                  onKeydown: (event: KeyboardEvent) => {
                    if (event.key === 'Escape') {
                      event.preventDefault()
                      open.value = false
                      trigger()?.focus()
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
                          open.value = false
                          trigger()?.focus()
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
