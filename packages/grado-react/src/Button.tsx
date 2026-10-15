import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { buttonClass, cx, type ButtonVariant, type Size } from '@1k5-tech-es/grado/classes'
import { Spinner } from './Spinner.js'
import type { IconComponent } from './types.js'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: Size
  /** Icono delante del texto. */
  icon?: IconComponent
  /** Botón cuadrado solo con icono. Ponle aria-label. */
  iconOnly?: boolean
  /** Ocupa todo el ancho. */
  block?: boolean
  /** Muestra un spinner y desactiva el botón. */
  loading?: boolean
}

/** Para enlaces o el Link del router, usa buttonClass() de @1k5-tech-es/grado/classes. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, icon: Icon, iconOnly, block, loading = false, disabled, type = 'button', className, children, ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={cx(buttonClass({ variant, size, iconOnly, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <Spinner size="sm" decorative /> : Icon ? <Icon aria-hidden="true" /> : null}
      {children}
    </button>
  )
})
