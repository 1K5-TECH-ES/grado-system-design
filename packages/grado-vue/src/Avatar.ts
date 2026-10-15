import { defineComponent, h, type PropType } from 'vue'
import { avatarClass, initials, type AvatarStatus, type Size } from '@1k5-tech-es/grado/classes'
import { useGrado } from './Locale.js'

const STATUS_KEYS = { online: 'statusOnline', away: 'statusAway', busy: 'statusBusy' } as const

export const Avatar = defineComponent({
  name: 'K5Avatar',
  props: {
    /** Nombre completo: da las iniciales y el texto para lectores de pantalla. */
    name: String,
    /** Iniciales a mano, si no quieres que se calculen. */
    initials: String,
    /** Foto. Si no carga, se ven las iniciales. */
    src: String,
    size: String as PropType<Size>,
    status: String as PropType<AvatarStatus>,
  },
  setup(props) {
    const t = useGrado()
    return () => {
      const spoken = props.name
        ? [props.name, props.status && t.value.messages[STATUS_KEYS[props.status]]].filter(Boolean).join(' · ')
        : undefined
      const a11y = spoken ? { role: 'img', 'aria-label': spoken, title: props.name } : { 'aria-hidden': 'true' }
      return h('span', { ...a11y, class: avatarClass({ size: props.size }) }, [
        props.initials ?? initials(props.name),
        props.src
          ? h('img', {
              class: 'k5-avatar__image',
              src: props.src,
              alt: '',
              onError: (event: Event) => {
                ;(event.target as HTMLImageElement).hidden = true
              },
            })
          : null,
        props.status ? h('span', { class: `k5-avatar__status k5-avatar__status--${props.status}` }) : null,
      ])
    }
  },
})
