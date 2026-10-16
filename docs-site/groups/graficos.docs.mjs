// Web de documentación · grupo «gráficos»: fichas de componente y guías de uso.
// entry(id, nombre, categoría, descripción, react(...), vue(...), props, nota) como en components.mjs.
// Categorías: Acciones, Formularios, Datos, Estructura, Navegación, Superposiciones, Respuesta.
// La demo en vivo de cada id está en graficos.demos.mjs.
import { entry, react, vue, list } from '../doc-helpers.mjs'

const weekSetup = `const data = ${list(
  "{ dia: 'Lun', produccion: 31.2, consumo: 18.4 }",
  "{ dia: 'Mar', produccion: 28.6, consumo: 17.9 }",
  "{ dia: 'Mié', produccion: 12.3, consumo: 19.5 }",
)};\nconst series = ${list("{ key: 'produccion', label: 'Producción' }", "{ key: 'consumo', label: 'Consumo' }")};`
const donutSetup = `const segments = ${list("{ label: 'Autoconsumo', value: 21 }", "{ label: 'Excedentes', value: 9.9 }")};`

export const entries = [
  entry(
    'sparkline',
    'Sparkline',
    'Datos',
    'Línea de tendencia mínima, sin ejes, para acompañar una cifra. También como trend de Kpi.',
    react(
      'KpiGroup, Kpi, Sparkline',
      `<>
  <KpiGroup>
    <Kpi label="Producción hoy" value="30,9 kWh" change={8.4} trend={[22, 25, 24, 28, 27, 30, 31]} />
  </KpiGroup>
  <Sparkline data={[61, 63, 58, 64, 66, 68]} area label="Autoconsumo de la semana: al alza" />
</>`,
    ),
    vue(
      'KpiGroup, Kpi, Sparkline',
      `<KpiGroup>
  <Kpi label="Producción hoy" value="30,9 kWh" :change="8.4" :trend="[22, 25, 24, 28, 27, 30, 31]" />
</KpiGroup>
<Sparkline :data="[61, 63, 58, 64, 66, 68]" area label="Autoconsumo de la semana: al alza" />`,
    ),
    [
      ['data', 'Valores en orden', 'Obligatorio'],
      ['tone', 'brand · success · danger · neutral', 'brand'],
      ['area', 'Relleno suave bajo la línea', 'false'],
      ['height', 'Alto en píxeles', '32'],
      ['label', 'Nombre accesible; sin él, es decorativa', '—'],
      ['Kpi: trend', 'Sparkline decorativa bajo la cifra, del color de la variación', '—'],
    ],
    'La escala va del mínimo al máximo de los datos; si todos son iguales, la línea queda plana en el centro. El último punto va marcado.',
  ),
  entry(
    'line-chart',
    'LineChart',
    'Datos',
    'Series temporales, como la producción y el consumo diarios, con una tabla para lectores de pantalla. AreaChart rellena el área.',
    react(
      'LineChart',
      `<LineChart
  title="Producción frente a consumo"
  description="kWh por día"
  data={data}
  categoryKey="dia"
  categoryLabel="Día"
  series={series}
  unit="kWh"
/>`,
      weekSetup,
    ),
    vue(
      'LineChart',
      `<LineChart
  title="Producción frente a consumo"
  description="kWh por día"
  :data="data"
  category-key="dia"
  category-label="Día"
  :series="series"
  unit="kWh"
/>`,
      weekSetup,
    ),
    [
      ['data / categoryKey', 'Filas y campo con el nombre de cada punto', 'Obligatorios'],
      ['series', 'key, label, tone (1–5: chart-1 … chart-5)', 'Obligatorio'],
      ['area', 'Rellena bajo cada línea (AreaChart: true)', 'false'],
      ['interactive', 'Tarjeta con los valores al pasar el ratón y flechas para recorrer los datos', 'true'],
      ['unit / decimals', 'Unidad y decimales de los valores', '— / 1'],
      ['title / description / categoryLabel', 'Textos del gráfico y de la tabla accesible', '—'],
      ['height / legend', 'Alto de la zona de líneas / leyenda', '15rem / con más de una serie'],
    ],
    'Misma forma de datos que BarChart. Los ejes y textos son HTML, nítidos a cualquier ancho; el último punto de cada serie va marcado y cada día muestra sus valores al pasar el ratón.',
  ),
  entry(
    'donut',
    'Donut',
    'Datos',
    'Proporción de un total, como el autoconsumo frente a los excedentes, con la cifra clave en el centro.',
    react(
      'Donut',
      `<>
  <Donut label="Energía producida hoy" segments={segments} unit="kWh" centerValue="68 %" centerLabel="Autoconsumo" />
  <Donut label="Cobertura solar" value={6.8} max={10} size="sm" />
</>`,
      donutSetup,
    ),
    vue(
      'Donut',
      `<Donut label="Energía producida hoy" :segments="segments" unit="kWh" center-value="68 %" center-label="Autoconsumo" />
<Donut label="Cobertura solar" :value="6.8" :max="10" size="sm" />`,
      donutSetup,
    ),
    [
      ['segments', 'label, value, tone (1–5)', '—'],
      ['value / max', 'Un solo valor sobre un máximo, en lugar de segments', '0 / 100'],
      ['label', 'Qué mide; encabeza el nombre accesible', '—'],
      ['centerValue / centerLabel', 'Cifra y texto del centro', 'Con un valor: su porcentaje'],
      ['size', 'sm · md · lg', 'md'],
      ['legend / unit', 'Leyenda al lado / unidad para la lista oculta', 'Con segments / —'],
    ],
    'Los porcentajes se redondean para que sumen 100. El anillo es una imagen con un nombre que resume los porcentajes («Autoconsumo 68 %, Excedentes 32 %»), y una lista oculta da los valores con su unidad.',
  ),
  entry(
    'meter',
    'Meter',
    'Datos',
    'Valor dentro de un rango conocido: carga de batería, cobertura solar. El tono dice si está bien, regular o mal.',
    react(
      'Meter',
      `<>
  <Meter label="Carga de batería" value={72} low={20} high={50} optimum={100} unit="%" variant="segments" />
  <Meter label="Cobertura solar del consumo" value={68} unit="%" />
</>`,
    ),
    vue(
      'Meter',
      `<Meter label="Carga de batería" :value="72" :low="20" :high="50" :optimum="100" unit="%" variant="segments" />
<Meter label="Cobertura solar del consumo" :value="68" unit="%" />`,
    ),
    [
      ['value / min / max', 'Valor y rango', 'Obligatorio / 0 / 100'],
      ['low / high / optimum', 'Zonas y cuál es la buena, como en <meter>', '— (tono neutro)'],
      ['label / unit', 'Qué mide (nombre accesible) / unidad', '— / —'],
      ['showValue', 'Muestra el valor junto a la etiqueta', 'true'],
      ['variant / segments', 'bar · segments / número de segmentos', 'bar / 10'],
      ['valueText', 'Texto para lectores de pantalla en lugar del valor', 'Valor con su unidad'],
    ],
    'Para el avance de una tarea usa Progress: Meter mide algo que sube y baja dentro de un rango. Sin low, high ni optimum el tono es neutro.',
  ),
  entry(
    'energy-flow',
    'EnergyFlow',
    'Datos',
    'Flujo de energía en vivo de una vivienda: placas, casa, batería y red alrededor del inversor.',
    react('EnergyFlow', `<EnergyFlow solar={5.8} home={2.1} battery={1.6} grid={-2.1} batteryLevel={72} />`),
    vue('EnergyFlow', `<EnergyFlow :solar="5.8" :home="2.1" :battery="1.6" :grid="-2.1" :battery-level="72" />`),
    [
      ['solar / home', 'Producción y consumo, en kW (≥ 0)', 'Obligatorios'],
      ['battery', 'Positivo: cargando · negativo: descargando', 'Sin valor, no aparece'],
      ['grid', 'Positivo: importando · negativo: exportando', 'Sin valor, no aparece'],
      ['batteryLevel', 'Carga de la batería, de 0 a 100', '—'],
      ['unit / decimals', 'Unidad y decimales', 'kW / 1'],
      ['title', 'Título visible y principio del resumen', '«Flujo de energía»'],
    ],
    'Cada línea lleva una flecha con el sentido; si se permite movimiento, además un trazo que avanza. Con valor 0 la línea queda gris y sin flecha. Funciona de 320 a 800 px de ancho.',
  ),
]

