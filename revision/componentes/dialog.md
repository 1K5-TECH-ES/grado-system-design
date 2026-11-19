# Dialog

Revisado el 2026-11-19 sobre Grado 0.7.0 · Superposiciones

La base es buena: `<dialog>` nativo con `showModal()`, foco atrapado, Escape y vuelta del foco probados en React y en Vue, y el mismo HTML en los dos. Lo más importante es un fallo que pierde datos: arrastrar desde un campo hasta el fondo cierra el diálogo. Después vienen los dos huecos que obligaron a NeuroHelp a escribir `AppDialog` y `SettingsSheet` (contenido montado cerrado y aviso de cambios sin guardar) y la falta de un tamaño, que las dos apps suplen con unas 30 clases de ancho a mano.

Este archivo también sirve para `AlertDialog` y `Drawer`/`Sheet`: comparten el código (`packages/grado-react/src/Dialog.tsx`, `packages/grado-vue/src/Dialog.ts`) y sus fichas remiten aquí.

Uso: Memorias 15 · NeuroHelp 2 envoltorios usados 22 veces (`AppDialog`), más `SettingsSheet` (13) · Sales Coach 0 · Piezas propias en las apps: NeuroHelp `AppDialog` (monta al abrir, `dirty`) y `SettingsSheet` (formulario que abarca cuerpo y pie, aviso de cambios, tres anchos). Memorias: montaje condicional a mano (`memorias-form.jsx:1205`).

## Hallazgos

### dialog-1 · Arrastrar desde un campo hasta el fondo cierra el diálogo

- **Tipo:** fallo
- **Prioridad:** alta
- **Prueba:** `packages/grado-react/src/Dialog.tsx:88-95`, `packages/grado-vue/src/Dialog.ts:85-91` y `packages/grado-elements/src/k5-dialog.js:40-45` deciden «clic fuera» con `event.target === dialog` y las coordenadas del `click`. Si el botón se pulsa dentro de un campo y se suelta en el fondo (seleccionar texto arrastrando, algo muy normal), el `click` llega al `<dialog>`, que es el ancestro común, con coordenadas fuera de la caja, y se cierra. Reproducido en Chromium 157 con el Dialog real de React y de Vue: rellenar un input, `mouse.down` en el campo, mover 60 px fuera del diálogo, `mouse.up` → `dialog.open = false` y `onOpenChange(false)` en los dos.
- **Por qué importa:** se pierde lo escrito sin aviso. Afecta a todos los formularios en Dialog de Memorias (15) y a los 22 `AppDialog` y 13 `SettingsSheet` de NeuroHelp; con `dirty` al menos sale la confirmación, sin él se pierde. También a `Drawer` (el fondo a su izquierda). `AlertDialog` no, porque no cierra con el fondo.
- **Propuesta:** cerrar solo si el gesto empezó en el fondo. En `pointerdown` del `<dialog>` guardar si el objetivo es el propio `<dialog>` y el punto cae fuera de la caja; en `click`, cerrar solo si ese indicador está activo, y limpiarlo. Igual en React (`onPointerDown`), Vue y `k5-dialog`. Test en `test/browser/run.mjs`: arrastre desde el input del `#dialog` hasta el fondo y el diálogo sigue abierto; un clic normal en el fondo lo cierra (hoy solo se prueba que el AlertDialog no se cierra, `run.mjs:103-105`).
- **Rompe:** no
- **Esfuerzo:** S

### dialog-2 · El contenido se queda montado aunque el diálogo esté cerrado

