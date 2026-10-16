'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { filterOptions, type ChoiceOption } from '@1k5-tech-es/grado/patterns'
import { Input, useField } from './Field.js'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { useAutoId, useValue } from './hooks.js'

export interface ComboboxProps {
  options: ChoiceOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onQueryChange?: (query: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  loading?: boolean
  emptyLabel?: string
  name?: string
  id?: string
  className?: string
}
export function Combobox({
  options,
  value,
  defaultValue = '',
  onValueChange,
  onQueryChange,
  label,
  placeholder: placeholderProp,
  disabled,
  required,
  loading,
  emptyLabel,
  name,
  id,
  className,
}: ComboboxProps) {
  const { messages: m } = useGrado(),
    placeholder = placeholderProp ?? m.searchPlaceholder
  const [selected, select] = useValue(value, defaultValue, onValueChange),
    [open, setOpen] = useState(false),
    [query, setQuery] = useState(''),
    [active, setActive] = useState(-1)
  const field = useField(),
    controlId = useAutoId('k5-combobox', id ?? field?.id),
    listId = `${controlId}-list`
  const input = useRef<HTMLInputElement>(null),
    root = useRef<HTMLDivElement>(null)
  const filtered = useMemo(() => filterOptions(options, query), [options, query]),
    chosen = options.find((option) => option.value === selected)
  const activeOption = filtered[active]
  useEffect(() => {
    if (open && activeOption) document.getElementById(`${controlId}-option-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open, controlId, activeOption])
  const pick = (option: ChoiceOption) => {
    if (option.disabled) return
    select(option.value)
    setQuery('')
    setOpen(false)
    input.current?.focus()
  }
  return (
    <div
      ref={root}
      className={cx('k5-combobox', className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
          setQuery('')
          setActive(-1)
        }
      }}
    >
      {name && <input type="hidden" name={name} value={selected} disabled={disabled} />}
      <Input
        ref={input}
        id={controlId}
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && activeOption && !activeOption.disabled ? `${controlId}-option-${active}` : undefined}
        aria-busy={loading || undefined}
        autoComplete="off"
        placeholder={open ? (chosen?.label ?? placeholder) : placeholder}
        disabled={disabled}
        required={required}
        value={open ? query : (chosen?.label ?? '')}
        onFocus={() => {
          setOpen(true)
          setActive(-1)
        }}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value)
          onQueryChange?.(event.target.value)
          setActive(-1)
          setOpen(true)
          if (!event.target.value) select('')
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            setOpen(false)
            setQuery('')
            return
          }
          if (event.key === 'Enter' && open) {
            event.preventDefault()
            if (!loading && activeOption) pick(activeOption)
            return
          }
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            if (!open && ['Home', 'End'].includes(event.key)) return
            event.preventDefault()
            setOpen(true)
            const enabled = filtered.map((option, i) => (option.disabled ? -1 : i)).filter((i) => i >= 0)
            const position = enabled.indexOf(active)
            setActive(
              event.key === 'Home'
                ? (enabled[0] ?? -1)
                : event.key === 'End'
                  ? (enabled[enabled.length - 1] ?? -1)
                  : (enabled[
                      position < 0
                        ? event.key === 'ArrowDown'
                          ? 0
                          : enabled.length - 1
                        : (position + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length
                    ] ?? -1),
            )
          }
        }}
      />
      {open && (
        <ul className="k5-combobox__list" id={listId} role="listbox" aria-label={label ?? m.options}>
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
                aria-selected={option.value === selected}
                aria-disabled={option.disabled || undefined}
                data-active={index === active}
                className="k5-combobox__option"
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => {
                  if (!option.disabled) setActive(index)
                }}
                onClick={() => pick(option)}
              >
                <span>{option.label}</span>
                <PathIcon paths={ICON_PATHS.check} className="k5-combobox__check" />
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
