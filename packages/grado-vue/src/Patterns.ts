import { computed, defineComponent, h, mergeProps, onBeforeUnmount, onMounted, ref, watch, type PropType, type VNodeChild } from 'vue'
import { cx, ICON_PATHS, STATUS_ICONS } from '@1k5/grado/classes'
import {
  fileError,
  filterOptions,
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
import { Button } from './Button.js'
import { Input, useField } from './Field.js'
import { pathIcon } from './PathIcon.js'
import { formatMessage } from '@1k5/grado/messages'
import { useGrado } from './Locale.js'
import { autoId, booleanOptional, model } from './helpers.js'

const closeIcon = () => pathIcon(ICON_PATHS.x)

function makeModal(name: string, kind = 'dialog') {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      title: { type: String, required: true },
      description: String,
      open: booleanOptional,
      defaultOpen: Boolean,
      closeLabel: String,
      closeOnOutside: { type: Boolean, default: true },
      side: { type: String as PropType<'left' | 'right'>, default: 'right' },
    },
    emits: ['update:open'],
    setup(props, { attrs, slots, emit }) {
      const [visible, setVisible] = model(
        () => props.open,
        props.defaultOpen,
        (value) => emit('update:open', value),
      )
      const dialog = ref<HTMLDialogElement>(),
        id = autoId('k5-dialog'),
        t = useGrado()
      let unlock: (() => void) | undefined,
        previous: HTMLElement | null = null
      const close = () => {
        dialog.value?.close()
        unlock?.()
        unlock = undefined
        if (previous?.isConnected) previous.focus()
        previous = null
      }
      onMounted(() =>
        watch(
          visible,
          (open) => {
            if (open && dialog.value) {
              previous = document.activeElement as HTMLElement
              dialog.value.showModal()
              unlock = lockScroll(document)
            } else close()
          },
          { immediate: true, flush: 'post' },
        ),
      )
      onBeforeUnmount(close)
      return () =>
        h(
          'dialog',
          mergeProps(attrs, {
            ref: dialog,
            role: kind === 'alert' ? 'alertdialog' : undefined,
            'aria-modal': 'true',
            'aria-labelledby': `${id}-title`,
            'aria-describedby': props.description ? `${id}-description` : undefined,
            class: cx(
              'k5-dialog',
              kind === 'alert' && 'k5-dialog--alert',
              kind === 'drawer' && 'k5-drawer',
              kind === 'drawer' && props.side === 'left' && 'k5-drawer--left',
            ),
            onCancel: (event: Event) => {
              event.preventDefault()
              setVisible(false)
            },
            onClick: (event: MouseEvent) => {
              if (event.target === event.currentTarget && props.closeOnOutside && kind !== 'alert') {
                const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
                if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)
                  setVisible(false)
              }
            },
          }),
          [
            h('div', { class: 'k5-dialog__header' }, [
              h('div', { class: 'k5-dialog__heading' }, [
                h('h2', { class: 'k5-dialog__title', id: `${id}-title` }, slots.title?.() ?? props.title),
                props.description ? h('p', { class: 'k5-dialog__description', id: `${id}-description` }, props.description) : null,
              ]),
              h(
                'button',
                {
                  type: 'button',
                  class: 'k5-close',
                  'aria-label': props.closeLabel ?? t.value.messages.close,
                  onClick: () => setVisible(false),
                },
                [closeIcon()],
              ),
            ]),
            slots.default ? h('div', { class: 'k5-dialog__body' }, slots.default()) : null,
            slots.footer ? h('div', { class: 'k5-dialog__footer' }, slots.footer()) : null,
          ],
        )
    },
  })
}
export const Dialog = makeModal('K5Dialog')
export const AlertDialog = makeModal('K5AlertDialog', 'alert')
export const Drawer = makeModal('K5Drawer', 'drawer')
export const Sheet = Drawer

