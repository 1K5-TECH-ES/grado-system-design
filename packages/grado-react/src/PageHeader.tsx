import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode
  subtitle?: ReactNode
  /** Botones a la derecha del título. */
  actions?: ReactNode
  as?: 'h1' | 'h2'
  /**
   * bar: barra de 44 px con el título pequeño, lo que pongas como hijo (un SegmentedControl para cambiar de vista,
   * unos filtros) en medio y las acciones a la derecha. Para listados; el título grande, para fichas.
   */
  variant?: 'default' | 'bar'
}

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  { title, subtitle, actions, as: Heading = 'h1', variant, className, children, ...rest },
  ref,
) {
  return (
    <header ref={ref} {...rest} className={cx('k5-page-header', variant === 'bar' && 'k5-page-header--bar', className)}>
      <div className="k5-page-header__titles">
        <Heading className="k5-page-header__title">{title}</Heading>
        {subtitle != null ? <p className="k5-page-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions != null ? <div className="k5-page-header__actions">{actions}</div> : null}
      {children}
    </header>
  )
})
