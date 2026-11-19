# Guías de uso: Datos

Generado por `npm run skill` desde las guías de la web de documentación. Cuándo usar cada componente, qué evitar y qué cuidar de accesibilidad. Las props exactas están en los tipos instalados.

Componentes: Badge · Table · Kpi · Avatar · Timeline · FilterBar & FilterChip · DataTable · BarChart · Status · DescriptionList · AvatarGroup · Sparkline · LineChart · Donut · Meter · EnergyFlow · PriceChart · BatteryLevel · Heatmap

## Badge

Estados que se entienden de un vistazo, siempre acompañados de una etiqueta.

**Cuándo usarlo**

- Úsalo para el estado corto de un registro, como Firmada, Legalizando o Vencida.
- Usa siempre el mismo tone para el mismo estado en todas las pantallas.

**Qué evitar**

- No lo uses como botón ni como filtro. Para filtros que se quitan usa FilterChip.
- Evita frases largas. Si el estado necesita explicación, usa Alert o Tooltip.

**Accesibilidad**

- El color no se anuncia. El texto del Badge debe entenderse por sí solo.
- El icono es decorativo y se oculta a los lectores de pantalla.

## Table

Datos comparables en una tabla semántica con desplazamiento horizontal.

**Cuándo usarlo**

- Úsala para datos comparables sin interacción, como el desglose de una oferta.
- Alinea las cifras con k5-num y envuelve la unidad de la cabecera en k5-unit.

**Qué evitar**

- Si necesitas ordenar, seleccionar o paginar, usa DataTable.
- No la uses para maquetar contenido que no es tabular.

**Accesibilidad**

- Pasa caption para dar nombre a la tabla.
- Usa th en las cabeceras y añade scope="row" si la primera columna identifica la fila.
- El contenedor con scroll horizontal no recibe foco. Evita que las columnas clave queden fuera de vista.

**Nota:** El componente aporta estructura y estilos. La ordenación, paginación y selección de filas pertenecen a tu aplicación. Para el estado de cada fila, Status (punto y texto) es más discreto que Badge.

## Kpi

El dato y su evolución. Tú defines si subir o bajar es una buena noticia.

**Cuándo usarlo**

- Úsalo para las cifras clave de un panel, como instalaciones activas o días hasta legalizar.
- Indica con better si subir es bueno. En plazos de legalización, usa lower.
- Agrupa varios Kpi en KpiGroup.

**Qué evitar**

- Para ver la evolución en el tiempo usa BarChart.
- Reserva tone danger para cifras que piden una acción.

**Accesibilidad**

- La flecha se oculta. Se anuncia «Sube», «Baja» o «Sin cambios» antes del porcentaje.
- Con selectable se pinta como botón con aria-pressed.
- KpiGroup se anuncia como «Indicadores». Cambia label si hay varios grupos en la página.

## Avatar

Iniciales y disponibilidad para identificar a las personas de tu equipo.

**Cuándo usarlo**

- Úsalo para identificar a personas del equipo, como el técnico asignado a un ticket.
- Añade status para mostrar la disponibilidad en herramientas internas.

**Qué evitar**

- Para fotos u otras imágenes usa img con texto alternativo. Avatar solo muestra iniciales.
- No uses status para otros estados, como el de un ticket. Usa Badge.

**Accesibilidad**

- Con name se anuncia como imagen con el nombre y el estado, como «Marta Ruiz · Disponible».
- Sin name queda oculto a los lectores de pantalla.

## Timeline

Un historial ordenado de comunicaciones, hitos y cambios de estado.

**Cuándo usarlo**

- Úsalo para el historial de un expediente o un ticket, como llamadas, hitos y cambios de estado.
- Ordena los elementos antes de pasarlos. Se muestran tal como llegan.

**Qué evitar**

- Para los pasos pendientes de un proceso usa Stepper.
- Para comparar muchos eventos por columnas usa DataTable.

**Accesibilidad**

- Es una lista ordenada llamada «Historial». Cámbialo con label.
- Pasa dateTime en formato ISO para que el elemento time sea legible por máquina.
- El color de tone no se anuncia. Nombra el estado en title.

**Nota:** Muestra los elementos en el orden recibido. date es texto visible; dateTime es la fecha ISO para el elemento time.

## FilterBar & FilterChip

Búsqueda y filtros activos visibles, fáciles de quitar individualmente.

**Cuándo usarlo**

- Úsalo encima de un listado para buscar y ver los filtros activos.
- Añade otros controles, como Select o MultiSelect, como hijos.

**Qué evitar**

