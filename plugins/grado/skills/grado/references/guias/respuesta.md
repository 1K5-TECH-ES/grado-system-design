# Guías de uso: Respuesta

Generado por `npm run skill` desde las guías de la web de documentación. Cuándo usar cada componente, qué evitar y qué cuidar de accesibilidad. Las props exactas están en los tipos instalados.

Componentes: EmptyState · Spinner · Toast · Toaster · Alert · Tooltip · Skeleton · Progress · Banner

## EmptyState

Explica por qué todavía no hay datos y ofrece un siguiente paso.

**Cuándo usarlo**

- Úsalo cuando una lista o un panel no tienen datos, como un buzón sin tickets pendientes.
- Explica el motivo y ofrece el siguiente paso con action.
- Usa compact dentro de una Card o en espacios pequeños.

**Qué evitar**

- Para un fallo al cargar usa Alert con tone danger.
- Dentro de DataTable usa emptyLabel. Ya incluye su estado vacío.

**Accesibilidad**

- El icono es decorativo y el título es un párrafo, no un encabezado.
- No se anuncia solo. Si aparece tras filtrar, anuncia el resultado con role="status".

## Spinner

Comunica que una operación está en curso sin bloquear el contexto.

**Cuándo usarlo**

- Úsalo para esperas cortas en una zona concreta, como al cargar una ficha.
- En un botón usa loading de Button, que ya incluye el spinner.

**Qué evitar**

- Si conoces la forma del contenido que llega, usa Skeleton.
- Para subidas con progreso medible usa FileUpload con progress.

**Accesibilidad**

- Tiene role="status" y se anuncia «Cargando». Concreta con label, por ejemplo «Cargando instalaciones».
- Usa decorative si otro elemento ya anuncia la carga.

## Toast

Una notificación temporal, descartable y con pausa al interactuar.

**Cuándo usarlo**

- Úsalo para confirmar una acción ya hecha, como «Oferta enviada».
- Usa tone success o info. Desaparece a los cinco segundos.

**Qué evitar**

- Para errores que piden una acción usa Alert junto al contenido.
- Si incluye una acción, usa duration 0 o repite la acción en la pantalla.
- Para varios avisos seguidos no apiles Toast: usa toast() y Toaster, que llevan la cola.

**Accesibilidad**

- Usa role="status" por defecto. Para fallos urgentes pasa role="alert".
- El tiempo se pausa con el puntero o el foco dentro.
- Con el foco dentro, Escape lo cierra. También tiene botón de cierre.

**Nota:** El temporizador se pausa con el puntero o el foco dentro. Muestra un Toast activo por posición; para varios avisos seguidos, usa toast() y Toaster.

## Toaster

La cola de avisos: lanza toast() desde cualquier parte de la app y Toaster los muestra por orden.

**Cuándo usarlo**

- Úsalo para confirmar acciones desde cualquier parte de la app: toast.success('Oferta enviada').
- Usa toast.promise para guardar o enviar: el mismo aviso pasa de «Guardando…» al resultado.
- Pon un solo Toaster, junto a AppShell.

**Qué evitar**

- Para errores que piden corregir algo usa Alert o el error del campo; el aviso desaparece.
- Si el aviso lleva una acción importante, repítela en la pantalla: no todo el mundo llega a pulsarla.
- No subas max por encima de 3: más avisos a la vez tapan la pantalla.

**Accesibilidad**

- La región «Notificaciones» siempre está en la página, así que los lectores de pantalla anuncian lo que entra.
- toast.error se anuncia con role="alert"; el resto, con aria-live="polite".
- El tiempo empieza cuando el aviso se ve y se pausa con el puntero o el foco dentro. Escape lo cierra.

**Nota:** Pon un solo Toaster en la app. Los avisos salen por orden de llegada y los que no caben esperan, así que no se pierde ninguno. El tiempo de cada uno empieza cuando se ve y se pausa con el puntero o el foco dentro.

## Alert

Información persistente que acompaña al contenido y explica qué hacer.

**Cuándo usarlo**

- Úsalo para avisos que deben quedarse visibles, como documentación pendiente de un expediente.
- Explica qué pasa y qué hacer. Añade action si hay un paso directo.

**Qué evitar**

