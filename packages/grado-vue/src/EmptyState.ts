import { defineComponent, h, type Component, type PropType } from 'vue'
import { emptyClass } from '@1k5/grado/classes'

export const EmptyState = defineComponent({
  name: 'K5EmptyState',
  props: {
    icon: [Object, Function] as PropType<Component>,
    title: String,
    description: String,
    compact: Boolean,
  },
  /** Slots: #action (botón para salir del estado vacío) y el slot por defecto. */
  setup(props, { slots }) {
    return () =>
      h('div', { class: emptyClass({ compact: props.compact }) }, [
        props.icon ? h('span', { class: 'k5-empty__icon' }, [h(props.icon, { 'aria-hidden': 'true' })]) : null,
        props.title ? h('p', { class: 'k5-empty__title' }, props.title) : null,
        props.description ? h('p', { class: 'k5-empty__description' }, props.description) : null,
        slots.default?.(),
        slots.action ? h('div', { class: 'k5-empty__action' }, slots.action()) : null,
      ])
  },
})
