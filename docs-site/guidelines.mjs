// Guías de uso de cada componente: cuándo usarlo, qué evitar y accesibilidad.
// La web de documentación las muestra debajo de cada ejemplo (scripts/docs.mjs).
import { guidelines as maquetacionGuidelines } from './groups/maquetacion.docs.mjs'
import { guidelines as datosGuidelines } from './groups/datos.docs.mjs'
import { guidelines as graficosGuidelines } from './groups/graficos.docs.mjs'
import { guidelines as entradasGuidelines } from './groups/entradas.docs.mjs'
import { guidelines as superposicionesGuidelines } from './groups/superposiciones.docs.mjs'
import { guidelines as energiaGuidelines } from './groups/energia.docs.mjs'
import { guidelines as labsGuidelines } from './groups/labs.docs.mjs'
export const guidelines = {
  button: {
    use: [
      'Úsalo para acciones que cambian datos o abren algo, como guardar una oferta o crear una instalación.',
      'Pon un solo botón primary por zona. El resto, secondary o ghost.',
      'Usa danger (texto rojo, sin fondo) para una acción destructiva junto a otras, como eliminar un ticket.',
      'Usa destructive (rojo sólido) solo para confirmar el borrado dentro de AlertDialog.',
    ],
    avoid: [
      'Para ir a otra página usa un enlace con buttonClass() en lugar de Button.',
      'No uses destructive en el botón que abre la confirmación: ese es danger («Eliminar»), y destructive el que la confirma dentro del AlertDialog («Eliminar ticket»).',
      'Evita textos genéricos como «Aceptar». Nombra la acción, por ejemplo «Enviar oferta».',
      'No lo desactives para señalar errores. Deja enviar y muestra el error en Field.',
    ],
    a11y: [
      'Con iconOnly, ponle aria-label, por ejemplo «Eliminar documento».',
      'loading desactiva el botón y añade aria-busy. Mantén visible el texto de la acción.',
      'Por defecto es type="button". Para enviar un formulario pon type="submit".',
    ],
  },
  badge: {
    use: [
      'Úsalo para el estado corto de un registro, como Firmada, Legalizando o Vencida.',
      'Usa siempre el mismo tone para el mismo estado en todas las pantallas.',
    ],
    avoid: [
      'No lo uses como botón ni como filtro. Para filtros que se quitan usa FilterChip.',
      'Evita frases largas. Si el estado necesita explicación, usa Alert o Tooltip.',
    ],
    a11y: [
      'El color no se anuncia. El texto del Badge debe entenderse por sí solo.',
      'El icono es decorativo y se oculta a los lectores de pantalla.',
    ],
  },
  field: {
    use: [
      'Envuelve cada control en Field para conectar etiqueta, ayuda y error.',
      'Usa suffix para unidades como kWp o kWh, y prefix para €.',
      'Usa hint para explicar el formato o el origen del dato, como «Suma de los módulos».',
    ],
    avoid: [
      'No uses placeholder como etiqueta. Desaparece en cuanto se escribe.',
      'Para cantidades con decimales, como kWp o importes, usa NumberInput.',
    ],
    a11y: [
      'Field enlaza la etiqueta, aria-describedby y aria-invalid con el control.',
      'El asterisco de required se oculta a los lectores. El control recibe el atributo required.',
      'El error no se anuncia al aparecer. Al enviar, lleva el foco al primer campo con error.',
    ],
  },
  select: {
    use: [
      'Usa Select para elegir una opción de una lista corta y conocida, como el tipo de instalación.',
      'Usa Textarea para textos largos, como las indicaciones para el instalador.',
    ],
    avoid: [
      'Con muchas opciones, como clientes o municipios, usa Combobox.',
      'Si hay pocas opciones y conviene verlas todas, usa RadioGroup.',
      'Para elegir varias opciones a la vez usa MultiSelect.',
    ],
    a11y: [
      'Son controles nativos. El teclado y los lectores de pantalla funcionan sin trabajo extra.',
      'Ponlos dentro de Field para que tengan etiqueta, ayuda y error.',
    ],
  },
  switch: {
    use: [
      'Úsalo para preferencias que se aplican al momento, como la respuesta automática.',
      'Añade description cuando el efecto no sea evidente.',
    ],
    avoid: [
      'En formularios que se guardan con un botón usa Checkbox.',
      'Para elegir entre dos opciones con nombre propio usa SegmentedControl o RadioGroup.',
    ],
    a11y: [
      'Es un checkbox nativo con role="switch". Se cambia con Espacio.',
      'Sin label, ponle aria-label.',
      'description forma parte del nombre accesible. Que sea breve.',
    ],
  },
  card: {
    use: [
      'Úsala para agrupar datos de un mismo objeto, como el resumen de una instalación.',
      'Pon los datos en CardContent y las acciones en CardFooter.',
    ],
    avoid: [
      'No anides una Card dentro de otra. Separa las secciones con títulos o Accordion.',
      'Para muchos registros comparables usa Table o DataTable.',
    ],
    a11y: [
      'Ajusta el nivel de CardTitle con as (h2, h3 o h4) a la jerarquía de la página.',
      'Card no tiene rol ni nombre. Si toda la tarjeta lleva a una ficha, enlaza desde el título.',
    ],
  },
  table: {
    use: [
      'Úsala para datos comparables sin interacción, como el desglose de una oferta.',
      'Alinea las cifras con k5-num y envuelve la unidad de la cabecera en k5-unit.',
    ],
    avoid: ['Si necesitas ordenar, seleccionar o paginar, usa DataTable.', 'No la uses para maquetar contenido que no es tabular.'],
    a11y: [
      'Pasa caption para dar nombre a la tabla.',
      'Usa th en las cabeceras y añade scope="row" si la primera columna identifica la fila.',
      'El contenedor con scroll horizontal no recibe foco. Evita que las columnas clave queden fuera de vista.',
    ],
  },
  kpi: {
    use: [
      'Úsalo para las cifras clave de un panel, como instalaciones activas o días hasta legalizar.',
      'Indica con better si subir es bueno. En plazos de legalización, usa lower.',
      'Agrupa varios Kpi en KpiGroup.',
    ],
    avoid: ['Para ver la evolución en el tiempo usa BarChart.', 'Reserva tone danger para cifras que piden una acción.'],
    a11y: [
      'La flecha se oculta. Se anuncia «Sube», «Baja» o «Sin cambios» antes del porcentaje.',
      'Con selectable se pinta como botón con aria-pressed.',
      'KpiGroup se anuncia como «Indicadores». Cambia label si hay varios grupos en la página.',
    ],
  },
  'page-header': {
    use: ['Úsalo al principio de cada pantalla, con el título y las acciones principales.', 'Usa subtitle para dar contexto en una línea.'],
    avoid: [
      'No pongas más de dos o tres acciones. Lleva el resto a un DropdownMenu.',
      'Para mostrar la ruta dentro de la aplicación, añade Breadcrumbs encima.',
    ],
    a11y: ['Por defecto el título es un h1. Usa uno por página.', 'Usa as="h2" si la página ya tiene otro h1.'],
  },
  'empty-state': {
    use: [
      'Úsalo cuando una lista o un panel no tienen datos, como un buzón sin tickets pendientes.',
      'Explica el motivo y ofrece el siguiente paso con action.',
      'Usa compact dentro de una Card o en espacios pequeños.',
    ],
    avoid: ['Para un fallo al cargar usa Alert con tone danger.', 'Dentro de DataTable usa emptyLabel. Ya incluye su estado vacío.'],
    a11y: [
      'El icono es decorativo y el título es un párrafo, no un encabezado.',
      'No se anuncia solo. Si aparece tras filtrar, anuncia el resultado con role="status".',
    ],
  },
  spinner: {
    use: [
      'Úsalo para esperas cortas en una zona concreta, como al cargar una ficha.',
      'En un botón usa loading de Button, que ya incluye el spinner.',
    ],
    avoid: ['Si conoces la forma del contenido que llega, usa Skeleton.', 'Para subidas con progreso medible usa FileUpload con progress.'],
    a11y: [
      'Tiene role="status" y se anuncia «Cargando». Concreta con label, por ejemplo «Cargando instalaciones».',
      'Usa decorative si otro elemento ya anuncia la carga.',
    ],
  },
  avatar: {
    use: [
      'Úsalo para identificar a personas del equipo, como el técnico asignado a un ticket.',
      'Añade status para mostrar la disponibilidad en herramientas internas.',
    ],
    avoid: [
      'Para fotos u otras imágenes usa img con texto alternativo. Avatar solo muestra iniciales.',
      'No uses status para otros estados, como el de un ticket. Usa Badge.',
    ],
    a11y: [
      'Con name se anuncia como imagen con el nombre y el estado, como «Marta Ruiz · Disponible».',
      'Sin name queda oculto a los lectores de pantalla.',
    ],
  },
  'app-shell': {
    use: [
      'Úsalo como armazón de cada aplicación interna, con cabecera, navegación lateral y contenido.',
      'Pasa NavLink o RouterLink en la prop as de NavItem para integrar tu router.',
      'Pon AppSearch en search para abrir el buscador o CommandPalette.',
    ],
    avoid: [
      'No añadas otro main dentro. AppShell ya lo incluye.',
      'Si una pantalla no necesita barra lateral, omite sidebar en lugar de ocultarla con CSS.',
    ],
    a11y: [
      'Incluye el enlace «Saltar al contenido» hacia main. Si cambias mainId, que sea único.',
      'En móvil, Escape cierra el menú y devuelve el foco al botón Menú.',
      'Marca la página actual con active o con NavLink para que lleve aria-current="page".',
    ],
  },
  dialog: {
    use: [
      'Úsalo para editar o consultar algo sin perder la pantalla, como cambiar la fecha de una visita.',
      'Pon las acciones en footer, con la principal como Button primary.',
    ],
    avoid: [
      'Para confirmar acciones destructivas usa AlertDialog.',
      'Para fichas largas o paneles de detalle usa Drawer.',
      'No abras un Dialog desde otro Dialog.',
    ],
    a11y: [
      'Usa el dialog nativo con showModal(), que mantiene el foco dentro.',
      'Escape y el botón «Cerrar» lo cierran, y el foco vuelve al control que lo abrió.',
      'title es obligatorio y da nombre al diálogo.',
    ],
  },
  'alert-dialog': {
    use: [
      'Úsalo para confirmar acciones difíciles de deshacer, como eliminar una instalación o anular una oferta.',
      'Escribe el título como pregunta y repite la acción en el botón de confirmar.',
    ],
    avoid: ['Para acciones reversibles, ejecútalas y confirma con un Toast.', 'Para formularios o contenido largo usa Dialog.'],
    a11y: [
      'Tiene role="alertdialog" y no se cierra al pulsar fuera.',
      'Escape y el botón de cierre cancelan. Nunca ejecutan la confirmación.',
      'Explica las consecuencias en description, que se enlaza con aria-describedby.',
    ],
  },
  drawer: {
    use: [
      'Úsalo para abrir la ficha de un cliente o un ticket sin salir del listado.',
      'Úsalo también para filtros avanzados que no caben en FilterBar.',
      'Con modal en false, como vista previa: la persona pasa de una fila a otra y el panel cambia sin cerrarse.',
    ],
    avoid: [
      'Para una confirmación breve usa AlertDialog.',
      'No uses modal en false para formularios con cambios sin guardar: con la página viva, se pierden con un clic.',
      'Si el contenido necesita la pantalla entera, crea una página con su propia URL.',
    ],
    a11y: [
      'Funciona como Dialog. El foco queda dentro y vuelve al disparador al cerrar.',
      'Con modal en false no lleva aria-modal ni atrapa el foco: Tab sale a la página. Al cerrarlo con el foco dentro, vuelve al último control usado fuera del panel.',
      'title es obligatorio y nombra el panel.',
    ],
  },
  tabs: {
    use: [
      'Úsalo para vistas de un mismo objeto, como Resumen y Documentos de una instalación.',
      'Usa etiquetas cortas, de una o dos palabras.',
    ],
    avoid: [
      'Para los pasos de un proceso usa Stepper.',
      'Para cambiar el periodo de un gráfico usa SegmentedControl.',
      'Para navegar entre páginas usa Nav o enlaces.',
    ],
    a11y: [
      'label es obligatorio y nombra la lista de pestañas.',
      'Flechas izquierda y derecha, Home y End cambian de pestaña. Al recibir el foco, se selecciona.',
      'Solo la pestaña activa está en el orden de Tab. Las desactivadas se omiten.',
    ],
  },
  checkbox: {
    use: [
      'Úsalo para opciones independientes, como incluir batería o cargador.',
      'Usa indeterminate en un «Seleccionar todo» con selección parcial.',
    ],
    avoid: ['Para ajustes que se aplican al momento usa Switch.', 'Para una sola opción entre varias usa RadioGroup.'],
    a11y: ['Es un checkbox nativo. Se marca con Espacio.', 'indeterminate expone aria-checked="mixed".', 'Sin label, ponle aria-label.'],
  },
  'radio-group': {
    use: [
      'Úsalo para una opción entre pocas que conviene ver a la vez, como Solo placas o Placas y batería.',
      'Añade description si las opciones cambian el precio o el plazo.',
      'Usa variant="card" cuando cada opción necesita leerse entera, como tarifas o planes con su precio.',
    ],
    avoid: ['Con más de cinco opciones usa Select o Combobox.', 'Para cambiar una vista al momento usa SegmentedControl.'],
    a11y: [
      'Se pinta como fieldset con legend. label es obligatorio.',
      'Las flechas mueven la selección dentro del grupo, como en cualquier radio nativo.',
    ],
  },
  'dropdown-menu': {
    use: [
      'Úsalo para acciones secundarias de un registro, como editar, duplicar o eliminar.',
      'Marca con danger las acciones destructivas y sepáralas con separator.',
    ],
    avoid: ['Si una acción es frecuente, muéstrala como Button.', 'Para elegir un valor de formulario usa Select o Combobox.'],
    a11y: [
      'Flecha abajo o arriba sobre el botón abre el menú en la primera o en la última acción.',
      'Flechas, Home, End y la inicial mueven el foco. Las acciones desactivadas se omiten.',
      'Escape cierra y devuelve el foco al botón. Tab sale del menú.',
    ],
  },
  form: {
    use: [
      'Úsalo en cualquier formulario que se envía: ofertas, altas de cliente, datos de facturación.',
      'Pon ErrorSummary al principio y required en los campos obligatorios.',
      'Para los errores que devuelve el servidor, usa errors (React) o initial-errors (Vue).',
    ],
    avoid: [
      'No metas un Field dentro de FormField: FormField ya lleva el suyo.',
      'Para un buscador o un filtro que no se envía, usa los controles sueltos.',
      'No repitas en validate lo que ya comprueban NifInput, IbanInput, PhoneInput o TimePicker.',
    ],
    a11y: [
      'Cada error se enlaza con aria-describedby y marca el control con aria-invalid.',
      'Al enviar con errores, el foco va al primer campo y ErrorSummary se anuncia con role="alert".',
      'Cada enlace del resumen lleva a su campo y le da el foco.',
    ],
  },
  'error-summary': {
    use: [
      'Úsalo al principio de un formulario largo, para ver de un vistazo qué falta.',
      'Pon en label el nombre del campo: el mensaje solo no siempre se entiende fuera de su sitio.',
    ],
    avoid: [
      'Con react-hook-form o VeeValidate usa el de su adaptador, que se rellena solo.',
      'No lo enseñes antes de que se intente enviar.',
    ],
    a11y: [
      'Se anuncia con role="alert" al aparecer.',
      'Cada enlace lleva al control por su id y le da el foco; si es un grupo, a su primer control.',
    ],
  },
  toaster: {
    use: [
      "Úsalo para confirmar acciones desde cualquier parte de la app: toast.success('Oferta enviada').",
      'Usa toast.promise para guardar o enviar: el mismo aviso pasa de «Guardando…» al resultado.',
      'Pon un solo Toaster, junto a AppShell.',
    ],
    avoid: [
      'Para errores que piden corregir algo usa Alert o el error del campo; el aviso desaparece.',
      'Si el aviso lleva una acción importante, repítela en la pantalla: no todo el mundo llega a pulsarla.',
      'No subas max por encima de 3: más avisos a la vez tapan la pantalla.',
    ],
    a11y: [
      'La región «Notificaciones» siempre está en la página, así que los lectores de pantalla anuncian lo que entra.',
      'toast.error se anuncia con role="alert"; el resto, con aria-live="polite".',
      'El tiempo empieza cuando el aviso se ve y se pausa con el puntero o el foco dentro. Escape lo cierra.',
    ],
  },
  toast: {
    use: ['Úsalo para confirmar una acción ya hecha, como «Oferta enviada».', 'Usa tone success o info. Desaparece a los cinco segundos.'],
    avoid: [
      'Para errores que piden una acción usa Alert junto al contenido.',
      'Si incluye una acción, usa duration 0 o repite la acción en la pantalla.',
      'Para varios avisos seguidos no apiles Toast: usa toast() y Toaster, que llevan la cola.',
    ],
    a11y: [
      'Usa role="status" por defecto. Para fallos urgentes pasa role="alert".',
      'El tiempo se pausa con el puntero o el foco dentro.',
      'Con el foco dentro, Escape lo cierra. También tiene botón de cierre.',
    ],
  },
  alert: {
    use: [
      'Úsalo para avisos que deben quedarse visibles, como documentación pendiente de un expediente.',
      'Explica qué pasa y qué hacer. Añade action si hay un paso directo.',
    ],
    avoid: ['Para confirmaciones pasajeras usa Toast.', 'Para el error de un campo usa error en Field.'],
    a11y: [
      'Por defecto usa role="status". Reserva role="alert" para mensajes urgentes.',
      'Usa role="none" si el aviso está desde la carga y no hace falta anunciarlo.',
      'El icono es decorativo. El título debe transmitir el tono por sí solo.',
    ],
  },
  tooltip: {
    use: ['Úsalo para una aclaración breve junto a una etiqueta, como qué significa kWp.', 'Escribe content en una sola frase.'],
    avoid: [
      'No escondas en él información necesaria. Ponla en el hint de Field.',
      'Para contenido con enlaces o botones usa Dialog o Drawer.',
    ],
    a11y: [
      'Es su propio botón y label le da el nombre accesible.',
      'Se abre con el puntero, el foco o un clic. Escape lo descarta.',
      'Mientras está abierto, content se enlaza con aria-describedby.',
    ],
  },
  skeleton: {
    use: [
      'Úsalo mientras carga contenido de forma conocida, como una ficha o una lista.',
      'Imita el tamaño real para que la página no salte al llegar los datos.',
    ],
    avoid: ['Para esperas dentro de un botón usa loading de Button.', 'No lo dejes en pantalla si la carga falla. Muestra un Alert.'],
    a11y: [
      'Las piezas llevan aria-hidden. Pon role="status" y aria-label en el contenedor.',
      'La animación se desactiva con prefers-reduced-motion.',
    ],
  },
  combobox: {
    use: [
      'Úsalo para elegir un valor de una lista larga, como un cliente o un municipio.',
      'Añade keywords para encontrar opciones por otros datos, como el CUPS o el NIF.',
      'Usa onQueryChange y loading si las opciones llegan del servidor.',
      'Usa onCreate para listas que crecen con el uso, como etiquetas: se crea sin salir del campo.',
    ],
    avoid: [
      'Con pocas opciones usa Select o RadioGroup.',
      'No uses onCreate si crear necesita más datos que un nombre: abre un Dialog.',
      'Para elegir varias opciones usa MultiSelect.',
      'Para buscar acciones desde cualquier pantalla usa CommandPalette.',
    ],
    a11y: [
      'Necesita una etiqueta, con Field o con label.',
      'Flechas, Home y End recorren las opciones. Enter elige y Escape cancela la búsqueda.',
      'La opción activa se comunica con aria-activedescendant sin mover el foco.',
    ],
  },
  pagination: {
    use: ['Úsalo bajo listados largos que el servidor devuelve por páginas.', 'Mantén el mismo pageSize mientras la persona navega.'],
    avoid: ['DataTable ya incluye su paginación. No añadas otra.', 'Para listas cortas muestra todos los resultados.'],
    a11y: [
      'Es un nav llamado «Paginación» y anuncia el rango, como «1–10 de 128».',
      'La página actual lleva aria-current="page". Anterior y siguiente se desactivan en los extremos.',
    ],
  },
  'date-picker': {
    use: [
      'Úsalo para una fecha concreta en un formulario, como la fecha de instalación.',
      'Limita con min y max las fechas que no se pueden elegir.',
    ],
    avoid: [
      'Para un periodo con inicio y fin usa DateRangePicker.',
      'Si conviene ver el mes entero, por ejemplo para agendar visitas, usa Calendar.',
    ],
    a11y: [
      'Es el input date nativo. El teclado y lo que se anuncia dependen del navegador.',
      'Ponlo dentro de Field para que tenga etiqueta y error.',
    ],
  },
  'date-range-picker': {
    use: ['Úsalo para pedir o filtrar un periodo, como las instalaciones de octubre.', 'Fija min y max si el periodo tiene límites.'],
    avoid: ['Para una sola fecha usa DatePicker.', 'Si el periodo se elige mejor viendo el mes, usa Calendar con mode="range".'],
    a11y: [
      'Las dos fechas van en un fieldset y label es su leyenda.',
      'Los campos se llaman «Desde» y «Hasta».',
      'Un periodo invertido o fuera de límites se anuncia con role="alert".',
    ],
  },
  'file-upload': {
    use: [
      'Úsalo para adjuntar documentos, como el certificado de instalación o fotos del tejado.',
      'Fija accept y maxSize, y actualiza status y progress desde tu API.',
    ],
    avoid: [
      'No confíes solo en la validación del navegador. Repítela en el servidor.',
      'No dejes un archivo en uploading indefinidamente. Márcalo como success o error.',
    ],
    a11y: [
      'El botón «Seleccionar archivos» es la vía de teclado. Arrastrar es solo un atajo.',
      'Los errores de validación y de subida se anuncian con role="alert".',
      'Los botones de eliminar y reintentar incluyen el nombre del archivo.',
    ],
  },
  stepper: {
    use: ['Úsalo en procesos de varios pasos, como crear una oferta en tres pasos.', 'Valida cada paso en tu aplicación antes de avanzar.'],
    avoid: ['Para vistas que se recorren en cualquier orden usa Tabs.', 'Para el historial de un expediente usa Timeline.'],
    a11y: [
      'Es una lista ordenada y el paso actual lleva aria-current="step".',
      'Los pasos completados llevan un check y, para lectores de pantalla, el texto «completado».',
      'Con onValueChange los pasos son botones. Desactiva los que no se pueden visitar.',
    ],
  },
  timeline: {
    use: [
      'Úsalo para el historial de un expediente o un ticket, como llamadas, hitos y cambios de estado.',
      'Ordena los elementos antes de pasarlos. Se muestran tal como llegan.',
    ],
    avoid: ['Para los pasos pendientes de un proceso usa Stepper.', 'Para comparar muchos eventos por columnas usa DataTable.'],
    a11y: [
      'Es una lista ordenada llamada «Historial». Cámbialo con label.',
      'Pasa dateTime en formato ISO para que el elemento time sea legible por máquina.',
      'El color de tone no se anuncia. Nombra el estado en title.',
    ],
  },
  'filter-bar': {
    use: [
      'Úsalo encima de un listado para buscar y ver los filtros activos.',
      'Añade otros controles, como Select o MultiSelect, como hijos.',
      'Pasa los filtros en partes (campo, operador, valores) para que se lean como una frase y cada parte se pueda cambiar sin quitar el filtro.',
    ],
    avoid: ['Para buscar en toda la aplicación usa CommandPalette.', 'Muestra solo los filtros activos, uno por FilterChip.'],
    a11y: [
      'Es una región role="search" y el buscador usa label como nombre.',
      'Cada chip tiene un botón «Quitar filtro» con su etiqueta. Al quitarlo, el foco vuelve al buscador.',
      'Un filtro en partes es un grupo (role="group") con la frase entera como nombre; cada parte editable es un botón con su texto.',
      'El número de resultados no se anuncia. Hazlo con role="status" en tu listado.',
    ],
  },
  'data-table': {
    use: [
      'Úsalo para listados que se ordenan, seleccionan o paginan, como instalaciones u ofertas.',
      'Marca numeric en las columnas de kWp o importes.',
      'Usa loading, error y emptyLabel para los estados de respuesta.',
      'Usa groupBy para leer un listado por estado o por responsable sin filtrarlo. Ordena rows por grupo para fijar el orden de los grupos.',
    ],
    avoid: [
      'Con cientos de filas o más no las cargues todas: usa manual y pide cada página al servidor.',
      'Para pocas filas sin interacción usa Table.',
    ],
    a11y: [
      'caption es obligatorio y nombra la tabla.',
      'La columna ordenada lleva aria-sort y la selección se anuncia con role="status".',
      'Cada casilla se llama «Seleccionar fila» seguida del rowKey. Usa una clave legible, como la referencia.',
      'Cada grupo es un <tbody> con su título en <th scope="rowgroup">, un botón con aria-expanded que lo pliega.',
    ],
  },
  accordion: {
    use: [
      'Úsalo para contenido secundario de una ficha, como la documentación o los plazos.',
      'Activa multiple si hace falta comparar secciones abiertas.',
    ],
    avoid: ['No escondas datos que se consultan siempre. Déjalos a la vista.', 'Para vistas paralelas del mismo objeto usa Tabs.'],
    a11y: [
      'Cada título es un h3 con un botón. Colócalo bajo un h2.',
      'El botón indica aria-expanded y el panel es una región con su nombre.',
      'Tab, Enter y Espacio funcionan como en cualquier botón.',
    ],
  },
  breadcrumbs: {
    use: ['Úsalo en páginas de detalle con niveles, como Instalaciones > Lucía Fernández.', 'Pon el elemento actual al final y sin href.'],
    avoid: ['En pantallas de primer nivel no hace falta. Basta con Nav.', 'Para los pasos de un proceso usa Stepper.'],
    a11y: [
      'Es un nav llamado «Ruta de navegación».',
      'El último elemento lleva aria-current="page" y no es un enlace.',
      'Los separadores son decorativos y no se anuncian.',
    ],
  },
  'number-input': {
    use: [
      'Úsalo para cantidades como la potencia en kWp, el consumo en kWh o un importe en €.',
      'Acepta la coma decimal («8,4») y devuelve un número (8.4).',
      'Con name, el formulario envía el valor de máquina en un campo oculto.',
    ],
    avoid: [
      'Para códigos como el CUPS, el código postal o el teléfono usa Input.',
      'Para elegir entre unos pocos valores fijos usa Select o SegmentedControl.',
    ],
    a11y: [
      'Tiene role="spinbutton" y anuncia el valor con la unidad cuando suffix es texto.',
      'Flechas mueven un paso; con Mayús, Re Pág o Av Pág, diez. Home y End van a min y max.',
      'Los botones − y + quedan fuera del orden de Tab. El teclado usa las flechas.',
    ],
  },
  'segmented-control': {
    use: [
      'Úsalo para cambiar una vista al momento entre dos y cinco opciones, como Día, Semana, Mes y Año.',
      'Usa block para repartir las opciones en todo el ancho.',
    ],
    avoid: [
      'Con más de cinco opciones usa Select o Combobox.',
      'Para paneles de contenido distintos usa Tabs.',
      'Si las opciones necesitan descripción, usa RadioGroup.',
    ],
    a11y: [
      'label es obligatorio y nombra el grupo, por ejemplo «Periodo».',
      'Es un radiogroup con un solo punto de Tab. Flechas, Home y End mueven y seleccionan.',
      'Las opciones desactivadas se omiten al moverte con el teclado.',
    ],
  },
  'multi-select': {
    use: [
      'Úsalo para elegir varias opciones de una lista larga, como provincias o instaladores.',
      'Con name, el formulario envía un campo por cada valor elegido.',
    ],
    avoid: ['Para una sola opción usa Combobox.', 'Con pocas opciones que conviene ver a la vez, usa varios Checkbox.'],
    a11y: [
      'Necesita una etiqueta, con Field o con label.',
      'Enter marca o desmarca la opción activa y la lista sigue abierta. Escape la cierra.',
      'Cada chip tiene un botón «Quitar» con su nombre. Retroceso con la búsqueda vacía quita el último.',
    ],
  },
  calendar: {
    use: [
      'Úsalo para elegir una fecha o un periodo viendo el mes, como al agendar una visita técnica.',
      'Ponlo dentro de una Card, un Drawer o un Dialog. Usa plain para quitarle el borde.',
      'Con mode="range", el primer clic marca el inicio y el segundo el final.',
    ],
    avoid: [
      'En un formulario con una sola fecha usa DatePicker, que ocupa menos.',
      'Si las fechas del periodo se conocen y basta con escribirlas, usa DateRangePicker.',
    ],
    a11y: [
      'Es una tabla role="grid" con un solo punto de Tab. Cada día anuncia su fecha completa.',
      'Flechas recorren días y semanas, Re Pág y Av Pág meses (con Mayús, años), Home y End la semana.',
      'Con mode="range" la rejilla es de selección múltiple y todos los días del periodo constan como seleccionados.',
    ],
  },
  'command-palette': {
    use: [
      'Úsalo para ir rápido a acciones y registros, como «Nueva oferta» o un ticket concreto.',
      'Ábrelo desde AppSearch y muestra el atajo ⌘K con su prop shortcut.',
      'Agrupa los resultados, por ejemplo en Acciones, Clientes e Instalaciones.',
    ],
    avoid: [
      'Para filtrar el listado de la pantalla usa FilterBar.',
      'Para elegir un valor en un formulario usa Combobox.',
      'No lo conviertas en la única vía para una acción. Mantenla también en la interfaz.',
    ],
    a11y: [
      'Usa un dialog modal nativo. Escape lo cierra y el foco vuelve a donde estaba.',
      'Flecha arriba y abajo recorren los resultados. Enter llama a onSelect y cierra.',
      'Si cambias hotkey, evita atajos que ya usen el navegador o el lector de pantalla.',
    ],
  },
  'bar-chart': {
    use: [
      'Úsalo para comparar cantidades por periodo, como los kWh generados cada mes.',
      'Usa stacked para ver las partes de un total, como autoconsumo y excedentes.',
      'Indica siempre unit y title.',
    ],
    avoid: [
      'Con más de cinco series los colores se repiten. Agrupa series o usa DataTable.',
      'No sirve para valores negativos. Las barras se recortan a cero.',
      'Para un único dato con su variación usa Kpi.',
    ],
    a11y: [
      'Se recorre con las flechas, Inicio y Fin, y cada dato se anuncia. Los datos están además en una tabla oculta.',
      'title nombra esa tabla y categoryLabel da cabecera a la columna de categorías.',
      'Con varias series aparece la leyenda. No la desactives con legend.',
    ],
  },
}

// Componentes de 0.3, por grupo.
Object.assign(
  guidelines,
  maquetacionGuidelines,
  datosGuidelines,
  graficosGuidelines,
  entradasGuidelines,
  superposicionesGuidelines,
  energiaGuidelines,
  labsGuidelines,
)
