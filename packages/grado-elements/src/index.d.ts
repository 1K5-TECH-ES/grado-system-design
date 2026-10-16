// Tipos de @1k5-tech-es/grado-elements. Importar el paquete define los elementos.
import type { createToastStore } from '@1k5-tech-es/grado/patterns'

/** <k5-combobox label name value placeholder disabled required loading empty-label> con <option> dentro. Evento change. */
export declare class K5Combobox extends HTMLElement {
  value: string
}
/** <k5-dialog label description open keep-open close-label>. Se abre con show(), open o un botón data-k5-open="id". Evento close. */
export declare class K5Dialog extends HTMLElement {
  open: boolean
  show(): void
  close(): void
}
/** <k5-tabs label value> con <k5-tab value label> dentro. Evento change. */
export declare class K5Tabs extends HTMLElement {
  value: string
}
export declare class K5Tab extends HTMLElement {}
/** <k5-menu label disabled align> con <option value data-danger data-separator> dentro. Evento k5-select con detail.value. */
export declare class K5Menu extends HTMLElement {}
/** <k5-toaster max label>: pinta los avisos de toast(). */
export declare class K5Toaster extends HTMLElement {}
/** toast('…'), toast.success, warning, error, info, promise y dismiss. */
export declare const toast: ReturnType<typeof createToastStore>['toast']

declare global {
  interface HTMLElementTagNameMap {
    'k5-combobox': K5Combobox
    'k5-dialog': K5Dialog
    'k5-tabs': K5Tabs
    'k5-tab': K5Tab
    'k5-menu': K5Menu
    'k5-toaster': K5Toaster
  }
}
