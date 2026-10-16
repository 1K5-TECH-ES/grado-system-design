// Web de documentación · grupo «energía» (0.4): fichas de componente y guías de uso.
// entry(id, nombre, categoría, descripción, react(...), vue(...), props, nota) como en components.mjs.
// La demo en vivo de cada id está en energia.demos.mjs.
import { entry, react, vue } from '../doc-helpers.mjs'

const pricesSetup = `// Precio de cada hora, de 0:00 a 23:00 (24) o de cada cuarto de hora (96).
const prices = [0.112, 0.104, 0.098, 0.095, 0.094, 0.097, 0.108, 0.126, 0.152, 0.168, 0.181, 0.176,
  0.171, 0.164, 0.142, 0.138, 0.141, 0.159, 0.196, 0.214, 0.209, 0.192, 0.168, 0.131];`
const weekSetup = `// Consumo medio por hora (kWh): una fila por día, de lunes a domingo, y 24 columnas.
const week = Array.from({ length: 7 }, () => Array.from({ length: 24 }, (_, h) => (h >= 19 && h <= 22 ? 1.3 : 0.3)));`

export const entries = [
  entry(
    'price-chart',
    'PriceChart',
    'Datos',
    'El precio de la luz de un día, por horas o por cuartos de hora, con cada franja del color de su periodo de la 2.0TD.',
    react('PriceChart', `<PriceChart prices={prices} date="2026-10-16" now="20:15" title="Precio de la luz" />`, pricesSetup),
    vue('PriceChart', `<PriceChart :prices="prices" date="2026-10-16" now="20:15" title="Precio de la luz" />`, pricesSetup),
    [
      ['prices', 'Precio de cada franja: 24 (horas) o 96 (cuartos de hora). null: sin precio', 'Obligatorio'],
      [
        'date / holidays',
        'Día de los precios; sábados, domingos y festivos nacionales de fecha fija son valle todo el día. holidays añade otros',
        '— / []',
      ],
      ['periods', 'Periodo de cada franja si no es la 2.0TD de la península (Ceuta, Melilla, otra tarifa)', '—'],
      ['now', 'Hora de ahora, «HH:MM»: marca su franja', '—'],
      ['unit / decimals', 'Unidad y decimales del precio', '€/kWh / 3'],
      ['summary / legend / interactive', 'Franjas más barata y más cara, leyenda de periodos, tarjeta y teclado', 'true'],
    ],
    'Valle de 0 a 8 h; punta de 10 a 14 h y de 18 a 22 h; llano el resto. Las funciones priceSlots, tariffPeriod e isOffPeakDay de @1k5-tech-es/grado/patterns dan lo mismo sin dibujarlo. Los precios negativos se dibujan en cero.',
  ),
  entry(
    'battery-level',
    'BatteryLevel',
    'Datos',
    'La carga de la batería de casa: porcentaje, energía guardada, si carga o descarga y la reserva para cortes.',
    react('BatteryLevel', `<BatteryLevel level={72} capacity={10} power={2.1} reserve={20} />`),
    vue('BatteryLevel', `<BatteryLevel :level="72" :capacity="10" :power="2.1" :reserve="20" />`),
    [
      ['level', 'Carga, de 0 a 100', 'Obligatorio'],
      ['capacity', 'Capacidad en kWh: añade «7,2 de 10 kWh»', '—'],
      ['power', 'kW: positiva, cargando; negativa, descargando; menos de 50 W, en reposo', '—'],
      ['reserve', 'Reserva para cortes, de 0 a 100: una línea a esa altura', '—'],
      ['label / size', 'Qué batería es / sm o md', 'Batería / md'],
    ],
    'Verde por encima del 25 %, ámbar hasta el 25 % y rojo hasta el 10 %. Para el flujo entre placas, casa, batería y red usa EnergyFlow.',
  ),
  entry(
    'heatmap',
    'Heatmap',
    'Datos',
    'Un valor por celda en la intensidad de un color: el consumo por hora y día de la semana, la producción por mes y año.',
    react('Heatmap', `<Heatmap data={week} unit="kWh" title="Consumo por hora" rowLabel="Día" />`, weekSetup),
    vue('Heatmap', `<Heatmap :data="week" unit="kWh" title="Consumo por hora" row-label="Día" />`, weekSetup),
    [
      ['data', 'Filas de valores; null es una celda sin dato', 'Obligatorio'],
      ['rowLabels / columnLabels', 'Nombres de filas y columnas. Con 7 filas, días de la semana; con 24 columnas, horas', 'automáticos'],
      ['rowLabel', 'Cabecera de la columna de filas en la tabla accesible: «Día»', '—'],
      ['tone / min / max', 'Color chart-1 … chart-5 y extremos de la escala', '1 / de los datos'],
      ['unit / decimals / legend / interactive', 'Unidad, decimales, escala de color y tarjeta con teclado', '— / 1 / true / true'],
    ],
    'Con las flechas se recorren las celdas en las dos direcciones; Inicio y Fin van al principio y al final de la fila.',
  ),
  entry(
    'energy-icons',
    'SolarPanelIcon y otros iconos',
    'Estructura',
    'Iconos de una instalación con el trazo de Lucide: placa, batería, red, bomba de calor, cargador, contador e inversor.',
    react(
      'Button, HeatPumpIcon, NavItem, WallboxIcon',
      `<>
  <Button icon={HeatPumpIcon} variant="secondary">Añadir aerotermia</Button>
  <NavItem href="/cargadores" label="Cargadores" icon={WallboxIcon} />
</>`,
    ),
    vue(
      'Button, HeatPumpIcon, NavItem, WallboxIcon',
      `<Button :icon="HeatPumpIcon" variant="secondary">Añadir aerotermia</Button>
<NavItem href="/cargadores" label="Cargadores" :icon="WallboxIcon" />`,
    ),
    [
      ['Iconos', 'SolarPanelIcon, HomeBatteryIcon, PowerGridIcon, HeatPumpIcon, WallboxIcon, ElectricMeterIcon, InverterIcon', '—'],
      ['title', 'Nombre para lectores de pantalla; sin él, el icono es decorativo', '—'],
      ['Sin framework', 'ENERGY_ICON_PATHS de @1k5-tech-es/grado/classes: los trazos de cada uno', '—'],
    ],
    'Se pasan como icon a Button, IconButton, NavItem o EmptyState, igual que los de lucide-react. Miden 24 × 24 y toman el color del texto.',
  ),
]

