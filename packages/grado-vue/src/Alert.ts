import { defineComponent, h, mergeProps, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'
import { cx, ICON_PATHS, STATUS_ICONS } from '@1k5-tech-es/grado/classes'
import { type StatusTone } from '@1k5-tech-es/grado/patterns'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

const closeIcon = () => pathIcon(ICON_PATHS.x)

export const Alert = defineComponent({
  name: 'K5Alert',
  props: {
    title: { type: String, required: true },
    tone: { type: String as PropType<StatusTone>, default: 'info' },
    dismissible: Boolean,
    dismissLabel: String,
    role: { type: String as PropType<'status' | 'alert' | 'none'>, default: 'status' },
  },
  emits: ['dismiss'],
  setup(props, { slots, emit }) {
    const t = useGrado()
    return () =>
      h('div', { class: cx('k5-alert', `k5-alert--${props.tone}`), role: props.role === 'none' ? undefined : props.role }, [
        pathIcon(ICON_PATHS[STATUS_ICONS[props.tone] ?? 'info'], 'k5-alert__icon'),
        h('div', { class: 'k5-alert__content' }, [
          h('strong', { class: 'k5-alert__title' }, props.title),
          slots.default ? h('div', { class: 'k5-alert__description' }, slots.default()) : null,
          slots.action ? h('div', { class: 'k5-alert__action' }, slots.action()) : null,
        ]),
        props.dismissible
          ? h(
              'button',
              {
                type: 'button',
                class: 'k5-close',
                'aria-label': props.dismissLabel ?? t.value.messages.dismiss,
                onClick: () => emit('dismiss'),
              },
              [closeIcon()],
            )
          : null,
      ])
  },
})
export const Toast = defineComponent({
  name: 'K5Toast',
  inheritAttrs: false,
  props: {
    open: Boolean,
    title: { type: String, required: true },
    tone: { type: String as PropType<StatusTone>, default: 'info' },
    duration: { type: Number, default: 5000 },
    dismissLabel: String,
    role: { type: String as PropType<'status' | 'alert' | 'none'>, default: 'status' },
  },
  emits: ['update:open'],
  setup(props, { attrs, emit, slots }) {
    const paused = ref(false)
    let timer: ReturnType<typeof setTimeout> | undefined,
      remaining = props.duration,
      started = 0
    const clear = () => {
      if (timer) {
        clearTimeout(timer)
        timer = undefined
        remaining -= Date.now() - started
      }
    }
    const schedule = () => {
      clear()
      if (props.open && !paused.value && props.duration > 0) {
        started = Date.now()
        timer = setTimeout(() => emit('update:open', false), Math.max(0, remaining))
      }
    }
    onMounted(() => {
      watch(
        () => [props.open, props.duration],
        () => {
          clear()
          remaining = props.duration
          if (!props.open) paused.value = false
          schedule()
        },
        { immediate: true },
      )
      watch(paused, schedule)
    })
    onBeforeUnmount(clear)
    return () =>
      props.open
        ? h(
            'div',
            mergeProps(attrs, {
              class: 'k5-toast',
              onMouseenter: () => (paused.value = true),
              onMouseleave: (event: MouseEvent) => {
                if (!(event.currentTarget as HTMLElement).contains(document.activeElement)) paused.value = false
              },
              onFocusin: () => (paused.value = true),
              onFocusout: (event: FocusEvent) => {
                if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) paused.value = false
              },
              onKeydown: (event: KeyboardEvent) => {
                if (event.key === 'Escape') emit('update:open', false)
              },
            }),
            [
              h(
                Alert,
                {
                  title: props.title,
                  tone: props.tone,
                  dismissLabel: props.dismissLabel,
                  role: props.role,
                  dismissible: true,
                  onDismiss: () => emit('update:open', false),
                },
                slots,
              ),
            ],
          )
        : null
  },
})
