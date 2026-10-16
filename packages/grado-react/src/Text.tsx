import { forwardRef, type ElementType, type HTMLAttributes } from 'react'
import {
  cx,
  headingClass,
  headingLevel,
  textClass,
  type HeadingLevel,
  type HeadingSize,
  type TextSize,
  type TextTone,
  type TextWeight,
} from '@1k5-tech-es/grado/classes'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Etiqueta que se pinta: p por defecto; span, strong, small, label… para texto en línea. */
  as?: ElementType
  /** caption, small, body (por defecto) o lead. */
  size?: TextSize
  /** default hereda el color del contexto. muted para texto secundario; el resto, solo para estado. */
  tone?: TextTone
  weight?: TextWeight
  /** Una sola línea con puntos suspensivos. */
  truncate?: boolean
  /** Cifras tabulares, para que los números se alineen en columnas. */
  numeric?: boolean
}

/** Párrafo o texto en línea con un paso de la escala tipográfica. */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { as: Tag = 'p', size, tone, weight, truncate, numeric, className, ...rest },
  ref,
) {
  return <Tag ref={ref} {...rest} className={cx(textClass({ size, tone, weight, truncate, numeric }), className)} />
})

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Nivel en el esquema del documento: h1 … h6. */
  level: HeadingLevel
  /** Tamaño visual. Por defecto, según el nivel: 1 → title, 2 → heading, 3 a 6 → lead. */
  size?: HeadingSize
  /** Otra etiqueta en lugar de h<level>, por ejemplo legend. level sigue eligiendo el tamaño. */
  as?: ElementType
}

/** Título de sección. El título de la página va en PageHeader. */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading({ level, size, as, className, ...rest }, ref) {
  const Tag: ElementType = as ?? `h${headingLevel(level)}`
  return <Tag ref={ref} {...rest} className={cx(headingClass({ level, size }), className)} />
})
