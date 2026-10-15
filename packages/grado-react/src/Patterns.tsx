'use client'
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { cx, ICON_PATHS, STATUS_ICONS } from '@1k5/grado/classes'
import {
  filterOptions,
  fileError,
  lockScroll,
  moveFocus,
  overflowsSide,
  pageCount,
  pageItems,
  rangeError,
  type ChoiceOption,
  type MenuItem,
  type StatusTone,
  type UploadItem,
  type DateRangeValue,
  type BreadcrumbItem,
  type StepItem,
  type TimelineItem,
  type FilterItem,
} from '@1k5/grado/patterns'
import { formatMessage } from '@1k5/grado/messages'
import { Button } from './Button.js'
import { Input, useField } from './Field.js'
import { PathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { useAutoId, useValue } from './hooks.js'

const closeIcon = <PathIcon paths={ICON_PATHS.x} />

export interface DialogProps {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  closeLabel?: string
  closeOnOutside?: boolean
  className?: string
}
function Modal({
  title,
  description,
  children,
  footer,
  open,
  defaultOpen = false,
  onOpenChange,
  closeLabel,
  closeOnOutside = true,
  className,
  alert = false,
  side,
}: DialogProps & { alert?: boolean; side?: 'left' | 'right' }) {
  const { messages: m } = useGrado()
  const [visible, setVisible] = useValue(open, defaultOpen, onOpenChange)
  const ref = useRef<HTMLDialogElement>(null)
  const id = useAutoId('k5-dialog')
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !visible) return
    const previous = dialog.ownerDocument.activeElement as HTMLElement | null
    dialog.showModal()
    const unlock = lockScroll(dialog.ownerDocument)
    return () => {
      dialog.close()
      unlock()
      if (previous?.isConnected) previous.focus()
    }
  }, [visible])
  return (
    <dialog
      ref={ref}
      role={alert ? 'alertdialog' : undefined}
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      className={cx('k5-dialog', alert && 'k5-dialog--alert', side && 'k5-drawer', side === 'left' && 'k5-drawer--left', className)}
      onCancel={(event) => {
        event.preventDefault()
        setVisible(false)
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && closeOnOutside && !alert) {
          const rect = event.currentTarget.getBoundingClientRect()
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)
            setVisible(false)
        }
      }}
    >
      <div className="k5-dialog__header">
        <div className="k5-dialog__heading">
          <h2 className="k5-dialog__title" id={`${id}-title`}>
            {title}
          </h2>
          {description && (
            <p className="k5-dialog__description" id={`${id}-description`}>
              {description}
            </p>
          )}
        </div>
        <button type="button" className="k5-close" aria-label={closeLabel ?? m.close} onClick={() => setVisible(false)}>
          {closeIcon}
        </button>
      </div>
      {children != null && children !== false && <div className="k5-dialog__body">{children}</div>}
      {footer && <div className="k5-dialog__footer">{footer}</div>}
    </dialog>
  )
}
export function Dialog(props: DialogProps) {
  return <Modal {...props} />
}
export function AlertDialog(props: DialogProps) {
  return <Modal {...props} alert />
}
export interface DrawerProps extends DialogProps {
  side?: 'left' | 'right'
}
export function Drawer({ side = 'right', ...props }: DrawerProps) {
  return <Modal {...props} side={side} />
}
export const Sheet = Drawer

