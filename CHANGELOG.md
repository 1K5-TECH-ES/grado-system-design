# Cambios

Todas las versiones de `@1k5-tech-es/grado`, `@1k5-tech-es/grado-react`, `@1k5-tech-es/grado-vue` y, desde 0.6.0, `@1k5-tech-es/grado-elements`. Los paquetes comparten número de versión.

## 0.9.0 · sin publicar

0.9, «Precisión». Primera entrega del rediseño inspirado en Linear: el armazón se retira para que mande el contenido, Consola baja a 13 px y controles de 28 px, el movimiento se acorta y los iconos pasan a trazo 1,5. Los colores de marca, los tres temas y los cuatro principios no cambian.

### Fundamentos

- Neutros de Consola calculados en OKLCH con un tinte berenjena mínimo (matiz 305): gris, bordes y texto secundario en claro; en oscuro, fondo, tarjeta y menú más separados por luz, y un morado más suave (`#B98CEA`). Todo sigue pasando AA en los tres temas y 7 : 1 en Campo.
- El configurador de temas de la web calcula los neutros de Consola igual que el tema de serie, en OKLCH con el matiz del principal, y la sección activa de la barra lateral en gris. Con los colores de marca vuelve a reproducir Consola exactamente; para eso, cinco neutros de Consola se ajustan una unidad (el matiz pasa de 305 a 307, el del berenjena).
- `--k5-field`: el fondo hundido de los campos, un punto por debajo del panel (en oscuro, más oscuro que la tarjeta). Pasa AA con el texto y con el placeholder en los tres temas; en Campo es el fondo, para no perder contraste al sol.
- `--k5-tertiary-foreground`: tercer nivel de texto (fechas, contadores, pistas), más claro que `muted-foreground` y con 4,5 : 1 sobre el fondo y sobre gris en Consola y Marca. En Campo es igual que `muted-foreground`, para mantener 7 : 1. El configurador de temas de la web también lo calcula.
- `--k5-text-title-ui` y `--k5-leading-title-ui`: el título de `PageHeader` y el valor de `Kpi`. 24 px en Consola (antes 28); Marca y Campo siguen en 28.
- Tamaños nuevos por tema: `--k5-text-ui` y `--k5-leading-ui` (el texto de botones, campos, menús, navegación y tablas: 13 px en Consola, 14 px en Marca y Campo) y `--k5-row-h` (alto de fila de tabla: 36 px en Consola, 44 px en Marca y Campo).
- Controles de Consola a 24 · 28 · 32 px (antes 28 · 32 · 40). La densidad `compact` baja a 22 · 24 · 28 px. Marca y Campo no cambian.
- Movimiento: 80 · 120 · 180 · 240 ms (antes 100 · 150 · 200 · 300) y `--k5-ease-out` pasa a `cubic-bezier(0.16, 1, 0.3, 1)`, que arranca deprisa y se posa sin rebote.
- Sombras de menús y diálogos más largas y suaves; en oscuro, con un brillo de 1 px arriba.
- Iconos internos (y los de energía) a trazo 1,5. Los iconos que la app pone en `NavItem`, menús y botones se pintan también a 1,5.
- Inter variable: `fonts.css` trae un archivo por alfabeto con todos los pesos (`inter-latin-wght-normal.woff2`, 48 KB, y `inter-latin-ext-wght-normal.woff2`) en lugar de cuatro pesos estáticos. Una página en español descarga 48 KB en lugar de 72–96 KB. Con él, `--k5-weight-medium` pasa a 510 y `--k5-weight-semibold` a 590, un punto más finos y legibles a 13 px. Una app que carga su propia Inter (sin `fonts.css`) se queda en 500 y 600.
- El presupuesto de `grado.min.css` sube de 17 a 18,5 KB (con gzip) por los atajos, las variantes y props nuevas y la cabecera de 0.8, que se retira en 0.10.

### AppShell

- La web de Grado abre en Consola, donde se ve el rediseño. Marca hereda los componentes nuevos con su tamaño mayor y conserva su armazón (barra berenjena, indicadores en tarjeta).

- Consola: la cabecera y la barra lateral van sobre el fondo base (`--k5-sidebar`) y el contenido en un panel con borde y radio de 8 px. Sin cabecera berenjena, la marca deja de competir con la acción principal. En móvil el contenido ocupa todo el ancho, como antes. Marca no cambia.
- `brandHeader` (React y Vue): recupera la cabecera berenjena de 0.8. Obsoleta: se retira en 0.10.
- `Nav`: filas del alto del control (28 px), texto de 13 px, iconos más tenues que el texto, títulos de sección en minúscula y gris, contadores sin pastilla. Al pasar y en la sección activa, gris en lugar de menta y lila.

### Componentes

- `Button`: texto de 13 px (antes 12), relleno más corto, primario y destructivo con un brillo interior de 1 px, y el borde del secundario un punto más visible.
- `Input`, `Select`, `Textarea` y los campos con prefijo: radio de 6 px, texto de la interfaz y un borde que se oscurece al pasar.
- `DropdownMenu`, `ContextMenu` y `Combobox`: filas del alto del control y opción resaltada en gris en lugar de menta (un solo acento por vista). Los iconos de las opciones van más tenues y se encienden con la opción.
- `Tooltip`: más compacto, en peso medio.
- `Dialog`, `AlertDialog` y `Drawer`: cabecera sin línea debajo y título de 16 px, pie sin fondo gris, velo sin desenfoque y entrada más corta (de 0,98 a 1). `Drawer` flota a 8 px del borde con las cuatro esquinas redondeadas; en móvil sigue ocupando la pantalla.
- `Tabs`: el subrayado de la pestaña activa va en el color del texto, no en berenjena; texto de la interfaz. En `pill`, la elegida lleva un borde fino en lugar de negrita.
- `Table`: filas de `--k5-row-h`, separadores más tenues y cabecera con la misma línea que el resto.
- `Kbd`: tecla con fondo gris y sin borde.
- `SegmentedControl`: la opción elegida lleva un borde fino y se mueve con la curva nueva.
- `Switch`: 32 × 18 px en Consola; Marca y Campo mantienen 44 × 24.
- `Card`: título con el texto de la interfaz.
- `EmptyState`: icono de 24 px a trazo 1,25, y título y descripción con el texto de la interfaz.
- `CommandPalette`: resultados del alto de 36 px con el texto de la interfaz, grupos con título en minúscula y sin separadores, y resultado activo en gris en lugar de menta.
- `Popover`: texto de la interfaz.
- `Alert` y `Toast`: superficie de tarjeta con borde fino; el tono va solo en el icono, el título en el color del texto y la descripción en gris. El fondo de color queda para `Banner`.
- `ToggleGroup`: la opción activa va en gris levantado en lugar de berenjena.
- `Accordion`: texto de la interfaz; al pasar, el título se aclara en lugar de volverse berenjena.
- `Checkbox` y `RadioGroup`: texto de la interfaz, con la casilla centrada en la primera línea.
- `Input`, `Select`, `Textarea` y los campos con prefijo: fondo hundido (`--k5-field`) y anillo de foco más visible.
- `Checkbox` y `RadioGroup`: casilla y opción propias de 14 px (16 en Marca, 20 en Campo) con fondo hundido; marcadas, el color principal con un check que se dibuja, un guion en indeterminado o un punto de 6 px. Siguen siendo el input nativo; en alto contraste vuelven a ser los del sistema.
- `Switch`: 28 × 16 px en Consola.
- `SegmentedControl`: pista hundida con línea interior, a su ancho; la opción elegida, levantada.
- `Kbd`: tecla hundida con línea interior.
- `Slider`: pista de 4 px y pulgar de 14 px del color de la tarjeta, con anillo al enfocar.
- `Button`: cargando conserva su color; desactivado, el primario y el destructivo pasan a gris en lugar de desvaír su color.
- `Accordion`: filas de 32 px sin separadores, chevron a la izquierda que gira 90° y contenido alineado con el título.
- `Skeleton`: brillo que recorre el bloque en lugar de pulso.
- `Pagination`: botones sin caja y página actual en gris levantado en lugar de berenjena. `IconButton` conmutado, en gris con el icono en el color del texto.
- `Badge`: tinte al 12 %, 20 px de alto, el color en un punto y el texto en gris secundario, para que varias etiquetas juntas no compitan con la acción. Con un icono dentro, el icono lleva el color y no hay punto. `neutral` va sin punto.
- `Tag`: pastilla con línea fina y sin fondo, para distinguirla del chip gris de `FilterChip`.
- `Avatar`: 24 px (antes 28) y `sm` 20 px (antes 24), iniciales en negrita; `lg` sigue en 40 px para la cabecera de una ficha. `AvatarGroup` solapa 6 px.
- `DescriptionList`: como un panel de propiedades, con el dato en gris terciario, el valor con el texto de la interfaz y sin líneas entre filas.
- Gráficos (`BarChart`, `LineChart`, `PriceChart` y los que comparten sus ejes): valores de los ejes y categorías en gris terciario, rejilla continua de 1 px en lugar de discontinua, título con el texto de la interfaz y barras con radio de 2 px.
- `Banner`: franja de 36 px con el texto de la interfaz.
- `Stepper`: indicador de 24 px (antes 28) sin halo en el paso actual, y texto de la interfaz.
- `Progress` y `Meter`: barra de 6 px (antes 8). `Skeleton`: radio de 4 px.
- `Timeline`: texto de la interfaz y fecha en gris terciario. Los eventos sin `tone` llevan el punto gris en lugar de berenjena.

