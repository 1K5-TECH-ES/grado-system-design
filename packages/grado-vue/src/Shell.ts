import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  useId,
  watch,
  type Component,
  type ComputedRef,
  type InjectionKey,
  type PropType,
  type VNodeArrayChildren,
} from 'vue'
import { ICON_PATHS, LOGO, SIDEBAR_ID, appShellClass } from '@1k5/grado/classes'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

const SHELL_KEY: InjectionKey<ComputedRef<{ collapsed: boolean }>> = Symbol('k5-shell')
const autoId = (prefix: string, id: string) => `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`
const iconProp = [Object, Function] as PropType<Component>

export const AppLogo = defineComponent({
  name: 'K5AppLogo',
  props: { label: { type: String, default: '1KOMMA5°' } },
  setup(props) {
    return () =>
      h('svg', { class: 'k5-logo', viewBox: LOGO.viewBox, role: 'img', 'aria-label': props.label }, [
        ...LOGO.letters.map((d) => h('path', { fill: 'currentColor', d })),
        h('path', { class: 'k5-logo__ring', d: LOGO.ring }),
      ])
  },
})

/**
 * Slots: #brand (sustituye a logo + producto), #search, #actions, #sidebar,
 * #sidebar-footer y el slot por defecto (contenido de la página).
 */
export const AppShell = defineComponent({
  name: 'K5AppShell',
  props: {
    /** Nombre de la app junto al logo: «Sales Coach». */
    product: String,
    /** Barra lateral solo con iconos (escritorio). */
    collapsed: Boolean,
    /** id del <main>, destino del enlace «Saltar al contenido». */
    mainId: { type: String, default: 'contenido' },
    skipLabel: String,
    menuLabel: String,
  },
  setup(props, { slots }) {
    const t = useGrado()
    const navOpen = ref(false)
    const menu = ref<HTMLButtonElement | null>(null)
    const sidebar = ref<HTMLElement | null>(null)
    provide(
      SHELL_KEY,
      computed(() => ({ collapsed: props.collapsed })),
    )

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      navOpen.value = false
      menu.value?.focus()
    }
    watch(navOpen, (open) => {
      if (typeof document === 'undefined') return
      if (!open) return document.removeEventListener('keydown', onKey)
      document.addEventListener('keydown', onKey)
      nextTick(() => sidebar.value?.querySelector<HTMLElement>('a, button')?.focus())
    })
    onBeforeUnmount(() => {
      if (typeof document !== 'undefined') document.removeEventListener('keydown', onKey)
    })
    const closeOnLink = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('a')) navOpen.value = false
    }

    return () => {
      const brand = (): VNodeArrayChildren =>
        slots.brand?.() ?? [h(AppLogo), props.product ? h('span', { class: 'k5-app__product' }, props.product) : null]
      const hasSidebar = Boolean(slots.sidebar)
      return h('div', { class: appShellClass({ collapsed: props.collapsed, navOpen: navOpen.value }) }, [
        h('a', { class: 'k5-app__skip', href: `#${props.mainId}` }, props.skipLabel ?? t.value.messages.skipToContent),
        h('header', { class: 'k5-app__header' }, [
          hasSidebar
            ? h(
                'button',
                {
                  ref: menu,
                  type: 'button',
                  class: 'k5-btn k5-btn--ghost k5-btn--icon k5-app__menu',
                  'aria-label': props.menuLabel ?? t.value.messages.menu,
                  'aria-expanded': String(navOpen.value),
                  'aria-controls': SIDEBAR_ID,
                  onClick: () => {
                    navOpen.value = !navOpen.value
                  },
                },
                [pathIcon(ICON_PATHS.menu)],
              )
            : null,
          h('div', { class: 'k5-app__brand' }, brand()),
          slots.search ? h('div', { class: 'k5-app__search' }, slots.search()) : null,
          slots.actions ? h('div', { class: 'k5-app__actions' }, slots.actions()) : null,
        ]),
        hasSidebar
          ? h('aside', { ref: sidebar, id: SIDEBAR_ID, class: 'k5-app__sidebar', onClick: closeOnLink }, [
              h('div', { class: 'k5-app__sidebar-brand' }, brand()),
              h('div', { class: 'k5-app__nav' }, slots.sidebar?.()),
              slots['sidebar-footer'] ? h('div', { class: 'k5-app__sidebar-footer' }, slots['sidebar-footer']()) : null,
            ])
          : null,
        hasSidebar
          ? h('div', {
              class: 'k5-app__backdrop',
              'aria-hidden': 'true',
              onClick: () => {
                navOpen.value = false
              },
            })
          : null,
        h('main', { id: props.mainId, tabindex: '-1', class: 'k5-app__main' }, slots.default?.()),
      ])
    }
  },
})

