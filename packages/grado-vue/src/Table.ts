import { defineComponent, h } from 'vue'
import { tableClass } from '@1k5/grado/classes'

/** Envuelve una <table> normal. Para columnas numéricas usa class="k5-num" en th y td. */
export const Table = defineComponent({
  name: 'K5Table',
  inheritAttrs: false,
  props: {
    caption: String,
    compact: Boolean,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h('div', { class: 'k5-table-wrap' }, [
        h('table', { ...attrs, class: [tableClass({ compact: props.compact }), attrs.class] }, [
          props.caption ? h('caption', props.caption) : null,
          slots.default?.(),
        ]),
      ])
  },
})
