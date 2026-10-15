// Catálogo · grupo «superposiciones y acciones». Devuelve las secciones que se añaden al final de catalog/index.html.
// section(título, nota, ...hijos), row(...hijos) y label(texto) son los mismos ayudantes que usa catalog.mjs.
// sections({ r, G, section, row, label, icons })
import { formatNumber } from '@1k5-tech-es/grado/patterns'

const noop = () => {}

export default function sections({ r, G, section, row, label, icons }) {
  const { Settings, Bell, Download, Sun, Chart } = icons
  // Datos del suministro en el Popover: etiqueta y valor en dos líneas.
  const datum = (name, value) =>
    r('p', { style: { margin: '0 0 6px' } }, r('span', { className: 'cat-label' }, name), r('br'), value)
  return [
    section(
      'Superposiciones y acciones',
      'Popover, Banner, ActionBar, ContextMenu, IconButton y ToggleGroup. La barra de acciones flota abajo en la aplicación; aquí se muestra en línea.',
      r(
        'div',
        { className: 'cat-grid' },
        r(
          'div',
          { className: 'cat-stack', style: { minHeight: '17rem', alignContent: 'start' } },
          label('Popover abierto'),
          r(
            G.Popover,
            { label: 'Ver suministro', title: 'CUPS ES0021000000000001AB', defaultOpen: true },
            datum('Distribuidora', 'i-DE Redes Eléctricas Inteligentes'),
            datum('Tarifa de acceso', '2.0TD'),
            datum('Potencia contratada', `P1 ${formatNumber(4.6, 'es-ES', 1)} kW · P2 ${formatNumber(4.6, 'es-ES', 1)} kW`),
          ),
        ),
        r(
          'div',
          { className: 'cat-stack' },
          label('ContextMenu: clic derecho o Mayúsculas + F10 sobre la zona'),
          r(
            G.ContextMenu,
            {
              label: 'Instalación de Lucía Fernández',
              items: [
                { id: 'abrir', label: 'Abrir ficha' },
                { id: 'cups', label: 'Copiar CUPS' },
                { id: 'baja', label: 'Dar de baja', danger: true, separator: true },
              ],
            },
            r(
              G.Card,
              null,
              r(
                G.CardHeader,
                null,
                r(G.CardTitle, null, 'Lucía Fernández'),
                r(G.CardDescription, null, `Valencia · ${formatNumber(8.4, 'es-ES', 1)} kWp`),
              ),
            ),
          ),
        ),
      ),
      label('Banner bajo la cabecera de AppShell'),
      r(
        G.Banner,
        {
          tone: 'warning',
          title: 'Mantenimiento del portal de i-DE.',
          action: r(G.Button, { variant: 'link' }, 'Ver estado'),
          onDismiss: noop,
        },
        'El sábado 18 de octubre, de 8:00 a 12:00, las altas de autoconsumo quedarán en cola.',
      ),
      r(G.Banner, { tone: 'brand', title: 'Novedad.' }, 'Ya puedes firmar ofertas desde la ficha del cliente.'),
      label('ActionBar con filas elegidas en DataTable'),
      r(
        G.ActionBar,
        { count: 3, inline: true, onClear: noop },
        r(G.Button, { variant: 'secondary', size: 'sm', icon: Download }, 'Exportar'),
        r(G.Button, { variant: 'ghost', size: 'sm' }, 'Asignar instalador'),
        r(G.Button, { variant: 'ghost', size: 'sm' }, 'Cambiar estado'),
      ),
      label('IconButton: fantasma, secundario, principal, conmutado y desactivado'),
      row(
        r(G.IconButton, { icon: Settings, label: 'Ajustes' }),
        r(G.IconButton, { icon: Download, label: 'Descargar informe', variant: 'secondary' }),
        r(G.IconButton, { icon: Chart, label: 'Ver producción', variant: 'primary' }),
        r(G.IconButton, { icon: Bell, label: 'Seguir instalación', pressed: true }),
        r(G.IconButton, { icon: Sun, label: 'Mostrar producción', variant: 'secondary', pressed: false }),
        r(G.IconButton, { icon: Bell, label: 'Avisos', size: 'sm', pressed: true }),
        r(G.IconButton, { icon: Settings, label: 'Ajustes (sin permiso)', disabled: true }),
      ),
      label('ToggleGroup: una opción o ninguna, y varias'),
      row(
        r(G.ToggleGroup, {
          label: 'Estado de la instalación',
          defaultValue: 'obra',
          options: [
            { value: 'conectada', label: 'Conectadas' },
            { value: 'obra', label: 'En obra' },
            { value: 'pendiente', label: 'Pendientes' },
          ],
        }),
        r(G.ToggleGroup, {
          label: 'Columnas visibles',
          type: 'multiple',
          defaultValue: ['produccion', 'avisos'],
          iconOnly: true,
          options: [
            { value: 'produccion', label: 'Producción', icon: Sun },
            { value: 'grafico', label: 'Gráfico', icon: Chart },
            { value: 'avisos', label: 'Avisos', icon: Bell },
            { value: 'ajustes', label: 'Ajustes', icon: Settings, disabled: true },
          ],
        }),
        r(G.ToggleGroup, {
          label: 'Filtros rápidos',
          type: 'multiple',
          size: 'sm',
          defaultValue: ['valencia'],
          options: [
            { value: 'valencia', label: 'Valencia' },
            { value: 'murcia', label: 'Murcia' },
            { value: 'bateria', label: 'Con batería' },
          ],
        }),
      ),
    ),
  ]
}
