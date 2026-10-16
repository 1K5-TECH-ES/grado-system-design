// Labs: utilidades que las apps escribían cada una a su manera. Fuera de la promesa de la 1.0:
// pueden cambiar en una versión menor hasta que pasen al paquete principal.
//   import { Amount, RelativeTime, ThemeToggle } from '@1k5-tech-es/grado-vue/labs'
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, toValue, watch, type MaybeRefOrGetter, type PropType } from 'vue'
import { cx, type Size } from '@1k5-tech-es/grado/classes'
import {
  applyThemeMode,
  formatAmount,
  formatDateTime,
  formatRelative,
  isTypingTarget,
  matchesHotkey,
  parseHotkey,
  readThemeMode,
  relativeRefresh,
  resolveThemeMode,
  saveThemeMode,
  THEME_STORAGE_KEY,
  type AmountUnit,
  type DateInput,
  type ThemeMode,
} from '@1k5-tech-es/grado/labs'
import { useGrado } from './Locale.js'
import { SegmentedControl } from './Inputs.js'

export { formatEuro, formatEnergy, formatPower, formatRelative, themeScript, hotkeyLabel } from '@1k5-tech-es/grado/labs'
export type { AmountUnit, ThemeMode } from '@1k5-tech-es/grado/labs'

// ---------- Amount ----------

/**
 * Un importe, una energía o una potencia con su formato en español y cifras alineadas:
 * «1234,50 €», «7,2 kWh», «6,4 kWp». Es un <data> con el número sin formato en value.
 */
export const Amount = defineComponent({
  name: 'K5Amount',
  props: {
    value: { type: Number as PropType<number | null>, default: null },
    /** eur, kWh, kW, kWp, percent (0.12 → 12 %) o number. */
    unit: { type: String as PropType<AmountUnit>, default: 'number' },
    /** Por defecto: 2 en euros y números, 1 en energía y potencia, 0 en porcentajes. */
    decimals: Number,
    /** Cambia de unidad con cifras grandes: 12 500 kWh → 12,5 MWh. */
    scale: Boolean,
    /** Con signo: «+12,00 €». Para variaciones. */
    signed: Boolean,
    /** Verde si es positivo y rojo si es negativo. */
    colored: Boolean,
    /** Texto si no hay valor. Por defecto «—». */
    empty: { type: String, default: '—' },
  },
  setup(props) {
    const t = useGrado()
    return () => {
      const value = props.value
      const known = value != null && !Number.isNaN(value)
      return h(
        'data',
        {
          value: known ? String(value) : '',
          class: cx(
            'k5-amount',
            props.colored && known && value > 0 && 'k5-amount--positive',
            props.colored && known && value < 0 && 'k5-amount--negative',
          ),
        },
        known
          ? formatAmount(value, {
              unit: props.unit,
              locale: t.value.locale,
              decimals: props.decimals,
              scale: props.scale,
              signed: props.signed,
            })
          : props.empty,
      )
    }
  },
})

// ---------- RelativeTime ----------

/**
 * «hace 5 minutos», «ayer», «16 oct». Se actualiza sola (cada minuto la primera hora) y lleva
 * la fecha completa en title y en datetime.
 */
export const RelativeTime = defineComponent({
  name: 'K5RelativeTime',
  props: {
    value: { type: [Date, String, Number] as PropType<DateInput>, required: true },
    /** «Ahora» de referencia. Por defecto, el reloj; útil en tests y en el servidor. */
    now: [Date, String, Number] as PropType<DateInput>,
    /** Segundos a partir de los que se pone la fecha y no «hace…». Por defecto, una semana. */
    max: Number,
  },
  setup(props, { attrs }) {
    const t = useGrado()
    const tick = ref(0)
    const date = computed(() => (props.value instanceof Date ? props.value : new Date(props.value)))
    let timer: ReturnType<typeof setInterval> | undefined
    const schedule = () => {
      clearInterval(timer)
      timer = undefined
      if (props.now != null || Number.isNaN(date.value.getTime())) return
      const every = relativeRefresh(date.value)
      if (every) timer = setInterval(() => tick.value++, every)
    }
    onMounted(schedule)
    watch(() => [props.now, date.value.getTime()], schedule)
    onBeforeUnmount(() => clearInterval(timer))
    return () => {
      void tick.value
      const valid = !Number.isNaN(date.value.getTime())
      return h(
        'time',
        {
          datetime: valid ? date.value.toISOString() : undefined,
          title: (attrs.title as string | undefined) ?? (valid ? formatDateTime(date.value, { locale: t.value.locale }) : undefined),
          class: 'k5-relative-time',
        },
        valid ? formatRelative(date.value, { now: props.now ?? Date.now(), locale: t.value.locale, max: props.max }) : '',
      )
    }
  },
})

// ---------- Tema ----------

const THEME_EVENT = 'k5-theme-change'

export interface ThemeOptions {
  /** Clave en localStorage. Por defecto «k5-mode». */
  storageKey?: string
  /** Pone o quita la clase dark en <html>. false: solo guarda y devuelve la elección. */
  apply?: boolean
}

/**
 * Tema claro, oscuro o del sistema: lo guarda en localStorage y pone la clase dark en <html>.
 * Todos los useTheme con la misma clave se enteran del cambio. Para que no parpadee al cargar,
 * pon themeScript() en un <script> del <head>. Llámalo dentro de setup().
 */
