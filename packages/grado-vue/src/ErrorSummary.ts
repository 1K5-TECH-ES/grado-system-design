import { defineComponent, h, type PropType } from 'vue'
import { errorSummaryTitle, focusField, type ErrorSummaryItem } from '@1k5-tech-es/grado/patterns'
import { autoId } from './helpers.js'
import { useGrado } from './Locale.js'

/**
 * Lista de errores al principio de un formulario, con un enlace a cada campo. Se anuncia
 * con role="alert" al aparecer. Con VeeValidate, usa el de su adaptador.
 */
export const ErrorSummary = defineComponent({
  name: 'K5ErrorSummary',
  props: {
    /** Errores en el orden de los campos. Sin errores no se pinta nada. */
    errors: { type: Array as PropType<ErrorSummaryItem[]>, required: true },
    /** Por defecto, «Revisa 2 campos antes de continuar». */
    title: String,
  },
  setup(props) {
    const t = useGrado()
    const id = autoId('k5-error-summary')
    return () =>
      props.errors.length
        ? h('div', { class: 'k5-error-summary', role: 'alert', 'aria-labelledby': `${id}-title`, tabindex: '-1' }, [
            h(
              'h2',
              { class: 'k5-error-summary__title', id: `${id}-title` },
              props.title ?? errorSummaryTitle(props.errors.length, t.value.messages),
            ),
            h(
              'ul',
              { class: 'k5-error-summary__list' },
              props.errors.map((error) =>
                h('li', { key: error.id }, [
                  h(
                    'a',
                    {
                      class: 'k5-error-summary__link',
                      href: `#${error.id}`,
                      onClick: (event: MouseEvent) => {
                        if (focusField(error.id)) event.preventDefault()
                      },
                    },
                    error.label ? `${error.label}: ${error.message}` : error.message,
                  ),
                ]),
              ),
            ),
          ])
        : null
  },
})
