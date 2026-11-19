import { defineComponent, h, type PropType } from 'vue'
import { cx } from '@1k5-tech-es/grado/classes'

export const PageHeader = defineComponent({
  name: 'K5PageHeader',
  props: {
    title: { type: String, required: true },
    subtitle: String,
    as: { type: String as PropType<'h1' | 'h2'>, default: 'h1' },
    /**
     * bar: barra de 44 px con el título pequeño, lo del slot por defecto (un SegmentedControl para cambiar de vista,
     * unos filtros) en medio y las acciones a la derecha. Para listados; el título grande, para fichas.
     */
    variant: String as PropType<'default' | 'bar'>,
  },
  /** Slots: #actions (botones a la derecha del título) y el slot por defecto. */
  setup(props, { slots }) {
    return () =>
      h('header', { class: cx('k5-page-header', props.variant === 'bar' && 'k5-page-header--bar') }, [
        h('div', { class: 'k5-page-header__titles' }, [
          h(props.as, { class: 'k5-page-header__title' }, props.title),
          props.subtitle ? h('p', { class: 'k5-page-header__subtitle' }, props.subtitle) : null,
        ]),
        slots.actions ? h('div', { class: 'k5-page-header__actions' }, slots.actions()) : null,
        slots.default?.(),
      ])
  },
})
