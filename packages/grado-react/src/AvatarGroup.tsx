'use client'
import type { HTMLAttributes } from 'react'
import { avatarClass, avatarGroupClass, cx, type Size } from '@1k5/grado/classes'
import { formatMessage } from '@1k5/grado/messages'
import { splitAvatars, type AvatarItem } from '@1k5/grado/patterns'
import { Avatar } from './Avatar.js'
import { useGrado } from './Locale.js'

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  items: AvatarItem[]
  /** Avatares visibles; el resto va en un círculo «+N». */
  max?: number
  size?: Size
}

/** Avatares solapados de un equipo. */
export function AvatarGroup({ items, max = 4, size, className, ...rest }: AvatarGroupProps) {
  const { messages: m } = useGrado()
  const { shown, rest: hidden } = splitAvatars(items, max)
  return (
    <div {...rest} className={cx(avatarGroupClass({ size }), className)}>
      {shown.map((item, index) => (
        <Avatar key={`${item.name}-${index}`} name={item.name} src={item.src} size={size} />
      ))}
      {hidden.length ? (
        <span className={cx(avatarClass({ size }), 'k5-avatar-group__more')} title={hidden.map((item) => item.name).join(', ')}>
          <span aria-hidden="true">{`+${hidden.length}`}</span>
          <span className="k5-sr-only">{formatMessage(m.avatarMore, { count: hidden.length })}</span>
        </span>
      ) : null}
    </div>
  )
}