- Para buscar en toda la aplicación usa CommandPalette.
- Muestra solo los filtros activos, uno por FilterChip.

**Accesibilidad**

- Es una región role="search" y el buscador usa label como nombre.
- Cada chip tiene un botón «Quitar filtro» con su etiqueta. Al quitarlo, el foco vuelve al buscador.
- El número de resultados no se anuncia. Hazlo con role="status" en tu listado.

**Nota:** Los filtros se aplican a los datos en la aplicación. FilterChip también se exporta por separado; en Vue activa removable para mostrar su botón de cierre.

## DataTable

Tabla con ordenación, selección, paginación y estados de carga, error y vacío.

**Cuándo usarlo**

- Úsalo para listados que se ordenan, seleccionan o paginan, como instalaciones u ofertas.
- Marca numeric en las columnas de kWp o importes.
- Usa loading, error y emptyLabel para los estados de respuesta.
- Usa groupBy para leer un listado por estado o por responsable sin filtrarlo. Ordena rows por grupo para fijar el orden de los grupos.

**Qué evitar**

- Con cientos de filas o más no las cargues todas: usa manual y pide cada página al servidor.
- Para pocas filas sin interacción usa Table.

**Accesibilidad**

- caption es obligatorio y nombra la tabla.
- La columna ordenada lleva aria-sort y la selección se anuncia con role="status".
- Cada casilla se llama «Seleccionar fila» seguida del rowKey. Usa una clave legible, como la referencia.
- Cada grupo es un <tbody> con su título en <th scope="rowgroup">, un botón con aria-expanded que lo pliega.

**Nota:** Sin manual, ordena y pagina en el cliente los rows que recibe: fíltralos antes. Con manual, pide cada página al servidor al cambiar de página o de orden y pasa totalRows. toCsv(rows, columns) y downloadCsv() exportan lo que se ve, con «;» y coma decimal en español. rowKey debe ser único y estable. Seleccionar todo afecta a la página actual, sin las filas de los grupos plegados; conserva la selección en otras páginas.

## BarChart

Barras agrupadas o apiladas con los colores del tema y una tabla para lectores de pantalla.

**Cuándo usarlo**

- Úsalo para comparar cantidades por periodo, como los kWh generados cada mes.
- Usa stacked para ver las partes de un total, como autoconsumo y excedentes.
- Indica siempre unit y title.

**Qué evitar**

- Con más de cinco series los colores se repiten. Agrupa series o usa DataTable.
- No sirve para valores negativos. Las barras se recortan a cero.
- Para un único dato con su variación usa Kpi.

**Accesibilidad**

- Se recorre con las flechas, Inicio y Fin, y cada dato se anuncia. Los datos están además en una tabla oculta.
- title nombra esa tabla y categoryLabel da cabecera a la columna de categorías.
- Con varias series aparece la leyenda. No la desactives con legend.

**Nota:** La escala se redondea sola (0, 100, 200, 300). Los colores salen de chart-1 … chart-5 y siguen el tema y el modo oscuro. El dibujo está oculto a lectores de pantalla: leen la tabla con los mismos datos.

## Status

El estado de una fila con un punto de color y texto, sin fondo ni borde.

**Cuándo usarlo**

- Úsalo para el estado de una fila en tablas y listas largas, como Produciendo, En obra o Pendiente de legalizar.
- Es la alternativa discreta a Badge: sin fondo, varias filas seguidas no compiten con el contenido.
- Activa pulse solo en estados «en vivo», como una instalación que está produciendo ahora.

**Qué evitar**

- Para destacar un estado suelto en una cabecera o una tarjeta usa Badge.
- No uses pulse en más de un estado por vista: el movimiento atrae la mirada.
- Usa siempre el mismo tone para el mismo estado en todas las pantallas.

**Accesibilidad**

- El punto es decorativo y se oculta. El texto debe entenderse sin el color.
- pulse se detiene con prefers-reduced-motion.

**Nota:** El color va solo en el punto, que se oculta a los lectores de pantalla; el texto conserva el color normal y debe entenderse por sí solo.

## DescriptionList

Pares dato–valor para la ficha de un cliente o de una instalación.

**Cuándo usarlo**

- Úsala para fichas de cliente o de instalación: dirección, potencia, CUPS, referencia catastral.
- Añade copy en los códigos que se pegan en otras herramientas, como el CUPS.
- Usa layout="stacked" para resúmenes cortos con varias cifras.

**Qué evitar**

- Para comparar varias filas con las mismas columnas usa Table.
- No la uses como formulario. Para editar, usa Field en un Dialog o un Drawer.

