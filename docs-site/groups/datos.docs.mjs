// Web de documentación · grupo «datos y piezas»: fichas de componente y guías de uso.
// entry(id, nombre, categoría, descripción, react(...), vue(...), props, nota) como en components.mjs.
// Categorías: Acciones, Formularios, Datos, Estructura, Navegación, Superposiciones, Respuesta.
// La demo en vivo de cada id está en datos.demos.mjs.
import { entry, react, vue, list } from '../doc-helpers.mjs'

const ficha = list(
  "{ term: 'Cliente', description: 'Lucía Fernández' }",
  "{ term: 'Potencia', description: '8,4 kWp' }",
  "{ term: 'CUPS', description: 'ES0021000012345678AB', copy: 'ES0021000012345678AB', mono: true }",
)
const team = list("{ name: 'Lucía Fernández' }", "{ name: 'Javier Ortega', src: '/equipo/javier.jpg' }", "{ name: 'Marta Ruiz' }")

export const entries = [
  entry(
    'status',
    'Status',
    'Datos',
    'El estado de una fila con un punto de color y texto, sin fondo ni borde.',
    react(
      'Status',
      `<>
  <Status tone="success" pulse>Produciendo</Status>
  <Status tone="warning">Pendiente de legalizar</Status>
  <Status>Sin datos</Status>
</>`,
    ),
    vue(
      'Status',
      `<Status tone="success" pulse>Produciendo</Status>
<Status tone="warning">Pendiente de legalizar</Status>
<Status>Sin datos</Status>`,
    ),
    [
      ['tone', "'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'danger'", "'neutral'"],
      ['pulse', 'El punto late, para estados «en vivo». Sin animación con movimiento reducido', 'false'],
      ['children / slot', 'Texto del estado', '—'],
    ],
    'El color va solo en el punto, que se oculta a los lectores de pantalla; el texto conserva el color normal y debe entenderse por sí solo.',
  ),
  entry(
    'progress',
    'Progress',
    'Respuesta',
    'Barra de progreso con valor, por pasos o indeterminada.',
    react(
      'Progress',
      `<>
  <Progress value={64} label="memoria-tecnica.pdf" showLabel showValue />
  <Progress steps={5} value={3} label="Legalización" showLabel showValue />
  <Progress value={null} size="sm" label="Calculando la producción" />
</>`,
    ),
    vue(
      'Progress',
      `<Progress :value="64" label="memoria-tecnica.pdf" show-label show-value />
<Progress :steps="5" :value="3" label="Legalización" show-label show-value />
<Progress :value="null" size="sm" label="Calculando la producción" />`,
    ),
    [
      ['value', 'Valor actual; null = indeterminado. Con steps, pasos completados', 'null'],
      ['max', 'Valor máximo (sin steps)', '100'],
      ['steps', 'Variante por pasos: número total de segmentos', '—'],
      ['label', 'Nombre accesible; visible encima con showLabel', '«Progreso»'],
      ['showLabel / showValue', 'Muestran el nombre y «64 %» o «Paso 3 de 5»', 'false'],
      ['tone', "'brand' | 'success' | 'warning' | 'danger'", "'brand'"],
      ['size', "'sm' | 'md'", "'md'"],
    ],
    'role="progressbar" con aria-valuenow, aria-valuemin, aria-valuemax y aria-valuetext («64 %» en formato del idioma o «Paso 3 de 5»). Indeterminado no lleva aria-valuenow; con movimiento reducido la barra se queda quieta.',
  ),
  entry(
    'description-list',
    'DescriptionList',
    'Datos',
    'Pares dato–valor para la ficha de un cliente o de una instalación.',
    react('DescriptionList', `<DescriptionList items={items} />`, `const items = ${ficha};`),
    vue(
      'DescriptionList, Status',
      `<DescriptionList :items="items">
  <template #estado><Status tone="success">Conectada</Status></template>
</DescriptionList>`,
      `const items = ${list(
        "{ term: 'Cliente', description: 'Lucía Fernández' }",
        "{ term: 'CUPS', description: 'ES0021000012345678AB', copy: 'ES0021000012345678AB', mono: true }",
        "{ id: 'estado', term: 'Estado' }",
      )};`,
    ),
    [
      ['items', 'Lista de { id, term, description, copy, mono }', 'Obligatorio'],
      ['description', 'React: ReactNode · Vue: texto o slot con el id del elemento', '—'],
      ['copy', 'Añade un CopyButton que copia ese valor', '—'],
      ['mono', 'Fuente monoespaciada para códigos (CUPS, referencia catastral)', 'false'],
      ['layout', "'columns' (una sola columna por debajo de 600 px) | 'stacked'", "'columns'"],
    ],
    'Usa <dl>, <dt> y <dd>. El botón de copiar se llama «Copiar {dato}», por ejemplo «Copiar CUPS».',
  ),
  entry(
    'copy-button',
    'CopyButton',
    'Acciones',
    'Copia un texto al portapapeles y confirma que se ha copiado.',
    react(
      'CopyButton',
      `<>
  <CopyButton value="INS-2041" label="Copiar referencia" />
  <CopyButton value="ES0021000012345678AB" iconOnly label="Copiar CUPS" onCopy={(value) => console.log(value)} />
</>`,
    ),
    vue(
      'CopyButton',
      `<CopyButton value="INS-2041" label="Copiar referencia" />
<CopyButton value="ES0021000012345678AB" icon-only label="Copiar CUPS" @copy="(value) => console.log(value)" />`,
    ),
    [
      ['value', 'Texto que se copia', 'Obligatorio'],
      ['label / copiedLabel', 'Texto del botón antes y después de copiar', '«Copiar» / «Copiado»'],
      ['iconOnly', 'Solo icono; label pasa a ser su nombre accesible', 'false'],
      ['size', "'sm' | 'md' | 'lg'", "'sm'"],
      ['Al copiar', 'React: onCopy(value) · Vue: evento copy', '—'],
    ],
    'Usa navigator.clipboard y, si no está disponible (http, permisos), un textarea temporal con execCommand. Anuncia «Copiado» o «No se pudo copiar» en una región aria-live y vuelve al estado inicial a los 2 s.',
  ),
  entry(
    'tag',
    'Tag',
    'Formularios',
    'Una etiqueta que se puede quitar, como una provincia de una zona de trabajo.',
    react(
      'Tag',
      `<>
  {provincias.map((p) => (
    <Tag key={p} label={p} onRemove={() => setProvincias(provincias.filter((x) => x !== p))} />
  ))}
</>`,
      "const [provincias, setProvincias] = useState(['Valencia', 'Alicante', 'Murcia']);",
    ),
    vue(
      'Tag',
      `<Tag
  v-for="p in provincias"
  :key="p"
  :label="p"
  removable
  @remove="provincias = provincias.filter((x) => x !== p)"
/>`,
      "const provincias = ref(['Valencia', 'Alicante', 'Murcia']);",
    ),
    [
      ['label / children', 'Texto; Vue: label o slot', '—'],
      ['Quitar', 'React: onRemove · Vue: removable y evento remove', '—'],
      ['removeLabel', 'Nombre del botón de quitar', '«Quitar {label}»'],
      ['size', "'sm' | 'md'", "'md'"],
      ['disabled', 'Desactiva el botón de quitar', 'false'],
    ],
    'Al quitar una etiqueta, el foco pasa al botón de quitar de la siguiente (o de la anterior si era la última) del mismo contenedor.',
  ),
  entry(
    'avatar-group',
    'AvatarGroup',
    'Datos',
    'Avatares solapados de un equipo, con un círculo «+N» para el resto.',
    react('AvatarGroup', `<AvatarGroup items={equipo} max={4} size="sm" />`, `const equipo = ${team};`),
    vue('AvatarGroup', `<AvatarGroup :items="equipo" :max="4" size="sm" />`, `const equipo = ${team};`),
    [
      ['items', 'Lista de { name, src }', 'Obligatorio'],
      ['max', 'Avatares visibles', '4'],
      ['size', "'sm' | 'md' | 'lg', como Avatar", "'md'"],
    ],
    'Cada avatar se anuncia con su nombre. El círculo «+N» se lee como «y N más» y muestra los nombres ocultos al pasar el ratón. Avatar admite src para una foto; si no carga, se ven las iniciales.',
  ),
  entry(
    'kbd',
    'Kbd',
    'Estructura',
    'Una tecla o un atajo de teclado dentro del texto.',
    react('Kbd', `<p>Busca con <Kbd keys={['Ctrl', 'K']} /> y cierra con <Kbd>Esc</Kbd>.</p>`),
    vue('Kbd', `<p>Busca con <Kbd :keys="['Ctrl', 'K']" /> y cierra con <Kbd>Esc</Kbd>.</p>`),
    [
      ['keys', "Teclas de un atajo: ['Ctrl', 'K']", '—'],
      ['children / slot', 'Una sola tecla', '—'],
    ],
    'Usa <kbd> anidados, como recomienda HTML para combinaciones de teclas, con «+» entre ellas.',
  ),
  entry(
    'separator',
    'Separator',
    'Estructura',
    'Una línea horizontal o vertical entre bloques, con texto opcional.',
    react(
      'Separator, Button',
      `<>
  <Button variant="secondary">Entrar con la cuenta de 1KOMMA5°</Button>
  <Separator label="o" />
  <Button variant="ghost">Recibir un enlace por correo</Button>
</>`,
    ),
    vue(
      'Separator, Button',
      `<Button variant="secondary">Entrar con la cuenta de 1KOMMA5°</Button>
<Separator label="o" />
<Button variant="ghost">Recibir un enlace por correo</Button>`,
    ),
    [
      ['orientation', "'horizontal' | 'vertical'", "'horizontal'"],
      ['decorative', 'true: aria-hidden · false: role="separator" con aria-orientation', 'true'],
      ['label', 'Texto en el centro, como «o»', '—'],
    ],
    'La vertical toma la altura de su fila: úsala dentro de un contenedor flex.',
  ),
  entry(
    'link',
    'Link',
    'Navegación',
    'Un enlace con el estilo del sistema, también para el router y para webs externas.',
    react(
      'Link',
      `<p>
  Comprueba la parcela en la{' '}
  <Link href="https://www.sedecatastro.gob.es" external underline="always">Sede del Catastro</Link>.
</p>`,
    ),
    vue(
      'Link',
      `<p>
  Comprueba la parcela en la
  <Link href="https://www.sedecatastro.gob.es" external underline="always">Sede del Catastro</Link>.
</p>`,
    ),
    [
      ['href', 'Destino; con as, las props del componente (to…)', '—'],
      ['as', 'Componente del enlace: Link de react-router o Next.js, RouterLink en Vue', '<a>'],
      ['external', 'Nueva pestaña con rel="noopener noreferrer", icono y aviso oculto', 'false'],
      ['tone', "'default' | 'muted'", "'default'"],
      ['underline', "'hover' | 'always'", "'hover'"],
    ],
    'Con external añade «(se abre en otra pestaña)» para lectores de pantalla. Dentro de un párrafo usa underline="always": el color no basta para distinguir un enlace.',
  ),
]