/** Botón que abre la búsqueda o la paleta de comandos de la app. */
export const AppSearch = defineComponent({
  name: 'K5AppSearch',
  props: {
    /** Texto del botón y nombre accesible: «Buscar clientes o tickets». */
    label: String,
    /** Atajo de teclado que se muestra: «⌘K». */
    shortcut: String,
  },
  setup(props) {
    const t = useGrado()
    return () => {
      const label = props.label ?? t.value.messages.search
      return h('button', { type: 'button', 'aria-label': label, class: 'k5-app-search' }, [
        pathIcon(ICON_PATHS.search),
        h('span', { class: 'k5-app-search__label' }, label),
        props.shortcut ? h('kbd', { class: 'k5-app-search__kbd' }, props.shortcut) : null,
      ])
    }
  },
})

export const Nav = defineComponent({
  name: 'K5Nav',
  props: { label: String },
  setup(props, { slots }) {
    const t = useGrado()
    return () => h('nav', { 'aria-label': props.label ?? t.value.messages.mainNavigation, class: 'k5-nav' }, slots.default?.())
  },
})

export const NavSection = defineComponent({
  name: 'K5NavSection',
  props: { title: String },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'k5-nav__section' }, [props.title ? h('p', { class: 'k5-nav__title' }, props.title) : null, slots.default?.()])
  },
})

export const NavItem = defineComponent({
  name: 'K5NavItem',
  props: {
    /** Componente del enlace: RouterLink. Por defecto <a>. */
    as: { type: [String, Object, Function] as PropType<string | Component>, default: 'a' },
    label: { type: String, required: true },
    icon: iconProp,
    /** Contador a la derecha: tickets sin leer… */
    badge: [String, Number],
    /** Fuerza el estado activo (aria-current="page"). RouterLink ya lo pone en la ruta exacta. */
    active: { type: Boolean, default: undefined },
  },
  setup(props) {
    const shell = inject(SHELL_KEY, null)
    return () => {
      const children = [
        props.icon ? h(props.icon, { 'aria-hidden': 'true' }) : null,
        h('span', { class: 'k5-nav-item__label' }, props.label),
        props.badge != null && props.badge !== '' ? h('span', { class: 'k5-nav-item__badge' }, String(props.badge)) : null,
      ]
      const data = {
        ...(props.active ? { 'aria-current': 'page' } : {}),
        ...(shell?.value.collapsed ? { title: props.label } : {}),
        class: 'k5-nav-item',
      }
      return typeof props.as === 'string' ? h(props.as, data, children) : h(props.as, data, { default: () => children })
    }
  },
})

export const NavGroup = defineComponent({
  name: 'K5NavGroup',
  props: {
    label: { type: String, required: true },
    icon: iconProp,
    badge: [String, Number],
    /** Marca el grupo cuando la página actual está dentro. */
    active: Boolean,
    defaultOpen: Boolean,
    /** Abierto o cerrado desde fuera; úsalo con v-model:open. */
    open: { type: Boolean, default: undefined },
  },
  emits: { 'update:open': (open: boolean) => typeof open === 'boolean' },
  setup(props, { emit, slots }) {
    const shell = inject(SHELL_KEY, null)
    const inner = ref(props.defaultOpen)
    const id = autoId('k5-group', useId())
    const isOpen = computed(() => props.open ?? inner.value)
    const toggle = () => {
      if (props.open === undefined) inner.value = !isOpen.value
      emit('update:open', !isOpen.value)
    }
    return () =>
      h('div', { class: 'k5-nav-group' }, [
        h(
          'button',
          {
            type: 'button',
            class: 'k5-nav-item',
            'aria-expanded': String(isOpen.value),
            'aria-controls': id,
            'data-active': props.active ? 'true' : undefined,
            onClick: toggle,
            ...(shell?.value.collapsed ? { title: props.label } : {}),
          },
          [
            props.icon ? h(props.icon, { 'aria-hidden': 'true' }) : null,
            h('span', { class: 'k5-nav-item__label' }, props.label),
            props.badge != null && props.badge !== '' ? h('span', { class: 'k5-nav-item__badge' }, String(props.badge)) : null,
            pathIcon(ICON_PATHS.chevronRight, 'k5-nav-group__chevron'),
          ],
        ),
        h('div', { class: 'k5-nav-group__items', id, hidden: !isOpen.value }, slots.default?.()),
      ])
  },
})
