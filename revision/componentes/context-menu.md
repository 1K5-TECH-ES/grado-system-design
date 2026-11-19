# ContextMenu

Revisado el 2026-11-19 sobre Grado 0.7.0 · Superposiciones

Teclado, foco y colocación en la ventana están bien y probados en React y Vue. Hay un fallo solo de Vue: si el componente se vuelve a pintar con el menú abierto, el menú vuelve al punto del clic y se sale de la ventana. El hueco de Memorias no es tanto «abrir en un punto» como que nada dice que el menú puede depender de lo que hay bajo el puntero y que se puede no abrir; eso ya funciona, pero ni está documentado ni probado. Después van los atajos en las opciones y la zona, que siempre es una parada de Tab.

Uso: ninguna app · Piezas propias en las apps: Memorias `features/memorias/cubierta/menu-contextual.jsx` (menú del editor de cubierta con las clases `k5-menu__…`)

DropdownMenu comparte `MenuItem` y las clases `k5-menu__…`: lo que se proponga para las opciones (`context-menu-3`) vale para los dos.

## Hallazgos

### context-menu-1 · En Vue, el menú se sale de la ventana si se vuelve a pintar abierto

- **Tipo:** fallo
- **Prioridad:** alta
- **Prueba:** Vue pinta `style: { left: point.x, top: point.y }` (`packages/grado-vue/src/ContextMenu.ts:112`) y corrige la posición escribiendo en `menu.value.style` tras medir (`ContextMenu.ts:63-64`). Cualquier nuevo pintado vuelve a aplicar el objeto `style` del vnode y borra la corrección. En Chromium (Playwright, build de 0.7.0): zona de 100vw con un `<p>` que muestra un contador reactivo; clic derecho a 10 px del borde derecho de una ventana de 1000 px; el menú acaba con `right = 990`. Se incrementa el contador: `right = 1182`, `style.left = 990px`. En React no pasa (`right` sigue en 990) porque guarda la posición corregida en estado (`ContextMenu.tsx:32,56,117`).
- **Por qué importa:** basta con que la zona muestre algo vivo (una hora relativa, un estado que llega por socket, el contador de la fila) o que el padre cambie `items` para que el menú quede cortado. NeuroHelp ya chocó con esto en su `lib/floating.ts:83-84`: «Es reactivo para que Vue no borre la posición al volver a pintar el panel».
- **Propuesta:** en Vue, guardar la posición medida en un `ref<Point | null>` (`at`) y pintar `style` con `at ?? point`, como React; quitar las escrituras directas en `menu.value.style`. Test de navegador: abrir junto al borde, forzar un nuevo pintado y comprobar que el menú sigue dentro.
- **Rompe:** no
- **Esfuerzo:** S

### context-menu-2 · Nada dice que el menú puede depender de lo que hay bajo el puntero

- **Tipo:** documentación
- **Prioridad:** alta
- **Prueba:** Memorias hizo su propio menú porque creyó que Grado no podía: «el ContextMenu de Grado abre sobre una zona, y aquí lo que sale depende de lo que haya bajo el cursor en el lienzo, así que la posición la pone el editor» (`menu-contextual.jsx:8-10`). Su `alMenu` (`editor-cubierta.jsx:2095-2110`) mira `e.target`, cambia la selección y, con un comando en marcha, no abre menú (el botón derecho es Intro). Las dos cosas ya funcionan con el `ContextMenu` actual. En Chromium, con un `<svg>` dentro de la zona cuyo `onContextMenu`/`@contextmenu` guarda en estado el `data-k` del objetivo: el menú se pinta la primera vez ya con «Acciones de panel» en React y en Vue (comprobado con un `MutationObserver`). Y si el hijo llama a `event.stopPropagation()`, el menú no se abre (0 menús en los dos). La posición la pone el puntero, que es lo que Memorias quiere. Ni la ficha de la web (`superposiciones.docs.mjs:133-166`), ni la guía (`:276-292`), ni la skill de las apps lo cuentan, y ningún test lo fija.
- **Por qué importa:** es el hueco de la migración de Memorias (backlog 0.8). Sin decirlo, la siguiente app hará lo mismo.
- **Propuesta:** en la guía y en la ficha, un ejemplo React y Vue: el `onContextMenu` del hijo calcula lo que hay debajo y prepara `items`; `event.stopPropagation()` para dejarlo cerrado. Añadirlo a la skill de las apps (`references/guias/acciones.md` o `superposiciones.md`, vía `npm run skill`) y a `GUIA-INTEGRACION.md`. Un test de navegador que lo fije como contrato. Si se quiere hacer explícito en la API, mejor `onOpenChange(open)` / `update:open`, para que la app sepa cuándo se abre y se cierra, que una prop para abrir en un punto, que hoy nadie necesita (ver Ideas).
- **Rompe:** no
- **Esfuerzo:** S

### context-menu-3 · Las opciones no pueden enseñar su atajo

