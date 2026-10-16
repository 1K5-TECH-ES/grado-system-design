// Pruebas en navegador · grupo «tablas» (0.4): DataTable con datos «del servidor» (manual),
// selector de columnas y cabecera fija; y (0.5) filas virtuales. El servidor es esta función: ordena y pagina 125 filas.
export const initial = { tablaPage: 1, tablaSort: null, tablaHidden: [] }

const provincias = ['Madrid', 'Valencia', 'Sevilla']
const all = Array.from({ length: 125 }, (_, i) => ({
  id: `INS-${i + 1}`,
  cliente: `Cliente ${String(i + 1).padStart(3, '0')}`,
  provincia: provincias[i % 3],
  kwp: 3 + ((i * 37) % 90) / 10,
}))
const many = Array.from({ length: 2000 }, (_, i) => ({
  id: `L-${i + 1}`,
  cliente: `Lectura ${String(i + 1).padStart(4, '0')}`,
  provincia: provincias[i % 3],
  kwp: (i % 50) / 10,
}))
const columns = [
  { key: 'cliente', header: 'Cliente', hideable: false },
  { key: 'provincia', header: 'Provincia' },
  { key: 'kwp', header: 'Potencia', numeric: true, sortable: true },
]

function server({ page, sort }) {
  const sorted = sort ? [...all].sort((a, b) => (a[sort.key] - b[sort.key]) * (sort.direction === 'asc' ? 1 : -1)) : all
  return sorted.slice((page - 1) * 10, page * 10)
}

export function render({ C, section, set, state, isVue }) {
  return [
    section(
      'tablas',
      C('DataTable', {
        rows: server({ page: state.tablaPage, sort: state.tablaSort }),
        columns,
        rowKey: 'id',
        caption: 'Instalaciones',
        manual: true,
        totalRows: all.length,
        pageSize: 10,
        page: state.tablaPage,
        sort: state.tablaSort,
        onPageChange: set('tablaPage'),
        onSortChange: set('tablaSort'),
        columnPicker: true,
        hiddenColumns: state.tablaHidden,
        ...(isVue ? { 'onUpdate:hiddenColumns': set('tablaHidden') } : { onHiddenColumnsChange: set('tablaHidden') }),
        maxHeight: 240,
      }),
    ),
    // Filas virtuales (0.5): 2000 filas con alto máximo; solo se pintan las que se ven.
    section(
      'virtuales',
      C('DataTable', {
        rows: many,
        columns,
        rowKey: 'id',
        caption: 'Lecturas',
        pageSize: 2000,
        maxHeight: 300,
      }),
    ),
  ]
}