export const DropdownMenu = defineComponent({
  name: 'K5DropdownMenu',
  props: {
    label: { type: String, required: true },
    items: { type: Array as PropType<MenuItem[]>, required: true },
    disabled: Boolean,
    align: { type: String as PropType<'start' | 'end'>, default: 'end' },
  },
  emits: ['action'],
  setup(props, { emit }) {
    const open = ref(false),
      root = ref<HTMLElement>(),
      menu = ref<HTMLElement>(),
      id = autoId('k5-menu')
    // Si el menú no cabe por el lado pedido (ventana o contenedor con scroll), se abre hacia el otro.
    const flipped = ref(false)
    watch(
      open,
      (value) => {
        flipped.value = false
        if (value && menu.value && overflowsSide(menu.value, props.align === 'end' ? 'left' : 'right')) flipped.value = true
      },
      { flush: 'post' },
    )
    let first = 'first'
    const trigger = () => root.value?.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')
    const outside = (event: PointerEvent) => {
      if (!root.value?.contains(event.target as Node)) open.value = false
    }
    watch(
      open,
      (value) => {
        if (value) {
          const buttons = menu.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
          if (buttons?.length) buttons[first === 'last' ? buttons.length - 1 : 0].focus()
          document.addEventListener('pointerdown', outside)
        } else document.removeEventListener('pointerdown', outside)
      },
      { flush: 'post' },
    )
    onBeforeUnmount(() => document.removeEventListener('pointerdown', outside))
    return () =>
      h(
        'div',
        {
          ref: root,
          class: 'k5-menu',
          onFocusout: (event: FocusEvent) => {
            if (!root.value?.contains(event.relatedTarget as Node)) open.value = false
          },
        },
        [
          h(
            Button,
            {
              variant: 'secondary',
              disabled: props.disabled,
              'aria-haspopup': 'menu',
              'aria-expanded': open.value,
              'aria-controls': open.value ? id : undefined,
              onClick: () => {
                first = 'first'
                open.value = !open.value
              },
              onKeydown: (event: KeyboardEvent) => {
                if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
                  event.preventDefault()
                  first = event.key === 'ArrowUp' ? 'last' : 'first'
                  open.value = true
                }
              },
            },
            { default: () => [props.label, pathIcon(ICON_PATHS.chevronDown, 'k5-menu__chevron')] },
          ),
          open.value
            ? h(
                'div',
                {
                  ref: menu,
                  class: cx('k5-menu__content', (props.align === 'start') !== flipped.value && 'k5-menu__content--start'),
                  role: 'menu',
                  'aria-label': props.label,
                  id,
                  onKeydown: (event: KeyboardEvent) => {
                    if (event.key === 'Escape') {
                      event.preventDefault()
                      open.value = false
                      trigger()?.focus()
                    } else moveFocus(event, event.currentTarget as HTMLElement, '[role="menuitem"]')
                  },
                },
                props.items.map((item) =>
                  h('div', { role: 'none', key: item.id }, [
                    item.separator ? h('div', { role: 'separator', class: 'k5-menu__separator' }) : null,
                    h(
                      'button',
                      {
                        type: 'button',
                        role: 'menuitem',
                        tabindex: -1,
                        disabled: item.disabled,
                        class: cx('k5-menu__item', item.danger && 'k5-menu__item--danger'),
                        onPointermove: (event: PointerEvent) => {
                          if (!item.disabled) (event.currentTarget as HTMLElement).focus()
                        },
                        onClick: () => {
                          open.value = false
                          trigger()?.focus()
                          emit('action', item.id)
                        },
                      },
                      item.label,
                    ),
                  ]),
                ),
              )
            : null,
        ],
      )
  },
})
export const Tooltip = defineComponent({
  name: 'K5Tooltip',
  props: { label: { type: String, required: true }, content: { type: String, required: true } },
  setup(props, { slots }) {
    const open = ref(false),
      id = autoId('k5-tooltip')
    return () =>
      h(
        'span',
        {
          class: 'k5-tooltip',
          onMouseenter: () => (open.value = true),
          onMouseleave: () => (open.value = false),
          onFocusin: () => (open.value = true),
          onFocusout: () => (open.value = false),
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
              open.value = false
              event.stopPropagation()
            }
          },
        },
        [
          h(
            Button,
            {
              variant: 'ghost',
              size: 'sm',
              iconOnly: true,
              'aria-label': props.label,
              'aria-describedby': open.value ? id : undefined,
              onClick: () => (open.value = !open.value),
            },
            { default: () => slots.default?.() ?? pathIcon(ICON_PATHS.info) },
          ),
          open.value ? h('span', { role: 'tooltip', id, class: 'k5-tooltip__content' }, props.content) : null,
        ],
      )
  },
})

