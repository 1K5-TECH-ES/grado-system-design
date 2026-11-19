# Guías de uso: Estructura

Generado por `npm run skill` desde las guías de la web de documentación. Cuándo usar cada componente, qué evitar y qué cuidar de accesibilidad. Las props exactas están en los tipos instalados.

Componentes: Card · PageHeader · AppShell & Nav · Accordion · Stack · Grid · Container · Text · Heading · Kbd · Separator · SolarPanelIcon y otros iconos

## Card

Agrupa información relacionada y separa contenido de acciones.

**Cuándo usarlo**

- Úsala para agrupar datos de un mismo objeto, como el resumen de una instalación.
- Pon los datos en CardContent y las acciones en CardFooter.

**Qué evitar**

- No anides una Card dentro de otra. Separa las secciones con títulos o Accordion.
- Para muchos registros comparables usa Table o DataTable.

**Accesibilidad**

- Ajusta el nivel de CardTitle con as (h2, h3 o h4) a la jerarquía de la página.
- Card no tiene rol ni nombre. Si toda la tarjeta lleva a una ficha, enlaza desde el título.

## PageHeader

Título, contexto y acciones principales con una disposición consistente.

**Cuándo usarlo**

- Úsalo al principio de cada pantalla, con el título y las acciones principales.
- Usa subtitle para dar contexto en una línea.

**Qué evitar**

- No pongas más de dos o tres acciones. Lleva el resto a un DropdownMenu.
- Para mostrar la ruta dentro de la aplicación, añade Breadcrumbs encima.

**Accesibilidad**

- Por defecto el título es un h1. Usa uno por página.
- Usa as="h2" si la página ya tiene otro h1.

## AppShell & Nav

Un punto de partida compartido para la cabecera, la navegación y el contenido.

**Cuándo usarlo**

- Úsalo como armazón de cada aplicación interna, con cabecera, navegación lateral y contenido.
- Pasa NavLink o RouterLink en la prop as de NavItem para integrar tu router.
- Pon AppSearch en search para abrir el buscador o CommandPalette.

**Qué evitar**

- No añadas otro main dentro. AppShell ya lo incluye.
- Si una pantalla no necesita barra lateral, omite sidebar en lugar de ocultarla con CSS.

**Accesibilidad**

- Incluye el enlace «Saltar al contenido» hacia main. Si cambias mainId, que sea único.
- En móvil, Escape cierra el menú y devuelve el foco al botón Menú.
- Marca la página actual con active o con NavLink para que lleve aria-current="page".

**Nota:** AppSearch es el botón que abre tu buscador: la búsqueda la implementa la aplicación. El menú móvil está incluido. Usa as para integrar NavLink o RouterLink.

## Accordion

Despliega contenido secundario sin alargar toda la ficha.

**Cuándo usarlo**

- Úsalo para contenido secundario de una ficha, como la documentación o los plazos.
- Activa multiple si hace falta comparar secciones abiertas.

**Qué evitar**

- No escondas datos que se consultan siempre. Déjalos a la vista.
- Para vistas paralelas del mismo objeto usa Tabs.

**Accesibilidad**

- Cada título es un h3 con un botón. Colócalo bajo un h2.
- El botón indica aria-expanded y el panel es una región con su nombre.
- Tab, Enter y Espacio funcionan como en cualquier botón.

**Nota:** Vue admite slots con el nombre de cada value. Los botones conservan la navegación nativa con Tab, Enter y Espacio.

## Stack

Apila elementos en columna o en fila con un hueco de la escala de espacio.

**Cuándo usarlo**

- Úsalo para poner elementos uno detrás de otro en una sola dirección: los campos de un formulario, el título y su descripción, una fila de botones.
- Elige gap de la escala de espacio: 1 o 2 entre piezas de un mismo bloque, 4 entre bloques, 6 u 8 entre secciones.
- En fila, usa justify="between" para separar título y acciones, y wrap para que pasen debajo en móvil.

