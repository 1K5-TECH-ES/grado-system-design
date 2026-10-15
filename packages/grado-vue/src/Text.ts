import { defineComponent, h, type Component, type PropType } from 'vue'
import {
  headingClass,
  headingLevel,
  textClass,
  type HeadingLevel,
  type HeadingSize,
  type TextSize,
  type TextTone,
  type TextWeight,
} from '@1k5-tech-es/grado/classes'

/** Párrafo o texto en línea con un paso de la escala tipográfica. */
export const Text = defineComponent({
  name: 'K5Text',
  props: {
    /** Etiqueta que se pinta: p por defecto; span, strong, small, label… para texto en línea. */
    as: { type: [String, Object, Function] as PropType<string | Component>, default: 'p' },
    /** caption, small, body (por defecto) o lead. */
    size: String as PropType<TextSize>,
    /** default hereda el color del contexto. muted para texto secundario; el resto, solo para estado. */
    tone: String as PropType<TextTone>,
    weight: String as PropType<TextWeight>,
    /** Una sola línea con puntos suspensivos. */
    truncate: Boolean,
    /** Cifras tabulares, para que los números se alineen en columnas. */
    numeric: Boolean,
  },
  setup(props, { slots }) {
    return () =>
      h(
        props.as,
        {
          class: textClass({ size: props.size, tone: props.tone, weight: props.weight, truncate: props.truncate, numeric: props.numeric }),
        },
        slots.default?.(),
      )
  },
})

/** Título de sección. El título de la página va en PageHeader. */
export const Heading = defineComponent({
  name: 'K5Heading',
  props: {
    /** Nivel en el esquema del documento: h1 … h6. level="2" y :level="2" valen igual. */
    level: { type: [Number, String] as PropType<HeadingLevel>, required: true },
    /** Tamaño visual. Por defecto, según el nivel: 1 → title, 2 → heading, 3 a 6 → lead. */
    size: String as PropType<HeadingSize>,
    /** Otra etiqueta en lugar de h<level>, por ejemplo legend. level sigue eligiendo el tamaño. */
    as: [String, Object, Function] as PropType<string | Component>,
  },
  setup(props, { slots }) {
    return () =>
      h(props.as ?? `h${headingLevel(props.level)}`, { class: headingClass({ level: props.level, size: props.size }) }, slots.default?.())
  },
})