export const Checkbox = defineComponent({
  name: 'K5Checkbox',
  inheritAttrs: false,
  props: {
    modelValue: booleanOptional,
    defaultChecked: Boolean,
    label: String,
    description: String,
    indeterminate: Boolean,
    id: String,
    required: booleanOptional,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit, expose }) {
    const field = useField(),
      auto = autoId('k5-checkbox'),
      input = ref<HTMLInputElement>()
    const [checked, change] = model(
      () => props.modelValue,
      props.defaultChecked,
      (value) => emit('update:modelValue', value),
    )
    onMounted(() =>
      watch(
        () => props.indeterminate,
        (value) => {
          if (input.value) input.value.indeterminate = value
        },
        { immediate: true, flush: 'post' },
      ),
    )
    expose({ focus: () => input.value?.focus(), input })
    return () => {
      const id = props.id ?? field?.value.id ?? auto
      const control = h(
        'input',
        mergeProps(attrs, {
          ref: input,
          type: 'checkbox',
          id,
          checked: checked.value,
          class: 'k5-checkbox',
          'aria-checked': props.indeterminate ? 'mixed' : undefined,
          'aria-invalid': attrs['aria-invalid'] ?? (field?.value.invalid || undefined),
          'aria-describedby':
            cx(attrs['aria-describedby'], field?.value.describedBy, props.description && `${id}-description`) || undefined,
          required: props.required ?? field?.value.required,
          onChange: (event: Event) => change((event.target as HTMLInputElement).checked),
        }),
      )
      return props.label
        ? h('label', { class: 'k5-checkbox-field', for: id }, [
            control,
            h('span', { class: 'k5-choice__text' }, [
              h('span', null, props.label),
              props.description ? h('span', { id: `${id}-description`, class: 'k5-choice__description' }, props.description) : null,
            ]),
          ])
        : control
    }
  },
})
export const RadioGroup = defineComponent({
  name: 'K5RadioGroup',
  props: {
    label: { type: String, required: true },
    options: { type: Array as PropType<ChoiceOption[]>, required: true },
    modelValue: String,
    defaultValue: { type: String, default: '' },
    name: String,
    required: Boolean,
    disabled: Boolean,
    orientation: { type: String as PropType<'horizontal' | 'vertical'>, default: 'vertical' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const [selected, select] = model(
        () => props.modelValue,
        props.defaultValue,
        (value) => emit('update:modelValue', value),
      ),
      id = autoId('k5-radio')
    return () =>
      h(
        'fieldset',
        { class: cx('k5-radio-group', props.orientation === 'horizontal' && 'k5-radio-group--horizontal'), disabled: props.disabled },
        [
          h('legend', null, props.label),
          h(
            'div',
            { class: 'k5-radio-group__options' },
            props.options.map((option, index) =>
              h('label', { class: 'k5-radio-option', key: option.value }, [
                h('input', {
                  type: 'radio',
                  class: 'k5-radio',
                  name: props.name ?? id,
                  value: option.value,
                  checked: selected.value === option.value,
                  disabled: option.disabled,
                  required: props.required,
                  'aria-describedby': option.description ? `${id}-${index}-description` : undefined,
                  onChange: () => select(option.value),
                }),
                h('span', { class: 'k5-choice__text' }, [
                  h('span', null, option.label),
                  option.description
                    ? h('span', { id: `${id}-${index}-description`, class: 'k5-choice__description' }, option.description)
                    : null,
                ]),
              ]),
            ),
          ),
        ],
      )
  },
})

export const Combobox = defineComponent({
  name: 'K5Combobox',
  props: {
    options: { type: Array as PropType<ChoiceOption[]>, required: true },
    modelValue: String,
    defaultValue: { type: String, default: '' },
    label: String,
    placeholder: String,
    disabled: Boolean,
    required: booleanOptional,
    loading: Boolean,
    emptyLabel: String,
    name: String,
    id: String,
  },
  emits: ['update:modelValue', 'queryChange'],
  setup(props, { emit }) {
    const [selected, select] = model(
      () => props.modelValue,
      props.defaultValue,
      (value) => emit('update:modelValue', value),
    )
    const open = ref(false),
      query = ref(''),
      active = ref(-1),
      root = ref<HTMLElement>(),
      field = useField(),
      auto = autoId('k5-combobox'),
      t = useGrado()
    const placeholder = computed(() => props.placeholder ?? t.value.messages.searchPlaceholder)
    const id = computed(() => props.id ?? field?.value.id ?? auto),
      filtered = computed(() => filterOptions(props.options, query.value))
    const pick = (option: ChoiceOption) => {
      if (option.disabled) return
      select(option.value)
      query.value = ''
      open.value = false
      ;(root.value?.querySelector('input[role="combobox"]') as HTMLInputElement)?.focus()
    }
    watch(
      [active, open],
      () => {
        if (open.value && active.value >= 0)
          document.getElementById(`${id.value}-option-${active.value}`)?.scrollIntoView({ block: 'nearest' })
      },
      { flush: 'post' },
    )
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        open.value = false
        query.value = ''
        return
      }
      if (event.key === 'Enter' && open.value) {
        event.preventDefault()
        const option = filtered.value[active.value]
        if (!props.loading && option) pick(option)
        return
      }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        if (!open.value && ['Home', 'End'].includes(event.key)) return
        event.preventDefault()
        open.value = true
        const enabled = filtered.value.map((option, i) => (option.disabled ? -1 : i)).filter((i) => i >= 0),
          position = enabled.indexOf(active.value)
        active.value =
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
                ] ?? -1)
      }
    }
    return () =>
      h(
        'div',
        {
          ref: root,
          class: 'k5-combobox',
          onFocusout: (event: FocusEvent) => {
            if (!root.value?.contains(event.relatedTarget as Node)) {
              open.value = false
              query.value = ''
              active.value = -1
            }
          },
        },
        [
          props.name ? h('input', { type: 'hidden', name: props.name, value: selected.value, disabled: props.disabled }) : null,
          h(Input, {
            id: id.value,
            role: 'combobox',
            'aria-label': props.label,
            'aria-autocomplete': 'list',
            'aria-expanded': open.value,
            'aria-controls': open.value ? `${id.value}-list` : undefined,
            'aria-activedescendant':
              open.value && filtered.value[active.value] && !filtered.value[active.value].disabled
                ? `${id.value}-option-${active.value}`
                : undefined,
            'aria-busy': props.loading || undefined,
            autocomplete: 'off',
            placeholder: open.value
              ? (props.options.find((option) => option.value === selected.value)?.label ?? placeholder.value)
              : placeholder.value,
            disabled: props.disabled,
            required: props.required,
            modelValue: open.value ? query.value : (props.options.find((option) => option.value === selected.value)?.label ?? ''),
            onFocus: () => {
              open.value = true
              active.value = -1
            },
            onClick: () => (open.value = true),
            'onUpdate:modelValue': (value: string) => {
              query.value = value
              emit('queryChange', value)
              active.value = -1
              open.value = true
              if (!value) select('')
            },
            onKeydown: keydown,
          }),
          open.value
            ? h(
                'ul',
                {
                  class: 'k5-combobox__list',
                  id: `${id.value}-list`,
                  role: 'listbox',
                  'aria-label': props.label ?? t.value.messages.options,
                },
                props.loading || !filtered.value.length
                  ? [
                      h(
                        'li',
                        { role: 'presentation', class: 'k5-combobox__empty' },
                        props.loading ? t.value.messages.loadingEllipsis : (props.emptyLabel ?? t.value.messages.noResults),
                      ),
                    ]
                  : filtered.value.map((option, index) =>
                      h(
                        'li',
                        {
                          role: 'option',
                          id: `${id.value}-option-${index}`,
                          key: option.value,
                          'aria-selected': option.value === selected.value,
                          'aria-disabled': option.disabled || undefined,
                          'data-active': index === active.value,
                          class: 'k5-combobox__option',
                          onMousedown: (event: MouseEvent) => event.preventDefault(),
                          onMousemove: () => {
                            if (!option.disabled) active.value = index
                          },
                          onClick: () => pick(option),
                        },
                        [h('span', null, option.label), pathIcon(ICON_PATHS.check, 'k5-combobox__check')],
                      ),
                    ),
              )
            : null,
        ],
      )
  },
})

