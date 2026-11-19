# Popover

Revisado el 2026-11-19 sobre Grado 0.7.0 · Superposiciones

El teclado, el nombre accesible y la paridad básica están bien y probados. El problema grave es el que ya vio NeuroHelp: el panel es `position: absolute` dentro del disparador, así que cualquier contenedor con `overflow` (una `Card`, el cuerpo de un `Dialog`, la tabla con scroll) lo recorta, y además, al enfocar el panel, el contenedor desplaza su contenido y el disparador desaparece. Le pasa también al selector de columnas del propio `DataTable` dentro de una `Card`. Detrás van el foco perdido cuando la app cierra el panel desde dentro y la falta de una clase para el panel.

Uso: Memorias 1 instancia (menú de usuario, `app-shell.tsx:48`; el script de datos cuenta 2 por la importación), NeuroHelp 0, Sales Coach 0 · Piezas propias en las apps: NeuroHelp `AppPopover.vue` + `lib/floating.ts` (17 usos en 14 archivos)

## Hallazgos

### popover-1 · Recortado por cualquier contenedor con overflow, y lo desplaza al abrir

- **Tipo:** fallo
- **Prioridad:** alta
- **Prueba:** `packages/grado/src/css/popover.css:21-28` (panel `position: absolute` con `z-index`, dentro de `.k5-popover`) y `Popover.tsx:86` / `Popover.ts:71` (`focus()` sin `preventScroll`). En Chromium (Playwright, script de usuario sobre el build de 0.7.0):
  - `Popover` controlado dentro de `<div class="k5-card" style="height:80px">`: al abrir, la `Card` queda con `scrollTop = 113` porque el foco va a un botón del panel que no se ve; el disparador acaba 72 px por encima del borde de la tarjeta (fuera de la vista) y el panel solo se ve en la parte que cabe en la tarjeta; `elementFromPoint` justo bajo la tarjeta, en la columna del panel, no da el panel.
  - `<Card><DataTable columnPicker …/></Card>` con 7 columnas y 1 fila: el panel «Columnas» acaba en y = 246 y la tarjeta en y = 214; la última casilla no se puede pulsar (`elementFromPoint` sobre ella no cae en el panel). Grado recorta un componente de Grado: `.k5-card { overflow: hidden }` (`card.css:4`).
  - Lo mismo en `.k5-dialog__body { overflow-y: auto }` (`overlay.css:85-89`) y `.k5-dialog { overflow: hidden }` (`overlay.css:33`): no lo he medido, pero es el mismo mecanismo.
  - Además, `side` no cambia nunca: `overflowsSide` solo se usa para `align` (`Popover.tsx:74-75`, `Popover.ts:61-62`); con `side="bottom"` al pie de la ventana el panel sale por abajo.
- **Por qué importa:** NeuroHelp no usa el Popover de Grado ni una vez: hizo `AppPopover.vue` («abierto en la capa superior del navegador: no lo recorta un contenedor con scroll (el redactor, la lista de una bandeja) y se ve encima de un diálogo») con `popover="manual"`, `showPopover()` y `lib/floating.ts`, que lo coloca con `position: fixed`, le da la vuelta arriba/abajo si no cabe y lo recoloca con scroll y resize. 17 usos. La skill de las apps ya lo avisa como trampa (`plugins/grado/skills/grado/references/componentes.md:137`, `GUIA-INTEGRACION.md:432`).
- **Propuesta:** subir el panel a la capa superior como hace NeuroHelp, en React y en Vue:
  1. Una función pura en `patterns.js`, `floatingPosition(anchorRect, size, viewport, { side, align, offset, margin })`, hermana de `menuPosition`, que coloca, da la vuelta en los dos ejes y mantiene el panel dentro de la ventana. Con su test unitario.
  2. El panel lleva `popover="manual"`; al abrir, `showPopover()` (si existe), se mide, se coloca con `position: fixed` y estilo reactivo (en Vue, como estado, no tocando `el.style`: ver `context-menu-1`), y el foco va con `focus({ preventScroll: true })`. Escucha `scroll` (captura) y `resize` mientras está abierto y recoloca en `requestAnimationFrame`.
  3. CSS: `.k5-popover__content[popover]` anula los estilos del navegador para `[popover]` (`inset`, `margin`, `padding`, `border`, `overflow`); las clases `--start/--center/--end/--top` siguen para el sentido de la animación y para el fallback sin API `popover` (se queda como ahora).
  4. Tests de navegador: un Popover dentro de una `Card` baja y dentro de un `Dialog` abierto, que el panel se vea entero y que el contenedor no se desplace; `side="bottom"` al pie de la ventana abre hacia arriba.
  El panel sigue en el mismo sitio del DOM, así que el clic fuera, `Tab` fuera y Escape no cambian. `DataTable` lo hereda gratis. Si se hace bien, servirá luego para `DropdownMenu` y `Tooltip`.