// id → { use: [...], avoid: [...], a11y: [...] }
export const guidelines = {
  status: {
    use: [
      'Úsalo para el estado de una fila en tablas y listas largas, como Produciendo, En obra o Pendiente de legalizar.',
      'Es la alternativa discreta a Badge: sin fondo, varias filas seguidas no compiten con el contenido.',
      'Activa pulse solo en estados «en vivo», como una instalación que está produciendo ahora.',
    ],
    avoid: [
      'Para destacar un estado suelto en una cabecera o una tarjeta usa Badge.',
      'No uses pulse en más de un estado por vista: el movimiento atrae la mirada.',
      'Usa siempre el mismo tone para el mismo estado en todas las pantallas.',
    ],
    a11y: ['El punto es decorativo y se oculta. El texto debe entenderse sin el color.', 'pulse se detiene con prefers-reduced-motion.'],
  },
  progress: {
    use: [
      'Úsalo para tareas que avanzan, como la subida de un archivo o la legalización de una instalación.',
      'Usa steps cuando el progreso son trámites contables: «Paso 3 de 5».',
      'Usa value={null} cuando no sabes cuánto falta, como al calcular la producción.',
    ],
    avoid: [
      'Para esperas cortas sin progreso medible usa Spinner.',
      'No lo uses para mostrar una cantidad, como la cuota de autoconsumo. Usa un Kpi o un gráfico.',
      'Reserva danger para un proceso con error, no para un valor bajo.',
    ],
    a11y: [
      'Dale siempre un label que diga qué progresa; si no se ve, se usa como nombre accesible.',
      'aria-valuetext da el valor en el formato del idioma («64 %», «Paso 3 de 5»).',
      'La animación indeterminada se detiene con prefers-reduced-motion.',
    ],
  },
  'description-list': {
    use: [
      'Úsala para fichas de cliente o de instalación: dirección, potencia, CUPS, referencia catastral.',
      'Añade copy en los códigos que se pegan en otras herramientas, como el CUPS.',
      'Usa layout="stacked" para resúmenes cortos con varias cifras.',
    ],
    avoid: [
      'Para comparar varias filas con las mismas columnas usa Table.',
      'No la uses como formulario. Para editar, usa Field en un Dialog o un Drawer.',
    ],
    a11y: [
      'Usa <dl>: cada dato queda asociado a su valor para los lectores de pantalla.',
      'El botón de copiar se llama «Copiar {dato}», así se distingue de los demás.',
    ],
  },
  'copy-button': {
    use: [
      'Úsalo junto a valores que se pegan en otro sitio: CUPS, referencia catastral, número de expediente o un enlace.',
      'Con iconOnly, dentro de una ficha o una tabla, junto al valor que copia.',
    ],
    avoid: [
      'No lo uses para valores que la persona no necesita fuera de la aplicación.',
      'No muestres un Toast además: el propio botón confirma la copia.',
    ],
    a11y: [
      'Con iconOnly, label es el nombre accesible: «Copiar CUPS» mejor que «Copiar».',
      'El resultado («Copiado» o «No se pudo copiar») se anuncia en una región aria-live.',
      'El foco se queda en el botón después de copiar.',
    ],
  },
  tag: {
    use: [
      'Úsalo para valores que se añaden y se quitan, como las provincias de una zona o las etiquetas de un cliente.',
      'Agrupa varios Tag en una fila con espacio entre ellos.',
    ],
    avoid: [
      'Para un estado que solo informa usa Badge o Status.',
      'Para filtros activos de una lista usa FilterChip dentro de FilterBar.',
      'No lo uses como botón ni como enlace.',
    ],
    a11y: [
      'El botón de quitar se llama «Quitar {label}». Si el contenido no es texto, pasa label o removeLabel.',
      'Al quitar una etiqueta el foco pasa a la vecina. Si era la única, lleva el foco al campo que añade etiquetas.',
    ],
  },
  'avatar-group': {
    use: [
      'Úsalo para mostrar quién trabaja en algo, como el equipo de una instalación.',
      'Ajusta max al espacio: en tablas, 3 o 4 avatares pequeños.',
    ],
    avoid: [
      'Si la lista de personas es la información principal, usa una lista con nombres.',
      'No mezcles tamaños dentro del mismo grupo.',
    ],
    a11y: [
      'Cada avatar se anuncia con su nombre; el resto, como «y N más».',
      'Los nombres ocultos aparecen al pasar el ratón; si importan, muéstralos en otro sitio.',
    ],
  },
  kbd: {
    use: [
      'Úsalo para enseñar atajos dentro de un texto de ayuda o de un menú, como Ctrl + K.',
      'Escribe las teclas como aparecen en el teclado: Ctrl, Mayús, Esc, ⌘.',
    ],
    avoid: [
      'No lo uses para códigos o valores. Para eso usa una fuente monoespaciada o DescriptionList con mono.',
      'No pongas el atajo como único modo de hacer algo.',
    ],
    a11y: ['Las teclas se leen como texto: «Ctrl más K».', 'Si el atajo depende del sistema, indica las dos variantes (Ctrl y ⌘).'],
  },
  separator: {
    use: [
      'Úsalo para separar bloques sin añadir una tarjeta, como dos formas de entrar con label="o".',
      'La vertical separa datos en línea: potencia, módulos y provincia.',
    ],
    avoid: ['No separes cada fila de una lista: el espacio basta.', 'No lo combines con bordes de tarjeta en el mismo lado.'],
    a11y: [
      'Por defecto es decorativo y se oculta. Usa decorative={false} si separa secciones con significado.',
      'Con decorative={false} y label, el texto pasa a aria-label.',
    ],
  },
  link: {
    use: [
      'Úsalo para ir a otra página o a otra web: la ficha de un cliente o la Sede del Catastro.',
      'Pasa as con el Link del router para navegar sin recargar.',
      'Usa tone="muted" para enlaces secundarios, como el historial.',
    ],
    avoid: ['Para acciones que cambian datos usa Button.', 'Evita textos como «aquí» o «más información». Nombra el destino.'],
    a11y: [
      'Dentro de un párrafo usa underline="always": el color no basta para reconocer un enlace.',
      'Con external se anuncia «(se abre en otra pestaña)».',
      'El foco se ve con un contorno de 2 px.',
    ],
  },
}