export const Alert = defineComponent({
  name: 'K5Alert',
  props: {
    title: { type: String, required: true },
    tone: { type: String as PropType<StatusTone>, default: 'info' },
    dismissible: Boolean,
    dismissLabel: String,
    role: { type: String as PropType<'status' | 'alert' | 'none'>, default: 'status' },
  },
  emits: ['dismiss'],
  setup(props, { slots, emit }) {
    const t = useGrado()
    return () =>
      h('div', { class: cx('k5-alert', `k5-alert--${props.tone}`), role: props.role === 'none' ? undefined : props.role }, [
        pathIcon(ICON_PATHS[STATUS_ICONS[props.tone] ?? 'info'], 'k5-alert__icon'),
        h('div', { class: 'k5-alert__content' }, [
          h('strong', { class: 'k5-alert__title' }, props.title),
          slots.default ? h('div', { class: 'k5-alert__description' }, slots.default()) : null,
          slots.action ? h('div', { class: 'k5-alert__action' }, slots.action()) : null,
        ]),
        props.dismissible
          ? h(
              'button',
              {
                type: 'button',
                class: 'k5-close',
                'aria-label': props.dismissLabel ?? t.value.messages.dismiss,
                onClick: () => emit('dismiss'),
              },
              [closeIcon()],
            )
          : null,
      ])
  },
})
export const Toast = defineComponent({
  name: 'K5Toast',
  inheritAttrs: false,
  props: {
    open: Boolean,
    title: { type: String, required: true },
    tone: { type: String as PropType<StatusTone>, default: 'info' },
    duration: { type: Number, default: 5000 },
    dismissLabel: String,
  },
  emits: ['update:open'],
  setup(props, { attrs, emit, slots }) {
    const paused = ref(false)
    let timer: ReturnType<typeof setTimeout> | undefined,
      remaining = props.duration,
      started = 0
    const clear = () => {
      if (timer) {
        clearTimeout(timer)
        timer = undefined
        remaining -= Date.now() - started
      }
    }
    const schedule = () => {
      clear()
      if (props.open && !paused.value && props.duration > 0) {
        started = Date.now()
        timer = setTimeout(() => emit('update:open', false), Math.max(0, remaining))
      }
    }
    onMounted(() => {
      watch(
        () => [props.open, props.duration],
        () => {
          clear()
          remaining = props.duration
          if (!props.open) paused.value = false
          schedule()
        },
        { immediate: true },
      )
      watch(paused, schedule)
    })
    onBeforeUnmount(clear)
    return () =>
      props.open
        ? h(
            'div',
            mergeProps(attrs, {
              class: 'k5-toast',
              onMouseenter: () => (paused.value = true),
              onMouseleave: (event: MouseEvent) => {
                if (!(event.currentTarget as HTMLElement).contains(document.activeElement)) paused.value = false
              },
              onFocusin: () => (paused.value = true),
              onFocusout: (event: FocusEvent) => {
                if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) paused.value = false
              },
              onKeydown: (event: KeyboardEvent) => {
                if (event.key === 'Escape') emit('update:open', false)
              },
            }),
            [
              h(
                Alert,
                {
                  title: props.title,
                  tone: props.tone,
                  dismissLabel: props.dismissLabel,
                  dismissible: true,
                  onDismiss: () => emit('update:open', false),
                },
                slots,
              ),
            ],
          )
        : null
  },
})
export const Skeleton = defineComponent({
  name: 'K5Skeleton',
  props: { width: { type: [String, Number], default: '100%' }, height: { type: [String, Number], default: '1rem' }, circle: Boolean },
  setup: (props) => () =>
    h('span', {
      'aria-hidden': 'true',
      class: cx('k5-skeleton', props.circle && 'k5-skeleton--circle'),
      style: {
        width: typeof props.width === 'number' ? `${props.width}px` : props.width,
        height: typeof props.height === 'number' ? `${props.height}px` : props.height,
      },
    }),
})

