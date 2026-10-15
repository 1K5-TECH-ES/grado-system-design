import { computed, defineComponent, h, mergeProps, ref, type PropType } from 'vue'
import { cx, type Size } from '@1k5/grado/classes'
import {
  formatIban,
  formatPhone,
  ibanError,
  nifError,
  normalizeIban,
  normalizeNif,
  parsePhone,
  phoneCountryOf,
  phoneError,
  PHONE_COUNTRIES,
  significantCount,
  toE164,
  type PhoneCountryCode,
} from '@1k5/grado/patterns'
import { Input, useField } from './Field.js'
import { useGrado } from './Locale.js'
import { autoId, booleanOptional, model } from './helpers.js'
import { rewrite, useCheck } from './field-check.js'

const errorText = (id: string, message: string) => (message ? h('p', { class: 'k5-field__error', id, role: 'alert' }, message) : null)

const checkedProps = {
  modelValue: { type: String, default: undefined },
  defaultValue: { type: String, default: '' },
  size: String as PropType<Size>,
  invalid: booleanOptional,
  id: String,
}

/** id, error y atributos comunes de los campos con formato. */
function useCoded(prefix: string, props: { id?: string }) {
  const field = useField()
  const auto = autoId(prefix)
  return computed(() => props.id ?? field?.value.id ?? auto)
}

const caretCount = (element: HTMLInputElement) => significantCount(element.value, element.selectionStart ?? element.value.length)

/**
 * Teléfono con prefijo de país. Agrupa las cifras al escribir («612 345 678») y devuelve con
 * v-model el número en E.164 («+34612345678»); v-model:country para el país. Si se pega «+351…»,
 * cambia el país. Emite error-change.
 */
export const PhoneInput = defineComponent({
  name: 'K5PhoneInput',
  inheritAttrs: false,
  props: {
    ...checkedProps,
    country: String as PropType<PhoneCountryCode>,
    /** Por defecto, el del número inicial o ES. */
    defaultCountry: String as PropType<PhoneCountryCode>,
    /** Países del selector, en orden. Por defecto: ES, PT, FR, DE, IT y GB. */
    countries: Array as PropType<PhoneCountryCode[]>,
    /** Nombre del selector de país. Por defecto, «Prefijo del país». */
    countryLabel: String,
    placeholder: String,
    disabled: Boolean,
  },
  emits: ['update:modelValue', 'update:country', 'error-change'],
  setup(props, { attrs, emit }) {
    const t = useGrado()
    const inputId = useCoded('k5-phone', props)
    const [current, setCurrent] = model(
      () => props.modelValue,
      props.defaultValue,
      (value) => emit('update:modelValue', value),
    )
    const [code, setCode] = model<PhoneCountryCode>(
      () => props.country,
      props.defaultCountry ?? phoneCountryOf(props.defaultValue || props.modelValue) ?? 'ES',
      (value) => emit('update:country', value),
    )
    const draft = ref<string | null>(null)
    const list = computed(() => PHONE_COUNTRIES.filter((item) => !props.countries || props.countries.includes(item.code)))
    const text = computed(() => draft.value ?? formatPhone(current.value, code.value))
    const check = useCheck(
      () => phoneError(text.value, code.value, t.value.messages),
      Boolean(current.value),
      (message) => emit('error-change', message),
    )
    const update = (next: string) => {
      if (next !== current.value) setCurrent(next)
    }
    const changeCountry = (next: PhoneCountryCode) => {
      const digits = parsePhone(text.value, code.value).digits
      if (next !== code.value) setCode(next)
      update(toE164(digits, next))
      if (draft.value !== null) draft.value = formatPhone(digits, next)
    }
    const onInput = (event: Event) => {
      const element = event.target as HTMLInputElement
      const typed = element.value
      const parsed = parsePhone(typed, code.value)
      const known = list.value.some((item) => item.code === parsed.country)
      const target = known ? parsed.country : code.value
      const international = /^\s*(\+|00)/.test(typed) && parsed.country !== code.value
      if (target !== code.value) setCode(target)
      const formatted = formatPhone(parsed.digits, target)
      // Con un prefijo pegado («+34 …») el cursor va al final; si no, detrás de la misma cifra.
      rewrite(element, formatted, international ? -1 : caretCount(element))
      draft.value = formatted
      update(toE164(parsed.digits, target))
    }
    return () => {
      const m = t.value.messages
      const id = inputId.value,
        checkId = `${id}-check`
      const message = check.message()
      const { class: className, ...rest } = attrs
      return h('div', { class: cx('k5-phone-input', className as string) }, [
        h(
          Input,
          mergeProps(rest, {
            id,
            type: 'tel',
            size: props.size,
            inputmode: 'tel',
            autocomplete: 'tel-national',
            placeholder: props.placeholder ?? list.value.find((item) => item.code === code.value)?.example,
            'aria-describedby': cx(rest['aria-describedby'] as string, message && checkId) || undefined,
            invalid: message ? true : props.invalid,
            disabled: props.disabled,
            modelValue: text.value,
            onInput,
            onBlur: () => {
              draft.value = null
              check.touch()
            },
          }),
          {
            // Sin value en el select: lo marca selected en la opción, igual en el servidor y en el navegador.
            prefix: () =>
              h(
                'select',
                {
                  class: 'k5-phone-input__country',
                  'aria-label': props.countryLabel ?? m.phoneCountry,
                  disabled: props.disabled,
                  onChange: (event: Event) => changeCountry((event.target as HTMLSelectElement).value as PhoneCountryCode),
                },
                list.value.map((item) =>
                  h('option', { key: item.code, value: item.code, selected: item.code === code.value }, `${item.code} ${item.dial}`),
                ),
              ),
          },
        ),
        errorText(checkId, message),
      ])
    }
  },
})