**Qué evitar**

- Si los elementos tienen el mismo peso y deben alinearse en columnas, como tarjetas o indicadores, usa Grid.
- No anides Stack para lograr una rejilla: con dos dimensiones el contenido no se alinea entre filas.
- No añadas márgenes a los hijos para separarlos. El hueco lo pone gap.

**Accesibilidad**

- Stack no cambia la semántica: con as="ul" o as="ol" una lista se anuncia como lista.
- El orden visual es el del código. No uses direction ni CSS para reordenar: el teclado y los lectores de pantalla siguen el código.

**Nota:** Solo pone clases (k5-stack, k5-gap-*, k5-align-*, k5-justify-*): sin estilos en línea, compatible con una CSP estricta. En HTML puedes usar stackClass() de @1k5-tech-es/grado/classes. Las clases k5-gap-* sirven también en cualquier flex o grid propio.

## Grid

Coloca en rejilla piezas del mismo peso, como tarjetas o indicadores.

**Cuándo usarlo**

- Úsalo para piezas del mismo peso que deben alinearse en filas y columnas: tarjetas de instalaciones, KPI, campos cortos de un formulario.
- Con columns='auto' la rejilla se adapta sola al ancho; minItemWidth fija el ancho mínimo de cada pieza.
- Usa columnas fijas (2, 3, 4…) cuando el diseño pide un número concreto en escritorio. En móvil pasan a una.

**Qué evitar**

- Para una sola fila o columna, como una cabecera con acciones, usa Stack.
- No la uses para la estructura de la página (barra lateral y contenido): eso es AppShell.
- Evita más de cuatro columnas con texto: cada pieza queda demasiado estrecha para leerse.

**Accesibilidad**

- Grid no cambia la semántica. Si las piezas son una lista, usa as="ul" e hijos li.
- El orden de lectura y de tabulación es el del código, de izquierda a derecha y de arriba abajo.

**Nota:** Por debajo de 600 px las columnas fijas pasan a una. Con auto-fit las columnas aparecen y desaparecen según el ancho disponible, sin media queries, y los elementos se reparten el sobrante.

## Container

Limita el ancho del contenido y lo centra en la página.

**Cuándo usarlo**

- Úsalo para limitar el ancho del contenido principal y centrarlo en pantallas grandes.
- sm para formularios, md para fichas y páginas de detalle, lg para listados y tablas.

**Qué evitar**

- Dentro de AppShell, el área principal ya tiene relleno: usa padded en false o limita solo el ancho.
- No anides varios Container. Para estrechar una parte de la página basta un size más pequeño en esa parte.

**Accesibilidad**

- Con as="main" puede ser la región principal de la página. Solo debe haber un main.
- Las líneas de texto largas cuestan de leer: en páginas de lectura, usa sm o md.

**Nota:** Usa los tokens --k5-container-sm, md y lg. El margen lateral cuenta dentro del ancho máximo. Con padded en false el contenido llega al borde: útil dentro de un panel que ya tiene relleno.

## Text

Párrafo o texto en línea con un paso de la escala tipográfica.

**Cuándo usarlo**

- Úsalo para párrafos y textos sueltos con un tamaño de la escala: lead para la entradilla, body para el texto normal, small y caption para datos secundarios.
- Usa tone="muted" para lo secundario y los tonos de estado solo para estado: Conectada, Pendiente, Incidencia.
- Usa numeric en cifras que se comparan entre filas, como kWp o importes.

**Qué evitar**

- No uses el color para dar jerarquía. Para destacar, sube el tamaño o el peso.
- No uses truncate en datos que hay que leer enteros, como un CUPS o un IBAN. Si recortas, ofrece el texto completo en otro sitio.
- Para títulos usa Heading, no Text con weight="semibold".

**Accesibilidad**

