// Adaptador de VeeValidate:
//   import { Form, FormField, ErrorSummary } from '@1k5-tech-es/grado-vue/vee-validate'
// vee-validate es una dependencia opcional: solo la necesita quien importe este archivo.
import { cloneVNode, defineComponent, h, inject, onBeforeUnmount, provide, type InjectionKey, type PropType, type VNode } from 'vue'
import { useField, useForm, useFormErrors, useSubmitCount, type GenericObject } from 'vee-validate'
import { checkValue, fieldId, focusField, type ErrorSummaryItem, type FieldCheck } from '@1k5-tech-es/grado/patterns'
import { IbanInput, NifInput, PhoneInput } from './CodeInputs.js'
import { ErrorSummary as ErrorSummaryView } from './ErrorSummary.js'
import { Field, MANAGED_KEY } from './Field.js'
import { autoId } from './helpers.js'
import { useGrado } from './Locale.js'
import { TimePicker } from './TimePicker.js'

// Campos que validan su propio formato y lo cuentan con el evento error-change.
const FORMATTED = new Set<unknown>([NifInput, IbanInput, PhoneInput, TimePicker])

interface Registered {
  id: string
  label?: string
}
const REGISTRY: InjectionKey<{
  prefix: string
  fields: Map<string, Registered>
  initialErrors?: Record<string, string | undefined>
}> = Symbol('k5-form')

function useRegistry(component: string) {
  const registry = inject(REGISTRY, null)
  if (!registry) throw new Error(`${component} tiene que estar dentro de Form (@1k5-tech-es/grado-vue/vee-validate).`)
  return registry
}

/** <form> con VeeValidate. Los FormField de dentro se registran solos; ErrorSummary los lista. */
export const Form = defineComponent({
  name: 'K5Form',
  props: {
    /** Valores iniciales de los campos. */
    initialValues: Object as PropType<GenericObject>,
    /** Errores iniciales, por ejemplo los que devuelve el servidor. */
    initialErrors: Object as PropType<Record<string, string | undefined>>,
  },
  emits: {
    /** Con todos los campos válidos: los valores. */
    submit: (values: GenericObject) => Boolean(values),
    /** Con algún error. El foco ya va al primer campo con error. */
    invalid: (errors: Record<string, string | undefined>) => Boolean(errors),
  },
  setup(props, { emit, slots, expose }) {
    const form = useForm({ initialValues: props.initialValues, initialErrors: props.initialErrors })
    const fields = new Map<string, Registered>()
    provide(REGISTRY, { prefix: autoId('k5-form'), fields, initialErrors: props.initialErrors })
    const submit = form.handleSubmit(
      (values) => emit('submit', values),
      ({ errors }) => {
        // Como react-hook-form: el foco va al primer campo con error, en el orden de la página.
        const first = [...fields].find(([name]) => errors[name])
        if (first) focusField(first[1].id)
        emit('invalid', errors)
      },
    )
    expose({ form })
    return () =>
      h(
        'form',
        { novalidate: true, class: 'k5-form', onSubmit: submit },
        slots.default?.({ values: form.values, errors: form.errors.value }),
      )
  },
})

/**
 * Un campo del formulario: Field con etiqueta, ayuda y error, y el control del slot conectado a VeeValidate
 * con v-model. El error se ve al enviar y, después, al cambiar el valor.
 */
export const FormField = defineComponent({
  name: 'K5FormField',
  props: {
    name: { type: String, required: true },
    label: String,
    hint: String,
    /** Obligatorio: asterisco, aria-required y el error «Este campo es obligatorio» si está vacío. */
    required: Boolean,
    /** Comprobaciones propias, en orden: (valor, valores) => true, el texto del error o false. Pueden ser async. */
    validate: [Function, Array] as PropType<FieldCheck | FieldCheck[]>,
    /** id del control. Por defecto, sale del nombre. */
    id: String,
  },
  setup(props, { slots }) {
    const t = useGrado()
    const registry = useRegistry('FormField')
    provide(MANAGED_KEY, true)
    const submitCount = useSubmitCount()
    let formatError = ''
    const field = useField(
      () => props.name,
      async (value, context) =>
        (await checkValue(value, context.form, {
          required: props.required,
          formatError,
          checks: props.validate,
          messages: t.value.messages,
        })) || true,
      { validateOnValueUpdate: false, label: props.label },
    )
    // VeeValidate aplica initialErrors al montar el formulario; así ya se ven en el primer render.
    const initial = registry.initialErrors?.[props.name]
    if (initial) field.setErrors(initial)
    onBeforeUnmount(() => registry.fields.delete(props.name))
    return () => {
      const id = props.id ?? fieldId(registry.prefix, props.name)
      registry.fields.set(props.name, { id, label: props.label })
      const [child] = (slots.default?.() ?? []) as VNode[]
      const bound: Record<string, unknown> = {
        name: props.name,
        modelValue: field.value.value,
        // Tras el primer envío se valida en cada cambio, como react-hook-form.
        'onUpdate:modelValue': (next: unknown) => field.setValue(next, submitCount.value > 0),
      }
      if (child && FORMATTED.has(child.type))
        bound.onErrorChange = (message: string) => {
          formatError = message
          if (submitCount.value > 0) void field.validate()
        }
      return h(
        Field,
        {
          id,
          label: props.label,
          hint: props.hint,
          required: props.required,
          error: field.errorMessage.value,
          'data-k5-field': id,
          // Para Combobox, RadioGroup… solo cuenta como «salir» cuando el foco deja todo el campo.
          onFocusout: (event: FocusEvent) => {
            if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) field.handleBlur(event)
          },
        },
        () => (child ? cloneVNode(child, bound, true) : null),
      )
    }
  },
})

/** Los errores del Form, con un enlace a cada campo. Aparece al enviar con errores y se va al corregirlos. */
export const ErrorSummary = defineComponent({
  name: 'K5FormErrorSummary',
  props: {
    /** Por defecto, «Revisa 2 campos antes de continuar». */
    title: String,
  },
  setup(props) {
    const registry = useRegistry('ErrorSummary')
    const errors = useFormErrors()
    const submitCount = useSubmitCount()
    return () => {
      if (!submitCount.value) return null
      const list: ErrorSummaryItem[] = [...registry.fields].flatMap(([name, item]) => {
        const message = errors.value[name]
        return message ? [{ id: item.id, label: item.label, message }] : []
      })
      return h(ErrorSummaryView, { errors: list, title: props.title })
    }
  },
})
