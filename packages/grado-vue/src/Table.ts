import { defineComponent, h } from 'vue'
import { tableClass, tableWrapClass } from '@1k5/grado/classes'

/** Envuelve una <table> normal. Para columnas numéricas usa class="k5-num" en th y td. */
export const Table = defineComponent({
  name: 'K5Table',
  inheritAttrs: false,
  props: {
    caption: String,
    compact: Boolean,
    /** Sin caja: para una tabla que ya está dentro de una tarjeta o panel. */
    plain: Boolean,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h('div', { class: tableWrapClass({ plain: props.plain }) }, [
        h('table', { ...attrs, class: [tableClass({ compact: props.compact }), attrs.class] }, [
          props.caption ? h('caption', props.caption) : null,
          slots.default?.(),
        ]),
      ])
  },
})
