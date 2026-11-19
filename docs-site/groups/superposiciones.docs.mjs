// Web de documentación · grupo «superposiciones y acciones»: fichas de componente y guías de uso.
// entry(id, nombre, categoría, descripción, react(...), vue(...), props, nota) como en components.mjs.
// Categorías: Acciones, Formularios, Datos, Estructura, Navegación, Superposiciones, Respuesta.
// La demo en vivo de cada id está en superposiciones.demos.mjs.
// Ayudantes: import { entry, react, vue, list } from '../doc-helpers.mjs'
import { entry, react, vue, list } from '../doc-helpers.mjs'

const contextItems = list(
  "{ id: 'abrir', label: 'Abrir ficha' }",
  "{ id: 'cups', label: 'Copiar CUPS' }",
  "{ id: 'baja', label: 'Dar de baja', danger: true, separator: true }",
)
const statuses = list(
  "{ value: 'conectada', label: 'Conectadas' }",
  "{ value: 'obra', label: 'En obra' }",
  "{ value: 'pendiente', label: 'Pendientes' }",
)
const formats = list("{ value: 'b', label: 'Negrita', icon: Bold }", "{ value: 'i', label: 'Cursiva', icon: Italic }")

export const entries = [
  entry(
    'popover',
    'Popover',
    'Superposiciones',
    'Contenido libre anclado a un control: datos de un CUPS, una ayuda con un enlace, un filtro pequeño.',
    react(
      'Popover, Button',
      `<Popover label="Ver suministro" title="CUPS ES0021000000000001AB">
  <p>i-DE · Tarifa 2.0TD · 4,6 kW</p>
  <Button variant="secondary" size="sm">Copiar CUPS</Button>
</Popover>`,
    ),
    vue(
      'Popover, Button',
      `<Popover label="Ver suministro" title="CUPS ES0021000000000001AB">
  <p>i-DE · Tarifa 2.0TD · 4,6 kW</p>
  <Button variant="secondary" size="sm">Copiar CUPS</Button>
</Popover>`,
    ),
    [
      ['trigger', 'Control que lo abre. React: elemento · Vue: slot #trigger', 'Button secondary con label'],
      ['label', 'Texto del botón por defecto; nombra el panel si no hay title', '—'],
      ['title', 'Título del panel y su nombre accesible', '—'],
      ['open', 'React: onOpenChange · Vue: v-model:open. defaultOpen sin controlar', 'false'],
      ['align', 'start · center · end; si no cabe, se alinea con el otro borde', 'start'],
      ['side', 'bottom · top', 'bottom'],
    ],
    'No es modal: la página sigue disponible. Al abrir, el foco pasa al primer control del panel (o al panel). Escape y el clic fuera lo cierran y devuelven el foco al disparador. Tab fuera del panel también lo cierra.',
  ),
  entry(
    'banner',
    'Banner',
    'Respuesta',
    'Un aviso para toda la aplicación, de borde a borde, bajo la cabecera.',
    react(
      'AppShell, Banner, Button',
      `<AppShell
  product="Kompilot"
  banner={
    <Banner
      tone="warning"
      title="Mantenimiento del portal de i-DE."
      action={<Button variant="link">Ver estado</Button>}
      onDismiss={() => setVisible(false)}
    >
      Las altas de autoconsumo quedarán en cola hasta las 12:00.
    </Banner>
  }
>
  Contenido de la página
</AppShell>`,
      'const [visible, setVisible] = useState(true);',
    ),
    vue(
      'AppShell, Banner, Button',
      `<AppShell product="Kompilot">
  <template #banner>
    <Banner v-if="visible" tone="warning" title="Mantenimiento del portal de i-DE." dismissible @dismiss="visible = false">
      Las altas de autoconsumo quedarán en cola hasta las 12:00.
      <template #action><Button variant="link">Ver estado</Button></template>
    </Banner>
  </template>
  Contenido de la página
</AppShell>`,
      'const visible = ref(true);',
    ),
    [
      ['title', 'Texto en negrita al principio', 'Obligatorio'],
      ['tone', 'info · success · warning · danger · brand', 'info'],
      ['action', 'Contenido React / slot #action en Vue', '—'],
      ['onDismiss / dismissible', 'React: onDismiss · Vue: dismissible y @dismiss. Muestra el botón de cerrar', '—'],
      ['role', 'status · alert · none', 'status; alert en danger'],
      ['AppShell banner', 'React: prop banner · Vue: slot #banner', '—'],
    ],
    'Fondo tintado sin borde, como Alert. En AppShell queda bajo la cabecera y por encima de la barra lateral y del contenido; en Marca, junto a la barra lateral.',
  ),
  entry(
    'action-bar',
    'ActionBar',
    'Acciones',
    'Acciones en lote sobre las filas elegidas de una tabla, en una barra que flota abajo.',
    react(
      'DataTable, ActionBar, Button',
      `<>
  <DataTable rows={rows} columns={columns} rowKey="id" caption="Instalaciones"
    selectable selectedKeys={selected} onSelectionChange={setSelected} />
  <ActionBar count={selected.length} onClear={() => setSelected([])}>
    <Button variant="secondary" size="sm">Exportar</Button>
    <Button variant="ghost" size="sm">Asignar instalador</Button>
  </ActionBar>
</>`,
      `const [selected, setSelected] = useState([]);\nconst rows = ${list("{ id: '1', cliente: 'Lucía Fernández' }", "{ id: '2', cliente: 'Javier Ortega' }")};\nconst columns = [{ key: 'cliente', header: 'Cliente' }];`,
    ),
    vue(
      'DataTable, ActionBar, Button',
      `<DataTable :rows="rows" :columns="columns" row-key="id" caption="Instalaciones"
  selectable v-model:selected-keys="selected" />
<ActionBar :count="selected.length" clearable @clear="selected = []">
  <Button variant="secondary" size="sm">Exportar</Button>
  <Button variant="ghost" size="sm">Asignar instalador</Button>
</ActionBar>`,
      `const selected = ref([]);\nconst rows = ${list("{ id: '1', cliente: 'Lucía Fernández' }", "{ id: '2', cliente: 'Javier Ortega' }")};\nconst columns = [{ key: 'cliente', header: 'Cliente' }];`,
    ),
    [
      ['count', 'Filas elegidas; con 0 no se pinta', 'Obligatorio'],
      ['label', 'Texto de la selección', '«3 seleccionadas»'],
      ['onClear / clearable', 'React: onClear · Vue: clearable y @clear. Botón «Quitar selección» y Escape', '—'],
      ['inline', 'En su sitio, sin flotar: documentación y ejemplos', 'false'],
    ],
    'Superficie invertida: oscura en tema claro y clara en oscuro. Por debajo de 600 px ocupa el ancho con margen. Los botones fantasma, secundarios y danger toman el color de la barra.',
  ),
  entry(
    'context-menu',
    'ContextMenu',
    'Superposiciones',
    'Las acciones de un registro con clic derecho, sin ocupar sitio en la pantalla.',
    react(
      'ContextMenu, Card, CardHeader, CardTitle',
      `<ContextMenu label="Instalación de Lucía Fernández" items={items} onAction={(id) => console.log(id)}>
  <Card>
    <CardHeader><CardTitle>Lucía Fernández</CardTitle></CardHeader>
  </Card>
</ContextMenu>`,
      `const items = ${contextItems};`,
    ),
    vue(
      'ContextMenu, Card, CardHeader, CardTitle',
      `<ContextMenu label="Instalación de Lucía Fernández" :items="items" @action="(id) => console.log(id)">
  <Card>
    <CardHeader><CardTitle>Lucía Fernández</CardTitle></CardHeader>
  </Card>
</ContextMenu>`,
      `const items = ${contextItems};`,
    ),
    [
      ['items', 'id, label, disabled, danger, separator (como DropdownMenu)', 'Obligatorio'],
      ['onAction / @action', 'Recibe el id de la acción', '—'],
      ['label', 'Nombre de la zona y del menú', '«Acciones» en el menú'],
      ['disabled', 'Deja el menú del navegador', 'false'],
    ],
    'Se abre en la posición del puntero o, con Mayúsculas + F10 o la tecla de menú, bajo el elemento con el foco. Siempre queda dentro de la ventana. Mismo teclado que DropdownMenu; Escape devuelve el foco. Las opciones pueden depender de lo que hay bajo el puntero: el `onContextMenu` (`@contextmenu`) de un hijo se ejecuta antes de abrir, así que puede preparar `items` ahí. Si el hijo llama a `event.stopPropagation()`, el menú no se abre.',
  ),
  entry(
    'icon-button',
    'IconButton',
    'Acciones',
    'Un botón de solo icono con nombre obligatorio, normal o conmutable.',
    react(
      'IconButton',
      `<>
  <IconButton icon={Settings} label="Ajustes" />
  <IconButton icon={Pin} label="Fijar instalación" pressed={pinned} onPressedChange={setPinned} />
</>`,
      'const [pinned, setPinned] = useState(false);\n// Settings y Pin: iconos de lucide-react u otro componente SVG.',
    ),
    vue(
      'IconButton',
      `<IconButton :icon="Settings" label="Ajustes" />
<IconButton :icon="Pin" label="Fijar instalación" v-model:pressed="pinned" />`,
      'const pinned = ref(false);\n// Settings y Pin: iconos de lucide-vue-next u otro componente SVG.',
    ),
    [
      ['icon', 'Componente de icono', 'Obligatorio'],
      ['label', 'aria-label y title', 'Obligatorio'],
      ['variant', 'ghost · secondary · primary', 'ghost'],
      ['size', 'sm · md · lg', 'md'],
      ['pressed', 'Conmutador con aria-pressed. React: onPressedChange · Vue: v-model:pressed. defaultPressed sin controlar', '—'],
      ['disabled', 'Desactiva el botón', 'false'],
    ],
    'Es un Button con iconOnly y el nombre puesto. Conmutado, toma el fondo y el texto del tono primario.',
  ),
  entry(
    'toggle-group',
    'ToggleGroup',
    'Acciones',
    'Botones conmutables que se combinan: formato de texto, columnas visibles o filtros rápidos.',
    react(
      'ToggleGroup',
      `<>
  <ToggleGroup label="Estado" options={statuses} value={estado} onValueChange={setEstado} />
  <ToggleGroup label="Formato del texto" type="multiple" iconOnly options={formats} value={formato} onValueChange={setFormato} />
</>`,
      `const [estado, setEstado] = useState('obra');\nconst [formato, setFormato] = useState(['b']);\nconst statuses = ${statuses};\n// Bold e Italic: iconos de lucide-react.\nconst formats = ${formats};`,
    ),
    vue(
      'ToggleGroup',
      `<ToggleGroup v-model="estado" label="Estado" :options="statuses" />
<ToggleGroup v-model="formato" label="Formato del texto" type="multiple" icon-only :options="formats" />`,
      `const estado = ref('obra');\nconst formato = ref(['b']);\nconst statuses = ${statuses};\n// Bold e Italic: iconos de lucide-vue-next.\nconst formats = ${formats};`,
    ),
    [
      ['options', 'value, label, icon, disabled', 'Obligatorio'],
      ['label', 'Nombre accesible del grupo', 'Obligatorio'],
      ['type', 'single (una o ninguna) · multiple', 'single'],
      ['value / modelValue', "string en single ('' sin ninguna), string[] en multiple. React: onValueChange · Vue: v-model", "'' / []"],
      ['size / iconOnly', 'sm · md · lg / solo iconos, la etiqueta pasa a aria-label', 'md / false'],
      ['disabled', 'Desactiva el grupo', 'false'],
    ],
    'Cada botón lleva aria-pressed. Un solo punto de Tab; flechas, Home y End mueven el foco y Espacio o Enter conmutan. Para una sola opción que cambia la vista usa SegmentedControl.',
  ),
]

