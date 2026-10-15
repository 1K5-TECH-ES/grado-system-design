import { computed, defineComponent, h, ref, type Component, type PropType } from 'vue'
import { toggleGroupClass, type Size } from '@1k5/grado/classes'
import { nextIndex, toggleValues } from '@1k5/grado/patterns'
import { model } from './helpers.js'

export interface ToggleOption {
  value: string
  label: string
  icon?: Component
  disabled?: boolean
}

const asList = (value: string | string[] | undefined) =>
  value === undefined ? undefined : Array.isArray(value) ? value : value ? [value] : []

/**
 * Botones conmutables que se combinan: formato de texto, filtros rápidos. Un solo punto de Tab.
 * v-model: string en type="single" ('' sin ninguna) y string[] en type="multiple".
 */
export const ToggleGroup = defineComponent({
  name: 'K5ToggleGroup',
  props: {
    options: { type: Array as PropType<ToggleOption[]>, required: true },
    /** single: una opción o ninguna (pulsar la activa la desactiva); multiple: cualquier combinación. */
    type: { type: String as PropType<'single' | 'multiple'>, default: 'single' },
    modelValue: [String, Array] as PropType<string | string[]>,
    defaultValue: [String, Array] as PropType<string | string[]>,
    /** Nombre del grupo para lectores de pantalla: «Formato del texto». */
    label: { type: String, required: true },
    size: String as PropType<Size>,
    /** Solo iconos: las etiquetas pasan a aria-label y title. */
    iconOnly: Boolean,
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const multiple = computed(() => props.type === 'multiple')
    const [list, setList] = model(
      () => asList(props.modelValue),
      asList(props.defaultValue) ?? [],
      (next) => emit('update:modelValue', multiple.value ? next : (next[0] ?? '')),
    )
    const focused = ref<string | null>(null)
    const onKeydown = (event: KeyboardEvent) => {
      const buttons = [...(event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
      const next = nextIndex(event.key, buttons.indexOf(document.activeElement as HTMLButtonElement), buttons.length)
      if (next === null) return
      event.preventDefault()
      buttons[next].focus()
    }
    return () => {
      const enabled = props.options.filter((option) => !option.disabled && !props.disabled)
      const focusable =
        enabled.find((option) => option.value === focused.value)?.value ??
        enabled.find((option) => list.value.includes(option.value))?.value ??
        enabled[0]?.value
      return h(
        'div',
        {
          role: 'group',
          'aria-label': props.label,
          class: toggleGroupClass({ size: props.size, iconOnly: props.iconOnly }),
          onKeydown,
        },
        props.options.map((option) =>
          h(
            'button',
            {
              key: option.value,
              type: 'button',
              class: 'k5-toggle-group__item',
              'aria-pressed': String(list.value.includes(option.value)),
              'aria-label': props.iconOnly ? option.label : undefined,
              title: props.iconOnly ? option.label : undefined,
              tabindex: option.value === focusable ? 0 : -1,
              disabled: props.disabled || option.disabled,
              onFocus: () => (focused.value = option.value),
              onClick: () =>
                setList(
                  toggleValues(
                    list.value,
                    option.value,
                    multiple.value ? 'multiple' : 'single',
                    props.options.map((item) => item.value),
                  ),
                ),
            },
            [option.icon ? h(option.icon, { 'aria-hidden': 'true' }) : null, props.iconOnly ? null : h('span', option.label)],
          ),
        ),
      )
    }
  },
})
