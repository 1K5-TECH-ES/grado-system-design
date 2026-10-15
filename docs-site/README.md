# Web de documentación de Grado

Aplicación React en español con introducción, configurador de temas, instalación y componentes. React Router gestiona la navegación, mientras el build genera una salida estática que usa los tokens y el CSS de Grado. Las vistas previas se crean a partir de los componentes React del repositorio. Incluye código para React y Vue, propiedades, búsqueda, temas y modo oscuro.

## Generar

Desde la raíz del repositorio, con Node.js 20 o superior:

```bash
npm ci
npm run docs:build
npm run docs:check
```

El resultado completo queda en `docs-site/dist/`:

- `index.html`: única entrada de la aplicación React.
- `/personalizar`: configurador de temas. A partir del color principal propone paletas que combinan con él (complementaria, tríada, análoga…; con la berenjena, también la de marca), con tres variantes (Fiel, Suave y Alto contraste). Comprueba el contraste, deja elegir la fuente (Barlow, Inter y otras diez) y genera `grado-tema.css`, los pasos de instalación y un código de tema con el principal, el acento y la variante (`GRADO-5C068C-2ED8C3-F-R8`; con otra fuente, `GRADO-5C068C-2ED8C3-F-R8-INTER`). Las muestras de las fuentes se cargan desde Google Fonts, como Barlow en el resto de la web.
- `/instalacion`: instalación y migración.
- `/componentes`: ejemplos, propiedades y guía de uso (cuándo usarlo, qué evitar y accesibilidad); `?vista=mi-tema` aplica el tema guardado.
- `/estado`: cobertura de cada componente (React, Vue, mismo HTML, navegador, captura, guía, Figma), calculada a partir de los tests al generar la web, y adopción por aplicación.
- `/cambios`: el `CHANGELOG.md` del repositorio.
- `assets/pages/`: contenido separado por ruta para cargar solo la página visitada.
- `assets/`: CSS, JavaScript, logos y la fuente Barlow (copiada del paquete), sin servicios externos. Solo las muestras de otras fuentes del configurador se cargan desde Google Fonts.
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

La web no necesita servidor Node, base de datos ni variables de entorno. El hosting debe redirigir las rutas que no correspondan a un archivo hacia `index.html`, para que React Router resuelva `/personalizar`, `/instalacion`, `/componentes`, `/estado` y `/cambios`. También funciona bajo una subcarpeta. HTTPS habilita el portapapeles moderno; se incluye una alternativa para contextos locales.

La configuración del dominio y su DNS pertenece al hosting. Esta tarea no registra ni configura `systemdesign.1komma5.com`.

## Desarrollo y vista previa

Después de generar, puedes servir el resultado con cualquier servidor estático. Por ejemplo, si tienes Python:

```bash
python3 -m http.server 4173 --directory docs-site/dist
```

Abre `http://localhost:4173`. Regenera con `npm run docs:build` después de cambiar el contenido o los paquetes. No edites `dist/` a mano.

## Dónde editar

- `scripts/docs.mjs`: contenido, ejemplos y datos de las rutas.
- `docs-site/assets/app.mjs`: aplicación React, rutas y navegación cliente con React Router.
- `docs-site/palette.mjs`: paletas que combinan con el principal (armonías en OKLCH), variantes, lista de fuentes, tokens del tema, CSS y código de tema. Usa la librería de color de Grado. Sus tests están en `docs-site/test/palette.test.mjs`.
- `docs-site/configurator.mjs`: el configurador, con los componentes de `@1k5/grado-react`.
- `docs-site/assets/docs.css`: disposición de las páginas, bloques de código y configurador. El marco de la web es el `AppShell` de Grado (barra lateral, buscador y cabecera), generado en `scripts/docs.mjs` con `@1k5/grado-react`, igual que una aplicación. Usa solo variables `--k5-*`: la web entera sigue el tema elegido en la cabecera, Marca por defecto.
- `docs-site/assets/docs.js`: comportamiento del marco (cajón móvil, grupos de la barra lateral, buscador con `/` o Ctrl+K), portapapeles, temas y controles de cada ruta.
- `docs-site/assets/live-demos.mjs`: monta y desmonta las demos interactivas, el configurador y el modo «Mi tema» de Componentes.
- `docs-site/assets/theme.js`: aplicación temprana del tema guardado. Admite `?tema=consola` y `?modo=dark`.
- `docs-site/guidelines.mjs`: guía de uso de cada componente. Un test exige las tres partes en todos.
- `docs-site/adoption.json`: qué versión usa cada aplicación y, cuando existan, los enlaces a Figma de cada componente. Se edita a mano.
- `CHANGELOG.md` (raíz): cambios de cada versión; la página `/cambios` lo publica.
- `packages/grado/src/tokens.json`: tokens del sistema, compartidos con las aplicaciones.

## Distribución de la librería

La web ofrece archivos `.tgz` instalables, generados con `npm pack --workspaces`. El paquete base y el del framework se instalan juntos. Los consumidores deben guardar los archivos en su repositorio para que sus compilaciones sean reproducibles.

Publicar esta web **no publica los paquetes en npm**. Cuando se configure un registro, habrá que publicar los tres paquetes y actualizar la guía de instalación. Al cambiar de versión, mantén alineadas las versiones y dependencias de los tres paquetes.

## Comprobaciones

`npm run docs:check` comprueba las rutas y anclas internas, recursos, archivos descargables, ejemplos de código, que cada componente tenga guía, que Estado y Cambios estén al día, que Barlow se sirva desde la propia web y el cálculo de paletas del configurador. `npm test` comprueba los paquetes del sistema de diseño. Las vistas previas usan los mismos componentes que pasan axe en `npm run test:browser`; eso no equivale a una certificación de accesibilidad.
