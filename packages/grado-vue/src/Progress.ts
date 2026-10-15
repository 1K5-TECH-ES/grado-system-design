import { defineComponent, h, type PropType } from 'vue'
import { cx, progressClass, type ProgressTone, type SmallSize } from '@1k5/grado/classes'
import { progressState } from '@1k5/grado/patterns'
import { autoId } from './helpers.js'
import { useGrado } from './Locale.js'

export const Progress = defineComponent({
  name: 'K5Progress',
  props: {
    /** Valor actual. null: indeterminado (no se sabe cuánto falta). Con steps, pasos completados. */
    value: { type: Number as PropType<number | null>, default: null },
    max: { type: Number, default: 100 },
    /** Nombre accesible. Por defecto, «Progreso». */
    label: String,
    /** Muestra el nombre encima de la barra. */
    showLabel: Boolean,
    /** Muestra «64 %» o «Paso 3 de 5». */
    showValue: Boolean,
    tone: String as PropType<ProgressTone>,
    size: String as PropType<SmallSize>,
    /** Variante por pasos: número total de pasos. */
    steps: Number,
  },
  setup(props) {
    const t = useGrado()
    const labelId = autoId('k5')
    return () => {
      const { messages: m, locale } = t.value
      const state = progressState({ value: props.value, max: props.max, steps: props.steps, locale, messages: m })
      const name = props.label ?? m.progress
      const head = props.showLabel || (props.showValue && state.text)
      return h(
        'div',
        { class: progressClass({ tone: props.tone, size: props.size, indeterminate: state.indeterminate, steps: state.stepped }) },
        [
          head
            ? h('div', { class: 'k5-progress__head' }, [
                props.showLabel ? h('span', { class: 'k5-progress__label', id: labelId }, name) : null,
                props.showValue && state.text ? h('span', { class: 'k5-progress__value', 'aria-hidden': 'true' }, state.text) : null,
              ])
            : null,
          h(
            'div',
            {
              class: 'k5-progress__track',
              role: 'progressbar',
              'aria-labelledby': props.showLabel ? labelId : undefined,
              'aria-label': props.showLabel ? undefined : name,
              'aria-valuemin': 0,
              'aria-valuemax': state.max,
              'aria-valuenow': state.now ?? undefined,
              'aria-valuetext': state.text || undefined,
            },
            state.stepped
              ? Array.from({ length: state.max }, (_, i) =>
                  h('span', { key: i, class: cx('k5-progress__step', i < (state.now ?? 0) && 'k5-progress__step--done') }),
                )
              : [
                  h('div', {
                    class: 'k5-progress__bar',
                    ...(state.indeterminate ? {} : { style: { width: `${Math.round(state.ratio * 10000) / 100}%` } }),
                  }),
                ],
          ),
        ],
      )
    }
  },
})
