import { defineComponent, h } from 'vue'
import { cx } from '@1k5/grado/classes'

export const Skeleton = defineComponent({
  name: 'K5Skeleton',
  props: { width: { type: [String, Number], default: '100%' }, height: { type: [String, Number], default: '1rem' }, circle: Boolean },
  setup: (props) => () =>
    h('span', {
      'aria-hidden': 'true',
      class: cx('k5-skeleton', props.circle && 'k5-skeleton--circle'),
      style: {
        width: typeof props.width === 'number' ? `${props.width}px` : props.width,
        height: typeof props.height === 'number' ? `${props.height}px` : props.height,
      },
    }),
})
