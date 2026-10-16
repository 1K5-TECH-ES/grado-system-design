// Textos de los componentes. Los usan @1k5-tech-es/grado-react y @1k5-tech-es/grado-vue a través de
// GradoProvider (React) o del plugin Grado (Vue). Las props de cada componente
// (closeLabel, emptyLabel…) tienen prioridad sobre estos textos.
// {nombre} se sustituye con formatMessage().

import { de } from './messages/de.js'
import { en } from './messages/en.js'
import { warnOnce } from './dev.js'

export const DEFAULT_LOCALE = 'es-ES'

const es = {
  close: 'Cerrar',
  dismiss: 'Cerrar aviso',
  notifications: 'Notificaciones',
  fieldRequired: 'Este campo es obligatorio',
  fieldInvalid: 'El valor no es válido',
  columns: 'Columnas',
  chartHint: 'Usa las flechas para recorrer los datos.',
  tariffValle: 'Valle',
  tariffLlano: 'Llano',
  tariffPunta: 'Punta',
  tariffPeriod: 'Periodo',
  priceHour: 'Hora',
  price: 'Precio',
  priceCheapest: 'Más barato',
  priceDearest: 'Más caro',
  priceNow: 'Ahora',
  batteryEnergy: '{value} de {capacity}',
  batteryReserve: 'Reserva: {level}',
  errorSummaryOne: 'Revisa 1 campo antes de continuar',
  errorSummaryMany: 'Revisa {count} campos antes de continuar',
  loading: 'Cargando',
  loadingEllipsis: 'Cargando…',
  loadingData: 'Cargando datos',
  search: 'Buscar',
  searchPlaceholder: 'Buscar…',
  noResults: 'No hay resultados',
  options: 'Opciones',
  menu: 'Menú',
  skipToContent: 'Saltar al contenido',
  mainNavigation: 'Navegación principal',
  indicators: 'Indicadores',
  previous: 'antes',
  trendUp: 'Sube',
  trendDown: 'Baja',
  trendFlat: 'Sin cambios',
  statusOnline: 'Disponible',
  statusAway: 'Ausente',
  statusBusy: 'Ocupado',
  pagination: 'Paginación',
  previousPage: 'Página anterior',
  nextPage: 'Página siguiente',
  pageN: 'Página {page}',
  pageRange: '{from}–{to} de {total}',
  noResultsCount: '0 resultados',
  dateFrom: 'Desde',
  dateTo: 'Hasta',
  rangeInverted: 'La fecha final debe ser igual o posterior a la inicial.',
  rangeMin: 'Selecciona fechas a partir de {min}.',
  rangeMax: 'Selecciona fechas hasta {max}.',
  uploadLabel: 'Seleccionar archivos',
  uploadHint: 'Selecciona o arrastra tus archivos aquí.',
  uploadSingle: 'Selecciona un solo archivo.',
  uploadTooBig: '{name}: supera el límite de {size} MB.',
  uploadFormat: '{name}: formato no admitido.',
  uploadFailed: 'No se pudo subir el archivo.',
  uploading: 'Subiendo {name}',
  uploadDone: 'Completado',
  retry: 'Reintentar',
  retryFile: 'Reintentar {name}',
  removeFile: 'Eliminar {name}',
  progress: 'Progreso',
  completed: 'completado',
  history: 'Historial',
  removeFilter: 'Quitar filtro: {label}',
  clearFilters: 'Limpiar filtros',
  breadcrumbs: 'Ruta de navegación',
  selectPage: 'Seleccionar página actual',
  selectRow: 'Seleccionar fila {key}',
  actions: 'Acciones',
  selectedNone: 'Ninguna fila seleccionada',
  selectedOne: '1 fila seleccionada',
  selectedMany: '{count} filas seleccionadas',
  decrease: 'Reducir',
  increase: 'Aumentar',
  removeItem: 'Quitar {label}',
  calendar: 'Calendario',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  today: 'Hoy',
  commandPalette: 'Paleta de comandos',
  commandPlaceholder: 'Busca o escribe un comando…',
  chartData: 'Datos del gráfico',
  total: 'Total',
  // ---------- Datos y piezas (0.3) ----------
  copy: 'Copiar',
  copied: 'Copiado',
  copyFailed: 'No se pudo copiar',
  copyNamed: 'Copiar {label}',
  progressStep: 'Paso {value} de {max}',
  avatarMore: 'y {count} más',
  opensInNewTab: '(se abre en otra pestaña)',
  // ---------- Gráficos (0.3) ----------
  meterLabel: 'Nivel',
  valueOfMax: '{value} de {max}',
  energyFlow: 'Flujo de energía',
  energySolar: 'Placas',
  energyHome: 'Casa',
  energyBattery: 'Batería',
  energyGrid: 'Red',
  energyProducing: 'Produciendo',
  energyNoProduction: 'Sin producción',
  energyConsuming: 'Consumiendo',
  energyNoConsumption: 'Sin consumo',
  energyCharging: 'Cargando',
  energyDischarging: 'Descargando',
  energyBatteryIdle: 'En reposo',
  energyImporting: 'Importando',
  energyExporting: 'Exportando',
  energyGridIdle: 'Sin intercambio',
  batteryLevel: 'Carga: {level}',
  // ---------- Campos especiales (0.3) ----------
  clearSearch: 'Borrar búsqueda',
  showPassword: 'Mostrar contraseña',
  hidePassword: 'Ocultar contraseña',
  timePlaceholder: 'hh:mm',
  timeOptions: 'Horas disponibles',
  timeInvalid: 'Escribe la hora como 09:30.',
  timeMin: 'Elige una hora a partir de las {min}.',
  timeMax: 'Elige una hora hasta las {max}.',
  phoneCountry: 'Prefijo del país',
  phoneInvalid: 'El número no tiene una longitud válida para ese país.',
  phoneSpainLength: 'Un teléfono español tiene 9 cifras.',
  phoneSpainStart: 'Un teléfono español empieza por 6, 7, 8 o 9.',
  nifDniFormat: 'El DNI tiene 8 cifras y una letra.',
  nifDniLetter: 'La letra del DNI no coincide.',
  nifNieFormat: 'El NIE tiene una letra (X, Y o Z), 7 cifras y otra letra.',
  nifNieLetter: 'La letra del NIE no coincide.',
  nifCifFormat: 'El CIF tiene una letra, 7 cifras y un carácter de control.',
  nifCifControl: 'El carácter de control del CIF no coincide.',
  nifInvalid: 'Escribe un DNI, NIE o CIF.',
  ibanCountry: 'El IBAN empieza por el código del país y dos cifras: ES91…',
  ibanLength: 'Un IBAN de {country} tiene {length} caracteres.',
  ibanInvalid: 'Un IBAN tiene entre 15 y 34 caracteres.',
  ibanChecksum: 'Los dígitos de control del IBAN no coinciden. Revisa las cifras.',
  addressPlaceholder: 'Calle, número y municipio',
  addressOptions: 'Direcciones sugeridas',
  addressMinChars: 'Escribe al menos {count} caracteres.',
  addressFailed: 'No se pudieron cargar las direcciones.',
  // ---------- Superposiciones y acciones (0.3) ----------
  selectedCountOne: '1 seleccionada',
  selectedCountMany: '{count} seleccionadas',
  clearSelection: 'Quitar selección',
  // ---------- Labs (0.6) ----------
  themeLabel: 'Tema',
  themeLight: 'Claro',
  themeDark: 'Oscuro',
  themeSystem: 'Sistema',
}
export const MESSAGES = { 'es-ES': es, 'de-DE': de, 'en-GB': en }

