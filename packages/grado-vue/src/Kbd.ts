import { defineComponent, h, type PropType } from 'vue'

/** Una tecla o un atajo de teclado. */
export const Kbd = defineComponent({
  name: 'K5Kbd',
  props: {
    /** Teclas de un atajo: ['Ctrl', 'K'] → Ctrl + K. Sin keys, se usa el slot. */
    keys: Array as PropType<string[]>,
  },
  setup(props, { slots }) {
    return () =>
      h(
        'kbd',
        { class: 'k5-kbd' },
        props.keys
          ? props.keys.flatMap((key, index) => [
              index > 0 ? h('span', { class: 'k5-kbd__sep' }, '+') : null,
              h('kbd', { class: 'k5-kbd__key' }, key),
            ])
          : [h('kbd', { class: 'k5-kbd__key' }, slots.default?.())],
      )
  },
})
