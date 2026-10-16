# Web de documentación de Grado

Aplicación React en español con introducción, configurador de temas, instalación y componentes. Está hecha con `@1k5-tech-es/grado-react`, como cualquier aplicación de 1KOMMA5°: `AppShell` y `Nav` para el marco, `CommandPalette` para la búsqueda, `SegmentedControl` para el tema, el modo y el framework, y `PageHeader`, `Card`, `Tabs`, `Table`, `Accordion`, `Alert`, `CopyButton`… para el contenido. React Router gestiona la navegación y cada página se descarga solo cuando se visita. Las vistas previas son los componentes reales. Incluye código para React y Vue, propiedades, búsqueda, temas y modo oscuro.

## Generar

Desde la raíz del repositorio, con Node.js 22 o superior:

```bash
npm ci
npm run docs:build
npm run docs:check
```

El resultado completo queda en `docs-site/dist/`:

- `index.html`: única entrada de la aplicación React.
- `/personalizar`: configurador de temas. A partir del color principal propone paletas que combinan con él (complementaria, tríada, análoga…; con la berenjena, también la de marca), con tres variantes (Fiel, Suave y Alto contraste). Comprueba el contraste, deja elegir la fuente (Barlow, Inter y otras diez) y genera `grado-tema.css`, los pasos de instalación y un código de tema con el principal, el acento y la variante (`GRADO-5C068C-2ED8C3-F-R8`; con otra fuente, `GRADO-5C068C-2ED8C3-F-R8-INTER`). Las muestras de las fuentes se cargan desde Google Fonts, como Barlow en el resto de la web.
- `/fundamentos`: principios y escalas de los tokens (tipografía, escala tonal, elevación, radios, espaciado, densidad) y política de versiones.
- `/instalacion`: instalación y migración.
- `/componentes`: ejemplos, propiedades y guía de uso (cuándo usarlo, qué evitar y accesibilidad); `?vista=mi-tema` aplica el tema guardado.
- `/estado`: cobertura de cada componente (React, Vue, mismo HTML, navegador, captura, guía, Figma), calculada a partir de los tests al generar la web, y adopción por aplicación.
- `/cambios`: el `CHANGELOG.md` del repositorio.
- `assets/`: CSS, JavaScript (`app.js` y un fragmento por página en `chunks/`), logos y la fuente Barlow (copiada del paquete), sin servicios externos. Solo las muestras de otras fuentes del configurador se cargan desde Google Fonts.
- `downloads/`: paquetes npm `.tgz` de la versión compilada.

## Publicar en vuestro hosting

Sube **el contenido de `docs-site/dist/`** al directorio público del dominio elegido, por ejemplo `systemdesign.1komma5.com`. No subas el repositorio completo ni `node_modules`.

En un hosting con compilación, configura:

```text
Directorio raíz: raíz de este repositorio
Comando de instalación: npm ci
Comando de build: npm run docs:build
Directorio de publicación: docs-site/dist
```

La web no necesita servidor Node, base de datos ni variables de entorno. El hosting debe redirigir las rutas que no correspondan a un archivo hacia `index.html`, para que React Router resuelva `/personalizar`, `/fundamentos`, `/instalacion`, `/componentes`, `/estado` y `/cambios`. También funciona bajo una subcarpeta. HTTPS habilita el portapapeles moderno; se incluye una alternativa para contextos locales.

La configuración del dominio y su DNS pertenece al hosting. Esta tarea no registra ni configura `systemdesign.1komma5.com`.

## Desarrollo y vista previa

Después de generar, puedes servir el resultado con cualquier servidor estático. Por ejemplo, si tienes Python:

```bash
python3 -m http.server 4173 --directory docs-site/dist
```

Abre `http://localhost:4173`. Regenera con `npm run docs:build` después de cambiar el contenido o los paquetes. No edites `dist/` a mano.

## Dónde editar

- `docs-site/site/`: la aplicación. `App.mjs` (rutas, carga de cada página, scroll y anclas), `Layout.mjs` (AppShell, barra lateral, búsqueda, tema y modo), `routes.mjs` (rutas, índices de página y grupos del buscador), `ui.mjs` (piezas compartidas: sección, bloque de código, selector de framework, página con índice) y `pages/` (una por ruta).
- `docs-site/catalog.mjs`: los componentes de la página Componentes: vista previa, código React y Vue y propiedades. Los de 0.3 vienen de `components.mjs` y `groups/`.
- `docs-site/site-data.mjs`: lo que se calcula en Node al generar (cobertura leyendo los tests, adopción y `CHANGELOG.md`). La app lo recibe como el módulo `virtual:site-data`.
- `scripts/docs.mjs`: el build: copia los recursos de Grado, escribe `index.html` y empaqueta la app con esbuild.
- `docs-site/assets/app.mjs`: entrada del navegador; monta la app con React Router.
- `docs-site/palette.mjs`: paletas que combinan con el principal (armonías en OKLCH), variantes, lista de fuentes, tokens del tema, CSS y código de tema. Usa la librería de color de Grado. Sus tests están en `docs-site/test/palette.test.mjs`.
- `docs-site/configurator.mjs`: el configurador, con los componentes de `@1k5-tech-es/grado-react`.
- `docs-site/assets/docs.css`: solo lo que los componentes no traen: disposición de las páginas, bloques de código, muestras de tokens, marco de las vistas previas y configurador. Usa solo variables `--k5-*`: la web entera sigue el tema elegido en la cabecera, Marca por defecto. Antes de añadir estilos aquí, mira si un componente de Grado (o `Stack`, `Grid`, `Text`) ya lo resuelve.
- `docs-site/assets/theme.js`: aplicación temprana del tema guardado. Admite `?tema=consola` y `?modo=dark`.
- `docs-site/guidelines.mjs`: guía de uso de cada componente. Un test exige las tres partes en todos.
- `docs-site/adoption.json`: qué versión usa cada aplicación y, cuando existan, los enlaces a Figma de cada componente. Se edita a mano.
- `CHANGELOG.md` (raíz): cambios de cada versión; la página `/cambios` lo publica.
- `packages/grado/src/tokens.json`: tokens del sistema, compartidos con las aplicaciones.

## Distribución de la librería

Las aplicaciones instalan Grado con npm desde GitHub Packages (`@1k5-tech-es/…`), como explica la página Instalación. La web ofrece además archivos `.tgz`, generados con `npm pack --workspaces`, para quien no tenga acceso a la organización de GitHub; quien los use debe guardarlos en su repositorio para que sus compilaciones sean reproducibles.

Publicar esta web **no publica los paquetes en npm**: los publica el workflow `Release` al subir una etiqueta `vX.Y.Z`, en GitHub Packages, privados como el repositorio. Los `.tgz` siguen sirviendo a quien no tenga acceso a la organización de GitHub. Al cambiar de versión, mantén alineadas las versiones y dependencias de los tres paquetes.

## Comprobaciones

`npm run docs:check` pinta cada página en Node con el mismo armazón y comprueba las rutas y anclas internas, recursos, archivos descargables, ejemplos de código, que cada componente tenga guía, que Estado y Cambios estén al día, que Barlow se sirva desde la propia web y el cálculo de paletas del configurador. `npm test` comprueba los paquetes del sistema de diseño. Las vistas previas usan los mismos componentes que pasan axe en `npm run test:browser`; eso no equivale a una certificación de accesibilidad.
