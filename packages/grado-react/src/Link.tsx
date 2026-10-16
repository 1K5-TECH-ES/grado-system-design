'use client'
import {
  forwardRef,
  type ForwardedRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import { cx, DATA_ICON_PATHS, linkClass, type LinkTone, type LinkUnderline } from '@1k5-tech-es/grado/classes'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

interface LinkOwnProps<C extends ElementType> {
  /** Componente del enlace: Link de react-router o de Next.js. Por defecto <a>. */
  as?: C
  /** Abre en otra pestaña (target _blank, rel noopener) y lo indica con icono y texto oculto. */
  external?: boolean
  tone?: LinkTone
  /** hover: subraya al pasar por encima. always: siempre; úsalo dentro de un párrafo. */
  underline?: LinkUnderline
  className?: string
  children?: ReactNode
}

export type LinkProps<C extends ElementType = 'a'> = LinkOwnProps<C> & Omit<ComponentPropsWithoutRef<C>, keyof LinkOwnProps<C>>

/** Enlace con el estilo del sistema. */
export const Link = forwardRef(function Link<C extends ElementType = 'a'>(
  { as, external, tone, underline, className, children, ...rest }: LinkProps<C>,
  ref: ForwardedRef<HTMLAnchorElement>,
) {
  const { messages: m } = useGrado()
  const Tag: ElementType = as ?? 'a'
  return (
    <Tag
      ref={ref}
      {...rest}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cx(linkClass({ tone, underline }), className)}
    >
      {children}
      {external ? <PathIcon paths={DATA_ICON_PATHS.externalLink} className="k5-link__icon" /> : null}
      {external ? <span className="k5-sr-only">{` ${m.opensInNewTab}`}</span> : null}
    </Tag>
  )
}) as <C extends ElementType = 'a'>(props: LinkProps<C> & { ref?: Ref<HTMLAnchorElement> }) => ReactElement | null