export function useTheme({ storageKey = THEME_STORAGE_KEY, apply = true }: ThemeOptions = {}) {
  const mode = ref<ThemeMode>('system')
  const prefersDark = ref(false)
  let media: MediaQueryList | undefined
  const sync = () => {
    mode.value = readThemeMode(storageKey)
    prefersDark.value = media?.matches ?? false
    if (apply) applyThemeMode(mode.value)
  }
  onMounted(() => {
    media = matchMedia('(prefers-color-scheme: dark)')
    sync()
    media.addEventListener('change', sync)
    window.addEventListener(THEME_EVENT, sync)
    window.addEventListener('storage', sync)
  })
  onBeforeUnmount(() => {
    media?.removeEventListener('change', sync)
    window.removeEventListener(THEME_EVENT, sync)
    window.removeEventListener('storage', sync)
  })
  const setMode = (next: ThemeMode) => {
    saveThemeMode(next, storageKey)
    // Aplica aunque no haya almacenamiento (modo privado): los demás se enteran por el evento.
    if (apply) applyThemeMode(next)
    mode.value = next
    window.dispatchEvent(new Event(THEME_EVENT))
  }
  return { mode, setMode, resolved: computed(() => resolveThemeMode(mode.value, prefersDark.value)) }
}

/** Claro, Oscuro o Sistema, con useTheme. */
export const ThemeToggle = defineComponent({
  name: 'K5ThemeToggle',
  props: {
    size: { type: String as PropType<Size>, default: 'sm' },
    /** Clave en localStorage. Por defecto «k5-mode». */
    storageKey: String,
    /** Pone o quita la clase dark en <html>. false: solo guarda la elección. */
    apply: { type: Boolean, default: true },
  },
  setup(props) {
    const t = useGrado()
    const { mode, setMode } = useTheme({ storageKey: props.storageKey, apply: props.apply })
    return () => {
      const m = t.value.messages
      return h(SegmentedControl, {
        size: props.size,
        label: m.themeLabel,
        modelValue: mode.value,
        'onUpdate:modelValue': (value: string) => setMode(value as ThemeMode),
        options: [
          { value: 'light', label: m.themeLight },
          { value: 'dark', label: m.themeDark },
          { value: 'system', label: m.themeSystem },
        ],
      })
    }
  },
})

// ---------- ScrollArea ----------

/**
 * Zona con su propio scroll y barra fina del color de la marca. Se puede recorrer con el teclado:
 * recibe el foco con Tab y las flechas la desplazan.
 */
export const ScrollArea = defineComponent({
  name: 'K5ScrollArea',
  props: {
    /** Nombre de la zona para lectores de pantalla: «Mensajes», «Historial». */
    label: { type: String, required: true },
    /** Alto máximo: número en píxeles o medida CSS. Sin él, el del contenedor. */
    maxHeight: [Number, String],
    /** vertical (por defecto), horizontal o both. */
    orientation: { type: String as PropType<'vertical' | 'horizontal' | 'both'>, default: 'vertical' },
  },
  setup(props, { slots }) {
    return () => {
      const height = props.maxHeight == null ? undefined : typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
      return h(
        'div',
        {
          role: 'region',
          'aria-label': props.label,
          tabindex: 0,
          class: cx('k5-scroll-area', props.orientation !== 'vertical' && `k5-scroll-area--${props.orientation}`),
          ...(height ? { style: { '--_height': height } } : {}),
        },
        slots.default?.(),
      )
    }
  },
})

// ---------- Atajos ----------

export interface HotkeyOptions {
  enabled?: MaybeRefOrGetter<boolean>
  /** Si salta con el foco en un campo de texto. Por defecto, solo los atajos con Ctrl/⌘ o Alt. */
  allowInInputs?: boolean
  /** Evita lo que haría el navegador con ese atajo (Ctrl+K busca en la barra). Por defecto, sí. */
  preventDefault?: boolean
}

/** Llama a handler con el atajo: useHotkey('mod+k', abrir). mod es ⌘ en Mac y Ctrl en el resto. Dentro de setup(). */
export function useHotkey(hotkey: string, handler: (event: KeyboardEvent) => void, options: HotkeyOptions = {}) {
  const want = parseHotkey(hotkey)
  const inInputs = options.allowInInputs ?? (want.mod || want.ctrl || want.meta || want.alt)
  const onKey = (event: KeyboardEvent) => {
    if (toValue(options.enabled ?? true) === false) return
    if (event.defaultPrevented || !matchesHotkey(event, want)) return
    if (!inInputs && isTypingTarget(event.target)) return
    if (options.preventDefault !== false) event.preventDefault()
    handler(event)
  }
  onMounted(() => document.addEventListener('keydown', onKey))
  onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
}

// ---------- VisuallyHidden ----------

/** Texto solo para lectores de pantalla: «(se abre en otra pestaña)», el nombre de un icono… */
export const VisuallyHidden = defineComponent({
  name: 'K5VisuallyHidden',
  props: {
    /** Etiqueta del elemento. Por defecto, span. */
    as: { type: String, default: 'span' },
  },
  setup(props, { slots }) {
    return () => h(props.as, { class: 'k5-sr-only' }, slots.default?.())
  },
})
