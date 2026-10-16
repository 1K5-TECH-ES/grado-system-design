// Web de documentación · grupo «labs» (0.6): utilidades fuera de la promesa de la 1.0.
// entry(id, nombre, categoría, descripción, react, vue, props, nota) como en components.mjs.
// La demo en vivo de cada id está en labs.demos.mjs. El código importa de …/labs.
import { entry } from '../doc-helpers.mjs'

const LABS =
  'Fuera de la promesa de la 1.0: puede cambiar en una versión menor. Se importa de `@1k5-tech-es/grado-react/labs` o `@1k5-tech-es/grado-vue/labs` y su CSS es `@1k5-tech-es/grado/labs.css`.'
const reactCode = (names, body) => `import { ${names} } from '@1k5-tech-es/grado-react/labs';\n\n${body}`
const vueCode = (names, body, setup = '') =>
  `<script setup>\nimport { ${names} } from '@1k5-tech-es/grado-vue/labs';${setup ? `\n${setup}` : ''}\n</script>\n\n<template>\n${body}\n</template>`

export const entries = [
  entry(
    'amount',
    'Amount',
    'Labs',
    'Importes, energía y potencia con el formato español y cifras alineadas: «1234,50 €», «7,2 kWh», «6,4 kWp».',
    reactCode(
      'Amount',
      `<Amount value={11840} unit="eur" decimals={0} />
<Amount value={12500} unit="kWh" scale />
<Amount value={6.4} unit="kWp" />
<Amount value={-0.04} unit="percent" signed colored />`,
    ),
    vueCode(
      'Amount',
      `  <Amount :value="11840" unit="eur" :decimals="0" />
  <Amount :value="12500" unit="kWh" scale />
  <Amount :value="6.4" unit="kWp" />
  <Amount :value="-0.04" unit="percent" signed colored />`,
    ),
    [
      ['value', 'Número sin formato (null: «—»)', '—'],
      ['unit', "'eur' · 'kWh' · 'kW' · 'kWp' · 'percent' · 'number'", "'number'"],
      ['decimals', '2 en euros y números, 1 en energía y potencia, 0 en porcentajes', 'Según la unidad'],
      ['scale / signed / colored', 'MWh y MW con cifras grandes / signo + / verde o rojo según el signo', 'false'],
      ['formatEuro · formatEnergy · formatPower', 'Las mismas cuentas como funciones, en @1k5-tech-es/grado/labs', '—'],
    ],
    `Es un <data> con el número sin formato en value, para copiarlo o leerlo desde código. ${LABS}`,
  ),
  entry(
    'relative-time',
    'RelativeTime',
    'Labs',
    'Cuándo pasó algo, en palabras: «hace 5 minutos», «ayer», «16 oct». Se actualiza sola.',
    reactCode('RelativeTime', `<RelativeTime value={ticket.updatedAt} />`),
    vueCode('RelativeTime', `  <RelativeTime :value="ticket.updatedAt" />`),
    [
      ['value', 'Date, texto ISO o milisegundos', '—'],
      ['now', 'Ahora de referencia (tests, servidor)', 'El reloj'],
      ['max', 'Segundos a partir de los que se pone la fecha', 'Una semana'],
      ['formatRelative', 'La misma cuenta como función, en @1k5-tech-es/grado/labs', '—'],
    ],
    `Lleva la fecha completa en title y en datetime. Se repinta cada minuto la primera hora y cada hora el primer día. ${LABS}`,
  ),
  entry(
    'theme-toggle',
    'ThemeToggle',
    'Labs',
    'Claro, Oscuro o Sistema. useTheme() guarda la elección y pone la clase dark en <html>.',
    reactCode(
      'ThemeToggle, themeScript',
      `// En el <head>, antes del CSS: aplica el tema guardado sin parpadeo.
<script dangerouslySetInnerHTML={{ __html: themeScript() }} />

<ThemeToggle />`,
    ),
    vueCode('ThemeToggle', `  <ThemeToggle />`),
    [
      ['size', 'sm · md · lg', 'sm'],
      ['storageKey', 'Clave en localStorage', "'k5-mode'"],
      ['apply', 'false: solo guarda la elección, sin tocar <html>', 'true'],
      ['useTheme({ storageKey, apply })', '{ mode, setMode, resolved } para un control propio', '—'],
      ['themeScript()', 'Script para el <head> que aplica el tema antes de pintar', '—'],
    ],
    `Todos los useTheme de la página se enteran del cambio y Sistema sigue la preferencia del equipo. Sin almacenamiento (modo privado), la elección dura hasta recargar. ${LABS}`,
  ),
  entry(
    'scroll-area',
    'ScrollArea',
    'Labs',
    'Una zona con su propio scroll y barra fina, que se recorre también con el teclado.',
    reactCode(
      'ScrollArea',
      `<ScrollArea label="Historial" maxHeight={240}>
  {eventos.map((evento) => <p key={evento.id}>{evento.texto}</p>)}
</ScrollArea>`,
    ),
    vueCode(
      'ScrollArea',
      `  <ScrollArea label="Historial" :max-height="240">
    <p v-for="evento in eventos" :key="evento.id">{{ evento.texto }}</p>
  </ScrollArea>`,
    ),
    [
      ['label', 'Nombre de la zona para lectores de pantalla', '—'],
      ['maxHeight', 'Número en píxeles o medida CSS', 'El del contenedor'],
      ['orientation', "'vertical' · 'horizontal' · 'both'", "'vertical'"],
    ],
    `Es una región con nombre que recibe el foco: las flechas la desplazan sin ratón. Al imprimir sale entera. ${LABS}`,
  ),
  entry(
    'use-hotkey',
    'useHotkey',
    'Labs',
    'Atajos de teclado para toda la página: useHotkey("mod+k", abrir). mod es ⌘ en Mac y Ctrl en el resto.',
    reactCode(
      'useHotkey, hotkeyLabel',
      `useHotkey('mod+k', () => setOpen(true));\nuseHotkey('?', () => setHelp(true));\n\n<Kbd>{hotkeyLabel('mod+k')}</Kbd>`,
    ),
    vueCode('useHotkey', `  <Kbd>Ctrl K</Kbd>`, `useHotkey('mod+k', () => (open.value = true));`),
    [
      ['hotkey', "'mod+k' · 'shift+?' · 'g' · 'esc'…", '—'],
      ['enabled', 'Activa o desactiva el atajo (en Vue, también un ref)', 'true'],
      ['allowInInputs', 'Salta con el foco en un campo de texto', 'Solo con Ctrl/⌘ o Alt'],
      ['preventDefault', 'Evita lo que haría el navegador con ese atajo', 'true'],
    ],
    `Los atajos sin modificador (como «?») no saltan mientras se escribe. hotkeyLabel() da el texto para Kbd. ${LABS}`,
  ),
  entry(
    'visually-hidden',
    'VisuallyHidden',
    'Labs',
    'Texto que solo oyen los lectores de pantalla: el destino de un botón de icono, «(se abre en otra pestaña)».',
    reactCode('VisuallyHidden', `<button>Ver<VisuallyHidden> la oferta OF-0418</VisuallyHidden></button>`),
    vueCode('VisuallyHidden', `  <button>Ver<VisuallyHidden> la oferta OF-0418</VisuallyHidden></button>`),
    [['as', 'Etiqueta del elemento', "'span'"]],
    `Usa la clase k5-sr-only de grado.css. ${LABS}`,
  ),
  entry(
    'tariff-comparison',
    'TariffComparison',
    'Labs',
    'Lo que cuesta al año el mismo consumo con dos o tres tarifas, con la más barata marcada.',
    reactCode(
      'TariffComparison',
      `<TariffComparison
  title="Tu consumo con cada tarifa"
  consumption={{ punta: 900, llano: 1100, valle: 1500 }}
  power={4.6}
  tariffs={[
    { id: 'fija', name: 'Precio fijo', energy: 0.145, power: 0.09 },
    { id: 'td', name: '2.0TD', energy: { punta: 0.21, llano: 0.14, valle: 0.09 }, power: { punta: 0.1, valle: 0.01 } },
  ]}
/>`,
    ),
    vueCode(
      'TariffComparison',
      `  <TariffComparison
    title="Tu consumo con cada tarifa"
    :consumption="{ punta: 900, llano: 1100, valle: 1500 }"
    :power="4.6"
    :tariffs="tarifas"
  />`,
    ),
    [
      ['tariffs', '{ id, name, energy: €/kWh o por periodo, power: €/kW·día o por periodo, monthly? }[]', '—'],
      ['consumption', 'kWh al año por periodo de la 2.0TD ({ punta, llano, valle }) o en total', '—'],
      ['power', 'kW contratados: una cifra o { punta, valle }', '0'],
      ['taxes', '{ electricityTax, vat }: los suma; sin él, «Sin impuestos»', '—'],
      ['days / breakdown', 'Días que se cuentan / columnas de energía y potencia', '365 / true'],
      ['tariffCost · compareTariffs', 'Las mismas cuentas como funciones, en @1k5-tech-es/grado/labs', '—'],
    ],
    `Los impuestos cambian con el tiempo: Grado no los inventa, pásalos tú si quieres el total con ellos. ${LABS}`,
  ),
  entry(
    'signature-pad',
    'SignaturePad',
    'Labs',
    'Firma de la oferta con el dedo, un lápiz o el ratón, o escribiendo el nombre.',
    reactCode('SignaturePad', `<SignaturePad label="Firma del titular" name="firma" required value={firma} onChange={setFirma} />`),
    vueCode(
      'SignaturePad',
      `  <SignaturePad v-model="firma" label="Firma del titular" name="firma" required />`,
      `const firma = ref(null);`,
    ),
    [
      ['label', 'Nombre del campo', '—'],
      ['value / onChange', '{ strokes } dibujada o { typed } escrita; null sin firmar (v-model en Vue)', 'null'],
      ['name', 'Campo oculto con la firma en SVG (data URL) para enviar con el formulario', '—'],
      ['hint / error / required / disabled', 'Como en Field', '—'],
      ['signatureSvg · signatureDataUrl', 'La firma como SVG, para guardarla o meterla en un PDF', '—'],
    ],
    `«Escribir mi nombre» es la alternativa para quien no puede dibujar o usa el teclado. Dentro de la zona la página no se desplaza al firmar. ${LABS}`,
  ),
  entry(
    'solar-forecast',
    'SolarForecast',
    'Labs',
    'La producción solar prevista para hoy frente a la real, hora a hora, con el tiempo.',
    reactCode('SolarForecast', `<SolarForecast title="Producción de hoy" forecast={prevista} actual={real} weather={tiempo} />`),
    vueCode('SolarForecast', `  <SolarForecast title="Producción de hoy" :forecast="prevista" :actual="real" :weather="tiempo" />`),
    [
      ['forecast', 'kWh previstos por franja: 24 horas o 96 cuartos de hora', '—'],
      ['actual', 'kWh reales hasta ahora; lo que falta, null u omitido', '[]'],
      ['weather', "'sun' · 'partly' · 'cloud' · 'rain' por franja", '—'],
      ['title / description / height / interactive', 'Como en LineChart', '— / — / — / true'],
      ['forecastSummary', 'El resumen como función, en @1k5-tech-es/grado/labs', '—'],
    ],
    `El resumen dice el total previsto, lo producido hasta la última hora con dato y si va más de un 5 % por encima o por debajo. ${LABS}`,
  ),
]

