---
name: grado
description: Usar Grado, el sistema de diseño de 1KOMMA5° España (paquetes npm @1k5-tech-es/grado, grado-react, grado-vue y grado-elements), en una app. Cubre instalarlo desde GitHub Packages con el token, conectar los estilos con Tailwind 3, Tailwind 4 o sin Tailwind, elegir y usar componentes, temas (Consola, Marca, Campo), modo oscuro, idioma, CI y Docker, actualizar de versión y migrar una app que usa shadcn, Radix, reka-ui u otra UI propia. Úsala siempre que el trabajo toque la interfaz de una app de 1KOMMA5°, que el package.json tenga dependencias @1k5-tech-es, que aparezcan clases k5- o variables --k5-, o que se hable de Grado, del sistema de diseño de la empresa, de pasar una app a Grado o de errores E401, E403 o E404 al instalar @1k5-tech-es, aunque no se nombre la skill.
---

# Grado en una app

Grado es el sistema de diseño de 1KOMMA5° España. Aporta presentación y componentes; el router, los datos, el estado y la lógica siguen siendo de la app.

Esta skill describe **Grado 0.7.0**. Hasta la 1.0, una versión menor (0.7 → 0.8) puede cambiar una API o el aspecto, así que lo instalado en la app manda sobre lo que diga aquí (sección 3).

| Paquete | Para qué |
|---|---|
| `@1k5-tech-es/grado` | Base: tokens (CSS y JS), `grado.css`, preset de Tailwind, fuente Inter, logos, textos (es/de/en) y la CLI `grado` (`migrate`, `usage`). Siempre hace falta. |
| `@1k5-tech-es/grado-react` | Componentes para React 18+ |
| `@1k5-tech-es/grado-vue` | Los mismos componentes en Vue 3.5+, con las mismas props y el mismo HTML |
| `@1k5-tech-es/grado-elements` | Web Components (`k5-combobox`, `k5-dialog`, `k5-tabs`, `k5-menu`, `k5-toaster`) para HTML sin framework: PHP, Twig, páginas estáticas |

Tres temas sobre los mismos tokens, cada uno con modo claro y oscuro: **Consola** (por defecto, herramientas internas), **Marca** (lo que ve el cliente) y **Campo** (alto contraste 7 : 1 y controles de 44 px, para técnicos al sol). Requisitos: Node.js 22 o superior. Tailwind es opcional (3 o 4).

## 1. Sitúate antes de cambiar nada

Lee, sin tocar nada:

- **Framework.** React → `grado-react`. Vue → `grado-vue`. HTML de servidor (PHP, Twig, estático) → `grado-elements` y los CSS. React Native → solo los tokens en JS (`@1k5-tech-es/grado/tokens`), porque no hay CSS ni DOM.
- **Tailwind.** Versión 4, 3 o ninguna: mira el `package.json` y el CSS global. Cambia cómo se importan los estilos.
- **Grado ya instalado.** Versión en `node_modules/@1k5-tech-es/grado/package.json`. Comprueba que el paquete del framework está en la misma.
- **UI previa.** shadcn, Radix, reka-ui, Headless UI, sonner, cva, clsx, tailwind-merge y los componentes propios que las envuelven. Si la hay, la tarea es una migración.
- **Repositorio de Grado a mano.** Un `../grado-system-design` o un directorio añadido a la sesión con `/add-dir` da mucho más contexto: código, tests y API generada.

## 2. Lee la referencia que toca

| Tarea | Referencia |
|---|---|
| Instalar, token, `.npmrc`, errores de npm, plan B sin token, CI, Docker, Vercel | [references/instalacion.md](references/instalacion.md) |
| Importar los estilos, Tailwind 3 o 4, temas, modo oscuro, estilos propios con tokens | [references/estilos.md](references/estilos.md) |
| Qué componentes hay, React frente a Vue, `toast`, iconos, idioma, Next.js, Web Components y trampas conocidas | [references/componentes.md](references/componentes.md) |
| Cuándo usar un componente y no otro, qué evitar con él y qué cuidar de accesibilidad | [references/guias/indice.md](references/guias/indice.md), y después solo el archivo de su familia |
| Pasar una app con otra UI a Grado, actualizar de versión, qué hacer si falta algo | [references/migracion.md](references/migracion.md) |

Una instalación desde cero necesita las tres primeras, en ese orden.