- **Tipo:** API
- **Prioridad:** alta
- **Prueba:** `Dialog.tsx:125-126` pinta `children` y `footer` siempre; `Dialog.ts:113-114`, igual con los slots. Con un componente que cuenta sus montajes dentro de un Dialog cerrado, React y Vue lo montan una vez al cargar la página sin abrir nada (comprobado en Chromium). Ya está en el backlog y avisado en `GUIA-INTEGRACION.md:430` y en `plugins/grado/skills/grado/references/componentes.md:135`.
- **Por qué importa:** las dos apps lo esquivan a mano. Memorias monta el editor de cubierta solo abierto porque carga el satélite y el catastro al montarse (`memorias-form.jsx:1204-1215`). NeuroHelp hizo `AppDialog` sobre todo por esto (`AppDialog.vue:6`, `<slot v-if="open" />` en la línea 50) y `ConfirmDialog.vue:32` repite el `v-if`. Además, en React `autoFocus` dentro del diálogo no sirve: React llama a `focus()` al montar, y el contenido se monta con el diálogo cerrado.
- **Propuesta:** el `<dialog>` sigue montado siempre (lo necesitan `ref` y `showModal`), pero el cuerpo y el pie solo se pintan mientras está abierto. Prop nueva `keepMounted` (React) / `keep-mounted` (Vue), por defecto `false`, para quien necesite conservar el estado de lo que hay dentro. React: `visible || keepMounted ? <div className="k5-dialog__body">…` ; Vue: lo mismo con `visible.value`. Después, quitar los avisos de la guía y de la skill. Si se prefiere no romper, la alternativa es `lazy` por defecto `false`, pero entonces cada app tiene que acordarse de ponerlo, que es justo lo que pasa hoy.
- **Rompe:** sí. Lo de dentro pierde su estado al cerrar y el HTML cerrado (también el de SSR) ya no lleva cuerpo ni pie. En «Al actualizar desde 0.7»: «Dialog, AlertDialog y Drawer montan el contenido solo mientras están abiertos. Si necesitas que algo conserve su estado entre aperturas, añade `keepMounted`. Ya puedes quitar los `{open && …}` y `v-if="open"` que pusiste para esto».
- **Esfuerzo:** M

### dialog-3 · Sin aviso de cambios sin guardar

- **Tipo:** API
- **Prioridad:** alta
- **Prueba:** Grado permite negarse a cerrar (con `open` controlado basta con no cambiarlo), pero no ofrece la confirmación. NeuroHelp la construyó en `AppDialog.vue:24-35` y `53-58`: intercepta `update:open`, abre un `AlertDialog` propio con cuatro textos propios (`i18n/es.ts:580-583`) y solo cierra al descartar. Se usa con `dirty` en 10 de los 22 `AppDialog`, y `SettingsSheet.vue:37-40` añade además el aviso «Cambios sin guardar» con punto en el pie (13 usos). Ya está en el backlog.
- **Por qué importa:** es la segunda razón de `AppDialog` y la principal de que `SettingsSheet` exista. Además, la guía dice «No abras un Dialog desde otro Dialog» (`docs-site/guidelines.mjs:198`), que es justo lo que hay que hacer para esta confirmación.
- **Propuesta:** prop `dirty` (boolean). Con `dirty`, cerrar con Escape, el aspa o el fondo abre una confirmación interna (el mismo `AlertDialog`) con textos nuevos en `messages.js`, `messages/de.js` y `messages/en.js` (`discardTitle`, `discardDescription`, `keepEditing`, `discard`); «Descartar» llama a `onOpenChange(false)` / `update:open`. Cerrar desde la app (`open = false`) no pregunta. Opcional: con `dirty`, el pie muestra el estado «Cambios sin guardar» con punto y texto, como `SettingsSheet`. En la guía, la excepción: un AlertDialog sobre un Dialog para confirmar sí.
- **Rompe:** no
- **Esfuerzo:** M

### dialog-4 · Sin tamaño: las apps fijan el ancho con clases y una no lo consigue

- **Tipo:** API
- **Prioridad:** media
- **Prueba:** `packages/grado/src/css/overlay.css:29-30` fija `width: min(32rem, …)` y `max-width: none`, y no hay prop de tamaño. NeuroHelp lo cambia con clases en 16 sitios (`w-[min(36rem,calc(100vw-2rem))]` en `ApiKeysSettings.vue:274` y otros; `SettingsSheet.vue:29` con tres anchos) y Memorias en 14 (`presupuesto-dialog.jsx:187`, `factura-anticipo-dialog.jsx:75` con 76 rem…): doce anchos distintos entre 20 y 76 rem. `bienvenida-dialog.jsx:18` pone `className="max-w-2xl"`, que no hace nada porque manda `width: 32rem`: el correo de bienvenida sale con el ancho por defecto cuando se quería más ancho.
- **Por qué importa:** cada app inventa sus anchos, y la forma «obvia» (heredada de shadcn, `max-w-*`) falla en silencio.
- **Propuesta:** prop `size: 'sm' | 'md' | 'lg' | 'xl'`, por defecto `md`, en React y Vue, con clases `k5-dialog--sm` (28 rem, el de AlertDialog), `--lg` (42 rem) y `--xl` (58 rem), siempre con `min(…, 100vw - 2rem)`. En Drawer, los mismos nombres con anchos de panel (por ejemplo 24, 28, 42 y 56 rem, los que usa `SettingsSheet`). En la ficha de la web, una línea: «para un ancho a medida, cambia `width` con `className`, no `max-width`».
- **Rompe:** no
- **Esfuerzo:** M

