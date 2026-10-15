import { defineComponent, h, type PropType } from 'vue'
import { avatarClass, avatarGroupClass, type Size } from '@1k5/grado/classes'
import { formatMessage } from '@1k5/grado/messages'
import { splitAvatars, type AvatarItem } from '@1k5/grado/patterns'
import { Avatar } from './Avatar.js'
import { useGrado } from './Locale.js'

/** Avatares solapados de un equipo. */
export const AvatarGroup = defineComponent({
  name: 'K5AvatarGroup',
  props: {
    items: { type: Array as PropType<AvatarItem[]>, required: true },
    /** Avatares visibles; el resto va en un círculo «+N». */
    max: { type: Number, default: 4 },
    size: String as PropType<Size>,
  },
  setup(props) {
    const t = useGrado()
    return () => {
      const { shown, rest } = splitAvatars(props.items, props.max)
      return h('div', { class: avatarGroupClass({ size: props.size }) }, [
        ...shown.map((item, index) => h(Avatar, { key: `${item.name}-${index}`, name: item.name, src: item.src, size: props.size })),
        rest.length
          ? h(
              'span',
              { class: [avatarClass({ size: props.size }), 'k5-avatar-group__more'], title: rest.map((item) => item.name).join(', ') },
              [
                h('span', { 'aria-hidden': 'true' }, `+${rest.length}`),
                h('span', { class: 'k5-sr-only' }, formatMessage(t.value.messages.avatarMore, { count: rest.length })),
              ],
            )
          : null,
      ])
    }
  },
})