export interface TabItem {
  value: string
  label: string
  content?: VNodeChild
  disabled?: boolean
}
export const Tabs = defineComponent({
  name: 'K5Tabs',
  props: {
    items: { type: Array as PropType<TabItem[]>, required: true },
    label: { type: String, required: true },
    modelValue: String,
    defaultValue: String,
    variant: { type: String as PropType<'line' | 'pill'>, default: 'line' },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const [selected, select] = model(
        () => props.modelValue,
        props.defaultValue ?? props.items.find((item) => !item.disabled)?.value ?? '',
        (value) => emit('update:modelValue', value),
      ),
      id = autoId('k5-tabs')
    return () => {
      const current = props.items.some((item) => item.value === selected.value && !item.disabled)
        ? selected.value
        : props.items.find((item) => !item.disabled)?.value
      return h('div', { class: cx('k5-tabs', props.variant === 'pill' && 'k5-tabs--pill') }, [
        h(
          'div',
          {
            class: 'k5-tabs__list',
            role: 'tablist',
            'aria-label': props.label,
            onKeydown: (event: KeyboardEvent) => moveFocus(event, event.currentTarget as HTMLElement, '[role="tab"]', true),
          },
          props.items.map((item, i) =>
            h(
              'button',
              {
                type: 'button',
                key: item.value,
                id: `${id}-tab-${i}`,
                role: 'tab',
                class: 'k5-tabs__tab',
                tabindex: item.value === current ? 0 : -1,
                disabled: item.disabled,
                'aria-selected': item.value === current,
                'aria-controls': `${id}-panel-${i}`,
                onClick: () => select(item.value),
                onFocus: () => select(item.value),
              },
              item.label,
            ),
          ),
        ),
        ...props.items.map((item, i) =>
          h(
            'div',
            {
              key: item.value,
              role: 'tabpanel',
              class: 'k5-tabs__panel',
              id: `${id}-panel-${i}`,
              'aria-labelledby': `${id}-tab-${i}`,
              tabindex: 0,
              hidden: item.value !== current,
            },
            [slots[item.value]?.() ?? item.content],
          ),
        ),
      ])
    }
  },
})
export const Pagination = defineComponent({
  name: 'K5Pagination',
  props: {
    total: { type: Number, required: true },
    pageSize: { type: Number, default: 10 },
    page: Number,
    defaultPage: { type: Number, default: 1 },
    label: String,
  },
  emits: ['update:page'],
  setup(props, { emit }) {
    const [selected, select] = model(
        () => props.page,
        props.defaultPage,
        (value) => emit('update:page', value),
      ),
      t = useGrado()
    return () => {
      const m = t.value.messages,
        count = pageCount(props.total, props.pageSize),
        current = Math.max(1, Math.min(count, selected.value))
      return h('nav', { class: 'k5-pagination', 'aria-label': props.label ?? m.pagination }, [
        h(
          'span',
          { 'aria-live': 'polite' },
          props.total > 0
            ? formatMessage(m.pageRange, {
                from: (current - 1) * Math.max(1, props.pageSize) + 1,
                to: Math.min(props.total, current * Math.max(1, props.pageSize)),
                total: props.total,
              })
            : m.noResultsCount,
        ),
        h('div', { class: 'k5-pagination__controls' }, [
          h('button', { type: 'button', 'aria-label': m.previousPage, disabled: current === 1, onClick: () => select(current - 1) }, [
            pathIcon(ICON_PATHS.chevronLeft),
          ]),
          ...pageItems(current, count).map((item, index) =>
            item === 'ellipsis'
              ? h('span', { key: `gap-${index}`, class: 'k5-pagination__ellipsis', 'aria-hidden': 'true' }, '…')
              : h(
                  'button',
                  {
                    type: 'button',
                    key: item,
                    'aria-label': formatMessage(m.pageN, { page: item }),
                    'aria-current': item === current ? 'page' : undefined,
                    onClick: () => select(item),
                  },
                  item,
                ),
          ),
          h('button', { type: 'button', 'aria-label': m.nextPage, disabled: current === count, onClick: () => select(current + 1) }, [
            pathIcon(ICON_PATHS.chevronRight),
          ]),
        ]),
      ])
    }
  },
})

