'use client'
import type { HTMLAttributes } from 'react'
import { avatarClass, cx, initials, type AvatarStatus, type Size } from '@1k5/grado/classes'
import { useGrado } from './Locale.js'

const STATUS_KEYS = { online: 'statusOnline', away: 'statusAway', busy: 'statusBusy' } as const

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Nombre completo: da las iniciales y el texto para lectores de pantalla. */
  name?: string
  /** Iniciales a mano, si no quieres que se calculen. */
  initials?: string
  /** Foto. Si no carga, se ven las iniciales. */
  src?: string
  size?: Size
  status?: AvatarStatus
}

export function Avatar({ name, initials: given, src, size, status, className, ...rest }: AvatarProps) {
  const { messages: m } = useGrado()
  const spoken = name ? [name, status && m[STATUS_KEYS[status]]].filter(Boolean).join(' · ') : undefined
  const a11y = spoken ? { role: 'img', 'aria-label': spoken, title: name } : { 'aria-hidden': true as const }
  return (
    <span {...rest} {...a11y} className={cx(avatarClass({ size }), className)}>
      {given ?? initials(name)}
      {src ? (
        <img
          className="k5-avatar__image"
          src={src}
          alt=""
          onError={(event) => {
            event.currentTarget.hidden = true
          }}
        />
      ) : null}
      {status ? <span className={`k5-avatar__status k5-avatar__status--${status}`} /> : null}
    </span>
  )
}
