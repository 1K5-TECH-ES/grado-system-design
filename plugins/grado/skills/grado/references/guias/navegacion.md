# Guías de uso: Navegación

Generado por `npm run skill` desde las guías de la web de documentación. Cuándo usar cada componente, qué evitar y qué cuidar de accesibilidad. Las props exactas están en los tipos instalados.

Componentes: Tabs · Pagination · Stepper · Breadcrumbs · CommandPalette · Link

## Tabs

Agrupa vistas relacionadas y permite recorrerlas con las flechas del teclado.

**Cuándo usarlo**

- Úsalo para vistas de un mismo objeto, como Resumen y Documentos de una instalación.
- Usa etiquetas cortas, de una o dos palabras.

**Qué evitar**

- Para los pasos de un proceso usa Stepper.
- Para cambiar el periodo de un gráfico usa SegmentedControl.
- Para navegar entre páginas usa Nav o enlaces.

**Accesibilidad**

- label es obligatorio y nombra la lista de pestañas.
- Flechas izquierda y derecha, Home y End cambian de pestaña. Al recibir el foco, se selecciona.
- Solo la pestaña activa está en el orden de Tab. Las desactivadas se omiten.

**Nota:** Vue admite slots con el nombre de cada value para contenido complejo. Flechas izquierda/derecha, Home y End cambian la pestaña; las desactivadas se omiten.

## Pagination

Recorre resultados con un rango visible y páginas intermedias abreviadas.

**Cuándo usarlo**

- Úsalo bajo listados largos que el servidor devuelve por páginas.
- Mantén el mismo pageSize mientras la persona navega.

**Qué evitar**

- DataTable ya incluye su paginación. No añadas otra.
- Para listas cortas muestra todos los resultados.

**Accesibilidad**

- Es un nav llamado «Paginación» y anuncia el rango, como «1–10 de 128».
- La página actual lleva aria-current="page". Anterior y siguiente se desactivan en los extremos.

**Nota:** La numeración empieza en 1. Desactiva anterior y siguiente en los extremos y limita la página visible al total disponible.

## Stepper

Explica dónde estás en un proceso y qué pasos quedan por completar.

**Cuándo usarlo**

- Úsalo en procesos de varios pasos, como crear una oferta en tres pasos.
- Valida cada paso en tu aplicación antes de avanzar.

**Qué evitar**

- Para vistas que se recorren en cualquier orden usa Tabs.
- Para el historial de un expediente usa Timeline.

**Accesibilidad**

- Es una lista ordenada y el paso actual lleva aria-current="step".
- Los pasos completados llevan un check y, para lectores de pantalla, el texto «completado».
- Con onValueChange los pasos son botones. Desactiva los que no se pueden visitar.

**Nota:** La aplicación valida cada paso y decide a cuáles se puede volver. No avanza automáticamente.

## Breadcrumbs

Explica la posición dentro de la aplicación y permite volver a niveles anteriores.

**Cuándo usarlo**

- Úsalo en páginas de detalle con niveles, como Instalaciones > Lucía Fernández.
- Pon el elemento actual al final y sin href.

**Qué evitar**

- En pantallas de primer nivel no hace falta. Basta con Nav.
- Para los pasos de un proceso usa Stepper.

**Accesibilidad**

- Es un nav llamado «Ruta de navegación».
- El último elemento lleva aria-current="page" y no es un enlace.
- Los separadores son decorativos y no se anuncian.

**Nota:** El último elemento representa la página actual y no es un enlace. Utiliza URLs válidas de tu aplicación.

## CommandPalette

Busca acciones y registros desde cualquier pantalla con Ctrl o ⌘ + K.

**Cuándo usarlo**

- Úsalo para ir rápido a acciones y registros, como «Nueva oferta» o un ticket concreto.
- Ábrelo desde AppSearch y muestra el atajo ⌘K con su prop shortcut.
- Agrupa los resultados, por ejemplo en Acciones, Clientes e Instalaciones.

**Qué evitar**

- Para filtrar el listado de la pantalla usa FilterBar.
- Para elegir un valor en un formulario usa Combobox.
- No lo conviertas en la única vía para una acción. Mantenla también en la interfaz.

**Accesibilidad**

- Usa un dialog modal nativo. Escape lo cierra y el foco vuelve a donde estaba.
- Flecha arriba y abajo recorren los resultados. Enter llama a onSelect y cierra.
- Si cambias hotkey, evita atajos que ya usen el navegador o el lector de pantalla.

**Nota:** Usa <dialog> modal: el foco queda dentro y vuelve al cerrar. Filtra sin distinguir tildes por label, description y keywords. Flechas y Enter eligen; Escape cierra.

## Link

Un enlace con el estilo del sistema, también para el router y para webs externas.

**Cuándo usarlo**

- Úsalo para ir a otra página o a otra web: la ficha de un cliente o la Sede del Catastro.
- Pasa as con el Link del router para navegar sin recargar.
- Usa tone="muted" para enlaces secundarios, como el historial.

**Qué evitar**

- Para acciones que cambian datos usa Button.
- Evita textos como «aquí» o «más información». Nombra el destino.

**Accesibilidad**

- Dentro de un párrafo usa underline="always": el color no basta para reconocer un enlace.
- Con external se anuncia «(se abre en otra pestaña)».
- El foco se ve con un contorno de 2 px.

**Nota:** Con external añade «(se abre en otra pestaña)» para lectores de pantalla. Dentro de un párrafo usa underline="always": el color no basta para distinguir un enlace.
