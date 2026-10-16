# Grado

Sistema de diseño de 1KOMMA5° España. Parte de 1komma5es_help, lo ajusta a la guía de marca y lo empaqueta para que cualquier app en React, Vue o HTML lo adopte con uno o dos imports.

«Grado», por el ° del logo, es un nombre provisional.

## Estado

| Fase | Qué incluye | Estado |
|---|---|---|
| 1. Tokens | `tokens.json` como fuente única; CSS en dos formatos; presets de Tailwind 3 y 4; tokens para JS; logos; vista previa | Hecha |
| 2. Componentes base | `grado.css` (botón, badge, campo, interruptor, tarjeta, tabla, KPI, cabecera, estado vacío, spinner) y paquetes `@1k5-tech-es/grado-react` y `@1k5-tech-es/grado-vue` con la misma API | Hecha |
| 2b. Armazón | `AppShell`, `Nav`, `NavItem`, `NavGroup`, `AppSearch`, `AppLogo` y `Avatar`. Consola y Marca, barra lateral plegable y cajón en móvil | Hecha |
| 2c. Componentes interactivos | Diálogos, panel lateral, menú, tooltip, casillas, combobox, avisos, pestañas, paginación, fechas, subida de archivos, pasos, historial, filtros, acordeón, migas y `DataTable`. Misma línea visual que 1komma5es_help: iconos de Lucide, menús con resaltado menta, diálogos con cabecera y pie | Hecha |
| 3. Migración | Sales Coach, Memorias, Kompilot, Radar-Link y OfferTool, en ese orden. Radar-Link es React Native y OfferTool, PHP: solo pueden usar tokens y CSS | Sales Coach en la rama `feat/grado` con 0.4.0 |
| 4. Documentación web | Introducción, instalación, componentes, ejemplos React/Vue y paquetes descargables | Lista para publicar en vuestro hosting |
| 5. Calidad para la 1.0 (0.2.0) | Contraste AA sin excepciones, tokens de espaciado, movimiento y capas, Barlow en el paquete, axe y regresión visual, `'use client'`, lint y formato | Hecha |
| 6. Madurez (0.2.0) | NumberInput, SegmentedControl, MultiSelect, Calendar, CommandPalette y BarChart; idiomas (es, de, en); CSS minificado, en capa y por componente; guías de uso, página de estado y de cambios; tokens en formato W3C | Hecha |
| 7. Sistema completo (0.3.0) | Limpieza visual con cuatro principios; escalas de tipografía, tono, elevación, radio, densidad, iconos y contenedores; 34 componentes nuevos (maquetación, datos, gráficos y EnergyFlow, campos españoles, superposiciones); Tokens Studio para Figma; CI y publicación por etiqueta; página Fundamentos | Hecha |
| 9. Estabilidad (0.5.0) | Fase 1: inventario de uso `npx @1k5-tech-es/grado usage`, React 18, Vue 3.5.0 y Node 24 probados en el CI, Node 22 como mínimo | En curso |
| 8. Adopción (0.4.0) | Fase 1: `ref` en todos los componentes de React, `toast()` con cola, codemod `npx @1k5-tech-es/grado migrate`, informe de API y presupuesto de tamaño en el CI. Fase 2: formularios (`Form`, `FormField`, `ErrorSummary`) con react-hook-form y VeeValidate, `DataTable` con datos del servidor, columnas, cabecera fija y CSV, y gráficos interactivos. Fase 3: `PriceChart` (2.0TD), `BatteryLevel`, `Heatmap`, iconos de energía y `npm run figma:check` | Hecha |

## Decisiones tomadas

