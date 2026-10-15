import { defineComponent, h, type PropType } from 'vue'
import { descriptionListClass, type DescriptionLayout } from '@1k5/grado/classes'
import { formatMessage } from '@1k5/grado/messages'
import type { DescriptionItem } from '@1k5/grado/patterns'
import { CopyButton } from './CopyButton.js'
import { useGrado } from './Locale.js'

/** Pares dato–valor de una ficha de cliente o instalación, en un <dl>. Slot con el id de cada elemento. */
export const DescriptionList = defineComponent({
  name: 'K5DescriptionList',
  props: {
    items: { type: Array as PropType<DescriptionItem[]>, required: true },
    /** columns: dato y valor en dos columnas (una sola por debajo de 600 px). stacked: el dato encima. */
    layout: String as PropType<DescriptionLayout>,
  },
  setup(props, { slots }) {
    const t = useGrado()
    return () =>
      h(
        'dl',
        { class: descriptionListClass({ layout: props.layout }) },
        props.items.map((item, index) =>
          h('div', { key: item.id ?? index, class: 'k5-dl__item' }, [
            h('dt', { class: 'k5-dl__term' }, item.term),
            h('dd', { class: ['k5-dl__description', item.mono && 'k5-dl__description--mono'] }, [
              h('span', { class: 'k5-dl__value' }, (item.id ? slots[item.id]?.({ item }) : undefined) ?? item.description),
              item.copy != null
                ? h(CopyButton, {
                    value: item.copy,
                    iconOnly: true,
                    label: formatMessage(t.value.messages.copyNamed, { label: item.term }),
                  })
                : null,
            ]),
          ]),
        ),
      )
  },
})