### Atajos de teclado

- `Button`: `shortcut` (`['⌘', '↵']`) pinta las teclas dentro del botón y pone `aria-keyshortcuts` (`Meta+Enter`) para que el lector de pantalla anuncie el atajo. En los botones de solo icono las teclas no se pintan: van en su `Tooltip`. La app sigue escuchando la tecla (por ejemplo con `useHotkey`).
- `Tooltip`: `shortcut` pinta las teclas tras el texto; con `trigger`, el control recibe `aria-keyshortcuts`.
- `DropdownMenu` y `ContextMenu`: cada opción acepta `shortcut`, que se pinta a la derecha. En `k5-menu`, con `data-shortcut="⌘ D"` en el `<option>`.
- `toast()`: la acción acepta `shortcut` (`{ label: 'Deshacer', shortcut: ['⌘', 'Z'], onClick }`), que se pinta en el botón y se anuncia con `aria-keyshortcuts`, en `Toaster` de React y Vue y en `k5-toaster`.
- `keyShortcuts()` en `@1k5-tech-es/grado/classes` traduce las teclas pintadas a los nombres de `aria-keyshortcuts` (`⌘` → `Meta`, `⇧` → `Shift`, `↵` → `Enter`…).

### PageHeader

- `variant="bar"`: una fila de 44 px para listados, con el título pequeño, lo que vaya dentro (un `SegmentedControl` para cambiar de vista, unos filtros) en medio y las acciones a la derecha, sobre una línea. El orden del HTML y del teclado no cambia. El título grande queda para las fichas.

### Combobox

- `onQueryChange` (Vue: `query-change`) avisa también con `''` cuando la búsqueda se vacía al elegir, con Escape o al salir del campo, para volver a la lista de partida.
- `onCreate` (Vue: `creatable` y el evento `create`): cuando lo escrito no es una opción (sin distinguir mayúsculas), la lista añade al final «Crear "…"» con un más delante. Elegirla avisa con el texto en lugar de seleccionar: la app crea la opción, la añade a `options` y la selecciona. Textos en español, alemán e inglés. `withCreateOption()` y `COMBOBOX_CREATE` en `@1k5-tech-es/grado/core`. En `k5-combobox` todavía no.

### DatePicker

- `natural`: se escribe la fecha y se elige de la lista. Entiende «hoy», «mañana», «pasado mañana», los días de la semana («vie», «próximo lunes»), «la próxima semana», «fin de mes», plazos («en 2 semanas», «2w», «una semana») y fechas («20/11», «20.11.27», «20 nov», «1 de diciembre», «2026-12-03»), en español, alemán e inglés según `GradoProvider`. Las frases salen de `Intl.RelativeTimeFormat`. Es un `Combobox`: el valor sigue siendo `YYYY-MM-DD` y `name` lo envía en un campo oculto. `today` fija el día de partida. `dateSuggestions()` y `shortDateLabel()` en `@1k5-tech-es/grado/patterns`.

### DataTable

- `groupBy`: junta las filas por un campo o por una función (un estado, un responsable). Cada grupo es un `<tbody>` con una fila de título (`<th scope="rowgroup">`) que lleva el nombre, el total y un botón con `aria-expanded` para plegarlo. Los grupos salen en el orden en que aparecen en `rows`, y la columna ordenada manda dentro de cada uno. `groupLabel` (Vue: también el slot `group`) pinta el título; sin él, la clave o «Sin grupo». `collapsedGroups` (React: `onCollapsedGroupsChange` · Vue: `v-model:collapsed-groups`) y `defaultCollapsedGroups` guardan los plegados. «Seleccionar la página» deja fuera las filas plegadas. Con grupos no hay filas virtuales.
- `groupRows()` en `@1k5-tech-es/grado/core` junta las filas igual para quien pinte su propia tabla.
- El presupuesto del import de `DataTable` sube de 14,5 a 15,5 KB por los grupos; el de `Button`, de 7 a 7,5 KB por los textos nuevos en tres idiomas, y el del adaptador de react-hook-form, de 24 a 25 KB por `DatePicker` natural.

### Drawer

- `modal={false}` (Vue: `:modal="false"`): vista previa sin velo. Se abre con `show()` en lugar de `showModal()`, sin `aria-modal`, sin bloquear el scroll ni atrapar el foco, así que la persona puede pasar de una fila a otra de la lista con el panel abierto. Escape (con el foco en el panel) y el botón de cierre lo cierran, y el foco vuelve al último control usado fuera del panel.

### FilterBar y FilterChip

- Filtro en partes: `field`, `operator` y `value` (Estado · es uno de · Abierta, En obra) en lugar de una etiqueta, separadas por una línea fina, con el botón de quitar al final. El chip es un grupo con la frase entera como nombre. Con `onEdit` (Vue: `editable` y el evento `edit`) cada parte es un botón que avisa de cuál se ha pulsado (`field`, `operator` o `value`) para abrir su selector sin quitar el filtro. En `FilterBar`, los filtros aceptan las mismas partes y avisan con `onEditFilter(id, part)` (Vue: `editable` y `edit-filter`). `label` sigue sirviendo para los filtros de una pieza.
- El chip (también el de `MultiSelect`) pasa a gris, sin borde ni tinte morado: el acento queda para la acción principal.

