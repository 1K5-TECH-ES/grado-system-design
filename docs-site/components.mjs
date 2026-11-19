import { entry, react, vue, list } from './doc-helpers.mjs'
import { entries as maquetacionEntries } from './groups/maquetacion.docs.mjs'
import { entries as datosEntries } from './groups/datos.docs.mjs'
import { entries as graficosEntries } from './groups/graficos.docs.mjs'
import { entries as entradasEntries } from './groups/entradas.docs.mjs'
import { entries as superposicionesEntries } from './groups/superposiciones.docs.mjs'
import { entries as energiaEntries } from './groups/energia.docs.mjs'
import { entries as labsEntries } from './groups/labs.docs.mjs'

const modalProps = [
  ['title / description', 'Título y descripción accesibles', 'title obligatorio'],
  ['open', 'React: onOpenChange · Vue: v-model:open', 'false'],
  ['footer', 'Contenido React / slot Vue', '—'],
  ['closeOnOutside', 'Cerrar al pulsar fuera; AlertDialog lo desactiva', 'true'],
  ['closeOnEscape', 'false: Escape no cierra y la app lo usa para lo suyo (cancelar una acción)', 'true'],
  ['fullscreen', 'La ventana menos 1 rem por lado: editores, visores de planos', 'false'],
  ['header', 'false: sin cabecera ni aspa; el título nombra el diálogo solo para lectores y el cuerpo va sin márgenes', 'true'],
  ['Atributos', 'React: onKeyDown, onPaste, style… van al <dialog> · Vue: attrs', '—'],
]
const items = list(
  "{ value: 'resumen', label: 'Resumen', content: 'Datos de la instalación' }",
  "{ value: 'documentos', label: 'Documentos', content: 'Memoria técnica' }",
)
const options = list("{ value: 'solar', label: 'Solo placas' }", "{ value: 'bateria', label: 'Placas y batería' }")
const clients = list("{ value: 'lucia', label: 'Lucía Fernández' }", "{ value: 'javier', label: 'Javier Ortega' }")
const menu = list("{ id: 'edit', label: 'Editar' }", "{ id: 'delete', label: 'Eliminar', danger: true, separator: true }")
const steps = list(
  "{ id: 'cliente', label: 'Cliente' }",
  "{ id: 'instalacion', label: 'Instalación' }",
  "{ id: 'oferta', label: 'Oferta' }",
)
const history = list(
  "{ id: '1', title: 'Instalación conectada', date: '12 oct 2026', dateTime: '2026-10-12', tone: 'success' }",
  "{ id: '2', title: 'Oferta aceptada', date: '2 oct 2026', dateTime: '2026-10-02' }",
)
const sections = list(
  "{ value: 'documentos', title: 'Documentación', content: 'Memoria y certificado.' }",
  "{ value: 'plazos', title: 'Plazos', content: 'Consulta el estado en la ficha.' }",
)
const trail = list("{ label: 'Inicio', href: '/' }", "{ label: 'Instalaciones', href: '/instalaciones' }", "{ label: 'Lucía Fernández' }")
const tableRows = list("{ id: '1', cliente: 'Lucía', potencia: 6.2 }", "{ id: '2', cliente: 'Javier', potencia: 8.4 }")
const tableCols = `[
  { key: 'cliente', header: 'Cliente', sortable: true },
  { key: 'potencia', header: 'Potencia', sortable: true, numeric: true,
    render: (row) => row.potencia.toLocaleString('es-ES') + ' kWp' },
]`
const openState = 'const [open, setOpen] = useState(false);'
const summaryErrors = list(
  "{ id: 'nif', label: 'NIF del titular', message: 'La letra del DNI no coincide.' }",
  "{ id: 'iban', label: 'IBAN', message: 'Faltan 4 dígitos.' }",
)

