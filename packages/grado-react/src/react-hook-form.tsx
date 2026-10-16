'use client'
// Adaptador de react-hook-form:
//   import { Form, FormField, ErrorSummary } from '@1k5-tech-es/grado-react/react-hook-form'
// react-hook-form es una dependencia opcional: solo la necesita quien importe este archivo.
import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type FocusEvent,
  type ForwardedRef,
  type FormHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import {
  FormProvider,
  useController,
  useForm,
  useFormContext,
  useFormState,
  type DefaultValues,
  type FieldValues,
  type Path,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form'
import { cx } from '@1k5-tech-es/grado/classes'
import { checkValue, fieldId, type ErrorSummaryItem, type FieldCheck } from '@1k5-tech-es/grado/patterns'
import { AddressInput } from './AddressInput.js'
import { Calendar } from './Calendar.js'
import { Checkbox, RadioGroup } from './Choice.js'
import { IbanInput, NifInput, PhoneInput } from './CodeInputs.js'
import { Combobox } from './Combobox.js'
import { DatePicker, DateRangePicker } from './DatePicker.js'
import { ErrorSummary as ErrorSummaryView } from './ErrorSummary.js'
import { Field, Input, ManagedFieldContext, Select, Textarea } from './Field.js'
import { MultiSelect, NumberInput, SegmentedControl } from './Inputs.js'
import { useGrado } from './Locale.js'
import { Slider } from './Slider.js'
import { Switch } from './Switch.js'
import { PasswordInput, SearchInput } from './TextInputs.js'
import { TimePicker } from './TimePicker.js'
import { ToggleGroup } from './ToggleGroup.js'
import { useAutoId } from './hooks.js'

// Cómo se conecta cada control. native: value + onChange(evento), como un <input>. checked: casilla
// o interruptor. value: value + onValueChange, el resto de Grado. Un componente propio recibe
// value, onChange, onBlur, name y ref, como con el Controller de react-hook-form.
type Binding = 'native' | 'checked' | 'value'
const BINDINGS = new Map<unknown, Binding>([
  [Input, 'native'],
  [Textarea, 'native'],
  [Select, 'native'],
  [Checkbox, 'checked'],
  [Switch, 'checked'],
  ...[
    NumberInput,
    Slider,
    SegmentedControl,
    MultiSelect,
    Combobox,
    TimePicker,
    AddressInput,
    PhoneInput,
    NifInput,
    IbanInput,
    SearchInput,
    PasswordInput,
    DatePicker,
    DateRangePicker,
    RadioGroup,
    ToggleGroup,
    Calendar,
  ].map((component): [unknown, Binding] => [component, 'value']),
])
// Campos que validan su propio formato y lo cuentan con onErrorChange.
const FORMATTED = new Set<unknown>([NifInput, IbanInput, PhoneInput, TimePicker])

interface Registered {
  id: string
  label?: string
}
const Registry = createContext<{ prefix: string; fields: Map<string, Registered> } | null>(null)

function useRegistry(component: string) {
  const registry = useContext(Registry)
  if (!registry) throw new Error(`${component} tiene que estar dentro de Form (@1k5-tech-es/grado-react/react-hook-form).`)
  return registry
}

// ---------- Form ----------

export interface FormProps<T extends FieldValues> extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onInvalid'> {
  /** El resultado de useForm(), si lo necesitas fuera (watch, reset…). Sin él, Form crea el suyo. */
  form?: UseFormReturn<T>
  /** Valores iniciales cuando Form crea el formulario. */
  defaultValues?: DefaultValues<T>
  /** Cuándo se valida la primera vez, cuando Form crea el formulario. Por defecto, al enviar. */
  mode?: UseFormProps<T>['mode']
  /** Errores que vienen de fuera, por ejemplo del servidor: { nif: 'Ya hay un cliente con este NIF' }. */
  errors?: Partial<Record<Path<T>, string>>
  /** Con todos los campos válidos. */
  onSubmit: SubmitHandler<T>
  /** Con algún error. El foco ya va al primer campo con error. */
  onInvalid?: SubmitErrorHandler<T>
}

/** <form> con react-hook-form. Los FormField de dentro se registran solos; ErrorSummary los lista. */
// forwardRef pierde el parámetro de tipo: el cast del final lo recupera.
export const Form = forwardRef(function Form<T extends FieldValues>(
  { form, defaultValues, mode, errors, onSubmit, onInvalid, className, children, ...rest }: FormProps<T>,
  ref: ForwardedRef<HTMLFormElement>,
) {
  const external = useMemo(
    () =>
      errors &&
      (Object.fromEntries(
        Object.entries(errors)
          .filter(([, message]) => message)
          .map(([name, message]) => [name, { type: 'server', message }]),
      ) as UseFormProps<T>['errors']),
    [errors],
  )
  const own = useForm<T>({ defaultValues, mode, errors: external })
  const active = form ?? own
  const prefix = useAutoId('k5-form')
  const fields = useRef(new Map<string, Registered>()).current
  const registry = useMemo(() => ({ prefix, fields }), [prefix, fields])
  return (
    <FormProvider {...active}>
      <Registry.Provider value={registry}>
        <form ref={ref} noValidate {...rest} className={cx('k5-form', className)} onSubmit={active.handleSubmit(onSubmit, onInvalid)}>
          {children}
        </form>
      </Registry.Provider>
    </FormProvider>
  )
}) as unknown as <T extends FieldValues>(props: FormProps<T> & { ref?: Ref<HTMLFormElement> }) => ReactElement | null

