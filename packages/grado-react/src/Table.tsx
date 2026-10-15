import type { ReactNode, TableHTMLAttributes } from 'react'
import { cx, tableClass, tableWrapClass } from '@1k5-tech-es/grado/classes'

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  caption?: ReactNode
  compact?: boolean
  /** Sin caja: para una tabla que ya está dentro de una tarjeta o panel. */
  plain?: boolean
}

/** Envuelve una <table> normal. Para columnas numéricas usa className="k5-num" en th y td. */
export function Table({ caption, compact, plain, className, children, ...rest }: TableProps) {
  return (
    <div className={tableWrapClass({ plain })}>
      <table {...rest} className={cx(tableClass({ compact }), className)}>
        {caption != null ? <caption>{caption}</caption> : null}
        {children}
      </table>
    </div>
  )
}
