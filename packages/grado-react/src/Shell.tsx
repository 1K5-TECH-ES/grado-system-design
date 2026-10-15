'use client'
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ElementType,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { ICON_PATHS, LOGO, SIDEBAR_ID, appShellClass, cx } from '@1k5-tech-es/grado/classes'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import type { IconComponent } from './types.js'

const ShellContext = createContext({ collapsed: false })

const present = (node: ReactNode) => node != null && node !== false && node !== ''
const autoId = (prefix: string, id: string) => `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`

export function AppLogo({ label = '1KOMMA5°', className }: { label?: string; className?: string }) {
  return (
    <svg className={cx('k5-logo', className)} viewBox={LOGO.viewBox} role="img" aria-label={label}>
      {LOGO.letters.map((d) => (
        <path key={d} fill="currentColor" d={d} />
      ))}
      <path className="k5-logo__ring" d={LOGO.ring} />
    </svg>
  )
}

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Nombre de la app junto al logo: «Sales Coach». */
  product?: ReactNode
  /** Sustituye a logo + producto, por ejemplo para envolverlos en un Link a la portada. */
  brand?: ReactNode
  /** Centro de la cabecera, normalmente <AppSearch>. */
  search?: ReactNode
  /** Derecha de la cabecera: avisos, menú de usuario… */
  actions?: ReactNode
  /** Aviso de toda la aplicación bajo la cabecera, normalmente <Banner>. */
  banner?: ReactNode
  /** Navegación lateral, normalmente <Nav>. Sin ella no hay barra lateral. */
  sidebar?: ReactNode
  /** Pie de la barra lateral: plegar, ajustes… */
  sidebarFooter?: ReactNode
  /** Barra lateral solo con iconos (escritorio). */
  collapsed?: boolean
  /** id del <main>, destino del enlace «Saltar al contenido». */
  mainId?: string
  skipLabel?: string
  menuLabel?: string
}

export function AppShell({
  product,
  brand,
  search,
  actions,
  banner,
  sidebar,
  sidebarFooter,
  collapsed = false,
  mainId = 'contenido',
  skipLabel,
  menuLabel,
  className,
  children,
  ...rest
}: AppShellProps) {
  const { messages: m } = useGrado()
  const [navOpen, setNavOpen] = useState(false)
  const menuRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!navOpen) return
    sidebarRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setNavOpen(false)
      menuRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [navOpen])

  const closeOnLink = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('a')) setNavOpen(false)
  }
  const brandContent = present(brand) ? (
    brand
  ) : (
    <>
      <AppLogo />
      {present(product) ? <span className="k5-app__product">{product}</span> : null}
    </>
  )
  const hasSidebar = present(sidebar)

  return (
    <ShellContext.Provider value={{ collapsed }}>
      <div {...rest} className={cx(appShellClass({ collapsed, navOpen }), className)}>
        <a className="k5-app__skip" href={`#${mainId}`}>
          {skipLabel ?? m.skipToContent}
        </a>
        <header className="k5-app__header">
          {hasSidebar ? (
            <button
              ref={menuRef}
              type="button"
              className="k5-btn k5-btn--ghost k5-btn--icon k5-app__menu"
              aria-label={menuLabel ?? m.menu}
              aria-expanded={navOpen}
              aria-controls={SIDEBAR_ID}
              onClick={() => setNavOpen((open) => !open)}
            >
              <PathIcon paths={ICON_PATHS.menu} />
            </button>
          ) : null}
          <div className="k5-app__brand">{brandContent}</div>
          {present(search) ? <div className="k5-app__search">{search}</div> : null}
          {present(actions) ? <div className="k5-app__actions">{actions}</div> : null}
        </header>
        {present(banner) ? <div className="k5-app__banner">{banner}</div> : null}
        {hasSidebar ? (
          <aside ref={sidebarRef} id={SIDEBAR_ID} className="k5-app__sidebar" onClick={closeOnLink}>
            <div className="k5-app__sidebar-brand">{brandContent}</div>
            <div className="k5-app__nav">{sidebar}</div>
            {present(sidebarFooter) ? <div className="k5-app__sidebar-footer">{sidebarFooter}</div> : null}
          </aside>
        ) : null}
        {hasSidebar ? <div className="k5-app__backdrop" aria-hidden="true" onClick={() => setNavOpen(false)} /> : null}
        <main id={mainId} tabIndex={-1} className="k5-app__main">
          {children}
        </main>
      </div>
    </ShellContext.Provider>
  )
}

