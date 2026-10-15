import { h } from 'vue'
import { ICON_ATTRS } from '@1k5/grado/classes'

/** Icono interno hecho con trazos de Lucide (ver ICON_PATHS en @1k5/grado/classes). */
export function pathIcon(paths: string[], className?: string) {
  return h(
    'svg',
    { ...ICON_ATTRS, 'stroke-width': '2', ...(className ? { class: className } : {}) },
    paths.map((d) => h('path', { d })),
  )
}