### dialog-5 · Al abrir, el foco va al aspa en React y Vue y al primer campo en el Web Component

- **Tipo:** accesibilidad · paridad
- **Prioridad:** media
- **Prueba:** `Dialog.tsx:58` y `Dialog.ts:51` solo llaman a `showModal()`, y el navegador enfoca el primer elemento enfocable en orden del documento: el aspa de la cabecera. Comprobado en Chromium: `document.activeElement` es `.k5-close` en React y en Vue con un input en el cuerpo. `k5-dialog.js:81-83` en cambio enfoca el primer campo del cuerpo, y `test/browser/elements.check.mjs:93` lo exige. Ningún test mira el foco inicial de React ni de Vue.
- **Por qué importa:** en un formulario (la mayoría de los Dialog de las dos apps) la persona de teclado tiene que tabular desde «Cerrar» y el lector de pantalla empieza por «Cerrar, botón». La guía de patrones (APG, *Dialog (Modal)*) pide el primer elemento útil. Y en React no hay arreglo desde la app: `autoFocus` no funciona (ver dialog-2).
- **Propuesta:** tras `showModal()`, enfocar el primer `[data-autofocus]` del diálogo; si no hay, el primer control del cuerpo, con el mismo selector que `k5-dialog.js:82`; si no hay, el aspa. En `AlertDialog` se queda en el aspa (o en el botón de cancelar si se hace alert-dialog-1), que es la acción menos destructiva. Test en `run.mjs`: al abrir `#dialog`, el foco está en el input.
- **Rompe:** no (arreglo de accesibilidad)
- **Esfuerzo:** S

### dialog-6 · Cerrarlo por la vía nativa deja el estado abierto y la página sin scroll

- **Tipo:** fallo
- **Prioridad:** media
- **Prueba:** ni `Dialog.tsx` ni `Dialog.ts` escuchan el evento `close` del `<dialog>`; solo `cancel` y `click`. Si se cierra sin pasar por ellos (un `<form method="dialog">` dentro, `ref.current.close()` con la `ref` que el componente expone, `requestClose()`), el `<dialog>` se cierra pero `open` sigue en `true`. Comprobado en Chromium con un `<form method="dialog">` dentro, en React y en Vue: `dialog.open = false`, el estado sigue en `true`, `body.style.overflow` sigue en `hidden` y el botón de abrir ya no lo abre porque para Grado ya está abierto. `k5-dialog.js` tiene el mismo problema con su atributo `open`.
- **Por qué importa:** hoy ninguna app lo hace (buscado en las tres), pero la `ref` da el `HTMLDialogElement` y `close()` es lo primero que alguien prueba. El resultado es una página que no hace scroll hasta recargar.
- **Propuesta:** escuchar `close` en React (`onClose`, llamando también al `rest.onClose` de la app) y en Vue: si el estado está abierto, `setVisible(false)`; la limpieza del efecto ya desbloquea el scroll y devuelve el foco. En `k5-dialog`, quitar el atributo `open`. Test con `<form method="dialog">` en el fixture.
- **Rompe:** no
- **Esfuerzo:** S

### dialog-7 · Escape con un Tooltip abierto dentro cierra también el diálogo

- **Tipo:** fallo
- **Prioridad:** media
- **Prueba:** `packages/grado-react/src/Tooltip.tsx:32-35` y `packages/grado-vue/src/Tooltip.ts:23-26` paran la propagación de Escape pero no llaman a `preventDefault()`, y el `<dialog>` se cierra con la acción por defecto de la tecla. Comprobado en Chromium: Dialog con un Tooltip, foco en el disparador (el tooltip se ve), Escape → el diálogo se cierra. Popover, DropdownMenu, Combobox, TimePicker y SearchInput sí llaman a `preventDefault()` y no tienen el problema.
- **Por qué importa:** quien pulsa Escape para quitar la ayuda pierde el formulario. Pasa en cualquier Dialog o Drawer con un `IconButton` o un campo con Tooltip.
- **Propuesta:** el arreglo va en Tooltip (React y Vue): `event.preventDefault()` junto a `stopPropagation()`, solo cuando el tooltip estaba abierto. Test en `test/browser/`: Tooltip dentro de `#dialog`, Escape quita el tooltip y el diálogo sigue abierto. Conviene llevarlo también a la ficha de Tooltip.
- **Rompe:** no
- **Esfuerzo:** S

