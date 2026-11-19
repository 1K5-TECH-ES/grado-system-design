# Guías de uso: Formularios

Generado por `npm run skill` desde las guías de la web de documentación. Cuándo usar cada componente, qué evitar y qué cuidar de accesibilidad. Las props exactas están en los tipos instalados.

Componentes: Field & Input · Select & Textarea · Switch · Checkbox · RadioGroup · Form, FormField · ErrorSummary · Combobox · DatePicker · DateRangePicker · FileUpload · NumberInput · SegmentedControl · MultiSelect · Calendar · Tag · SearchInput · PasswordInput · Slider · TimePicker · PhoneInput · NifInput · IbanInput · AddressInput

## Field & Input

Etiqueta, ayuda y validación conectadas automáticamente con el control.

**Cuándo usarlo**

- Envuelve cada control en Field para conectar etiqueta, ayuda y error.
- Usa suffix para unidades como kWp o kWh, y prefix para €.
- Usa hint para explicar el formato o el origen del dato, como «Suma de los módulos».

**Qué evitar**

- No uses placeholder como etiqueta. Desaparece en cuanto se escribe.
- Para cantidades con decimales, como kWp o importes, usa NumberInput.

**Accesibilidad**

- Field enlaza la etiqueta, aria-describedby y aria-invalid con el control.
- El asterisco de required se oculta a los lectores. El control recibe el atributo required.
- El error no se anuncia al aparecer. Al enviar, lleva el foco al primer campo con error.

**Nota:** Field enlaza id, aria-describedby, aria-invalid y required. En Vue, v-model devuelve texto: convierte los valores numéricos en tu aplicación.

## Select & Textarea

Controles nativos para elegir una opción o escribir con más espacio.

**Cuándo usarlo**

- Usa Select para elegir una opción de una lista corta y conocida, como el tipo de instalación.
- Usa Textarea para textos largos, como las indicaciones para el instalador.

**Qué evitar**

- Con muchas opciones, como clientes o municipios, usa Combobox.
- Si hay pocas opciones y conviene verlas todas, usa RadioGroup.
- Para elegir varias opciones a la vez usa MultiSelect.

**Accesibilidad**

- Son controles nativos. El teclado y los lectores de pantalla funcionan sin trabajo extra.
- Ponlos dentro de Field para que tengan etiqueta, ayuda y error.

## Switch

Una preferencia binaria con contexto suficiente para decidir.

**Cuándo usarlo**

- Úsalo para preferencias que se aplican al momento, como la respuesta automática.
- Añade description cuando el efecto no sea evidente.

**Qué evitar**

- En formularios que se guardan con un botón usa Checkbox.
- Para elegir entre dos opciones con nombre propio usa SegmentedControl o RadioGroup.

**Accesibilidad**

- Es un checkbox nativo con role="switch". Se cambia con Espacio.
- Sin label, ponle aria-label.
- description forma parte del nombre accesible. Que sea breve.

## Checkbox

Selección independiente con etiqueta, ayuda y estado intermedio.

**Cuándo usarlo**

- Úsalo para opciones independientes, como incluir batería o cargador.
- Usa indeterminate en un «Seleccionar todo» con selección parcial.

**Qué evitar**

- Para ajustes que se aplican al momento usa Switch.
- Para una sola opción entre varias usa RadioGroup.

**Accesibilidad**

- Es un checkbox nativo. Se marca con Espacio.
- indeterminate expone aria-checked="mixed".
- Sin label, ponle aria-label.

**Nota:** Hereda los atributos de Field. React reenvía ref. En Vue se expone focus() y la referencia input.

## RadioGroup

Elige una sola alternativa con controles nativos y una etiqueta de grupo.

**Cuándo usarlo**

- Úsalo para una opción entre pocas que conviene ver a la vez, como Solo placas o Placas y batería.
- Añade description si las opciones cambian el precio o el plazo.

**Qué evitar**

- Con más de cinco opciones usa Select o Combobox.
- Para cambiar una vista al momento usa SegmentedControl.

