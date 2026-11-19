# Guías de uso: Superposiciones

Generado por `npm run skill` desde las guías de la web de documentación. Cuándo usar cada componente, qué evitar y qué cuidar de accesibilidad. Las props exactas están en los tipos instalados.

Componentes: Dialog · AlertDialog · Drawer / Sheet · Popover · ContextMenu

## Dialog

Edita o consulta información manteniendo el contexto de la pantalla.

**Cuándo usarlo**

- Úsalo para editar o consultar algo sin perder la pantalla, como cambiar la fecha de una visita.
- Pon las acciones en footer, con la principal como Button primary.

**Qué evitar**

- Para confirmar acciones destructivas usa AlertDialog.
- Para fichas largas o paneles de detalle usa Drawer.
- No abras un Dialog desde otro Dialog.

**Accesibilidad**

- Usa el dialog nativo con showModal(), que mantiene el foco dentro.
- Escape y el botón «Cerrar» lo cierran, y el foco vuelve al control que lo abrió.
- title es obligatorio y da nombre al diálogo.

**Nota:** Usa dialog.showModal(): el navegador gestiona el foco modal y bloquea la interacción exterior. Escape solicita el cierre; el foco vuelve al control que lo abrió. La aplicación gestiona el guardado.

## AlertDialog

Una confirmación explícita para acciones que requieren especial atención.

**Cuándo usarlo**

- Úsalo para confirmar acciones difíciles de deshacer, como eliminar una instalación o anular una oferta.
- Escribe el título como pregunta y repite la acción en el botón de confirmar.

**Qué evitar**

- Para acciones reversibles, ejecútalas y confirma con un Toast.
- Para formularios o contenido largo usa Dialog.

**Accesibilidad**

- Tiene role="alertdialog" y no se cierra al pulsar fuera.
- Escape y el botón de cierre cancelan. Nunca ejecutan la confirmación.
- Explica las consecuencias en description, que se enlaza con aria-describedby.

**Nota:** No se cierra al pulsar el fondo. Escape y el botón de cierre cancelan; nunca ejecutan la confirmación.

## Drawer / Sheet

Un panel lateral para abrir una ficha sin abandonar el listado.

**Cuándo usarlo**

- Úsalo para abrir la ficha de un cliente o un ticket sin salir del listado.
- Úsalo también para filtros avanzados que no caben en FilterBar.

**Qué evitar**

- Para una confirmación breve usa AlertDialog.
- Si el contenido necesita la pantalla entera, crea una página con su propia URL.

**Accesibilidad**

- Funciona como Dialog. El foco queda dentro y vuelve al disparador al cerrar.
- title es obligatorio y nombra el panel.

**Nota:** Sheet es un alias de Drawer. En móvil el panel ocupa el ancho disponible.

## Popover

Contenido libre anclado a un control: datos de un CUPS, una ayuda con un enlace, un filtro pequeño.

**Cuándo usarlo**

- Úsalo para mostrar detalles breves junto a un control, como los datos de un CUPS en una tabla de suministros.
- Puede llevar controles: un botón para copiar, un enlace a la ficha, un filtro pequeño.
- Ponle title: da nombre al panel para los lectores de pantalla.

**Qué evitar**

- Para un texto de ayuda de una línea usa Tooltip.
- Para formularios largos o decisiones que bloquean la pantalla usa Dialog o Drawer.
- Para una lista de acciones usa DropdownMenu.

**Accesibilidad**

- El disparador lleva aria-haspopup="dialog", aria-expanded y aria-controls.
- Al abrir, el foco pasa al primer control del panel. Escape y el clic fuera lo cierran y devuelven el foco al disparador.
- Con un trigger propio sin texto (IconButton), su label es el nombre del botón.

**Nota:** No es modal: la página sigue disponible. Al abrir, el foco pasa al primer control del panel (o al panel). Escape y el clic fuera lo cierran y devuelven el foco al disparador. Tab fuera del panel también lo cierra.

## ContextMenu

Las acciones de un registro con clic derecho, sin ocupar sitio en la pantalla.

**Cuándo usarlo**

- Úsalo para atajos sobre un registro o una tarjeta, como abrir la ficha o copiar el CUPS.
- Repite las mismas acciones en un sitio visible: un DropdownMenu o los botones de la ficha.
- Marca con danger las acciones destructivas y sepáralas con separator.

**Qué evitar**

- No escondas en él acciones que solo existen ahí: en móvil no hay clic derecho.
- No lo pongas sobre campos de texto: el usuario espera el menú del navegador.

**Accesibilidad**

- Mayúsculas + F10 o la tecla de menú lo abren con el foco en la zona o dentro de ella.
- Flechas, Home, End y la inicial mueven el foco; Escape cierra y devuelve el foco.
- Ponle label: nombra la zona enfocable y el menú.

**Nota:** Se abre en la posición del puntero o, con Mayúsculas + F10 o la tecla de menú, bajo el elemento con el foco. Siempre queda dentro de la ventana. Mismo teclado que DropdownMenu; Escape devuelve el foco.
