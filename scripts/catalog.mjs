// Genera el catálogo con @1k5-tech-es/grado-react sobre tokens.css + grado.css:
//   catalog/index.html  todos los componentes
//   catalog/app.html    el armazón de aplicación con una página de ejemplo
// Parámetros de la URL: ?tema=marca&modo=dark&menu=abierto&plegado=si
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createElement as r, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as G from '@1k5-tech-es/grado-react'
import maquetacionSections from './catalog/maquetacion.mjs'
import datosSections from './catalog/datos.mjs'
import graficosSections from './catalog/graficos.mjs'
import entradasSections from './catalog/entradas.mjs'
import superposicionesSections from './catalog/superposiciones.mjs'

const pkg = (p) => new URL(`../packages/grado/${p}`, import.meta.url)
const tokens = readFileSync(pkg('dist/tokens.css'), 'utf8')
const grado = readFileSync(pkg('dist/grado.css'), 'utf8')
const logo = readFileSync(pkg('assets/logo-1k5-white.svg'), 'utf8')
// Barlow del propio paquete: sin Google Fonts, las capturas de regresión visual son estables.
const fonts = readFileSync(pkg('dist/fonts.css'), 'utf8').replaceAll('../assets/fonts/', '../packages/grado/assets/fonts/')

const icon = (...paths) =>
  function Icon(props) {
    return r(
      'svg',
      {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...props,
      },
      ...paths.map((d) => r('path', { d, key: d })),
    )
  }
