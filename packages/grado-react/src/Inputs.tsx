'use client'
import { forwardRef, useEffect, useMemo, useRef, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
import { cx, ICON_PATHS, type Size } from '@1k5-tech-es/grado/classes'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import {
  clampNumber,
  decimalsOf,
  filterOptions,
  formatNumber,
  nextIndex,
  parseNumber,
  stepNumber,
  type ChoiceOption,
} from '@1k5-tech-es/grado/patterns'
import { useControl, useField } from './Field.js'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { present, useAutoId, useValue } from './hooks.js'

// ---------- NumberInput ----------

export interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'prefix' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step'
> {
  /** Número o null si está vacío. */
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  /** Lo que suman las flechas y los botones. Con Mayúsculas, diez veces más. */
  step?: number
  /** Cifras decimales que se muestran. Por defecto, las del paso: 0.1 → 1. */
  decimals?: number
  /** Formato de los números. Por defecto, el de GradoProvider (es-ES). */
  locale?: string
  /** Texto delante: €. */
  prefix?: ReactNode
  /** Unidad detrás: kWp, kWh, %. */
  suffix?: ReactNode
  size?: Size
  invalid?: boolean
  /** Sin botones de menos y más. */
  hideSteppers?: boolean
  decrementLabel?: string
  incrementLabel?: string
}

/**
 * Campo numérico que entiende la coma decimal («8,4») y devuelve un número (8.4).
 * Flechas: un paso. Re Pág / Av Pág: diez. Inicio y Fin: mínimo y máximo.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value,
    defaultValue = null,
    onValueChange,
    min,
    max,
    step = 1,
    decimals,
    locale: localeProp,
    prefix,
    suffix,
    size,
    invalid,
    hideSteppers = false,
    decrementLabel,
    incrementLabel,
    id,
    name,
    required,
    disabled,
    readOnly,
    className,
    onBlur,
    onKeyDown,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const { messages: m, locale: contextLocale } = useGrado()
  const locale = localeProp ?? contextLocale
  const digits = decimals ?? decimalsOf(step)
  const field = useField()
  const inputId = useAutoId('k5-number', id ?? field?.id)
  const control = useControl({ id: inputId, required, invalid, 'aria-describedby': describedBy })
  const [current, setCurrent] = useValue<number | null>(value, defaultValue, onValueChange)
  // Mientras se escribe se respeta el texto tal cual; al salir se formatea.
  const [draft, setDraft] = useState<string | null>(null)
  const formatted = formatNumber(current, locale, digits)
  const round = (n: number) => Math.round(n * 10 ** digits) / 10 ** digits
  const update = (next: number | null) => {
    if (next !== current) setCurrent(next)
  }
  const stepBy = (times: number) => {
    setDraft(null)
    update(stepNumber(current, step, times, min, max))
  }
  const locked = disabled || readOnly
  return (
    <div className={cx('k5-number', size && size !== 'md' && `k5-number--${size}`, className)}>
      {hideSteppers ? null : (
        <button
          type="button"
          className="k5-number__step"
          tabIndex={-1}
          aria-label={decrementLabel ?? m.decrease}
          aria-controls={inputId}
          disabled={locked || (min != null && current != null && current <= min)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => stepBy(-1)}
        >
          <PathIcon paths={ICON_PATHS.minus} />
        </button>
      )}
      {present(prefix) ? <span className="k5-number__affix k5-number__affix--prefix">{prefix}</span> : null}
      <input
        {...rest}
        {...control}
        ref={ref}
        type="text"
        role="spinbutton"
        inputMode="decimal"
        autoComplete="off"
        className="k5-number__input"
        aria-valuenow={current ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={current == null ? undefined : typeof suffix === 'string' ? `${formatted} ${suffix}` : formatted}
        disabled={disabled}
        readOnly={readOnly}
        value={draft ?? formatted}
        onChange={(event) => {
          const text = event.target.value
          setDraft(text)
          const parsed = parseNumber(text, locale)
          if (parsed === null) update(null)
          else if (!Number.isNaN(parsed)) update(round(parsed))
        }}
        onBlur={(event) => {
          if (draft !== null) {
            const parsed = parseNumber(draft, locale)
            if (parsed !== null && !Number.isNaN(parsed)) update(clampNumber(round(parsed), min, max))
            setDraft(null)
          }
          onBlur?.(event)
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || locked) return
          const big = event.shiftKey ? 10 : 1
          // Inicio y Fin solo saltan si hay mínimo o máximo; si no, mueven el cursor del texto.
          const moves: Record<string, () => void> = {
            ArrowUp: () => stepBy(big),
            ArrowDown: () => stepBy(-big),
            PageUp: () => stepBy(10),
            PageDown: () => stepBy(-10),
            ...(min != null ? { Home: () => update(min) } : {}),
            ...(max != null ? { End: () => update(max) } : {}),
          }
          if (moves[event.key]) {
            event.preventDefault()
            setDraft(null)
            moves[event.key]()
          }
        }}
      />
      {present(suffix) ? <span className="k5-number__affix">{suffix}</span> : null}
      {hideSteppers ? null : (
        <button
          type="button"
          className="k5-number__step"
          tabIndex={-1}
          aria-label={incrementLabel ?? m.increase}
          aria-controls={inputId}
          disabled={locked || (max != null && current != null && current >= max)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => stepBy(1)}
        >
          <PathIcon paths={ICON_PATHS.plus} />
        </button>
      )}
      {name ? <input type="hidden" name={name} value={current ?? ''} disabled={disabled} /> : null}
    </div>
  )
})

// ---------- SegmentedControl ----------

export interface SegmentedControlProps {
  options: ChoiceOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Nombre del grupo para lectores de pantalla: «Periodo». */
  label: string
  size?: Size
  /** Ocupa todo el ancho, con las opciones repartidas. */
  block?: boolean
  disabled?: boolean
  /** Envía el valor elegido con el formulario. */
  name?: string
  className?: string
}

