# Migrar una app a Grado, actualizar de versión y huecos

## 1. Pasar a Grado una app que ya tiene su propia UI

Orden que funcionó en Memorias y NeuroHelp. Hazlo por fases y deja la app funcionando al final de cada una: así cada cambio se puede revisar y deshacer por separado.

1. **Inventario.** Lista qué librerías de UI usa la app (shadcn, Radix, reka-ui, Headless UI, sonner, cva, clsx, tailwind-merge…) y qué componentes propios las envuelven, con cuántos usos tiene cada uno. Enséñaselo a la persona antes de cambiar nada.
2. **Tokens y estilos** ([estilos.md](estilos.md)). Borra las variables antiguas equivalentes (`--primary`, `--background`…), que si no pisan las de Grado.
3. **Armazón:** `AppShell` y la navegación, si encajan con la app.
4. **Piezas repetidas**, pantalla a pantalla: botones, campos, tarjetas, tablas, diálogos, avisos. Cambiar primero el envoltorio propio (por ejemplo `components/ui/button.tsx`) por el de Grado suele arreglar muchas pantallas de una vez, pero revisa que las props que usan las pantallas existen en Grado ([componentes.md](componentes.md) y la sección 3 de `SKILL.md`).
5. **Quita las dependencias** que ya no se usen.
6. **Comprueba:** móvil, teclado (Tab, Escape, flechas), modo oscuro, validaciones, estados de carga y vacíos. Mejor con capturas antes y después.

Herramientas de la CLI de Grado (vienen con `@1k5-tech-es/grado`):

```bash
npx @1k5-tech-es/grado usage            # qué componentes, props, clases k5- y tokens usa la app (no cambia nada)
npx @1k5-tech-es/grado usage --json     # el inventario completo
```

Si algo de la app no tiene equivalente en Grado, constrúyelo sobre las clases `k5-…` y los tokens en vez de traer otra librería (sección 3).

## 2. Actualizar de versión

1. Lee en `CHANGELOG.md` la sección «Al actualizar desde X» de cada versión entre la instalada y la nueva. Está en el repositorio de Grado y en GitHub: `https://github.com/1K5-TECH-ES/grado-system-design/blob/main/CHANGELOG.md`.
2. Sube a la vez el paquete base y el del framework (y `grado-elements` si se usa), a la misma versión.
3. Aplica los cambios mecánicos con la CLI:

```bash
npx @1k5-tech-es/grado migrate --dry    # enseña los cambios sin escribir
npx @1k5-tech-es/grado migrate          # los aplica; avisa con archivo:línea de lo que pide una decisión
```

4. Resuelve los avisos que pidan una decisión y repasa todo lo que venga de `labs`, que puede cambiar sin aviso.
5. Compila y revisa la app como en el paso 6 de la sección 1.

## 3. Si falta algo en Grado

No hagas un parche dentro de `node_modules` ni copies el componente de Grado a la app para modificarlo: se perdería al actualizar y la app se alejaría del sistema.

1. Resuélvelo en la app con una pieza propia sobre las clases y los tokens de Grado, en un archivo aparte (por ejemplo `AppMenu`). Así se puede cambiar por el componente oficial cuando exista.
2. Anota qué faltaba (componente, prop, caso de uso, archivo de la app) y díselo a la persona al terminar, para que lo comunique a quien mantiene Grado o abra una issue en `1K5-TECH-ES/grado-system-design`.
