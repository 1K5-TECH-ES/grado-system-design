# Grado: reglas para trabajar en este repositorio

Sistema de diseño de 1KOMMA5° España. Monorepo con cuatro paquetes que comparten número de versión: `packages/grado` (tokens, CSS, clases, núcleo común, textos, CLI), `grado-react`, `grado-vue` y `grado-elements`. El `README.md` tiene los comandos y la estructura; aquí va lo que hay que saber para cambiar algo sin romperlo.

Todo lo que se escribe para personas (CHANGELOG, documentación, comentarios, mensajes de error) va en español. Los mensajes de commit, en inglés, con el formato `Componente: qué cambia, por qué` (mira `git log`).

## Un componente vive en muchos sitios

Cambiar un componente casi nunca es cambiar un archivo. Para saber dónde está uno: `node .claude/skills/revisar-componente/scripts/datos.mjs <Componente>`.

| Qué | Dónde |
|---|---|
| React | `packages/grado-react/src/<Componente>.tsx`; los de 0.3 se exportan desde `group-<grupo>.ts` |
| Vue | `packages/grado-vue/src/<Componente>.ts`, con `defineComponent` y `h` (sin `.vue`) |
| Web Component, si lo tiene | `packages/grado-elements/src/k5-<nombre>.js` |
| Props → clases, compartido por React y Vue | `packages/grado/src/classes.js` |
| Estado y teclado compartidos | `packages/grado/src/core.js` (Combobox, Calendar, DataTable) y `patterns.js` |
| CSS | `packages/grado/src/css/<componente>.css`, solo con tokens `--k5-…` |
| Textos de la interfaz | `packages/grado/src/messages.js` y `messages/de.js`, `messages/en.js`, con las mismas claves |
| Documentación, ejemplos y guía de uso | `docs-site/components.mjs` o `docs-site/groups/<grupo>.docs.mjs`, `docs-site/guidelines.mjs` |

## Reglas

- **React y Vue generan el mismo HTML con las mismas props.** Si cambias uno, cambia el otro. Lo comprueban `test/parity*.test.mjs`. `grado-elements` también tiene que coincidir cuando el componente existe allí.
- **Nada de colores fijos.** Solo tokens `--k5-…`: los tests comprueban el contraste AA de todos los pares en los tres temas (Consola, Marca y Campo, este con 7 : 1) y los dos modos. Para cambiar un token, `packages/grado/src/tokens.json` es la única fuente.
- **Los cuatro principios visuales:** un solo acento por vista; borde o fondo, nunca los dos; jerarquía por tamaño y peso; estado con punto y texto.
- **Accesibilidad:** cada componente interactivo sigue su patrón de la guía de patrones ARIA del W3C (WAI-ARIA APG), con teclado y foco probados en `test/browser/` en React y en Vue, y axe en los tres temas.
- **Política de versiones** (página Fundamentos de la web). Hasta la 1.0, una versión menor puede romper, pero cada cambio que rompe va en «Al actualizar desde X» del CHANGELOG. Rompe: quitar o renombrar un componente, una prop, un evento, un valor de una prop, una clase `k5-…` o un token; cambiar el tipo o el valor por defecto de una prop; cambiar el HTML que la documentación da por bueno (roles, ids, atributos `data-`). No rompe: componentes, props y tokens nuevos, arreglos de accesibilidad y retoques de estilo dentro de los principios. Lo obsoleto sigue funcionando al menos una versión menor y lo puede cambiar `npx @1k5-tech-es/grado migrate` si no pide decisión.
- **`labs`** queda fuera de esa promesa hasta que el componente pasa al paquete principal: puede cambiar en una versión menor sin aviso.

## Al terminar un cambio en un componente

1. `npm run build && npm test`: unitarios, paridad, textos y que la skill no se quede atrás.
2. `npm run test:browser` si cambia el teclado, el foco o el HTML.
3. `npm run test:visual:docker` si cambia el aspecto, y `-- --update-snapshots` cuando el cambio es intencionado. Sin Docker, las capturas fallan por el suavizado de las letras.
4. `npm run api` si cambian las props, y revisa el diff de `api/`. `npm run size` si crece el código.
5. Documentación: la ficha y la guía de uso de la web, y `npm run skill` para regenerar las guías de la skill de las apps (`plugins/grado/`). Si cambia algo que una app tiene que saber, también `plugins/grado/skills/grado/references/` y `GUIA-INTEGRACION.md`.
6. CHANGELOG: en la sección de la próxima versión, bajo el componente, qué cambia y por qué, y en «Al actualizar» lo que tenga que tocar una app.
7. `npm run lint`.

## Revisar componentes para mejorarlos

La skill `revisar-componente` revisa un componente o una familia y deja los hallazgos en `revision/`. El backlog de la próxima versión es `revision/<versión>.md`. Revisar no cambia código: las mejoras se eligen del backlog y se hacen de una en una, con los pasos de arriba.