**Accesibilidad**

- Se pinta como fieldset con legend. label es obligatorio.
- Las flechas mueven la selección dentro del grupo, como en cualquier radio nativo.

## Form, FormField

Formularios con react-hook-form o VeeValidate: cada campo con su etiqueta, su error y su validación, y un resumen de errores al enviar.

**Cuándo usarlo**

- Úsalo en cualquier formulario que se envía: ofertas, altas de cliente, datos de facturación.
- Pon ErrorSummary al principio y required en los campos obligatorios.
- Para los errores que devuelve el servidor, usa errors (React) o initial-errors (Vue).

**Qué evitar**

- No metas un Field dentro de FormField: FormField ya lleva el suyo.
- Para un buscador o un filtro que no se envía, usa los controles sueltos.
- No repitas en validate lo que ya comprueban NifInput, IbanInput, PhoneInput o TimePicker.

**Accesibilidad**

- Cada error se enlaza con aria-describedby y marca el control con aria-invalid.
- Al enviar con errores, el foco va al primer campo y ErrorSummary se anuncia con role="alert".
- Cada enlace del resumen lleva a su campo y le da el foco.

**Nota:** react-hook-form y vee-validate son dependencias opcionales: solo las cargan estos imports. FormField conecta su control (value, checked o v-model, según el tipo) y le pone id, ref y aria-invalid. NifInput, IbanInput, PhoneInput y TimePicker validan su formato solos. Se valida al enviar y, después, en cada cambio; el foco va al primer campo con error.

## ErrorSummary

La lista de errores de un formulario, con un enlace a cada campo.

**Cuándo usarlo**

- Úsalo al principio de un formulario largo, para ver de un vistazo qué falta.
- Pon en label el nombre del campo: el mensaje solo no siempre se entiende fuera de su sitio.

**Qué evitar**

- Con react-hook-form o VeeValidate usa el de su adaptador, que se rellena solo.
- No lo enseñes antes de que se intente enviar.

**Accesibilidad**

- Se anuncia con role="alert" al aparecer.
- Cada enlace lleva al control por su id y le da el foco; si es un grupo, a su primer control.

**Nota:** Sin errores no pinta nada. Con react-hook-form o VeeValidate usa el ErrorSummary de su adaptador, que se rellena solo; este sirve para cualquier otra validación.

## Combobox

Busca una opción por nombre y confirma una selección con teclado o ratón.

**Cuándo usarlo**

- Úsalo para elegir un valor de una lista larga, como un cliente o un municipio.
- Añade keywords para encontrar opciones por otros datos, como el CUPS o el NIF.
- Usa onQueryChange y loading si las opciones llegan del servidor.

**Qué evitar**

- Con pocas opciones usa Select o RadioGroup.
- Para elegir varias opciones usa MultiSelect.
- Para buscar acciones desde cualquier pantalla usa CommandPalette.

**Accesibilidad**

- Necesita una etiqueta, con Field o con label.
- Flechas, Home y End recorren las opciones. Enter elige y Escape cancela la búsqueda.
- La opción activa se comunica con aria-activedescendant sin mover el foco.

**Nota:** Selección única. Filtra sin distinguir tildes. Flechas recorren opciones; Enter selecciona y Escape cancela la búsqueda. La consulta a un servidor la gestiona la aplicación.

## DatePicker

Selector de fecha nativo con los estilos y la validación de Field.

**Cuándo usarlo**

- Úsalo para una fecha concreta en un formulario, como la fecha de instalación.
- Limita con min y max las fechas que no se pueden elegir.

**Qué evitar**

- Para un periodo con inicio y fin usa DateRangePicker.
- Si conviene ver el mes entero, por ejemplo para agendar visitas, usa Calendar.

**Accesibilidad**

- Es el input date nativo. El teclado y lo que se anuncia dependen del navegador.
- Ponlo dentro de Field para que tenga etiqueta y error.

**Nota:** La ventana del calendario la proporciona el navegador y puede variar entre dispositivos. El control mantiene los tokens de Grado.

