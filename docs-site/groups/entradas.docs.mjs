// Web de documentación · grupo «entradas»: fichas de componente y guías de uso.
// entry(id, nombre, categoría, descripción, react(...), vue(...), props, nota) como en components.mjs.
// Categorías: Acciones, Formularios, Datos, Estructura, Navegación, Superposiciones, Respuesta.
// La demo en vivo de cada id está en entradas.demos.mjs.
import { entry, react, vue, list } from '../doc-helpers.mjs'

const marks = list("{ value: 2, label: '2 kWp' }", "{ value: 10, label: '10 kWp' }", "{ value: 17, label: '17 kWp' }")
const suggestReact = `async function suggest(query) {
  const response = await fetch(\`/api/direcciones?q=\${encodeURIComponent(query)}\`);
  return response.json(); // [{ id, label, description, value: { street, postalCode, city, province } }]
}`
const checked = ['onErrorChange / @error-change', 'Recibe el error de validación, o "" si el valor vale. Úsalo para bloquear el envío', '—']
const checkedNote =
  'El mensaje de error se muestra bajo el campo al salir de él (o desde el principio si ya traía un valor) y queda enlazado con aria-describedby y aria-invalid. Mientras se corrige, se actualiza al escribir.'

export const entries = [
  entry(
    'search-input',
    'SearchInput',
    'Formularios',
    'Búsqueda con lupa, botón para borrar y estado de carga. Escape también borra.',
    react(
      'Field, SearchInput',
      `<Field label="Buscar cliente">
  <SearchInput value={busqueda} onValueChange={setBusqueda} placeholder="Nombre, NIF o CUPS" loading={cargando} />
</Field>`,
      "const [busqueda, setBusqueda] = useState('');\nconst cargando = false;",
    ),
    vue(
      'Field, SearchInput',
      `<Field label="Buscar cliente">
  <SearchInput v-model="busqueda" placeholder="Nombre, NIF o CUPS" :loading="cargando" />
</Field>`,
      "const busqueda = ref('');\nconst cargando = ref(false);",
    ),
    [
      ['value / modelValue', 'Texto. React: onValueChange · Vue: v-model', "''"],
      ['placeholder', 'Texto de ejemplo', 'Buscar…'],
      ['loading', 'Spinner en lugar de la lupa y aria-busy en el campo', 'false'],
      ['size', 'sm · md · lg', 'md'],
      ['onClear / @clear', 'Después de borrar con el botón o con Escape', '—'],
      ['label / clearLabel', 'Nombre accesible sin Field / texto del botón de borrar', 'Buscar / Borrar búsqueda'],
    ],
    'Es un input type="search". Escape borra el texto y deja el foco en el campo; si ya está vacío, Escape sigue su camino (por ejemplo, cierra el diálogo).',
  ),
  entry(
    'password-input',
    'PasswordInput',
    'Formularios',
    'Contraseña con un botón para mostrarla u ocultarla.',
    react(
      'Field, PasswordInput',
      `<Field label="Contraseña" hint="Mínimo 12 caracteres">
  <PasswordInput value={clave} onValueChange={setClave} autoComplete="new-password" />
</Field>`,
      "const [clave, setClave] = useState('');",
    ),
    vue(
      'Field, PasswordInput',
      `<Field label="Contraseña" hint="Mínimo 12 caracteres">
  <PasswordInput v-model="clave" autocomplete="new-password" />
</Field>`,
      "const clave = ref('');",
    ),
    [
      ['value / modelValue', 'React: onValueChange · Vue: v-model', "''"],
      ['autoComplete / autocomplete', 'current-password para entrar; new-password al crearla o cambiarla', 'current-password'],
      ['size', 'sm · md · lg', 'md'],
      [
        'showLabel / hideLabel',
        'Nombre del botón / pista al pasar el ratón con la contraseña visible',
        'Mostrar contraseña / Ocultar contraseña',
      ],
    ],
    'El botón es un conmutador con aria-pressed y nombre fijo, «Mostrar contraseña»: pulsado significa que se ve. El campo vuelve a type="password" al pulsarlo de nuevo.',
  ),
  entry(
    'slider',
    'Slider',
    'Formularios',
    'Un valor dentro de un rango, como la potencia de una instalación, con el input range nativo.',
    react(
      'Field, Slider',
      `<Field label="Potencia estimada">
  <Slider value={kwp} onValueChange={setKwp} min={2} max={17} step={0.5} unit="kWp" showValue marks={marks} />
</Field>`,
      `const [kwp, setKwp] = useState(6.5);\nconst marks = ${marks};`,
    ),
    vue(
      'Field, Slider',
      `<Field label="Potencia estimada">
  <Slider v-model="kwp" :min="2" :max="17" :step="0.5" unit="kWp" show-value :marks="marks" />
</Field>`,
      `const kwp = ref(6.5);\nconst marks = ${marks};`,
    ),
    [
      ['value / modelValue', 'Número. React: onValueChange · Vue: v-model', 'min'],
      ['min / max / step', 'Rango y paso', '0 / 100 / 1'],
      ['unit', 'Unidad tras el valor: kWp, kWh, %', '—'],
      ['showValue', 'Muestra el valor elegido a la derecha', 'false'],
      ['formatValue', 'Texto del valor, visible y para lectores de pantalla', 'Número en es-ES y unidad'],
      ['marks', 'Marcas bajo la pista: { value, label }', '—'],
      ['name', 'Envía el número con el formulario', '—'],
    ],
    'Flechas: un paso. Re Pág y Av Pág: un salto mayor. Inicio y Fin: mínimo y máximo. El valor se anuncia con aria-valuetext («6,5 kWp»). El único estilo en línea es la variable --_fill, la fracción rellena de la pista.',
  ),
  entry(
    'time-picker',
    'TimePicker',
    'Formularios',
    'Hora «HH:MM» escrita a mano o elegida en una lista de franjas.',
    react(
      'Field, TimePicker',
      `<Field label="Hora de la visita técnica">
  <TimePicker value={hora} onValueChange={setHora} min="08:00" max="20:00" step={15} />
</Field>`,
      "const [hora, setHora] = useState('10:30');",
    ),
    vue(
      'Field, TimePicker',
      `<Field label="Hora de la visita técnica">
  <TimePicker v-model="hora" min="08:00" max="20:00" :step="15" />
</Field>`,
      "const hora = ref('10:30');",
    ),
    [
      ['value / modelValue', '«HH:MM» o "". React: onValueChange · Vue: v-model', "''"],
      ['step', 'Minutos entre franjas de la lista', '15'],
      ['min / max', 'Primera y última hora admitidas', '00:00 / 23:59'],
      ['placeholder / size', 'Texto de ejemplo / sm · md · lg', 'hh:mm / md'],
      ['name', 'Envía la hora en un campo oculto', '—'],
      checked,
    ],
    `Acepta «9», «930», «9:30» y «09.30», y al salir normaliza a «09:30». Al abrir la lista, la franja más cercana a la hora escrita queda activa. Flechas, Inicio y Fin recorren las franjas, Enter elige y Escape cierra. ${checkedNote}`,
  ),
  entry(
    'phone-input',
    'PhoneInput',
    'Formularios',
    'Teléfono con prefijo de país. Agrupa las cifras al escribir y devuelve E.164.',
    react(
      'Field, PhoneInput',
      `<Field label="Teléfono">
  <PhoneInput value={telefono} onValueChange={setTelefono} country={pais} onCountryChange={setPais} />
</Field>`,
      "const [telefono, setTelefono] = useState('+34612345678');\nconst [pais, setPais] = useState('ES');",
    ),
    vue(
      'Field, PhoneInput',
      `<Field label="Teléfono">
  <PhoneInput v-model="telefono" v-model:country="pais" />
</Field>`,
      "const telefono = ref('+34612345678');\nconst pais = ref('ES');",
    ),
    [
      ['value / modelValue', 'Número en E.164: «+34612345678». React: onValueChange · Vue: v-model', "''"],
      ['country', "'ES' · 'PT' · 'FR' · 'DE' · 'IT' · 'GB'. React: onCountryChange · Vue: v-model:country", 'ES'],
      ['countries', 'Países del selector, en orden', 'Los seis'],
      ['countryLabel', 'Nombre del selector de país', 'Prefijo del país'],
      ['size', 'sm · md · lg', 'md'],
      checked,
    ],
    `Un teléfono español tiene 9 cifras y empieza por 6 o 7 (móvil) o por 8 o 9 (fijo); para el resto de países se comprueba una longitud razonable. Si se pega un número con «+351» o «0033», el selector cambia de país. ${checkedNote}`,
  ),
  entry(
    'nif-input',
    'NifInput',
    'Formularios',
    'DNI, NIE o CIF en mayúsculas, con la letra o el dígito de control comprobado.',
    react(
      'Field, NifInput',
      `<Field label="NIF" hint="DNI, NIE o CIF">
  <NifInput value={nif} onValueChange={setNif} onErrorChange={setError} />
</Field>`,
      "const [nif, setNif] = useState('');\nconst [error, setError] = useState('');",
    ),
    vue(
      'Field, NifInput',
      `<Field label="NIF" hint="DNI, NIE o CIF">
  <NifInput v-model="nif" @error-change="error = $event" />
</Field>`,
      "const nif = ref('');\nconst error = ref('');",
    ),
    [['value / modelValue', 'En mayúsculas, sin espacios ni guiones: «12345678Z»', "''"], ['size', 'sm · md · lg', 'md'], checked],
    `DNI: letra de control con el módulo 23. NIE: X, Y o Z valen 0, 1 o 2 y se calcula igual. CIF: dígito o letra de control según el tipo de entidad. Los errores dicen qué falla: «La letra del DNI no coincide», «El CIF tiene una letra, 7 cifras y un carácter de control»… La lógica está en @1k5/grado/patterns (normalizeNif, nifError, isValidNif). ${checkedNote}`,
  ),
  entry(
    'iban-input',
    'IbanInput',
    'Formularios',
    'IBAN agrupado de cuatro en cuatro, con la longitud del país y el control módulo 97.',
    react(
      'Field, IbanInput',
      `<Field label="IBAN para la domiciliación">
  <IbanInput value={iban} onValueChange={setIban} />
</Field>`,
      "const [iban, setIban] = useState('');",
    ),
    vue(
      'Field, IbanInput',
      `<Field label="IBAN para la domiciliación">
  <IbanInput v-model="iban" />
</Field>`,
      "const iban = ref('');",
    ),
    [['value / modelValue', 'Sin espacios: «ES9121000418450200051332»', "''"], ['size', 'sm · md · lg', 'md'], checked],
    `Se ve como «ES91 2100 0418 4502 0005 1332» y el cursor se queda en su sitio al reformatear. Comprueba la longitud de cada país (24 en España) y los dígitos de control. La lógica está en @1k5/grado/patterns (formatIban, ibanError, isValidIban). ${checkedNote}`,
  ),
  entry(
    'address-input',
    'AddressInput',
    'Formularios',
    'Dirección con autocompletado asíncrono. Sin proveedor incluido: pasa tu función suggest.',
    react(
      'Field, AddressInput',
      `<Field label="Dirección de la instalación">
  <AddressInput suggest={suggest} value={direccion} onValueChange={setDireccion} />
</Field>`,
      `const [direccion, setDireccion] = useState(null);\n${suggestReact}`,
    ),
    vue(
      'Field, AddressInput',
      `<Field label="Dirección de la instalación">
  <AddressInput v-model="direccion" :suggest="suggest" />
</Field>`,
      `const direccion = ref(null);\n${suggestReact}`,
    ),
    [
      ['suggest', '(query) => Promise<AddressOption[]>', 'Obligatorio'],
      ['AddressOption', '{ id, label, description?, value: { street, postalCode, city, province, cadastralRef? } }', '—'],
      ['value / modelValue', 'La AddressOption elegida, o null. React: onValueChange · Vue: v-model', 'null'],
      ['minChars / debounce', 'Letras para empezar a buscar / espera en ms tras la última tecla', '3 / 250'],
      ['onQueryChange / @query-change', 'Texto escrito, por si no se elige ninguna sugerencia', '—'],
      ['emptyLabel / placeholder', 'Sin resultados / texto de ejemplo', 'No hay resultados / Calle, número y municipio'],
      ['name', 'Envía el id de la dirección elegida', '—'],
    ],
    'Se comporta como Combobox: flechas, Inicio y Fin recorren las sugerencias, Enter elige y Escape cancela. Si el usuario sigue escribiendo, la respuesta de una búsqueda anterior que llega tarde se descarta. Muestra «Cargando…», «Escribe al menos 3 caracteres.», «No hay resultados» o «No se pudieron cargar las direcciones.» según el caso.',
  ),
]