### dialog-8 · El aspa mide 28 px también en Campo y en pantallas táctiles

- **Tipo:** accesibilidad
- **Prioridad:** media
- **Prueba:** `overlay.css:160-166` fija `.k5-close` a `1.75rem`. El resto de controles usan `--k5-control-h`, que en Campo es `2.75rem` (`packages/grado/src/tokens.json:415`) y con densidad cómoda también, que se aplica sola con `pointer: coarse` (`tokens.json:189`, `dist/tokens.css:563-569`). El aspa es el único objetivo que se queda en 28 px.
- **Por qué importa:** Campo promete controles de 44 px para técnicos con guantes; el aspa del diálogo, del Drawer, de Alert, Banner y Toast (todos usan `.k5-close`) es el objetivo más pequeño de la pantalla, y en el Drawer de móvil es la forma principal de cerrar.
- **Propuesta:** mantener el tamaño visual y agrandar la zona de toque con un `::before` absoluto: `.k5-close { position: relative } .k5-close::before { content: ''; position: absolute; inset: min(0px, calc((1.75rem - var(--k5-control-h)) / 2)) }`. Solo CSS, sirve para React, Vue y Web Component; las capturas no cambian. Comprobar en `test/browser/` que el área de clic del aspa mide 44 px con Campo.
- **Rompe:** no
- **Esfuerzo:** S

### dialog-9 · El pie queda fuera del formulario del cuerpo

- **Tipo:** API
- **Prioridad:** media
- **Prueba:** `Dialog.tsx:125-126` y `Dialog.ts:113-114` pintan cuerpo y pie como hermanos, así que un `<form>` en el cuerpo no puede contener los botones del pie. NeuroHelp lo resuelve con `form="id"` en 34 botones (`CustomersView.vue:375`, `HandoffDialog.vue:390`…) y, en `SettingsSheet.vue:8-10` y `32-36`, con un segundo `<form>` en el pie que reenvía con `requestSubmit()` para no perder la validación nativa.
- **Por qué importa:** es el caso más común (editar y guardar), obliga a inventar ids únicos y es la otra razón de ser de `SettingsSheet`.
- **Propuesta:** prop `asForm` (React) / `as-form` (Vue): envuelve cuerpo y pie en `<form class="k5-dialog__form">` con `display: contents`, para que la maquetación no cambie. El evento `submit` sube hasta el `<dialog>`, así que la app lo recoge con el `onSubmit` que ya llega al `<dialog>` (React) o `@submit` en los attrs (Vue). Los botones del pie con `type="submit"` funcionan sin ids. Añadirlo a parity y al ejemplo de la ficha.
- **Rompe:** no
- **Esfuerzo:** M

### dialog-10 · `side` existe en el Dialog y el AlertDialog de Vue y no hace nada

- **Tipo:** paridad
- **Prioridad:** baja
- **Prueba:** `Dialog.ts:24` declara `side` para los tres componentes, aunque solo se usa en el Drawer (`Dialog.ts:79`); `api/grado-vue.api.md:72` y `:425` lo listan en AlertDialog y Dialog. En React, `Dialog` no lo tiene en los tipos, pero desde JavaScript (Memorias es `.jsx`) `<Dialog side="left">` llega a `Modal` y lo convierte en un panel: comprobado con un script, React pinta `k5-dialog k5-drawer k5-drawer--left` y Vue `k5-dialog`.
- **Por qué importa:** poco; es una prop que se documenta sola en el informe de API y engaña. `AppDialog.vue:44` se la pasa al Dialog.
- **Propuesta:** en Vue, declarar `side` solo cuando `kind === 'drawer'`; en React, `Dialog` y `AlertDialog` descartan `side` antes de pasar a `Modal`.
- **Rompe:** sí, en teoría: quitar una prop de Dialog y AlertDialog de Vue. No tenía efecto; en Vue, si una app la pasa, pasará a atributo del `<dialog>`. Línea en «Al actualizar».
- **Esfuerzo:** S