## DateRangePicker

Dos fechas relacionadas con límites coherentes y validación del periodo.

**Cuándo usarlo**

- Úsalo para pedir o filtrar un periodo, como las instalaciones de octubre.
- Fija min y max si el periodo tiene límites.

**Qué evitar**

- Para una sola fecha usa DatePicker.
- Si el periodo se elige mejor viendo el mes, usa Calendar con mode="range".

**Accesibilidad**

- Las dos fechas van en un fieldset y label es su leyenda.
- Los campos se llaman «Desde» y «Hasta».
- Un periodo invertido o fuera de límites se anuncia con role="alert".

**Nota:** Muestra un error si el rango recibido está invertido o fuera de los límites. Mantiene los valores para que la persona pueda corregirlos.

## FileUpload

Selecciona o arrastra archivos y muestra su progreso, errores y reintentos.

**Cuándo usarlo**

- Úsalo para adjuntar documentos, como el certificado de instalación o fotos del tejado.
- Fija accept y maxSize, y actualiza status y progress desde tu API.

**Qué evitar**

- No confíes solo en la validación del navegador. Repítela en el servidor.
- No dejes un archivo en uploading indefinidamente. Márcalo como success o error.

**Accesibilidad**

- El botón «Seleccionar archivos» es la vía de teclado. Arrastrar es solo un atajo.
- Los errores de validación y de subida se anuncian con role="alert".
- Los botones de eliminar y reintentar incluyen el nombre del archivo.

**Nota:** Selecciona archivos; no realiza subidas por su cuenta. Conecta tu API y actualiza status (uploading, success, error) y progress (0–100). La validación del navegador debe repetirse en el servidor.

## NumberInput

Cifras con coma decimal, unidad y botones de menos y más. Devuelve un número, no texto.

**Cuándo usarlo**

- Úsalo para cantidades como la potencia en kWp, el consumo en kWh o un importe en €.
- Acepta la coma decimal («8,4») y devuelve un número (8.4).
- Con name, el formulario envía el valor de máquina en un campo oculto.

**Qué evitar**

- Para códigos como el CUPS, el código postal o el teléfono usa Input.
- Para elegir entre unos pocos valores fijos usa Select o SegmentedControl.

**Accesibilidad**

- Tiene role="spinbutton" y anuncia el valor con la unidad cuando suffix es texto.
- Flechas mueven un paso; con Mayús, Re Pág o Av Pág, diez. Home y End van a min y max.
- Los botones − y + quedan fuera del orden de Tab. El teclado usa las flechas.

**Nota:** Entiende «8,4», «8.4» y «1.234,5». Mientras escribes conserva tu texto; al salir lo formatea y lo ajusta a min y max. Flechas: un paso (con Mayúsculas, diez). Re Pág y Av Pág: diez pasos. Inicio y Fin: mínimo y máximo.

## SegmentedControl

Una opción entre pocas que cambia la vista al momento: día, semana, mes.

**Cuándo usarlo**

- Úsalo para cambiar una vista al momento entre dos y cinco opciones, como Día, Semana, Mes y Año.
- Usa block para repartir las opciones en todo el ancho.

**Qué evitar**

- Con más de cinco opciones usa Select o Combobox.
- Para paneles de contenido distintos usa Tabs.
- Si las opciones necesitan descripción, usa RadioGroup.

**Accesibilidad**

- label es obligatorio y nombra el grupo, por ejemplo «Periodo».
- Es un radiogroup con un solo punto de Tab. Flechas, Home y End mueven y seleccionan.
- Las opciones desactivadas se omiten al moverte con el teclado.

**Nota:** Es un grupo de radios: una sola parada de tabulador y las flechas cambian la opción. Para más de cinco opciones usa Select.

## MultiSelect

Varias opciones con búsqueda, visibles como chips dentro del campo.

**Cuándo usarlo**

- Úsalo para elegir varias opciones de una lista larga, como provincias o instaladores.
- Con name, el formulario envía un campo por cada valor elegido.

**Qué evitar**