export interface DropdownMenuProps {
  label: string
  items: MenuItem[]
  onAction?: (id: string) => void
  disabled?: boolean
  align?: 'start' | 'end'
  className?: string
}
export function DropdownMenu({ label, items, onAction, disabled, align = 'end', className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null),
    menu = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null)
  const first = useRef<'first' | 'last'>('first'),
    id = useAutoId('k5-menu')
  // Si el menú no cabe por el lado pedido (ventana o contenedor con scroll), se abre hacia el otro.
  const [flipped, setFlipped] = useState(false)
  useLayoutEffect(() => {
    if (!open) {
      setFlipped(false)
      return
    }
    if (menu.current && overflowsSide(menu.current, align === 'end' ? 'left' : 'right')) setFlipped(true)
  }, [open, align])
  useEffect(() => {
    if (!open) return
    const buttons = menu.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
    if (buttons?.length) buttons[first.current === 'last' ? buttons.length - 1 : 0].focus()
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])
  return (
    <div
      className={cx('k5-menu', className)}
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <Button
        ref={trigger}
        variant="secondary"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          first.current = 'first'
          setOpen(!open)
        }}
        onKeyDown={(event) => {
          if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault()
            first.current = event.key === 'ArrowUp' ? 'last' : 'first'
            setOpen(true)
          }
        }}
      >
        {label}
        <PathIcon paths={ICON_PATHS.chevronDown} className="k5-menu__chevron" />
      </Button>
      {open && (
        <div
          ref={menu}
          className={cx('k5-menu__content', (align === 'start') !== flipped && 'k5-menu__content--start')}
          role="menu"
          aria-label={label}
          id={id}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              setOpen(false)
              trigger.current?.focus()
            } else moveFocus(event, event.currentTarget, '[role="menuitem"]')
          }}
        >
          {items.map((item) => (
            <div role="none" key={item.id}>
              {item.separator && <div role="separator" className="k5-menu__separator" />}
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                disabled={item.disabled}
                className={cx('k5-menu__item', item.danger && 'k5-menu__item--danger')}
                onPointerMove={(event) => {
                  if (!item.disabled) event.currentTarget.focus()
                }}
                onClick={() => {
                  setOpen(false)
                  trigger.current?.focus()
                  onAction?.(item.id)
                }}
              >
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export interface TooltipProps {
  label: string
  content: ReactNode
  children?: ReactNode
  className?: string
}
export function Tooltip({ label, content, children = <PathIcon paths={ICON_PATHS.info} />, className }: TooltipProps) {
  const [open, setOpen] = useState(false),
    id = useAutoId('k5-tooltip')
  return (
    <span
      className={cx('k5-tooltip', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setOpen(false)
          event.stopPropagation()
        }
      }}
    >
      <Button variant="ghost" size="sm" iconOnly aria-label={label} aria-describedby={open ? id : undefined} onClick={() => setOpen(!open)}>
        {children}
      </Button>
      {open && (
        <span role="tooltip" id={id} className="k5-tooltip__content">
          {content}
        </span>
      )}
    </span>
  )
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: ReactNode
  description?: ReactNode
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean) => void
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate = false, onCheckedChange, className, onChange, id, ...props },
  ref,
) {
  const field = useField(),
    input = useRef<HTMLInputElement | null>(null),
    autoId = useAutoId('k5-checkbox', id ?? field?.id)
  useEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate
  }, [indeterminate])
  const control = (
    <input
      {...props}
      type="checkbox"
      id={autoId}
      ref={(node) => {
        input.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={cx('k5-checkbox', className)}
      aria-checked={indeterminate ? 'mixed' : undefined}
      aria-invalid={props['aria-invalid'] ?? (field?.invalid || undefined)}
      aria-describedby={cx(props['aria-describedby'], field?.describedBy, description && `${autoId}-description`) || undefined}
      required={props.required ?? field?.required}
      onChange={(event) => {
        onChange?.(event)
        onCheckedChange?.(event.target.checked)
      }}
    />
  )
  return label ? (
    <label className="k5-checkbox-field" htmlFor={autoId}>
      {control}
      <span className="k5-choice__text">
        <span>{label}</span>
        {description && (
          <span id={`${autoId}-description`} className="k5-choice__description">
            {description}
          </span>
        )}
      </span>
    </label>
  ) : (
    control
  )
})
export interface RadioGroupProps {
  label: string
  options: ChoiceOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  name?: string
  required?: boolean
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
  className?: string
}
export function RadioGroup({
  label,
  options,
  value,
  defaultValue = '',
  onValueChange,
  name,
  required,
  disabled,
  orientation = 'vertical',
  className,
}: RadioGroupProps) {
  const [selected, select] = useValue(value, defaultValue, onValueChange),
    id = useAutoId('k5-radio')
  return (
    <fieldset className={cx('k5-radio-group', orientation === 'horizontal' && 'k5-radio-group--horizontal', className)} disabled={disabled}>
      <legend>{label}</legend>
      <div className="k5-radio-group__options">
        {options.map((option, index) => (
          <label className="k5-radio-option" key={option.value}>
            <input
              type="radio"
              className="k5-radio"
              name={name ?? id}
              value={option.value}
              checked={selected === option.value}
              disabled={option.disabled}
              required={required}
              aria-describedby={option.description ? `${id}-${index}-description` : undefined}
              onChange={() => select(option.value)}
            />
            <span className="k5-choice__text">
              <span>{option.label}</span>
              {option.description && (
                <span id={`${id}-${index}-description`} className="k5-choice__description">
                  {option.description}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export interface ComboboxProps {
  options: ChoiceOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onQueryChange?: (query: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  loading?: boolean
  emptyLabel?: string
  name?: string
  id?: string
  className?: string
}
export function Combobox({
  options,
  value,
  defaultValue = '',
  onValueChange,
  onQueryChange,
  label,
  placeholder: placeholderProp,
  disabled,
  required,
  loading,
  emptyLabel,
  name,
  id,
  className,
}: ComboboxProps) {
  const { messages: m } = useGrado(),
    placeholder = placeholderProp ?? m.searchPlaceholder
  const [selected, select] = useValue(value, defaultValue, onValueChange),
    [open, setOpen] = useState(false),
    [query, setQuery] = useState(''),
    [active, setActive] = useState(-1)
  const field = useField(),
    controlId = useAutoId('k5-combobox', id ?? field?.id),
    listId = `${controlId}-list`
  const input = useRef<HTMLInputElement>(null),
    root = useRef<HTMLDivElement>(null)
  const filtered = filterOptions(options, query),
    chosen = options.find((option) => option.value === selected)
  const activeOption = filtered[active]
  useEffect(() => {
    if (open && activeOption) document.getElementById(`${controlId}-option-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, open, controlId, activeOption])
  const pick = (option: ChoiceOption) => {
    if (option.disabled) return
    select(option.value)
    setQuery('')
    setOpen(false)
    input.current?.focus()
  }
  return (
    <div
      ref={root}
      className={cx('k5-combobox', className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
          setQuery('')
          setActive(-1)
        }
      }}
    >
      {name && <input type="hidden" name={name} value={selected} disabled={disabled} />}
      <Input
        ref={input}
        id={controlId}
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && activeOption && !activeOption.disabled ? `${controlId}-option-${active}` : undefined}
        aria-busy={loading || undefined}
        autoComplete="off"
        placeholder={open ? (chosen?.label ?? placeholder) : placeholder}
        disabled={disabled}
        required={required}
        value={open ? query : (chosen?.label ?? '')}
        onFocus={() => {
          setOpen(true)
          setActive(-1)
        }}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value)
          onQueryChange?.(event.target.value)
          setActive(-1)
          setOpen(true)
          if (!event.target.value) select('')
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            setOpen(false)
            setQuery('')
            return
          }
          if (event.key === 'Enter' && open) {
            event.preventDefault()
            if (!loading && activeOption) pick(activeOption)
            return
          }
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            if (!open && ['Home', 'End'].includes(event.key)) return
            event.preventDefault()
            setOpen(true)
            const enabled = filtered.map((option, i) => (option.disabled ? -1 : i)).filter((i) => i >= 0)
            const position = enabled.indexOf(active)
            setActive(
              event.key === 'Home'
                ? (enabled[0] ?? -1)
                : event.key === 'End'
                  ? (enabled[enabled.length - 1] ?? -1)
                  : (enabled[
                      position < 0
                        ? event.key === 'ArrowDown'
                          ? 0
                          : enabled.length - 1
                        : (position + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length
                    ] ?? -1),
            )
          }
        }}
      />
      {open && (
        <ul className="k5-combobox__list" id={listId} role="listbox" aria-label={label ?? m.options}>
          {loading || !filtered.length ? (
            <li role="presentation" className="k5-combobox__empty">
              {loading ? m.loadingEllipsis : (emptyLabel ?? m.noResults)}
            </li>
          ) : (
            filtered.map((option, index) => (
              <li
                role="option"
                id={`${controlId}-option-${index}`}
                key={option.value}
                aria-selected={option.value === selected}
                aria-disabled={option.disabled || undefined}
                data-active={index === active}
                className="k5-combobox__option"
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => {
                  if (!option.disabled) setActive(index)
                }}
                onClick={() => pick(option)}
              >
                <span>{option.label}</span>
                <PathIcon paths={ICON_PATHS.check} className="k5-combobox__check" />
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

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
export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  circle?: boolean
}
export function Skeleton({ width = '100%', height = '1rem', circle = false, style, className, ...props }: SkeletonProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cx('k5-skeleton', circle && 'k5-skeleton--circle', className)}
      style={{ width, height, ...style }}
    />
  )
}

export interface TabItem {
  value: string
  label: string
  content: ReactNode
  disabled?: boolean
}
export interface TabsProps {
  items: TabItem[]
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  variant?: 'line' | 'pill'
  className?: string
}
export function Tabs({ items, label, value, defaultValue, onValueChange, variant = 'line', className }: TabsProps) {
  const [selected, select] = useValue(value, defaultValue ?? items.find((item) => !item.disabled)?.value ?? '', onValueChange),
    id = useAutoId('k5-tabs')
  const current = items.some((item) => item.value === selected && !item.disabled) ? selected : items.find((item) => !item.disabled)?.value
  return (
    <div className={cx('k5-tabs', variant === 'pill' && 'k5-tabs--pill', className)}>
      <div
        className="k5-tabs__list"
        role="tablist"
        aria-label={label}
        onKeyDown={(event) => moveFocus(event, event.currentTarget, '[role="tab"]', true)}
      >
        {items.map((item, i) => (
          <button
            type="button"
            key={item.value}
            id={`${id}-tab-${i}`}
            role="tab"
            className="k5-tabs__tab"
            tabIndex={item.value === current ? 0 : -1}
            disabled={item.disabled}
            aria-selected={item.value === current}
            aria-controls={`${id}-panel-${i}`}
            onClick={() => select(item.value)}
            onFocus={() => select(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, i) => (
        <div
          key={item.value}
          role="tabpanel"
          className="k5-tabs__panel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          tabIndex={0}
          hidden={item.value !== current}
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}

export interface PaginationProps {
  total: number
  pageSize?: number
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  label?: string
  className?: string
}
export function Pagination({ total, pageSize = 10, page, defaultPage = 1, onPageChange, label, className }: PaginationProps) {
  const { messages: m } = useGrado()
  const [selected, select] = useValue(page, defaultPage, onPageChange),
    count = pageCount(total, pageSize),
    current = Math.max(1, Math.min(count, selected))
  return (
    <nav className={cx('k5-pagination', className)} aria-label={label ?? m.pagination}>
      <span aria-live="polite">
        {total > 0
          ? formatMessage(m.pageRange, {
              from: (current - 1) * Math.max(1, pageSize) + 1,
              to: Math.min(total, current * Math.max(1, pageSize)),
              total,
            })
          : m.noResultsCount}
      </span>
      <div className="k5-pagination__controls">
        <button type="button" aria-label={m.previousPage} disabled={current === 1} onClick={() => select(current - 1)}>
          <PathIcon paths={ICON_PATHS.chevronLeft} />
        </button>
        {pageItems(current, count).map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`gap-${index}`} className="k5-pagination__ellipsis" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              type="button"
              key={item}
              aria-label={formatMessage(m.pageN, { page: item })}
              aria-current={item === current ? 'page' : undefined}
              onClick={() => select(item)}
            >
              {item}
            </button>
          ),
        )}
        <button type="button" aria-label={m.nextPage} disabled={current === count} onClick={() => select(current + 1)}>
          <PathIcon paths={ICON_PATHS.chevronRight} />
        </button>
      </div>
    </nav>
  )
}

export type DatePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  size?: 'sm' | 'md' | 'lg'
  onValueChange?: (value: string) => void
}
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker({ onValueChange, onChange, ...props }, ref) {
  return (
    <Input
      {...props}
      ref={ref}
      type="date"
      onChange={(event) => {
        onChange?.(event)
        onValueChange?.(event.target.value)
      }}
    />
  )
})
export interface DateRangePickerProps {
  label: string
  value?: DateRangeValue
  defaultValue?: DateRangeValue
  onValueChange?: (value: DateRangeValue) => void
  min?: string
  max?: string
  required?: boolean
  disabled?: boolean
  name?: string
  className?: string
}
export function DateRangePicker({
  label,
  value,
  defaultValue = { start: '', end: '' },
  onValueChange,
  min,
  max,
  required,
  disabled,
  name,
  className,
}: DateRangePickerProps) {
  const [range, select] = useValue(value, defaultValue, onValueChange),
    id = useAutoId('k5-range'),
    { messages: m } = useGrado(),
    error = rangeError(range.start, range.end, min, max, m)
  return (
    <fieldset className={cx('k5-date-range', className)} disabled={disabled}>
      <legend>{label}</legend>
      <div className="k5-date-range__fields">
        <label>
          {m.dateFrom}
          <DatePicker
            name={name ? `${name}[start]` : undefined}
            value={range.start}
            min={min}
            max={range.end && (!max || range.end < max) ? range.end : max}
            required={required}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={!!error || undefined}
            onValueChange={(start) => select({ ...range, start })}
          />
        </label>
        <label>
          {m.dateTo}
          <DatePicker
            name={name ? `${name}[end]` : undefined}
            value={range.end}
            min={range.start && (!min || range.start > min) ? range.start : min}
            max={max}
            required={required}
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={!!error || undefined}
            onValueChange={(end) => select({ ...range, end })}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="k5-field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </fieldset>
  )
}

export interface FileUploadProps {
  label?: string
  hint?: string
  accept?: string
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  files?: UploadItem[]
  onFilesChange?: (files: File[]) => void
  onRemove?: (id: string) => void
  onRetry?: (id: string) => void
  onReject?: (errors: string[]) => void
  className?: string
}
export function FileUpload({
  label: labelProp,
  hint: hintProp,
  accept,
  maxSize,
  multiple = false,
  disabled,
  files = [],
  onFilesChange,
  onRemove,
  onRetry,
  onReject,
  className,
}: FileUploadProps) {
  const input = useRef<HTMLInputElement>(null),
    [errors, setErrors] = useState<string[]>([]),
    [dragging, setDragging] = useState(false)
  const id = useAutoId('k5-upload'),
    { messages: m, locale } = useGrado(),
    label = labelProp ?? m.uploadLabel,
    hint = hintProp ?? m.uploadHint
  const receive = (incoming: File[]) => {
    if (disabled) return
    const rejected: string[] = [],
      valid: File[] = []
    if (!multiple && incoming.length > 1) rejected.push(m.uploadSingle)
    else
      incoming.forEach((file) => {
        const error = fileError(file, accept, maxSize, { messages: m, locale })
        if (error) rejected.push(error)
        else valid.push(file)
      })
    setErrors(rejected)
    if (rejected.length) onReject?.(rejected)
    if (valid.length) onFilesChange?.(valid)
  }
  return (
    <div className={cx('k5-upload', className)}>
      <div
        className="k5-upload__zone"
        data-dragging={dragging}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          receive(Array.from(event.dataTransfer.files))
        }}
      >
        <input
          ref={input}
          type="file"
          hidden
          aria-label={label}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(event) => {
            receive(Array.from(event.target.files ?? []))
            event.target.value = ''
          }}
        />
        <span className="k5-upload__icon" aria-hidden="true">
          <PathIcon paths={ICON_PATHS.upload} />
        </span>
        <Button variant="secondary" disabled={disabled} aria-describedby={`${id}-hint`} onClick={() => input.current?.click()}>
          {label}
        </Button>
        <p className="k5-upload__hint" id={`${id}-hint`}>
          {hint}
        </p>
      </div>
      {errors.length > 0 && (
        <div role="alert" className="k5-upload__error">
          {errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}
      {files.length > 0 && (
        <ul className="k5-upload__list">
          {files.map((file) => (
            <li className="k5-upload__file" data-status={file.status} key={file.id}>
              <PathIcon paths={ICON_PATHS.file} className="k5-upload__file-icon" />
              <div className="k5-upload__file-content">
                <span className="k5-upload__name">
                  {file.name}
                  {file.status === 'success' && <span className="k5-sr-only">{` ${m.uploadDone}`}</span>}
                </span>
                {file.status === 'uploading' && (
                  <progress
                    className="k5-upload__progress"
                    aria-label={formatMessage(m.uploading, { name: file.name })}
                    value={Math.max(0, Math.min(100, file.progress ?? 0))}
                    max={100}
                  />
                )}
                {file.status === 'error' && (
                  <span className="k5-upload__error" role="alert">
                    {file.error ?? m.uploadFailed}
                  </span>
                )}
              </div>
              {file.status === 'success' && <PathIcon paths={ICON_PATHS.check} className="k5-upload__done" />}
              {file.status === 'error' && onRetry && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  aria-label={formatMessage(m.retryFile, { name: file.name })}
                  onClick={() => onRetry(file.id)}
                >
                  {m.retry}
                </Button>
              )}
              {onRemove && (
                <button
                  type="button"
                  className="k5-close"
                  disabled={disabled}
                  aria-label={formatMessage(m.removeFile, { name: file.name })}
                  onClick={() => onRemove(file.id)}
                >
                  {closeIcon}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export interface StepperProps {
  items: StepItem[]
  value: string
  label?: string
  onValueChange?: (value: string) => void
  className?: string
}
export function Stepper({ items, value, label, onValueChange, className }: StepperProps) {
  const { messages: m } = useGrado()
  const current = items.findIndex((item) => item.id === value)
  return (
    <ol className={cx('k5-stepper', className)} aria-label={label ?? m.progress}>
      {items.map((item, index) => {
        const content = (
          <>
            <span className="k5-stepper__number" aria-hidden="true">
              {index < current ? <PathIcon paths={ICON_PATHS.check} /> : index + 1}
            </span>
            <span className="k5-stepper__text">
              <span>
                {item.label}
                {index < current && <span className="k5-sr-only">{`, ${m.completed}`}</span>}
              </span>
              {item.description && <span className="k5-stepper__description">{item.description}</span>}
            </span>
          </>
        )
        return (
          <li
            key={item.id}
            className="k5-stepper__item"
            aria-current={index === current ? 'step' : undefined}
            data-complete={index < current}
          >
            {onValueChange ? (
              <button type="button" disabled={item.disabled} className="k5-stepper__control" onClick={() => onValueChange(item.id)}>
                {content}
              </button>
            ) : (
              <div className="k5-stepper__control">{content}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
export interface TimelineProps {
  items: TimelineItem[]
  label?: string
  className?: string
}
export function Timeline({ items, label, className }: TimelineProps) {
  const { messages: m } = useGrado()
  return (
    <ol className={cx('k5-timeline', className)} aria-label={label ?? m.history}>
      {items.map((item) => (
        <li key={item.id} className="k5-timeline__item">
          <span aria-hidden="true" className={cx('k5-timeline__dot', item.tone && `k5-timeline__dot--${item.tone}`)} />
          <strong className="k5-timeline__title">{item.title}</strong>
          {item.description && <span className="k5-timeline__description">{item.description}</span>}
          {item.date && (
            <time className="k5-timeline__date" dateTime={item.dateTime}>
              {item.date}
            </time>
          )}
        </li>
      ))}
    </ol>
  )
}
export interface FilterChipProps {
  label: string
  onRemove?: () => void
  className?: string
}
export function FilterChip({ label, onRemove, className }: FilterChipProps) {
  const { messages: m } = useGrado()
  return (
    <span className={cx('k5-chip', className)}>
      {label}
      {onRemove && (
        <button type="button" className="k5-chip__remove" aria-label={formatMessage(m.removeFilter, { label })} onClick={onRemove}>
          {closeIcon}
        </button>
      )}
    </span>
  )
}
export interface FilterBarProps {
  query?: string
  onQueryChange?: (query: string) => void
  filters?: FilterItem[]
  onRemoveFilter?: (id: string) => void
  onClear?: () => void
  label?: string
  placeholder?: string
  children?: ReactNode
  className?: string
}
export function FilterBar({
  query = '',
  onQueryChange,
  filters = [],
  onRemoveFilter,
  onClear,
  label: labelProp,
  placeholder,
  children,
  className,
}: FilterBarProps) {
  const { messages: m } = useGrado(),
    label = labelProp ?? m.search,
    root = useRef<HTMLDivElement>(null)
  // Al quitar un filtro su botón desaparece: el foco vuelve al buscador para no perderse.
  const removed = (id: string) => {
    onRemoveFilter?.(id)
    root.current?.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
  }
  return (
    <div ref={root} role="search" aria-label={label} className={cx('k5-filter-bar', className)}>
      {onQueryChange && (
        <div className="k5-filter-bar__search">
          <Input
            type="search"
            prefix={<PathIcon paths={ICON_PATHS.search} />}
            aria-label={label}
            placeholder={placeholder ?? m.searchPlaceholder}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
      )}
      {children}
      {onClear && (query || filters.length > 0) && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          {m.clearFilters}
        </Button>
      )}
      {filters.length > 0 && (
        <div className="k5-filter-bar__chips">
          {filters.map((filter) => (
            <FilterChip key={filter.id} label={filter.label} onRemove={onRemoveFilter ? () => removed(filter.id) : undefined} />
          ))}
        </div>
      )}
    </div>
  )
}

export interface AccordionItem {
  value: string
  title: string
  content: ReactNode
  disabled?: boolean
}
export interface AccordionProps {
  items: AccordionItem[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  multiple?: boolean
  className?: string
}
export function Accordion({ items, value, defaultValue = [], onValueChange, multiple = false, className }: AccordionProps) {
  const [selected, select] = useValue(value, defaultValue, onValueChange),
    id = useAutoId('k5-accordion')
  return (
    <div className={cx('k5-accordion', className)}>
      {items.map((item, index) => {
        const open = selected.includes(item.value)
        return (
          <div key={item.value} className="k5-accordion__item">
            <h3 className="k5-accordion__heading">
              <button
                type="button"
                className="k5-accordion__trigger"
                id={`${id}-trigger-${index}`}
                disabled={item.disabled}
                aria-expanded={open}
                aria-controls={`${id}-panel-${index}`}
                onClick={() =>
                  select(open ? selected.filter((v) => v !== item.value) : multiple ? [...selected, item.value] : [item.value])
                }
              >
                {item.title}
                <PathIcon paths={ICON_PATHS.chevronDown} className="k5-accordion__icon" />
              </button>
            </h3>
            <div
              className="k5-accordion__panel"
              role="region"
              id={`${id}-panel-${index}`}
              aria-labelledby={`${id}-trigger-${index}`}
              hidden={!open}
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  label?: string
  className?: string
}
export function Breadcrumbs({ items, label, className }: BreadcrumbsProps) {
  const { messages: m } = useGrado()
  return (
    <nav className={cx('k5-breadcrumbs', className)} aria-label={label ?? m.breadcrumbs}>
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {index > 0 && <PathIcon paths={ICON_PATHS.chevronRight} className="k5-breadcrumbs__separator" />}
            {item.href && index !== items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
