import { defineComponent, h, type PropType } from 'vue'
import { cardClass, type CardVariant } from '@1k5/grado/classes'

export const Card = defineComponent({
  name: 'K5Card',
  props: {
    /** panel (por defecto), alert (borde rojo) o plain (sin superficie). */
    variant: String as PropType<CardVariant>,
  },
  setup(props, { slots }) {
    return () => h('div', { class: cardClass({ variant: props.variant }) }, slots.default?.())
  },
})

const part = (name: string, tag: string, className: string) =>
  defineComponent({
    name,
    setup(_, { slots }) {
      return () => h(tag, { class: className }, slots.default?.())
    },
  })

export const CardHeader = part('K5CardHeader', 'div', 'k5-card__header')
export const CardDescription = part('K5CardDescription', 'p', 'k5-card__description')
export const CardContent = part('K5CardContent', 'div', 'k5-card__content')
export const CardFooter = part('K5CardFooter', 'div', 'k5-card__footer')

export const CardTitle = defineComponent({
  name: 'K5CardTitle',
  props: { as: { type: String as PropType<'h2' | 'h3' | 'h4'>, default: 'h3' } },
  setup(props, { slots }) {
    return () => h(props.as, { class: 'k5-card__title' }, slots.default?.())
  },
})