/** DNI, NIE o CIF con v-model. Lo pasa a mayúsculas sin espacios ni guiones y comprueba la letra o el dígito de control. */
export const NifInput = defineComponent({
  name: 'K5NifInput',
  inheritAttrs: false,
  props: checkedProps,
  emits: ['update:modelValue', 'error-change'],
  setup(props, { attrs, emit }) {
    const t = useGrado()
    const inputId = useCoded('k5-nif', props)
    const [current, setCurrent] = model(
      () => props.modelValue,
      props.defaultValue,
      (value) => emit('update:modelValue', value),
    )
    const check = useCheck(
      () => nifError(current.value, t.value.messages),
      Boolean(current.value),
      (message) => emit('error-change', message),
    )
    const onInput = (event: Event) => {
      const element = event.target as HTMLInputElement
      const next = normalizeNif(element.value)
      rewrite(element, next, caretCount(element))
      if (next !== current.value) setCurrent(next)
    }
    return () => {
      const id = inputId.value,
        checkId = `${id}-check`
      const message = check.message()
      const { class: className, ...rest } = attrs
      return h('div', { class: cx('k5-nif-input', className as string) }, [
        h(
          Input,
          mergeProps(rest, {
            id,
            size: props.size,
            autocomplete: 'off',
            autocapitalize: 'characters',
            spellcheck: 'false',
            'aria-describedby': cx(rest['aria-describedby'] as string, message && checkId) || undefined,
            invalid: message ? true : props.invalid,
            modelValue: current.value,
            onInput,
            onBlur: check.touch,
          }),
        ),
        errorText(checkId, message),
      ])
    }
  },
})

/** IBAN con v-model (sin espacios), agrupado de cuatro en cuatro al escribir. Comprueba la longitud del país y el control módulo 97. */
export const IbanInput = defineComponent({
  name: 'K5IbanInput',
  inheritAttrs: false,
  props: checkedProps,
  emits: ['update:modelValue', 'error-change'],
  setup(props, { attrs, emit }) {
    const t = useGrado()
    const inputId = useCoded('k5-iban', props)
    const [current, setCurrent] = model(
      () => props.modelValue,
      props.defaultValue,
      (value) => emit('update:modelValue', value),
    )
    const check = useCheck(
      () => ibanError(current.value, t.value.messages),
      Boolean(current.value),
      (message) => emit('error-change', message),
    )
    const onInput = (event: Event) => {
      const element = event.target as HTMLInputElement
      const next = normalizeIban(element.value)
      rewrite(element, formatIban(next), caretCount(element))
      if (next !== current.value) setCurrent(next)
    }
    return () => {
      const id = inputId.value,
        checkId = `${id}-check`
      const message = check.message()
      const { class: className, ...rest } = attrs
      return h('div', { class: cx('k5-iban-input', className as string) }, [
        h(
          Input,
          mergeProps(rest, {
            id,
            size: props.size,
            autocomplete: 'off',
            autocapitalize: 'characters',
            spellcheck: 'false',
            'aria-describedby': cx(rest['aria-describedby'] as string, message && checkId) || undefined,
            invalid: message ? true : props.invalid,
            modelValue: formatIban(current.value),
            onInput,
            onBlur: check.touch,
          }),
        ),
        errorText(checkId, message),
      ])
    }
  },
})