export const DatePicker = defineComponent({
  name: 'K5DatePicker',
  inheritAttrs: false,
  props: { modelValue: String },
  emits: ['update:modelValue'],
  setup:
    (props, { attrs, emit }) =>
    () =>
      h(Input, {
        ...attrs,
        type: 'date',
        modelValue: props.modelValue,
        'onUpdate:modelValue': (value: string) => emit('update:modelValue', value),
      }),
})
export const DateRangePicker = defineComponent({
  name: 'K5DateRangePicker',
  props: {
    label: { type: String, required: true },
    modelValue: Object as PropType<DateRangeValue>,
    defaultValue: { type: Object as PropType<DateRangeValue>, default: () => ({ start: '', end: '' }) },
    min: String,
    max: String,
    required: Boolean,
    disabled: Boolean,
    name: String,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const [range, select] = model(
        () => props.modelValue,
        props.defaultValue,
        (value) => emit('update:modelValue', value),
      ),
      id = autoId('k5-range'),
      t = useGrado()
    return () => {
      const m = t.value.messages,
        error = rangeError(range.value.start, range.value.end, props.min, props.max, m)
      return h('fieldset', { class: 'k5-date-range', disabled: props.disabled }, [
        h('legend', null, props.label),
        h('div', { class: 'k5-date-range__fields' }, [
          h('label', null, [
            m.dateFrom,
            h(DatePicker, {
              name: props.name ? `${props.name}[start]` : undefined,
              modelValue: range.value.start,
              min: props.min,
              max: range.value.end && (!props.max || range.value.end < props.max) ? range.value.end : props.max,
              required: props.required,
              'aria-describedby': error ? `${id}-error` : undefined,
              'aria-invalid': !!error || undefined,
              'onUpdate:modelValue': (start: string) => select({ ...range.value, start }),
            }),
          ]),
          h('label', null, [
            m.dateTo,
            h(DatePicker, {
              name: props.name ? `${props.name}[end]` : undefined,
              modelValue: range.value.end,
              min: range.value.start && (!props.min || range.value.start > props.min) ? range.value.start : props.min,
              max: props.max,
              required: props.required,
              'aria-describedby': error ? `${id}-error` : undefined,
              'aria-invalid': !!error || undefined,
              'onUpdate:modelValue': (end: string) => select({ ...range.value, end }),
            }),
          ]),
        ]),
        error ? h('p', { role: 'alert', class: 'k5-field__error', id: `${id}-error` }, error) : null,
      ])
    }
  },
})

