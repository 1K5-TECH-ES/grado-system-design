# Cambios

Todas las versiones de `@1k5/grado`, `@1k5/grado-react` y `@1k5/grado-vue`. Los tres paquetes comparten número de versión.

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

- Barlow (400, 500, 600 y 700; latín y latín extendido) viene en el paquete: `@1k5/grado/fonts.css`. Licencia SIL OFL 1.1 en `assets/fonts/OFL.txt`.

### Componentes nuevos

- `NumberInput`: cifras con coma decimal, unidad y botones de menos y más. Devuelve un número.
- `SegmentedControl`: una opción entre pocas que cambia la vista al momento.
- `MultiSelect`: varias opciones con búsqueda y chips.
- `Calendar`: un mes para elegir una fecha o un periodo, igual en todos los navegadores.
- `CommandPalette`: búsqueda de acciones y registros con Ctrl o ⌘ + K.
- `BarChart`: barras agrupadas o apiladas con los colores del tema y una tabla para lectores de pantalla.

### Idiomas

- `GradoProvider` en React; plugin `Grado` y `GradoProvider` en Vue. Textos en español (por defecto), alemán e inglés.
- `@1k5/grado/messages`: los textos, `messagesFor()` y `formatMessage()`.

### Distribución

- `grado.min.css` (minificado), `grado.layer.css` (dentro de `@layer components`) y un archivo por componente en `css/`.
- Los módulos interactivos de `@1k5/grado-react` llevan `'use client'`: se pueden importar desde el App Router de Next.js.

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
