'use client'
import { useState, type KeyboardEvent } from 'react'
import { cx, toggleGroupClass, type Size } from '@1k5-tech-es/grado/classes'
import { nextIndex, toggleValues } from '@1k5-tech-es/grado/patterns'
import { useValue } from './hooks.js'
import type { IconComponent } from './types.js'

export interface ToggleOption {
  value: string
  label: string
  icon?: IconComponent
  disabled?: boolean
}

interface ToggleGroupBase {
  options: ToggleOption[]
  /** Nombre del grupo para lectores de pantalla: «Formato del texto». */
  label: string
  size?: Size
  /** Solo iconos: las etiquetas pasan a aria-label y title. */
  iconOnly?: boolean
  disabled?: boolean
  className?: string
}
interface ToggleGroupSingle extends ToggleGroupBase {
  /** single: una opción o ninguna (pulsar la activa la desactiva). */
  type?: 'single'
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}
interface ToggleGroupMultiple extends ToggleGroupBase {
  /** multiple: cualquier combinación. */
  type: 'multiple'
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}
export type ToggleGroupProps = ToggleGroupSingle | ToggleGroupMultiple

const asList = (value: string | string[] | undefined) =>
  value === undefined ? undefined : Array.isArray(value) ? value : value ? [value] : []

/** Botones conmutables que se combinan: formato de texto, filtros rápidos. Un solo punto de Tab. */
export function ToggleGroup(props: ToggleGroupProps) {
  const { options, label, size, iconOnly = false, disabled = false, className } = props
  const multiple = props.type === 'multiple'
  const change = props.onValueChange as ((value: string | string[]) => void) | undefined
  const [list, setList] = useValue(asList(props.value), asList(props.defaultValue) ?? [], (next) =>
    change?.(multiple ? next : (next[0] ?? '')),
  )
  const [focused, setFocused] = useState<string | null>(null)
  const enabled = options.filter((option) => !option.disabled && !disabled)
  const focusable =
    enabled.find((option) => option.value === focused)?.value ??
    enabled.find((option) => list.includes(option.value))?.value ??
    enabled[0]?.value
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
    const next = nextIndex(event.key, buttons.indexOf(document.activeElement as HTMLButtonElement), buttons.length)
    if (next === null) return
    event.preventDefault()
    buttons[next].focus()
  }
  return (
    <div role="group" aria-label={label} className={cx(toggleGroupClass({ size, iconOnly }), className)} onKeyDown={onKey}>
      {options.map(({ value, label: text, icon: Icon, disabled: off }) => (
        <button
          key={value}
          type="button"
          className="k5-toggle-group__item"
          aria-pressed={list.includes(value)}
          aria-label={iconOnly ? text : undefined}
          title={iconOnly ? text : undefined}
          tabIndex={value === focusable ? 0 : -1}
          disabled={disabled || off}
          onFocus={() => setFocused(value)}
          onClick={() =>
            setList(
              toggleValues(
                list,
                value,
                multiple ? 'multiple' : 'single',
                options.map((option) => option.value),
              ),
            )
          }
        >
          {Icon ? <Icon aria-hidden="true" /> : null}
          {iconOnly ? null : <span>{text}</span>}
        </button>
      ))}
    </div>
  )
}