// id → { use: [...], avoid: [...], a11y: [...] }
export const guidelines = {
  popover: {
    use: [
      'Úsalo para mostrar detalles breves junto a un control, como los datos de un CUPS en una tabla de suministros.',
      'Puede llevar controles: un botón para copiar, un enlace a la ficha, un filtro pequeño.',
      'Ponle title: da nombre al panel para los lectores de pantalla.',
    ],
    avoid: [
      'Para un texto de ayuda de una línea usa Tooltip.',
      'Para formularios largos o decisiones que bloquean la pantalla usa Dialog o Drawer.',
      'Para una lista de acciones usa DropdownMenu.',
    ],
    a11y: [
      'El disparador lleva aria-haspopup="dialog", aria-expanded y aria-controls.',
      'Al abrir, el foco pasa al primer control del panel. Escape y el clic fuera lo cierran y devuelven el foco al disparador.',
      'Con un trigger propio sin texto (IconButton), su label es el nombre del botón.',
    ],
  },
  banner: {
    use: [
      'Úsalo para avisos que afectan a toda la aplicación, como el mantenimiento del portal de una distribuidora.',
      'Colócalo en la prop banner de AppShell (slot #banner en Vue), bajo la cabecera.',
      'Muestra un Banner a la vez y deja que se cierre si el aviso no es crítico.',
    ],
    avoid: [
      'Para avisos de una sola pantalla o un formulario usa Alert junto al contenido.',
      'Para confirmar una acción ya hecha usa Toast.',
      'No lo uses para publicidad ni para novedades que no cambian el trabajo de hoy.',
    ],
    a11y: [
      'Usa role="status"; con tone danger pasa a role="alert" para anunciarse al momento.',
      'El botón de cerrar se llama «Cerrar aviso»; cámbialo con dismissLabel.',
      'El color nunca va solo: icono y título dicen el tipo de aviso.',
    ],
  },
  'action-bar': {
    use: [
      'Úsalo con DataTable selectable para actuar sobre varias filas: exportar, asignar un instalador, cambiar el estado.',
      'Pinta count con el número de filas elegidas: con 0 la barra desaparece.',
      'Pon dos o tres acciones como mucho; el resto, en un DropdownMenu dentro de la barra.',
    ],
    avoid: [
      'Para acciones de una sola fila usa rowActions de DataTable o ContextMenu.',
      'No pongas acciones destructivas sin confirmar: abre un AlertDialog antes.',
      'No la uses fuera de una selección: no es una barra de herramientas fija.',
    ],
    a11y: [
      'Es un role="toolbar" con el texto de la selección como nombre, por ejemplo «3 seleccionadas».',
      'Flechas izquierda y derecha, Home y End mueven el foco entre los botones.',
      'Escape dentro de la barra quita la selección y el foco vuelve a donde estaba antes de entrar.',
    ],
  },
  'context-menu': {
    use: [
      'Úsalo para atajos sobre un registro o una tarjeta, como abrir la ficha o copiar el CUPS.',
      'Repite las mismas acciones en un sitio visible: un DropdownMenu o los botones de la ficha.',
      'Marca con danger las acciones destructivas y sepáralas con separator.',
      'Si las opciones dependen de lo que hay bajo el puntero, como una pieza de un plano o una fila, calcúlalas en el onContextMenu (@contextmenu) de ese elemento: se ejecuta antes de abrir el menú.',
      'Para no abrir el menú en un sitio, llama a event.stopPropagation() en el onContextMenu del hijo, y también a preventDefault() si no quieres el del navegador.',
    ],
    avoid: [
      'No escondas en él acciones que solo existen ahí: en móvil no hay clic derecho.',
      'No lo pongas sobre campos de texto: el usuario espera el menú del navegador.',
    ],
    a11y: [
      'Mayúsculas + F10 o la tecla de menú lo abren con el foco en la zona o dentro de ella.',
      'Flechas, Home, End y la inicial mueven el foco; Escape cierra y devuelve el foco.',
      'Ponle label: nombra la zona enfocable y el menú.',
    ],
  },
  'icon-button': {
    use: [
      'Úsalo en barras compactas donde el icono se entiende solo, como ajustes, descargar o fijar.',
      'Con pressed se convierte en un conmutador, como fijar una instalación o seguir sus avisos.',
    ],
    avoid: ['Si el icono no es evidente, usa un Button con texto.', 'Para varias opciones relacionadas que se combinan usa ToggleGroup.'],
    a11y: ['label es obligatorio: va en aria-label y en title.', 'Conmutado lleva aria-pressed="true"; no cambies el label al pulsar.'],
  },
  'toggle-group': {
    use: [
      'Úsalo para opciones que se combinan, como formato de texto, columnas visibles o filtros rápidos.',
      'Con type single permite una opción o ninguna; con multiple, cualquier combinación.',
    ],
    avoid: [
      'Para una sola opción que cambia la vista (Día, Semana, Mes) usa SegmentedControl.',
      'Para un valor de formulario obligatorio usa RadioGroup o Select.',
      'Con más de cinco opciones usa MultiSelect o FilterBar.',
    ],
    a11y: [
      'label es obligatorio y nombra el grupo (role="group").',
      'Cada botón lleva aria-pressed. Un solo punto de Tab; flechas, Home y End mueven el foco.',
      'Con iconOnly, la etiqueta de cada opción pasa a aria-label y title.',
    ],
  },
}
