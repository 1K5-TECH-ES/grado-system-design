# Cambios

Todas las versiones de `@1k5-tech-es/grado`, `@1k5-tech-es/grado-react` y `@1k5-tech-es/grado-vue`. Los tres paquetes comparten número de versión.

## 0.3.0 · sin publicar

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

## 0.2.0 · sin publicar

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