- **Dirección visual:** la propuesta A («Consola») es el tema por defecto. La B («Marca») es un segundo tema para lo que ve el cliente. Los dos comparten tokens y componentes.
- **Colores:** los de la guía de marca (Aubergine `#5C068C`, Mint `#2ED8C3`, Fuchsia `#FA65EC`, Graphite `#222222`). Para Graphite 75 y 25 se usa el HEX del PDF, que es el que cuadra con su CMYK; el RGB que aparece en la guía no coincide.
- **Grises de interfaz:** con un ligero tinte berenjena, como 1komma5es_help.
- **Tonos al 10, 25, 50 y 75 %:** calculados como mezcla con blanco. Se sustituyen si marca facilita los valores oficiales.
- **Tipografía:** Barlow, la de marca, incluida en el paquete (`@1k5-tech-es/grado/fonts.css`, licencia OFL). La fuente del sistema queda de respaldo.
- **Contraste:** todas las combinaciones de color llegan a 4,5 : 1 en los dos temas y los dos modos (desde 0.2.0).
- **Minimalismo (desde 0.3.0):** un solo acento por vista; borde o fondo, nunca los dos; jerarquía por tamaño y peso; estado con punto y texto. Consola se separa así del aspecto de 1komma5es_help en badges, tablas, tarjetas y KPI; los colores siguen siendo los mismos.

## Comandos

```bash
npm install           # dependencias de desarrollo
npm run build         # genera dist/ de los tres paquetes
npm test              # build + tests unitarios y de paridad React/Vue
npm run test:browser  # teclado, foco y axe-core en Chrome, con React y con Vue
npm run test:visual:docker  # una captura por componente en 2 temas × 2 modos, en la imagen de Playwright del CI
                            # (-- --update-snapshots para regenerarlas; npm run test:visual, sin Docker, falla por el suavizado de las letras)
npm run lint          # ESLint, Stylelint y Prettier
npm run format        # formatea y corrige lo que se pueda
npm run test:all      # todo lo anterior más la web, como haría el CI
npm run contrast      # informe de contraste de todos los temas
npm run api           # regenera api/*.api.md, el informe de la API pública (npm run api:check lo compara)
npm run size          # tamaño con gzip de CSS, tokens y paquetes, con su límite
npm run figma:check   # compara design/figma-tokens.json (export de Tokens Studio) con los tokens del repositorio
npm run catalog       # genera catalog/index.html con todos los componentes
npm run docs:build    # genera la web y los paquetes descargables en docs-site/dist/
npm run docs:check    # verifica rutas, anclas, ejemplos y descargas de la web generada
npm run release:check -- 0.4.0  # versiones de los tres paquetes y sección del CHANGELOG, con fecha, antes de etiquetar
```

## Publicar una versión

1. Sube la versión en los tres `package.json` (y la dependencia `@1k5-tech-es/grado` de React y Vue), `npm install --package-lock-only`, y escribe su sección en `CHANGELOG.md` con la fecha en el título.
2. `npm run release:check -- X.Y.Z`. Si la API ha cambiado, `npm run api` y revisa el diff de `api/`.
3. Crea y sube la etiqueta `vX.Y.Z`. El workflow `Release` prueba, publica los paquetes y crea la release con las notas y los `.tgz`.

Los paquetes se publican en **GitHub Packages** con el ámbito `@1k5-tech-es`, el de la organización de GitHub. Son privados como este repositorio y gratis dentro de la cuota de la organización. El workflow publica con su propio `GITHUB_TOKEN`; no hace falta configurar secretos.

### Instalar en un proyecto interno

Añade este `.npmrc` en la raíz del proyecto, para que npm busque `@1k5-tech-es/…` en GitHub:

