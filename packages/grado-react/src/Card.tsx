import { forwardRef, type HTMLAttributes } from 'react'
import { cardClass, cx, type CardVariant } from '@1k5-tech-es/grado/classes'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** panel (por defecto), alert (borde rojo) o plain (sin superficie). */
  variant?: CardVariant
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ variant, className, ...rest }, ref) {
  return <div ref={ref} {...rest} className={cx(cardClass({ variant }), className)} />
})

export type CardSectionProps = HTMLAttributes<HTMLDivElement>
export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>

export const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(function CardHeader({ className, ...rest }, ref) {
  return <div ref={ref} {...rest} className={cx('k5-card__header', className)} />
})

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4'
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle({ as: Tag = 'h3', className, ...rest }, ref) {
  return <Tag ref={ref} {...rest} className={cx('k5-card__title', className)} />
})

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(function CardDescription(
  { className, ...rest },
  ref,
) {
  return <p ref={ref} {...rest} className={cx('k5-card__description', className)} />
})

export const CardContent = forwardRef<HTMLDivElement, CardSectionProps>(function CardContent({ className, ...rest }, ref) {
  return <div ref={ref} {...rest} className={cx('k5-card__content', className)} />
})

export const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(function CardFooter({ className, ...rest }, ref) {
  return <div ref={ref} {...rest} className={cx('k5-card__footer', className)} />
})