**Antes de usar un componente por primera vez en la tarea, lee su guía de uso.** Los tipos dicen qué props existen, pero no las decisiones del equipo: un solo botón `primary` por zona, `danger` para el botón que abre la confirmación y `destructive` solo para el que la confirma, `Combobox` cuando hay muchas opciones y `RadioGroup` cuando hay pocas, no desactivar un botón para señalar errores. Seguirlas es lo que hace que la pantalla se parezca al resto de las apps de 1KOMMA5°. Pasa lo mismo al revisar una pantalla ya hecha: compárala con las guías de los componentes que usa.

## 3. Dónde está la verdad sobre una prop

No adivines props ni eventos: los nombres se parecen a los de shadcn o Radix, pero no son los mismos. Consulta, por este orden:

1. **Los tipos instalados:** `node_modules/@1k5-tech-es/grado-react/dist/*.d.ts` (o `grado-vue`). Siempre corresponden a la versión que usa la app.
2. **El README de cada paquete** en `node_modules/@1k5-tech-es/*/README.md`. El de `grado-elements` tiene la sintaxis de los Web Components.
3. **El repositorio de Grado**, si lo tienes: `api/grado-react.api.md` y `api/grado-vue.api.md` (props de cada componente y, en Vue, los `emits`), `packages/grado-react/src/<Componente>.tsx`, `packages/grado/src/css/<componente>.css`, `catalog/index.html` y la sección «Al actualizar» de `CHANGELOG.md`.
4. **El repositorio en GitHub**, que es público. Usa la etiqueta de la versión instalada, por ejemplo `https://raw.githubusercontent.com/1K5-TECH-ES/grado-system-design/v0.7.0/api/grado-react.api.md`.

## 4. Reglas que valen siempre

- **El token de GitHub no sale nunca.** No lo escribas en un archivo, un commit, un log ni una respuesta, y no pidas que lo peguen en el chat. Da acceso a la cuenta de una persona. El `.npmrc` solo lo referencia como `${GITHUB_TOKEN}`. Para saber si existe sin verlo: `test -n "$GITHUB_TOKEN" && echo "GITHUB_TOKEN definido" || echo "falta GITHUB_TOKEN"`. Si alguien ya lo pegó o lo subió a un repositorio, recomiéndale revocarlo y crear otro.
- **Lo que solo puede hacer una persona**, como crear el token o guardar secretos en el CI o en Vercel, explícalo con los pasos y espera. No intentes hacerlo tú.
- **El paquete base y el del framework, en la misma versión.** Comparten número de versión y se prueban juntos.
- **Los estilos, una sola vez, en el CSS global.** `tokens.css` o `tokens-hsl.css`, nunca los dos: definen las mismas variables en formatos distintos y el segundo rompe al primero.
- **Tokens semánticos, no hexadecimales.** `--k5-primary`, `--k5-muted-foreground` o `bg-primary` cambian con el tema y el modo, y todos sus pares pasan el contraste AA. Un color fijo no hace ninguna de las dos cosas.
- **Nada de parches en `node_modules` ni de copiar un componente de Grado para modificarlo.** Se pierden al actualizar y separan la app del sistema. Si falta algo, haz una pieza propia sobre las clases `k5-…` y los tokens, en su propio archivo, y anota el hueco (ver [references/migracion.md](references/migracion.md)).
- **No traigas otra librería de UI** para algo que Grado ya cubre.
- **No edites el repositorio de Grado desde la tarea de otra app.** Úsalo como referencia; la app instala Grado desde npm.

## 5. Antes de dar el trabajo por terminado

- [ ] `GITHUB_TOKEN` definido (sin mostrarlo) y `.npmrc` en la carpeta donde se ejecuta npm
- [ ] `@1k5-tech-es/grado` y el paquete del framework instalados en la misma versión
- [ ] Estilos importados una sola vez, con la variante de su Tailwind; no conviven `tokens.css` y `tokens-hsl.css`
- [ ] Variables antiguas equivalentes borradas (`--primary`, `--background`… de shadcn u otras)
- [ ] `<Toaster />` en la raíz si se usa `toast()`
- [ ] Tema (`data-k5-theme`) y modo oscuro decididos
- [ ] Ningún color hexadecimal nuevo: tokens semánticos
- [ ] CI y Docker con el token como secreto, nunca en el código ni en un `ARG`
- [ ] La app compila y se ha revisado en móvil, con teclado (Tab, Escape, flechas) y en modo oscuro
- [ ] Los huecos de Grado que hayas encontrado, anotados para quien lo mantiene
