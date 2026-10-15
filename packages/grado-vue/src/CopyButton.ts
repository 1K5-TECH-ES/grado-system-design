import { defineComponent, h, onBeforeUnmount, ref, type PropType } from 'vue'
import { copyButtonClass, DATA_ICON_PATHS, ICON_PATHS, type Size } from '@1k5/grado/classes'
import { copyText } from '@1k5/grado/patterns'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

/** Copia un texto al portapapeles y lo anuncia a los lectores de pantalla. */
export const CopyButton = defineComponent({
  name: 'K5CopyButton',
  // La clase va al contenedor; el resto de atributos (aria-describedby…), al botón.
  inheritAttrs: false,
  props: {
    /** Texto que se copia. */
    value: { type: String, required: true },
    /** Texto del botón (o su nombre con iconOnly). Por defecto, «Copiar». */
    label: String,
    /** Texto durante 2 s después de copiar. Por defecto, «Copiado». */
    copiedLabel: String,
    /** Solo el icono; label pasa a ser su nombre accesible. */
    iconOnly: Boolean,
    size: String as PropType<Size>,
  },
  emits: { copy: (value: string) => typeof value === 'string' },
  setup(props, { emit, attrs }) {
    const t = useGrado()
    const state = ref<'idle' | 'copied' | 'failed'>('idle')
    let timer: ReturnType<typeof setTimeout> | undefined
    onBeforeUnmount(() => clearTimeout(timer))
    const copy = async () => {
      const ok = await copyText(props.value)
      state.value = ok ? 'copied' : 'failed'
      if (ok) emit('copy', props.value)
      clearTimeout(timer)
      timer = setTimeout(() => (state.value = 'idle'), 2000)
    }
    return () => {
      const m = t.value.messages
      const name = props.label ?? m.copy,
        done = props.copiedLabel ?? m.copied,
        copied = state.value === 'copied'
      const { class: className, ...rest } = attrs
      return h('span', { class: ['k5-copy', className] }, [
        h(
          'button',
          {
            ...rest,
            type: 'button',
            class: copyButtonClass({ size: props.size, iconOnly: props.iconOnly, copied }),
            onClick: copy,
            ...(props.iconOnly ? { 'aria-label': name, title: name } : {}),
          },
          [pathIcon(copied ? ICON_PATHS.check : DATA_ICON_PATHS.copy), props.iconOnly ? null : copied ? done : name],
        ),
        h('span', { class: 'k5-sr-only', role: 'status' }, copied ? done : state.value === 'failed' ? m.copyFailed : ''),
      ])
    }
  },
})
