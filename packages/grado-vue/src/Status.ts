import { defineComponent, h, type PropType } from 'vue'
import { statusClass, type RowStatusTone, type StatusProgress } from '@1k5-tech-es/grado/classes'

/** Estado de una fila con punto de color y texto. En tablas, más discreto que Badge. */
export const Status = defineComponent({
  name: 'K5Status',
  props: {
    tone: String as PropType<RowStatusTone>,
    /** El punto late: para estados «en vivo», como una instalación produciendo ahora. */
    pulse: Boolean,
    /**
     * Paso de un flujo con orden: backlog, todo, started, waiting, done o canceled. El punto pasa a
     * icono de progreso, que se lee sin color; sin tone, cada paso trae el suyo.
     */
    progress: String as PropType<StatusProgress>,
  },
  setup(props, { slots }) {
    return () =>
      h('span', { class: statusClass({ tone: props.tone, pulse: props.pulse, progress: props.progress }) }, [
        h('span', { class: 'k5-status__dot', 'aria-hidden': 'true' }),
        slots.default?.(),
      ])
  },
})