// id → { use: [...], avoid: [...], a11y: [...] }
export const guidelines = {
  'search-input': {
    use: [
      'Úsalo para filtrar una lista o una tabla mientras se escribe: clientes, instalaciones, tickets.',
      'Pon loading mientras llegan los resultados del servidor.',
      'Para buscar y elegir un único registro de una lista usa Combobox.',
    ],
    avoid: [
      'Para la búsqueda global de la aplicación usa AppSearch o CommandPalette.',
      'No lo uses para campos que se envían con el formulario, como un nombre o una dirección.',
    ],
    a11y: [
      'Necesita una etiqueta: con Field o con label. Sin ninguna se llama «Buscar».',
      'El botón de borrar tiene nombre («Borrar búsqueda») y devuelve el foco al campo.',
      'Escape borra el texto; con el campo vacío no hace nada y deja que la tecla llegue al diálogo.',
    ],
  },
  'password-input': {
    use: [
      'Úsalo en el acceso al portal del cliente y al crear o cambiar una contraseña.',
      'Pon autoComplete="new-password" al crearla, para que el gestor de contraseñas proponga una.',
    ],
    avoid: ['No lo uses para códigos que no son secretos, como el CUPS o un número de pedido.', 'No muestres la contraseña por defecto.'],
    a11y: [
      'El botón es un conmutador con aria-pressed y un nombre que no cambia, «Mostrar contraseña».',
      'Con la contraseña visible, la pista al pasar el ratón dice «Ocultar contraseña».',
      'El foco se queda en el botón al pulsarlo.',
    ],
  },
  slider: {
    use: [
      'Úsalo para valores aproximados dentro de un rango corto: la potencia estimada, un porcentaje de autoconsumo.',
      'Activa showValue para ver el valor exacto mientras se arrastra.',
      'Añade marcas en los extremos y en uno o dos valores de referencia.',
    ],
    avoid: [
      'Para cifras exactas (8,45 kWp, un importe) usa NumberInput.',
      'No lo uses con rangos muy amplios o pasos muy finos: se vuelve impreciso con el ratón.',
    ],
    a11y: [
      'Es el input range nativo: flechas, Re Pág, Av Pág, Inicio y Fin funcionan sin código.',
      'aria-valuetext anuncia el valor con su unidad y en formato es-ES: «6,5 kWp».',
      'El foco se ve como un anillo alrededor del tirador. El valor visible y las marcas no se leen dos veces.',
    ],
  },
  'time-picker': {
    use: [
      'Úsalo para citas y franjas: la visita técnica, la instalación, una llamada.',
      'Ajusta min, max y step al horario real del equipo.',
      'Combínalo con DatePicker para elegir día y hora.',
    ],
    avoid: ['Para duraciones (2 h 30 min) usa NumberInput con su unidad.', 'No lo uses para fechas con hora en un solo campo.'],
    a11y: [
      'Es un combobox: flechas, Inicio y Fin recorren las franjas, Enter elige y Escape cierra.',
      'La franja activa se anuncia con aria-activedescendant sin mover el foco.',
      'El error de formato o de rango queda enlazado con aria-describedby y se anuncia al salir.',
    ],
  },
  'phone-input': {
    use: ['Úsalo en los datos de contacto del cliente y guarda el valor en E.164.', 'Limita countries a los países con los que trabajáis.'],
    avoid: [
      'No guardes el número formateado con espacios: usa el valor E.164 que devuelve.',
      'Para números fuera de la lista de países usa Input con type="tel".',
    ],
    a11y: [
      'El selector de país tiene su propio nombre, «Prefijo del país».',
      'El campo usa type="tel" y autocomplete="tel-national" para el teclado y el autorrelleno.',
      'El error dice qué falla («Un teléfono español tiene 9 cifras.») y queda enlazado al campo.',
    ],
  },
  'nif-input': {
    use: [
      'Úsalo para el NIF del titular del contrato, de particulares (DNI, NIE) o de empresas (CIF).',
      'Con onErrorChange puedes bloquear el envío mientras el NIF no sea válido.',
    ],
    avoid: [
      'No lo uses para identificadores de otros países: el control es el español.',
      'No muestres el error mientras se escribe por primera vez: el componente ya espera a que se salga del campo.',
    ],
    a11y: [
      'Los errores son concretos: dicen si falla la forma o la letra de control.',
      'El error se enlaza con aria-describedby y el campo se marca con aria-invalid.',
      'Acepta minúsculas, espacios y guiones al escribir o pegar; los quita sin mover el cursor.',
    ],
  },
  'iban-input': {
    use: [
      'Úsalo para la cuenta de domiciliación de las cuotas o de la compensación de excedentes.',
      'Guarda el valor sin espacios que devuelve; los grupos de cuatro son solo para leerlo.',
    ],
    avoid: ['No pidas el IBAN en varios campos (entidad, oficina, cuenta): se pega entero.', 'No lo uses para validar números de tarjeta.'],
    a11y: [
      'El cursor se queda detrás de la misma cifra al reformatear, también al editar en medio.',
      'El error dice si falla la longitud del país o los dígitos de control.',
      'Desactiva el corrector y pone las letras en mayúsculas.',
    ],
  },
  'address-input': {
    use: [
      'Úsalo para la dirección de la instalación o de facturación, con el proveedor que ya uséis (CartoCiudad, Catastro, Google Places).',
      'Devuelve en value la calle, el código postal, el municipio, la provincia y, si la hay, la referencia catastral.',
      'Usa onQueryChange para guardar el texto si el cliente no encuentra su dirección.',
    ],
    avoid: [
      'Para elegir entre una lista cerrada y ya cargada usa Combobox.',
      'No hagas la búsqueda en cada tecla sin debounce: el componente ya espera 250 ms.',
    ],
    a11y: [
      'Es un combobox con lista: flechas, Inicio y Fin recorren las sugerencias, Enter elige y Escape cancela.',
      'Mientras busca, el campo lleva aria-busy y la lista dice «Cargando…».',
      'Cada sugerencia lee la calle y, debajo, el código postal y el municipio.',
    ],
  },
}
