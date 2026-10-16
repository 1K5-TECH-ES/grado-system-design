# Cambios

Todas las versiones de `@1k5-tech-es/grado`, `@1k5-tech-es/grado-react` y `@1k5-tech-es/grado-vue`. Los tres paquetes comparten número de versión.

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