export const guidelines = {
  'tariff-comparison': {
    use: [
      'Úsalo en la oferta y en el área de cliente para enseñar por qué una tarifa compensa con su consumo real.',
      'Compara dos o tres tarifas: con más, la tabla deja de leerse de un vistazo.',
    ],
    avoid: [
      'No mezcles tarifas con y sin impuestos en la misma comparación.',
      'No inventes el reparto por periodos: usa el consumo real de la factura o del contador.',
    ],
    a11y: ['Es una tabla con cabeceras: la más barata se dice con texto («Más barata»), no solo con color.'],
  },
  'signature-pad': {
    use: [
      'Úsalo para aceptar una oferta o un contrato en tablet o en el ordenador.',
      'Pon name para que la firma viaje con el formulario.',
    ],
    avoid: [
      'No la uses como única prueba legal sin el resto del proceso de firma (datos, fecha, aceptación).',
      'No la hagas más pequeña que su tamaño por defecto en móvil.',
    ],
    a11y: [
      '«Escribir mi nombre» permite firmar con el teclado o un lector de pantalla.',
      'El estado («Sin firmar», «Firma dibujada») forma parte del nombre de la zona.',
    ],
  },
  'solar-forecast': {
    use: [
      'Úsalo en la app del cliente y en los paneles de seguimiento para el día en curso.',
      'Pasa weather para explicar por qué hoy se produce menos.',
    ],
    avoid: ['Para comparar varios días usa LineChart con una serie por día.'],
    a11y: [
      'Se recorre con las flechas: cada hora se anuncia con lo previsto, lo producido y el tiempo.',
      'Previsto y real se distinguen por el trazo (discontinuo y continuo), no solo por el color.',
    ],
  },
  amount: {
    use: [
      'Úsalo para cualquier importe, energía o potencia que vea el usuario: el formato sale igual en todas las apps.',
      'En tablas, junto a numeric en la columna, para que las cifras queden alineadas.',
      'Para variaciones (ahorro, desviación) usa signed y colored.',
    ],
    avoid: [
      'No formatees con toLocaleString a mano: cada app acababa con sus propios decimales.',
      'No uses colored para importes que no son una variación.',
    ],
    a11y: [
      'El texto lleva la unidad completa, con espacio duro: no se parte al final de la línea.',
      'El color de colored acompaña al signo, no lo sustituye.',
    ],
  },
  'relative-time': {
    use: [
      'Úsalo para cuándo cambió algo reciente: el último mensaje, la última lectura del contador.',
      'Pasada una semana enseña la fecha: «hace 23 días» cuesta más de leer.',
    ],
    avoid: ['Para plazos y citas (instalación el martes 21) usa la fecha exacta, no la relativa.'],
    a11y: ['La fecha completa está en title y en datetime, para quien la necesite exacta.'],
  },
  'theme-toggle': {
    use: [
      'Ponlo en el menú de usuario o en ajustes, no en cada pantalla.',
      'Añade themeScript() al <head> para que no parpadee al cargar.',
    ],
    avoid: ['No guardes el tema en tu propio localStorage: usa useTheme() y todos los controles se enteran.'],
    a11y: ['Es un SegmentedControl: grupo con nombre «Tema» y opciones que se recorren con las flechas.'],
  },
  'scroll-area': {
    use: ['Úsala para listas largas dentro de un panel: historial, mensajes, documentos.'],
    avoid: ['No metas una ScrollArea dentro de otra.', 'Para tablas largas usa DataTable con maxHeight, que además tiene filas virtuales.'],
    a11y: ['Siempre con label: es una región con nombre que recibe el foco con Tab.'],
  },
  'use-hotkey': {
    use: [
      'Para acciones frecuentes: buscar (mod+k), nueva oferta, ayuda (?).',
      'Enseña el atajo con Kbd y hotkeyLabel() junto al botón que hace lo mismo.',
    ],
    avoid: ['No uses atajos que ya tiene el navegador o el sistema (mod+w, mod+t).', 'Un atajo nunca es la única forma de hacer algo.'],
    a11y: ['Los atajos de una tecla sin modificador no saltan mientras se escribe en un campo.'],
  },
  'visually-hidden': {
    use: ['Para completar el nombre de un botón o enlace que se entiende por el contexto visual: «Ver» → «Ver la oferta OF-0418».'],
    avoid: ['No escondas información que también necesita quien ve la pantalla.'],
    a11y: ['El texto se lee y forma parte del nombre accesible, pero no ocupa sitio.'],
  },
}