- **Rompe:** no en la API. En «Al actualizar»: el panel pasa a `position: fixed` en la capa superior y lleva el atributo `popover`; si una app sobrescribía la posición de `.k5-popover__content` (`top`, `left`, `margin`), tiene que quitarlo. NeuroHelp podría borrar `AppPopover` cuando además estén `popover-2` y `popover-3`.
- **Esfuerzo:** L

### popover-2 · Si la app lo cierra desde dentro, el foco se pierde

- **Tipo:** accesibilidad
- **Prioridad:** alta
- **Prueba:** el foco solo vuelve al disparador en `close(true)` (Escape, `Popover.tsx:130` / `Popover.ts:109`) o tras un clic fuera (`Popover.tsx:93`). Cuando el padre pone `open` a `false`, el panel se desmonta con el foco dentro y nadie lo devuelve. En Chromium: `Popover` controlado con un botón «Elegir» dentro que hace `setOpen(false)` (React) o `vopen.value = false` (Vue); se enfoca el botón y se pulsa Enter: `document.activeElement` queda en `BODY` en los dos.
- **Por qué importa:** «elige y se cierra» es el uso normal de un panel con opciones. NeuroHelp lo resuelve con el `close` que su `AppPopover` pasa al contenido (`#default="{ close }"`): `MacroPicker.vue:61,75`, `SavedReplyPicker.vue:55`, `EmojiPickerButton.vue:33`. Con el de Grado, quien navega con teclado vuelve al principio de la página tras cada elección. APG (Dialog): al cerrar, el foco vuelve al elemento que lo abrió.
- **Propuesta:** al pasar `open` de `true` a `false` por cualquier vía, si el foco estaba dentro del panel (o, ya desmontado, está en `body`), enfocar el disparador. React: en el efecto de `open`, guardar en el cleanup si `panel.current.contains(document.activeElement)` y, si es así, `toggler()?.focus()`. Vue: `watch(open, …, { flush: 'pre' })` para mirar el foco antes de desmontar. Opcional, para la paridad con `AppPopover`: en Vue, el slot por defecto recibe `{ close }`; en React, `children` puede ser una función `({ close }) => ReactNode`. Test de navegador con un botón que cierra desde dentro, en React y en Vue.
- **Rompe:** no
- **Esfuerzo:** S

### popover-3 · No se puede dar clase ni tamaño al panel