/** Una opción entre pocas (de dos a cinco) que cambia la vista al momento. */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  size,
  block = false,
  disabled = false,
  name,
  className,
}: SegmentedControlProps) {
  const first = options.find((option) => !option.disabled)?.value ?? ''
  const [selected, select] = useValue(value, defaultValue ?? first, onValueChange)
  const focusable = options.some((option) => option.value === selected && !option.disabled) ? selected : first
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const radios = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')]
    const next = nextIndex(event.key, radios.indexOf(document.activeElement as HTMLButtonElement), radios.length)
    if (next === null) return
    event.preventDefault()
    radios[next].focus()
    select(radios[next].dataset.value ?? '')
  }
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cx('k5-segmented', size && size !== 'md' && `k5-segmented--${size}`, block && 'k5-segmented--block', className)}
      onKeyDown={onKey}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          className="k5-segmented__option"
          data-value={option.value}
          aria-checked={option.value === selected}
          tabIndex={option.value === focusable ? 0 : -1}
          disabled={disabled || option.disabled}
          onClick={() => select(option.value)}
        >
          {option.label}
        </button>
      ))}
      {name ? <input type="hidden" name={name} value={selected} disabled={disabled} /> : null}
    </div>
  )
}

// ---------- MultiSelect ----------

export interface MultiSelectProps {
  options: ChoiceOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Texto de búsqueda, para cargar opciones del servidor. */
  onQueryChange?: (query: string) => void
  /** Nombre accesible si no hay Field con etiqueta. */
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  loading?: boolean
  emptyLabel?: string
  /** Envía un campo `name` por cada valor elegido. */
  name?: string
  id?: string
  className?: string
}

/**
 * Varias opciones con búsqueda. Enter marca o desmarca; la lista sigue abierta.
 * Retroceso con el buscador vacío quita la última opción elegida.
 */