export const newComponents = [
  entry(
    'dialog',
    'Dialog',
    'Superposiciones',
    'Edita o consulta información manteniendo el contexto de la pantalla.',
    react(
      'Dialog, Button',
      `<>
  <Button onClick={() => setOpen(true)}>Abrir</Button>
  <Dialog
    open={open}
    onOpenChange={setOpen}
    title="Editar instalación"
    footer={<Button onClick={() => setOpen(false)}>Guardar</Button>}
  >
    Contenido del formulario
  </Dialog>
</>`,
      openState,
    ),
    vue(
      'Dialog, Button',
      `<Button @click="open = true">Abrir</Button>
<Dialog v-model:open="open" title="Editar instalación">
  Contenido del formulario
  <template #footer>
    <Button @click="open = false">Guardar</Button>
  </template>
</Dialog>`,
      'const open = ref(false);',
    ),
    modalProps,
    'Usa dialog.showModal(): el navegador gestiona el foco modal y bloquea la interacción exterior. Escape solicita el cierre; el foco vuelve al control que lo abrió. La aplicación gestiona el guardado.',
  ),
  entry(
    'alert-dialog',
    'AlertDialog',
    'Superposiciones',
    'Una confirmación explícita para acciones que requieren especial atención.',
    react(
      'AlertDialog, Button',
      `<>
  <Button variant="danger" onClick={() => setOpen(true)}>Eliminar</Button>
  <AlertDialog
    open={open}
    onOpenChange={setOpen}
    title="¿Eliminar instalación?"
    description="Confirma antes de continuar."
    footer={<>
      <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
      <Button variant="destructive" onClick={() => setOpen(false)}>Confirmar</Button>
    </>}
  >
    Conecta la confirmación a tu lógica de negocio.
  </AlertDialog>
</>`,
      openState,
    ),
    vue(
      'AlertDialog, Button',
      `<Button variant="danger" @click="open = true">Eliminar</Button>
<AlertDialog
  v-model:open="open"
  title="¿Eliminar instalación?"
  description="Confirma antes de continuar."
>
  Conecta la confirmación a tu lógica de negocio.
  <template #footer>
    <Button variant="secondary" @click="open = false">Cancelar</Button>
    <Button variant="destructive" @click="open = false">Confirmar</Button>
  </template>
</AlertDialog>`,
      'const open = ref(false);',
    ),
    modalProps,
    'No se cierra al pulsar el fondo. Escape y el botón de cierre cancelan; nunca ejecutan la confirmación.',
  ),
  entry(
    'drawer',
    'Drawer / Sheet',
    'Superposiciones',
    'Un panel lateral para abrir una ficha sin abandonar el listado.',
    react(
      'Drawer, Button',
      `<>
  <Button onClick={() => setOpen(true)}>Abrir ficha</Button>
  <Drawer open={open} onOpenChange={setOpen} title="Ficha del cliente">
    Contenido de la ficha
  </Drawer>
</>`,
      openState,
    ),
    vue(
      'Drawer, Button',
      `<Button @click="open = true">Abrir ficha</Button>
<Drawer v-model:open="open" title="Ficha del cliente">
  Contenido de la ficha
</Drawer>`,
      'const open = ref(false);',
    ),
    [
      ...modalProps,
      ['side', 'left · right', 'right'],
      [
        'modal',
        'false: vista previa sin velo. La página sigue usable detrás (pasar de una fila a otra) y Escape, con el foco en el panel, o el botón de cierre lo cierran',
        'true',
      ],
    ],
    'Sheet es un alias de Drawer. En móvil el panel ocupa el ancho disponible.',
  ),
  entry(
    'tabs',
    'Tabs',
    'Navegación',
    'Agrupa vistas relacionadas y permite recorrerlas con las flechas del teclado.',
    react('Tabs', `<Tabs label="Ficha de instalación" items={items} />`, `const items = ${items};`),
    vue('Tabs', `<Tabs label="Ficha de instalación" :items="items" />`, `const items = ${items};`),
    [
      ['items', 'value, label, content, disabled', 'Obligatorio'],
      ['value / modelValue', 'React: onValueChange · Vue: v-model', 'Primera habilitada'],
      ['variant', 'line · pill · view (pastillas con borde para cambiar de vista una lista)', 'line'],
    ],
    'Vue admite slots con el nombre de cada value para contenido complejo. Flechas izquierda/derecha, Home y End cambian la pestaña; las desactivadas se omiten.',
  ),
  entry(
    'checkbox',
    'Checkbox',
    'Formularios',
    'Selección independiente con etiqueta, ayuda y estado intermedio.',
    react(
      'Checkbox',
      `<Checkbox label="Incluir batería" checked={checked} onCheckedChange={setChecked} />`,
      'const [checked, setChecked] = useState(false);',
    ),
    vue('Checkbox', `<Checkbox v-model="checked" label="Incluir batería" />`, 'const checked = ref(false);'),
    [
      ['checked / modelValue', 'React: onCheckedChange · Vue: v-model', 'false'],
      ['indeterminate', 'Selección parcial', 'false'],
      ['label / description', 'Etiqueta / ayuda', '—'],
      ['Atributos nativos', 'name, value, disabled, required', '—'],
    ],
    'Hereda los atributos de Field. React reenvía ref. En Vue se expone focus() y la referencia input.',
  ),
  entry(
    'radio-group',
    'RadioGroup',
    'Formularios',
    'Elige una sola alternativa con controles nativos y una etiqueta de grupo.',
    react(
      'RadioGroup',
      `<RadioGroup label="Instalación" options={options} value={tipo} onValueChange={setTipo} />`,
      `const [tipo, setTipo] = useState('solar');\nconst options = ${options};`,
    ),
    vue(
      'RadioGroup',
      `<RadioGroup v-model="tipo" label="Instalación" :options="options" />`,
      `const tipo = ref('solar');\nconst options = ${options};`,
    ),
    [
      ['options', 'value, label, description, disabled', 'Obligatorio'],
      ['value / modelValue', 'React: onValueChange · Vue: v-model', 'Vacío'],
      ['orientation', 'vertical · horizontal', 'vertical'],
      ['variant', 'default · card (cada opción es una tarjeta con borde; en horizontal, en columnas)', 'default'],
      ['name / required / disabled', 'Atributos del formulario', '—'],
    ],
  ),
  entry(
    'dropdown-menu',
    'DropdownMenu',
    'Acciones',
    'Acciones secundarias en un menú compacto con navegación por teclado.',
    react('DropdownMenu', `<DropdownMenu label="Acciones" items={items} onAction={(id) => console.log(id)} />`, `const items = ${menu};`),
    vue('DropdownMenu', `<DropdownMenu label="Acciones" :items="items" @action="(id) => console.log(id)" />`, `const items = ${menu};`),
    [
      ['items', 'id, label, disabled, danger, separator, shortcut', 'Obligatorio'],
      ['onAction / @action', 'Recibe el id de la acción', '—'],
      ['disabled', 'Desactiva el botón', 'false'],
      ['align', 'start · end: borde del botón con el que se alinea; si no cabe, se abre hacia el otro lado', 'end'],
    ],
    'Flechas, Home, End y búsqueda por inicial. Escape cierra y devuelve el foco. Tab sale del menú. Las acciones desactivadas se omiten.',
  ),
  entry(
    'toast',
    'Toast',
    'Respuesta',
    'Una notificación temporal, descartable y con pausa al interactuar.',
    react(
      'Toast, Button',
      `<>
  <Button onClick={() => setOpen(true)}>Guardar</Button>
  <Toast open={open} onOpenChange={setOpen} title="Cambios guardados" tone="success">
    Tu instalación se ha actualizado.
  </Toast>
</>`,
      openState,
    ),
    vue(
      'Toast, Button',
      `<Button @click="open = true">Guardar</Button>
<Toast v-model:open="open" title="Cambios guardados" tone="success">
  Tu instalación se ha actualizado.
</Toast>`,
      'const open = ref(false);',
    ),
    [
      ['open', 'React: onOpenChange · Vue: v-model:open', 'Obligatorio'],
      ['duration', 'Milisegundos; 0 mantiene el aviso', '5000'],
      ['tone', 'info · success · warning · danger', 'info'],
    ],
    'El temporizador se pausa con el puntero o el foco dentro. Muestra un Toast activo por posición; para varios avisos seguidos, usa toast() y Toaster.',
  ),
  entry(
    'form',
    'Form, FormField',
    'Formularios',
    'Formularios con react-hook-form o VeeValidate: cada campo con su etiqueta, su error y su validación, y un resumen de errores al enviar.',
    `import { Button, Input, NifInput, NumberInput, toast } from '@1k5-tech-es/grado-react';
import { ErrorSummary, Form, FormField } from '@1k5-tech-es/grado-react/react-hook-form';

const maxKwp = (kwp) => kwp == null || kwp <= 15 || 'Como mucho 15 kWp';

export default function Ejemplo() {
  return (
    <Form defaultValues={{ titular: '', nif: '', kwp: null }} onSubmit={() => toast.success('Oferta enviada')}>
      <ErrorSummary />
      <FormField name="titular" label="Titular" required>
        <Input />
      </FormField>
      <FormField name="nif" label="NIF del titular" hint="DNI, NIE o CIF" required>
        <NifInput />
      </FormField>
      <FormField name="kwp" label="Potencia" validate={maxKwp}>
        <NumberInput step={0.1} suffix="kWp" />
      </FormField>
      <Button type="submit">Enviar oferta</Button>
    </Form>
  );
}`,
    `<script setup>
import { Button, Input, NifInput, NumberInput, toast } from '@1k5-tech-es/grado-vue';
import { ErrorSummary, Form, FormField } from '@1k5-tech-es/grado-vue/vee-validate';

const maxKwp = (kwp) => kwp == null || kwp <= 15 || 'Como mucho 15 kWp';
</script>

<template>
  <Form :initial-values="{ titular: '', nif: '', kwp: null }" @submit="toast.success('Oferta enviada')">
    <ErrorSummary />
    <FormField name="titular" label="Titular" required>
      <Input />
    </FormField>
    <FormField name="nif" label="NIF del titular" hint="DNI, NIE o CIF" required>
      <NifInput />
    </FormField>
    <FormField name="kwp" label="Potencia" :validate="maxKwp">
      <NumberInput :step="0.1" suffix="kWp" />
    </FormField>
    <Button type="submit">Enviar oferta</Button>
  </Form>
</template>`,
    [
      ['Form', 'React: defaultValues, mode y errors (del servidor), o form={useForm()} · Vue: initial-values e initial-errors', '—'],
      ['onSubmit / @submit', 'Recibe los valores, solo si todo vale. onInvalid / @invalid, si hay errores', '—'],
      ['FormField: name, label, hint', 'Nombre del campo en los valores, etiqueta y ayuda', 'name obligatorio'],
      ['required', 'Asterisco, aria-required y «Este campo es obligatorio» si está vacío', 'false'],
      ['validate', '(valor, valores) => true, el texto del error o false. Una o varias; pueden ser async', '—'],
      ['ErrorSummary', 'Lista de errores con un enlace a cada campo. Aparece al enviar con errores', 'title'],
    ],
    'react-hook-form y vee-validate son dependencias opcionales: solo las cargan estos imports. FormField conecta su control (value, checked o v-model, según el tipo) y le pone id, ref y aria-invalid. NifInput, IbanInput, PhoneInput y TimePicker validan su formato solos. Se valida al enviar y, después, en cada cambio; el foco va al primer campo con error.',
  ),
  entry(
    'error-summary',
    'ErrorSummary',
    'Formularios',
    'La lista de errores de un formulario, con un enlace a cada campo.',
    react('ErrorSummary', `<ErrorSummary errors={errors} />`, `const errors = ${summaryErrors};`),
    vue('ErrorSummary', `<ErrorSummary :errors="errors" />`, `const errors = ${summaryErrors};`),
    [
      ['errors', 'id del control, message y label (opcional), en el orden de los campos', 'Obligatorio'],
      ['title', 'Título del resumen', '«Revisa 2 campos antes de continuar»'],
    ],
    'Sin errores no pinta nada. Con react-hook-form o VeeValidate usa el ErrorSummary de su adaptador, que se rellena solo; este sirve para cualquier otra validación.',
  ),
  entry(
    'toaster',
    'Toaster',
    'Respuesta',
    'La cola de avisos: lanza toast() desde cualquier parte de la app y Toaster los muestra por orden.',
    react(
      'Button, Toaster, toast',
      `<>
  <Button onClick={enviar}>Enviar oferta</Button>
  <Toaster />
</>`,
      `const enviar = () =>
  toast.success('Oferta enviada', {
    description: 'A Lucía Fernández',
    action: { label: 'Deshacer', shortcut: ['⌘', 'Z'], onClick: () => toast('Envío deshecho') },
  });`,
    ),
    vue(
      'Button, Toaster, toast',
      `<Button @click="enviar">Enviar oferta</Button>
<Toaster />`,
      `const enviar = () =>
  toast.success('Oferta enviada', {
    description: 'A Lucía Fernández',
    action: { label: 'Deshacer', shortcut: ['⌘', 'Z'], onClick: () => toast('Envío deshecho') },
  });`,
    ),
    [
      [
        'toast(título, opciones)',
        'tone, description, action { label, onClick, shortcut } (shortcut pinta las teclas y pone aria-keyshortcuts; la app escucha la tecla), duration (0: hasta que se cierre), id',
        '—',
      ],
      ['toast.success · warning · error · info', 'El mismo aviso con su tono. error se anuncia con role="alert"', '—'],
      ['toast.promise(promesa, textos)', 'loading mientras sigue; después success o error, que pueden ser funciones', '—'],
      ['toast.dismiss(id?)', 'Cierra un aviso o, sin id, todos', '—'],
      ['max', 'Avisos a la vez en Toaster; los demás esperan su turno', '3'],
      ['label', 'Nombre de la región para lectores de pantalla', 'Notificaciones'],
    ],
    'Pon un solo Toaster en la app. Los avisos salen por orden de llegada y los que no caben esperan, así que no se pierde ninguno. El tiempo de cada uno empieza cuando se ve y se pausa con el puntero o el foco dentro.',
  ),
  entry(
    'alert',
    'Alert',
    'Respuesta',
    'Información persistente que acompaña al contenido y explica qué hacer.',
    react(
      'Alert',
      `<Alert title="Documentación pendiente" tone="warning">
  Añade el certificado de instalación.
</Alert>`,
    ),
    vue(
      'Alert',
      `<Alert title="Documentación pendiente" tone="warning">
  Añade el certificado de instalación.
</Alert>`,
    ),
    [
      ['title / children', 'Vue: title / slot por defecto', 'title obligatorio'],
      ['tone', 'info · success · warning · danger', 'info'],
      ['action', 'Prop React / slot Vue', '—'],
      ['Cierre', 'React: onDismiss · Vue: dismissible + @dismiss', 'Oculto'],
    ],
    'Usa role="alert" para mensajes urgentes. El valor por defecto es status, con anuncios menos intrusivos.',
  ),
  entry(
    'tooltip',
    'Tooltip',
    'Respuesta',
    'Una explicación breve para un botón de ayuda, o para cualquier control (el atajo de un botón), accesible con teclado.',
    react(
      'Tooltip',
      `<>
  <Tooltip label="Ayuda de potencia" content="Potencia máxima de los módulos" />
  <Tooltip content="Ctrl + Mayús + U" trigger={<Button variant="secondary">Unifilar</Button>} />
</>`,
    ),
    vue(
      'Tooltip',
      `<Tooltip label="Ayuda de potencia" content="Potencia máxima de los módulos" />
<Tooltip content="Ctrl + Mayús + U">
  <template #trigger><Button variant="secondary">Unifilar</Button></template>
</Tooltip>`,
    ),
    [
      ['label', 'Nombre accesible del botón de información', 'Obligatorio sin trigger'],
      ['content', 'Texto de ayuda (Vue: también slot content); no controles interactivos', 'Obligatorio'],
      ['children / slot', 'Contenido visual del botón de información', 'Icono de información'],
      ['trigger', 'React: el control / Vue: slot trigger. Lo acompaña en lugar del botón de información y recibe aria-describedby', '—'],
      ['shortcut', "Teclas del atajo del control: ['⌘', 'L']. Van tras el texto y el control recibe aria-keyshortcuts", '—'],
    ],
    'Se abre con puntero o foco. Escape lo descarta. Evita colocar el disparador dentro de contenedores que recorten el contenido.',
  ),
  entry(
    'skeleton',
    'Skeleton',
    'Respuesta',
    'Representa la forma del contenido mientras llegan los datos.',
    react(
      'Skeleton',
      `<div role="status" aria-label="Cargando ficha">
  <Skeleton width={40} height={40} circle />
  <Skeleton height="1rem" />
  <Skeleton width="70%" />
</div>`,
    ),
    vue(
      'Skeleton',
      `<div role="status" aria-label="Cargando ficha">
  <Skeleton :width="40" :height="40" circle />
  <Skeleton height="1rem" />
  <Skeleton width="70%" />
</div>`,
    ),
    [
      ['width / height', 'Medida CSS o píxeles numéricos', '100% / 1rem'],
      ['circle', 'Forma circular', 'false'],
    ],
    'Las piezas son decorativas. Añade el anuncio de carga al contenedor. La animación se desactiva con prefers-reduced-motion.',
  ),
  entry(
    'combobox',
    'Combobox',
    'Formularios',
    'Busca una opción por nombre y confirma una selección con teclado o ratón.',
    react(
      'Field, Combobox',
      `<Field label="Cliente">
  <Combobox options={options} value={cliente} onValueChange={setCliente} />
</Field>`,
      `const [cliente, setCliente] = useState('');\nconst options = ${clients};`,
    ),
    vue(
      'Field, Combobox',
      `<Field label="Cliente">
  <Combobox v-model="cliente" :options="options" />
</Field>`,
      `const cliente = ref('');\nconst options = ${clients};`,
    ),
    [
      ['options', 'value, label, disabled, keywords', 'Obligatorio'],
      ['value / modelValue', 'React: onValueChange · Vue: v-model', 'Vacío'],
      ['loading / emptyLabel', 'Carga / texto sin resultados', 'false / No hay resultados'],
      ['onQueryChange / @query-change', 'Texto de búsqueda para carga externa', '—'],
      [
        'onCreate',
        'Añade «Crear "…"» al final cuando lo escrito no es una opción y avisa con el texto. Vue: creatable y evento create. La app añade la opción y la selecciona',
        '—',
      ],
      ['name / required', 'Valor de formulario / obligatorio', '—'],
    ],
    'Selección única. Filtra sin distinguir tildes. Flechas recorren opciones; Enter selecciona y Escape cancela la búsqueda. La consulta a un servidor la gestiona la aplicación.',
  ),
  entry(
    'pagination',
    'Pagination',
    'Navegación',
    'Recorre resultados con un rango visible y páginas intermedias abreviadas.',
    react(
      'Pagination',
      `<Pagination total={128} pageSize={10} page={page} onPageChange={setPage} />`,
      'const [page, setPage] = useState(1);',
    ),
    vue('Pagination', `<Pagination v-model:page="page" :total="128" :page-size="10" />`, 'const page = ref(1);'),
    [
      ['total', 'Número de resultados', 'Obligatorio'],
      ['pageSize', 'Resultados por página', '10'],
      ['page', 'React: onPageChange · Vue: v-model:page', '1'],
    ],
    'La numeración empieza en 1. Desactiva anterior y siguiente en los extremos y limita la página visible al total disponible.',
  ),
  entry(
    'date-picker',
    'DatePicker',
    'Formularios',
    'Selector de fecha nativo con los estilos y la validación de Field.',
    react(
      'Field, DatePicker',
      `<Field label="Fecha de instalación">
  <DatePicker value={date} onValueChange={setDate} min="2026-01-01" max="2027-12-31" />
</Field>`,
      "const [date, setDate] = useState('2026-10-20');",
    ),
    vue(
      'Field, DatePicker',
      `<Field label="Fecha de instalación">
  <DatePicker v-model="date" min="2026-01-01" max="2027-12-31" />
</Field>`,
      "const date = ref('2026-10-20');",
    ),
    [
      ['value / modelValue', 'Fecha ISO YYYY-MM-DD, sin zona horaria', 'Vacío'],
      ['min / max', 'Fechas ISO límite', '—'],
      ['required / disabled / name', 'Atributos nativos', '—'],
    ],
    'La ventana del calendario la proporciona el navegador y puede variar entre dispositivos. El control mantiene los tokens de Grado.',
  ),
  entry(
    'date-range-picker',
    'DateRangePicker',
    'Formularios',
    'Dos fechas relacionadas con límites coherentes y validación del periodo.',
    react(
      'DateRangePicker',
      `<DateRangePicker label="Periodo" value={range} onValueChange={setRange} />`,
      "const [range, setRange] = useState({ start: '2026-10-01', end: '2026-10-31' });",
    ),
    vue(
      'DateRangePicker',
      `<DateRangePicker v-model="range" label="Periodo" />`,
      "const range = ref({ start: '2026-10-01', end: '2026-10-31' });",
    ),
    [
      ['value / modelValue', '{ start, end } con fechas ISO', 'Vacías'],
      ['min / max', 'Límites del periodo', '—'],
      ['name', 'Envía name[start] y name[end]', '—'],
    ],
    'Muestra un error si el rango recibido está invertido o fuera de los límites. Mantiene los valores para que la persona pueda corregirlos.',
  ),
  entry(
    'file-upload',
    'FileUpload',
    'Formularios',
    'Selecciona o arrastra archivos y muestra su progreso, errores y reintentos.',
    react(
      'FileUpload',
      `<FileUpload
  accept=".pdf,image/*"
  maxSize={5242880}
  multiple
  files={files}
  onFilesChange={(incoming) => setFiles(incoming.map((file, i) => ({ id: String(i), name: file.name })))}
  onRemove={(id) => setFiles(files.filter((file) => file.id !== id))}
/>`,
      'const [files, setFiles] = useState([]);',
    ),
    vue(
      'FileUpload',
      `<FileUpload
  accept=".pdf,image/*"
  :max-size="5242880"
  multiple
  removable
  :files="files"
  @files-change="receive"
  @remove="(id) => files = files.filter((file) => file.id !== id)"
/>`,
      `const files = ref([]);
function receive(incoming) {
  files.value = incoming.map((file, i) => ({ id: String(i), name: file.name }));
}`,
    ),
    [
      ['accept / maxSize / multiple', 'Formatos / bytes por archivo / selección múltiple', 'Sin límite / false'],
      ['files', 'id, name, status, progress, error', '[]'],
      ['onFilesChange / @files-change', 'Recibe File[] validados', '—'],
      ['Eliminar / reintentar', 'React: onRemove / onRetry · Vue: removable / retryable y eventos', 'Opcional'],
    ],
    'Selecciona archivos; no realiza subidas por su cuenta. Conecta tu API y actualiza status (uploading, success, error) y progress (0–100). La validación del navegador debe repetirse en el servidor.',
  ),
  entry(
    'stepper',
    'Stepper',
    'Navegación',
    'Explica dónde estás en un proceso y qué pasos quedan por completar.',
    react(
      'Stepper',
      `<Stepper items={items} value={step} onValueChange={setStep} />`,
      `const [step, setStep] = useState('instalacion');\nconst items = ${steps};`,
    ),
    vue('Stepper', `<Stepper v-model="step" :items="items" interactive />`, `const step = ref('instalacion');\nconst items = ${steps};`),
    [
      ['items', 'id, label, description, disabled', 'Obligatorio'],
      ['value / modelValue', 'Id del paso actual', 'Obligatorio'],
      ['Interacción', 'React: onValueChange · Vue: interactive + v-model', 'Solo lectura'],
    ],
    'La aplicación valida cada paso y decide a cuáles se puede volver. No avanza automáticamente.',
  ),
  entry(
    'timeline',
    'Timeline',
    'Datos',
    'Un historial ordenado de comunicaciones, hitos y cambios de estado.',
    react('Timeline', `<Timeline items={items} />`, `const items = ${history};`),
    vue('Timeline', `<Timeline :items="items" />`, `const items = ${history};`),
    [
      ['items', 'id, title, description, date, dateTime, tone', 'Obligatorio'],
      ['label', 'Nombre accesible de la lista', 'Historial'],
    ],
    'Muestra los elementos en el orden recibido. date es texto visible; dateTime es la fecha ISO para el elemento time.',
  ),
  entry(
    'filter-bar',
    'FilterBar & FilterChip',
    'Datos',
    'Búsqueda y filtros activos visibles, fáciles de quitar individualmente.',
    react(
      'FilterBar',
      `<FilterBar
  query={query}
  onQueryChange={setQuery}
  filters={filters}
  onRemoveFilter={(id) => setFilters(filters.filter((f) => f.id !== id))}
  onClear={() => { setQuery(''); setFilters([]); }}
/>`,
      "const [query, setQuery] = useState('');\nconst [filters, setFilters] = useState([{ id: 'estado', label: 'Estado: en obra' }]);",
    ),
    vue(
      'FilterBar',
      `<FilterBar
  v-model:query="query"
  :filters="filters"
  clearable
  @remove-filter="(id) => filters = filters.filter((f) => f.id !== id)"
  @clear="query = ''; filters = []"
/>`,
      "const query = ref('');\nconst filters = ref([{ id: 'estado', label: 'Estado: en obra' }]);",
    ),
    [
      ['query', 'React: onQueryChange · Vue: v-model:query', 'Vacío'],
      ['filters', 'Lista de { id, label } o, en partes, { id, field, operator, value }', '[]'],
      [
        'Editar una parte',
        'React: onEditFilter(id, part) · Vue: editable y evento edit-filter. part es field, operator o value: abre su selector',
        '—',
      ],
      ['Eliminar / limpiar', 'React: onRemoveFilter / onClear · Vue: eventos remove-filter / clear', '—'],
      ['children / slot', 'Controles adicionales', '—'],
    ],
    'Los filtros se aplican a los datos en la aplicación. FilterChip también se exporta por separado (field, operator, value; React: onEdit · Vue: editable y evento edit); en Vue activa removable para mostrar su botón de cierre.',
  ),
  entry(
    'data-table',
    'DataTable',
    'Datos',
    'Tabla con ordenación, selección, paginación y estados de carga, error y vacío.',
    react(
      'DataTable',
      `<DataTable
  caption="Instalaciones"
  rows={rows}
  columns={columns}
  rowKey="id"
  selectable
  pageSize={10}
/>`,
      `const rows = ${tableRows};\nconst columns = ${tableCols};`,
    ),
    vue(
      'DataTable',
      `<DataTable
  caption="Instalaciones"
  :rows="rows"
  :columns="columns"
  row-key="id"
  selectable
  :page-size="10"
/>`,
      `const rows = ${tableRows};\nconst columns = ${tableCols};`,
    ),
    [
      ['rows / columns / rowKey / caption', 'Datos, columnas, clave estable y nombre accesible', 'Obligatorios'],
      ['columns', 'key, header, sortable, numeric (alinea a la derecha con cifras tabulares), render, sortValue, hideable, csvValue', '—'],
      ['selectedKeys', 'React: onSelectionChange · Vue: v-model:selected-keys', '[]'],
      ['page / sort', 'Estado controlado opcional y eventos de cambio', '1 / sin orden'],
      [
        'manual / totalRows',
        'Datos del servidor: rows es la página pedida y DataTable solo avisa con los eventos de página y orden',
        'false / rows.length',
      ],
      [
        'hiddenColumns / columnPicker',
        'Columnas ocultas (React: onHiddenColumnsChange · Vue: v-model:hidden-columns) y botón «Columnas»',
        '[] / false',
      ],
      [
        'maxHeight',
        'Alto máximo: scroll propio y cabecera fija. Con más de 200 filas a la vista, solo se pintan las que se ven (filas virtuales); al imprimir salen esas, así que para papel pagina o exporta CSV',
        '—',
      ],
      [
        'groupBy / groupLabel',
        'Junta las filas por un campo o una función; cada grupo lleva una fila de título con su total que se pliega. groupLabel (Vue: también el slot group) pinta el título. Los grupos salen en el orden en que aparecen en rows; sin filas virtuales',
        '— / la clave',
      ],
      ['collapsedGroups', 'Grupos plegados. React: onCollapsedGroupsChange · Vue: v-model:collapsed-groups', '[]'],
      ['loading / error / emptyLabel', 'Estados de respuesta', 'false / —'],
      ['Acciones y celdas', 'React: rowActions / render · Vue: slots actions / cell-{key}', '—'],
    ],
    'Sin manual, ordena y pagina en el cliente los rows que recibe: fíltralos antes. Con manual, pide cada página al servidor al cambiar de página o de orden y pasa totalRows. toCsv(rows, columns) y downloadCsv() exportan lo que se ve, con «;» y coma decimal en español. rowKey debe ser único y estable. Seleccionar todo afecta a la página actual, sin las filas de los grupos plegados; conserva la selección en otras páginas.',
  ),
  entry(
    'accordion',
    'Accordion',
    'Estructura',
    'Despliega contenido secundario sin alargar toda la ficha.',
    react('Accordion', `<Accordion items={items} />`, `const items = ${sections};`),
    vue(
      'Accordion',
      `<Accordion :items="items">
  <template #documentos>Memoria y certificado.</template>
</Accordion>`,
      `const items = ${sections};`,
    ),
    [
      ['items', 'value, title, content, disabled', 'Obligatorio'],
      ['value / modelValue', 'Ids abiertos; React: onValueChange · Vue: v-model', '[]'],
      ['multiple', 'Permitir varias secciones abiertas', 'false'],
    ],
    'Vue admite slots con el nombre de cada value. Los botones conservan la navegación nativa con Tab, Enter y Espacio.',
  ),
  entry(
    'breadcrumbs',
    'Breadcrumbs',
    'Navegación',
    'Explica la posición dentro de la aplicación y permite volver a niveles anteriores.',
    react('Breadcrumbs', `<Breadcrumbs items={items} />`, `const items = ${trail};`),
    vue('Breadcrumbs', `<Breadcrumbs :items="items" />`, `const items = ${trail};`),
    [
      ['items', 'Lista de { label, href? }', 'Obligatorio'],
      ['label', 'Nombre accesible de la navegación', 'Ruta de navegación'],
    ],
    'El último elemento representa la página actual y no es un enlace. Utiliza URLs válidas de tu aplicación.',
  ),
  entry(
    'number-input',
    'NumberInput',
    'Formularios',
    'Cifras con coma decimal, unidad y botones de menos y más. Devuelve un número, no texto.',
    react(
      'Field, NumberInput',
      `<Field label="Potencia instalada">
  <NumberInput value={kwp} onValueChange={setKwp} step={0.1} min={0} suffix="kWp" />
</Field>`,
      'const [kwp, setKwp] = useState(8.4);',
    ),
    vue(
      'Field, NumberInput',
      `<Field label="Potencia instalada">
  <NumberInput v-model="kwp" :step="0.1" :min="0" suffix="kWp" />
</Field>`,
      'const kwp = ref(8.4);',
    ),
    [
      ['value / modelValue', 'Número o null. React: onValueChange · Vue: v-model', 'null'],
      ['min / max / step', 'Límites y paso de flechas y botones', '— / — / 1'],
      ['decimals', 'Cifras decimales visibles', 'Las del paso'],
      ['prefix / suffix', 'Texto delante (€) y unidad detrás (kWp). Vue: también como slots', '—'],
      ['hideSteppers', 'Sin botones de menos y más', 'false'],
      ['name', 'Envía el número (8.4) en un campo oculto', '—'],
    ],
    'Entiende «8,4», «8.4» y «1.234,5». Mientras escribes conserva tu texto; al salir lo formatea y lo ajusta a min y max. Flechas: un paso (con Mayúsculas, diez). Re Pág y Av Pág: diez pasos. Inicio y Fin: mínimo y máximo.',
  ),
  entry(
    'segmented-control',
    'SegmentedControl',
    'Formularios',
    'Una opción entre pocas que cambia la vista al momento: día, semana, mes.',
    react(
      'SegmentedControl',
      `<SegmentedControl label="Periodo" options={options} value={periodo} onValueChange={setPeriodo} />`,
      `const [periodo, setPeriodo] = useState('mes');\nconst options = ${list("{ value: 'semana', label: 'Semana' }", "{ value: 'mes', label: 'Mes' }", "{ value: 'ano', label: 'Año' }")};`,
    ),
    vue(
      'SegmentedControl',
      `<SegmentedControl v-model="periodo" label="Periodo" :options="options" />`,
      `const periodo = ref('mes');\nconst options = ${list("{ value: 'semana', label: 'Semana' }", "{ value: 'mes', label: 'Mes' }", "{ value: 'ano', label: 'Año' }")};`,
    ),
    [
      ['options', 'value, label, disabled', 'Obligatorio'],
      ['label', 'Nombre accesible del grupo', 'Obligatorio'],
      ['value / modelValue', 'React: onValueChange · Vue: v-model', 'Primera habilitada'],
      ['size / block', 'sm · md · lg / ancho completo', 'md / false'],
      ['name', 'Envía el valor con el formulario', '—'],
    ],
    'Es un grupo de radios: una sola parada de tabulador y las flechas cambian la opción. Para más de cinco opciones usa Select.',
  ),
  entry(
    'multi-select',
    'MultiSelect',
    'Formularios',
    'Varias opciones con búsqueda, visibles como chips dentro del campo.',
    react(
      'Field, MultiSelect',
      `<Field label="Provincias">
  <MultiSelect options={options} value={provincias} onValueChange={setProvincias} />
</Field>`,
      `const [provincias, setProvincias] = useState(['md']);\nconst options = ${list("{ value: 'md', label: 'Madrid' }", "{ value: 'vc', label: 'Valencia' }", "{ value: 'se', label: 'Sevilla' }")};`,
    ),
    vue(
      'Field, MultiSelect',
      `<Field label="Provincias">
  <MultiSelect v-model="provincias" :options="options" />
</Field>`,
      `const provincias = ref(['md']);\nconst options = ${list("{ value: 'md', label: 'Madrid' }", "{ value: 'vc', label: 'Valencia' }", "{ value: 'se', label: 'Sevilla' }")};`,
    ),
    [
      ['options', 'value, label, disabled, keywords', 'Obligatorio'],
      ['value / modelValue', 'Lista de valores. React: onValueChange · Vue: v-model', '[]'],
      ['loading / emptyLabel', 'Carga / texto sin resultados', 'false / No hay resultados'],
      ['onQueryChange / @query-change', 'Texto de búsqueda para carga externa', '—'],
      ['name', 'Un campo oculto por valor elegido', '—'],
    ],
    'Enter marca o desmarca la opción activa y la lista sigue abierta. Retroceso con el buscador vacío quita la última. Cada chip tiene su botón para quitarla.',
  ),
  entry(
    'calendar',
    'Calendar',
    'Formularios',
    'Un mes para elegir una fecha o un periodo, igual en todos los navegadores.',
    react(
      'Calendar',
      `<Calendar mode="range" value={periodo} onValueChange={setPeriodo} min="2026-01-01" />`,
      "const [periodo, setPeriodo] = useState({ start: '2026-11-03', end: '2026-11-10' });",
    ),
    vue(
      'Calendar',
      `<Calendar v-model="periodo" mode="range" min="2026-01-01" />`,
      "const periodo = ref({ start: '2026-11-03', end: '2026-11-10' });",
    ),
    [
      ['mode', 'single · range', 'single'],
      ['value / modelValue', 'Fecha ISO, o { start, end } en range', 'Vacío'],
      ['min / max', 'Fechas ISO límite', '—'],
      ['month', 'Mes visible YYYY-MM. React: onMonthChange · Vue: v-model:month', 'El de la fecha elegida'],
      ['weekStartsOn', '1 lunes · 0 domingo', '1'],
      ['plain', 'Sin borde, para dentro de una tarjeta', 'false'],
    ],
    'Se muestra en la página: ponlo en una Card, un Drawer o un Dialog. Flechas: días y semanas. Re Pág y Av Pág: meses; con Mayúsculas, años. Inicio y Fin: principio y final de la semana.',
  ),
  entry(
    'command-palette',
    'CommandPalette',
    'Navegación',
    'Busca acciones y registros desde cualquier pantalla con Ctrl o ⌘ + K.',
    react(
      'AppSearch, CommandPalette',
      `<>
  <AppSearch label="Buscar" shortcut="⌘K" onClick={() => setOpen(true)} />
  <CommandPalette
    open={open}
    onOpenChange={setOpen}
    groups={groups}
    onSelect={(id) => navigate(id)}
  />
</>`,
      `const [open, setOpen] = useState(false);\nconst groups = ${list("{ label: 'Acciones', items: [{ id: '/ofertas/nueva', label: 'Nueva oferta', shortcut: 'N' }] }", "{ label: 'Clientes', items: [{ id: '/clientes/lucia', label: 'Lucía Fernández', description: 'Valencia' }] }")};\nconst navigate = (id) => console.log(id);`,
    ),
    vue(
      'AppSearch, CommandPalette',
      `<AppSearch label="Buscar" shortcut="⌘K" @click="open = true" />
<CommandPalette v-model:open="open" :groups="groups" @select="(id) => console.log(id)" />`,
      `const open = ref(false);\nconst groups = ${list("{ label: 'Acciones', items: [{ id: '/ofertas/nueva', label: 'Nueva oferta', shortcut: 'N' }] }", "{ label: 'Clientes', items: [{ id: '/clientes/lucia', label: 'Lucía Fernández', description: 'Valencia' }] }")};`,
    ),
    [
      ['groups', 'Lista de { label, items: [{ id, label, description, keywords, shortcut, disabled }] }', 'Obligatorio'],
      ['onSelect / @select', 'Recibe el id elegido; la paleta se cierra', '—'],
      ['open', 'React: onOpenChange · Vue: v-model:open', 'false'],
      ['hotkey', 'Tecla que, con Ctrl o ⌘, la abre y cierra; false la desactiva', 'k'],
      ['onQueryChange / @query-change', 'Texto de búsqueda para resultados del servidor', '—'],
    ],
    'Usa <dialog> modal: el foco queda dentro y vuelve al cerrar. Filtra sin distinguir tildes por label, description y keywords. Flechas y Enter eligen; Escape cierra.',
  ),
  entry(
    'bar-chart',
    'BarChart',
    'Datos',
    'Barras agrupadas o apiladas con los colores del tema y una tabla para lectores de pantalla.',
    react(
      'BarChart',
      `<BarChart
  title="Producción de octubre"
  data={data}
  categoryKey="semana"
  categoryLabel="Semana"
  series={series}
  unit="kWh"
  stacked
/>`,
      `const data = ${list("{ semana: 'S1', auto: 210, exc: 85 }", "{ semana: 'S2', auto: 185, exc: 70 }")};\nconst series = ${list("{ key: 'auto', label: 'Autoconsumo' }", "{ key: 'exc', label: 'Excedentes' }")};`,
    ),
    vue(
      'BarChart',
      `<BarChart
  title="Producción de octubre"
  :data="data"
  category-key="semana"
  category-label="Semana"
  :series="series"
  unit="kWh"
  stacked
/>`,
      `const data = ${list("{ semana: 'S1', auto: 210, exc: 85 }", "{ semana: 'S2', auto: 185, exc: 70 }")};\nconst series = ${list("{ key: 'auto', label: 'Autoconsumo' }", "{ key: 'exc', label: 'Excedentes' }")};`,
    ),
    [
      ['data / categoryKey', 'Filas y campo con el nombre de cada barra', 'Obligatorios'],
      ['series', 'key, label, tone (1–5: chart-1 … chart-5)', 'Obligatorio'],
      ['stacked', 'Apila las series', 'false'],
      ['unit / decimals', 'Unidad y decimales de los valores', '— / 1'],
      ['title / description / categoryLabel', 'Textos del gráfico y de la tabla accesible', '—'],
      ['height / legend', 'Alto de las barras / leyenda', '15rem / con más de una serie'],
      ['interactive', 'Tarjeta con los valores al pasar el ratón y flechas para recorrer los datos', 'true'],
    ],
    'La escala se redondea sola (0, 100, 200, 300). Los colores salen de chart-1 … chart-5 y siguen el tema y el modo oscuro. El dibujo está oculto a lectores de pantalla: leen la tabla con los mismos datos.',
  ),
]

// Componentes de 0.3, por grupo.
newComponents.push(
  ...maquetacionEntries,
  ...datosEntries,
  ...graficosEntries,
  ...entradasEntries,
  ...superposicionesEntries,
  ...energiaEntries,
  ...labsEntries,
)
