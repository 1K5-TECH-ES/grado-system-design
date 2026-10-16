'use client'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { filterOptions, type ChoiceOption } from '@1k5-tech-es/grado/patterns'
import { comboboxReduce, comboboxState, comboboxView, type ComboboxEvent } from '@1k5-tech-es/grado/core'
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
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
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
  },
  ref,
) {
  const { messages: m } = useGrado(),
    placeholder = placeholderProp ?? m.searchPlaceholder
  const [selected, select] = useValue(value, defaultValue, onValueChange),
    [state, setState] = useState(comboboxState)
  const field = useField(),
    controlId = useAutoId('k5-combobox', id ?? field?.id)
  const input = useRef<HTMLInputElement>(null),
    root = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => input.current as HTMLInputElement, [])
  const filtered = useMemo(() => filterOptions(options, state.query), [options, state.query])
  const view = comboboxView(state, { options, filtered, selected, id: controlId, placeholder })
  const { open, active } = state
  const activeOption = view.activeOption
  useEffect(() => {
    if (open && activeOption) document.getElementById(`${controlId}-option-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open, controlId, activeOption])
  // Cada evento pasa por el núcleo común (@1k5-tech-es/grado/core), igual que en Vue y en grado-elements.
  const send = (event: ComboboxEvent, dom?: { preventDefault(): void; stopPropagation(): void }) => {
    const result = comboboxReduce(state, event, { filtered, loading })
    if (result.preventDefault) dom?.preventDefault()
    if (result.stopPropagation) dom?.stopPropagation()
    setState(result.state)
    if (result.query !== undefined) onQueryChange?.(result.query)
    if (result.select !== undefined) select(result.select)
    if (result.focusInput) input.current?.focus()
  }
  return (
    <div
      ref={root}
      className={cx('k5-combobox', className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) send({ type: 'leave' })
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
        aria-controls={open ? view.listId : undefined}
        aria-activedescendant={view.activeDescendant}
        aria-busy={loading || undefined}
        autoComplete="off"
        placeholder={view.inputPlaceholder}
        disabled={disabled}
        required={required}
        value={view.inputValue}
        onFocus={() => send({ type: 'focus' })}
        onClick={() => send({ type: 'click' })}
        onChange={(event) => send({ type: 'input', value: event.target.value })}
        onKeyDown={(event) => send({ type: 'key', key: event.key }, event)}
      />
      {open && (
        <ul className="k5-combobox__list" id={view.listId} role="listbox" aria-label={label ?? m.options}>
          {loading || !filtered.length ? (
            <li role="presentation" className="k5-combobox__empty">
              {loading ? m.loadingEllipsis : (emptyLabel ?? m.noResults)}
            </li>
          ) : (
            filtered.map((option, index) => (
              <li
                role="option"
                id={view.optionId(index)}
                key={option.value}
                aria-selected={option.value === selected}
                aria-disabled={option.disabled || undefined}
                data-active={index === active}
                className="k5-combobox__option"
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => send({ type: 'hover', index })}
                onClick={() => send({ type: 'pick', option })}
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
})
