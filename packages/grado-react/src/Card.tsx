import type { HTMLAttributes } from 'react'
import { cardClass, cx, type CardVariant } from '@1k5/grado/classes'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** panel (por defecto), alert (borde rojo) o plain (sin superficie). */
  variant?: CardVariant
}

export function Card({ variant, className, ...rest }: CardProps) {
  return <div {...rest} className={cx(cardClass({ variant }), className)} />
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cx('k5-card__header', className)} />
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4'
}

export function CardTitle({ as: Tag = 'h3', className, ...rest }: CardTitleProps) {
  return <Tag {...rest} className={cx('k5-card__title', className)} />
}

export function CardDescription({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...rest} className={cx('k5-card__description', className)} />
}

export function CardContent({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cx('k5-card__content', className)} />
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cx('k5-card__footer', className)} />
}
