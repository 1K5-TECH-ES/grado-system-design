// Web de documentación · grupo «maquetación y tipografía»: fichas de componente y guías de uso.
// entry(id, nombre, categoría, descripción, react(...), vue(...), props, nota) como en components.mjs.
// Categorías: Acciones, Formularios, Datos, Estructura, Navegación, Superposiciones, Respuesta.
// La demo en vivo de cada id está en maquetacion.demos.mjs.
import { entry, react, vue } from '../doc-helpers.mjs'

const gapRow = ['gap', "Clave de la escala de espacio: '0-5', '1', '1-5', '2' … '8', '10', '12', '16'", "'4' (16 px)"]
const asRow = (tag) => ['as', 'Etiqueta o componente que se pinta', tag]

export const entries = [
  entry(
    'stack',
    'Stack',
    'Estructura',
    'Apila elementos en columna o en fila con un hueco de la escala de espacio.',
    react(
      'Stack, Heading, Text, Button',
      `<Stack direction="row" justify="between" wrap>
  <Stack gap="0-5">
    <Heading level={2}>Lucía Fernández</Heading>
    <Text tone="muted" size="small">Valencia · 8,4 kWp</Text>
  </Stack>
  <Stack direction="row" gap="2">
    <Button variant="secondary">Ver ficha</Button>
    <Button>Nueva oferta</Button>
  </Stack>
</Stack>`,
    ),
    vue(
      'Stack, Heading, Text, Button',
      `<Stack direction="row" justify="between" wrap>
  <Stack gap="0-5">
    <Heading :level="2">Lucía Fernández</Heading>
    <Text tone="muted" size="small">Valencia · 8,4 kWp</Text>
  </Stack>
  <Stack direction="row" gap="2">
    <Button variant="secondary">Ver ficha</Button>
    <Button>Nueva oferta</Button>
  </Stack>
</Stack>`,
    ),
    [
      asRow('div'),
      ['direction', 'column · row', 'column'],
      gapRow,
      ['align', 'start · center · end · stretch · baseline', 'stretch en columna; center en fila'],
      ['justify', 'start · center · end · between', 'start'],
      ['wrap', 'Pasa a la línea siguiente lo que no cabe', 'false'],
    ],
    'Solo pone clases (k5-stack, k5-gap-*, k5-align-*, k5-justify-*): sin estilos en línea, compatible con una CSP estricta. En HTML puedes usar stackClass() de @1k5/grado/classes. Las clases k5-gap-* sirven también en cualquier flex o grid propio.',
  ),
  entry(
    'grid',
    'Grid',
    'Estructura',
    'Coloca en rejilla piezas del mismo peso, como tarjetas o indicadores.',
    react(
      'Grid, Card, CardContent',
      `<Grid columns={3}>
  <Card><CardContent>Valencia · 8,4 kWp</CardContent></Card>
  <Card><CardContent>Murcia · 5,2 kWp</CardContent></Card>
  <Card><CardContent>Sevilla · 6,6 kWp</CardContent></Card>
</Grid>`,
    ),
    vue(
      'Grid, Card, CardContent',
      `<Grid :columns="3">
  <Card><CardContent>Valencia · 8,4 kWp</CardContent></Card>
  <Card><CardContent>Murcia · 5,2 kWp</CardContent></Card>
  <Card><CardContent>Sevilla · 6,6 kWp</CardContent></Card>
</Grid>`,
    ),
    [
      asRow('div'),
      ['columns', "1–6 columnas iguales o 'auto': tantas como quepan", "'auto'"],
      ['minItemWidth', "Con columns='auto': sm (12rem) · md (16rem) · lg (20rem)", 'md'],
      gapRow,
    ],
    'Por debajo de 600 px las columnas fijas pasan a una. Con auto-fit las columnas aparecen y desaparecen según el ancho disponible, sin media queries, y los elementos se reparten el sobrante.',
  ),
  entry(
    'container',
    'Container',
    'Estructura',
    'Limita el ancho del contenido y lo centra en la página.',
    react(
      'Container, PageHeader',
      `<Container size="md" as="main">
  <PageHeader title="Ficha de la instalación" />
</Container>`,
    ),
    vue(
      'Container, PageHeader',
      `<Container size="md" as="main">
  <PageHeader title="Ficha de la instalación" />
</Container>`,
    ),
    [
      asRow('div'),
      ['size', 'sm (40rem, formularios) · md (60rem, fichas) · lg (80rem, listados)', 'lg'],
      ['padded', 'Margen lateral de 16 px; 24 px desde 768 px', 'true'],
    ],
    'Usa los tokens --k5-container-sm, md y lg. El margen lateral cuenta dentro del ancho máximo. Con padded en false el contenido llega al borde: útil dentro de un panel que ya tiene relleno.',
  ),
  entry(
    'text',
    'Text',
    'Estructura',
    'Párrafo o texto en línea con un paso de la escala tipográfica.',
    react(
      'Text',
      `<>
  <Text size="lead">Ahorra hasta un 70 % en la factura de la luz.</Text>
  <Text tone="muted" size="small">Última lectura: hoy a las 10:30.</Text>
  <Text as="span" tone="success" weight="medium">Conectada</Text>
</>`,
    ),
    vue(
      'Text',
      `<Text size="lead">Ahorra hasta un 70 % en la factura de la luz.</Text>
<Text tone="muted" size="small">Última lectura: hoy a las 10:30.</Text>
<Text as="span" tone="success" weight="medium">Conectada</Text>`,
    ),
    [
      asRow('p'),
      ['size', 'caption · small · body · lead', 'body'],
      ['tone', 'default · muted · primary · success · warning · danger · info', 'default (hereda el color)'],
      ['weight', 'regular · medium · semibold', 'regular'],
      ['truncate', 'Una línea con puntos suspensivos', 'false'],
      ['numeric', 'Cifras tabulares para que los números se alineen', 'false'],
    ],
    'Usa --k5-text-* y --k5-leading-* de cada paso. Los tonos de estado usan --k5-*-text, que llegan a 4,5 : 1 sobre el fondo y sobre su tinte. Text no deja márgenes: separa los párrafos con Stack.',
  ),
  entry(
    'heading',
    'Heading',
    'Estructura',
    'Título de sección con el nivel correcto y el tamaño que pida el diseño.',
    react(
      'Heading',
      `<>
  <Heading level={2}>Documentación de la obra</Heading>
  <Heading level={3} size="title">1.042 kWp instalados</Heading>
</>`,
    ),
    vue(
      'Heading',
      `<Heading :level="2">Documentación de la obra</Heading>
<Heading :level="3" size="title">1.042 kWp instalados</Heading>`,
    ),
    [
      ['level', '1–6: la etiqueta h1 … h6', 'Obligatorio'],
      ['size', 'lead · heading · title · display', 'Según el nivel: 1 → title, 2 → heading, 3–6 → lead'],
      ['as', 'Otra etiqueta en lugar de h<level>, por ejemplo legend', 'h<level>'],
    ],
    'Semibold, con text-wrap: balance. title y display aprietan el espaciado con --k5-tracking-title y --k5-tracking-display. level marca la estructura del documento; size, solo el aspecto.',
  ),
]