### Text

- `tone="tertiary"`: el tercer nivel de texto, con `--k5-tertiary-foreground`.

### Tabs

- `variant="view"`: pastillas pequeñas con borde y sin línea debajo, para cambiar de vista una lista desde una barra de herramientas (Todos · Abiertos · Esta semana).

### RadioGroup

- `variant="card"`: cada opción es una tarjeta con borde, y la elegida lleva el borde en el color principal. En horizontal se reparten en columnas. Para tarifas o planes con precio y descripción.

### Select

- `variant="property"`: chip de propiedad sin borde, a su ancho y del alto del control pequeño, gris al pasar y con el anillo de foco de siempre. Para cambiar el estado, el responsable o la prioridad en la cabecera o el lateral de una ficha sin que parezca un formulario. Sin etiqueta visible: lleva `aria-label`. En `controlClass('select', { variant: 'property' })` para apps que pintan su propio `<select>`.

### Status

- `progress`: para flujos con orden (un ticket, una instalación), el punto pasa a icono de progreso: discontinuo (`backlog`), vacío (`todo`), medio (`started`), tres cuartos (`waiting`), lleno con check (`done`) y lleno con aspa (`canceled`). La forma se lee sin color. Sin `tone`, cada paso trae el suyo (`started` en aviso, `waiting` en información, `done` en éxito). Es solo CSS sobre el mismo `k5-status__dot`.

### Al actualizar desde 0.8.0

- **Rompe** · `AppShell` en Consola cambia de aspecto: sin cabecera berenjena y con el contenido en un panel. Si la app necesita la cabecera de antes mientras se adapta, añade `brandHeader` (React) o `brand-header` (Vue); se retira en 0.10. Si la app pintaba su propio fondo en `<main>`, quítalo: el panel ya lo pone.
- Los controles de Consola miden 4 px menos y el texto de los botones pasa de 12 a 13 px. Revisa las maquetas ajustadas a mano (alturas fijas alrededor de un botón o un campo). En pantallas táctiles no cambia nada: `comfortable` sigue en 36 · 44 · 48.
- `Avatar` mide 4 px menos (24 y 20 px). Si una maqueta contaba con 28 px, usa `size="lg"` o ajusta el hueco.
- Los archivos estáticos de Inter (`assets/fonts/inter-latin-400-normal.woff2` y los demás pesos) ya no están en el paquete. Si la app los precargaba o los copiaba, usa `inter-latin-wght-normal.woff2` y `inter-latin-ext-wght-normal.woff2`; con `fonts.css` no hay que hacer nada.
- Los menús ya no resaltan en menta. Si una app contaba con ese color para algo, usa `--k5-accent` directamente.

## 0.8.0 · sin publicar

### Arreglos

- `Dialog` y `Drawer` (React, Vue y `k5-dialog`): pulsar dentro de un campo y soltar en el fondo, como al seleccionar texto arrastrando, cerraba el diálogo y se perdía lo escrito. Ahora el clic en el fondo solo cierra si empieza y acaba en el fondo. La regla está en `backdropGesture()` de `@1k5-tech-es/grado/patterns`, compartida por los tres.
- `Tooltip`: Escape con el tooltip abierto dentro de un `Dialog` o un `Drawer` cerraba también el diálogo. Ahora quita solo el tooltip, y el siguiente Escape cierra el diálogo. Con el tooltip ya oculto, Escape deja de quedarse en el tooltip y llega a lo que haya debajo.
- `Popover`: si la app cerraba el panel desde dentro (una opción que elige y cierra), el foco se quedaba en la página y quien usa el teclado volvía al principio. Ahora vuelve al disparador, como con Escape.
- `ContextMenu` (Vue): si la zona se volvía a pintar con el menú abierto (un dato que cambia, nuevos `items`), el menú perdía la corrección de posición y se salía de la ventana. Ahora guarda la posición medida, como en React.

### Documentación

- `ContextMenu`: la ficha y la guía cuentan que las opciones pueden depender de lo que hay bajo el puntero (el `onContextMenu` de un hijo se ejecuta antes de abrir y puede preparar `items`) y que un hijo puede dejarlo cerrado con `event.stopPropagation()`. Funcionaba ya en 0.7; ahora lo fija un test de navegador.

### Al actualizar desde 0.7.0

- Nada que cambiar. Si tu app devolvía a mano el foco al disparador de un `Popover` al cerrarlo desde dentro, o evitaba que el arrastre cerrara un `Dialog`, ya puedes quitarlo.

## 0.7.0 · 16 de octubre de 2026

0.7, lo que hizo falta para pasar Memorias (React 19 + Tailwind 4) a Grado instalado desde GitHub Packages, sin componentes de shadcn.

### Arreglos

- Diálogos centrados con Tailwind 4: el preflight pone `margin: 0` en todo, y el `<dialog>` modal solo se centra con el `margin: auto` del navegador. `Dialog`, `AlertDialog` y `CommandPalette` se abrían pegados arriba a la izquierda en las apps con Tailwind 4. Ahora `.k5-dialog` lo pone él. Un test del navegador lo comprueba con el preflight puesto.
- `Table`: una cabecera de fila en el cuerpo (`<th scope="row">`) se pintaba como la cabecera de la tabla, en gris y pequeña. Ahora es una celda más, con el nombre en negrita, y entra en el resaltado de la fila.

### Dialog

- `fullscreen`: ocupa la ventana menos 1 rem por cada lado, para editores y visores de planos.
- `header={false}`: sin cabecera ni botón de cierre. El título y la descripción siguen nombrando el diálogo para lectores de pantalla, y el cuerpo va sin márgenes, como lienzo para la app.
- `closeOnEscape={false}`: Escape no cierra, y la app puede usarlo para lo suyo (cancelar el comando en curso de un editor).
- React pasa los demás atributos al `<dialog>` (`onKeyDown`, `onPaste`, `style`, `data-*`…), como ya hacía Vue. Valen también para `AlertDialog` y `Drawer`.

### Tooltip

- `trigger` (React) y el slot `trigger` (Vue): el tooltip acompaña a cualquier control (un `Button`, un `IconButton`, un enlace) en lugar de pintar su botón de información, y le pone `aria-describedby` mientras se ve. Sirve para el atajo de teclado de un botón. En Vue, `content` puede ser también un slot. `label` solo hace falta sin `trigger`.

### Labs

- `useTheme`, `ThemeToggle` y `themeScript()` aceptan `defaultMode`: el modo sin nada guardado. Por defecto sigue siendo `system`; con `'light'`, la app es clara salvo que se elija otra cosa, y elegir «Sistema» se guarda. `readThemeMode()` y `saveThemeMode()` reciben el mismo valor.

### Al actualizar desde 0.6.0

- Nada que cambiar. Si tu app con Tailwind 4 corregía el centrado de los diálogos con CSS propio, ya puedes quitarlo.
- Una tabla con `<th scope="row">` en el cuerpo cambia de aspecto: el nombre deja de ir en gris y pequeño.

