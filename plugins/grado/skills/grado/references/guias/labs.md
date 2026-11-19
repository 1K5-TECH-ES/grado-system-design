# Guías de uso: Labs

Generado por `npm run skill` desde las guías de la web de documentación. Cuándo usar cada componente, qué evitar y qué cuidar de accesibilidad. Las props exactas están en los tipos instalados.

Componentes: Amount · RelativeTime · ThemeToggle · ScrollArea · useHotkey · VisuallyHidden · TariffComparison · SignaturePad · SolarForecast

## Amount

Importes, energía y potencia con el formato español y cifras alineadas: «1234,50 €», «7,2 kWh», «6,4 kWp».

**Cuándo usarlo**

- Úsalo para cualquier importe, energía o potencia que vea el usuario: el formato sale igual en todas las apps.
- En tablas, junto a numeric en la columna, para que las cifras queden alineadas.
- Para variaciones (ahorro, desviación) usa signed y colored.

**Qué evitar**

- No formatees con toLocaleString a mano: cada app acababa con sus propios decimales.
- No uses colored para importes que no son una variación.

**Accesibilidad**

- El texto lleva la unidad completa, con espacio duro: no se parte al final de la línea.
- El color de colored acompaña al signo, no lo sustituye.

**Nota:** Es un <data> con el número sin formato en value, para copiarlo o leerlo desde código. Fuera de la promesa de la 1.0: puede cambiar en una versión menor. Se importa de `@1k5-tech-es/grado-react/labs` o `@1k5-tech-es/grado-vue/labs` y su CSS es `@1k5-tech-es/grado/labs.css`.

## RelativeTime

Cuándo pasó algo, en palabras: «hace 5 minutos», «ayer», «16 oct». Se actualiza sola.

**Cuándo usarlo**

- Úsalo para cuándo cambió algo reciente: el último mensaje, la última lectura del contador.
- Pasada una semana enseña la fecha: «hace 23 días» cuesta más de leer.

**Qué evitar**

- Para plazos y citas (instalación el martes 21) usa la fecha exacta, no la relativa.

**Accesibilidad**

- La fecha completa está en title y en datetime, para quien la necesite exacta.

**Nota:** Lleva la fecha completa en title y en datetime. Se repinta cada minuto la primera hora y cada hora el primer día. Fuera de la promesa de la 1.0: puede cambiar en una versión menor. Se importa de `@1k5-tech-es/grado-react/labs` o `@1k5-tech-es/grado-vue/labs` y su CSS es `@1k5-tech-es/grado/labs.css`.

## ThemeToggle

Claro, Oscuro o Sistema. useTheme() guarda la elección y pone la clase dark en <html>.

**Cuándo usarlo**

- Ponlo en el menú de usuario o en ajustes, no en cada pantalla.
- Añade themeScript() al <head> para que no parpadee al cargar.

**Qué evitar**

- No guardes el tema en tu propio localStorage: usa useTheme() y todos los controles se enteran.

**Accesibilidad**

- Es un SegmentedControl: grupo con nombre «Tema» y opciones que se recorren con las flechas.

**Nota:** Todos los useTheme de la página se enteran del cambio y Sistema sigue la preferencia del equipo. Sin almacenamiento (modo privado), la elección dura hasta recargar. Fuera de la promesa de la 1.0: puede cambiar en una versión menor. Se importa de `@1k5-tech-es/grado-react/labs` o `@1k5-tech-es/grado-vue/labs` y su CSS es `@1k5-tech-es/grado/labs.css`.

## ScrollArea

Una zona con su propio scroll y barra fina, que se recorre también con el teclado.

**Cuándo usarlo**

- Úsala para listas largas dentro de un panel: historial, mensajes, documentos.

**Qué evitar**

- No metas una ScrollArea dentro de otra.
- Para tablas largas usa DataTable con maxHeight, que además tiene filas virtuales.

**Accesibilidad**

- Siempre con label: es una región con nombre que recibe el foco con Tab.

**Nota:** Es una región con nombre que recibe el foco: las flechas la desplazan sin ratón. Al imprimir sale entera. Fuera de la promesa de la 1.0: puede cambiar en una versión menor. Se importa de `@1k5-tech-es/grado-react/labs` o `@1k5-tech-es/grado-vue/labs` y su CSS es `@1k5-tech-es/grado/labs.css`.

## useHotkey

Atajos de teclado para toda la página: useHotkey("mod+k", abrir). mod es ⌘ en Mac y Ctrl en el resto.

**Cuándo usarlo**

