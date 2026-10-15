import { defineComponent, h, type Component, type PropType } from 'vue'
import { DATA_ICON_PATHS, linkClass, type LinkTone, type LinkUnderline } from '@1k5/grado/classes'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'

/** Enlace con el estilo del sistema. href, to y el resto de atributos pasan al enlace. */
export const Link = defineComponent({
  name: 'K5Link',
  props: {
    /** Componente del enlace: RouterLink. Por defecto <a>. */
    as: { type: [String, Object, Function] as PropType<string | Component>, default: 'a' },
    /** Abre en otra pestaña (target _blank, rel noopener) y lo indica con icono y texto oculto. */
    external: Boolean,
    tone: String as PropType<LinkTone>,
    /** hover: subraya al pasar por encima. always: siempre; úsalo dentro de un párrafo. */
    underline: String as PropType<LinkUnderline>,
  },
  setup(props, { slots }) {
    const t = useGrado()
    return () => {
      const children = () => [
        slots.default?.(),
        props.external ? pathIcon(DATA_ICON_PATHS.externalLink, 'k5-link__icon') : null,
        props.external ? h('span', { class: 'k5-sr-only' }, ` ${t.value.messages.opensInNewTab}`) : null,
      ]
      const data = {
        ...(props.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        class: linkClass({ tone: props.tone, underline: props.underline }),
      }
      return typeof props.as === 'string' ? h(props.as, data, children()) : h(props.as, data, { default: children })
    }
  },
})
