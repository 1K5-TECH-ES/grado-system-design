'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cx, ICON_PATHS, STATUS_ICONS } from '@1k5/grado/classes'
import { type StatusTone } from '@1k5/grado/patterns'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

const closeIcon = <PathIcon paths={ICON_PATHS.x} />

export interface AlertProps {
  title: ReactNode
  children?: ReactNode
  tone?: StatusTone
  action?: ReactNode
  onDismiss?: () => void
  dismissLabel?: string
  className?: string
  role?: 'status' | 'alert' | 'none'
}
export function Alert({ title, children, tone = 'info', action, onDismiss, dismissLabel, className, role = 'status' }: AlertProps) {
  const { messages: m } = useGrado()
  return (
    <div className={cx('k5-alert', `k5-alert--${tone}`, className)} role={role === 'none' ? undefined : role}>
      <PathIcon paths={ICON_PATHS[STATUS_ICONS[tone] ?? 'info']} className="k5-alert__icon" />
      <div className="k5-alert__content">
        <strong className="k5-alert__title">{title}</strong>
        {children && <div className="k5-alert__description">{children}</div>}
        {action && <div className="k5-alert__action">{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" className="k5-close" aria-label={dismissLabel ?? m.dismiss} onClick={onDismiss}>
          {closeIcon}
        </button>
      )}
    </div>
  )
}
export interface ToastProps extends Omit<AlertProps, 'onDismiss'> {
  open: boolean
  onOpenChange: (open: boolean) => void
  duration?: number
}
export function Toast({ open, onOpenChange, duration = 5000, className, ...props }: ToastProps) {
  const [paused, setPaused] = useState(false),
    remaining = useRef(duration),
    started = useRef(0)
  const change = useRef(onOpenChange)
  change.current = onOpenChange
  useEffect(() => {
    remaining.current = duration
  }, [open, duration])
  useEffect(() => {
    if (!open || paused || duration <= 0) return
    started.current = Date.now()
    const timer = setTimeout(() => change.current(false), Math.max(0, remaining.current))
    return () => {
      clearTimeout(timer)
      remaining.current -= Date.now() - started.current
    }
  }, [open, paused, duration])
  if (!open) return null
  return (
    <div
      className={cx('k5-toast', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        if (!document.activeElement || !document.activeElement.closest('.k5-toast')) setPaused(false)
      }}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onOpenChange(false)
      }}
    >
      <Alert {...props} onDismiss={() => onOpenChange(false)} />
    </div>
  )
}
