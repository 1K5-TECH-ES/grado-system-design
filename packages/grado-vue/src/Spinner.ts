import { defineComponent, h, type PropType } from 'vue'
import { spinnerClass, type Size } from '@1k5-tech-es/grado/classes'
import { useGrado } from './Locale.js'

export const Spinner = defineComponent({
  name: 'K5Spinner',
  props: {
    size: String as PropType<Size>,
    /** Texto para lectores de pantalla. */
    label: String,
    /** Solo decorativo (por ejemplo dentro de un botón que ya tiene aria-busy). */
    decorative: Boolean,
  },
  setup(props) {
    const t = useGrado()
    return () =>
      h('span', {
        ...(props.decorative ? { 'aria-hidden': 'true' } : { role: 'status', 'aria-label': props.label ?? t.value.messages.loading }),
        class: spinnerClass({ size: props.size }),
      })
  },
})
