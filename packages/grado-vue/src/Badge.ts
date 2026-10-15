import { defineComponent, h, type Component, type PropType } from 'vue'
import { badgeClass, type BadgeTone } from '@1k5/grado/classes'

export const Badge = defineComponent({
  name: 'K5Badge',
  props: {
    tone: String as PropType<BadgeTone>,
    icon: [Object, Function] as PropType<Component>,
  },
  setup(props, { slots }) {
    return () =>
      h('span', { class: badgeClass({ tone: props.tone }) }, [
        props.icon ? h(props.icon, { 'aria-hidden': 'true' }) : null,
        slots.default?.(),
      ])
  },
})
