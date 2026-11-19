import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { buttonClass, cx, keyShortcuts, type ButtonVariant, type Size } from '@1k5-tech-es/grado/classes'
import { Spinner } from './Spinner.js'
import { ShortcutKeys } from './ShortcutKeys.js'
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
  /**
   * Atajo de teclado que activa la acción: ['C'], ['⌘', '↵']. Se pinta dentro del botón (no en los de
   * solo icono: ahí va en el Tooltip) y se anuncia con aria-keyshortcuts. La app escucha la tecla.
   */
  shortcut?: string[]
}

/** Para enlaces o el Link del router, usa buttonClass() de @1k5-tech-es/grado/classes. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, icon: Icon, iconOnly, block, loading = false, shortcut, disabled, type = 'button', className, children, ...rest },
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
      aria-keyshortcuts={rest['aria-keyshortcuts'] ?? (shortcut?.length ? keyShortcuts(shortcut) : undefined)}
    >
      {loading ? <Spinner size="sm" decorative /> : Icon ? <Icon aria-hidden="true" /> : null}
      {children}
      {shortcut?.length && !iconOnly ? <ShortcutKeys keys={shortcut} className="k5-btn__shortcut" /> : null}
    </button>
  )
})