## 0.6.0 · 16 de octubre de 2026

0.6, «Ampliación». Fase 1: utilidades que las apps escribían cada una a su manera, en `labs`. Fase 2: componentes de energía y ventas, también en `labs`. Fase 3: el tema de alto contraste «campo» y la fuente Inter. Fase 4: un núcleo común para React y Vue, y Web Components para HTML sin framework.

### Web Components

- Paquete nuevo, `@1k5-tech-es/grado-elements`, para HTML sin framework (PHP, Twig, páginas estáticas): `k5-combobox`, `k5-dialog`, `k5-tabs`, `k5-menu` y `k5-toaster` con `toast()`. Generan el mismo HTML que los componentes de React (un test lo compara), con el mismo teclado y los mismos textos, en el DOM normal: `grado.css` y los estilos de la app se aplican igual.
- `k5-combobox` con `name` envía su valor con el formulario; `k5-dialog` se abre con un botón `data-k5-open="id"` sin escribir JavaScript; `k5-menu` avisa con `k5-select`; `toast()` usa la misma cola que en React y Vue.
- `dist/grado-elements.min.js` lo trae todo en un archivo (12,6 KB con gzip) para cargarlo con `<script type="module">` sin bundler; con bundler, `import '@1k5-tech-es/grado-elements'`.
- Probados en el navegador con teclado, formulario, avisos y axe en los tres temas y los dos modos, y con una app de prueba HTML + Vite que los instala desde el `.tgz`. Se publica junto a los otros tres paquetes, con el mismo número de versión.

### Núcleo común

- `@1k5-tech-es/grado/core`: el estado y el teclado de `Combobox`, `Calendar` y `DataTable`, que React y Vue tenían cada uno por su cuenta, en funciones sin framework (`comboboxReduce`, `calendarView`, `tableView`…). React, Vue y `grado-elements` las usan igual, así que se comportan igual y se prueban una vez. Ningún componente cambia de API ni de HTML.

### Tema «campo»

- Tema nuevo de alto contraste para el trabajo de campo, para técnicos con la tablet al sol: todo el texto llega a 7 : 1 (AAA) en claro y en oscuro, también el de los avisos sobre fondo tintado; bordes y campos que se ven (el borde llega a 4 : 1 sobre el fondo); controles de 44 px (36 y 52 en los tamaños pequeño y grande). Hereda de Consola.
- Va en su propio archivo para que no lo descargue quien no lo usa: `import '@1k5-tech-es/grado/themes/campo.css'` (o `themes/campo-hsl.css` con Tailwind 3) después de los tokens, y `data-k5-theme="campo"` en `<html>` o en una zona. Un `data-k5-density` puesto a mano sigue mandando.
- `minContrast` en un tema de `tokens.json` sube el contraste mínimo que comprueban los tests y el del texto sobre tintes. Tokens Studio y el formato W3C traen también «Campo · claro» y «Campo · oscuro».
- En la web, «Campo» en el selector de tema, en Inicio y en Instalación; axe y las capturas por componente lo prueban en claro y oscuro.

### Fuente

- Inter sustituye a Barlow como fuente de todo Grado: `--k5-font-sans`, el preset de Tailwind y `@1k5-tech-es/grado/fonts.css`, que trae Inter 400, 500, 600 y 700 (latín y latín extendido, licencia SIL OFL 1.1). Barlow sale del paquete. En el configurador de temas de la web, Inter es la fuente por defecto y Barlow una opción más.
- Los códigos de tema sin fuente (`GRADO-5C068C-2ED8C3-F-R8`) abren ahora con Inter; para Barlow, `-BARLOW`.

### Labs

- Entradas nuevas `@1k5-tech-es/grado/labs`, `@1k5-tech-es/grado-react/labs` y `@1k5-tech-es/grado-vue/labs`, y su CSS en `@1k5-tech-es/grado/labs.css` (aparte de `grado.css`). Lo de labs queda fuera de la promesa de la 1.0: puede cambiar en una versión menor hasta que pase al paquete principal. En la web, una familia nueva, «Labs».
- `Amount`, `formatEuro()`, `formatEnergy()` y `formatPower()`: importes, energía y potencia con el formato español, cifras alineadas y espacio duro antes de la unidad («1234,50 €», «7,2 kWh», «6,4 kWp»); con `scale`, MWh y MW; con `signed` y `colored`, variaciones en verde o rojo. `Amount` es un `<data>` con el número sin formato en `value`.
- `RelativeTime` y `formatRelative()`: «hace 5 minutos», «ayer», «16 oct» pasada una semana; la fecha completa en `title` y `datetime`, y se actualiza sola.
- `ThemeToggle`, `useTheme()` y `themeScript()`: Claro, Oscuro o Sistema, guardado en `localStorage` y aplicado con la clase `dark` en `<html>`; todos los controles de la página se enteran. `themeScript()` en el `<head>` evita el parpadeo al cargar. Con `apply: false` solo guarda la elección.
- `ScrollArea`: zona con scroll propio, barra fina y nombre, que recibe el foco y se desplaza con las flechas.
- `useHotkey()` y `hotkeyLabel()`: atajos como `'mod+k'` (⌘ en Mac, Ctrl en el resto) o `'?'`; los de una tecla no saltan mientras se escribe en un campo.
- `VisuallyHidden`: texto solo para lectores de pantalla.
- `TariffComparison`, `tariffCost()` y `compareTariffs()`: lo que cuesta al año el mismo consumo con dos o tres tarifas de la 2.0TD (precio único o por periodo, potencia por periodo, cuota mensual), con la más barata marcada, lo que cuesta al mes y cuánto más cuesta cada una. Sin impuestos salvo que se pasen (`taxes: { electricityTax, vat }`): cambian con el tiempo y Grado no los inventa. Es una tabla, con la más barata dicha también con texto.
- `SignaturePad`: firma de la oferta con el dedo, un lápiz o el ratón, o escribiendo el nombre (la alternativa para el teclado y los lectores de pantalla). La firma es `{ strokes }` o `{ typed }`; `signatureSvg()` y `signatureDataUrl()` la exportan como SVG, y con `name` viaja en un campo oculto del formulario. La página no se desplaza mientras se firma.
- `SolarForecast` y `forecastSummary()`: producción solar prevista frente a la real, hora a hora (o por cuartos de hora), con el tiempo de cada franja. El resumen da el total previsto, lo producido hasta la última hora con dato y si va más de un 5 % por encima o por debajo. Se recorre con las flechas como los demás gráficos, con tabla oculta para lectores de pantalla.
- Los textos de labs (los del tema, las tarifas, la firma y la previsión) van en `@1k5-tech-es/grado/labs` (`LABS_MESSAGES`, `labsMessagesFor()`), no en los mensajes principales: una app que no usa labs no los descarga. Se cambian con el mismo `messages` de `GradoProvider`.

### Web: Personalizar

