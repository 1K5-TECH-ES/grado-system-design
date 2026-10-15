import { defineComponent, h, type Component, type PropType } from 'vue'
import {
  containerClass,
  gridClass,
  stackClass,
  type ContainerSize,
  type GridColumns,
  type GridMinItemWidth,
  type SpaceStep,
  type StackAlign,
  type StackDirection,
  type StackJustify,
} from '@1k5-tech-es/grado/classes'

const asProp = (tag: string) => ({ type: [String, Object, Function] as PropType<string | Component>, default: tag })
// En plantilla, gap="4" llega como texto y :gap="4" como número: valen los dos.
const gapProp = [String, Number] as PropType<SpaceStep>

/** Apila hijos en una dirección con un hueco de la escala de espacio. Solo clases: compatible con CSP. */
export const Stack = defineComponent({
  name: 'K5Stack',
  props: {
    /** Etiqueta o componente que se pinta. Por defecto div. */
    as: asProp('div'),
    /** column (por defecto) o row. En fila los hijos se centran en vertical. */
    direction: String as PropType<StackDirection>,
    /** Clave de la escala de espacio: '0-5' … '16'. Por defecto '4' (16 px). */
    gap: gapProp,
    align: String as PropType<StackAlign>,
    justify: String as PropType<StackJustify>,
    /** Pasa a la línea siguiente cuando no caben (solo en fila). */
    wrap: Boolean,
  },
  setup(props, { slots }) {
    return () =>
      h(
        props.as,
        {
          class: stackClass({ direction: props.direction, gap: props.gap, align: props.align, justify: props.justify, wrap: props.wrap }),
        },
        slots.default?.(),
      )
  },
})

/** Rejilla de elementos del mismo peso: tarjetas, KPI, campos de un formulario. */
export const Grid = defineComponent({
  name: 'K5Grid',
  props: {
    as: asProp('div'),
    /** 1–6 columnas iguales (una sola por debajo de 600 px) o 'auto' (por defecto): tantas como quepan. */
    columns: [Number, String] as PropType<GridColumns>,
    /** Ancho mínimo de cada elemento con columns='auto': sm 12rem, md 16rem (por defecto), lg 20rem. */
    minItemWidth: String as PropType<GridMinItemWidth>,
    gap: gapProp,
  },
  setup(props, { slots }) {
    return () =>
      h(props.as, { class: gridClass({ columns: props.columns, minItemWidth: props.minItemWidth, gap: props.gap }) }, slots.default?.())
  },
})

/** Limita el ancho del contenido y lo centra. */
export const Container = defineComponent({
  name: 'K5Container',
  props: {
    as: asProp('div'),
    /** Ancho máximo: sm 40rem (formularios), md 60rem (fichas), lg 80rem (listados, por defecto). */
    size: String as PropType<ContainerSize>,
    /** Margen lateral de 16 px, 24 px desde 768 px. Por defecto true. */
    padded: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    return () => h(props.as, { class: containerClass({ size: props.size, padded: props.padded }) }, slots.default?.())
  },
})