- Por defecto es un p. Usa as="span" dentro de otro párrafo o de un botón.
- El color no se anuncia: el texto debe entenderse sin él, como «Conectada» o «Pendiente de legalizar».
- Los tonos de estado usan --k5-*-text y llegan a 4,5 : 1 en los dos temas y los dos modos.

**Nota:** Usa --k5-text-* y --k5-leading-* de cada paso. Los tonos de estado usan --k5-*-text, que llegan a 4,5 : 1 sobre el fondo y sobre su tinte. Text no deja márgenes: separa los párrafos con Stack.

## Heading

Título de sección con el nivel correcto y el tamaño que pida el diseño.

**Cuándo usarlo**

- Úsalo para los títulos de las secciones y bloques de una pantalla, con el level que les toca en el esquema.
- Usa size cuando el diseño pide otro tamaño: un h3 con size="title" en un resumen, o un h2 pequeño con size="lead".

**Qué evitar**

- No sustituye a PageHeader. El título de la pantalla, con su subtítulo y sus acciones, va en PageHeader.
- No elijas el level por el tamaño. El level sigue el esquema del documento; el tamaño se cambia con size.
- No saltes niveles, de h2 a h4, para conseguir un título más pequeño.

**Accesibilidad**

- Los lectores de pantalla navegan por encabezados: el orden de level debe reflejar la estructura de la página.
- Si la página ya tiene el h1 de PageHeader, empieza las secciones en level 2.
- Con as cambias la etiqueta y pierdes el encabezado. Úsalo solo cuando el elemento no es un título de sección, como un legend.

**Nota:** Semibold, con text-wrap: balance. title y display aprietan el espaciado con --k5-tracking-title y --k5-tracking-display. level marca la estructura del documento; size, solo el aspecto.

## Kbd

Una tecla o un atajo de teclado dentro del texto.

**Cuándo usarlo**

- Úsalo para enseñar atajos dentro de un texto de ayuda o de un menú, como Ctrl + K.
- Escribe las teclas como aparecen en el teclado: Ctrl, Mayús, Esc, ⌘.

**Qué evitar**

- No lo uses para códigos o valores. Para eso usa una fuente monoespaciada o DescriptionList con mono.
- No pongas el atajo como único modo de hacer algo.

**Accesibilidad**

- Las teclas se leen como texto: «Ctrl más K».
- Si el atajo depende del sistema, indica las dos variantes (Ctrl y ⌘).

**Nota:** Usa <kbd> anidados, como recomienda HTML para combinaciones de teclas, con «+» entre ellas.

## Separator

Una línea horizontal o vertical entre bloques, con texto opcional.

**Cuándo usarlo**

- Úsalo para separar bloques sin añadir una tarjeta, como dos formas de entrar con label="o".
- La vertical separa datos en línea: potencia, módulos y provincia.

**Qué evitar**

- No separes cada fila de una lista: el espacio basta.
- No lo combines con bordes de tarjeta en el mismo lado.

**Accesibilidad**

- Por defecto es decorativo y se oculta. Usa decorative={false} si separa secciones con significado.
- Con decorative={false} y label, el texto pasa a aria-label.

**Nota:** La vertical toma la altura de su fila: úsala dentro de un contenedor flex.

## SolarPanelIcon y otros iconos

Iconos de una instalación con el trazo de Lucide: placa, batería, red, bomba de calor, cargador, contador e inversor.

**Cuándo usarlo**

- Úsalos para los equipos de una instalación en navegación, botones y estados vacíos.
- Para el resto de iconos, usa lucide-react: el trazo es el mismo.

**Qué evitar**

- No los uses para estados (bien, aviso, error): para eso están los iconos de Alert y Status.

**Accesibilidad**

- Sin title son decorativos (aria-hidden): el nombre lo pone el botón o el enlace.
- Solo con title son una imagen con nombre; úsalo cuando el icono va solo.

**Nota:** Se pasan como icon a Button, IconButton, NavItem o EmptyState, igual que los de lucide-react. Miden 24 × 24 y toman el color del texto.
