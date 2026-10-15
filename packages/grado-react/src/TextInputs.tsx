'use client'
import { forwardRef, useImperativeHandle, useRef, useState, type InputHTMLAttributes } from 'react'
import { cx, FIELD_ICON_PATHS, ICON_PATHS, type Size } from '@1k5-tech-es/grado/classes'
import { Input, useField } from './Field.js'
import { PathIcon } from './PathIcon.js'
import { Spinner } from './Spinner.js'
import { useGrado } from './Locale.js'
import { useAutoId, useValue } from './hooks.js'

type TextFieldAttributes = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'value' | 'defaultValue' | 'onChange' | 'type'>

// ---------- SearchInput ----------

export interface SearchInputProps extends TextFieldAttributes {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Después de borrar con el botón o con Escape. */
  onClear?: () => void
  /** Spinner en lugar de la lupa mientras llegan los resultados. */
  loading?: boolean
  size?: Size
  /** Nombre accesible si no hay Field con etiqueta. Por defecto, «Buscar». */
  label?: string
  /** Texto del botón de borrar. Por defecto, «Borrar búsqueda». */
  clearLabel?: string
  invalid?: boolean
}

/**
 * Búsqueda con lupa delante y botón para borrar cuando hay texto. Escape también borra
 * (y no cierra el diálogo que la contiene mientras quede texto).
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    value,
    defaultValue = '',
    onValueChange,
    onClear,
    loading = false,
    size,
    label,
    clearLabel,
    placeholder,
    id,
    className,
    disabled,
    readOnly,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const { messages: m } = useGrado()
  const field = useField()
  const inputId = useAutoId('k5-search', id ?? field?.id)
  const [text, setText] = useValue(value, defaultValue, onValueChange)
  const input = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => input.current as HTMLInputElement, [])
  const clear = () => {
    setText('')
    onClear?.()
    input.current?.focus()
  }
  const editable = !disabled && !readOnly
  return (
    <div className={cx('k5-search-input', className)}>
      <Input
        {...rest}
        ref={input}
        id={inputId}
        type="search"
        size={size}
        aria-label={label ?? (field ? undefined : m.search)}
        aria-busy={loading || undefined}
        placeholder={placeholder ?? m.searchPlaceholder}
        disabled={disabled}
        readOnly={readOnly}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || event.key !== 'Escape' || !text || !editable) return
          event.preventDefault()
          event.stopPropagation()
          clear()
        }}
        prefix={loading ? <Spinner size="sm" decorative /> : <PathIcon paths={ICON_PATHS.search} className="k5-search-input__icon" />}
        suffix={
          text && editable ? (
            <button
              type="button"
              className="k5-input-action"
              aria-label={clearLabel ?? m.clearSearch}
              aria-controls={inputId}
              onClick={clear}
            >
              <PathIcon paths={ICON_PATHS.x} />
            </button>
          ) : null
        }
      />
    </div>
  )
})

// ---------- PasswordInput ----------

export interface PasswordInputProps extends TextFieldAttributes {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** current-password para entrar; new-password al crearla o cambiarla. */
  autoComplete?: string
  size?: Size
  invalid?: boolean
  /** Nombre del botón (no cambia al pulsarlo: aria-pressed dice si se ve). Por defecto, «Mostrar contraseña». */
  showLabel?: string
  /** Pista visible al pasar el ratón con la contraseña a la vista. Por defecto, «Ocultar contraseña». */
  hideLabel?: string
}

/** Contraseña con un botón para mostrarla u ocultarla. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  {
    value,
    defaultValue = '',
    onValueChange,
    autoComplete = 'current-password',
    size,
    showLabel,
    hideLabel,
    id,
    className,
    disabled,
    ...rest
  },
  ref,
) {
  const { messages: m } = useGrado()
  const field = useField()
  const inputId = useAutoId('k5-password', id ?? field?.id)
  const [text, setText] = useValue(value, defaultValue, onValueChange)
  const [visible, setVisible] = useState(false)
  const show = showLabel ?? m.showPassword
  return (
    <div className={cx('k5-password-input', className)}>
      <Input
        {...rest}
        ref={ref}
        id={inputId}
        type={visible ? 'text' : 'password'}
        size={size}
        autoComplete={autoComplete}
        autoCapitalize="off"
        spellCheck="false"
        disabled={disabled}
        value={text}
        onChange={(event) => setText(event.target.value)}
        suffix={
          <button
            type="button"
            className="k5-input-action"
            aria-label={show}
            aria-pressed={visible ? 'true' : 'false'}
            aria-controls={inputId}
            title={visible ? (hideLabel ?? m.hidePassword) : show}
            disabled={disabled}
            onClick={() => setVisible(!visible)}
          >
            <PathIcon paths={visible ? FIELD_ICON_PATHS.eyeOff : FIELD_ICON_PATHS.eye} />
          </button>
        }
      />
    </div>
  )
})
