import { computed, defineComponent, inject, provide, type App, type ComputedRef, type InjectionKey, type PropType } from 'vue'
import { DEFAULT_LOCALE, messagesFor, type Messages } from '@1k5/grado/messages'

export interface GradoContext {
  locale: string
  messages: Messages
  overrides?: Partial<Messages>
}

export interface GradoOptions {
  /** Idioma de los textos y de los números y fechas: es-ES (por defecto), de-DE, en-GB… */
  locale?: string
  /** Cambia textos sueltos: { noResults: 'Sin coincidencias' }. */
  messages?: Partial<Messages>
}

export const GRADO_KEY: InjectionKey<ComputedRef<GradoContext>> = Symbol('k5-grado')
const SPANISH = computed<GradoContext>(() => ({ locale: DEFAULT_LOCALE, messages: messagesFor(DEFAULT_LOCALE) }))

function resolve(options: GradoOptions, parent?: GradoContext): GradoContext {
  const locale = options.locale ?? parent?.locale ?? DEFAULT_LOCALE
  const overrides = options.locale ? options.messages : { ...parent?.overrides, ...options.messages }
  return { locale, overrides, messages: messagesFor(locale, overrides) }
}

/** Idioma y textos activos. Llámalo dentro de setup(). Sin proveedor, Grado habla español. */
export function useGrado(): ComputedRef<GradoContext> {
  return inject(GRADO_KEY, SPANISH)
}

/** Plugin para toda la app: app.use(Grado, { locale: 'de-DE' }). */
export const Grado = {
  install(app: App, options: GradoOptions = {}) {
    app.provide(
      GRADO_KEY,
      computed(() => resolve(options)),
    )
  },
}

/** Idioma para una parte de la página. Las props de cada componente siguen teniendo prioridad. */
export const GradoProvider = defineComponent({
  name: 'K5GradoProvider',
  props: {
    locale: String,
    messages: Object as PropType<Partial<Messages>>,
  },
  setup(props, { slots }) {
    const parent = useGrado()
    provide(
      GRADO_KEY,
      computed(() => resolve({ locale: props.locale, messages: props.messages }, parent.value)),
    )
    return () => slots.default?.()
  },
})