- El configurador de temas se pone al día: base «Campo» (fija «Alto contraste» y comprueba 7 : 1), control de densidad, escala tonal del principal (`--k5-primary-subtle`, `-border`, `-text`) en el CSS del tema, y modo oscuro que gana también con `data-k5-theme` en `<html>`.
- La instalación usa lo que hay ahora: Inter desde `fonts.css`, `themes/campo.css` con Campo, `data-k5-theme` y `data-k5-density` en `<html>`, y `grado-elements` en HTML sin framework.
- El principal y el acento oscuros, y el principal «Suave», se aclaran solo hasta donde su texto llega a 4,5 : 1: el tema de serie ya no se queda en 4,1 : 1 en oscuro, y ningún color sugerido falla en ninguna paleta ni variante (lo comprueba un test).
- Vista previa con indicadores de estado, tendencias en los KPI, progreso, `BarChart` y avisos con tinte.

### Calidad

- Informe de la API de labs (`api/grado-react-labs.api.md` y `api/grado-vue-labs.api.md`) y presupuesto de tamaño para labs.
- Las capturas por componente pintan el fondo alrededor de la vista previa aislada: lo que sobresale (una lista abierta) o las esquinas redondeadas ya no dejan ver la página de debajo.

### Al actualizar desde 0.5.0

- Cambia la fuente: con `@1k5-tech-es/grado/fonts.css`, las apps pasan a Inter sin tocar nada. Inter es algo más ancha que Barlow: revisa los textos que iban justos (botones, columnas estrechas, menús). Para seguir con Barlow, cárgala tú (por ejemplo, `@fontsource/barlow`) y pon `--k5-font-sans: Barlow, ui-sans-serif, system-ui, sans-serif`.

## 0.5.0 · 16 de octubre de 2026

0.5, «Estabilidad»: las apps a producción, lo que prometemos probado y la API lista para congelarla en la 1.0.

### Inventario de uso

- `npx @1k5-tech-es/grado usage` cuenta qué usa una app de Grado: cada componente con sus props y los valores literales más frecuentes, funciones como `toast()` o `cx()`, clases `k5-…` escritas a mano y tokens `--k5-…`. Lee React (JSX, alias e `import * as`) y Vue (PascalCase, kebab-case, `:prop`, `v-model:prop`, `@evento`), y también plantillas PHP, Twig o Handlebars, que solo usan clases. No cambia nada de la app.
- `--adoption <ruta>` guarda en `adoption.json` la versión de Grado de la app, sus componentes y la fecha del inventario; el estado y el detalle siguen a mano. `--app` le da nombre y `--json` saca el inventario completo.
- La página Estado enseña los componentes que usa cada app y la fecha de su inventario.

### Compatibilidad

- El CI prueba los tests y el navegador también con React 18.3, Vue 3.5.0 y Node 24, además de React 19, la última Vue y Node 22. Lo que dicen `peerDependencies` y `engines` queda comprobado en cada pull request.
- `engines`: Node.js 22 o superior para `npx @1k5-tech-es/grado` y para compilar el repositorio. Node 20 dejó de tener soporte el 30 de abril de 2026.

### Filas virtuales

- `DataTable`: con `maxHeight` y más de 200 filas a la vista, solo pinta las que se ven y unas pocas más; dos filas vacías guardan el alto, así que la barra de scroll y la cabecera fija se comportan igual. La tabla lleva `aria-rowcount` y cada fila su `aria-rowindex`, para que el lector de pantalla sepa cuántas hay y dónde está. No cambia ninguna prop. Al imprimir salen las filas pintadas: para papel, pagina o exporta CSV.
- `VIRTUAL_ROWS`, `virtualWindow()` y `pixelHeight()` en `@1k5-tech-es/grado/patterns`: la cuenta que usan React y Vue.

### Hacia la 1.0

- Textos en alemán e inglés en su propio módulo: `@1k5-tech-es/grado/messages/de` y `/en`, para pasarlos en `messages` (`<GradoProvider locale="de-DE" messages={de}>`, `app.use(Grado, { locale: 'de-DE', messages: de })`). En 0.5 siguen viniendo de serie; en desarrollo, Grado avisa una vez en la consola si pides `de-DE` o `en-GB` sin pasar sus textos. En 1.0 solo vendrá el español, unos 4,5 KB menos en cada app.
- Obsoleto, se retira en 1.0: los alias de tamaño `--k5-text-badge`, `--k5-text-label`, `--k5-text-nav` y `--k5-text-section`, y `text-2xs` en Tailwind. Usa `caption`, `small` y `heading`, que miden lo mismo. El CSS generado lo marca con un comentario; el CSS de Grado ya no los usa.
- `npx @1k5-tech-es/grado usage` lista lo obsoleto que usa una app y `npx @1k5-tech-es/grado migrate` avisa, con archivo y línea, de `text-2xs` y de `GradoProvider` o del plugin en alemán o inglés sin sus textos (los tokens ya los cambiaba).
- Política de versiones en Fundamentos: qué cuenta como un cambio que rompe, cómo se avisa de lo obsoleto y qué se retira en 1.0. Antes decía que los alias tipográficos se mantenían hasta la 2.0.
- `Button`: la guía de uso aclara cuándo `danger` (el botón que abre la confirmación) y cuándo `destructive` (el que la confirma en `AlertDialog`). Las dos variantes se quedan.

### Impresión y alto contraste

- Al imprimir, el armazón (cabecera, barra lateral, aviso), los botones, la paginación, las barras de filtros y de acciones, los avisos y lo que flota no salen en papel. `AppShell` deja de medir lo que la ventana y de tener su propio scroll, así que se imprime todo el contenido, no solo lo visible. Las tablas repiten la cabecera en cada página y no parten filas; tarjetas, KPI, avisos y gráficos no se parten entre páginas; gráficos, estados y barras conservan su color.
- Utilidades de impresión: `k5-print-hide` (no sale en papel), `k5-print-only` (solo sale en papel) y `k5-print-keep` (un botón que sí debe salir).
- En papel no se aplica el modo oscuro: las páginas se imprimen con los colores claros. Los bloques oscuros de `tokens.css` van dentro de `@media not print`; no se repite ningún token.
- Alto contraste (colores forzados de Windows): lo elegido en menús, listas, pestañas, navegación, paginación, controles segmentados y el calendario lleva el resaltado del sistema; hoy y el KPI elegido, un contorno; el interruptor, la pista con borde y el resaltado al encenderse; diálogos, popovers, menús y avisos, borde; las marcas de los gráficos y las barras conservan su color.

### Calidad

- Una captura de referencia por componente: la vista previa de cada una de las 81 fichas de la web, en los dos temas y los dos modos, más estados abiertos (tarjeta de `LineChart` y `PriceChart`, `Combobox` abierto). Las cuatro capturas de página entera del catálogo desaparecen; las del armazón se quedan. Si cambia un componente, falla solo su captura.
- `npm run test:visual:docker`: la regresión visual en la misma imagen de Playwright que el CI, para comparar y regenerar capturas en local. `npm run test:all` la usa.
- La página Estado cuenta un componente como «con captura» cuando existe su archivo: 81 de 81 (antes, buscando en el código del catálogo, decía 46).
- Presupuesto de tamaño por import: lo que se lleva una app que importa `Button`, `Dialog`, `DataTable`, `AppShell`, `LineChart`, `toast`, `Combobox` o `PriceChart`, en React y en Vue, falla si crece. El paquete entero solo avisa: con `sideEffects: false`, ninguna app lo descarga entero.
- Apps de prueba (`npm run test:smoke`, también en el CI): Vite + React, Next 16 con App Router y Nuxt 4 instalan Grado desde los `.tgz` y compilan, con los adaptadores de formularios.

