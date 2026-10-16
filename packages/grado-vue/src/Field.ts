import { computed, defineComponent, h, inject, mergeProps, provide, useId, type ComputedRef, type InjectionKey, type PropType } from 'vue'
import { controlClass, cx, inputWrapClass, type Size } from '@1k5-tech-es/grado/classes'

export interface FieldContext {
  id: string
  describedBy?: string
  invalid: boolean
  required: boolean
}

export const FIELD_KEY: InjectionKey<ComputedRef<FieldContext>> = Symbol('k5-field')

/** Datos del Field que envuelve a un control, por si haces un control propio. */
export function useField() {
  return inject(FIELD_KEY, null)
}

/**
 * true dentro de un FormField: el formulario decide los errores, así que los campos con
 * validación propia (NifInput, IbanInput, PhoneInput, TimePicker) no pintan la suya. Uso interno.
 */
export const MANAGED_KEY: InjectionKey<boolean> = Symbol('k5-managed-field')

export const Field = defineComponent({
  name: 'K5Field',
  props: {
    label: String,
    hint: String,
    /** Si hay error, el control se marca con aria-invalid. */
    error: String,
    required: Boolean,
    /** id del control. Si no se pasa, se genera. */
    id: String,
  },
  setup(props, { slots }) {
    // Vue 3.5.0 tipa useId() como string | undefined; dentro de setup() siempre hay id.
    const auto = (useId() ?? '').replace(/[^a-zA-Z0-9_-]/g, '')
    const ids = computed(() => {
      const id = props.id ?? `k5-${auto}`
      return { id, hint: props.hint ? `${id}-hint` : undefined, error: props.error ? `${id}-error` : undefined }
    })
    provide(
      FIELD_KEY,
      computed(() => ({
        id: ids.value.id,
        describedBy: cx(ids.value.hint, ids.value.error) || undefined,
        invalid: Boolean(ids.value.error),
        required: props.required,
      })),
    )
    return () =>
      h('div', { class: 'k5-field' }, [
        props.label
          ? h('label', { class: 'k5-field__label', for: ids.value.id }, [
              props.label,
              props.required ? h('span', { class: 'k5-field__required', 'aria-hidden': 'true' }, '*') : null,
            ])
          : null,
        slots.default?.(),
        ids.value.hint ? h('p', { class: 'k5-field__hint', id: ids.value.hint }, props.hint) : null,
        ids.value.error ? h('p', { class: 'k5-field__error', id: ids.value.error }, props.error) : null,
      ])
  },
})

const controlProps = {
  id: String,
  required: { type: Boolean, default: undefined },
  invalid: { type: Boolean, default: undefined },
}

/** Atributos que un control recibe de su Field. Uso interno de Grado. */
export function useControl(props: { id?: string; required?: boolean; invalid?: boolean }, attrs: Record<string, unknown>) {
  const field = useField()
  return () => {
    const f = field?.value
    return {
      id: props.id ?? f?.id,
      required: props.required ?? (f?.required || undefined),
      'aria-invalid': (props.invalid ?? f?.invalid) ? 'true' : undefined,
      'aria-describedby': cx(attrs['aria-describedby'], f?.describedBy) || undefined,
    }
  }
}

const valueOf = (event: Event) => (event.target as HTMLInputElement).value

export const Input = defineComponent({
  name: 'K5Input',
  inheritAttrs: false,
  props: {
    ...controlProps,
    modelValue: [String, Number] as PropType<string | number>,
    size: String as PropType<Size>,
    /** Texto delante: €. También como slot #prefix. */
    prefix: String,
    /** Texto detrás: kWp, kWh, %. También como slot #suffix. */
    suffix: String,
  },
  emits: { 'update:modelValue': (value: string) => typeof value === 'string' },
  setup(props, { attrs, emit, slots }) {
    const control = useControl(props, attrs)
    return () => {
      const prefix = slots.prefix?.() ?? props.prefix
      const suffix = slots.suffix?.() ?? props.suffix
      const affixed = Boolean(prefix) || Boolean(suffix)
      const input = h(
        'input',
        mergeProps({ class: controlClass('input', { size: affixed ? 'md' : props.size }) }, attrs, control(), {
          ...(props.modelValue !== undefined ? { value: props.modelValue } : {}),
          onInput: (event: Event) => emit('update:modelValue', valueOf(event)),
        }),
      )
      if (!affixed) return input
      return h('div', { class: inputWrapClass({ size: props.size }) }, [
        prefix ? h('span', { class: 'k5-input-wrap__affix' }, prefix) : null,
        input,
        suffix ? h('span', { class: 'k5-input-wrap__affix' }, suffix) : null,
      ])
    }
  },
})

export const Textarea = defineComponent({
  name: 'K5Textarea',
  inheritAttrs: false,
  props: { ...controlProps, modelValue: String },
  emits: { 'update:modelValue': (value: string) => typeof value === 'string' },
  setup(props, { attrs, emit }) {
    const control = useControl(props, attrs)
    return () =>
      h(
        'textarea',
        mergeProps({ class: controlClass('textarea') }, attrs, control(), {
          ...(props.modelValue !== undefined ? { value: props.modelValue } : {}),
          onInput: (event: Event) => emit('update:modelValue', valueOf(event)),
        }),
      )
  },
})

export const Select = defineComponent({
  name: 'K5Select',
  inheritAttrs: false,
  props: { ...controlProps, modelValue: String, size: String as PropType<Size> },
  emits: { 'update:modelValue': (value: string) => typeof value === 'string' },
  setup(props, { attrs, emit, slots }) {
    const control = useControl(props, attrs)
    return () =>
      h(
        'select',
        mergeProps({ class: controlClass('select', { size: props.size }) }, attrs, control(), {
          ...(props.modelValue !== undefined ? { value: props.modelValue } : {}),
          onChange: (event: Event) => emit('update:modelValue', valueOf(event)),
        }),
        slots.default?.(),
      )
  },
})
