# API de @1k5-tech-es/grado-elements

Generado por `npm run api`. Si cambia sin querer, alguien ha cambiado la API pública.

```ts
import type { createToastStore } from '@1k5-tech-es/grado/patterns';
export declare class K5Combobox extends HTMLElement {
    value: string;
}
export declare class K5Dialog extends HTMLElement {
    open: boolean;
    show(): void;
    close(): void;
}
export declare class K5Tabs extends HTMLElement {
    value: string;
}
export declare class K5Tab extends HTMLElement {
}
export declare class K5Menu extends HTMLElement {
}
export declare class K5Toaster extends HTMLElement {
}
export declare const toast: ReturnType<typeof createToastStore>['toast'];
declare global {
    interface HTMLElementTagNameMap {
        'k5-combobox': K5Combobox;
        'k5-dialog': K5Dialog;
        'k5-tabs': K5Tabs;
        'k5-tab': K5Tab;
        'k5-menu': K5Menu;
        'k5-toaster': K5Toaster;
    }
}
```
