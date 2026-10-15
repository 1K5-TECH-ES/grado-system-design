import type { HTMLAttributes } from 'react'
import { cx, separatorClass, type SeparatorOrientation } from '@1k5-tech-es/grado/classes'

export interface SeparatorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  orientation?: SeparatorOrientation
  /** true: solo visual, oculto a lectores de pantalla. false: role="separator". */
  decorative?: boolean
  /** Texto en el centro de la línea, como «o». */
  label?: string
}

/** Línea horizontal o vertical entre bloques. */
export function Separator({ orientation = 'horizontal', decorative = true, label, className, ...rest }: SeparatorProps) {
  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'separator', 'aria-orientation': orientation, ...(label ? { 'aria-label': label } : {}) }
  return (
    <div {...rest} {...a11y} className={cx(separatorClass({ orientation, label: Boolean(label) }), className)}>
      {label ? <span className="k5-separator__label">{label}</span> : null}
    </div>
  )
}