- Para una sola opción usa Combobox.
- Con pocas opciones que conviene ver a la vez, usa varios Checkbox.

**Accesibilidad**

- Necesita una etiqueta, con Field o con label.
- Enter marca o desmarca la opción activa y la lista sigue abierta. Escape la cierra.
- Cada chip tiene un botón «Quitar» con su nombre. Retroceso con la búsqueda vacía quita el último.

**Nota:** Enter marca o desmarca la opción activa y la lista sigue abierta. Retroceso con el buscador vacío quita la última. Cada chip tiene su botón para quitarla.

## Calendar

Un mes para elegir una fecha o un periodo, igual en todos los navegadores.

**Cuándo usarlo**

- Úsalo para elegir una fecha o un periodo viendo el mes, como al agendar una visita técnica.
- Ponlo dentro de una Card, un Drawer o un Dialog. Usa plain para quitarle el borde.
- Con mode="range", el primer clic marca el inicio y el segundo el final.

**Qué evitar**

- En un formulario con una sola fecha usa DatePicker, que ocupa menos.
- Si las fechas del periodo se conocen y basta con escribirlas, usa DateRangePicker.

**Accesibilidad**

- Es una tabla role="grid" con un solo punto de Tab. Cada día anuncia su fecha completa.
- Flechas recorren días y semanas, Re Pág y Av Pág meses (con Mayús, años), Home y End la semana.
- Con mode="range" la rejilla es de selección múltiple y todos los días del periodo constan como seleccionados.

**Nota:** Se muestra en la página: ponlo en una Card, un Drawer o un Dialog. Flechas: días y semanas. Re Pág y Av Pág: meses; con Mayúsculas, años. Inicio y Fin: principio y final de la semana.

## Tag

Una etiqueta que se puede quitar, como una provincia de una zona de trabajo.

**Cuándo usarlo**

- Úsalo para valores que se añaden y se quitan, como las provincias de una zona o las etiquetas de un cliente.
- Agrupa varios Tag en una fila con espacio entre ellos.

**Qué evitar**

- Para un estado que solo informa usa Badge o Status.
- Para filtros activos de una lista usa FilterChip dentro de FilterBar.
- No lo uses como botón ni como enlace.

**Accesibilidad**

- El botón de quitar se llama «Quitar {label}». Si el contenido no es texto, pasa label o removeLabel.
- Al quitar una etiqueta el foco pasa a la vecina. Si era la única, lleva el foco al campo que añade etiquetas.

**Nota:** Al quitar una etiqueta, el foco pasa al botón de quitar de la siguiente (o de la anterior si era la última) del mismo contenedor.

## SearchInput

Búsqueda con lupa, botón para borrar y estado de carga. Escape también borra.

**Cuándo usarlo**

- Úsalo para filtrar una lista o una tabla mientras se escribe: clientes, instalaciones, tickets.
- Pon loading mientras llegan los resultados del servidor.
- Para buscar y elegir un único registro de una lista usa Combobox.

**Qué evitar**

- Para la búsqueda global de la aplicación usa AppSearch o CommandPalette.
- No lo uses para campos que se envían con el formulario, como un nombre o una dirección.

**Accesibilidad**

- Necesita una etiqueta: con Field o con label. Sin ninguna se llama «Buscar».
- El botón de borrar tiene nombre («Borrar búsqueda») y devuelve el foco al campo.
- Escape borra el texto; con el campo vacío no hace nada y deja que la tecla llegue al diálogo.

**Nota:** Es un input type="search". Escape borra el texto y deja el foco en el campo; si ya está vacío, Escape sigue su camino (por ejemplo, cierra el diálogo).

## PasswordInput

Contraseña con un botón para mostrarla u ocultarla.

**Cuándo usarlo**

- Úsalo en el acceso al portal del cliente y al crear o cambiar una contraseña.
- Pon autoComplete="new-password" al crearla, para que el gestor de contraseñas proponga una.

**Qué evitar**

- No lo uses para códigos que no son secretos, como el CUPS o un número de pedido.
- No muestres la contraseña por defecto.

