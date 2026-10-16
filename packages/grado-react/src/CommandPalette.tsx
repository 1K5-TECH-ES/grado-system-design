'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { filterGroups, isShortcut, lockScroll, nextIndex, type CommandGroup, type CommandItem } from '@1k5-tech-es/grado/patterns'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { useAutoId, useValue } from './hooks.js'

export interface CommandPaletteProps {
  groups: CommandGroup[]
  /** Recibe el id del elemento elegido. La paleta se cierra sola. */
  onSelect?: (id: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Texto de búsqueda, para pedir resultados al servidor. */
  onQueryChange?: (query: string) => void
  /** Nombre accesible. */
  label?: string
  placeholder?: string
  emptyLabel?: string
  /** Tecla que, con Ctrl o ⌘, abre y cierra la paleta. false la desactiva. */
  hotkey?: string | false
  className?: string
}

/**
 * Buscador de acciones y registros sobre un <dialog> modal. Ábrela desde AppSearch o con
 * Ctrl/⌘ + K. Flechas para moverse, Enter para elegir y Escape para cerrar.
 */
export function CommandPalette({
  groups,
  onSelect,
  open,
  defaultOpen = false,
  onOpenChange,
  onQueryChange,
  label,
  placeholder,
  emptyLabel,
  hotkey = 'k',
  className,
}: CommandPaletteProps) {
  const { messages: m } = useGrado()
  const [visible, setVisible] = useValue(open, defaultOpen, onOpenChange)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const id = useAutoId('k5-command')
  const { filtered, items, enabled } = useMemo(() => {
    const filtered = filterGroups(groups, query)
    const items: CommandItem[] = filtered.flatMap((group) => group.items)
    return { filtered, items, enabled: items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0) }
  }, [groups, query])
  const name = label ?? m.commandPalette

  // El atajo lee el estado actual sin volver a registrar el listener en cada render.
  const toggle = useRef(() => {})
  toggle.current = () => setVisible(!visible)
  useEffect(() => {
    if (!hotkey) return
    const onKey = (event: KeyboardEvent) => {
      if (!isShortcut(event, hotkey)) return
      event.preventDefault()
      toggle.current()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [hotkey])

  useEffect(() => {
    const node = dialog.current
    if (!node || !visible) return
    const previous = node.ownerDocument.activeElement as HTMLElement | null
    setQuery('')
    node.showModal()
    input.current?.focus()
    const unlock = lockScroll(node.ownerDocument)
    return () => {
      node.close()
      unlock()
      if (previous?.isConnected) previous.focus()
    }
  }, [visible])

  useEffect(() => {
    setActive(enabled[0] ?? -1)
    // Solo al cambiar la búsqueda o al abrir: no al mover el ratón.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, visible])
  useEffect(() => {
    if (visible && active >= 0) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, visible, id])

  const choose = (item: CommandItem | undefined) => {
    if (!item || item.disabled) return
    setVisible(false)
    onSelect?.(item.id)
  }
  let index = -1
  return (
    <dialog
      ref={dialog}
      className={cx('k5-dialog k5-command', className)}
      aria-label={name}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault()
        setVisible(false)
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)
          setVisible(false)
      }}
    >
      <div className="k5-command__search">
        <PathIcon paths={ICON_PATHS.search} />
        <input
          ref={input}
          className="k5-command__input"
          role="combobox"
          aria-label={name}
          aria-expanded="true"
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 && items[active] ? `${id}-option-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder ?? m.commandPlaceholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            onQueryChange?.(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              choose(items[active])
              return
            }
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
            event.preventDefault()
            const next = nextIndex(event.key, enabled.indexOf(active), enabled.length)
            if (next !== null) setActive(enabled[next])
          }}
        />
        <kbd className="k5-command__kbd">Esc</kbd>
      </div>
      <div className="k5-command__list">
        <div role="listbox" id={`${id}-list`} aria-label={name}>
          {filtered.map((group, g) => (
            <div key={group.label} role="group" aria-labelledby={`${id}-group-${g}`} className="k5-command__group">
              <p className="k5-command__group-title" id={`${id}-group-${g}`}>
                {group.label}
              </p>
              {group.items.map((item) => {
                const i = ++index
                return (
                  <div
                    key={item.id}
                    role="option"
                    id={`${id}-option-${i}`}
                    aria-selected={i === active}
                    aria-disabled={item.disabled || undefined}
                    data-active={i === active}
                    className="k5-command__item"
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseMove={() => {
                      if (!item.disabled && i !== active) setActive(i)
                    }}
                    onClick={() => choose(item)}
                  >
                    <span className="k5-command__label">{item.label}</span>
                    {item.description ? <span className="k5-command__description">{item.description}</span> : null}
                    {item.shortcut ? <kbd className="k5-command__shortcut">{item.shortcut}</kbd> : null}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        {items.length ? null : (
          <p className="k5-command__empty" role="status">
            {emptyLabel ?? m.noResults}
          </p>
        )}
      </div>
    </dialog>
  )
}