- **Tipo:** API
- **Prioridad:** media
- **Prueba:** `className` va a la raíz `.k5-popover` (`Popover.tsx:122`) y en Vue `class` cae en la raíz por herencia de atributos; el panel solo recibe `popoverClass(...)` (`Popover.tsx:142`, `Popover.ts:124`). El panel tiene `padding` fijo y `max-width: min(22rem, …)` (`popover.css:27-29`), que el contenido no puede quitar.
- **Por qué importa:** NeuroHelp pasa `content-class` en 13 de sus 17 `AppPopover`: listas pegadas al borde (`p-0 overflow-hidden`, 6 usos), paneles más anchos que 22 rem (`w-[27.5rem] … max-w-[calc(100vw-2rem)]`, `w-auto max-w-none`) y un panel con alto máximo y su propio scroll (`flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden p-0`). Memorias se apaña envolviendo el contenido en `<div className="flex w-64 …">` (`app-shell.tsx:57`), que vale para el ancho pero no para el relleno.
- **Propuesta:** `contentClassName` en React y `contentClass` en Vue, que se suman a las clases del panel. En la guía: para quitar el relleno o pasar de 22 rem, esta prop. Test de paridad con la prop.
- **Rompe:** no
- **Esfuerzo:** S

### popover-4 · En Vue el título solo admite texto

- **Tipo:** paridad
- **Prioridad:** baja
- **Prueba:** React `title?: ReactNode` (`Popover.tsx:29`); Vue `title: String` (`Popover.ts:21`) y no hay slot `#title`.
- **Por qué importa:** sin caso real todavía; el `title` de Memorias es texto. Un título con un `Badge` o un CUPS en `<code>` solo se puede hacer en React.
- **Propuesta:** slot `#title` en Vue, que gana a la prop.
- **Rompe:** no
- **Esfuerzo:** S

### popover-5 · «Tab fuera lo cierra» no lo prueba nadie

- **Tipo:** tests
- **Prioridad:** baja
- **Prueba:** `test/browser/groups/superposiciones.check.mjs:30` dice «Tab fuera lo cierra», pero luego cierra con Escape (línea 37). La nota de la web (`docs-site/groups/superposiciones.docs.mjs:49`) lo promete.
- **Por qué importa:** es la parte del cierre que depende de `onBlur`/`focusout` y `relatedTarget`, la más frágil si se hace `popover-1`.
- **Propuesta:** en el check, `Tab` desde el último control del panel y comprobar que el panel desaparece y el foco sigue fuera; y que `Shift+Tab` hasta el disparador no lo cierra.
- **Rompe:** no
- **Esfuerzo:** S

## Ideas

- `autoFocus={false}` para paneles que solo informan, como tiene `AppPopover`; hoy ningún uso de NeuroHelp lo cambia.
- `side="right"` (lo soporta `lib/floating.ts`; ningún uso lo pide).
- Exponer `close()` y `place()` por `ref` (NeuroHelp: `TemplatePicker.vue:118` usa `close(false)` para llevar el foco a otro sitio).
- Mientras no se haga `popover-1`, la ficha de la web podría avisar del recorte como ya hace la skill de las apps.

## Revisado sin hallazgos

- Teclado y foco al abrir, Escape y clic fuera (con el foco de vuelta solo si el clic no cae en otro control): correctos y probados en `test/browser/` en React y Vue. Escape hace `preventDefault` y `stopPropagation` (`Popover.tsx:128-129`), así que no debería cerrar también un `Dialog` que lo contenga; eso no lo cubre ningún test.
- Nombre accesible: `aria-labelledby` con `title`, `aria-label` con `label`; disparador con `aria-haspopup="dialog"`, `aria-expanded` y `aria-controls` solo abierto.
- Controlado y no controlado (`open`/`defaultOpen`/`onOpenChange`, `v-model:open`): coherente con el resto; abierto desde el principio no roba el foco.
- Paridad React/Vue: mismo HTML en cerrado, abierto con título y con disparador propio (`test/parity-superposiciones.test.mjs:31-55`).
- Alineación con la vuelta horizontal (`overflowsSide`) en ventana y contenedores con scroll.
- CSS solo con tokens, `prefers-reduced-motion`, `forced-colors` (borde, `forced-colors.css:71`) y `print` (oculto, `print.css:29`).
- Guía de uso y nota de la web coherentes con el comportamiento (salvo el recorte, ver Ideas).