export const FileUpload = defineComponent({
  name: 'K5FileUpload',
  props: {
    label: String,
    hint: String,
    accept: String,
    maxSize: Number,
    multiple: Boolean,
    disabled: Boolean,
    files: { type: Array as PropType<UploadItem[]>, default: () => [] },
    removable: Boolean,
    retryable: Boolean,
  },
  emits: ['filesChange', 'remove', 'retry', 'reject'],
  setup(props, { emit }) {
    const input = ref<HTMLInputElement>(),
      errors = ref<string[]>([]),
      dragging = ref(false),
      id = autoId('k5-upload'),
      t = useGrado()
    const receive = (incoming: File[]) => {
      if (props.disabled) return
      const rejected: string[] = [],
        valid: File[] = []
      if (!props.multiple && incoming.length > 1) rejected.push(t.value.messages.uploadSingle)
      else
        incoming.forEach((file) => {
          const error = fileError(file, props.accept, props.maxSize, { messages: t.value.messages, locale: t.value.locale })
          if (error) rejected.push(error)
          else valid.push(file)
        })
      errors.value = rejected
      if (rejected.length) emit('reject', rejected)
      if (valid.length) emit('filesChange', valid)
    }
    return () => {
      const m = t.value.messages,
        label = props.label ?? m.uploadLabel
      return h('div', { class: 'k5-upload' }, [
        h(
          'div',
          {
            class: 'k5-upload__zone',
            'data-dragging': dragging.value,
            onDragover: (event: DragEvent) => {
              event.preventDefault()
              if (!props.disabled) dragging.value = true
            },
            onDragleave: (event: DragEvent) => {
              if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) dragging.value = false
            },
            onDrop: (event: DragEvent) => {
              event.preventDefault()
              dragging.value = false
              receive(Array.from(event.dataTransfer?.files ?? []))
            },
          },
          [
            h('input', {
              ref: input,
              type: 'file',
              hidden: true,
              'aria-label': label,
              accept: props.accept,
              multiple: props.multiple,
              disabled: props.disabled,
              onChange: (event: Event) => {
                const target = event.target as HTMLInputElement
                receive(Array.from(target.files ?? []))
                target.value = ''
              },
            }),
            h('span', { class: 'k5-upload__icon', 'aria-hidden': 'true' }, [pathIcon(ICON_PATHS.upload)]),
            h(
              Button,
              { variant: 'secondary', disabled: props.disabled, 'aria-describedby': `${id}-hint`, onClick: () => input.value?.click() },
              { default: () => label },
            ),
            h('p', { class: 'k5-upload__hint', id: `${id}-hint` }, props.hint ?? m.uploadHint),
          ],
        ),
        errors.value.length
          ? h(
              'div',
              { role: 'alert', class: 'k5-upload__error' },
              errors.value.map((error, i) => h('p', { key: i }, error)),
            )
          : null,
        props.files.length
          ? h(
              'ul',
              { class: 'k5-upload__list' },
              props.files.map((file) =>
                h('li', { class: 'k5-upload__file', 'data-status': file.status, key: file.id }, [
                  pathIcon(ICON_PATHS.file, 'k5-upload__file-icon'),
                  h('div', { class: 'k5-upload__file-content' }, [
                    h('span', { class: 'k5-upload__name' }, [
                      file.name,
                      file.status === 'success' ? h('span', { class: 'k5-sr-only' }, ` ${m.uploadDone}`) : null,
                    ]),
                    file.status === 'uploading'
                      ? h('progress', {
                          class: 'k5-upload__progress',
                          'aria-label': formatMessage(m.uploading, { name: file.name }),
                          value: Math.max(0, Math.min(100, file.progress ?? 0)),
                          max: 100,
                        })
                      : null,
                    file.status === 'error' ? h('span', { class: 'k5-upload__error', role: 'alert' }, file.error ?? m.uploadFailed) : null,
                  ]),
                  file.status === 'success' ? pathIcon(ICON_PATHS.check, 'k5-upload__done') : null,
                  file.status === 'error' && props.retryable
                    ? h(
                        Button,
                        {
                          variant: 'ghost',
                          size: 'sm',
                          disabled: props.disabled,
                          'aria-label': formatMessage(m.retryFile, { name: file.name }),
                          onClick: () => emit('retry', file.id),
                        },
                        { default: () => m.retry },
                      )
                    : null,
                  props.removable
                    ? h(
                        'button',
                        {
                          type: 'button',
                          class: 'k5-close',
                          disabled: props.disabled,
                          'aria-label': formatMessage(m.removeFile, { name: file.name }),
                          onClick: () => emit('remove', file.id),
                        },
                        [closeIcon()],
                      )
                    : null,
                ]),
              ),
            )
          : null,
      ])
    }
  },
})