// ---------- FormField ----------

export interface FormFieldProps<T extends FieldValues = FieldValues> {
  name: Path<T>
  label?: ReactNode
  hint?: ReactNode
  /** Obligatorio: asterisco, aria-required y el error «Este campo es obligatorio» si está vacío. */
  required?: boolean
  /** Comprobaciones propias, en orden: (valor, valores) => true, el texto del error o false. Pueden ser async. */
  validate?: FieldCheck | FieldCheck[]
  /** Valor inicial si Form no lo trae en defaultValues. */
  defaultValue?: unknown
  /** id del control. Por defecto, sale del nombre. */
  id?: string
  className?: string
  /** Un control: Input, NumberInput, Combobox, NifInput… o uno propio. */
  children: ReactElement
}

/**
 * Un campo del formulario: Field con etiqueta, ayuda y error, y el control conectado a react-hook-form.
 * El error se ve con la validación del formulario (por defecto, al enviar y luego al cambiar).
 */
export const FormField = forwardRef(function FormField<T extends FieldValues>(
  { name, label, hint, required = false, validate, defaultValue, id, className, children }: FormFieldProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const { messages: m } = useGrado()
  const registry = useRegistry('FormField')
  const { control, trigger, formState } = useFormContext<T>()
  const formatError = useRef('')
  // react-hook-form solo actualiza lo que se lee al pintar: isSubmitted se lee aquí para usarlo en onErrorChange.
  const submitted = useRef(false)
  submitted.current = formState.isSubmitted
  const { field, fieldState } = useController({
    name,
    control,
    defaultValue: defaultValue as never,
    rules: {
      validate: async (value, values) =>
        (await checkValue(value, values, { required, formatError: formatError.current, checks: validate, messages: m })) || true,
    },
  })
  const controlId = id ?? fieldId(registry.prefix, name)
  registry.fields.set(name, { id: controlId, label: typeof label === 'string' ? label : undefined })
  useEffect(() => () => void registry.fields.delete(name), [registry, name])

  const child = isValidElement<Record<string, unknown>>(children) ? children : null
  const own = (child?.props ?? {}) as Record<string, ((...args: unknown[]) => void) | undefined>
  const binding = child ? BINDINGS.get(child.type) : undefined
  const change = (handler: string) => (next: unknown) => {
    own[handler]?.(next)
    field.onChange(next)
  }
  const props: Record<string, unknown> = { ref: field.ref, name: field.name, ...(field.disabled ? { disabled: true } : {}) }
  if (binding === 'native') Object.assign(props, { value: field.value ?? '', onChange: change('onChange') })
  else if (binding === 'checked') Object.assign(props, { checked: Boolean(field.value), onCheckedChange: change('onCheckedChange') })
  else if (binding === 'value') Object.assign(props, { value: field.value, onValueChange: change('onValueChange') })
  else Object.assign(props, { value: field.value, onChange: field.onChange, onBlur: field.onBlur })
  if (child && FORMATTED.has(child.type))
    props.onErrorChange = (message: string) => {
      own.onErrorChange?.(message)
      formatError.current = message
      // Tras el primer envío, el error de formato se vuelve a comprobar en cuanto cambia.
      if (submitted.current) void trigger(name)
    }

  return (
    <ManagedFieldContext.Provider value>
      <Field
        ref={ref}
        id={controlId}
        label={label}
        hint={hint}
        required={required}
        error={fieldState.error?.message}
        className={className}
        data-k5-field={controlId}
        onBlur={(event: FocusEvent<HTMLDivElement>) => {
          // Para Combobox, RadioGroup… solo cuenta como «salir» cuando el foco deja todo el campo.
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) field.onBlur()
        }}
      >
        {child ? cloneElement(child, props) : children}
      </Field>
    </ManagedFieldContext.Provider>
  )
}) as unknown as <T extends FieldValues = FieldValues>(props: FormFieldProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement | null

// ---------- ErrorSummary ----------

export interface FormErrorSummaryProps {
  /** Por defecto, «Revisa 2 campos antes de continuar». */
  title?: string
  className?: string
}

/** Los errores del Form, con un enlace a cada campo. Aparece al enviar con errores y se va al corregirlos. */
export const ErrorSummary = forwardRef<HTMLDivElement, FormErrorSummaryProps>(function ErrorSummary({ title, className }, ref) {
  const registry = useRegistry('ErrorSummary')
  const { getFieldState } = useFormContext()
  const formState = useFormState()
  // Leer errors y submitCount suscribe el resumen a sus cambios (react-hook-form solo avisa de lo que se lee).
  const { submitCount } = formState
  void formState.errors
  if (!submitCount) return null
  const errors: ErrorSummaryItem[] = [...registry.fields].flatMap(([name, item]) => {
    const message = getFieldState(name, formState).error?.message
    return message ? [{ id: item.id, label: item.label, message }] : []
  })
  return <ErrorSummaryView ref={ref} errors={errors} title={title} className={className} />
})
