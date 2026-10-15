import { defineComponent, h, type PropType } from 'vue'
import { separatorClass, type SeparatorOrientation } from '@1k5-tech-es/grado/classes'

/** Línea horizontal o vertical entre bloques. */
export const Separator = defineComponent({
  name: 'K5Separator',
  props: {
    orientation: { type: String as PropType<SeparatorOrientation>, default: 'horizontal' },
    /** true: solo visual, oculto a lectores de pantalla. false: role="separator". */
    decorative: { type: Boolean, default: true },
    /** Texto en el centro de la línea, como «o». */
    label: String,
  },
  setup(props) {
    return () => {
      const a11y = props.decorative
        ? { 'aria-hidden': 'true' }
        : { role: 'separator', 'aria-orientation': props.orientation, ...(props.label ? { 'aria-label': props.label } : {}) }
      return h(
        'div',
        { ...a11y, class: separatorClass({ orientation: props.orientation, label: Boolean(props.label) }) },
        props.label ? [h('span', { class: 'k5-separator__label' }, props.label)] : [],
      )
    }
  },
})
