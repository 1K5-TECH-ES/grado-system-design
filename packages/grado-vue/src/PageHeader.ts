import { defineComponent, h, type PropType } from 'vue'

export const PageHeader = defineComponent({
  name: 'K5PageHeader',
  props: {
    title: { type: String, required: true },
    subtitle: String,
    as: { type: String as PropType<'h1' | 'h2'>, default: 'h1' },
  },
  /** Slots: #actions (botones a la derecha del título) y el slot por defecto. */
  setup(props, { slots }) {
    return () =>
      h('header', { class: 'k5-page-header' }, [
        h('div', { class: 'k5-page-header__titles' }, [
          h(props.as, { class: 'k5-page-header__title' }, props.title),
          props.subtitle ? h('p', { class: 'k5-page-header__subtitle' }, props.subtitle) : null,
        ]),
        slots.actions ? h('div', { class: 'k5-page-header__actions' }, slots.actions()) : null,
        slots.default?.(),
      ])
  },
})