/**
 * Textos para un idioma: el pedido, si no el de la misma lengua (de-AT → de-DE),
 * y si no español. `overrides` cambia textos sueltos.
 */
export function messagesFor(locale = DEFAULT_LOCALE, overrides) {
  const language = String(locale).split('-')[0]
  const match = MESSAGES[locale] ?? Object.entries(MESSAGES).find(([key]) => key.split('-')[0] === language)?.[1]
  // 1.0 solo traerá el español: quien usa otro idioma tiene que pasar sus textos.
  if (match && match !== es && !Object.keys(es).every((key) => key in (overrides ?? {})))
    warnOnce(
      `messages-${language}`,
      `Grado 1.0 solo incluirá los textos en español. Para ${locale}, importa los suyos y pásalos en messages: ` +
        `import ${language} from '@1k5-tech-es/grado/messages/${language}' y <GradoProvider locale="${locale}" messages={${language}}> ` +
        `(Vue: app.use(Grado, { locale: '${locale}', messages: ${language} })).`,
    )
  return { ...es, ...match, ...overrides }
}

/** «Página {page}» + { page: 3 } → «Página 3». Deja tal cual las claves que no se pasan. */
export function formatMessage(template, values = {}) {
  return String(template).replace(/\{(\w+)\}/g, (all, key) => (values[key] == null ? all : String(values[key])))
}
