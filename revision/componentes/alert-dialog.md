# AlertDialog

Revisado el 2026-11-19 sobre Grado 0.7.0 · Superposiciones

Funciona bien como confirmación: `role="alertdialog"`, no se cierra con el fondo, y Escape y el aspa cancelan; está probado en React y en Vue. Lo que falta es lo que lo hace una confirmación: los botones. Las tres apps escriben el mismo pie de «Cancelar» + acción destructiva, y NeuroHelp lo empaquetó en `ConfirmDialog` (31 usos). Mientras la acción espera al servidor, Escape y el aspa siguen cerrándolo. Comparte el código con Dialog, así que casi todo lo demás está en `dialog.md`.

Uso: Memorias 2 · NeuroHelp 2 (`ConfirmDialog`, usado 31 veces, y la confirmación de descartar de `AppDialog`) · Sales Coach 2 · Piezas propias en las apps: NeuroHelp `ConfirmDialog`.

## Hallazgos

### alert-dialog-1 · Sin acciones de confirmar y cancelar: cada app escribe el mismo pie

- **Tipo:** API
- **Prioridad:** alta
- **Prueba:** `AlertDialog` solo tiene `footer` libre (`packages/grado-react/src/Dialog.tsx:133-135`, `packages/grado-vue/src/Dialog.ts:121`). NeuroHelp hizo `ConfirmDialog.vue` con `confirmLabel`, `cancelLabel`, `destructive`, `loading`, `keepOpen` y `confirmDisabled` (líneas 8-38), usado 31 veces. Sales Coach repite el pie a mano (`KnowledgeBaseView.vue:244-247`, `ChatView.vue:300-303`), igual que el ejemplo de la web (`docs-site/components.mjs:97-108`). Memorias, también, con `loading` en el botón de confirmar (`memorias-form.jsx:1233-1238`).
  Hay además un fallo que ese pie a mano no puede evitar: mientras se espera al servidor, `ConfirmDialog.vue:34` desactiva «Cancelar», pero Escape y el aspa siguen cerrando el diálogo, porque `AlertDialog` no tiene forma de desactivar el aspa (`Dialog.tsx:109`). En Memorias, «Corregir» ni siquiera se desactiva con `generating`.
- **Por qué importa:** es una pieza propia con 31 usos, y las cuatro implementaciones (web, NeuroHelp, Sales Coach, Memorias) eligen a mano el orden, las variantes y el texto de cancelar. Además, la confirmación se puede cerrar a medio guardar.
- **Propuesta:** props opcionales en React y Vue: `confirmLabel`, `onConfirm` (Vue: evento `confirm`), `cancelLabel` (por defecto un texto nuevo `messages.cancel` en es, de y en), `tone: 'danger' | 'primary'` (por defecto `danger`: `Button` `destructive` o `primary`), `loading` y `confirmDisabled`. Con `confirmLabel`, `AlertDialog` pinta el pie: «Cancelar» `secondary` primero y la acción después; cancelar llama a `onOpenChange(false)`, confirmar a `onConfirm` y no cierra (la app cierra cuando acaba, como `keepOpen`). Con `loading`, el botón de confirmar muestra el spinner, «Cancelar» y el aspa se desactivan y Escape no cierra. Sin `confirmLabel`, el pie sigue siendo libre como hoy. Al abrir, el foco va a «Cancelar», la acción menos destructiva (APG, *Alert and Message Dialogs*; ver dialog-5). Ejemplo de la web y skill, actualizados.
- **Rompe:** no
- **Esfuerzo:** M

### alert-dialog-2 · Sin tono: Memorias pinta el aviso con un ámbar fijo en el título

- **Tipo:** API · aspecto
- **Prioridad:** media
- **Prueba:** las dos confirmaciones de Memorias meten un `AlertTriangle` con `text-amber-600` en el `title` (`memorias-form.jsx:1226` y `:1261`), un color fijo fuera de los tokens, para distinguir «aviso» de «borrado». `AlertDialog` no tiene `tone` ni icono, y la guía de Grado pide el estado con punto o icono y texto, con tokens.
- **Por qué importa:** cada app resolverá el aviso a su manera y con sus colores; en Campo o en oscuro el ámbar de Tailwind no tiene el contraste comprobado.
- **Propuesta:** el mismo `tone` de alert-dialog-1 decide también el icono de la cabecera: `danger` (triángulo o papelera en `--k5-destructive-text`), `warning` (triángulo en `--k5-warning-text`) y `primary` sin icono. Clase `k5-dialog__icon` en `overlay.css`, icono con `aria-hidden`. Si se hace antes que alert-dialog-1, `tone` solo pinta el icono.
- **Rompe:** no
- **Esfuerzo:** S

### Comparte con Dialog

- dialog-2 · El contenido se queda montado cerrado: `ConfirmDialog.vue:32` repite el `v-if="open"`.
- dialog-4 · Sin tamaño: Memorias ensancha un AlertDialog a 42 rem con clases (`memorias-form.jsx:1241`).
- dialog-5 · Foco inicial: en AlertDialog va al aspa, que vale como acción menos destructiva; con alert-dialog-1 iría a «Cancelar».
- dialog-6 · El cierre nativo deja el estado abierto y la página sin scroll.
- dialog-7 · Escape con un Tooltip abierto dentro cierra también la confirmación.
- dialog-8 · El aspa mide 28 px en Campo y en pantallas táctiles.
- dialog-12 · AlertDialog no está en la comparación React/Vue de `sameHtml` (hoy sale igual).
- dialog-1 (arrastrar hasta el fondo) no le afecta: AlertDialog no se cierra con el fondo.

## Ideas

- Pedir que se escriba una palabra (el nombre de lo que se borra) para habilitar la confirmación en borrados masivos; ninguna app lo usa todavía.

## Revisado sin hallazgos

- `role="alertdialog"` en el `<dialog>`, con `aria-labelledby` y `aria-describedby` a título y descripción (`Dialog.tsx:70-73`, `Dialog.ts:69-72`).
- No se cierra al pulsar el fondo aunque se pase `closeOnOutside`, como dice la ficha de la web; probado en React y Vue (`test/browser/run.mjs:103-107`).
- Escape cancela y nunca ejecuta la confirmación (`run.mjs:106-107`).
- Mismo HTML en React y en Vue con descripción y pie (comprobado con un script; ver dialog-12).
- CSS propio (`overlay.css:105-118` y móvil `:203-211`): más estrecho y sin separador bajo el título, solo con tokens.
- La guía (`docs-site/guidelines.mjs:206-217`) dice lo que hace el componente.