**Accesibilidad**

- El botón es un conmutador con aria-pressed y un nombre que no cambia, «Mostrar contraseña».
- Con la contraseña visible, la pista al pasar el ratón dice «Ocultar contraseña».
- El foco se queda en el botón al pulsarlo.

**Nota:** El botón es un conmutador con aria-pressed y nombre fijo, «Mostrar contraseña»: pulsado significa que se ve. El campo vuelve a type="password" al pulsarlo de nuevo.

## Slider

Un valor dentro de un rango, como la potencia de una instalación, con el input range nativo.

**Cuándo usarlo**

- Úsalo para valores aproximados dentro de un rango corto: la potencia estimada, un porcentaje de autoconsumo.
- Activa showValue para ver el valor exacto mientras se arrastra.
- Añade marcas en los extremos y en uno o dos valores de referencia.

**Qué evitar**

- Para cifras exactas (8,45 kWp, un importe) usa NumberInput.
- No lo uses con rangos muy amplios o pasos muy finos: se vuelve impreciso con el ratón.

**Accesibilidad**

- Es el input range nativo: flechas, Re Pág, Av Pág, Inicio y Fin funcionan sin código.
- aria-valuetext anuncia el valor con su unidad y en formato es-ES: «6,5 kWp».
- El foco se ve como un anillo alrededor del tirador. El valor visible y las marcas no se leen dos veces.

**Nota:** Flechas: un paso. Re Pág y Av Pág: un salto mayor. Inicio y Fin: mínimo y máximo. El valor se anuncia con aria-valuetext («6,5 kWp»). El único estilo en línea es la variable --_fill, la fracción rellena de la pista.

## TimePicker

Hora «HH:MM» escrita a mano o elegida en una lista de franjas.

**Cuándo usarlo**

- Úsalo para citas y franjas: la visita técnica, la instalación, una llamada.
- Ajusta min, max y step al horario real del equipo.
- Combínalo con DatePicker para elegir día y hora.

**Qué evitar**

- Para duraciones (2 h 30 min) usa NumberInput con su unidad.
- No lo uses para fechas con hora en un solo campo.

**Accesibilidad**

- Es un combobox: flechas, Inicio y Fin recorren las franjas, Enter elige y Escape cierra.
- La franja activa se anuncia con aria-activedescendant sin mover el foco.
- El error de formato o de rango queda enlazado con aria-describedby y se anuncia al salir.

**Nota:** Acepta «9», «930», «9:30» y «09.30», y al salir normaliza a «09:30». Al abrir la lista, la franja más cercana a la hora escrita queda activa. Flechas, Inicio y Fin recorren las franjas, Enter elige y Escape cierra. El mensaje de error se muestra bajo el campo al salir de él (o desde el principio si ya traía un valor) y queda enlazado con aria-describedby y aria-invalid. Mientras se corrige, se actualiza al escribir.

## PhoneInput

Teléfono con prefijo de país. Agrupa las cifras al escribir y devuelve E.164.

**Cuándo usarlo**

- Úsalo en los datos de contacto del cliente y guarda el valor en E.164.
- Limita countries a los países con los que trabajáis.

**Qué evitar**

- No guardes el número formateado con espacios: usa el valor E.164 que devuelve.
- Para números fuera de la lista de países usa Input con type="tel".

**Accesibilidad**

- El selector de país tiene su propio nombre, «Prefijo del país».
- El campo usa type="tel" y autocomplete="tel-national" para el teclado y el autorrelleno.
- El error dice qué falla («Un teléfono español tiene 9 cifras.») y queda enlazado al campo.

**Nota:** Un teléfono español tiene 9 cifras y empieza por 6 o 7 (móvil) o por 8 o 9 (fijo); para el resto de países se comprueba una longitud razonable. Si se pega un número con «+351» o «0033», el selector cambia de país. El mensaje de error se muestra bajo el campo al salir de él (o desde el principio si ya traía un valor) y queda enlazado con aria-describedby y aria-invalid. Mientras se corrige, se actualiza al escribir.

