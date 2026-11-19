# Guías de uso: Acciones

Generado por `npm run skill` desde las guías de la web de documentación. Cuándo usar cada componente, qué evitar y qué cuidar de accesibilidad. Las props exactas están en los tipos instalados.

Componentes: Button · DropdownMenu · CopyButton · ActionBar · IconButton · ToggleGroup

## Button

Una acción, una jerarquía clara. Seis variantes para guiar el siguiente paso.

**Cuándo usarlo**

- Úsalo para acciones que cambian datos o abren algo, como guardar una oferta o crear una instalación.
- Pon un solo botón primary por zona. El resto, secondary o ghost.
- Usa danger (texto rojo, sin fondo) para una acción destructiva junto a otras, como eliminar un ticket.
- Usa destructive (rojo sólido) solo para confirmar el borrado dentro de AlertDialog.

**Qué evitar**

- Para ir a otra página usa un enlace con buttonClass() en lugar de Button.
- No uses destructive en el botón que abre la confirmación: ese es danger («Eliminar»), y destructive el que la confirma dentro del AlertDialog («Eliminar ticket»).
- Evita textos genéricos como «Aceptar». Nombra la acción, por ejemplo «Enviar oferta».
- No lo desactives para señalar errores. Deja enviar y muestra el error en Field.

**Accesibilidad**

- Con iconOnly, ponle aria-label, por ejemplo «Eliminar documento».
- loading desactiva el botón y añade aria-busy. Mantén visible el texto de la acción.
- Por defecto es type="button". Para enviar un formulario pon type="submit".

**Nota:** Para enviar un formulario utiliza type="submit". Los botones de solo icono necesitan aria-label. Para enlaces utiliza buttonClass() con el enlace de tu router.

## DropdownMenu

Acciones secundarias en un menú compacto con navegación por teclado.

**Cuándo usarlo**

- Úsalo para acciones secundarias de un registro, como editar, duplicar o eliminar.
- Marca con danger las acciones destructivas y sepáralas con separator.

**Qué evitar**

- Si una acción es frecuente, muéstrala como Button.
- Para elegir un valor de formulario usa Select o Combobox.

**Accesibilidad**

- Flecha abajo o arriba sobre el botón abre el menú en la primera o en la última acción.
- Flechas, Home, End y la inicial mueven el foco. Las acciones desactivadas se omiten.
- Escape cierra y devuelve el foco al botón. Tab sale del menú.

**Nota:** Flechas, Home, End y búsqueda por inicial. Escape cierra y devuelve el foco. Tab sale del menú. Las acciones desactivadas se omiten.

## CopyButton

Copia un texto al portapapeles y confirma que se ha copiado.

**Cuándo usarlo**

- Úsalo junto a valores que se pegan en otro sitio: CUPS, referencia catastral, número de expediente o un enlace.
- Con iconOnly, dentro de una ficha o una tabla, junto al valor que copia.

**Qué evitar**

- No lo uses para valores que la persona no necesita fuera de la aplicación.
- No muestres un Toast además: el propio botón confirma la copia.

**Accesibilidad**

- Con iconOnly, label es el nombre accesible: «Copiar CUPS» mejor que «Copiar».
- El resultado («Copiado» o «No se pudo copiar») se anuncia en una región aria-live.
- El foco se queda en el botón después de copiar.

**Nota:** Usa navigator.clipboard y, si no está disponible (http, permisos), un textarea temporal con execCommand. Anuncia «Copiado» o «No se pudo copiar» en una región aria-live y vuelve al estado inicial a los 2 s.

## ActionBar

Acciones en lote sobre las filas elegidas de una tabla, en una barra que flota abajo.

**Cuándo usarlo**

- Úsalo con DataTable selectable para actuar sobre varias filas: exportar, asignar un instalador, cambiar el estado.
- Pinta count con el número de filas elegidas: con 0 la barra desaparece.
- Pon dos o tres acciones como mucho; el resto, en un DropdownMenu dentro de la barra.

**Qué evitar**

- Para acciones de una sola fila usa rowActions de DataTable o ContextMenu.
- No pongas acciones destructivas sin confirmar: abre un AlertDialog antes.
- No la uses fuera de una selección: no es una barra de herramientas fija.

**Accesibilidad**

- Es un role="toolbar" con el texto de la selección como nombre, por ejemplo «3 seleccionadas».
- Flechas izquierda y derecha, Home y End mueven el foco entre los botones.
- Escape dentro de la barra quita la selección y el foco vuelve a donde estaba antes de entrar.

**Nota:** Superficie invertida: oscura en tema claro y clara en oscuro. Por debajo de 600 px ocupa el ancho con margen. Los botones fantasma, secundarios y danger toman el color de la barra.

## IconButton

Un botón de solo icono con nombre obligatorio, normal o conmutable.

**Cuándo usarlo**

- Úsalo en barras compactas donde el icono se entiende solo, como ajustes, descargar o fijar.
- Con pressed se convierte en un conmutador, como fijar una instalación o seguir sus avisos.

**Qué evitar**

- Si el icono no es evidente, usa un Button con texto.
- Para varias opciones relacionadas que se combinan usa ToggleGroup.

**Accesibilidad**

- label es obligatorio: va en aria-label y en title.
- Conmutado lleva aria-pressed="true"; no cambies el label al pulsar.

**Nota:** Es un Button con iconOnly y el nombre puesto. Conmutado, toma el fondo y el texto del tono primario.

## ToggleGroup

Botones conmutables que se combinan: formato de texto, columnas visibles o filtros rápidos.

**Cuándo usarlo**

- Úsalo para opciones que se combinan, como formato de texto, columnas visibles o filtros rápidos.
- Con type single permite una opción o ninguna; con multiple, cualquier combinación.

**Qué evitar**

- Para una sola opción que cambia la vista (Día, Semana, Mes) usa SegmentedControl.
- Para un valor de formulario obligatorio usa RadioGroup o Select.
- Con más de cinco opciones usa MultiSelect o FilterBar.

**Accesibilidad**

- label es obligatorio y nombra el grupo (role="group").
- Cada botón lleva aria-pressed. Un solo punto de Tab; flechas, Home y End mueven el foco.
- Con iconOnly, la etiqueta de cada opción pasa a aria-label y title.

**Nota:** Cada botón lleva aria-pressed. Un solo punto de Tab; flechas, Home y End mueven el foco y Espacio o Enter conmutan. Para una sola opción que cambia la vista usa SegmentedControl.