```ini
@1k5-tech-es:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

- **En tu máquina:** crea un token *classic* de GitHub con el permiso `read:packages` (GitHub Packages no admite todavía los tokens granulares para npm) y expórtalo como `GITHUB_TOKEN` en tu shell. Después, `npm i @1k5-tech-es/grado @1k5-tech-es/grado-react` (o `@1k5-tech-es/grado-vue`).
- **En GitHub Actions del proyecto:** da acceso al repositorio en los ajustes de cada paquete (*Manage Actions access*), añade `packages: read` a los `permissions` del workflow y pasa `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` en el paso de `npm ci`.
- **En otros despliegues (Docker, Vercel, Netlify…):** guarda como variable de entorno `GITHUB_TOKEN` un token *classic* con `read:packages`, mejor de una cuenta de servicio que de una persona.

No subas nunca el token en sí al repositorio: el `.npmrc` solo lo referencia.

Los cambios de cada versión están en [CHANGELOG.md](CHANGELOG.md).

Después del build:

- **Tokens:** abre `packages/grado/dist/preview.html` en el navegador.
- **Componentes:** abre `catalog/index.html`. Admite `?tema=marca&modo=dark`.
- **Armazón:** abre `catalog/app.html`. Admite además `&plegado=si` y `&menu=abierto` (en móvil).
- **Documentación web:** genera con `npm run docs:build` y sirve `docs-site/dist/` con fallback a `index.html`. React Router expone `/personalizar`, `/instalacion` y `/componentes`. Consulta [cómo publicar la web](docs-site/README.md).

### Tokens en Figma

Diseño trabaja con el plugin Tokens Studio. Para llevar los tokens a Figma, importa `packages/grado/dist/tokens-studio.json` (un conjunto por tema y modo). Para comprobar que Figma no se ha separado del repositorio, exporta desde Tokens Studio a un solo archivo, guárdalo en `design/figma-tokens.json` y súbelo en un pull request: `npm run figma:check` (también en el CI) lista lo que falta, lo que sobra y lo que cambia de valor. La fuente sigue siendo `packages/grado/src/tokens.json`.

### Actualizar una app

`npx @1k5-tech-es/grado migrate` en la carpeta de la app hace los cambios mecánicos desde 0.1, 0.2 o 0.3 (imports, dependencias, alias, clases retiradas, `.npmrc`) y avisa con archivo y línea de lo que pide una decisión. `--dry` enseña los cambios sin escribir nada.

### Saber qué usa cada app

`npx @1k5-tech-es/grado usage` en la carpeta de la app cuenta qué componentes de Grado usa, con qué props y valores, y qué funciones (`toast()`…), clases `k5-…` y tokens `--k5-…` aparecen en el código y en las plantillas (también PHP o Twig). No cambia nada de la app. Con `--app "Sales Coach" --adoption ../grado-system-design/docs-site/adoption.json` guarda la versión y los componentes en la página Estado; `--json` da el inventario completo. Sirve para decidir qué se puede cambiar o retirar antes de la 1.0.

## Cómo cambiar un token

1. Edita `packages/grado/src/tokens.json`.
2. Ejecuta `npm test`.

Los tests comprueban:

- que el tema `consola` sigue siendo idéntico a 1komma5es_help, salvo las cuatro correcciones de marca;
- que todos los temas tienen los mismos tokens;
- que cada color se convierte a HSL sin perder precisión;
- que ninguna combinación de color baja de 4,5 : 1 de contraste, sin excepciones, tampoco el texto de la escala tonal sobre su fondo suave;
- que `grado.css` usa los tokens de movimiento y capas, y los puntos de corte de `tokens.json`;
- que Tailwind 3 y Tailwind 4 compilan las clases esperadas;
- que React y Vue generan el mismo HTML para las mismas props (`test/parity.test.mjs` y `test/parity-*.test.mjs`, uno por grupo de componentes);
- que cada clase que generan los componentes existe en `grado.css`;
- que los textos de los tres idiomas tienen las mismas claves y variables.

## Qué cambia en 1komma5es_help al adoptarlo

Solo estos colores; el resto queda idéntico (lo verifica `test/help-parity.test.mjs` contra una copia de su `index.css`). Primero, los colores oficiales de marca:

| Token | Ahora | Con Grado |
|---|---|---|
| `primary`, `ring`, `header` | `#5C068E` (HSL redondeado) | `#5C068C` |
| `accent` | `#2CD8C4` (HSL redondeado) | `#2ED8C3` |
| `brand-pink` (claro y oscuro) | `#FF47E0` / `#F764DE` | `#FA65EC` |
| `foreground`, `card-foreground`, `popover-foreground`, `accent-foreground` | `#121212` | `#222222` |

