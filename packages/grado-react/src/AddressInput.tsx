'use client'
import { useEffect, useRef, useState } from 'react'
import { cx, FIELD_ICON_PATHS, ICON_PATHS, type Size } from '@1k5/grado/classes'
import { formatMessage } from '@1k5/grado/messages'
import { nextIndex, type AddressOption } from '@1k5/grado/patterns'
import { Input, useField } from './Field.js'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { useAutoId, useValue } from './hooks.js'

export interface AddressInputProps {
  /** Busca direcciones con tu proveedor (Google Places, CartoCiudad, Catastro…). */
  suggest: (query: string) => Promise<AddressOption[]>
  /** Letras a partir de las que se busca. */
  minChars?: number
  /** Milisegundos de espera tras la última tecla. */
  debounce?: number
  /** La dirección elegida, o null. */
  value?: AddressOption | null
  defaultValue?: AddressOption | null
  onValueChange?: (value: AddressOption | null) => void
  /** Texto escrito, por si quieres guardarlo aunque no se elija ninguna sugerencia. */
  onQueryChange?: (query: string) => void
  placeholder?: string
  /** Nombre accesible si no hay Field con etiqueta. */
  label?: string
  /** Texto cuando no hay sugerencias. Por defecto, «No hay resultados». */
  emptyLabel?: string
  size?: Size
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  /** Envía el id de la dirección elegida en un campo oculto. */
  name?: string
  id?: string
  className?: string
}

/**
 * Dirección con autocompletado asíncrono, sin proveedor incluido: pasa tu función suggest.
 * Espera a que se dejen de pulsar teclas y descarta las respuestas que llegan tarde.
 */
export function AddressInput({
  suggest,
  minChars = 3,
  debounce = 250,
  value,
  defaultValue = null,
  onValueChange,
  onQueryChange,
  placeholder,
  label,
  emptyLabel,
  size,
  disabled,
  required,
  invalid,
  name,
  id,
  className,
}: AddressInputProps) {
  const { messages: m } = useGrado()
  const field = useField()
  const inputId = useAutoId('k5-address', id ?? field?.id),
    listId = `${inputId}-list`
  const [current, setCurrent] = useValue<AddressOption | null>(value, defaultValue, onValueChange)
  // Texto que se escribe; null muestra la dirección elegida.
  const [query, setQuery] = useState<string | null>(null)
  const [options, setOptions] = useState<AddressOption[]>([])
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const input = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  // Cada búsqueda lleva un número; solo se atiende la respuesta de la última.
  const ticket = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${inputId}-option-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open, inputId])

  const search = (text: string) => {
    clearTimeout(timer.current)
    const mine = ++ticket.current
    const needle = text.trim()
    setActive(-1)
    setFailed(false)
    if (needle.length < minChars) {
      setOptions([])
      setLoading(false)
      return
    }
    setLoading(true)
    timer.current = setTimeout(() => {
      Promise.resolve()
        .then(() => suggest(needle))
        .then(
          (found) => {
            if (mine !== ticket.current) return
            setOptions(found)
            setLoading(false)
          },
          () => {
            if (mine !== ticket.current) return
            setOptions([])
            setFailed(true)
            setLoading(false)
          },
        )
    }, debounce)
  }
  const close = () => {
    setOpen(false)
    setQuery(null)
    setActive(-1)
  }
  const pick = (option: AddressOption) => {
    setCurrent(option)
    ticket.current++
    clearTimeout(timer.current)
    setLoading(false)
    close()
    input.current?.focus()
  }
  const typed = query ?? ''
  const short = typed.trim().length < minChars
  const status = loading
    ? m.loadingEllipsis
    : short
      ? formatMessage(m.addressMinChars, { count: minChars })
      : failed
        ? m.addressFailed
        : !options.length
          ? (emptyLabel ?? m.noResults)
          : ''
  const activeOption = status ? undefined : options[active]

  return (
    <div
      className={cx('k5-address-input', className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close()
      }}
    >
      <Input
        ref={input}
        id={inputId}
        size={size}
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && activeOption ? `${inputId}-option-${active}` : undefined}
        aria-busy={loading || undefined}
        autoComplete="off"
        placeholder={placeholder ?? m.addressPlaceholder}
        disabled={disabled}
        required={required}
        invalid={invalid}
        value={query ?? current?.label ?? ''}
        prefix={<PathIcon paths={FIELD_ICON_PATHS.mapPin} className="k5-address-input__icon" />}
        onChange={(event) => {
          const text = event.target.value
          setQuery(text)
          setOpen(true)
          onQueryChange?.(text)
          if (!text && current) setCurrent(null)
          search(text)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            if (!open && query === null) return
            event.preventDefault()
            event.stopPropagation()
            close()
            return
          }
          if (event.key === 'Enter' && open) {
            event.preventDefault()
            if (activeOption) pick(activeOption)
            return
          }
          if (['ArrowDown', 'ArrowUp'].includes(event.key) || (open && ['Home', 'End'].includes(event.key))) {
            event.preventDefault()
            if (!open) {
              setOpen(true)
              if (query === null) {
                setQuery(current?.label ?? '')
                search(current?.label ?? '')
                return
              }
            }
            const next = status ? null : nextIndex(event.key, active, options.length)
            setActive(next ?? -1)
          }
        }}
      />
      {open ? (
        <ul className="k5-combobox__list" id={listId} role="listbox" aria-label={label ?? m.addressOptions} tabIndex={-1}>
          {status ? (
            <li role="presentation" className="k5-combobox__empty">
              {status}
            </li>
          ) : (
            options.map((option, index) => (
              <li
                role="option"
                id={`${inputId}-option-${index}`}
                key={option.id}
                aria-selected={option.id === current?.id}
                data-active={index === active}
                className="k5-combobox__option k5-address-input__option"
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => setActive(index)}
                onClick={() => pick(option)}
              >
                <span className="k5-address-input__text">
                  <span>{option.label}</span>
                  {option.description ? <span className="k5-address-input__description">{option.description}</span> : null}
                </span>
                <PathIcon paths={ICON_PATHS.check} className="k5-combobox__check" />
              </li>
            ))
          )}
        </ul>
      ) : null}
      {name ? <input type="hidden" name={name} value={current?.id ?? ''} disabled={disabled} /> : null}
    </div>
  )
}
