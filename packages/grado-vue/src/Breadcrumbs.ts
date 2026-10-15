import { defineComponent, h, type PropType } from 'vue'
import { ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { type BreadcrumbItem } from '@1k5-tech-es/grado/patterns'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

export const Breadcrumbs = defineComponent({
  name: 'K5Breadcrumbs',
  props: { items: { type: Array as PropType<BreadcrumbItem[]>, required: true }, label: String },
  setup: (props) => {
    const t = useGrado()
    return () =>
      h('nav', { class: 'k5-breadcrumbs', 'aria-label': props.label ?? t.value.messages.breadcrumbs }, [
        h(
          'ol',
          null,
          props.items.map((item, index) =>
            h('li', { key: index }, [
              index > 0 ? pathIcon(ICON_PATHS.chevronRight, 'k5-breadcrumbs__separator') : null,
              item.href && index !== props.items.length - 1
                ? h('a', { href: item.href }, item.label)
                : h('span', { 'aria-current': index === props.items.length - 1 ? 'page' : undefined }, item.label),
            ]),
          ),
        ),
      ])
  },
})
