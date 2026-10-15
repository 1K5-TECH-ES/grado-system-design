import { defineComponent, h, type PropType } from 'vue'
import { sparklineClass, type SparklineTone } from '@1k5-tech-es/grado/classes'
import { areaPath, linePath, sparklinePoints } from '@1k5-tech-es/grado/patterns'

/** Línea de tendencia mínima, sin ejes. El último punto va marcado. */
export const Sparkline = defineComponent({
  name: 'K5Sparkline',
  props: {
    /** Valores en orden. La escala va del mínimo al máximo; si son iguales, la línea queda plana. */
    data: { type: Array as PropType<number[]>, required: true },
    tone: String as PropType<SparklineTone>,
    /** Relleno suave bajo la línea. */
    area: Boolean,
    /** Alto en píxeles. */
    height: { type: Number, default: 32 },
    /** Si se da, la línea es una imagen con ese nombre. Si no, es decorativa. */
    label: String,
  },
  setup(props) {
    return () => {
      const points = sparklinePoints(props.data)
      const last = points[points.length - 1]
      const a11y = props.label ? { role: 'img', 'aria-label': props.label } : { 'aria-hidden': 'true' }
      return h('span', { ...a11y, class: sparklineClass({ tone: props.tone }), style: { '--_height': `${props.height}px` } }, [
        h('span', { class: 'k5-sparkline__plot' }, [
          h(
            'svg',
            { class: 'k5-sparkline__svg', viewBox: '0 0 100 100', preserveAspectRatio: 'none', focusable: 'false', 'aria-hidden': 'true' },
            [
              props.area && points.length ? h('path', { class: 'k5-sparkline__area', d: areaPath(points) }) : null,
              points.length ? h('path', { class: 'k5-sparkline__line', d: linePath(points) }) : null,
            ],
          ),
          last ? h('span', { class: 'k5-sparkline__dot', style: { left: `${last.x}%`, top: `${last.y}%` } }) : null,
        ]),
      ])
    }
  },
})
