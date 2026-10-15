'use client'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cx, iconButtonClass, type IconButtonVariant, type Size } from '@1k5/grado/classes'
import { useValue } from './hooks.js'
import type { IconComponent } from './types.js'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label' | 'aria-pressed'> {
  icon: IconComponent
  /** Nombre del botón: aria-label y title. Obligatorio, porque no hay texto visible. */
  label: string
  variant?: IconButtonVariant
  size?: Size
  /** Botón conmutador: aria-pressed y estado visual. Sin pressed ni defaultPressed es un botón normal. */
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

/** Botón de solo icono con nombre obligatorio. Con pressed, botón conmutador. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, label, variant = 'ghost', size, pressed, defaultPressed, onPressedChange, type = 'button', className, onClick, ...rest },
  ref,
) {
  const toggle = pressed !== undefined || defaultPressed !== undefined
  const [on, setOn] = useValue(pressed, defaultPressed ?? false, onPressedChange)
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={cx(iconButtonClass({ variant, size }), className)}
      aria-label={label}
      title={label}
      aria-pressed={toggle ? on : undefined}
      onClick={(event) => {
        onClick?.(event)
        if (toggle && !event.defaultPrevented) setOn(!on)
      }}
    >
      <Icon aria-hidden="true" />
    </button>
  )
})
