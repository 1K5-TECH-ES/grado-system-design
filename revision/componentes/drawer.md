# Drawer / Sheet

Revisado el 2026-11-19 sobre Grado 0.7.0 · Superposiciones

Es el mismo `Modal` que Dialog con las clases `k5-drawer` y `k5-drawer--left`, así que hereda tanto lo bueno como los fallos de `dialog.md`: arrastrar desde un campo hasta el fondo lo cierra, monta el contenido cerrado y no tiene tamaños. Lo único propio que han tenido que tocar las apps es el ancho y el cuerpo de los paneles sin cabecera.

Uso: Memorias 3 (`Drawer`) · NeuroHelp 2 (`Sheet` a través de `AppDialog` con `sheet`, 4 usos; uno es `SettingsSheet`, usado 13 veces) · Sales Coach 0 · Piezas propias en las apps: NeuroHelp `SettingsSheet` (formulario que abarca cuerpo y pie, aviso de cambios y tres anchos) sobre `AppDialog`.

## Hallazgos

### drawer-1 · Los paneles sin cabecera rehacen el cuerpo con clases

- **Tipo:** API
- **Prioridad:** baja
- **Prueba:** con `header={false}` el cuerpo solo pierde el relleno (`packages/grado/src/css/overlay.css:128-131`). Los dos paneles de ficha de NeuroHelp, que dibujan su propia cabecera con el aspa junto al nombre, añaden `[&_.k5-dialog__body]:flex [&_.k5-dialog__body]:flex-col [&_.k5-dialog__body]:overflow-hidden [&_.k5-dialog__body]:p-0` para que cada zona del panel haga su propio scroll (`CustomerPanel.vue:329`, `WhatsappGroupPanel.vue:105`).
- **Por qué importa:** son selectores sobre una clase interna `k5-…`, que se rompen si cambia el HTML; en dos sitios de una sola app.
- **Propuesta:** en el modo sin cabecera, `.k5-dialog--headless .k5-dialog__body` pasa a `display: flex; flex-direction: column` (el contenido normal no cambia) y se documenta que el lienzo sin cabecera no hace scroll propio si la app pone el suyo. Solo CSS.
- **Rompe:** no, salvo que alguien dependa de que el cuerpo sin cabecera sea un bloque; revisar capturas del editor de Memorias.
- **Esfuerzo:** S

### Comparte con Dialog

- dialog-1 · Arrastrar desde un campo hasta el fondo (a la izquierda del panel) lo cierra.
- dialog-2 · El contenido se queda montado cerrado (`AppDialog.vue:50`, también para `Sheet`).
- dialog-3 · Sin aviso de cambios sin guardar: `SettingsSheet` lo usa en sus 13 paneles.
- dialog-4 · Sin tamaño: NeuroHelp usa 24, 32, 42 y 56 rem (`WhatsappGroupPanel.vue:105`, `SettingsSheet.vue:29`) y Memorias 32 rem (`requerimientos-page.jsx:72`, `equipment-crud-page.jsx:105`); la propuesta incluye tamaños para el panel.
- dialog-5 · El foco inicial va al aspa y no al primer campo.
- dialog-6 · El cierre nativo deja el estado abierto y la página sin scroll.
- dialog-7 · Escape con un Tooltip abierto dentro cierra el panel.
- dialog-8 · El aspa mide 28 px; en el panel a pantalla completa del móvil es la forma principal de cerrar.
- dialog-9 · El pie queda fuera del formulario del cuerpo: es la razón principal de `SettingsSheet`.
- dialog-12 · El Drawer izquierdo no está en la comparación React/Vue de `sameHtml` (hoy sale igual).

## Ideas

- `side="bottom"` para una hoja inferior en móvil; ninguna app la pide todavía.
- Animación de salida (hoy el panel entra deslizando y sale de golpe).
- Con `forced-colors`, `.k5-dialog` pone borde en los cuatro lados (`forced-colors.css:70`) y el panel también lo lleva en los bordes pegados a la ventana; apenas se ve.

## Revisado sin hallazgos

- `Sheet` es el mismo componente que `Drawer` en React y en Vue (`Dialog.tsx:142`, `Dialog.ts:123`), como dice la web.
- `side` izquierdo y derecho, con su borde, radio y animación (`overlay.css:134-158`); en móvil ocupa todo el ancho y pierde el radio (`overlay.css:212-214`); sin animación con `prefers-reduced-motion`.
- Alto completo con `100dvh`, cuerpo con scroll propio y pie abajo.
- Se abre y se cierra con el aspa en React y en Vue (`test/browser/run.mjs:108-110`); Escape y la vuelta del foco son el mismo código que Dialog, probado allí.
- Mismo HTML en React y en Vue con `side="left"` y pie (comprobado con un script).
- La guía (`docs-site/guidelines.mjs:218-228`) dice lo que hace.