### dialog-11 · El fondo usa un negro fijo, sin token

- **Tipo:** aspecto
- **Prioridad:** baja
- **Prueba:** `overlay.css:46-53` pinta el `::backdrop` con `rgb(0 0 0 / 0.4)` y `0.6` en oscuro, con un selector `:where(.dark, [data-theme='dark'])` propio; es el único color fijo de relleno en el CSS junto al fondo móvil de `app-shell.css:350`.
- **Por qué importa:** salta la regla de «solo tokens» y un tema no puede cambiarlo (Campo al sol quizá quiera más opacidad).
- **Propuesta:** token `backdrop` en `tokens.json` por tema y modo, usado aquí y en `app-shell.css`.
- **Rompe:** no
- **Esfuerzo:** S

### dialog-12 · Los tests de navegador no cubren el clic en el fondo, el foco inicial ni AlertDialog/Drawer en parity

- **Tipo:** tests
- **Prioridad:** baja
- **Prueba:** `test/browser/run.mjs:97-127` prueba Escape, vuelta del foco, que el AlertDialog no cierre con el fondo, el aspa del Drawer y el editor sin cabecera. No prueba que un clic en el fondo cierre un Dialog, ni el foco inicial, ni nada de dialog-1, -6 o -7. `test/patterns.test.mjs:201-202` compara React y Vue solo para Dialog; AlertDialog y Drawer con `side="left"` y pie salen iguales (comprobado con un script), pero nada lo vigila.
- **Por qué importa:** son los componentes de superposición más usados en las tres apps.
- **Propuesta:** añadir los casos a `sameHtml` (AlertDialog con descripción y pie, Drawer izquierdo) y, con cada arreglo de arriba, su comprobación en `run.mjs`.
- **Rompe:** no
- **Esfuerzo:** S

## Ideas

- Animación de salida para Dialog y Drawer (hoy solo entran).
- Al bloquear el scroll, la barra desaparece y la página salta unos píxeles en escritorio: `scrollbar-gutter: stable` o compensar con `padding-right`.
- El `<dialog>` se pinta donde está el componente, sin portal ni teletransporte: los eventos suben a los padres (por eso `SettingsSheet.vue:10` usa `.stop`). Valorar un aviso en la guía.
- `onOpenChange` sin el motivo del cierre (Escape, fondo, aspa): ninguna app lo ha pedido todavía.
- En Vue, `description` solo admite texto; en React, cualquier nodo. Slot `description` en Vue.
- `k5-dialog` no tiene `alert`, panel lateral, `fullscreen`, `header` ni `close-on-escape`; ninguna app usa el Web Component.
- `@media print`: un diálogo abierto se imprime encima de la página.

## Revisado sin hallazgos

- Escape cierra y el foco vuelve al disparador, probado en React y en Vue (`run.mjs:97-102`); `closeOnEscape={false}` lo respeta (`run.mjs:113-115`), y el editor de Memorias lo usa.
- Nombre y descripción accesibles: `aria-labelledby` al `h2` también sin cabecera, `aria-describedby` solo con descripción, ids que existen (`patterns.test.mjs:340-347` y el bucle de destinos).
- Controlado y no controlado con `useValue`/`model`; la app puede negarse a cerrar no cambiando `open`.
- Desmontar abierto: la limpieza cierra, libera el bloqueo y devuelve el foco (`Dialog.tsx:60-64`, `Dialog.ts:58`). Bloqueos anidados con contador (`patterns.test.mjs:70-80`).
- Mismo HTML en React y en Vue (`patterns.test.mjs:201-202`); `className`/`class` y atributos llegan al `<dialog>`, y la `ref` es el `HTMLDialogElement` (`refs.fixture.mjs:84-87`).
- Aspecto: solo tokens salvo el fondo (dialog-11); `forced-colors` con borde, `prefers-reduced-motion` sin animación, márgenes menores en móvil; centrado con el preflight de Tailwind 4 probado (`run.mjs:122-127`).
- Textos: la etiqueta del aspa viene de `messages.close` y se puede cambiar con `closeLabel`.
