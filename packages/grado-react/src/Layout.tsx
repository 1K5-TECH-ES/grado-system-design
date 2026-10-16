import { forwardRef, type ElementType, type HTMLAttributes } from 'react'
import {
  containerClass,
  cx,
  gridClass,
  stackClass,
  type ContainerSize,
  type GridColumns,
  type GridMinItemWidth,
  type SpaceStep,
  type StackAlign,
  type StackDirection,
  type StackJustify,
} from '@1k5-tech-es/grado/classes'

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Etiqueta o componente que se pinta. Por defecto div; ul, ol, section, form… cuando el contenido lo pide. */
  as?: ElementType
  /** column (por defecto) o row. En fila los hijos se centran en vertical. */
  direction?: StackDirection
  /** Clave de la escala de espacio: '0-5' … '16'. Por defecto '4' (16 px). */
  gap?: SpaceStep
  align?: StackAlign
  justify?: StackJustify
  /** Pasa a la línea siguiente cuando no caben (solo en fila). */
  wrap?: boolean
}

/** Apila hijos en una dirección con un hueco de la escala de espacio. Solo clases: compatible con CSP. */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { as: Tag = 'div', direction, gap, align, justify, wrap, className, ...rest },
  ref,
) {
  return <Tag ref={ref} {...rest} className={cx(stackClass({ direction, gap, align, justify, wrap }), className)} />
})

export interface GridProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  /** 1–6 columnas iguales (una sola por debajo de 600 px) o 'auto' (por defecto): tantas como quepan. */
  columns?: GridColumns
  /** Ancho mínimo de cada elemento con columns='auto': sm 12rem, md 16rem (por defecto), lg 20rem. */
  minItemWidth?: GridMinItemWidth
  gap?: SpaceStep
}

/** Rejilla de elementos del mismo peso: tarjetas, KPI, campos de un formulario. */
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid(
  { as: Tag = 'div', columns, minItemWidth, gap, className, ...rest },
  ref,
) {
  return <Tag ref={ref} {...rest} className={cx(gridClass({ columns, minItemWidth, gap }), className)} />
})

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  /** Ancho máximo: sm 40rem (formularios), md 60rem (fichas), lg 80rem (listados, por defecto). */
  size?: ContainerSize
  /** Margen lateral de 16 px, 24 px desde 768 px. Por defecto true. */
  padded?: boolean
}

/** Limita el ancho del contenido y lo centra. */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  { as: Tag = 'div', size, padded = true, className, ...rest },
  ref,
) {
  return <Tag ref={ref} {...rest} className={cx(containerClass({ size, padded }), className)} />
})