export function MultiSelect({
  options,
  value,
  defaultValue = [],
  onValueChange,
  onQueryChange,
  label,
  placeholder,
  disabled,
  required,
  loading,
  emptyLabel,
  name,
  id,
  className,
}: MultiSelectProps) {
  const { messages: m } = useGrado()
  const [selected, select] = useValue(value, defaultValue, onValueChange)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(-1)
  const field = useField()
  const controlId = useAutoId('k5-multi', id ?? field?.id)
  const listId = `${controlId}-list`
  const input = useRef<HTMLInputElement>(null)
  const filtered = useMemo(() => filterOptions(options, query), [options, query])
  const chosen = selected.map((v) => options.find((option) => option.value === v) ?? { value: v, label: v })
  const activeOption = filtered[active]
  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${controlId}-option-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open, controlId])
  const toggle = (option: ChoiceOption) => {
    if (option.disabled || disabled) return
    select(selected.includes(option.value) ? selected.filter((v) => v !== option.value) : [...selected, option.value])
    setQuery('')
    onQueryChange?.('')
  }
  const remove = (v: string) => {
    select(selected.filter((item) => item !== v))
    input.current?.focus()
  }
  const close = () => {
    setOpen(false)
    setQuery('')
    setActive(-1)
  }
  return (
    <div
      className={cx('k5-multi-select', className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close()
      }}
    >
      <div
        className="k5-multi-select__control"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            event.preventDefault()
            input.current?.focus()
          }
        }}
      >
        {chosen.map((option) => (
          <span className="k5-chip" key={option.value}>
            {option.label}
            <button
              type="button"
              className="k5-chip__remove"
              aria-label={formatMessage(m.removeItem, { label: option.label })}
              disabled={disabled}
              onClick={() => remove(option.value)}
            >
              <PathIcon paths={ICON_PATHS.x} />
            </button>
          </span>
        ))}
        <input
          ref={input}
          id={controlId}
          className="k5-multi-select__input"
          role="combobox"
          aria-label={label}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && activeOption && !activeOption.disabled ? `${controlId}-option-${active}` : undefined}
          aria-describedby={field?.describedBy}
          aria-invalid={field?.invalid || undefined}
          aria-busy={loading || undefined}
          required={(required ?? field?.required) && selected.length === 0 ? true : undefined}
          autoComplete="off"
          placeholder={selected.length ? undefined : (placeholder ?? m.searchPlaceholder)}
          disabled={disabled}
          value={query}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            onQueryChange?.(event.target.value)
            setActive(-1)
            setOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              if (open) {
                event.preventDefault()
                event.stopPropagation()
              }
              close()
              return
            }
            if (event.key === 'Backspace' && !query && selected.length) {
              select(selected.slice(0, -1))
              return
            }
            if (event.key === 'Enter' && open) {
              event.preventDefault()
              if (!loading && activeOption) toggle(activeOption)
              return
            }
            if (['ArrowDown', 'ArrowUp'].includes(event.key) || (open && ['Home', 'End'].includes(event.key))) {
              event.preventDefault()
              setOpen(true)
              const enabled = filtered.map((option, i) => (option.disabled ? -1 : i)).filter((i) => i >= 0)
              const next = nextIndex(event.key, enabled.indexOf(active), enabled.length)
              setActive(next === null ? -1 : enabled[next])
            }
          }}
        />
      </div>
      {open ? (
        <ul className="k5-combobox__list" id={listId} role="listbox" aria-multiselectable="true" aria-label={label ?? m.options}>
          {loading || !filtered.length ? (
            <li role="presentation" className="k5-combobox__empty">
              {loading ? m.loadingEllipsis : (emptyLabel ?? m.noResults)}
            </li>
          ) : (
            filtered.map((option, index) => (
              <li
                role="option"
                id={`${controlId}-option-${index}`}
                key={option.value}
                aria-selected={selected.includes(option.value)}
                aria-disabled={option.disabled || undefined}
                data-active={index === active}
                className="k5-combobox__option"
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => {
                  if (!option.disabled) setActive(index)
                }}
                onClick={() => toggle(option)}
              >
                <span>{option.label}</span>
                <PathIcon paths={ICON_PATHS.check} className="k5-combobox__check" />
              </li>
            ))
          )}
        </ul>
      ) : null}
      {name ? selected.map((v) => <input key={v} type="hidden" name={name} value={v} disabled={disabled} />) : null}
    </div>
  )
}
