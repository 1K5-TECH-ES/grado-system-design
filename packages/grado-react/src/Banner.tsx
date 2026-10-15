'use client'
import { type ReactNode } from 'react'
import { bannerClass, cx, ICON_PATHS, STATUS_ICONS, type BannerTone } from '@1k5-tech-es/grado/classes'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { present } from './hooks.js'

export interface BannerProps {
  title: ReactNode
  /** Texto del aviso, en la misma línea que el título. */
  children?: ReactNode
  tone?: BannerTone
  /** Acción a la derecha: un Button link o secondary. */
  action?: ReactNode
  /** Con él aparece el botón de cerrar. */
  onDismiss?: () => void
  dismissLabel?: string
  /** status por defecto; alert por defecto en danger. */
  role?: 'status' | 'alert' | 'none'
  className?: string
}

/** Aviso para toda la aplicación, de borde a borde. En AppShell va en la prop banner. */
export function Banner({ title, children, tone = 'info', action, onDismiss, dismissLabel, role, className }: BannerProps) {
  const { messages: m } = useGrado()
  const live = role ?? (tone === 'danger' ? 'alert' : 'status')
  return (
    <div className={cx(bannerClass({ tone }), className)} role={live === 'none' ? undefined : live}>
      <PathIcon paths={ICON_PATHS[tone === 'brand' ? 'info' : STATUS_ICONS[tone]]} className="k5-banner__icon" />
      <div className="k5-banner__content">
        <strong className="k5-banner__title">{title}</strong>
        {present(children) && <span className="k5-banner__text">{children}</span>}
      </div>
      {present(action) && <div className="k5-banner__action">{action}</div>}
      {onDismiss && (
        <button type="button" className="k5-close" aria-label={dismissLabel ?? m.dismiss} onClick={onDismiss}>
          <PathIcon paths={ICON_PATHS.x} />
        </button>
      )}
    </div>
  )
}