Y, desde 0.2.0, las correcciones de contraste:

| Token | Ahora | Con Grado |
|---|---|---|
| `destructive` (claro) | `#EF4444` | `#DD1313` |
| `success` (claro) | `#299965` | `#227F53` |
| `info` (claro) | `#196BF0` | `#0F65F0` |
| `primary`, `ring` (oscuro) | `#AC52E0` | `#B86CE5` |
| `primary-foreground`, `accent-foreground`, `success-foreground`, `info-foreground` (oscuro) | blanco | `#222222` |

## Estructura

```
CHANGELOG.md             cambios de cada versión (la web los publica en /cambios)
.github/workflows/       CI (ci.yml) y publicación por etiqueta (release.yml)
eslint.config.mjs        ESLint; .stylelintrc.json y .prettierrc.json para CSS y formato
playwright.config.mjs    regresión visual (test/visual/)
packages/grado-react/    componentes React (tsc)
packages/grado-vue/      componentes Vue (tsc, sin .vue); en los dos, un archivo por componente
                         y group-*.ts reúne los de 0.3 por grupo
test/parity.test.mjs     React y Vue generan el mismo HTML (y parity-<grupo>.test.mjs para los de 0.3)
test/patterns-*.test.mjs lógica compartida: validación de NIF, IBAN y teléfono, gráficos, horas…
test/i18n.test.mjs       idiomas: mismas claves y mismo HTML en React y Vue
test/browser/            teclado, foco y axe-core en Chrome; groups/ tiene la parte de cada grupo de 0.3
test/visual/             capturas de referencia: una por componente (de la web) y el armazón del catálogo
scripts/visual-docker.mjs  regresión visual dentro de la imagen de Playwright del CI
test/migrate.test.mjs    codemod de migración
test/usage.test.mjs      inventario de uso
api/                     informe de la API pública (generado por npm run api; el CI lo compara)
scripts/catalog.mjs      genera catalog/index.html (scripts/catalog/ tiene las secciones de 0.3)
scripts/release.mjs      comprobaciones y notas de publicación
scripts/api.mjs          informe de la API pública
scripts/size.mjs         presupuesto de tamaño (límites dentro del archivo)
scripts/figma.mjs        comparación de los tokens de Figma con los del repositorio
scripts/docs.mjs         genera docs-site/dist/ con documentación y ejemplos
docs-site/               estilos, interacción y guía de publicación de la web (groups/: fichas y demos de 0.3)
packages/grado/
  src/tokens.json        fuente única
  src/css/               un archivo CSS por componente; el build los une en dist/grado.css
  src/classes.js         props → clases k5-*, compartido por React y Vue
  src/patterns.js        comportamiento compartido: búsqueda, números, fechas, escalas, cola de avisos
  src/messages.js        textos en es-ES, de-DE y en-GB
  src/migrate.js         reglas del codemod; bin/grado.mjs tiene las órdenes «migrate» y «usage»
  src/usage.js           inventario de uso de una app
  scripts/build.mjs      genera dist/ (sin dependencias)
  scripts/contrast.mjs   informe de contraste
  scripts/lib/           color, carga de tokens, vista previa
  assets/                logos en SVG y Barlow (fonts/, licencia OFL)
  test/                  tests con node:test
  dist/                  generado: tokens.css, tokens-hsl.css, tailwind.css, tailwind-preset, tokens.js,
                         tokens.dtcg.json, tokens-studio.json, grado.css, grado.min.css, grado.layer.css, css/, fonts.css, preview.html
```
# grado-system-design
