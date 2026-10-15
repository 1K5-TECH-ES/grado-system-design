import { defineComponent, h, type PropType } from 'vue'
import { statusClass, type RowStatusTone } from '@1k5-tech-es/grado/classes'

/** Estado de una fila con punto de color y texto. En tablas, más discreto que Badge. */
export const Status = defineComponent({
  name: 'K5Status',
  props: {
    tone: String as PropType<RowStatusTone>,
    /** El punto late: para estados «en vivo», como una instalación produciendo ahora. */
    pulse: Boolean,
  },
  setup(props, { slots }) {
    return () =>
      h('span', { class: statusClass({ tone: props.tone, pulse: props.pulse }) }, [
        h('span', { class: 'k5-status__dot', 'aria-hidden': 'true' }),
        slots.default?.(),
      ])
  },
})
