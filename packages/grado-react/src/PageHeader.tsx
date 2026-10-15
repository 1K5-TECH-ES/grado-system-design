import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode
  subtitle?: ReactNode
  /** Botones a la derecha del título. */
  actions?: ReactNode
  as?: 'h1' | 'h2'
}

export function PageHeader({ title, subtitle, actions, as: Heading = 'h1', className, children, ...rest }: PageHeaderProps) {
  return (
    <header {...rest} className={cx('k5-page-header', className)}>
      <div className="k5-page-header__titles">
        <Heading className="k5-page-header__title">{title}</Heading>
        {subtitle != null ? <p className="k5-page-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions != null ? <div className="k5-page-header__actions">{actions}</div> : null}
      {children}
    </header>
  )
}
