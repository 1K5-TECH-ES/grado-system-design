import type { ReactNode, TableHTMLAttributes } from 'react'
import { cx, tableClass } from '@1k5/grado/classes'

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  caption?: ReactNode
  compact?: boolean
}

/** Envuelve una <table> normal. Para columnas numéricas usa className="k5-num" en th y td. */
export function Table({ caption, compact, className, children, ...rest }: TableProps) {
  return (
    <div className="k5-table-wrap">
      <table {...rest} className={cx(tableClass({ compact }), className)}>
        {caption != null ? <caption>{caption}</caption> : null}
        {children}
      </table>
    </div>
  )
}
