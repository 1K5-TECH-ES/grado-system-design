'use client'
import { forwardRef, useImperativeHandle, useState, type InputHTMLAttributes } from 'react'
import { cx, type Size } from '@1k5/grado/classes'
import {
  formatIban,
  formatPhone,
  ibanError,
  nifError,
  normalizeIban,
  normalizeNif,
  parsePhone,
  phoneCountryOf,
  phoneError,
  PHONE_COUNTRIES,
  significantCount,
  toE164,
  type PhoneCountryCode,
} from '@1k5/grado/patterns'
import { Input, useField } from './Field.js'
import { useGrado } from './Locale.js'
import { useAutoId, useValue } from './hooks.js'
import { useCaret, useCheck } from './field-check.js'

type CodeAttributes = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'value' | 'defaultValue' | 'onChange' | 'type'>

interface CheckedProps {
  size?: Size
  invalid?: boolean
  /** El error de validación, o '' si el valor vale (o está vacío). */
  onErrorChange?: (message: string) => void
}

const ErrorText = ({ id, message }: { id: string; message: string }) =>
  message ? (
    <p className="k5-field__error" id={id} role="alert">
      {message}
    </p>
  ) : null

// ---------- PhoneInput ----------

export interface PhoneInputProps extends CodeAttributes, CheckedProps {
  /** Número en E.164: «+34612345678», o '' si está vacío. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  country?: PhoneCountryCode
  /** Por defecto, el del número inicial o ES. */
  defaultCountry?: PhoneCountryCode
  onCountryChange?: (country: PhoneCountryCode) => void
  /** Países del selector, en orden. Por defecto: ES, PT, FR, DE, IT y GB. */
  countries?: PhoneCountryCode[]
  /** Nombre del selector de país. Por defecto, «Prefijo del país». */
  countryLabel?: string
}

/**
 * Teléfono con prefijo de país. Agrupa las cifras al escribir («612 345 678») y devuelve el
 * número en E.164 («+34612345678»). Si se pega «+351…», cambia el país.
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  {
    value,
    defaultValue = '',
    onValueChange,
    country,
    defaultCountry,
    onCountryChange,
    countries,
    countryLabel,
    size,
    invalid,
    onErrorChange,
    placeholder,
    id,
    className,
    disabled,
    onBlur,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const { messages: m } = useGrado()
  const field = useField()
  const inputId = useAutoId('k5-phone', id ?? field?.id),
    checkId = `${inputId}-check`
  const [current, setCurrent] = useValue(value, defaultValue, onValueChange)
  const [code, setCode] = useValue<PhoneCountryCode>(
    country,
    defaultCountry ?? phoneCountryOf(defaultValue || value) ?? 'ES',
    onCountryChange,
  )
  const [draft, setDraft] = useState<string | null>(null)
  const caret = useCaret()
  const element = caret.input
  useImperativeHandle(ref, () => element.current as HTMLInputElement, [element])
  const list = PHONE_COUNTRIES.filter((item) => !countries || countries.includes(item.code))
  const text = draft ?? formatPhone(current, code)
  const check = useCheck(phoneError(text, code, m), Boolean(current), onErrorChange)
  const update = (next: string) => {
    if (next !== current) setCurrent(next)
  }
  const changeCountry = (next: PhoneCountryCode) => {
    const digits = parsePhone(text, code).digits
    if (next !== code) setCode(next)
    update(toE164(digits, next))
    if (draft !== null) setDraft(formatPhone(digits, next))
  }
  return (
    <div className={cx('k5-phone-input', className)}>
      <Input
        {...rest}
        ref={caret.input}
        id={inputId}
        type="tel"
        size={size}
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={placeholder ?? list.find((item) => item.code === code)?.example}
        aria-describedby={cx(describedBy, check.message && checkId) || undefined}
        invalid={check.message ? true : invalid}
        disabled={disabled}
        value={text}
        prefix={
          <select
            className="k5-phone-input__country"
            aria-label={countryLabel ?? m.phoneCountry}
            value={code}
            disabled={disabled}
            onChange={(event) => changeCountry(event.target.value as PhoneCountryCode)}
          >
            {list.map((item) => (
              <option key={item.code} value={item.code}>
                {`${item.code} ${item.dial}`}
              </option>
            ))}
          </select>
        }
        onChange={(event) => {
          const typed = event.target.value
          const parsed = parsePhone(typed, code)
          const known = list.some((item) => item.code === parsed.country)
          const target = known ? parsed.country : code
          if (target !== code) setCode(target)
          const formatted = formatPhone(parsed.digits, target)
          // Con un prefijo pegado («+34 …») el cursor va al final; si no, detrás de la misma cifra.
          const international = /^\s*(\+|00)/.test(typed) && parsed.country !== code
          caret.place(formatted, international ? formatted.length : significantCount(typed, event.target.selectionStart ?? typed.length))
          setDraft(formatted)
          update(toE164(parsed.digits, target))
        }}
        onBlur={(event) => {
          setDraft(null)
          check.touch()
          onBlur?.(event)
        }}
      />
      <ErrorText id={checkId} message={check.message} />
    </div>
  )
})

// ---------- NifInput ----------

export interface NifInputProps extends CodeAttributes, CheckedProps {
  /** DNI, NIE o CIF en mayúsculas, sin espacios ni guiones: «12345678Z». */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

