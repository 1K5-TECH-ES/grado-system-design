import { computed, defineComponent, h, mergeProps, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'
import { cx, ICON_PATHS } from '@1k5/grado/classes'
import { filterGroups, isShortcut, lockScroll, nextIndex, type CommandGroup, type CommandItem } from '@1k5/grado/patterns'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { autoId, booleanOptional, model } from './helpers.js'

/**
 * Buscador de acciones y registros sobre un <dialog> modal. Ábrela desde AppSearch o con
 * Ctrl/⌘ + K. Flechas para moverse, Enter para elegir y Escape para cerrar.
 * v-model:open y el evento select con el id elegido.
 */
export const CommandPalette = defineComponent({
  name: 'K5CommandPalette',
  inheritAttrs: false,
  props: {
    groups: { type: Array as PropType<CommandGroup[]>, required: true },
    open: booleanOptional,
    defaultOpen: Boolean,
    label: String,
    placeholder: String,
    emptyLabel: String,
    /** Tecla que, con Ctrl o ⌘, abre y cierra la paleta. false la desactiva. */
    hotkey: { type: [String, Boolean] as PropType<string | false>, default: 'k' },
  },
  emits: ['update:open', 'select', 'queryChange'],
  setup(props, { attrs, emit }) {
    const t = useGrado()
    const id = autoId('k5-command')
    const [visible, setVisible] = model(
      () => props.open,
      props.defaultOpen,
      (value) => emit('update:open', value),
    )
    const query = ref(''),
      active = ref(0),
      dialog = ref<HTMLDialogElement>(),
      input = ref<HTMLInputElement>()
    const filtered = computed(() => filterGroups(props.groups, query.value))
    const items = computed<CommandItem[]>(() => filtered.value.flatMap((group) => group.items))
    const enabled = computed(() => items.value.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0))
    let unlock: (() => void) | undefined,
      previous: HTMLElement | null = null

    const close = () => {
      dialog.value?.close()
      unlock?.()
      unlock = undefined
      if (previous?.isConnected) previous.focus()
      previous = null
    }
    const onShortcut = (event: KeyboardEvent) => {
      if (!isShortcut(event, props.hotkey)) return
      event.preventDefault()
      setVisible(!visible.value)
    }
    onMounted(() => {
      document.addEventListener('keydown', onShortcut)
      watch(
        visible,
        (open) => {
          if (open && dialog.value && !dialog.value.open) {
            previous = document.activeElement as HTMLElement
            query.value = ''
            dialog.value.showModal()
            input.value?.focus()
            unlock = lockScroll(document)
          } else if (!open) close()
        },
        { immediate: true, flush: 'post' },
      )
    })
    onBeforeUnmount(() => {
      document.removeEventListener('keydown', onShortcut)
      close()
    })
    watch([query, visible], () => {
      active.value = enabled.value[0] ?? -1
    })
    watch(
      [active, visible],
      () => {
        if (visible.value && active.value >= 0)
          document.getElementById(`${id}-option-${active.value}`)?.scrollIntoView({ block: 'nearest' })
      },
      { flush: 'post' },
    )

    const choose = (item: CommandItem | undefined) => {
      if (!item || item.disabled) return
      setVisible(false)
      emit('select', item.id)
    }
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        choose(items.value[active.value])
        return
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      event.preventDefault()
      const next = nextIndex(event.key, enabled.value.indexOf(active.value), enabled.value.length)
      if (next !== null) active.value = enabled.value[next]
    }

    return () => {
      const m = t.value.messages
      const name = props.label ?? m.commandPalette
      let index = -1
      return h(
        'dialog',
        mergeProps(attrs, {
          ref: dialog,
          class: cx('k5-dialog k5-command'),
          'aria-label': name,
          'aria-modal': 'true',
          onCancel: (event: Event) => {
            event.preventDefault()
            setVisible(false)
          },
          onClick: (event: MouseEvent) => {
            if (event.target !== event.currentTarget) return
            const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)
              setVisible(false)
          },
        }),
        [
          h('div', { class: 'k5-command__search' }, [
            pathIcon(ICON_PATHS.search),
            h('input', {
              ref: input,
              class: 'k5-command__input',
              role: 'combobox',
              'aria-label': name,
              'aria-expanded': 'true',
              'aria-controls': `${id}-list`,
              'aria-autocomplete': 'list',
              'aria-activedescendant': active.value >= 0 && items.value[active.value] ? `${id}-option-${active.value}` : undefined,
              autocomplete: 'off',
              spellcheck: false,
              placeholder: props.placeholder ?? m.commandPlaceholder,
              value: query.value,
              onInput: (event: Event) => {
                query.value = (event.target as HTMLInputElement).value
                emit('queryChange', query.value)
              },
              onKeydown,
            }),
            h('kbd', { class: 'k5-command__kbd' }, 'Esc'),
          ]),
          h('div', { class: 'k5-command__list' }, [
            h(
              'div',
              { role: 'listbox', id: `${id}-list`, 'aria-label': name },
              filtered.value.map((group, g) =>
                h('div', { key: group.label, role: 'group', 'aria-labelledby': `${id}-group-${g}`, class: 'k5-command__group' }, [
                  h('p', { class: 'k5-command__group-title', id: `${id}-group-${g}` }, group.label),
                  ...group.items.map((item) => {
                    const i = ++index
                    return h(
                      'div',
                      {
                        key: item.id,
                        role: 'option',
                        id: `${id}-option-${i}`,
                        'aria-selected': i === active.value,
                        'aria-disabled': item.disabled || undefined,
                        'data-active': i === active.value,
                        class: 'k5-command__item',
                        onMousedown: (event: MouseEvent) => event.preventDefault(),
                        onMousemove: () => {
                          if (!item.disabled && i !== active.value) active.value = i
                        },
                        onClick: () => choose(item),
                      },
                      [
                        h('span', { class: 'k5-command__label' }, item.label),
                        item.description ? h('span', { class: 'k5-command__description' }, item.description) : null,
                        item.shortcut ? h('kbd', { class: 'k5-command__shortcut' }, item.shortcut) : null,
                      ],
                    )
                  }),
                ]),
              ),
            ),
            items.value.length ? null : h('p', { class: 'k5-command__empty', role: 'status' }, props.emptyLabel ?? m.noResults),
          ]),
        ],
      )
    }
  },
})
