---
name: revisar-componente
description: Revisa uno o varios componentes de Grado (este repositorio) para mejorarlos y deja una ficha con hallazgos comprobados en revision/componentes/. Mira uso real en las apps, huecos de las migraciones, accesibilidad, API, paridad React/Vue, temas, tests y documentación. Úsala cuando se pida revisar, auditar o mejorar un componente o una familia de Grado (Dialog, Formularios, Superposiciones…), preparar el backlog de la próxima versión o buscar qué falla o falta en la librería. Solo revisa: no cambia el código.
---

# Revisar componentes de Grado

El objetivo es un backlog de mejoras que valga la pena hacer, no una lista larga. Un hallazgo vale si tiene **prueba** (archivo y línea, o un comando que lo enseña) y **motivo** (un fallo, un problema de accesibilidad, o un caso real de una app). Lo que solo es «otra librería lo tiene» va a Ideas, aparte.

Revisar no cambia código. Lo único que se escribe es la ficha de cada componente en `revision/componentes/<id>.md`. Las mejoras se eligen después, del backlog, y se hacen de una en una siguiendo `CLAUDE.md`.

## 1. Datos de partida

```bash
node .claude/skills/revisar-componente/scripts/datos.mjs <Componente o familia>   # --familias para ver la lista
```

Da, por componente: archivos de React, Vue, Web Component y CSS; tests que lo nombran; documentación; qué cobertura le falta; cuántas veces lo usa cada app; si tiene guía de uso. Necesita el build hecho (`npm run build`).

Lee también:

- **`revision/<versión>.md`**, el backlog abierto. Tiene los huecos que ya encontraron las migraciones: empieza por ellos y no los repitas como nuevos, complétalos con la prueba y la propuesta.
- **Las fichas anteriores** en `revision/componentes/`, si el componente ya se revisó.
- **`api/grado-react.api.md` y `api/grado-vue.api.md`**: las props de verdad, y las de los componentes parecidos para comparar nombres.

## 2. Uso real en las apps

Es la mejor fuente de mejoras: lo que una app tuvo que hacer por su cuenta es lo que le falta a Grado. Si están clonadas junto a este repositorio, búscalo en ellas (solo lectura):

| App | Carpeta | Pila |
|---|---|---|
| Memorias | `../generador-memorias-nest/frontend` | React 19, Tailwind 4 |
| NeuroHelp | `../1komma5es_help/Frontend` | Vue 3.5, Tailwind 3 |
| Sales Coach | `../sales-coach-grado` | Vue 3.5, Tailwind 3 |

Busca: cómo se usa el componente (props que pasan, qué combinan con él), **piezas propias que lo sustituyen o lo envuelven** (en NeuroHelp, por ejemplo, `AppDialog`, `AppPopover`, `AppMenu`, `ConfirmDialog`), CSS que sobrescribe clases `k5-…` y comentarios que expliquen por qué no se usó Grado. Si una app no está, dilo en la ficha y sigue.

## 3. Qué revisar

Lee el código de React y de Vue enteros, el CSS y los tests del componente. Después, por este orden:

1. **Fallos.** Comportamiento que no hace lo que la documentación o la guía dicen. Casos límite: sin datos, textos largos, valores extremos, controlado y no controlado, desmontar a medio abrir.
2. **Accesibilidad.** El patrón que le toca en la guía de patrones ARIA del W3C (WAI-ARIA APG): roles, nombre accesible, teclado completo, adónde va el foco al abrir y al cerrar, anuncios. Tamaño de los objetivos táctiles (44 px en Campo). Comprueba qué cubre ya `test/browser/` y qué no.
3. **API.** Coherencia con el resto: `value`/`defaultValue`/`onValueChange`, `open`/`onOpenChange`, `size`, `variant`, `tone`, nombres de eventos en Vue; `ref` y `className` o atributos que llegan al elemento correcto; props que faltan para casos que las apps ya tienen.
4. **Paridad.** React, Vue y, si existe, el Web Component: mismas props, mismo HTML, mismo teclado. Mira si `test/parity*.test.mjs` cubre las props importantes o solo el caso básico.
5. **Aspecto.** Solo tokens `--k5-…`; los cuatro principios (un acento por vista, borde o fondo y no los dos, jerarquía por tamaño y peso, estado con punto y texto); los tres temas y los dos modos; `forced-colors` y `print` si aplica; móvil.
6. **Tests.** Qué comportamiento importante no prueba nada. Un hallazgo de tests solo es prioritario si el componente se usa o ya falló.
7. **Documentación.** La ficha de la web, la guía de uso y la skill de las apps dicen lo que el componente hace de verdad. Si las apps chocaron con algo, ¿lo avisa la guía?

Decisiones ya tomadas que no se reabren: `Button` mantiene `danger` y `destructive`; el español viene de serie y el alemán y el inglés se importan aparte; un componente nuevo de utilidad o experimental va primero a `labs`.

## 4. Comprueba antes de escribir

Cada hallazgo, con su prueba. Lee la línea que citas. Si dices que algo falla, enséñalo: un test rápido con `node -e` o `node --test` que lo reproduzca, o el caso exacto en el código. Si solo se puede ver en un navegador y no lo has visto, márcalo **Por confirmar** y di cómo confirmarlo. No ejecutes `npm run test:visual` ni `test:browser` enteros: son lentos y no hacen falta para revisar.

## 5. La ficha

Escribe `revision/componentes/<id>.md` (el id del script de datos) con este formato:

```markdown
# <Componente>

Revisado el <fecha> sobre Grado <versión> · <familia>

<Dos o tres frases: en qué estado está y qué es lo más importante.>

Uso: <Memorias N, NeuroHelp N…, o ninguna> · Piezas propias en las apps: <cuáles, o ninguna>

## Hallazgos

### <id>-1 · <título corto que diga el problema>

- **Tipo:** fallo · accesibilidad · API · paridad · aspecto · tests · documentación
- **Prioridad:** alta · media · baja
- **Prueba:** `ruta:línea` y qué pasa. O el comando que lo enseña.
- **Por qué importa:** la app o el caso que lo sufre.
- **Propuesta:** el cambio concreto, en React y en Vue.
- **Rompe:** no · sí, <qué>, y qué iría en «Al actualizar»
- **Esfuerzo:** S (una o dos horas) · M (medio día) · L (más)

## Ideas

- <Mejoras sin caso real todavía, una línea cada una.>

## Revisado sin hallazgos

- <Qué aspectos de la sección 3 están bien, en una línea cada uno, para saber qué se ha mirado.>
```

Prioridad:

- **Alta:** un fallo o un problema de accesibilidad que ve un usuario, o un hueco que ya obligó a una app a hacer una pieza propia.
- **Media:** incoherencia de API, falta de paridad, o un test que falta en algo que las apps usan.
- **Baja:** el resto.

Ordena los hallazgos por prioridad. Si no hay ninguno de verdad, la ficha lo dice y no se inventa. Pocos hallazgos bien probados valen más que muchos dudosos.

## 6. El backlog

Si revisas tú directamente (no como agente de una revisión más grande), añade al final los hallazgos de prioridad alta y media a `revision/<versión>.md`, en su tabla, con un enlace a la ficha. Si eres uno de varios agentes, no toques el backlog: devuelve la lista de fichas escritas y sus hallazgos de prioridad alta, y quien coordina lo junta.