/** DNI, NIE o CIF. Lo pasa a mayúsculas sin espacios ni guiones y comprueba la letra o el dígito de control. */
export const NifInput = forwardRef<HTMLInputElement, NifInputProps>(function NifInput(
  {
    value,
    defaultValue = '',
    onValueChange,
    size,
    invalid,
    onErrorChange,
    id,
    className,
    onBlur,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const { messages: m } = useGrado()
  const field = useField()
  const inputId = useAutoId('k5-nif', id ?? field?.id),
    checkId = `${inputId}-check`
  const [current, setCurrent] = useValue(value, defaultValue, onValueChange)
  const caret = useCaret()
  const element = caret.input
  useImperativeHandle(ref, () => element.current as HTMLInputElement, [element])
  const check = useCheck(nifError(current, m), Boolean(current), onErrorChange)
  return (
    <div className={cx('k5-nif-input', className)}>
      <Input
        {...rest}
        ref={caret.input}
        id={inputId}
        size={size}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck="false"
        aria-describedby={cx(describedBy, check.message && checkId) || undefined}
        invalid={check.message ? true : invalid}
        value={current}
        onChange={(event) => {
          const typed = event.target.value
          const next = normalizeNif(typed)
          caret.place(next, significantCount(typed, event.target.selectionStart ?? typed.length))
          if (next !== current) setCurrent(next)
        }}
        onBlur={(event) => {
          check.touch()
          onBlur?.(event)
        }}
      />
      <ErrorText id={checkId} message={check.message} />
    </div>
  )
})

// ---------- IbanInput ----------

export interface IbanInputProps extends CodeAttributes, CheckedProps {
  /** IBAN sin espacios: «ES9121000418450200051332». */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

/** IBAN agrupado de cuatro en cuatro al escribir. Comprueba la longitud del país y el control módulo 97. */
export const IbanInput = forwardRef<HTMLInputElement, IbanInputProps>(function IbanInput(
  {
    value,
    defaultValue = '',
    onValueChange,
    size,
    invalid,
    onErrorChange,
    id,
    className,
    onBlur,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const { messages: m } = useGrado()
  const field = useField()
  const inputId = useAutoId('k5-iban', id ?? field?.id),
    checkId = `${inputId}-check`
  const [current, setCurrent] = useValue(value, defaultValue, onValueChange)
  const caret = useCaret()
  const element = caret.input
  useImperativeHandle(ref, () => element.current as HTMLInputElement, [element])
  const check = useCheck(ibanError(current, m), Boolean(current), onErrorChange)
  return (
    <div className={cx('k5-iban-input', className)}>
      <Input
        {...rest}
        ref={caret.input}
        id={inputId}
        size={size}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck="false"
        aria-describedby={cx(describedBy, check.message && checkId) || undefined}
        invalid={check.message ? true : invalid}
        value={formatIban(current)}
        onChange={(event) => {
          const typed = event.target.value
          const next = normalizeIban(typed)
          caret.place(formatIban(next), significantCount(typed, event.target.selectionStart ?? typed.length))
          if (next !== current) setCurrent(next)
        }}
        onBlur={(event) => {
          check.touch()
          onBlur?.(event)
        }}
      />
      <ErrorText id={checkId} message={check.message} />
    </div>
  )
})