### Corregido

- React 18: en `CommandPalette`, un Enter justo después de escribir no elegía nada, porque la primera opción se marcaba un instante después. Ahora se marca en el mismo render que el filtro.
- Vue: el paquete compila con los tipos de Vue 3.5.0, que declaran `useId()` como `string | undefined`.
- Web: la vista previa de `AppShell` en Componentes se quedaba en el esqueleto de carga (`flushSync` dentro de un efecto no pinta nada en React 19). Ahora se ve, a todo el ancho.
- Las capturas por componente se hacen con la vista previa en una posición fija: una línea más en una guía de uso ya no mueve todas las demás una fracción de píxel.

### Al actualizar desde 0.4.0

- Si compilas Grado o usas `npx @1k5-tech-es/grado` con Node 20, pasa a Node 22.
- Si tu app usa Grado en alemán o en inglés, importa sus textos y pásalos en `messages` (lo de arriba). Si no, verás un aviso en la consola en desarrollo; en 1.0 los textos saldrían en español.
- Si usas `--k5-text-badge`, `-label`, `-nav`, `-section` o `text-2xs`, cámbialos ya: `npx @1k5-tech-es/grado migrate` hace los tokens y avisa de `text-2xs`.
- Al imprimir ya no salen los botones ni el armazón. Si un botón tiene que salir en papel, añádele `k5-print-keep`. Si tu app tenía su propio CSS de impresión para quitar la barra lateral, ya no hace falta.

## 0.4.0 · 16 de octubre de 2026

0.4, «Adopción»: lo que necesita una app para pasar a Grado sin trabajo a mano. Las APIs de 0.3.0 siguen igual.

### Formularios

- `@1k5-tech-es/grado-react/react-hook-form` y `@1k5-tech-es/grado-vue/vee-validate`: `Form`, `FormField` y `ErrorSummary` sobre react-hook-form o VeeValidate, que son dependencias opcionales: solo las cargan estos imports. `FormField` pone etiqueta, ayuda y error, y conecta su control según el tipo (value, checked o v-model) con id, ref y aria-invalid. `required` da el asterisco y «Este campo es obligatorio»; `validate` admite una o varias comprobaciones `(valor, valores) => true | texto | false`, también async. Se valida al enviar y, después, en cada cambio; el foco va al primer campo con error.
- `NifInput`, `IbanInput`, `PhoneInput` y `TimePicker` dentro de un `FormField` pasan su error de formato al formulario y no lo pintan dos veces.
- `ErrorSummary`: la lista de errores con un enlace a cada campo, anunciada con `role="alert"`. El de los adaptadores se rellena solo y aparece al enviar; el del paquete principal recibe `errors`.
- React: `Form` acepta `errors` para los errores del servidor. Vue: `initial-errors`, que ahora se ven desde el primer render.
- `isEmptyValue`, `checkValue`, `fieldId`, `errorSummaryTitle` y `focusField` en `@1k5-tech-es/grado/patterns`.
- `Field` acepta los atributos HTML de su `<div>` (`onBlur`, `data-*`…).

### Tablas con datos del servidor

- `DataTable`: con `manual`, `rows` es la página que llega del servidor y la tabla solo avisa al cambiar de página o de orden; `totalRows` da el total para la paginación, que sigue a la vista mientras carga.
- `DataTable`: `hiddenColumns` (React: `onHiddenColumnsChange` · Vue: `v-model:hidden-columns`) y `columnPicker`, un botón «Columnas» para elegir las que se ven. Las columnas con `hideable: false` no se pueden ocultar.
- `DataTable`: `maxHeight` le da su propio scroll con la cabecera fija. Token nuevo `--k5-z-sticky` (10).
- `toCsv(rows, columns)` y `downloadCsv()` en `@1k5-tech-es/grado/patterns`: CSV para Excel con «;» y coma decimal en español, y apóstrofo delante de las celdas que empiezan por `=`, `+`, `-` o `@` para que no se ejecuten como fórmula. `csvValue` en una columna cambia lo que se exporta.

### Gráficos interactivos

- `LineChart`, `AreaChart` y `BarChart`: al pasar el ratón, una tarjeta con el valor de cada serie, una guía vertical y el dato resaltado. Con el teclado, el gráfico recibe el foco y las flechas, Inicio y Fin recorren los datos; cada dato se anuncia. `interactive={false}` los deja como antes, con el `title` nativo en cada columna.


### Energía

- `PriceChart`: el precio de la luz de un día, por horas o por cuartos de hora, con cada franja del color de su periodo de la 2.0TD (valle, llano y punta). Con `date`, sábados, domingos y festivos nacionales de fecha fija son valle todo el día; `now` marca la franja de ahora; bajo el título, las franjas más barata y más cara. Tarjeta, teclado y tabla oculta como los demás gráficos.
- `BatteryLevel`: carga de la batería de casa con su energía («7,2 de 10 kWh»), si carga o descarga y la reserva para cortes. Es un `role="meter"` con todo el texto en `aria-valuetext`.
- `Heatmap`: un valor por celda en la intensidad de un color, como el consumo por hora y día de la semana. Con 7 filas pone los días y con 24 columnas, las horas. Se recorre con las flechas en las dos direcciones.
- Iconos de energía con el trazo de Lucide, para pasar como `icon`: `SolarPanelIcon`, `HomeBatteryIcon`, `PowerGridIcon`, `HeatPumpIcon`, `WallboxIcon`, `ElectricMeterIcon` e `InverterIcon`. Sus trazos, en `ENERGY_ICON_PATHS` de `@1k5-tech-es/grado/classes`.
- `tariffPeriod`, `isOffPeakDay`, `NATIONAL_HOLIDAYS`, `priceSlots`, `priceExtremes`, `slotAt`, `batteryState`, `heatLevels` y `gridKeyMove` en `@1k5-tech-es/grado/patterns`.

### Figma

- `npm run figma:check` compara un export de Tokens Studio guardado en `design/figma-tokens.json` con los tokens del repositorio y dice qué falta, qué sobra y qué valor cambia. El CI lo ejecuta en cada pull request; sin el archivo no hace nada.

### Componentes y avisos

- Todos los componentes de `@1k5-tech-es/grado-react` pasan `ref`, también con React 18. En los campos va al `<input>` que recibe el foco, también en `Combobox`, `MultiSelect`, `TimePicker` y `AddressInput`; en el resto, al elemento que recibe las props HTML o, si no las admite, al raíz. Así funcionan `register()` de react-hook-form, el foco en el primer error y los paneles anclados. Un test en el navegador comprueba el elemento de cada componente.
- `toast()` y `Toaster`: avisos desde cualquier parte de la app, con cola. `toast.success`, `warning`, `error` e `info`; `action` para «Deshacer»; `toast.promise`, que pasa de «Guardando…» al resultado en el mismo aviso; y `toast.dismiss`. Se ven como mucho `max` avisos a la vez (3) y los demás esperan su turno, así que no se pierde ninguno. La región «Notificaciones» está siempre en la página y `toast.error` se anuncia con `role="alert"`.
- `createToastStore()` y `visibleToasts()` en `@1k5-tech-es/grado/patterns`: la cola que usan React y Vue.
- Vue: `Toast` acepta `role`, como en React. Antes el atributo acababa en el contenedor y no en el aviso.
- Tipos nuevos en React: `CardSectionProps`, `CardDescriptionProps` y `AppLogoProps`.
- Textos nuevos en español, alemán e inglés: `notifications`, `fieldRequired`, `fieldInvalid`, `errorSummaryOne`, `errorSummaryMany`, `columns`, `chartHint`, los tres periodos de la tarifa (`tariffValle`, `tariffLlano`, `tariffPunta`) y los de PriceChart y BatteryLevel.

