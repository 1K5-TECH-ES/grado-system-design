import { forwardRef, type CSSProperties } from 'react'
import { cx, sparklineClass, type SparklineTone } from '@1k5-tech-es/grado/classes'
import { areaPath, linePath, sparklinePoints } from '@1k5-tech-es/grado/patterns'

export interface SparklineProps {
  /** Valores en orden. La escala va del mínimo al máximo; si son iguales, la línea queda plana. */
  data: number[]
  tone?: SparklineTone
  /** Relleno suave bajo la línea. */
  area?: boolean
  /** Alto en píxeles. */
  height?: number
  /** Si se da, la línea es una imagen con ese nombre («Producción de los últimos 7 días: al alza»). Si no, es decorativa. */
  label?: string
  className?: string
}

/** Línea de tendencia mínima, sin ejes. El último punto va marcado. */
export const Sparkline = forwardRef<HTMLSpanElement, SparklineProps>(function Sparkline(
  { data, tone, area = false, height = 32, label, className },
  ref,
) {
  const points = sparklinePoints(data)
  const last = points[points.length - 1]
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const }
  return (
    <span ref={ref} {...a11y} className={cx(sparklineClass({ tone }), className)} style={{ '--_height': `${height}px` } as CSSProperties}>
      <span className="k5-sparkline__plot">
        <svg className="k5-sparkline__svg" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false" aria-hidden="true">
          {area && points.length ? <path className="k5-sparkline__area" d={areaPath(points)} /> : null}
          {points.length ? <path className="k5-sparkline__line" d={linePath(points)} /> : null}
        </svg>
        {last ? <span className="k5-sparkline__dot" style={{ left: `${last.x}%`, top: `${last.y}%` }} /> : null}
      </span>
    </span>
  )
})
