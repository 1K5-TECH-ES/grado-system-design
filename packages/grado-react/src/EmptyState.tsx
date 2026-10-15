import type { HTMLAttributes, ReactNode } from 'react'
import { cx, emptyClass } from '@1k5/grado/classes'
import type { IconComponent } from './types.js'

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: IconComponent
  title?: ReactNode
  description?: ReactNode
  /** Botón para salir del estado vacío. */
  action?: ReactNode
  compact?: boolean
}

export function EmptyState({ icon: Icon, title, description, action, compact, className, children, ...rest }: EmptyStateProps) {
  return (
    <div {...rest} className={cx(emptyClass({ compact }), className)}>
      {Icon ? (
        <span className="k5-empty__icon">
          <Icon aria-hidden="true" />
        </span>
      ) : null}
      {title != null ? <p className="k5-empty__title">{title}</p> : null}
      {description != null ? <p className="k5-empty__description">{description}</p> : null}
      {children}
      {action != null ? <div className="k5-empty__action">{action}</div> : null}
    </div>
  )
}