**Accesibilidad**

- Usa <dl>: cada dato queda asociado a su valor para los lectores de pantalla.
- El botón de copiar se llama «Copiar {dato}», así se distingue de los demás.

**Nota:** Usa <dl>, <dt> y <dd>. El botón de copiar se llama «Copiar {dato}», por ejemplo «Copiar CUPS».

## AvatarGroup

Avatares solapados de un equipo, con un círculo «+N» para el resto.

**Cuándo usarlo**

- Úsalo para mostrar quién trabaja en algo, como el equipo de una instalación.
- Ajusta max al espacio: en tablas, 3 o 4 avatares pequeños.

**Qué evitar**

- Si la lista de personas es la información principal, usa una lista con nombres.
- No mezcles tamaños dentro del mismo grupo.

**Accesibilidad**

- Cada avatar se anuncia con su nombre; el resto, como «y N más».
- Los nombres ocultos aparecen al pasar el ratón; si importan, muéstralos en otro sitio.

**Nota:** Cada avatar se anuncia con su nombre. El círculo «+N» se lee como «y N más» y muestra los nombres ocultos al pasar el ratón. Avatar admite src para una foto; si no carga, se ven las iniciales.

## Sparkline

Línea de tendencia mínima, sin ejes, para acompañar una cifra. También como trend de Kpi.

**Cuándo usarlo**

- Úsala junto a una cifra para enseñar su tendencia reciente, por ejemplo la producción de los últimos 7 días.
- En un Kpi, pasa la serie en trend: toma el color de la variación.
- Usa tone solo para estado: success o danger cuando la tendencia es buena o mala.

**Qué evitar**

- No la uses para leer valores concretos: no tiene ejes. Para eso usa LineChart.
- Evita más de una sparkline por cifra.

**Accesibilidad**

- Sin label es decorativa (aria-hidden): la cifra de al lado ya da la información.
- Con label es una imagen con ese nombre. Di qué muestra y hacia dónde va: «Producción de la semana: al alza».

**Nota:** La escala va del mínimo al máximo de los datos; si todos son iguales, la línea queda plana en el centro. El último punto va marcado.

## LineChart

Series temporales, como la producción y el consumo diarios, con una tabla para lectores de pantalla. AreaChart rellena el área.

**Cuándo usarlo**

- Úsalo para series en el tiempo: producción y consumo diarios, potencia a lo largo del día.
- Usa AreaChart, o area, cuando importa el volumen además de la forma.
- Pon la unidad en unit y el periodo en description.

**Qué evitar**

- Para comparar categorías sin orden en el tiempo usa BarChart.
- Evita más de tres o cuatro series: se cruzan y no se leen. Con área, mejor una o dos.

**Accesibilidad**

- Se recorre con las flechas, Inicio y Fin, y cada dato se anuncia. Los datos están además en una tabla oculta.
- Da un categoryLabel («Día») para la cabecera de la tabla.
- Las series se distinguen por color y leyenda; con dos series, elige tonos de luminosidad distinta.

**Nota:** Misma forma de datos que BarChart. Los ejes y textos son HTML, nítidos a cualquier ancho; el último punto de cada serie va marcado y cada día muestra sus valores al pasar el ratón.

## Donut

Proporción de un total, como el autoconsumo frente a los excedentes, con la cifra clave en el centro.

**Cuándo usarlo**

- Úsalo para la parte de un total: autoconsumo frente a excedentes, cobertura solar.
- Pon la cifra clave en el centro con centerValue y centerLabel.
- Con un solo valor, usa value y max.

**Qué evitar**

- No pases de cuatro o cinco segmentos: las porciones pequeñas no se distinguen.
- Para comparar cantidades entre sí usa BarChart.

**Accesibilidad**

- El anillo es una imagen con un nombre que resume los porcentajes.
- Una lista oculta da los valores con su unidad; la leyenda visible se oculta para no repetirlos.
- Da un label que diga qué mide: encabeza el nombre accesible.

**Nota:** Los porcentajes se redondean para que sumen 100. El anillo es una imagen con un nombre que resume los porcentajes («Autoconsumo 68 %, Excedentes 32 %»), y una lista oculta da los valores con su unidad.

## Meter

Valor dentro de un rango conocido: carga de batería, cobertura solar. El tono dice si está bien, regular o mal.

**Cuándo usarlo**

- Úsalo para un valor que sube y baja dentro de un rango: carga de batería, cobertura solar.
- Define low, high y optimum para que el tono diga si está bien, regular o mal.
- Usa variant segments para la batería.