- **Tipo:** API
- **Prioridad:** media
- **Prueba:** `MenuItem` solo tiene `id`, `label`, `disabled`, `danger` y `separator` (`packages/grado/src/patterns.d.ts:11-17`); el botón pinta solo `item.label` (`ContextMenu.tsx:143`, `ContextMenu.ts:140`). Memorias pone el atajo al lado de casi cada opción para que se aprenda (`menu-contextual.jsx:6-7,63-66`: `justify-between` y `<Kbd>{o.atajo}</Kbd>`; «Ctrl+D», «Supr», «Ctrl+Z», «GI», «Doble clic» en `editor-cubierta.jsx:3612-3651`).
- **Por qué importa:** sin esto Memorias no puede pasarse a `ContextMenu` aunque se resuelva `context-menu-2`. Es habitual en menús de editor y en `DropdownMenu`.
- **Propuesta:** `shortcut?: string` en `MenuItem` (compartido con `DropdownMenu`), pintado como `<kbd class="k5-kbd k5-menu__shortcut">` alineado a la derecha y con `aria-hidden="true"`: el nombre accesible sigue siendo `label`, y como los «atajos» de Memorias no siempre son teclas («Doble clic», «GI»), no se usa `aria-keyshortcuts`. Clase nueva en `menu.css` con tokens; mismo HTML en React y Vue, y en el test de paridad.
- **Rompe:** no
- **Esfuerzo:** S

### context-menu-4 · La zona siempre es una parada de Tab, aunque su contenido ya se enfoque o esté desactivada

- **Tipo:** accesibilidad
- **Prioridad:** media
- **Prueba:** `tabIndex={0}` fijo en la zona (`ContextMenu.tsx:86`, `ContextMenu.ts:77`), también con `disabled`. En Chromium, una zona con un `<svg tabindex="0" role="application">` dentro (como el lienzo de Memorias, `editor-cubierta.jsx:3840-3849`): Tab va a `k5-context-menu[group]` → `svg[application]` → fuera. Dos paradas para lo mismo. Sin `label`, la primera es un `div` sin rol ni nombre. Y el teclado no la necesita: `Mayúsculas + F10` desde un hijo enfocado ya abre el menú, porque el `keydown` sube hasta la zona (`ContextMenu.tsx:97-104`).
- **Por qué importa:** cualquier zona con contenido enfocable (una fila con botones, un lienzo, una tarjeta con enlace) añade una parada vacía a quien navega con teclado. Memorias tendría dos al envolver su lienzo.
- **Propuesta:** prop `focusable` (por defecto `true`, como ahora) para quitar el `tabindex` cuando el contenido ya se enfoca; sin `tabindex` cuando `disabled`. En la guía: `focusable={false}` si dentro hay algo enfocable. Test de navegador de las paradas de Tab y de `Mayúsculas + F10` desde un hijo.
- **Rompe:** no
- **Esfuerzo:** S

### context-menu-5 · Sin opciones activas, Escape no lo cierra

- **Tipo:** fallo
- **Prioridad:** baja
- **Prueba:** al abrir, el foco va al primer `button:not(:disabled)` (`ContextMenu.tsx:66`); si no hay ninguno, se queda en la zona. Escape solo se atiende en el `keydown` del menú (`:118-124`), y el de la zona sale si ya está abierto (`:98`). En Chromium, con `items: [{ id: 'x', label: 'Nada', disabled: true }]`, `Mayúsculas + F10` abre el menú y Escape no lo cierra: solo un clic fuera.
- **Por qué importa:** pasa cuando las opciones se calculan por permisos o por estado y todas quedan desactivadas, o con `items` vacío.
- **Propuesta:** no abrir el menú si no hay ninguna opción activa (lo más sencillo), o enfocar el menú (`tabindex="-1"`) cuando no hay opciones activas para que su `keydown` atienda Escape. En React y Vue.
- **Rompe:** no
- **Esfuerzo:** S

## Ideas

- `open`/`onOpenChange` con una prop `point` para abrirlo desde código (por ejemplo, con el teclado en la posición de la cruz del lienzo); hoy ninguna app lo hace.
- `max-height: 18rem` de `k5-menu__content` hace que un menú de editor largo tenga scroll; Memorias lo quita con `max-h-none` (`menu-contextual.jsx:33`). Compartido con `DropdownMenu`.
- Con `position: fixed`, un antepasado con `transform`, `filter` o `contain` lo descoloca (por ejemplo, durante la animación de entrada de un `Drawer`). Lo resolvería la capa superior que se propone en `popover-1`.
- Al cerrar, el foco vuelve sin `preventScroll` (`ContextMenu.tsx:48`); Memorias lo hace con `preventScroll` para que el lienzo no salte.
- Objetivos de 44 px en Campo para `k5-menu__item` (compartido con `DropdownMenu`); en Android el menú se abre con pulsación larga.

## Revisado sin hallazgos

- Patrón de menú de la APG: `role="menu"` con nombre (`label` o «Acciones»), `menuitem` con `tabindex="-1"`, flechas que dan la vuelta y saltan lo desactivado, Home, End, inicial (`moveFocus`), Enter, Escape y `Mayúsculas + F10` para cerrar, foco de vuelta a donde estaba. Probado en `test/browser/` en React y Vue.
- Apertura con clic derecho en el puntero, con `Mayúsculas + F10` y con la tecla de menú bajo el elemento enfocado, sin abrirse dos veces por el `contextmenu` que lanza la tecla de menú.
- Colocación dentro de la ventana (`menuPosition`, con test unitario y de navegador) y cierre con scroll, resize, clic fuera y foco fuera.
- `disabled` deja el menú del navegador.
- Paridad de la zona (`test/parity-superposiciones.test.mjs:112-116`); el menú abierto no está en la paridad porque necesita DOM, pero el código es el mismo línea a línea.
- CSS solo con tokens; superficie y opciones de `menu.css`, con `forced-colors` para la opción enfocada.
- La guía avisa de que en móvil no hay clic derecho y de repetir las acciones en un sitio visible.