export const Stepper = defineComponent({
  name: 'K5Stepper',
  props: {
    items: { type: Array as PropType<StepItem[]>, required: true },
    modelValue: { type: String, required: true },
    label: String,
    interactive: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const t = useGrado()
    return () => {
      const current = props.items.findIndex((item) => item.id === props.modelValue)
      return h(
        'ol',
        { class: 'k5-stepper', 'aria-label': props.label ?? t.value.messages.progress },
        props.items.map((item, index) =>
          h(
            'li',
            {
              key: item.id,
              class: 'k5-stepper__item',
              'aria-current': index === current ? 'step' : undefined,
              'data-complete': index < current,
            },
            [
              h(
                props.interactive ? 'button' : 'div',
                {
                  ...(props.interactive
                    ? { type: 'button', disabled: item.disabled, onClick: () => emit('update:modelValue', item.id) }
                    : {}),
                  class: 'k5-stepper__control',
                },
                [
                  h(
                    'span',
                    { class: 'k5-stepper__number', 'aria-hidden': 'true' },
                    index < current ? pathIcon(ICON_PATHS.check) : index + 1,
                  ),
                  h('span', { class: 'k5-stepper__text' }, [
                    h('span', null, [
                      item.label,
                      index < current ? h('span', { class: 'k5-sr-only' }, `, ${t.value.messages.completed}`) : null,
                    ]),
                    item.description ? h('span', { class: 'k5-stepper__description' }, item.description) : null,
                  ]),
                ],
              ),
            ],
          ),
        ),
      )
    }
  },
})
export const Timeline = defineComponent({
  name: 'K5Timeline',
  props: { items: { type: Array as PropType<TimelineItem[]>, required: true }, label: String },
  setup: (props) => {
    const t = useGrado()
    return () =>
      h(
        'ol',
        { class: 'k5-timeline', 'aria-label': props.label ?? t.value.messages.history },
        props.items.map((item) =>
          h('li', { key: item.id, class: 'k5-timeline__item' }, [
            h('span', { 'aria-hidden': 'true', class: cx('k5-timeline__dot', item.tone && `k5-timeline__dot--${item.tone}`) }),
            h('strong', { class: 'k5-timeline__title' }, item.title),
            item.description ? h('span', { class: 'k5-timeline__description' }, item.description) : null,
            item.date ? h('time', { class: 'k5-timeline__date', datetime: item.dateTime }, item.date) : null,
          ]),
        ),
      )
  },
})
export const FilterChip = defineComponent({
  name: 'K5FilterChip',
  props: { label: { type: String, required: true }, removable: Boolean },
  emits: ['remove'],
  setup: (props, { emit }) => {
    const t = useGrado()
    return () =>
      h('span', { class: 'k5-chip' }, [
        props.label,
        props.removable
          ? h(
              'button',
              {
                type: 'button',
                class: 'k5-chip__remove',
                'aria-label': formatMessage(t.value.messages.removeFilter, { label: props.label }),
                onClick: () => emit('remove'),
              },
              [closeIcon()],
            )
          : null,
      ])
  },
})
export const FilterBar = defineComponent({
  name: 'K5FilterBar',
  props: {
    query: { type: String, default: '' },
    filters: { type: Array as PropType<FilterItem[]>, default: () => [] },
    searchable: { type: Boolean, default: true },
    clearable: Boolean,
    label: String,
    placeholder: String,
  },
  emits: ['update:query', 'removeFilter', 'clear'],
  setup: (props, { emit, slots }) => {
    const t = useGrado(),
      root = ref<HTMLElement>()
    // Al quitar un filtro su botón desaparece: el foco vuelve al buscador para no perderse.
    const removed = (id: string) => {
      emit('removeFilter', id)
      root.value?.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
    }
    return () =>
      h('div', { ref: root, role: 'search', 'aria-label': props.label ?? t.value.messages.search, class: 'k5-filter-bar' }, [
        props.searchable
          ? h('div', { class: 'k5-filter-bar__search' }, [
              h(
                Input,
                {
                  type: 'search',
                  'aria-label': props.label ?? t.value.messages.search,
                  placeholder: props.placeholder ?? t.value.messages.searchPlaceholder,
                  modelValue: props.query,
                  'onUpdate:modelValue': (query: string) => emit('update:query', query),
                },
                { prefix: () => pathIcon(ICON_PATHS.search) },
              ),
            ])
          : null,
        slots.default?.(),
        props.clearable && (props.query || props.filters.length)
          ? h(Button, { variant: 'ghost', size: 'sm', onClick: () => emit('clear') }, { default: () => t.value.messages.clearFilters })
          : null,
        props.filters.length
          ? h(
              'div',
              { class: 'k5-filter-bar__chips' },
              props.filters.map((filter) =>
                h(FilterChip, { key: filter.id, label: filter.label, removable: true, onRemove: () => removed(filter.id) }),
              ),
            )
          : null,
      ])
  },
})
export interface AccordionItem {
  value: string
  title: string
  content?: VNodeChild
  disabled?: boolean
}
export const Accordion = defineComponent({
  name: 'K5Accordion',
  props: {
    items: { type: Array as PropType<AccordionItem[]>, required: true },
    modelValue: Array as PropType<string[]>,
    defaultValue: { type: Array as PropType<string[]>, default: () => [] },
    multiple: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const [selected, select] = model(
        () => props.modelValue,
        props.defaultValue,
        (value) => emit('update:modelValue', value),
      ),
      id = autoId('k5-accordion')
    return () =>
      h(
        'div',
        { class: 'k5-accordion' },
        props.items.map((item, index) => {
          const open = selected.value.includes(item.value)
          return h('div', { key: item.value, class: 'k5-accordion__item' }, [
            h('h3', { class: 'k5-accordion__heading' }, [
              h(
                'button',
                {
                  type: 'button',
                  class: 'k5-accordion__trigger',
                  id: `${id}-trigger-${index}`,
                  disabled: item.disabled,
                  'aria-expanded': open,
                  'aria-controls': `${id}-panel-${index}`,
                  onClick: () =>
                    select(
                      open
                        ? selected.value.filter((value: string) => value !== item.value)
                        : props.multiple
                          ? [...selected.value, item.value]
                          : [item.value],
                    ),
                },
                [item.title, pathIcon(ICON_PATHS.chevronDown, 'k5-accordion__icon')],
              ),
            ]),
            h(
              'div',
              {
                class: 'k5-accordion__panel',
                role: 'region',
                id: `${id}-panel-${index}`,
                'aria-labelledby': `${id}-trigger-${index}`,
                hidden: !open,
              },
              [slots[item.value]?.() ?? item.content],
            ),
          ])
        }),
      )
  },
})
export const Breadcrumbs = defineComponent({
  name: 'K5Breadcrumbs',
  props: { items: { type: Array as PropType<BreadcrumbItem[]>, required: true }, label: String },
  setup: (props) => {
    const t = useGrado()
    return () =>
      h('nav', { class: 'k5-breadcrumbs', 'aria-label': props.label ?? t.value.messages.breadcrumbs }, [
        h(
          'ol',
          null,
          props.items.map((item, index) =>
            h('li', { key: index }, [
              index > 0 ? pathIcon(ICON_PATHS.chevronRight, 'k5-breadcrumbs__separator') : null,
              item.href && index !== props.items.length - 1
                ? h('a', { href: item.href }, item.label)
                : h('span', { 'aria-current': index === props.items.length - 1 ? 'page' : undefined }, item.label),
            ]),
          ),
        ),
      ])
  },
})
