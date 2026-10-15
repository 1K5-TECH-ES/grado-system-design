import { defineComponent, h, type PropType } from 'vue'
import { bannerClass, ICON_PATHS, STATUS_ICONS, type BannerTone } from '@1k5-tech-es/grado/classes'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

/**
 * Aviso para toda la aplicación, de borde a borde. En AppShell va en el slot #banner.
 * Slots: el slot por defecto (texto del aviso) y #action (un Button link o secondary).
 */
export const Banner = defineComponent({
  name: 'K5Banner',
  props: {
    title: { type: String, required: true },
    tone: { type: String as PropType<BannerTone>, default: 'info' },
    /** Muestra el botón de cerrar, que emite dismiss. */
    dismissible: Boolean,
    dismissLabel: String,
    /** status por defecto; alert por defecto en danger. */
    role: String as PropType<'status' | 'alert' | 'none'>,
  },
  emits: ['dismiss'],
  setup(props, { slots, emit }) {
    const t = useGrado()
    return () => {
      const live = props.role ?? (props.tone === 'danger' ? 'alert' : 'status')
      return h('div', { class: bannerClass({ tone: props.tone }), role: live === 'none' ? undefined : live }, [
        pathIcon(ICON_PATHS[props.tone === 'brand' ? 'info' : STATUS_ICONS[props.tone]], 'k5-banner__icon'),
        h('div', { class: 'k5-banner__content' }, [
          h('strong', { class: 'k5-banner__title' }, props.title),
          slots.default ? h('span', { class: 'k5-banner__text' }, slots.default()) : null,
        ]),
        slots.action ? h('div', { class: 'k5-banner__action' }, slots.action()) : null,
        props.dismissible
          ? h(
              'button',
              {
                type: 'button',
                class: 'k5-close',
                'aria-label': props.dismissLabel ?? t.value.messages.dismiss,
                onClick: () => emit('dismiss'),
              },
              [pathIcon(ICON_PATHS.x)],
            )
          : null,
      ])
    }
  },
})
