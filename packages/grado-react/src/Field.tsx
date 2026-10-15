'use client'
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { controlClass, cx, inputWrapClass, type Size } from '@1k5-tech-es/grado/classes'

interface FieldContextValue {
  id: string
  describedBy?: string
  invalid: boolean
  required: boolean
}

const FieldContext = createContext<FieldContextValue | null>(null)

/** Datos del Field que envuelve a un control, por si haces un control propio. */
export function useField() {
  return useContext(FieldContext)
}

const present = (node: ReactNode) => node != null && node !== false && node !== ''

export interface FieldProps {
  label?: ReactNode
  hint?: ReactNode
  /** Si hay error, el control se marca con aria-invalid. */
  error?: ReactNode
  required?: boolean
  /** id del control. Si no se pasa, se genera. */
  id?: string
  className?: string
  children: ReactNode
}

export function Field({ label, hint, error, required = false, id, className, children }: FieldProps) {
  const auto = useId()
  const controlId = id ?? `k5-${auto.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const hintId = present(hint) ? `${controlId}-hint` : undefined
  const errorId = present(error) ? `${controlId}-error` : undefined
  const value = { id: controlId, describedBy: cx(hintId, errorId) || undefined, invalid: Boolean(errorId), required }
  return (
    <FieldContext.Provider value={value}>
      <div className={cx('k5-field', className)}>
        {present(label) ? (
          <label className="k5-field__label" htmlFor={controlId}>
            {label}
            {required ? (
              <span className="k5-field__required" aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
        ) : null}
        {children}
        {hintId ? (
          <p className="k5-field__hint" id={hintId}>
            {hint}
          </p>
        ) : null}
        {errorId ? (
          <p className="k5-field__error" id={errorId}>
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  )
}

interface ControlOwnProps {
  id?: string
  required?: boolean
  invalid?: boolean
  'aria-describedby'?: string
}

/** Atributos que un control recibe de su Field. Uso interno de Grado. */
export function useControl({ id, required, invalid, 'aria-describedby': describedBy }: ControlOwnProps) {
  const field = useField()
  return {
    id: id ?? field?.id,
    required: required ?? (field?.required || undefined),
    'aria-invalid': (invalid ?? field?.invalid) ? true : undefined,
    'aria-describedby': cx(describedBy, field?.describedBy) || undefined,
  }
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: Size
  /** Texto o icono delante: €. */
  prefix?: ReactNode
  /** Texto detrás: kWp, kWh, %. */
  suffix?: ReactNode
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size, prefix, suffix, invalid, id, required, 'aria-describedby': describedBy, className, ...rest },
  ref,
) {
  const control = useControl({ id, required, invalid, 'aria-describedby': describedBy })
  const affixed = present(prefix) || present(suffix)
  const input = <input {...rest} {...control} ref={ref} className={cx(controlClass('input', { size: affixed ? 'md' : size }), className)} />
  if (!affixed) return input
  return (
    <div className={inputWrapClass({ size })}>
      {present(prefix) ? <span className="k5-input-wrap__affix">{prefix}</span> : null}
      {input}
      {present(suffix) ? <span className="k5-input-wrap__affix">{suffix}</span> : null}
    </div>
  )
})

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, id, required, 'aria-describedby': describedBy, className, ...rest },
  ref,
) {
  const control = useControl({ id, required, invalid, 'aria-describedby': describedBy })
  return <textarea {...rest} {...control} ref={ref} className={cx(controlClass('textarea'), className)} />
})

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: Size
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size, invalid, id, required, 'aria-describedby': describedBy, className, children, ...rest },
  ref,
) {
  const control = useControl({ id, required, invalid, 'aria-describedby': describedBy })
  return (
    <select {...rest} {...control} ref={ref} className={cx(controlClass('select', { size }), className)}>
      {children}
    </select>
  )
})
