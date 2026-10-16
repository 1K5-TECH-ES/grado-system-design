import { forwardRef, type HTMLAttributes } from 'react'
import { badgeClass, cx, type BadgeTone } from '@1k5-tech-es/grado/classes'
import type { IconComponent } from './types.js'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  icon?: IconComponent
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ tone, icon: Icon, className, children, ...rest }, ref) {
  return (
    <span ref={ref} {...rest} className={cx(badgeClass({ tone }), className)}>
      {Icon ? <Icon aria-hidden="true" /> : null}
      {children}
    </span>
  )
})
