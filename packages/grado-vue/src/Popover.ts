import { cloneVNode, defineComponent, h, isVNode, onBeforeUnmount, onMounted, ref, watch, type PropType, type VNode } from 'vue'
import { popoverClass, type PopoverAlign, type PopoverSide } from '@1k5-tech-es/grado/classes'
import { overflowsSide } from '@1k5-tech-es/grado/patterns'
import { Button } from './Button.js'
import { autoId, booleanOptional, model } from './helpers.js'

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

/**
 * Contenido libre anclado a un control, sin bloquear la página. Escape y clic fuera lo cierran.
 * Slots: #trigger (el control que lo abre: recibe aria-haspopup, aria-expanded y aria-controls)
 * y el slot por defecto (contenido del panel).
 */
export const Popover = defineComponent({
  name: 'K5Popover',
  props: {
    /** Sin #trigger, pinta un Button secondary con este texto. También nombra el panel si no hay title. */
    label: String,
    /** Título del panel; le da nombre accesible (aria-labelledby). */
    title: String,
    open: booleanOptional,
    defaultOpen: Boolean,
    /** Borde del disparador con el que se alinea el panel. Si no cabe, se abre hacia el otro lado. */
    align: { type: String as PropType<PopoverAlign>, default: 'start' },
    side: { type: String as PropType<PopoverSide>, default: 'bottom' },
    id: String,
  },
  emits: ['update:open'],
  setup(props, { emit, slots }) {
    const [open, setOpen] = model(
      () => props.open,
      props.defaultOpen,
      (value) => emit('update:open', value),
    )
    const root = ref<HTMLElement>(),
      panel = ref<HTMLElement>()
    const auto = autoId('k5-popover')
    const id = () => props.id ?? auto
    const toggler = () => root.value?.querySelector<HTMLElement>('[aria-haspopup="dialog"]')
    const close = (restore: boolean) => {
      setOpen(false)
      if (restore) toggler()?.focus()
    }
    // Si el panel no cabe por su lado (ventana o contenedor con scroll), se alinea con el otro borde.
    const placed = ref<PopoverAlign>(props.align)
    // Si la app cierra el panel con el foco dentro (una opción que elige y cierra), el foco se
    // quedaría en <body> al desaparecer el panel: vuelve al disparador, como con Escape. Después del
    // evento: con Enter, el disparador enfocado a mitad de la pulsación la recibiría y volvería a abrir.
    let focusInside = false
    const outside = (event: PointerEvent) => {
      const node = event.target as Element
      if (root.value?.contains(node)) return
      const inside = root.value?.contains(document.activeElement)
      // El clic fuera decide él adónde va el foco.
      focusInside = false
      close(false)
      // El foco vuelve al disparador salvo que el clic caiga en otro control.
      if (inside && !node.closest?.(FOCUSABLE)) setTimeout(() => toggler()?.focus())
    }
    watch(
      [open, () => props.align],
      ([value]) => {
        placed.value = props.align
        if (!value) return document.removeEventListener('pointerdown', outside)
        if (!panel.value) return
        if (props.align !== 'end' && overflowsSide(panel.value, 'right')) placed.value = 'end'
        else if (props.align !== 'start' && overflowsSide(panel.value, 'left')) placed.value = 'start'
      },
      { flush: 'post' },
    )
    watch(
      open,
      (value) => {
        if (!value) {
          if (!focusInside) return
          focusInside = false
          setTimeout(() => {
            const active = document.activeElement
            if (!active || active === document.body) toggler()?.focus()
          })
          return
        }
        // Al abrir, el foco pasa al primer elemento enfocable del panel o, si no hay, al panel.
        ;(panel.value?.querySelector<HTMLElement>(FOCUSABLE) ?? panel.value)?.focus()
        document.addEventListener('pointerdown', outside)
      },
      { flush: 'post' },
    )
    // Abierto desde el principio: escucha los clics fuera, pero no mueve el foco.
    onMounted(() => {
      if (open.value) document.addEventListener('pointerdown', outside)
    })
    onBeforeUnmount(() => document.removeEventListener('pointerdown', outside))

    return () => {
      const triggerProps = {
        'aria-haspopup': 'dialog',
        'aria-expanded': open.value,
        'aria-controls': open.value ? id() : undefined,
        onClick: (event: MouseEvent) => {
          if (!event.defaultPrevented) setOpen(!open.value)
        },
      }
      const given = slots.trigger?.().find((node): node is VNode => isVNode(node) && typeof node.type !== 'symbol')
      const control = given
        ? cloneVNode(given, triggerProps, true)
        : h(Button, { variant: 'secondary', ...triggerProps }, { default: () => props.label })
      const hasTitle = Boolean(props.title)
      return h(
        'div',
        {
          ref: root,
          class: 'k5-popover',
          onFocusout: (event: FocusEvent) => {
            const next = event.relatedTarget as Node | null
            if (open.value && next && !root.value?.contains(next)) close(false)
          },
          onKeydown: (event: KeyboardEvent) => {
            if (!open.value || event.key !== 'Escape') return
            event.preventDefault()
            event.stopPropagation()
            close(true)
          },
        },
        [
          control,
          open.value
            ? h(
                'div',
                {
                  ref: panel,
                  id: id(),
                  role: 'dialog',
                  tabindex: -1,
                  'aria-labelledby': hasTitle ? `${id()}-title` : undefined,
                  'aria-label': hasTitle ? undefined : props.label,
                  class: popoverClass({ align: placed.value, side: props.side }),
                  onFocusin: () => (focusInside = true),
                  onFocusout: (event: FocusEvent) => {
                    // Sin relatedTarget, el foco no se ha ido a otro sitio: el panel está desapareciendo.
                    const next = event.relatedTarget as Node | null
                    if (next && !(event.currentTarget as HTMLElement).contains(next)) focusInside = false
                  },
                },
                [hasTitle ? h('p', { id: `${id()}-title`, class: 'k5-popover__title' }, props.title) : null, slots.default?.()],
              )
            : null,
        ],
      )
    }
  },
})