// id → { use: [...], avoid: [...], a11y: [...] }
export const guidelines = {
  stack: {
    use: [
      'Úsalo para poner elementos uno detrás de otro en una sola dirección: los campos de un formulario, el título y su descripción, una fila de botones.',
      'Elige gap de la escala de espacio: 1 o 2 entre piezas de un mismo bloque, 4 entre bloques, 6 u 8 entre secciones.',
      'En fila, usa justify="between" para separar título y acciones, y wrap para que pasen debajo en móvil.',
    ],
    avoid: [
      'Si los elementos tienen el mismo peso y deben alinearse en columnas, como tarjetas o indicadores, usa Grid.',
      'No anides Stack para lograr una rejilla: con dos dimensiones el contenido no se alinea entre filas.',
      'No añadas márgenes a los hijos para separarlos. El hueco lo pone gap.',
    ],
    a11y: [
      'Stack no cambia la semántica: con as="ul" o as="ol" una lista se anuncia como lista.',
      'El orden visual es el del código. No uses direction ni CSS para reordenar: el teclado y los lectores de pantalla siguen el código.',
    ],
  },
  grid: {
    use: [
      'Úsalo para piezas del mismo peso que deben alinearse en filas y columnas: tarjetas de instalaciones, KPI, campos cortos de un formulario.',
      "Con columns='auto' la rejilla se adapta sola al ancho; minItemWidth fija el ancho mínimo de cada pieza.",
      'Usa columnas fijas (2, 3, 4…) cuando el diseño pide un número concreto en escritorio. En móvil pasan a una.',
    ],
    avoid: [
      'Para una sola fila o columna, como una cabecera con acciones, usa Stack.',
      'No la uses para la estructura de la página (barra lateral y contenido): eso es AppShell.',
      'Evita más de cuatro columnas con texto: cada pieza queda demasiado estrecha para leerse.',
    ],
    a11y: [
      'Grid no cambia la semántica. Si las piezas son una lista, usa as="ul" e hijos li.',
      'El orden de lectura y de tabulación es el del código, de izquierda a derecha y de arriba abajo.',
    ],
  },
  container: {
    use: [
      'Úsalo para limitar el ancho del contenido principal y centrarlo en pantallas grandes.',
      'sm para formularios, md para fichas y páginas de detalle, lg para listados y tablas.',
    ],
    avoid: [
      'Dentro de AppShell, el área principal ya tiene relleno: usa padded en false o limita solo el ancho.',
      'No anides varios Container. Para estrechar una parte de la página basta un size más pequeño en esa parte.',
    ],
    a11y: [
      'Con as="main" puede ser la región principal de la página. Solo debe haber un main.',
      'Las líneas de texto largas cuestan de leer: en páginas de lectura, usa sm o md.',
    ],
  },
  text: {
    use: [
      'Úsalo para párrafos y textos sueltos con un tamaño de la escala: lead para la entradilla, body para el texto normal, small y caption para datos secundarios.',
      'Usa tone="muted" para lo secundario y los tonos de estado solo para estado: Conectada, Pendiente, Incidencia.',
      'Usa numeric en cifras que se comparan entre filas, como kWp o importes.',
    ],
    avoid: [
      'No uses el color para dar jerarquía. Para destacar, sube el tamaño o el peso.',
      'No uses truncate en datos que hay que leer enteros, como un CUPS o un IBAN. Si recortas, ofrece el texto completo en otro sitio.',
      'Para títulos usa Heading, no Text con weight="semibold".',
    ],
    a11y: [
      'Por defecto es un p. Usa as="span" dentro de otro párrafo o de un botón.',
      'El color no se anuncia: el texto debe entenderse sin él, como «Conectada» o «Pendiente de legalizar».',
      'Los tonos de estado usan --k5-*-text y llegan a 4,5 : 1 en los dos temas y los dos modos.',
    ],
  },
  heading: {
    use: [
      'Úsalo para los títulos de las secciones y bloques de una pantalla, con el level que les toca en el esquema.',
      'Usa size cuando el diseño pide otro tamaño: un h3 con size="title" en un resumen, o un h2 pequeño con size="lead".',
    ],
    avoid: [
      'No sustituye a PageHeader. El título de la pantalla, con su subtítulo y sus acciones, va en PageHeader.',
      'No elijas el level por el tamaño. El level sigue el esquema del documento; el tamaño se cambia con size.',
      'No saltes niveles, de h2 a h4, para conseguir un título más pequeño.',
    ],
    a11y: [
      'Los lectores de pantalla navegan por encabezados: el orden de level debe reflejar la estructura de la página.',
      'Si la página ya tiene el h1 de PageHeader, empieza las secciones en level 2.',
      'Con as cambias la etiqueta y pierdes el encabezado. Úsalo solo cuando el elemento no es un título de sección, como un legend.',
    ],
  },
}
