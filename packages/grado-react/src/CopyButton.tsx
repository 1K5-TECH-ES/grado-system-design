'use client'
import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type MouseEvent } from 'react'
import { copyButtonClass, cx, DATA_ICON_PATHS, ICON_PATHS, type Size } from '@1k5-tech-es/grado/classes'
import { copyText } from '@1k5-tech-es/grado/patterns'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

export interface CopyButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'onCopy' | 'children' | 'type'> {
  /** Texto que se copia. */
  value: string
  /** Texto del botón (o su nombre con iconOnly). Por defecto, «Copiar». */
  label?: string
  /** Texto durante 2 s después de copiar. Por defecto, «Copiado». */
  copiedLabel?: string
  /** Solo el icono; label pasa a ser su nombre accesible. */
  iconOnly?: boolean
  size?: Size
  /** Se llama con el valor cuando se ha copiado. */
  onCopy?: (value: string) => void
}

type CopyState = 'idle' | 'copied' | 'failed'

/** Copia un texto al portapapeles y lo anuncia a los lectores de pantalla. */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  { value, label, copiedLabel, iconOnly = false, size, onCopy, onClick, className, ...rest },
  ref,
) {
  const { messages: m } = useGrado()
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const name = label ?? m.copy,
    done = copiedLabel ?? m.copied,
    copied = state === 'copied'
  const copy = async (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    const ok = await copyText(value)
    setState(ok ? 'copied' : 'failed')
    if (ok) onCopy?.(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 2000)
  }
  return (
    <span className={cx('k5-copy', className)}>
      <button
        ref={ref}
        {...rest}
        type="button"
        className={copyButtonClass({ size, iconOnly, copied })}
        onClick={copy}
        {...(iconOnly ? { 'aria-label': name, title: name } : {})}
      >
        <PathIcon paths={copied ? ICON_PATHS.check : DATA_ICON_PATHS.copy} />
        {iconOnly ? null : copied ? done : name}
      </button>
      <span className="k5-sr-only" role="status">
        {copied ? done : state === 'failed' ? m.copyFailed : ''}
      </span>
    </span>
  )
})