- Para acciones frecuentes: buscar (mod+k), nueva oferta, ayuda (?).
- Enseña el atajo con Kbd y hotkeyLabel() junto al botón que hace lo mismo.

**Qué evitar**

- No uses atajos que ya tiene el navegador o el sistema (mod+w, mod+t).
- Un atajo nunca es la única forma de hacer algo.

**Accesibilidad**

- Los atajos de una tecla sin modificador no saltan mientras se escribe en un campo.

**Nota:** Los atajos sin modificador (como «?») no saltan mientras se escribe. hotkeyLabel() da el texto para Kbd. Fuera de la promesa de la 1.0: puede cambiar en una versión menor. Se importa de `@1k5-tech-es/grado-react/labs` o `@1k5-tech-es/grado-vue/labs` y su CSS es `@1k5-tech-es/grado/labs.css`.

## VisuallyHidden

Texto que solo oyen los lectores de pantalla: el destino de un botón de icono, «(se abre en otra pestaña)».

**Cuándo usarlo**

- Para completar el nombre de un botón o enlace que se entiende por el contexto visual: «Ver» → «Ver la oferta OF-0418».

**Qué evitar**

- No escondas información que también necesita quien ve la pantalla.

**Accesibilidad**

- El texto se lee y forma parte del nombre accesible, pero no ocupa sitio.

**Nota:** Usa la clase k5-sr-only de grado.css. Fuera de la promesa de la 1.0: puede cambiar en una versión menor. Se importa de `@1k5-tech-es/grado-react/labs` o `@1k5-tech-es/grado-vue/labs` y su CSS es `@1k5-tech-es/grado/labs.css`.

## TariffComparison

Lo que cuesta al año el mismo consumo con dos o tres tarifas, con la más barata marcada.

**Cuándo usarlo**

- Úsalo en la oferta y en el área de cliente para enseñar por qué una tarifa compensa con su consumo real.
- Compara dos o tres tarifas: con más, la tabla deja de leerse de un vistazo.

**Qué evitar**

- No mezcles tarifas con y sin impuestos en la misma comparación.
- No inventes el reparto por periodos: usa el consumo real de la factura o del contador.

**Accesibilidad**

- Es una tabla con cabeceras: la más barata se dice con texto («Más barata»), no solo con color.

**Nota:** Los impuestos cambian con el tiempo: Grado no los inventa, pásalos tú si quieres el total con ellos. Fuera de la promesa de la 1.0: puede cambiar en una versión menor. Se importa de `@1k5-tech-es/grado-react/labs` o `@1k5-tech-es/grado-vue/labs` y su CSS es `@1k5-tech-es/grado/labs.css`.

## SignaturePad

Firma de la oferta con el dedo, un lápiz o el ratón, o escribiendo el nombre.

**Cuándo usarlo**

- Úsalo para aceptar una oferta o un contrato en tablet o en el ordenador.
- Pon name para que la firma viaje con el formulario.

**Qué evitar**

- No la uses como única prueba legal sin el resto del proceso de firma (datos, fecha, aceptación).
- No la hagas más pequeña que su tamaño por defecto en móvil.

**Accesibilidad**

- «Escribir mi nombre» permite firmar con el teclado o un lector de pantalla.
- El estado («Sin firmar», «Firma dibujada») forma parte del nombre de la zona.

**Nota:** «Escribir mi nombre» es la alternativa para quien no puede dibujar o usa el teclado. Dentro de la zona la página no se desplaza al firmar. Fuera de la promesa de la 1.0: puede cambiar en una versión menor. Se importa de `@1k5-tech-es/grado-react/labs` o `@1k5-tech-es/grado-vue/labs` y su CSS es `@1k5-tech-es/grado/labs.css`.

## SolarForecast

La producción solar prevista para hoy frente a la real, hora a hora, con el tiempo.

**Cuándo usarlo**

- Úsalo en la app del cliente y en los paneles de seguimiento para el día en curso.
- Pasa weather para explicar por qué hoy se produce menos.

**Qué evitar**

- Para comparar varios días usa LineChart con una serie por día.

**Accesibilidad**

- Se recorre con las flechas: cada hora se anuncia con lo previsto, lo producido y el tiempo.
- Previsto y real se distinguen por el trazo (discontinuo y continuo), no solo por el color.

**Nota:** El resumen dice el total previsto, lo producido hasta la última hora con dato y si va más de un 5 % por encima o por debajo. Fuera de la promesa de la 1.0: puede cambiar en una versión menor. Se importa de `@1k5-tech-es/grado-react/labs` o `@1k5-tech-es/grado-vue/labs` y su CSS es `@1k5-tech-es/grado/labs.css`.