export const guidelines = {
  'price-chart': {
    use: [
      'Úsalo para enseñar cuándo sale más barato consumir: poner la lavadora, cargar el coche, la batería.',
      'Pasa date: los fines de semana y festivos todo el día es valle.',
      'Con now, el cliente ve dónde está ahora sin buscarlo.',
    ],
    avoid: [
      'Para comparar varios días usa LineChart con una serie por día.',
      'No lo uses para tarifas sin periodos (precio fijo): con un número basta.',
    ],
    a11y: [
      'Se recorre con las flechas y cada franja se anuncia con su hora, su periodo y su precio.',
      'El periodo no depende solo del color: está en la tarjeta, en la leyenda y en la tabla oculta.',
      'Las franjas más barata y más cara se leen como texto bajo el título.',
    ],
  },
  'battery-level': {
    use: [
      'Úsalo en la ficha de la instalación y en la app del cliente para la batería de casa.',
      'Pasa power para decir si está cargando o descargando, y reserve si guarda energía para cortes.',
    ],
    avoid: [
      'Para otros porcentajes (cobertura solar, autoconsumo) usa Meter.',
      'No lo pongas junto a EnergyFlow con los mismos datos: elige uno.',
    ],
    a11y: [
      'Es un role="meter" con todo el texto en aria-valuetext: «72 %, 7,2 de 10 kWh, Cargando · 2,1 kW».',
      'El estado va con punto y texto, no solo con color.',
    ],
  },
  heatmap: {
    use: [
      'Úsalo para ver patrones: a qué horas y qué días se consume más, cómo cambia la producción por mes.',
      'Indica unit y title, y rowLabel para la tabla accesible.',
    ],
    avoid: [
      'Para leer valores exactos usa DataTable: el color solo da una idea.',
      'Con menos de una docena de celdas, una tabla o un BarChart se leen mejor.',
    ],
    a11y: [
      'Se recorre con las flechas en las dos direcciones y cada celda se anuncia con su fila, su columna y su valor.',
      'Los datos están además en una tabla oculta.',
    ],
  },
  'energy-icons': {
    use: [
      'Úsalos para los equipos de una instalación en navegación, botones y estados vacíos.',
      'Para el resto de iconos, usa lucide-react: el trazo es el mismo.',
    ],
    avoid: ['No los uses para estados (bien, aviso, error): para eso están los iconos de Alert y Status.'],
    a11y: [
      'Sin title son decorativos (aria-hidden): el nombre lo pone el botón o el enlace.',
      'Solo con title son una imagen con nombre; úsalo cuando el icono va solo.',
    ],
  },
}