### Migración

- `npx @1k5-tech-es/grado migrate` actualiza un proyecto desde 0.1, 0.2 o 0.3. Cambia imports y dependencias de `@1k5/…` a `@1k5-tech-es/…` y las sube a esta versión, pasa los alias `--k5-text-badge`, `-label`, `-nav` y `-section` a `caption`, `small` y `heading` (mismo tamaño), quita la clase `k5-unit` y añade el registro de GitHub Packages a `.npmrc`. Lo que pide una decisión lo avisa con archivo y línea: `variant="danger"`, `tone="highlight"`, la densidad táctil y los `.tgz` de `vendor/`. Con `--dry` enseña los cambios sin escribir nada.

### Rendimiento

- Los formateadores de números y fechas (`Intl`) se crean una vez y se reutilizan. 100 `Calendar` se montan 2,5 veces más rápido y un `LineChart` de 2000 puntos, 3,5 veces. También ganan `DatePicker`, `BarChart`, `Donut`, `Meter`, `Slider`, `NumberInput`, `EnergyFlow` y `Kpi`.
- `DataTable` ordena las columnas de texto 7 veces más rápido: de 210 a 30 ms con 10 000 filas.
- `Combobox`, `MultiSelect` y `CommandPalette` no repiten la búsqueda al mover el ratón o las flechas, y guardan el texto ya normalizado de cada opción. Con 8000 opciones, abrir la lista tarda la mitad y el resaltado, menos de la mitad.

### Calidad y distribución

- Informe de la API pública en `api/`: una línea por prop de cada componente de React y de Vue, y los tipos de `@1k5-tech-es/grado`. El CI falla si la API cambia y el informe no (`npm run api` lo regenera), así que cualquier cambio de API se ve en el diff del pull request.
- Presupuesto de tamaño (`npm run size`): CSS, tokens y cada paquete entero, minificados y con gzip. El CI falla si algo pasa de su límite y deja la tabla en el resumen del trabajo.
- El workflow de publicación genera la web y los `.tgz` antes de publicar los paquetes: si algo falla, no se publica nada a medias.
- El presupuesto de tamaño sube a 50 KB (React) y 52 KB (Vue) por los componentes de energía. Los paquetes son `sideEffects: false`: una app que no los usa no los descarga.
- La página Estado cuenta bien los tests escritos en varias líneas: antes daba por no probados una treintena de componentes que sí lo estaban.

### Corregido

- Vue: `BarChart` sin `height` y `DataTable` escribían un `style` vacío; ahora el HTML es igual que en React.

### Al actualizar desde 0.3.0

- No hay que cambiar nada. Si una app tenía su propia cola de avisos, puede pasar a `toast()` y `Toaster`.
- Vue: si pasabas `role` a `Toast`, ahora llega al aviso y no al contenedor.
- Los gráficos reciben el foco con Tab (un punto de Tab por gráfico) y ya no tienen `title` nativo en cada columna. Para el comportamiento anterior, `interactive={false}`.
- Una tabla que paginaba en el servidor con `Table` y `Pagination` puede pasar a `DataTable` con `manual`.

## 0.3.0 · 15 de octubre de 2026

Menos ruido visual, escalas completas en los tokens y 34 componentes nuevos. Las APIs de 0.2.0 siguen funcionando; lo que cambia de aspecto está en «Al actualizar desde 0.2.0».

### Principios

- Un solo acento por vista; borde o fondo, nunca los dos; jerarquía por tamaño y peso; estado con punto y texto. Están en la nueva página Fundamentos de la web.

### Tokens

- Escala tipográfica de siete pasos con interlineado: `--k5-text-caption|small|body|lead|heading|title|display` y `--k5-leading-*` (12, 13, 14, 16, 20, 28 y 40 px). En Tailwind, `text-caption` … `text-display`. Los nombres antiguos (`text-badge`, `text-label`, `text-nav`, `text-section`) son alias de un paso. Nuevos `--k5-weight-bold`, `--k5-tracking-display` y `--k5-tracking-caps`.
- Escala tonal de cada color de estado, calculada en el build para cada tema y modo: `--k5-<primary|success|warning|destructive|info>-subtle` y `-border`, junto a los `-text` que ya existían. Un test comprueba que el texto llega a 4,5 : 1 sobre su fondo suave. En Tailwind, `bg-primary-subtle`, `border-destructive-border`…
- Elevación en cuatro niveles: borde, `--k5-shadow-raised` (nueva), `popover` y `overlay`. En Tailwind, `shadow-raised`.
- Radios con nombre en todos los temas: `--k5-radius-xs|sm|md|lg|full`. `radius-md` es el de los controles. En Tailwind, `rounded-xs`.
- Densidad: `data-k5-density="compact"` o `"comfortable"` en cualquier contenedor cambia la altura de los controles. Con puntero táctil y sin atributo, se aplica «comfortable» (44 px); `data-k5-density="default"` mantiene la altura del tema.
- Iconos (`--k5-icon-sm|md|lg`), anchos de contenido (`--k5-container-sm|md|lg`), bordes (`--k5-border-width`, `--k5-border-width-strong`) y opacidad (`--k5-opacity-disabled`, `--k5-opacity-muted`).
- `tokens-studio.json`: todos los tokens para el plugin Tokens Studio de Figma, con un tema de Figma por tema y modo.

### Componentes nuevos

- Maquetación y tipografía: `Stack`, `Grid`, `Container`, `Text` y `Heading`. Las clases `k5-gap-*`, `k5-align-*` y `k5-justify-*` sirven también en cualquier flex o grid propio.
- Datos y piezas: `Status` (punto y texto, la alternativa discreta a Badge en tablas), `Progress` (con variante por pasos), `DescriptionList`, `CopyButton`, `Tag`, `AvatarGroup`, `Kbd`, `Separator` y `Link`.
- Gráficos: `Sparkline`, `LineChart`, `AreaChart`, `Donut`, `Meter` y `EnergyFlow` (flujo en vivo entre placas, casa, batería y red).
- Campos especiales: `SearchInput`, `PasswordInput`, `Slider`, `TimePicker`, `PhoneInput`, `NifInput`, `IbanInput` y `AddressInput`. Validación española de teléfonos, DNI, NIE, CIF e IBAN en `@1k5-tech-es/grado/patterns`.
- Superposiciones y acciones: `Popover`, `Banner`, `ActionBar`, `ContextMenu`, `IconButton` y `ToggleGroup`.

### Componentes que cambian