**Qué evitar**

- Para el avance de una tarea (subida, alta de cliente) usa Progress.
- No uses el color como único dato: muestra el valor con showValue.

**Accesibilidad**

- Tiene role="meter" con aria-valuenow, aria-valuemin, aria-valuemax y aria-valuetext.
- label es su nombre accesible; sin él se anuncia «Nivel».
- Con valueText cambias lo que se lee, por ejemplo «72 %, unas 6 horas de autonomía».

**Nota:** Para el avance de una tarea usa Progress: Meter mide algo que sube y baja dentro de un rango. Sin low, high ni optimum el tono es neutro.

## EnergyFlow

Flujo de energía en vivo de una vivienda: placas, casa, batería y red alrededor del inversor.

**Cuándo usarlo**

- Úsalo para el estado en vivo de una vivienda: lo que producen las placas, lo que consume la casa y lo que entra o sale de la batería y la red.
- Pasa solo los nodos que existen: sin batería o sin red, no se pintan.
- Respeta los signos: battery positivo carga y grid positivo importa.

**Qué evitar**

- No lo uses para históricos: para eso, LineChart.
- No lo metas en espacios de menos de 320 px de ancho.

**Accesibilidad**

- El diagrama es una imagen cuyo nombre resume cada nodo: valor y estado.
- Una lista oculta repite los datos, uno por nodo.
- El sentido se lee sin animación: cada línea lleva una flecha. Con «reducir movimiento» el trazo no se mueve.

**Nota:** Cada línea lleva una flecha con el sentido; si se permite movimiento, además un trazo que avanza. Con valor 0 la línea queda gris y sin flecha. Funciona de 320 a 800 px de ancho.

## PriceChart

El precio de la luz de un día, por horas o por cuartos de hora, con cada franja del color de su periodo de la 2.0TD.

**Cuándo usarlo**

- Úsalo para enseñar cuándo sale más barato consumir: poner la lavadora, cargar el coche, la batería.
- Pasa date: los fines de semana y festivos todo el día es valle.
- Con now, el cliente ve dónde está ahora sin buscarlo.

**Qué evitar**

- Para comparar varios días usa LineChart con una serie por día.
- No lo uses para tarifas sin periodos (precio fijo): con un número basta.

**Accesibilidad**

- Se recorre con las flechas y cada franja se anuncia con su hora, su periodo y su precio.
- El periodo no depende solo del color: está en la tarjeta, en la leyenda y en la tabla oculta.
- Las franjas más barata y más cara se leen como texto bajo el título.

**Nota:** Valle de 0 a 8 h; punta de 10 a 14 h y de 18 a 22 h; llano el resto. Las funciones priceSlots, tariffPeriod e isOffPeakDay de @1k5-tech-es/grado/patterns dan lo mismo sin dibujarlo. Los precios negativos se dibujan en cero.

## BatteryLevel

La carga de la batería de casa: porcentaje, energía guardada, si carga o descarga y la reserva para cortes.

**Cuándo usarlo**

- Úsalo en la ficha de la instalación y en la app del cliente para la batería de casa.
- Pasa power para decir si está cargando o descargando, y reserve si guarda energía para cortes.

**Qué evitar**

- Para otros porcentajes (cobertura solar, autoconsumo) usa Meter.
- No lo pongas junto a EnergyFlow con los mismos datos: elige uno.

**Accesibilidad**

- Es un role="meter" con todo el texto en aria-valuetext: «72 %, 7,2 de 10 kWh, Cargando · 2,1 kW».
- El estado va con punto y texto, no solo con color.

**Nota:** Verde por encima del 25 %, ámbar hasta el 25 % y rojo hasta el 10 %. Para el flujo entre placas, casa, batería y red usa EnergyFlow.

## Heatmap

Un valor por celda en la intensidad de un color: el consumo por hora y día de la semana, la producción por mes y año.

**Cuándo usarlo**

- Úsalo para ver patrones: a qué horas y qué días se consume más, cómo cambia la producción por mes.
- Indica unit y title, y rowLabel para la tabla accesible.

**Qué evitar**

- Para leer valores exactos usa DataTable: el color solo da una idea.
- Con menos de una docena de celdas, una tabla o un BarChart se leen mejor.

**Accesibilidad**

- Se recorre con las flechas en las dos direcciones y cada celda se anuncia con su fila, su columna y su valor.
- Los datos están además en una tabla oculta.

**Nota:** Con las flechas se recorren las celdas en las dos direcciones; Inicio y Fin van al principio y al final de la fila.
