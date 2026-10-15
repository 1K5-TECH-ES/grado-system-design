import { computed, defineComponent, h, mergeProps, type PropType } from 'vue'
import { cx } from '@1k5/grado/classes'
import { clampNumber, decimalsOf, formatNumber, type SliderMark } from '@1k5/grado/patterns'
import { useControl, useField } from './Field.js'
import { useGrado } from './Locale.js'
import { autoId, booleanOptional, model } from './helpers.js'

/** Fracción de la pista (0 a 1), con cuatro decimales para que React y Vue escriban lo mismo. */
const fractionOf = (value: number, min: number, max: number) => (max > min ? Math.round(((value - min) / (max - min)) * 10000) / 10000 : 0)

/**
 * Un valor dentro de un rango, con el input range nativo: flechas, Re Pág, Av Pág, Inicio y Fin
 * funcionan sin código. El tramo relleno sale de la variable --_fill. v-model con un número.
 */
export const Slider = defineComponent({
  name: 'K5Slider',
  inheritAttrs: false,
  props: {
    modelValue: { type: Number, default: undefined },
    /** Por defecto, el mínimo. */
    defaultValue: { type: Number, default: undefined },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    /** Unidad tras el valor: kWp, kWh, %. */
    unit: String,
    /** Muestra el valor elegido a la derecha. */
    showValue: Boolean,
    /** Texto del valor (visible y para lectores de pantalla). Por defecto, el número en el idioma activo y la unidad. */
    formatValue: Function as PropType<(value: number) => string>,
    /** Marcas bajo la pista: [{ value: 2, label: '2 kWp' }]. */
    marks: Array as PropType<SliderMark[]>,
    /** Nombre accesible si no hay Field con etiqueta. */
    label: String,
    /** Formato de los números. Por defecto, el del plugin o GradoProvider (es-ES). */
    locale: String,
    invalid: booleanOptional,
    required: booleanOptional,
    id: String,
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const t = useGrado()
    const field = useField()
    const auto = autoId('k5-slider')
    const inputId = computed(() => props.id ?? field?.value.id ?? auto)
    const control = useControl(
      {
        get id() {
          return inputId.value
        },
        get required() {
          return props.required
        },
        get invalid() {
          return props.invalid
        },
      },
      attrs,
    )
    const [current, setCurrent] = model<number>(
      () => props.modelValue,
      props.defaultValue ?? props.min,
      (value) => emit('update:modelValue', value),
    )
    return () => {
      const { min, max } = props
      const locale = props.locale ?? t.value.locale
      const shown = clampNumber(current.value, min, max)
      const text = (n: number) =>
        props.formatValue ? props.formatValue(n) : `${formatNumber(n, locale, decimalsOf(props.step))}${props.unit ? ` ${props.unit}` : ''}`
      const { class: className, ...rest } = attrs
      const marks = props.marks ?? []
      return h(
        'div',
        {
          class: cx('k5-slider', marks.length && 'k5-slider--marks', className as string),
          style: { '--_fill': String(fractionOf(shown, min, max)) },
        },
        [
          h('div', { class: 'k5-slider__track' }, [
            h(
              'input',
              mergeProps(rest, control(), {
                type: 'range',
                class: 'k5-slider__input',
                min,
                max,
                step: props.step,
                value: shown,
                'aria-label': props.label,
                'aria-valuetext': text(shown),
                onInput: (event: Event) => setCurrent(Number((event.target as HTMLInputElement).value)),
              }),
            ),
            marks.length
              ? h(
                  'div',
                  { class: 'k5-slider__marks', 'aria-hidden': 'true' },
                  marks.map((mark) =>
                    h(
                      'span',
                      {
                        key: mark.value,
                        class: 'k5-slider__mark',
                        style: { '--_at': String(fractionOf(clampNumber(mark.value, min, max), min, max)) },
                      },
                      mark.label,
                    ),
                  ),
                )
              : null,
          ]),
          props.showValue ? h('output', { class: 'k5-slider__value', for: inputId.value, 'aria-hidden': 'true' }, text(shown)) : null,
        ],
      )
    }
  },
})