- `Button`: nueva variante `destructive` (rojo sólido) para confirmar un borrado en AlertDialog.
- `Table`: nueva prop `plain` para quitar la caja cuando la tabla ya está dentro de un panel.
- `Kpi`: nueva prop `trend` (number[]) que dibuja una línea de tendencia bajo la cifra.
- `Avatar`: nueva prop `src` para la foto; si no carga, se ven las iniciales.
- `AppShell`: nueva prop `banner` (slot `#banner` en Vue) para un Banner bajo la cabecera.
- Textos nuevos en español, alemán e inglés para todos los componentes nuevos.

### Calidad y distribución

- CI en GitHub Actions: lint, tests, navegador, web y capturas en cada pull request. Las capturas se hacen dentro de la imagen de Playwright y se pueden regenerar lanzando el workflow a mano.
- Publicación con la etiqueta `vX.Y.Z`: publica los tres paquetes en GitHub Packages y crea la release con estas notas. `npm run release:check <versión>` comprueba versiones y CHANGELOG antes.
- Los componentes de `Patterns` viven ahora cada uno en su archivo. Los imports desde el paquete no cambian.
- La web tiene una página nueva, Fundamentos, con todas las escalas, los principios y la política de versiones. La página Estado cuenta también los tests de los componentes nuevos.
- La web es ahora una aplicación hecha con `@1k5-tech-es/grado-react`: `AppShell`, `CommandPalette` para buscar, `SegmentedControl`, `Tabs`, `Accordion`, `Table`, `CopyButton`… en todas las páginas. Cada página se descarga al visitarla.

### Al actualizar desde 0.2.0

- Los paquetes se llaman ahora `@1k5-tech-es/grado`, `@1k5-tech-es/grado-react` y `@1k5-tech-es/grado-vue`, el ámbito que exige GitHub Packages. Cambia los imports de `@1k5/…` a `@1k5-tech-es/…` y añade el `.npmrc` del README.
- `Badge`: sin borde. `highlight` deja de ser un bloque fucsia: ahora es un punto fucsia con texto normal sobre un tinte suave.
- `Button` `danger`: pasa a texto rojo sin fondo ni borde (el fondo aparece al pasar el ratón). Para el botón que confirma un borrado usa `destructive`.
- `KpiGroup` en Consola: sin caja ni fondo de selección. Cada indicador lleva una línea fina arriba y el elegido la lleva en berenjena. La variación es texto de color, sin pastilla. En Marca no cambia.
- `Table`: la cabecera ya no tiene fondo ni va en mayúsculas. `k5-unit` ya no hace falta.
- `Card`: sin sombra; el pie ya no tiene fondo ni línea; la variante `alert` marca el problema con el borde rojo, sin fondo.
- `Alert`: sin borde de color. `Toast`: sin la barra lateral de color.
- `Spinner`: muestra la pista del círculo.
- Tamaños de letra: `text-badge` pasa de 11 a 12 px (y `text-2xs` en Tailwind), `text-section` de 18 a 20 px y `text-title` de 24 a 28 px (título de PageHeader y cifra de KPI).
- `radius-panel` en Consola pasa de 16 a 12 px (tarjetas, tablas y paneles).
- En pantallas táctiles los controles miden 44 px de alto si no se indica otra densidad. Para mantener la altura del tema, pon `data-k5-density="default"` en `<html>`.

## 0.2.0 · no se publicó por separado: sus cambios llegaron con 0.3.0

### Accesibilidad

- Todas las combinaciones de color de los dos temas llegan a 4,5 : 1, en claro y en oscuro. El test de contraste ya no admite excepciones.
- axe-core revisa todos los componentes en el navegador, con React y con Vue, en Consola y Marca, en claro y en oscuro.
- Los días de otros meses del calendario usan el gris secundario sin transparencia, para llegar a 4,5 : 1.

### Tokens

- Espaciado en una escala de 4 px: `--k5-space-0-5` a `--k5-space-16`. `grado.css` lo usa en rellenos, márgenes y huecos.
- Movimiento: `--k5-duration-fast` (100 ms), `base` (150 ms), `slow` (200 ms) y `slower` (300 ms), y las curvas `--k5-ease-standard`, `--k5-ease-out` y `--k5-ease-emphasized`. Con `prefers-reduced-motion` las duraciones valen 0.
- Capas: `--k5-z-overlay`, `drawer`, `dropdown`, `tooltip`, `toast` y `skip-link`. `grado.css` ya no escribe `z-index` sueltos.
- Puntos de corte: `--k5-breakpoint-sm` (600 px) y `md` (768 px). Un test comprueba que los media queries usan esos valores.
- `tokens.dtcg.json`: todos los tokens en el formato W3C, para Tokens Studio y Figma.
- Preset de Tailwind 3: `duration-fast` … `duration-slower`, `ease-standard`, `ease-emphasized` y `z-overlay` … `z-skip-link`. Tailwind 4: `ease-standard` y `ease-emphasized`.

### Fuente

- Barlow (400, 500, 600 y 700; latín y latín extendido) viene en el paquete: `@1k5-tech-es/grado/fonts.css`. Licencia SIL OFL 1.1 en `assets/fonts/OFL.txt`.

### Componentes nuevos

- `NumberInput`: cifras con coma decimal, unidad y botones de menos y más. Devuelve un número.
- `SegmentedControl`: una opción entre pocas que cambia la vista al momento.
- `MultiSelect`: varias opciones con búsqueda y chips.
- `Calendar`: un mes para elegir una fecha o un periodo, igual en todos los navegadores.
- `CommandPalette`: búsqueda de acciones y registros con Ctrl o ⌘ + K.
- `BarChart`: barras agrupadas o apiladas con los colores del tema y una tabla para lectores de pantalla.

### Idiomas

- `GradoProvider` en React; plugin `Grado` y `GradoProvider` en Vue. Textos en español (por defecto), alemán e inglés.
- `@1k5-tech-es/grado/messages`: los textos, `messagesFor()` y `formatMessage()`.

### Distribución

- `grado.min.css` (minificado), `grado.layer.css` (dentro de `@layer components`) y un archivo por componente en `css/`.
- Los módulos interactivos de `@1k5-tech-es/grado-react` llevan `'use client'`: se pueden importar desde el App Router de Next.js.

### Calidad

- Regresión visual: capturas del catálogo en los dos temas y los dos modos (`npm run test:visual`).
- ESLint, Prettier y Stylelint (`npm run lint`, `npm run format`).
- La web de documentación incluye guías de uso por componente, una página de estado y esta página de cambios.

### Al actualizar desde 0.1.0

- Cambian algunos colores: `destructive`, `success` e `info` algo más oscuros en claro; en oscuro, `primary` algo más claro y texto grafito sobre `primary`, `accent`, `success` e `info`.
- Cambia el orden de las capas: menús y combobox a 60 (antes 50), tooltip a 70 (antes 60), Toast a 80 (antes 100), barra lateral móvil a 50 (antes 60) y su fondo a 40 (antes 50).
- Las animaciones de entrada de menús y tooltips duran 100 ms (antes 120 ms).
- Las props de texto (`closeLabel`, `emptyLabel`, `label`…) ya no tienen un valor fijo: salen del idioma activo. Sin `GradoProvider` el texto es el mismo español de antes.

## 0.1.0 · 13 de octubre de 2026

- Primera versión: tokens con fuente única, temas Consola y Marca, presets de Tailwind 3 y 4, 46 componentes con la misma API en React y Vue, catálogo y web de documentación.
