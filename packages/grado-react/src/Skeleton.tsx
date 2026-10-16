'use client'
import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  circle?: boolean
}
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { width = '100%', height = '1rem', circle = false, style, className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      {...props}
      aria-hidden="true"
      className={cx('k5-skeleton', circle && 'k5-skeleton--circle', className)}
      style={{ width, height, ...style }}
    />
  )
})
