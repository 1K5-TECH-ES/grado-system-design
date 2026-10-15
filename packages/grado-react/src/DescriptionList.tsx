'use client'
import type { HTMLAttributes, ReactNode } from 'react'
import { cx, descriptionListClass, type DescriptionLayout } from '@1k5-tech-es/grado/classes'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import type { DescriptionItem } from '@1k5-tech-es/grado/patterns'
import { CopyButton } from './CopyButton.js'
import { useGrado } from './Locale.js'

export interface DescriptionListItem extends Omit<DescriptionItem, 'description'> {
  description?: ReactNode
}

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  items: DescriptionListItem[]
  /** columns: dato y valor en dos columnas (una sola por debajo de 600 px). stacked: el dato encima. */
  layout?: DescriptionLayout
}

/** Pares dato–valor de una ficha de cliente o instalación, en un <dl>. */
export function DescriptionList({ items, layout, className, ...rest }: DescriptionListProps) {
  const { messages: m } = useGrado()
  return (
    <dl {...rest} className={cx(descriptionListClass({ layout }), className)}>
      {items.map((item, index) => (
        <div key={item.id ?? index} className="k5-dl__item">
          <dt className="k5-dl__term">{item.term}</dt>
          <dd className={cx('k5-dl__description', item.mono && 'k5-dl__description--mono')}>
            <span className="k5-dl__value">{item.description}</span>
            {item.copy != null ? <CopyButton value={item.copy} iconOnly label={formatMessage(m.copyNamed, { label: item.term })} /> : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}