- Para confirmaciones pasajeras usa Toast.
- Para el error de un campo usa error en Field.

**Accesibilidad**

- Por defecto usa role="status". Reserva role="alert" para mensajes urgentes.
- Usa role="none" si el aviso está desde la carga y no hace falta anunciarlo.
- El icono es decorativo. El título debe transmitir el tono por sí solo.

**Nota:** Usa role="alert" para mensajes urgentes. El valor por defecto es status, con anuncios menos intrusivos.

## Tooltip

Una explicación breve para un botón de ayuda, o para cualquier control (el atajo de un botón), accesible con teclado.

**Cuándo usarlo**

- Úsalo para una aclaración breve junto a una etiqueta, como qué significa kWp.
- Escribe content en una sola frase.

**Qué evitar**

- No escondas en él información necesaria. Ponla en el hint de Field.
- Para contenido con enlaces o botones usa Dialog o Drawer.

**Accesibilidad**

- Es su propio botón y label le da el nombre accesible.
- Se abre con el puntero, el foco o un clic. Escape lo descarta.
- Mientras está abierto, content se enlaza con aria-describedby.

**Nota:** Se abre con puntero o foco. Escape lo descarta. Evita colocar el disparador dentro de contenedores que recorten el contenido.

## Skeleton

Representa la forma del contenido mientras llegan los datos.

**Cuándo usarlo**

- Úsalo mientras carga contenido de forma conocida, como una ficha o una lista.
- Imita el tamaño real para que la página no salte al llegar los datos.

**Qué evitar**

- Para esperas dentro de un botón usa loading de Button.
- No lo dejes en pantalla si la carga falla. Muestra un Alert.

**Accesibilidad**

- Las piezas llevan aria-hidden. Pon role="status" y aria-label en el contenedor.
- La animación se desactiva con prefers-reduced-motion.

**Nota:** Las piezas son decorativas. Añade el anuncio de carga al contenedor. La animación se desactiva con prefers-reduced-motion.

## Progress

Barra de progreso con valor, por pasos o indeterminada.

**Cuándo usarlo**

- Úsalo para tareas que avanzan, como la subida de un archivo o la legalización de una instalación.
- Usa steps cuando el progreso son trámites contables: «Paso 3 de 5».
- Usa value={null} cuando no sabes cuánto falta, como al calcular la producción.

**Qué evitar**

- Para esperas cortas sin progreso medible usa Spinner.
- No lo uses para mostrar una cantidad, como la cuota de autoconsumo. Usa un Kpi o un gráfico.
- Reserva danger para un proceso con error, no para un valor bajo.

**Accesibilidad**

- Dale siempre un label que diga qué progresa; si no se ve, se usa como nombre accesible.
- aria-valuetext da el valor en el formato del idioma («64 %», «Paso 3 de 5»).
- La animación indeterminada se detiene con prefers-reduced-motion.

**Nota:** role="progressbar" con aria-valuenow, aria-valuemin, aria-valuemax y aria-valuetext («64 %» en formato del idioma o «Paso 3 de 5»). Indeterminado no lleva aria-valuenow; con movimiento reducido la barra se queda quieta.

## Banner

Un aviso para toda la aplicación, de borde a borde, bajo la cabecera.

**Cuándo usarlo**

- Úsalo para avisos que afectan a toda la aplicación, como el mantenimiento del portal de una distribuidora.
- Colócalo en la prop banner de AppShell (slot #banner en Vue), bajo la cabecera.
- Muestra un Banner a la vez y deja que se cierre si el aviso no es crítico.

**Qué evitar**

- Para avisos de una sola pantalla o un formulario usa Alert junto al contenido.
- Para confirmar una acción ya hecha usa Toast.
- No lo uses para publicidad ni para novedades que no cambian el trabajo de hoy.

**Accesibilidad**

- Usa role="status"; con tone danger pasa a role="alert" para anunciarse al momento.
- El botón de cerrar se llama «Cerrar aviso»; cámbialo con dismissLabel.
- El color nunca va solo: icono y título dicen el tipo de aviso.

**Nota:** Fondo tintado sin borde, como Alert. En AppShell queda bajo la cabecera y por encima de la barra lateral y del contenido; en Marca, junto a la barra lateral.
