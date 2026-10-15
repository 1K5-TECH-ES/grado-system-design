import { computed, defineComponent, h, mergeProps, ref, type PropType } from 'vue'
import { cx, FIELD_ICON_PATHS, ICON_PATHS, type Size } from '@1k5-tech-es/grado/classes'
import { Input, useField } from './Field.js'
import { pathIcon } from './PathIcon.js'
import { Spinner } from './Spinner.js'
import { useGrado } from './Locale.js'
import { autoId, booleanOptional, model } from './helpers.js'

/**
 * Búsqueda con lupa delante y botón para borrar cuando hay texto. Escape también borra
 * (y no cierra el diálogo que la contiene mientras quede texto). Emite clear al borrar.
 */
export const SearchInput = defineComponent({
  name: 'K5SearchInput',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    /** Spinner en lugar de la lupa mientras llegan los resultados. */
    loading: Boolean,
    size: String as PropType<Size>,
    /** Nombre accesible si no hay Field con etiqueta. Por defecto, «Buscar». */
    label: String,
    /** Texto del botón de borrar. Por defecto, «Borrar búsqueda». */
    clearLabel: String,
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    required: booleanOptional,
    invalid: booleanOptional,
    id: String,
  },
  emits: ['update:modelValue', 'clear'],
  setup(props, { attrs, emit, expose }) {
    const t = useGrado()
    const field = useField()
    const auto = autoId('k5-search')
    const inputId = computed(() => props.id ?? field?.value.id ?? auto)
    const [text, setText] = model(
      () => props.modelValue,
      props.defaultValue,
      (value) => emit('update:modelValue', value),
    )
    const root = ref<HTMLElement>()
    const focus = () => root.value?.querySelector('input')?.focus()
    expose({ focus })
    const clear = () => {
      setText('')
      emit('clear')
      focus()
    }
    return () => {
      const m = t.value.messages
      const { class: className, ...rest } = attrs
      const editable = !props.disabled && !props.readonly
      return h('div', { ref: root, class: cx('k5-search-input', className as string) }, [
        h(
          Input,
          mergeProps(rest, {
            id: inputId.value,
            type: 'search',
            size: props.size,
            'aria-label': props.label ?? (field ? undefined : m.search),
            'aria-busy': props.loading || undefined,
            placeholder: props.placeholder ?? m.searchPlaceholder,
            disabled: props.disabled,
            readonly: props.readonly,
            required: props.required,
            invalid: props.invalid,
            modelValue: text.value,
            'onUpdate:modelValue': setText,
            onKeydown: (event: KeyboardEvent) => {
              if (event.defaultPrevented || event.key !== 'Escape' || !text.value || !editable) return
              event.preventDefault()
              event.stopPropagation()
              clear()
            },
          }),
          {
            prefix: () =>
              props.loading ? h(Spinner, { size: 'sm', decorative: true }) : pathIcon(ICON_PATHS.search, 'k5-search-input__icon'),
            ...(text.value && editable
              ? {
                  suffix: () =>
                    h(
                      'button',
                      {
                        type: 'button',
                        class: 'k5-input-action',
                        'aria-label': props.clearLabel ?? m.clearSearch,
                        'aria-controls': inputId.value,
                        onClick: clear,
                      },
                      [pathIcon(ICON_PATHS.x)],
                    ),
                }
              : {}),
          },
        ),
      ])
    }
  },
})

/** Contraseña con un botón para mostrarla u ocultarla. */
export const PasswordInput = defineComponent({
  name: 'K5PasswordInput',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: '' },
    /** current-password para entrar; new-password al crearla o cambiarla. */
    autocomplete: { type: String, default: 'current-password' },
    size: String as PropType<Size>,
    /** Nombre del botón (no cambia al pulsarlo: aria-pressed dice si se ve). Por defecto, «Mostrar contraseña». */
    showLabel: String,
    /** Pista visible al pasar el ratón con la contraseña a la vista. Por defecto, «Ocultar contraseña». */
    hideLabel: String,
    disabled: Boolean,
    required: booleanOptional,
    invalid: booleanOptional,
    id: String,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const t = useGrado()
    const field = useField()
    const auto = autoId('k5-password')
    const inputId = computed(() => props.id ?? field?.value.id ?? auto)
    const [text, setText] = model(
      () => props.modelValue,
      props.defaultValue,
      (value) => emit('update:modelValue', value),
    )
    const visible = ref(false)
    return () => {
      const m = t.value.messages
      const { class: className, ...rest } = attrs
      const show = props.showLabel ?? m.showPassword
      return h('div', { class: cx('k5-password-input', className as string) }, [
        h(
          Input,
          mergeProps(rest, {
            id: inputId.value,
            type: visible.value ? 'text' : 'password',
            size: props.size,
            autocomplete: props.autocomplete,
            autocapitalize: 'off',
            spellcheck: 'false',
            disabled: props.disabled,
            required: props.required,
            invalid: props.invalid,
            modelValue: text.value,
            'onUpdate:modelValue': setText,
          }),
          {
            suffix: () =>
              h(
                'button',
                {
                  type: 'button',
                  class: 'k5-input-action',
                  'aria-label': show,
                  'aria-pressed': visible.value ? 'true' : 'false',
                  'aria-controls': inputId.value,
                  title: visible.value ? (props.hideLabel ?? m.hidePassword) : show,
                  disabled: props.disabled,
                  onClick: () => (visible.value = !visible.value),
                },
                [pathIcon(visible.value ? FIELD_ICON_PATHS.eyeOff : FIELD_ICON_PATHS.eye)],
              ),
          },
        ),
      ])
    }
  },
})