const Plus = icon('M5 12h14', 'M12 5v14')
const Download = icon('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3')
const Settings = icon('M20 7h-9', 'M14 17H5', 'M17 17a3 3 0 1 0 0-.01', 'M7 7a3 3 0 1 0 0-.01')
const Inbox = icon(
  'M22 12h-6l-2 3h-4l-2-3H2',
  'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
)
const Sun = icon(
  'M12 2v2',
  'M12 20v2',
  'M4.93 4.93l1.41 1.41',
  'M17.66 17.66l1.41 1.41',
  'M2 12h2',
  'M20 12h2',
  'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
)
const Chat = icon('M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z')
const Ticket = icon(
  'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z',
  'M13 5v2',
  'M13 17v2',
  'M13 11v2',
)
const Users = icon(
  'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
  'M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  'M22 21v-2a4 4 0 0 0-3-3.87',
  'M16 3.13a4 4 0 0 1 0 7.75',
)
const Book = icon('M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z', 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z')
const Chart = icon('M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3')
const Bell = icon('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0')

const section = (title, note, ...children) =>
  r(
    'section',
    { className: 'cat-sec' },
    r('div', { className: 'cat-head' }, r('h2', null, title), note ? r('p', null, note) : null),
    ...children,
  )
const row = (...children) => r('div', { className: 'cat-row' }, ...children)
const label = (text) => r('span', { className: 'cat-label' }, text)
const icons = { Plus, Download, Settings, Inbox, Sun, Chat, Ticket, Users, Book, Chart, Bell }
const groupSections = [maquetacionSections, datosSections, graficosSections, entradasSections, superposicionesSections].flatMap((make) =>
  make({ r, G, section, row, label, icons }),
)

const body = r(
  Fragment,
  null,
  r(G.PageHeader, {
    title: 'Instalaciones',
    subtitle: 'Seguimiento de obras de autoconsumo en España. Datos de ejemplo.',
    actions: r(
      Fragment,
      null,
      r(G.Button, { variant: 'secondary', icon: Download }, 'Exportar'),
      r(G.Button, { icon: Plus }, 'Nueva instalación'),
    ),
  }),
  section(
    'Indicadores',
    'KpiGroup y Kpi. El primero es seleccionable y está seleccionado.',
    r(
      G.KpiGroup,
      null,
      r(G.Kpi, {
        label: 'Instalaciones activas',
        value: '128',
        change: -5.9,
        better: 'lower',
        previous: '136',
        selectable: true,
        selected: true,
      }),
      r(G.Kpi, { label: 'Potencia instalada', value: '1.042 kWp', change: 10.0, previous: '947 kWp' }),
      r(G.Kpi, { label: 'Tiempo hasta legalizar', value: '23 días', change: 14.3, better: 'lower', previous: '20 días' }),
      r(G.Kpi, { label: 'Incidencias abiertas', value: '7', tone: 'danger', hint: 'Fuera de SLA' }),
    ),
  ),
  section(
    'Botones',
    'Variantes, tamaños y estados.',
    row(
      r(G.Button, null, 'Guardar cambios'),
      r(G.Button, { variant: 'secondary' }, 'Cancelar'),
      r(G.Button, { variant: 'ghost' }, 'Ver historial'),
      r(G.Button, { variant: 'danger' }, 'Eliminar'),
      r(G.Button, { variant: 'link' }, 'Abrir ficha'),
    ),
    row(
      r(G.Button, { size: 'sm', icon: Plus }, 'Pequeño'),
      r(G.Button, { icon: Plus }, 'Normal'),
      r(G.Button, { size: 'lg', icon: Plus }, 'Grande'),
      r(G.Button, { variant: 'secondary', iconOnly: true, icon: Settings, 'aria-label': 'Ajustes' }),
      r(G.Button, { loading: true }, 'Enviando'),
      r(G.Button, { variant: 'secondary', disabled: true }, 'Desactivado'),
    ),
  ),
  section(
    'Badges',
    null,
    row(
      ...['neutral', 'brand', 'info', 'success', 'warning', 'danger', 'highlight'].map((tone, i) =>
        r(G.Badge, { tone, key: tone }, ['Archivado', 'Grado', 'Abierto', 'Firmada', 'Pendiente', 'Vencido', 'Nuevo'][i]),
      ),
    ),
  ),
  section(
    'Formularios',
    'Field enlaza etiqueta, ayuda y error con el control.',
    r(
      'div',
      { className: 'cat-grid' },
      r(
        G.Field,
        { label: 'Potencia instalada', hint: 'Suma de todos los módulos del tejado.', required: true },
        r(G.Input, { suffix: 'kWp', defaultValue: '8,4', inputMode: 'decimal' }),
      ),
      r(G.Field, { label: 'Presupuesto', error: 'Introduce un importe mayor que 0.' }, r(G.Input, { prefix: '€', defaultValue: '0' })),
      r(
        G.Field,
        { label: 'Tipo de instalación' },
        r(
          G.Select,
          { defaultValue: 'bat' },
          r('option', { value: 'fv' }, 'Solo placas'),
          r('option', { value: 'bat' }, 'Placas y batería'),
          r('option', { value: 'ev' }, 'Placas, batería y cargador'),
        ),
      ),
      r(G.Field, { label: 'Email del cliente' }, r(G.Input, { type: 'email', placeholder: 'nombre@correo.es' })),
      r(
        G.Field,
        { label: 'Notas para el instalador' },
        r(G.Textarea, { rows: 3, defaultValue: 'Tejado de teja árabe. Acceso por el patio trasero.' }),
      ),
      r(
        G.Field,
        { label: 'Referencia catastral', hint: 'No se puede cambiar tras la firma.' },
        r(G.Input, { defaultValue: '9872023VH5797S0001WX', disabled: true }),
      ),
    ),
  ),
  section(
    'Interruptores',
    null,
    row(
      r(G.Switch, { defaultChecked: true, label: 'Respuesta automática', description: 'Fuera del horario de oficina' }),
      r(G.Switch, { label: 'Avisar por email de cada mensaje' }),
      r(G.Switch, { disabled: true, label: 'Sincronizar con Zoho' }),
    ),
  ),
  section(
    'Tarjetas',
    'Variantes panel, alert y plain.',
    r(
      'div',
      { className: 'cat-grid' },
      r(
        G.Card,
        null,
        r(
          G.CardHeader,
          null,
          r(G.CardTitle, null, r(Sun, { 'aria-hidden': true }), 'Producción de hoy'),
          r(G.CardDescription, null, 'Instalación de Marta Gil · Valencia'),
        ),
        r(G.CardContent, null, r('span', { className: 'cat-big' }, '31,2 kWh')),
        r(G.CardFooter, null, r(G.Button, { variant: 'secondary', size: 'sm' }, 'Ver detalle')),
      ),
      r(
        G.Card,
        { variant: 'alert' },
        r(
          G.CardHeader,
          null,
          r(G.CardTitle, null, 'El inversor no responde'),
          r(G.CardDescription, null, 'Sin datos desde hace 6 h. Revisa la conexión wifi.'),
        ),
        r(G.CardFooter, null, r(G.Button, { variant: 'danger', size: 'sm' }, 'Abrir incidencia')),
      ),
      r(
        G.Card,
        { variant: 'plain' },
        r(G.CardContent, null, r(G.EmptyState, { compact: true, icon: Inbox, description: 'Sin documentos pendientes' })),
      ),
    ),
  ),
  section(
    'Tabla',
    'Usa class="k5-num" en columnas numéricas.',
    r(
      G.Table,
      { caption: 'Últimas instalaciones' },
      r(
        'thead',
        null,
        r(
          'tr',
          null,
          r('th', null, 'Cliente'),
          r('th', null, 'Provincia'),
          r('th', null, 'Estado'),
          r('th', { className: 'k5-num' }, 'kWp'),
        ),
      ),
      r(
        'tbody',
        null,
        r(
          'tr',
          null,
          r('td', null, 'Lucía Fernández'),
          r('td', null, 'Madrid'),
          r('td', null, r(G.Badge, { tone: 'info' }, 'En obra')),
          r('td', { className: 'k5-num' }, '6,2'),
        ),
        r(
          'tr',
          null,
          r('td', null, 'Javier Ortega'),
          r('td', null, 'Sevilla'),
          r('td', null, r(G.Badge, { tone: 'warning' }, 'Legalizando')),
          r('td', { className: 'k5-num' }, '8,4'),
        ),
        r(
          'tr',
          null,
          r('td', null, 'Comunidad Las Encinas'),
          r('td', null, 'Málaga'),
          r('td', null, r(G.Badge, { tone: 'success' }, 'Conectada')),
          r('td', { className: 'k5-num' }, '24,0'),
        ),
      ),
    ),
  ),
  section(
    'Estado vacío y carga',
    null,
    r(
      'div',
      { className: 'cat-grid' },
      r(
        G.Card,
        null,
        r(G.EmptyState, {
          icon: Inbox,
          title: 'No hay incidencias',
          description: 'Cuando un cliente abra una, aparecerá aquí.',
          action: r(G.Button, { variant: 'secondary', icon: Plus }, 'Crear incidencia'),
        }),
      ),
      r(
        G.Card,
        null,
        r(
          G.CardContent,
          null,
          row(r(G.Spinner, { size: 'sm' }), r(G.Spinner, null), r(G.Spinner, { size: 'lg' }), label('Spinner sm, md y lg')),
        ),
      ),
    ),
  ),
  section(
    'Números, periodos y selección múltiple',
    'NumberInput, SegmentedControl y MultiSelect.',
    r(
      'div',
      { className: 'cat-grid' },
      r(
        G.Field,
        { label: 'Potencia instalada', hint: 'Acepta 8,4 y devuelve 8.4.' },
        r(G.NumberInput, { defaultValue: 8.4, step: 0.1, min: 0, suffix: 'kWp' }),
      ),
      r(G.Field, { label: 'Presupuesto' }, r(G.NumberInput, { defaultValue: 12450, step: 50, prefix: '€', hideSteppers: true })),
      r(
        G.Field,
        { label: 'Provincias' },
        r(G.MultiSelect, {
          options: [
            { value: 'md', label: 'Madrid' },
            { value: 'vc', label: 'Valencia' },
            { value: 'se', label: 'Sevilla' },
          ],
          defaultValue: ['md', 'vc'],
        }),
      ),
      r(
        'div',
        { className: 'cat-stack' },
        label('Periodo'),
        r(G.SegmentedControl, {
          label: 'Periodo',
          defaultValue: 'mes',
          options: [
            { value: 'dia', label: 'Día' },
            { value: 'semana', label: 'Semana' },
            { value: 'mes', label: 'Mes' },
            { value: 'ano', label: 'Año' },
          ],
        }),
      ),
    ),
  ),
  section(
    'Calendario y gráfico',
    'Calendar con un periodo elegido y BarChart apilado. Datos de ejemplo.',
    r(
      'div',
      { className: 'cat-grid' },
      r(G.Calendar, { mode: 'range', today: '2026-11-04', min: '2026-11-02', defaultValue: { start: '2026-11-03', end: '2026-11-10' } }),
      r(
        G.Card,
        null,
        r(
          G.CardContent,
          null,
          r(G.BarChart, {
            title: 'Producción de octubre',
            description: 'kWh por semana',
            categoryKey: 'semana',
            categoryLabel: 'Semana',
            unit: 'kWh',
            stacked: true,
            height: 180,
            data: [
              { semana: 'S1', auto: 210, exc: 85 },
              { semana: 'S2', auto: 185, exc: 70 },
              { semana: 'S3', auto: 160, exc: 55 },
              { semana: 'S4', auto: 140, exc: 40 },
            ],
            series: [
              { key: 'auto', label: 'Autoconsumo' },
              { key: 'exc', label: 'Excedentes' },
            ],
          }),
        ),
      ),
    ),
  ),
  ...groupSections,
)

const toggles = `<div class="bar-controls">
  <div class="seg" role="group" aria-label="Tema"><button type="button" data-t="consola" aria-pressed="true">Consola</button><button type="button" data-t="marca" aria-pressed="false">Marca</button></div>
  <div class="seg" role="group" aria-label="Modo"><button type="button" data-m="light" aria-pressed="true">Claro</button><button type="button" data-m="dark" aria-pressed="false">Oscuro</button></div>
</div>`

const page = (title, content, extraCss = '') => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Grado · ${title}</title>
<style>${fonts}</style>
<style>${tokens}</style>
<style>${grado}</style>
<style>
* { box-sizing: border-box; }
body { margin: 0; background: var(--k5-background); color: var(--k5-foreground); font-family: var(--k5-font-sans); font-size: var(--k5-text-body); line-height: 1.5; }
.bar { position: sticky; top: 0; z-index: 5; display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; min-height: 56px; padding: 8px 20px; background: var(--k5-header); color: var(--k5-header-foreground); }
.bar svg { height: 26px; width: auto; }
.bar b { font-size: 14px; }
.bar-controls { margin-left: auto; display: flex; gap: 10px; flex-wrap: wrap; }
.seg { display: inline-flex; padding: 2px; gap: 2px; border-radius: calc(var(--k5-radius) + 2px); background: color-mix(in srgb, currentColor 12%, transparent); }
.seg button { font: inherit; font-size: 12px; font-weight: 500; border: 0; background: none; color: inherit; opacity: .8; height: 24px; padding: 0 10px; border-radius: calc(var(--k5-radius) - 2px); cursor: pointer; }
.seg button[aria-pressed="true"] { background: color-mix(in srgb, currentColor 20%, transparent); opacity: 1; }
main.cat { max-width: 1080px; margin: 0 auto; padding: 32px 20px 64px; }
.cat-sec { margin-top: 40px; display: grid; gap: 14px; }
.cat-head h2 { margin: 0; font-size: var(--k5-text-heading); letter-spacing: -0.015em; }
.cat-head p { margin: 2px 0 0; color: var(--k5-muted-foreground); font-size: var(--k5-text-caption); }
.cat-row { display: flex; flex-wrap: wrap; gap: 10px 12px; align-items: center; }
.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; align-items: start; }
.cat-stack { display: grid; gap: 6px; justify-items: start; }
.cat-label { color: var(--k5-muted-foreground); font-size: var(--k5-text-caption); }
.cat-big { font-size: var(--k5-text-title); font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
${extraCss}
</style>
</head>
<body>
${content}
<script>
const root = document.documentElement;
const params = new URLSearchParams(location.search);
let theme = params.get('tema') || 'consola', mode = params.get('modo') || 'light';
function apply() {
  root.classList.toggle('dark', mode === 'dark');
  if (theme === 'consola') root.removeAttribute('data-k5-theme'); else root.setAttribute('data-k5-theme', theme);
  document.querySelectorAll('[data-t]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === theme)));
  document.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === mode)));
}
// El catálogo es HTML estático: este script imita el estado que llevan los componentes.
const app = document.querySelector('.k5-app');
const setMenu = (open) => { app.classList.toggle('k5-app--nav-open', open); app.querySelector('.k5-app__menu').setAttribute('aria-expanded', String(open)); };
document.addEventListener('click', e => {
  const t = e.target.closest('[data-t]'); if (t) { theme = t.dataset.t; apply(); }
  const m = e.target.closest('[data-m]'); if (m) { mode = m.dataset.m; apply(); }
  if (!app) return;
  if (e.target.closest('.k5-app__menu')) setMenu(!app.classList.contains('k5-app--nav-open'));
  if (e.target.closest('.k5-app__backdrop')) setMenu(false);
  const group = e.target.closest('.k5-nav-group > .k5-nav-item');
  if (group) { const list = document.getElementById(group.getAttribute('aria-controls')); const open = list.hidden; list.hidden = !open; group.setAttribute('aria-expanded', String(open)); }
});
if (app && params.get('menu') === 'abierto') setMenu(true);
if (app && params.get('plegado') === 'si') app.classList.add('k5-app--collapsed');
apply();
</script>
</body>
</html>
`

const componentsPage = page(
  'componentes',
  `<header class="bar">${logo}<b>Grado · componentes</b>${toggles}</header><main class="cat">${renderToStaticMarkup(body)}</main>`,
)

const appBody = r(
  G.AppShell,
  {
    product: 'Sales Coach',
    search: r(G.AppSearch, { label: 'Buscar clientes, tickets o instalaciones', shortcut: '⌘K' }),
    actions: r(
      Fragment,
      null,
      r('span', { className: 'cat-shell-toggles' }, '__TOGGLES__'),
      r(G.Button, { variant: 'ghost', iconOnly: true, icon: Bell, 'aria-label': 'Avisos' }),
      r(G.Avatar, { name: 'Lucía Fernández', status: 'online' }),
    ),
    sidebar: r(
      G.Nav,
      null,
      r(
        G.NavSection,
        null,
        r(G.NavItem, { href: '#', label: 'Chat', icon: Chat }),
        r(G.NavItem, { href: '#', label: 'Tickets', icon: Ticket, badge: 12, active: true }),
        r(G.NavItem, { href: '#', label: 'Clientes', icon: Users }),
      ),
      r(
        G.NavSection,
        { title: 'Bandejas' },
        r(
          G.NavGroup,
          { label: 'Email', icon: Inbox, defaultOpen: true },
          r(G.NavItem, { href: '#', label: 'soporte@1komma5.es' }),
          r(G.NavItem, { href: '#', label: 'instalaciones@1komma5.es' }),
        ),
        r(G.NavItem, { href: '#', label: 'Base de conocimiento', icon: Book }),
        r(G.NavItem, { href: '#', label: 'Estadísticas', icon: Chart }),
      ),
    ),
    sidebarFooter: r(G.NavItem, { href: '#', label: 'Ajustes', icon: Settings }),
  },
  r(
    'div',
    { className: 'cat-page' },
    r(G.PageHeader, {
      title: 'Tickets',
      subtitle: 'Soporte postventa · España. Datos de ejemplo.',
      actions: r(G.Button, { icon: Plus }, 'Nuevo ticket'),
    }),
    r(
      G.KpiGroup,
      null,
      r(G.Kpi, {
        label: 'Tickets abiertos',
        value: '128',
        change: -5.9,
        better: 'lower',
        previous: '136',
        selectable: true,
        selected: true,
      }),
      r(G.Kpi, { label: 'Primera respuesta', value: '1 h 12 min', change: -14.3, better: 'lower', previous: '1 h 24 min' }),
      r(G.Kpi, { label: 'Resueltos', value: '342', change: 10.0, previous: '311' }),
      r(G.Kpi, { label: 'Satisfacción', value: '4,6 / 5', change: 4.5, previous: '4,4' }),
    ),
    r('div', { className: 'cat-gap' }),
    r(
      G.Table,
      null,
      r('thead', null, r('tr', null, r('th', null, 'Ticket'), r('th', null, 'Asunto'), r('th', null, 'Estado'), r('th', null, 'Agente'))),
      r(
        'tbody',
        null,
        r(
          'tr',
          null,
          r('td', { className: 'cat-id' }, '#4821'),
          r('td', null, 'El inversor no se conecta tras el corte de luz'),
          r('td', null, r(G.Badge, { tone: 'info' }, 'Abierto')),
          r('td', null, r(G.Avatar, { name: 'Marta Ruiz', size: 'sm' })),
        ),
        r(
          'tr',
          null,
          r('td', { className: 'cat-id' }, '#4819'),
          r('td', null, 'Ampliación de 6,2 a 8,4 kWp: ¿hace falta nueva legalización?'),
          r('td', null, r(G.Badge, { tone: 'warning' }, 'Pendiente')),
          r('td', null, r(G.Avatar, { name: 'Ana Pérez', size: 'sm' })),
        ),
        r(
          'tr',
          null,
          r('td', { className: 'cat-id' }, '#4812'),
          r('td', null, 'Presupuesto de cargador para el garaje comunitario'),
          r('td', null, r(G.Badge, { tone: 'highlight' }, 'Nuevo')),
          r('td', null, '—'),
        ),
      ),
    ),
  ),
)

const appPage = page(
  'armazón',
  renderToStaticMarkup(appBody).replace('__TOGGLES__', toggles),
  `
.cat-page { max-width: 1100px; margin: 0 auto; padding: 28px 24px 48px; }
.cat-gap { height: 20px; }
.cat-id { color: var(--k5-muted-foreground); font-family: var(--k5-font-mono); font-size: var(--k5-text-caption); }
.cat-shell-toggles { display: inline-flex; margin-right: 8px; }
.cat-shell-toggles .bar-controls { margin: 0; }
@media (max-width: 1023px) { .cat-shell-toggles { display: none; } }
`,
)

mkdirSync(new URL('../catalog/', import.meta.url), { recursive: true })
writeFileSync(new URL('../catalog/index.html', import.meta.url), componentsPage)
writeFileSync(new URL('../catalog/app.html', import.meta.url), appPage)
console.log('catalog/index.html y catalog/app.html generados')