export interface AppSearchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Texto del botón y nombre accesible: «Buscar clientes o tickets». */
  label?: string
  /** Atajo de teclado que se muestra: «⌘K». */
  shortcut?: string
}

/** Botón que abre la búsqueda o la paleta de comandos de la app. */
export function AppSearch({ label: labelProp, shortcut, className, ...rest }: AppSearchProps) {
  const { messages: m } = useGrado()
  const label = labelProp ?? m.search
  return (
    <button type="button" aria-label={label} {...rest} className={cx('k5-app-search', className)}>
      <PathIcon paths={ICON_PATHS.search} />
      <span className="k5-app-search__label">{label}</span>
      {shortcut ? <kbd className="k5-app-search__kbd">{shortcut}</kbd> : null}
    </button>
  )
}

export interface NavProps extends HTMLAttributes<HTMLElement> {
  /** Nombre para lectores de pantalla. */
  label?: string
}

export function Nav({ label, className, ...rest }: NavProps) {
  const { messages: m } = useGrado()
  return <nav {...rest} aria-label={label ?? m.mainNavigation} className={cx('k5-nav', className)} />
}

export interface NavSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
}

export function NavSection({ title, className, children, ...rest }: NavSectionProps) {
  return (
    <div {...rest} className={cx('k5-nav__section', className)}>
      {present(title) ? <p className="k5-nav__title">{title}</p> : null}
      {children}
    </div>
  )
}

interface NavItemOwnProps<C extends ElementType> {
  /** Componente del enlace: NavLink o Link de react-router. Por defecto <a>. */
  as?: C
  label: string
  icon?: IconComponent
  /** Contador a la derecha: tickets sin leer… */
  badge?: ReactNode
  /** Fuerza el estado activo (aria-current="page"). NavLink ya lo pone solo. */
  active?: boolean
  className?: string
}

export type NavItemProps<C extends ElementType = 'a'> = NavItemOwnProps<C> &
  Omit<ComponentPropsWithoutRef<C>, keyof NavItemOwnProps<C> | 'children'>

export function NavItem<C extends ElementType = 'a'>({ as, label, icon: Icon, badge, active, className, ...rest }: NavItemProps<C>) {
  const { collapsed } = useContext(ShellContext)
  const Tag: ElementType = as ?? 'a'
  return (
    <Tag
      {...rest}
      {...(active ? { 'aria-current': 'page' } : {})}
      {...(collapsed ? { title: label } : {})}
      className={cx('k5-nav-item', className)}
    >
      {Icon ? <Icon aria-hidden="true" /> : null}
      <span className="k5-nav-item__label">{label}</span>
      {present(badge) ? <span className="k5-nav-item__badge">{badge}</span> : null}
    </Tag>
  )
}

export interface NavGroupProps {
  label: string
  icon?: IconComponent
  badge?: ReactNode
  /** Marca el grupo cuando la página actual está dentro. */
  active?: boolean
  defaultOpen?: boolean
  /** Abierto o cerrado desde fuera; úsalo con onOpenChange. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  /** Subelementos: NavItem. */
  children?: ReactNode
}

export function NavGroup({
  label,
  icon: Icon,
  badge,
  active,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  className,
  children,
}: NavGroupProps) {
  const { collapsed } = useContext(ShellContext)
  const [inner, setInner] = useState(defaultOpen)
  const open = openProp ?? inner
  const id = autoId('k5-group', useId())
  const toggle = () => {
    if (openProp === undefined) setInner(!open)
    onOpenChange?.(!open)
  }
  return (
    <div className={cx('k5-nav-group', className)}>
      <button
        type="button"
        className="k5-nav-item"
        aria-expanded={open}
        aria-controls={id}
        data-active={active ? 'true' : undefined}
        onClick={toggle}
        {...(collapsed ? { title: label } : {})}
      >
        {Icon ? <Icon aria-hidden="true" /> : null}
        <span className="k5-nav-item__label">{label}</span>
        {present(badge) ? <span className="k5-nav-item__badge">{badge}</span> : null}
        <PathIcon paths={ICON_PATHS.chevronRight} className="k5-nav-group__chevron" />
      </button>
      <div className="k5-nav-group__items" id={id} hidden={!open}>
        {children}
      </div>
    </div>
  )
}