// id → { use: [...], avoid: [...], a11y: [...] }
export const guidelines = {
  sparkline: {
    use: [
      'Úsala junto a una cifra para enseñar su tendencia reciente, por ejemplo la producción de los últimos 7 días.',
      'En un Kpi, pasa la serie en trend: toma el color de la variación.',
      'Usa tone solo para estado: success o danger cuando la tendencia es buena o mala.',
    ],
    avoid: ['No la uses para leer valores concretos: no tiene ejes. Para eso usa LineChart.', 'Evita más de una sparkline por cifra.'],
    a11y: [
      'Sin label es decorativa (aria-hidden): la cifra de al lado ya da la información.',
      'Con label es una imagen con ese nombre. Di qué muestra y hacia dónde va: «Producción de la semana: al alza».',
    ],
  },
  'line-chart': {
    use: [
      'Úsalo para series en el tiempo: producción y consumo diarios, potencia a lo largo del día.',
      'Usa AreaChart, o area, cuando importa el volumen además de la forma.',
      'Pon la unidad en unit y el periodo en description.',
    ],
    avoid: [
      'Para comparar categorías sin orden en el tiempo usa BarChart.',
      'Evita más de tres o cuatro series: se cruzan y no se leen. Con área, mejor una o dos.',
    ],
    a11y: [
      'Se recorre con las flechas, Inicio y Fin, y cada dato se anuncia. Los datos están además en una tabla oculta.',
      'Da un categoryLabel («Día») para la cabecera de la tabla.',
      'Las series se distinguen por color y leyenda; con dos series, elige tonos de luminosidad distinta.',
    ],
  },
  donut: {
    use: [
      'Úsalo para la parte de un total: autoconsumo frente a excedentes, cobertura solar.',
      'Pon la cifra clave en el centro con centerValue y centerLabel.',
      'Con un solo valor, usa value y max.',
    ],
    avoid: [
      'No pases de cuatro o cinco segmentos: las porciones pequeñas no se distinguen.',
      'Para comparar cantidades entre sí usa BarChart.',
    ],
    a11y: [
      'El anillo es una imagen con un nombre que resume los porcentajes.',
      'Una lista oculta da los valores con su unidad; la leyenda visible se oculta para no repetirlos.',
      'Da un label que diga qué mide: encabeza el nombre accesible.',
    ],
  },
  meter: {
    use: [
      'Úsalo para un valor que sube y baja dentro de un rango: carga de batería, cobertura solar.',
      'Define low, high y optimum para que el tono diga si está bien, regular o mal.',
      'Usa variant segments para la batería.',
    ],
    avoid: [
      'Para el avance de una tarea (subida, alta de cliente) usa Progress.',
      'No uses el color como único dato: muestra el valor con showValue.',
    ],
    a11y: [
      'Tiene role="meter" con aria-valuenow, aria-valuemin, aria-valuemax y aria-valuetext.',
      'label es su nombre accesible; sin él se anuncia «Nivel».',
      'Con valueText cambias lo que se lee, por ejemplo «72 %, unas 6 horas de autonomía».',
    ],
  },
  'energy-flow': {
    use: [
      'Úsalo para el estado en vivo de una vivienda: lo que producen las placas, lo que consume la casa y lo que entra o sale de la batería y la red.',
      'Pasa solo los nodos que existen: sin batería o sin red, no se pintan.',
      'Respeta los signos: battery positivo carga y grid positivo importa.',
    ],
    avoid: ['No lo uses para históricos: para eso, LineChart.', 'No lo metas en espacios de menos de 320 px de ancho.'],
    a11y: [
      'El diagrama es una imagen cuyo nombre resume cada nodo: valor y estado.',
      'Una lista oculta repite los datos, uno por nodo.',
      'El sentido se lee sin animación: cada línea lleva una flecha. Con «reducir movimiento» el trazo no se mueve.',
    ],
  },
}