## NifInput

DNI, NIE o CIF en mayúsculas, con la letra o el dígito de control comprobado.

**Cuándo usarlo**

- Úsalo para el NIF del titular del contrato, de particulares (DNI, NIE) o de empresas (CIF).
- Con onErrorChange puedes bloquear el envío mientras el NIF no sea válido.

**Qué evitar**

- No lo uses para identificadores de otros países: el control es el español.
- No muestres el error mientras se escribe por primera vez: el componente ya espera a que se salga del campo.

**Accesibilidad**

- Los errores son concretos: dicen si falla la forma o la letra de control.
- El error se enlaza con aria-describedby y el campo se marca con aria-invalid.
- Acepta minúsculas, espacios y guiones al escribir o pegar; los quita sin mover el cursor.

**Nota:** DNI: letra de control con el módulo 23. NIE: X, Y o Z valen 0, 1 o 2 y se calcula igual. CIF: dígito o letra de control según el tipo de entidad. Los errores dicen qué falla: «La letra del DNI no coincide», «El CIF tiene una letra, 7 cifras y un carácter de control»… La lógica está en @1k5-tech-es/grado/patterns (normalizeNif, nifError, isValidNif). El mensaje de error se muestra bajo el campo al salir de él (o desde el principio si ya traía un valor) y queda enlazado con aria-describedby y aria-invalid. Mientras se corrige, se actualiza al escribir.

## IbanInput

IBAN agrupado de cuatro en cuatro, con la longitud del país y el control módulo 97.

**Cuándo usarlo**

- Úsalo para la cuenta de domiciliación de las cuotas o de la compensación de excedentes.
- Guarda el valor sin espacios que devuelve; los grupos de cuatro son solo para leerlo.

**Qué evitar**

- No pidas el IBAN en varios campos (entidad, oficina, cuenta): se pega entero.
- No lo uses para validar números de tarjeta.

**Accesibilidad**

- El cursor se queda detrás de la misma cifra al reformatear, también al editar en medio.
- El error dice si falla la longitud del país o los dígitos de control.
- Desactiva el corrector y pone las letras en mayúsculas.

**Nota:** Se ve como «ES91 2100 0418 4502 0005 1332» y el cursor se queda en su sitio al reformatear. Comprueba la longitud de cada país (24 en España) y los dígitos de control. La lógica está en @1k5-tech-es/grado/patterns (formatIban, ibanError, isValidIban). El mensaje de error se muestra bajo el campo al salir de él (o desde el principio si ya traía un valor) y queda enlazado con aria-describedby y aria-invalid. Mientras se corrige, se actualiza al escribir.

## AddressInput

Dirección con autocompletado asíncrono. Sin proveedor incluido: pasa tu función suggest.

**Cuándo usarlo**

- Úsalo para la dirección de la instalación o de facturación, con el proveedor que ya uséis (CartoCiudad, Catastro, Google Places).
- Devuelve en value la calle, el código postal, el municipio, la provincia y, si la hay, la referencia catastral.
- Usa onQueryChange para guardar el texto si el cliente no encuentra su dirección.

**Qué evitar**

- Para elegir entre una lista cerrada y ya cargada usa Combobox.
- No hagas la búsqueda en cada tecla sin debounce: el componente ya espera 250 ms.

**Accesibilidad**

- Es un combobox con lista: flechas, Inicio y Fin recorren las sugerencias, Enter elige y Escape cancela.
- Mientras busca, el campo lleva aria-busy y la lista dice «Cargando…».
- Cada sugerencia lee la calle y, debajo, el código postal y el municipio.

**Nota:** Se comporta como Combobox: flechas, Inicio y Fin recorren las sugerencias, Enter elige y Escape cancela. Si el usuario sigue escribiendo, la respuesta de una búsqueda anterior que llega tarde se descarta. Muestra «Cargando…», «Escribe al menos 3 caracteres.», «No hay resultados» o «No se pudieron cargar las direcciones.» según el caso.
