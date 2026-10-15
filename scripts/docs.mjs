import { mkdirSync, readFileSync, writeFileSync, copyFileSync, cpSync, rmSync } from 'node:fs'
import { createElement as h, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as G from '@1k5/grado-react'
import * as V from '@1k5/grado-vue'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { newComponents } from '../docs-site/components.mjs'
import { GradoLogo, GradoMark } from '../docs-site/brand.mjs'
import { guidelines } from '../docs-site/guidelines.mjs'

const root = new URL('../', import.meta.url)
const out = new URL('docs-site/dist/', root)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const version = JSON.parse(read('packages/grado/package.json')).version
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
let renderId = 0
// Dentro de las vistas previas, el main de AppShell pasa a ser un div: la página ya tiene el suyo.
// El id de la barra lateral también cambia: la web ya tiene el suyo.
const render = (node) =>
  renderToStaticMarkup(node, { identifierPrefix: `doc${++renderId}-` })
    .replace(/<main\b/g, '<div')
    .replace(/<\/main>/g, '</div>')
    .replace(/"k5-app-sidebar"/g, '"demo-app-sidebar"')
const row = (...children) => h('div', { className: 'demo-row' }, ...children)
const grid = (...children) => h('div', { className: 'demo-grid' }, ...children)
const plus = (props) =>
  h('svg', { ...props, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, h('path', { d: 'M12 5v14M5 12h14' }))
const inbox = (props) =>
  h(
    'svg',
    { ...props, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 },
    h('path', { d: 'M4 4h16l2 10v6H2v-6L4 4ZM2 14h6l2 3h4l2-3h6' }),
  )

const components = [
  {
    id: 'button',
    name: 'Button',
    category: 'Acciones',
    description: 'Una acción, una jerarquía clara. Cinco variantes para guiar el siguiente paso.',
    preview: row(
      h(G.Button, { icon: plus }, 'Nueva instalación'),
      h(G.Button, { variant: 'secondary' }, 'Exportar'),
      h(G.Button, { variant: 'ghost' }, 'Cancelar'),
      h(G.Button, { variant: 'danger' }, 'Eliminar'),
      h(G.Button, { variant: 'link' }, 'Ver detalle'),
      h(G.Button, { loading: true }, 'Guardando'),
      h(G.Button, { disabled: true }, 'Desactivado'),
    ),
    react: `import { Button } from '@1k5/grado-react';

<Button onClick={guardar}>Guardar cambios</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="danger">Eliminar</Button>
<Button loading>Guardando</Button>`,
    vue: `<script setup>
import { Button } from '@1k5/grado-vue';
const emit = defineEmits(['guardar']);
</script>

<template>
  <Button @click="emit('guardar')">Guardar cambios</Button>
  <Button variant="secondary">Cancelar</Button>
  <Button variant="danger">Eliminar</Button>
  <Button loading>Guardando</Button>
</template>`,
    props: [
      ['variant', 'primary · secondary · ghost · danger · link', 'primary'],
      ['size', 'sm · md · lg', 'md'],
      ['loading / disabled', 'boolean', 'false'],
      ['icon / iconOnly / block', 'Componente de icono / boolean / boolean', '—'],
    ],
    note: 'Para enviar un formulario utiliza type="submit". Los botones de solo icono necesitan aria-label. Para enlaces utiliza buttonClass() con el enlace de tu router.',
  },
  {
    id: 'badge',
    name: 'Badge',
    category: 'Datos',
    description: 'Estados que se entienden de un vistazo, siempre acompañados de una etiqueta.',
    preview: row(
      ...['neutral', 'brand', 'info', 'success', 'warning', 'danger', 'highlight'].map((tone, i) =>
        h(G.Badge, { tone, key: tone }, ['Archivado', 'Grado', 'En curso', 'Firmada', 'Pendiente', 'Vencida', 'Nuevo'][i]),
      ),
    ),
    react: `import { Badge } from '@1k5/grado-react';

<Badge tone="success">Firmada</Badge>
<Badge tone="warning">Pendiente</Badge>`,
    vue: `<script setup>
import { Badge } from '@1k5/grado-vue';
</script>

<template>
  <Badge tone="success">Firmada</Badge>
  <Badge tone="warning">Pendiente</Badge>
</template>`,
    props: [
      ['tone', 'neutral · brand · info · success · warning · danger · highlight', 'neutral'],
      ['icon', 'Componente de icono', '—'],
    ],
  },
  {
    id: 'field',
    name: 'Field & Input',
    category: 'Formularios',
    description: 'Etiqueta, ayuda y validación conectadas automáticamente con el control.',
    preview: grid(
      h(
        G.Field,
        { label: 'Potencia instalada', hint: 'Suma de los módulos del tejado.', required: true },
        h(G.Input, { suffix: 'kWp', defaultValue: '8,4', inputMode: 'decimal' }),
      ),
      h(G.Field, { label: 'Presupuesto', error: 'Introduce un importe mayor que 0.' }, h(G.Input, { prefix: '€', defaultValue: '0' })),
    ),
    react: `import { Field, Input } from '@1k5/grado-react';

<Field label="Potencia instalada" hint="Suma de los módulos" required>
  <Input suffix="kWp" inputMode="decimal" defaultValue="8,4" />
</Field>`,
    vue: `<script setup>
import { ref } from 'vue';
import { Field, Input } from '@1k5/grado-vue';
const potencia = ref('8,4');
</script>

<template>
  <Field label="Potencia instalada" hint="Suma de los módulos" required>
    <Input v-model="potencia" suffix="kWp" inputmode="decimal" />
  </Field>
</template>`,
    props: [
      ['Field: label / hint / error', 'Contenido de etiqueta, ayuda y error', '—'],
      ['Field: required / id', 'boolean / string', 'false / automático'],
      ['Input: size / prefix / suffix', 'sm · md · lg / afijos', 'md / —'],
      ['Input: invalid', 'boolean', 'Heredado de Field'],
    ],
    note: 'Field enlaza id, aria-describedby, aria-invalid y required. En Vue, v-model devuelve texto: convierte los valores numéricos en tu aplicación.',
  },
  {
    id: 'select',
    name: 'Select & Textarea',
    category: 'Formularios',
    description: 'Controles nativos para elegir una opción o escribir con más espacio.',
    preview: grid(
      h(
        G.Field,
        { label: 'Tipo de instalación' },
        h(
          G.Select,
          { defaultValue: 'bateria' },
          h('option', { value: 'solar' }, 'Solo placas'),
          h('option', { value: 'bateria' }, 'Placas y batería'),
        ),
      ),
      h(G.Field, { label: 'Notas' }, h(G.Textarea, { rows: 3, placeholder: 'Añade indicaciones para el instalador…' })),
    ),
    react: `import { Field, Select, Textarea } from '@1k5/grado-react';

<Field label="Tipo de instalación">
  <Select defaultValue="solar">
    <option value="solar">Solo placas</option>
    <option value="bateria">Placas y batería</option>
  </Select>
</Field>
<Field label="Notas"><Textarea rows={3} /></Field>`,
    vue: `<script setup>
import { ref } from 'vue';
import { Field, Select, Textarea } from '@1k5/grado-vue';
const tipo = ref('solar');
const notas = ref('');
</script>

<template>
  <Field label="Tipo de instalación">
    <Select v-model="tipo">
      <option value="solar">Solo placas</option>
      <option value="bateria">Placas y batería</option>
    </Select>
  </Field>
  <Field label="Notas"><Textarea v-model="notas" :rows="3" /></Field>
</template>`,
    props: [
      ['Select: size', 'sm · md · lg', 'md'],
      ['invalid', 'boolean', 'Heredado de Field'],
      ['Atributos nativos', 'disabled, name, rows, placeholder…', '—'],
    ],
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'Formularios',
    description: 'Una preferencia binaria con contexto suficiente para decidir.',
    preview: h(
      'div',
      { className: 'demo-row demo-row--choices' },
      h(G.Switch, { defaultChecked: true, label: 'Respuesta automática', description: 'Fuera del horario de oficina' }),
      h(G.Switch, { disabled: true, label: 'Sincronización' }),
    ),
    react: `import { useState } from 'react';
import { Switch } from '@1k5/grado-react';

function Preferencias() {
  const [activo, setActivo] = useState(true);
  return <Switch checked={activo} onCheckedChange={setActivo}
    label="Respuesta automática" description="Fuera del horario de oficina" />;
}`,
    vue: `<script setup>
import { ref } from 'vue';
import { Switch } from '@1k5/grado-vue';
const activo = ref(true);
</script>

<template>
  <Switch v-model="activo" label="Respuesta automática"
    description="Fuera del horario de oficina" />
</template>`,
    props: [
      ['label / description', 'Texto', '—'],
      ['React: checked / onCheckedChange', 'boolean / (checked) => void', '—'],
      ['Vue: v-model', 'boolean', '—'],
    ],
  },
  {
    id: 'card',
    name: 'Card',
    category: 'Estructura',
    description: 'Agrupa información relacionada y separa contenido de acciones.',
    preview: h(
      G.Card,
      { className: 'demo-card' },
      h(
        G.CardHeader,
        null,
        h(G.CardTitle, null, 'Tu próxima instalación'),
        h(G.CardDescription, null, 'Autoconsumo residencial · Datos de ejemplo'),
      ),
      h(
        G.CardContent,
        null,
        h('div', { className: 'installation-value' }, '8,4 ', h('span', null, 'kWp')),
        h(G.Badge, { tone: 'success' }, 'Lista para instalar'),
      ),
      h(G.CardFooter, null, h(G.Button, { variant: 'secondary' }, 'Ver proyecto')),
    ),
    react: `import { Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter, Button } from '@1k5/grado-react';

<Card>
  <CardHeader>
    <CardTitle>Tu próxima instalación</CardTitle>
    <CardDescription>Autoconsumo residencial</CardDescription>
  </CardHeader>
  <CardContent>8,4 kWp</CardContent>
  <CardFooter><Button variant="secondary">Ver proyecto</Button></CardFooter>
</Card>`,
    vue: `<script setup>
import { Card, CardHeader, CardTitle, CardDescription,
  CardContent, CardFooter, Button } from '@1k5/grado-vue';
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Tu próxima instalación</CardTitle>
      <CardDescription>Autoconsumo residencial</CardDescription>
    </CardHeader>
    <CardContent>8,4 kWp</CardContent>
    <CardFooter><Button variant="secondary">Ver proyecto</Button></CardFooter>
  </Card>
</template>`,
    props: [
      ['variant', 'panel · alert · plain', 'panel'],
      ['CardTitle: as', 'h2 · h3 · h4', 'h3'],
    ],
  },
  {
    id: 'table',
    name: 'Table',
    category: 'Datos',
    description: 'Datos comparables en una tabla semántica con desplazamiento horizontal.',
    preview: h(
      G.Table,
      { caption: 'Instalaciones de ejemplo' },
      h('thead', null, h('tr', null, h('th', null, 'Cliente'), h('th', null, 'Estado'), h('th', { className: 'k5-num' }, 'Potencia'))),
      h(
        'tbody',
        null,
        ...[
          ['Lucía Fernández', 'success', 'Conectada', '6,2'],
          ['Javier Ortega', 'warning', 'Legalizando', '8,4'],
          ['Comunidad Las Encinas', 'info', 'En obra', '24,0'],
        ].map(([name, tone, state, value]) =>
          h(
            'tr',
            { key: name },
            h('td', null, name),
            h('td', null, h(G.Badge, { tone }, state)),
            h('td', { className: 'k5-num' }, value, ' kWp'),
          ),
        ),
      ),
    ),
    react: `import { Table, Badge } from '@1k5/grado-react';

<Table caption="Instalaciones">
  <thead><tr><th>Cliente</th><th>Estado</th></tr></thead>
  <tbody><tr>
    <td>Lucía Fernández</td>
    <td><Badge tone="success">Conectada</Badge></td>
  </tr></tbody>
</Table>`,
    vue: `<script setup>
import { Table, Badge } from '@1k5/grado-vue';
</script>

<template>
  <Table caption="Instalaciones">
    <thead><tr><th>Cliente</th><th>Estado</th></tr></thead>
    <tbody><tr>
      <td>Lucía Fernández</td>
      <td><Badge tone="success">Conectada</Badge></td>
    </tr></tbody>
  </Table>
</template>`,
    props: [
      ['caption', 'Nombre accesible de la tabla', '—'],
      ['compact', 'boolean', 'false'],
      ['k5-num / k5-unit', 'Clases: columna numérica en th y td / unidad en la cabecera sin mayúsculas', '—'],
    ],
    note: 'El componente aporta estructura y estilos. La ordenación, paginación y selección de filas pertenecen a tu aplicación. Las cabeceras van en mayúsculas: envuelve la unidad en k5-unit para que kWp no se lea «KWP».',
  },
  {
    id: 'kpi',
    name: 'Kpi',
    category: 'Datos',
    description: 'El dato y su evolución. Tú defines si subir o bajar es una buena noticia.',
    preview: h(
      G.KpiGroup,
      null,
      h(G.Kpi, { label: 'Instalaciones activas', value: '128', change: 10, previous: '116' }),
      h(G.Kpi, { label: 'Días hasta legalizar', value: '23', change: -14.3, better: 'lower', previous: '27' }),
      h(G.Kpi, { label: 'Incidencias', value: '7', tone: 'danger', hint: 'Fuera de plazo' }),
    ),
    react: `import { KpiGroup, Kpi } from '@1k5/grado-react';

<KpiGroup>
  <Kpi label="Instalaciones activas" value="128" change={10} previous="116" />
  <Kpi label="Días hasta legalizar" value="23"
    change={-14.3} better="lower" previous="27" />
</KpiGroup>`,
    vue: `<script setup>
import { KpiGroup, Kpi } from '@1k5/grado-vue';
</script>

<template>
  <KpiGroup>
    <Kpi label="Instalaciones activas" value="128" :change="10" previous="116" />
    <Kpi label="Días hasta legalizar" value="23"
      :change="-14.3" better="lower" previous="27" />
  </KpiGroup>
</template>`,
    props: [
      ['label / value', 'Etiqueta / valor mostrado', 'Obligatorios'],
      ['change / previous', 'Variación porcentual / valor anterior', '—'],
      ['better', 'higher · lower · neutral', 'higher'],
      ['selectable / selected', 'boolean', 'false'],
    ],
  },
  {
    id: 'page-header',
    name: 'PageHeader',
    category: 'Estructura',
    description: 'Título, contexto y acciones principales con una disposición consistente.',
    preview: h(G.PageHeader, {
      title: 'Instalaciones',
      subtitle: 'Seguimiento de obras de autoconsumo',
      as: 'h2',
      actions: h(G.Button, { icon: plus }, 'Nueva instalación'),
    }),
    react: `import { PageHeader, Button } from '@1k5/grado-react';

<PageHeader title="Instalaciones" subtitle="Seguimiento de obras"
  actions={<Button>Nueva instalación</Button>} />`,
    vue: `<script setup>
import { PageHeader, Button } from '@1k5/grado-vue';
</script>

<template>
  <PageHeader title="Instalaciones" subtitle="Seguimiento de obras">
    <template #actions><Button>Nueva instalación</Button></template>
  </PageHeader>
</template>`,
    props: [
      ['title / subtitle', 'Título / descripción', '—'],
      ['actions', 'Prop React / slot Vue', '—'],
      ['as', 'Nivel del encabezado', 'h1'],
    ],
  },
  {
    id: 'empty-state',
    name: 'EmptyState',
    category: 'Respuesta',
    description: 'Explica por qué todavía no hay datos y ofrece un siguiente paso.',
    preview: h(G.EmptyState, {
      icon: inbox,
      title: 'Todo al día',
      description: 'No hay documentos pendientes de revisión.',
      action: h(G.Button, { variant: 'secondary' }, 'Añadir documento'),
    }),
    react: `import { EmptyState, Button } from '@1k5/grado-react';

<EmptyState title="Todo al día"
  description="No hay documentos pendientes de revisión."
  action={<Button variant="secondary">Añadir documento</Button>} />`,
    vue: `<script setup>
import { EmptyState, Button } from '@1k5/grado-vue';
</script>

<template>
  <EmptyState title="Todo al día"
    description="No hay documentos pendientes de revisión.">
    <template #action><Button variant="secondary">Añadir documento</Button></template>
  </EmptyState>
</template>`,
    props: [
      ['title / description / icon', 'Contenido / componente de icono', '—'],
      ['action', 'Prop React / slot Vue', '—'],
      ['compact', 'boolean', 'false'],
    ],
  },
  {
    id: 'spinner',
    name: 'Spinner',
    category: 'Respuesta',
    description: 'Comunica que una operación está en curso sin bloquear el contexto.',
    preview: row(
      h(G.Spinner, { size: 'sm' }),
      h(G.Spinner, null),
      h(G.Spinner, { size: 'lg' }),
      h('span', { className: 'muted' }, 'Cargando instalaciones…'),
    ),
    react: `import { Spinner } from '@1k5/grado-react';

<Spinner label="Cargando instalaciones" />
<Spinner size="sm" decorative />`,
    vue: `<script setup>
import { Spinner } from '@1k5/grado-vue';
</script>

<template>
  <Spinner label="Cargando instalaciones" />
  <Spinner size="sm" decorative />
</template>`,
    props: [
      ['size', 'sm · md · lg', 'md'],
      ['label', 'Texto para lectores de pantalla', 'Cargando'],
      ['decorative', 'Oculta el spinner a lectores de pantalla', 'false'],
    ],
  },
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'Datos',
    description: 'Iniciales y disponibilidad para identificar a las personas de tu equipo.',
    preview: row(
      h(G.Avatar, { name: 'Lucía Fernández', size: 'sm' }),
      h(G.Avatar, { name: 'Marta Ruiz', status: 'online' }),
      h(G.Avatar, { name: 'Ana Pérez', size: 'lg', status: 'away' }),
      h(G.Avatar, { name: 'Carlos Gil', status: 'busy' }),
    ),
    react: `import { Avatar } from '@1k5/grado-react';

<Avatar name="Marta Ruiz" status="online" />
<Avatar name="Ana Pérez" size="lg" status="away" />`,
    vue: `<script setup>
import { Avatar } from '@1k5/grado-vue';
</script>

<template>
  <Avatar name="Marta Ruiz" status="online" />
  <Avatar name="Ana Pérez" size="lg" status="away" />
</template>`,
    props: [
      ['name / initials', 'Nombre / iniciales explícitas', '—'],
      ['size', 'sm · md · lg', 'md'],
      ['status', 'online · away · busy', '—'],
    ],
  },
  {
    id: 'app-shell',
    name: 'AppShell & Nav',
    category: 'Estructura',
    description: 'Un punto de partida compartido para la cabecera, la navegación y el contenido.',
    preview: h(
      'div',
      { className: 'shell-preview' },
      h(
        G.AppShell,
        {
          brand: h(Fragment, null, h(GradoLogo), h('span', { className: 'k5-app__product' }, 'Mi aplicación')),
          mainId: 'demo-main',
          actions: h(G.Avatar, { name: 'Lucía Fernández' }),
          sidebar: h(
            G.Nav,
            null,
            h(G.NavItem, { href: '#app-shell', label: 'Instalaciones', active: true }),
            h(G.NavItem, { href: '#app-shell', label: 'Clientes', badge: 12 }),
            h(G.NavGroup, { label: 'Documentos' }, h(G.NavItem, { href: '#app-shell', label: 'Pendientes' })),
          ),
        },
        h(
          'div',
          { className: 'shell-content' },
          h(G.PageHeader, { title: 'Instalaciones', subtitle: 'Tu espacio de trabajo', as: 'h2' }),
          h(G.Card, null, h(G.CardContent, null, 'Aquí empieza tu aplicación.')),
        ),
      ),
    ),
    react: `import { AppShell, Nav, NavItem, PageHeader, Avatar } from '@1k5/grado-react';

<AppShell product="Mi aplicación"
  actions={<Avatar name="Lucía Fernández" />}
  sidebar={<Nav><NavItem href="/" label="Instalaciones" active /></Nav>}>
  <PageHeader title="Instalaciones" />
</AppShell>`,
    vue: `<script setup>
import { AppShell, Nav, NavItem, PageHeader, Avatar } from '@1k5/grado-vue';
</script>

<template>
  <AppShell product="Mi aplicación">
    <template #actions><Avatar name="Lucía Fernández" /></template>
    <template #sidebar>
      <Nav><NavItem href="/" label="Instalaciones" active /></Nav>
    </template>
    <PageHeader title="Instalaciones" />
  </AppShell>
</template>`,
    props: [
      ['product', 'Nombre de la aplicación', '—'],
      ['brand / search / actions / sidebar / sidebarFooter', 'Props React / slots Vue (sidebar-footer)', '—'],
      ['collapsed', 'Barra lateral compacta en escritorio', 'false'],
      ['NavItem: as / active / badge', 'Enlace de router / boolean / contador', 'a / false / —'],
      ['NavGroup: open', 'onOpenChange en React / v-model:open en Vue', 'No controlado'],
    ],
    note: 'AppSearch es el botón que abre tu buscador: la búsqueda la implementa la aplicación. El menú móvil está incluido. Usa as para integrar NavLink o RouterLink.',
  },
]

components.push(...newComponents)

const tokens = JSON.parse(read('packages/grado/src/tokens.json'))
const categories = ['Acciones', 'Formularios', 'Datos', 'Estructura', 'Navegación', 'Superposiciones', 'Respuesta']
const byCategory = categories
  .map((name) => ({ name, items: components.filter((c) => c.category === name) }))
  .filter((group) => group.items.length)
const icon = (path, size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`
const arrow = icon('<path d="M5 12h14M13 6l6 6-6 6"/>')
const slug = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// Iconos de Lucide, con el mismo trazo que los de Grado.
const lucide = (...paths) =>
  function Icon(props) {
    return h(
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
      ...paths.map((d) => h('path', { key: d, d })),
    )
  }
const icons = {
  home: lucide(
    'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8',
    'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  ),
  customize: lucide(
    'M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z',
    'M13.5 6.5h.01',
    'M17.5 10.5h.01',
    'M8.5 7.5h.01',
    'M6.5 12.5h.01',
  ),
  installation: lucide('M12 15V3', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5'),
  components: lucide('M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'),
  Acciones: lucide(
    'M14 4.1 12 6',
    'm5.1 8-2.9-.8',
    'm6 12-1.9 2',
    'M7.2 2.2 8 5.1',
    'M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z',
  ),
  Formularios: lucide('M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'),
  Datos: lucide('M3 3v16a2 2 0 0 0 2 2h16', 'M18 17V9', 'M13 17V5', 'M8 17v-3'),
  Estructura: lucide('M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M3 9h18', 'M9 21V9'),
  Navegación: lucide(
    'M12 13v8',
    'M12 3v3',
    'M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a2 2 0 0 1-1.387-.56l-2.306-2.22a1 1 0 0 1 0-1.44l2.306-2.22A2 2 0 0 1 6 6z',
  ),
  Superposiciones: lucide(
    'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z',
    'm22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65',
    'm22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65',
  ),
  Respuesta: lucide('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'),
  search: lucide('M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0', 'm21 21-4.3-4.3'),
  status: lucide('M22 12h-4l-3 9L9 3l-3 9H2'),
  changelog: lucide('M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5', 'M12 7v5l4 2'),
  chevron: lucide('m6 9 6 6 6-6'),
}
const svg = (Icon) => renderToStaticMarkup(h(Icon, { 'aria-hidden': 'true' }))
const linkButton = (href, label, { variant = 'primary', size, icon: Icon } = {}) =>
  h('a', { className: G.buttonClass({ variant, size }), href }, Icon ? h(Icon, { 'aria-hidden': 'true' }) : null, label)
// PageHeader real de Grado; las acciones pueden ser HTML ya generado.
const pageHeader = (title, subtitle, actions) =>
  render(
    h(G.PageHeader, { title, subtitle, actions: actions == null ? undefined : typeof actions === 'string' ? '%%ACTIONS%%' : actions }),
  ).replace('%%ACTIONS%%', () => actions)
const sectionHead = (id, title, note, action = '') =>
  `<div class="docs-section__head"><div><h2 id="${id}">${title}</h2>${note ? `<p>${note}</p>` : ''}</div>${action}</div>`

const code = (source, label = 'Código') =>
  `<div class="code-block"><div class="code-bar"><span>${esc(label)}</span><button class="copy-button" type="button" data-copy>Copiar <span aria-hidden="true">⧉</span></button></div><pre tabindex="0"><code>${esc(source)}</code></pre></div>`
const propTable = (props) =>
  `<div class="props-scroll"><table class="props-table"><caption class="sr-only">Propiedades principales</caption><thead><tr><th>Propiedad</th><th>Valores / uso</th><th>Por defecto</th></tr></thead><tbody>${props.map(([name, type, def]) => `<tr><td><code>${esc(name)}</code></td><td>${esc(type)}</td><td>${esc(def)}</td></tr>`).join('')}</tbody></table></div>`
const guideList = (title, items, tone) =>
  `<div class="guide guide--${tone}"><h4>${title}</h4><ul>${items.map((item) => `<li>${esc(item)}</li>`).join('')}</ul></div>`
const guide = (id) => {
  const g = guidelines[id]
  if (!g) return ''
  return `<div class="guide-grid" aria-label="Guía de uso">${guideList('Cuándo usarlo', g.use, 'use')}${guideList('Qué evitar', g.avoid, 'avoid')}${guideList('Accesibilidad', g.a11y, 'a11y')}</div>`
}
const componentSection = (c) => `<section class="k5-card component-section" id="${c.id}">
  <div class="component-head"><div><h3><a href="#${c.id}">${c.name}</a></h3><p>${c.description}</p></div><a class="anchor-link" href="#${c.id}" aria-label="Enlace a ${c.name}">#</a></div>
  <div class="example"><div class="example-bar"><div class="segmented" role="group" aria-label="Vista del ejemplo"><button type="button" data-view="preview" aria-pressed="true">Vista previa</button><button type="button" data-view="code" aria-pressed="false">Código</button></div><span class="example-tag">${esc(c.name)}</span></div>
    <div class="demo-preview${c.live ? ' demo-preview--live' : ''}" data-preview${c.live ? ` data-live-demo="${c.id}"` : ''}>${render(c.preview)}</div>
    <div data-code hidden><div data-framework="react">${code(c.react, 'React · TSX')}</div><div data-framework="vue" hidden>${code(c.vue, 'Vue · SFC')}</div></div>
  </div>
  ${guide(c.id)}
  <details class="api-details"><summary>Propiedades y uso ${svg(icons.chevron)}</summary>${propTable(c.props)}${c.note ? `<p class="api-note">${c.note}</p>` : ''}</details>
</section>`

// ── Armazón: AppShell de Grado, el mismo que usan las aplicaciones ─────────
const brand = h(
  'a',
  { href: 'index.html', className: 'docs-brand', 'aria-label': 'Grado, sistema de diseño. Inicio' },
  h(GradoMark, { className: 'docs-brand__mark', 'aria-hidden': 'true' }),
  h(
    'span',
    { className: 'docs-brand__text' },
    h('span', { className: 'docs-brand__name' }, 'Grado'),
    h('span', { className: 'docs-brand__tag' }, 'Sistema de diseño'),
  ),
)
const installToc = [
  ['requisitos', 'Requisitos'],
  ['paquetes', 'Paquetes'],
  ['estilos', 'Estilos'],
  ['temas', 'Temas'],
  ['primer-componente', 'Primer componente'],
  ['idioma', 'Idioma'],
  ['migracion', 'Migración'],
]
const navItem = (current, key, href, label, Icon, badge) => h(G.NavItem, { href, label, icon: Icon, badge, active: current === key })
const sidebar = (page) =>
  h(
    G.Nav,
    { label: 'Documentación' },
    h(
      G.NavSection,
      null,
      navItem(page, 'home', 'index.html', 'Inicio', icons.home),
      navItem(page, 'customize', 'personalizar.html', 'Personalizar', icons.customize),
      navItem(page, 'installation', 'installation.html', 'Instalación', icons.installation),
      navItem(page, 'components', 'components.html', 'Componentes', icons.components, components.length),
      navItem(page, 'status', 'status.html', 'Estado', icons.status),
      navItem(page, 'changelog', 'changelog.html', 'Cambios', icons.changelog, version),
    ),
    h(
      G.NavSection,
      { title: 'Componentes' },
      byCategory.map((group) =>
        h(
          G.NavGroup,
          { key: group.name, label: group.name, icon: icons[group.name] },
          group.items.map((c) => h(G.NavItem, { key: c.id, href: `components.html#${c.id}`, label: c.name, 'data-component-link': '' })),
        ),
      ),
    ),
  )
const switches = `<div class="docs-switches"><div class="docs-seg" role="group" aria-label="Tema"><button type="button" data-set-theme="consola" aria-pressed="false">Consola</button><button type="button" data-set-theme="marca" aria-pressed="true">Marca</button></div><div class="docs-seg" role="group" aria-label="Modo de color"><button type="button" data-set-mode="light" aria-pressed="true">Claro</button><button type="button" data-set-mode="dark" aria-pressed="false">Oscuro</button></div></div>`
const frame = (page) =>
  renderToStaticMarkup(
    h(
      G.AppShell,
      {
        className: 'docs-shell',
        brand,
        search: h(G.AppSearch, { label: 'Buscar componentes y guías', shortcut: '/', 'aria-haspopup': 'dialog', 'data-search-open': '' }),
        actions: '%%SWITCHES%%',
        sidebar: sidebar(page),
        sidebarFooter: h('div', { className: 'docs-sidebar-footer' }, '%%SWITCHES%%'),
      },
      '%%BODY%%',
    ),
    { identifierPrefix: `frame-${page}-` },
  )
    // La vista previa de AppShell también usa el id por defecto de la barra lateral.
    .replaceAll('k5-app-sidebar', 'docs-navigation')

// Buscador: AppSearch abre un diálogo con la lista de páginas, guías y componentes.
let optionId = 0
const searchGroups = [
  [
    'Páginas',
    [
      ['Inicio', 'index.html', 'Introducción'],
      ['Personalizar', 'personalizar.html', 'Constructor de temas'],
      ['Instalación', 'installation.html', 'Paquetes y estilos'],
      ['Componentes', 'components.html', `${components.length} componentes`],
      ['Estado', 'status.html', 'Cobertura y adopción'],
      ['Cambios', 'changelog.html', `Versión ${version}`],
    ],
  ],
  ['Instalación', installToc.map(([id, label]) => [label, `installation.html#${id}`, 'Guía'])],
  ['Componentes', components.map((c) => [c.name, `components.html#${c.id}`, c.category])],
]
const searchDialog = () =>
  `<dialog class="k5-dialog docs-search" id="docs-search-dialog" aria-label="Buscar en la documentación"><div class="docs-search__bar"><label class="k5-input-wrap k5-input-wrap--lg docs-search__field">${svg(icons.search)}<span class="sr-only">Buscar</span><input id="docs-search" class="k5-input" type="search" placeholder="Buscar componentes y guías…" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="docs-search-results" aria-autocomplete="list"></label><kbd class="docs-search__esc">Esc</kbd></div><div class="docs-search__results" id="docs-search-results" role="listbox" aria-label="Resultados">${searchGroups.map(([group, items]) => `<div role="group" aria-labelledby="search-group-${slug(group)}" data-search-group><p class="docs-search__group" id="search-group-${slug(group)}">${group}</p>${items.map(([label, href, meta]) => `<a class="k5-combobox__option" role="option" id="search-option-${++optionId}" href="${href}" data-search-link="${esc(`${label} ${meta}`.toLowerCase())}"><span>${label}</span><small>${esc(meta)}</small></a>`).join('')}</div>`).join('')}<p class="docs-search__empty" hidden>No hay resultados.</p></div></dialog>`

const footer = `<footer class="docs-footer"><span>Grado° ${version} · Sistema de diseño de 1KOMMA5° España</span><span>Una identidad. Muchas aplicaciones.</span></footer>`
const cleanRouteLinks = (html) =>
  html
    .replaceAll('href="index.html', 'href="./')
    .replaceAll('href="personalizar.html', 'href="personalizar')
    .replaceAll('href="installation.html', 'href="instalacion')
    .replaceAll('href="components.html', 'href="componentes')
    .replaceAll('href="status.html', 'href="estado')
    .replaceAll('href="changelog.html', 'href="cambios')
const pageShell = (key, body, toc = []) => {
  const content = toc.length
    ? `<div class="docs-page docs-page--toc"><div class="docs-page__body">${body}${footer}</div><aside class="on-this-page"><p class="on-this-page__title">En esta página</p><nav aria-label="Índice de página">${toc.map(([id, label]) => `<a href="#${id}">${label}</a>`).join('')}</nav></aside></div>`
    : `<div class="docs-page">${body}${footer}</div>`
  return `${frame(key)
    .replace('%%BODY%%', () => content)
    .replaceAll('%%SWITCHES%%', () => switches)}${searchDialog()}<div id="notice" role="status" aria-live="polite"></div>`
}

const packages = ['grado', 'grado-react', 'grado-vue']
const downloads = `<div class="downloads">${packages.map((name) => `<a href="downloads/1k5-${name}-${version}.tgz" download><span class="download-icon" aria-hidden="true">${svg(icons.installation)}</span><span><strong>@1k5/${name}</strong><small>${name === 'grado' ? 'Tokens, CSS y recursos de marca' : name === 'grado-react' ? 'Componentes para React 18+' : 'Componentes para Vue 3.5+'}</small></span><code>${version}</code></a>`).join('')}</div>`

// ── Inicio ────────────────────────────────────────────────────────────────
const type = tokens.typography
const pathMini = {
  customize: `<span class="path-swatches" aria-hidden="true"><i style="background:var(--k5-aubergine)"></i><i style="background:var(--k5-mint)"></i><i style="background:var(--k5-fuchsia)"></i></span>`,
  install: `<code class="path-code">npm install ./vendor/1k5-grado-${version}.tgz</code>`,
  // Dentro de un enlace no puede haber botones ni campos: se usan las clases de Grado sobre <span>.
  explore: `<span class="path-components" aria-hidden="true"><span class="${G.buttonClass({ size: 'sm' })}">Guardar</span>${render(h(Fragment, null, h(G.Badge, { tone: 'success' }, 'Conectada'), h(G.Avatar, { name: 'Lucía Fernández', size: 'sm' })))}</span>`,
}
const paths = [
  [
    'customize',
    'personalizar.html',
    icons.customize,
    'Personaliza',
    'Elige tu color principal y recibe paletas que combinan con él, con el contraste comprobado.',
    'Abrir el configurador',
  ],
  [
    'install',
    'installation.html',
    icons.installation,
    'Instala',
    'Paquetes descargables, estilos para Tailwind 3, Tailwind 4 o CSS y ejemplos en React y Vue.',
    'Ver la guía',
  ],
  [
    'explore',
    'components.html',
    icons.components,
    'Explora',
    `${components.length} componentes con vista previa real, código y tabla de propiedades.`,
    'Ver componentes',
  ],
]
const pathCard = ([key, href, Icon, title, text, cta]) =>
  `<a class="k5-card docs-link-card" href="${href}"><div class="k5-card__header"><span class="docs-icon" aria-hidden="true">${svg(Icon)}</span><h3 class="k5-card__title">${title}</h3><p class="k5-card__description">${text}</p></div><div class="k5-card__content">${pathMini[key]}</div><span class="docs-link-card__cta">${cta} ${arrow}</span></a>`
const brandColors = Object.entries(tokens.brand)
  .map(([name, c]) => [name, c.hex])
  .concat([['graphite', tokens.neutral.graphite]])
const spaceScale = ['1', '2', '3', '4', '6', '8', '12', '16']
const motionScale = Object.entries(tokens.motion.duration)
const layerScale = Object.entries(tokens.z.values).reverse()
const typeScale = [
  ['Título', 'text-title', 600],
  ['Sección', 'text-section', 600],
  ['Entradilla', 'text-lead', 400],
  ['Cuerpo', 'text-body', 400],
  ['Etiqueta', 'text-label', 400],
]
const card = (title, description, content, className = '') =>
  `<div class="k5-card${className ? ` ${className}` : ''}"><div class="k5-card__header"><h3 class="k5-card__title">${title}</h3>${description ? `<p class="k5-card__description">${description}</p>` : ''}</div><div class="k5-card__content">${content}</div></div>`
const themeCard = (theme, title, text) =>
  `<div class="k5-card theme-card"><span class="theme-mini${theme === 'marca' ? ' brand-mini' : ''}" aria-hidden="true"><i></i><b></b><em></em></span><div class="theme-card__body"><div><h3>${title}</h3><p>${text}</p></div><button class="${G.buttonClass({ variant: 'secondary', size: 'sm' })}" type="button" data-set-theme="${theme}" aria-pressed="${theme === 'marca'}"><span class="when-off">Aplicar</span><span class="when-on">En uso</span></button></div></div>`
const library = render(
  h(
    G.Table,
    { caption: 'Componentes por familia' },
    h('thead', null, h('tr', null, h('th', null, 'Familia'), h('th', null, 'Componentes'), h('th', { className: 'k5-num' }, 'Total'))),
    h(
      'tbody',
      null,
      byCategory.map((group) =>
        h(
          'tr',
          { key: group.name },
          h('td', null, h('span', { className: 'library-family' }, h(icons[group.name], { 'aria-hidden': 'true' }), group.name)),
          h(
            'td',
            null,
            h(
              'span',
              { className: 'library-links' },
              group.items.map((c) => h('a', { key: c.id, href: `components.html#${c.id}` }, c.name)),
            ),
          ),
          h('td', { className: 'k5-num' }, group.items.length),
        ),
      ),
    ),
  ),
)

const home = `${pageHeader('Sistema de diseño Grado', 'Tokens, componentes y patrones para que todas las plataformas de 1KOMMA5° España se vean y funcionen igual. Para React, Vue y HTML.', h(Fragment, null, linkButton('installation.html', 'Instalar', { variant: 'secondary', icon: icons.installation }), linkButton('components.html', 'Explorar componentes', { icon: icons.components })))}
${render(
  h(
    G.KpiGroup,
    null,
    h(G.Kpi, { label: 'Componentes', value: String(components.length), hint: `En ${byCategory.length} familias` }),
    h(G.Kpi, { label: 'Frameworks', value: '3', hint: 'React · Vue · HTML' }),
    h(G.Kpi, { label: 'Temas', value: '2', hint: 'Consola y Marca' }),
    h(G.Kpi, { label: 'Versión', value: version, hint: 'Paquetes descargables' }),
  ),
)}
<section class="docs-section" id="introduccion" aria-labelledby="empezar-titulo">${sectionHead('empezar-titulo', 'Empieza aquí', 'Tres pasos para llevar Grado a tu aplicación.')}<div class="docs-grid docs-grid--3">${paths.map(pathCard).join('')}</div></section>
<section class="docs-section" id="fundamentos" aria-labelledby="fundamentos-titulo">${sectionHead('fundamentos-titulo', 'Fundamentos', '<code>tokens.json</code> define color, tipografía, tamaños y radios. Cada aplicación recibe los mismos valores mediante CSS, Tailwind o JavaScript.')}<div class="docs-grid foundation-grid">
  ${card('Color', 'Los colores de la guía de marca.', `<ul class="brand-colors">${brandColors.map(([name, hex]) => `<li><i style="background:${hex}"></i><strong>${name[0].toUpperCase()}${name.slice(1)}</strong><code>${hex}</code></li>`).join('')}</ul>`)}
  ${card('Tipografía', 'Barlow, incluida en el paquete, en cinco tamaños.', `<ul class="type-scale">${typeScale.map(([label, token, weight]) => `<li><span style="font-size:var(--k5-${token});font-weight:${weight}">${label}</span><code>${type[token]}</code></li>`).join('')}</ul>`)}
  ${card('Espaciado', 'Escala de 4 px para rellenos, márgenes y huecos.', `<ul class="space-scale">${spaceScale.map((step) => `<li><code>space-${step}</code><i style="width:var(--k5-space-${step})"></i><span>${parseFloat(tokens.space.values[step]) * 16} px</span></li>`).join('')}</ul>`)}
  ${card('Movimiento y capas', 'Cuatro duraciones y el orden de lo que flota sobre la página.', `<ul class="motion-scale">${motionScale.map(([name, value]) => `<li><code>duration-${name}</code><span>${value}</span></li>`).join('')}</ul><ul class="layer-scale">${layerScale.map(([name, value]) => `<li><code>z-${name}</code><span>${value}</span></li>`).join('')}</ul>`)}
  ${card('Escala', 'Alturas de control y radios.', `<ul class="size-scale">${['control-h-sm', 'control-h', 'control-h-lg'].map((token) => `<li><i style="height:var(--k5-${token})"></i><code>${token}</code></li>`).join('')}</ul><div class="radius-scale">${['radius-badge', 'radius', 'radius-panel'].map((token) => `<span style="border-radius:var(--k5-${token})" title="${token}"></span>`).join('')}</div>`)}
</div></section>
<section class="docs-section" id="temas" aria-labelledby="temas-titulo">${sectionHead('temas-titulo', 'Temas', 'Los dos comparten tokens y componentes. Aplica uno para ver toda la web con él.')}<div class="docs-grid docs-grid--2">${themeCard('consola', 'Consola', 'Cabecera berenjena y barra lateral clara. Para herramientas internas.')}${themeCard('marca', 'Marca', 'Barra lateral berenjena y fondo lila. Para lo que ve el cliente.')}</div></section>
<section class="docs-section" id="indice" aria-labelledby="indice-titulo">${sectionHead('indice-titulo', 'Biblioteca', `${components.length} componentes con la misma API en React y Vue, y CSS para cualquier interfaz web.`, renderToStaticMarkup(linkButton('components.html', 'Ver todos', { variant: 'secondary', size: 'sm' })))}${library}</section>`

// ── Personalizar ──────────────────────────────────────────────────────────
const { Configurator } = await import('../docs-site/configurator.mjs')
const notes = [
  ['Derivación consistente', 'Los grises reciben un matiz del color principal y los tonos se calculan con las mismas fórmulas que Grado.'],
  [
    'Integración reversible',
    '<code>grado-tema.css</code> redefine las variables semánticas. Se importa después de Grado y puede retirarse sin modificar la librería.',
  ],
  [
    'Contraste comprobado',
    'El panel revisa las combinaciones que más se ven, en claro y en oscuro. Revisa también estados y gráficos dentro de tu producto.',
  ],
]
const customize = `<div data-configurator>${render(h(Configurator))}</div>
<section class="docs-section" id="como-funciona" aria-labelledby="como-funciona-titulo">${sectionHead('como-funciona-titulo', 'Criterio del sistema', 'Cómo construye Grado tu tema.')}<div class="docs-grid docs-grid--3">${notes.map(([title, text]) => card(title, '', `<p class="card-text">${text}</p>`)).join('')}</div></section>`

// ── Instalación ───────────────────────────────────────────────────────────
const installReact = `npm install ./vendor/1k5-grado-${version}.tgz ./vendor/1k5-grado-react-${version}.tgz`
const installVue = `npm install ./vendor/1k5-grado-${version}.tgz ./vendor/1k5-grado-vue-${version}.tgz`
const frameworkSwitch = `<div class="segmented framework-switch" role="group" aria-label="Framework de los ejemplos"><button type="button" data-set-framework="react" aria-pressed="true">React</button><button type="button" data-set-framework="vue" aria-pressed="false">Vue</button></div>`
const step = (id, number, title, content) =>
  `<section class="k5-card docs-step" id="${id}"><div class="docs-step__head"><span class="step-number" aria-hidden="true">${number}</span><h2>${title}</h2></div><div class="docs-step__body">${content}</div></section>`
const installation = `${pageHeader('Instalación', 'Del primer import a una interfaz compartida. Grado aporta presentación y componentes; tu proyecto conserva el router, los datos y la lógica.', frameworkSwitch)}
<div class="k5-card promo"><span class="path-swatches" aria-hidden="true"><i style="background:var(--k5-aubergine)"></i><i style="background:var(--k5-mint)"></i><i style="background:var(--k5-fuchsia)"></i></span><div><strong>¿Quieres tus propios colores?</strong><p>Crea tu tema en Personalizar y vuelve con el código de instalación ya preparado.</p></div>${renderToStaticMarkup(linkButton('personalizar.html', 'Crear mi tema', { variant: 'secondary', icon: icons.customize }))}</div>
${step('requisitos', '1', 'Prepara tu proyecto', `<p>Utiliza React 18 o superior, o Vue 3.5 o superior. Para compilar el repositorio de Grado necesitas Node.js 20 o superior. Tailwind es opcional.</p><p>Con el App Router de Next.js puedes importar los componentes desde un Server Component: los que tienen estado llevan <code>'use client'</code>.</p>`)}
${step('paquetes', '2', 'Instala los paquetes', `<p>La versión ${version} aún no está en npm. Descarga el paquete base y el de tu framework, guárdalos en <code>vendor/</code> dentro de tu aplicación y añádelos al repositorio para que el despliegue también los tenga.</p>${downloads}<div data-framework="react">${code(installReact, 'Terminal · en tu aplicación')}</div><div data-framework="vue" hidden>${code(installVue, 'Terminal · en tu aplicación')}</div><details class="api-details"><summary>Trabajar directamente desde el repositorio ${svg(icons.chevron)}</summary><p>Ejecuta <code>npm install</code> y <code>npm run build</code> en el repositorio de Grado. Después instala ambos paquetes desde tu aplicación:</p>${code(`npm install "/ruta/a/Grado/packages/grado" "/ruta/a/Grado/packages/grado-react"`, 'React · sustituye las rutas por las reales')}<p>En Vue, sustituye <code>grado-react</code> por <code>grado-vue</code>. Estas rutas locales deben estar disponibles en el entorno que compila la aplicación.</p></details>`)}
${step(
  'estilos',
  '3',
  'Conecta los estilos',
  `<p>Importa los estilos una sola vez. Elige la opción que use tu aplicación.</p><div class="segmented style-tabs" role="group" aria-label="Configuración de estilos"><button type="button" data-style="tailwind4" aria-pressed="true">Tailwind 4</button><button type="button" data-style="tailwind3" aria-pressed="false">Tailwind 3</button><button type="button" data-style="css" aria-pressed="false">CSS sin Tailwind</button></div><div data-style-panel="tailwind4">${code(
    `@import 'tailwindcss';
@import '@1k5/grado/fonts.css';
@import '@1k5/grado/tailwind.css';
@import '@1k5/grado/grado.css' layer(components);`,
    'CSS global',
  )}<p>La capa <code>components</code> permite que las utilidades de Tailwind ajusten los componentes, por ejemplo <code>className="w-full"</code>.</p></div><div data-style-panel="tailwind3" hidden>${code(
    `@import '@1k5/grado/fonts.css';
@import '@1k5/grado/tokens-hsl.css';
@import '@1k5/grado/grado.css';

@tailwind base;
@tailwind components;
@tailwind utilities;`,
    'CSS global',
  )}${code(
    `import grado from '@1k5/grado/tailwind-preset';

export default {
  presets: [grado],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,vue}'],
  // Conserva los plugins que utilice tu aplicación.
};`,
    'tailwind.config.js',
  )}</div><div data-style-panel="css" hidden>${code(
    `import '@1k5/grado/fonts.css';
import '@1k5/grado/tokens.css';
import '@1k5/grado/grado.css';`,
    'Entrada de tu aplicación con bundler',
  )}${code(
    `*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--k5-font-sans);
  font-size: var(--k5-text-body);
  background: var(--k5-background);
  color: var(--k5-foreground);
}`,
    'CSS global',
  )}<p>En HTML sin bundler, copia las carpetas <code>dist/</code> y <code>assets/fonts/</code> del paquete base a tu carpeta pública, con esa misma estructura, y carga <code>dist/fonts.css</code>, <code>dist/tokens.css</code> y <code>dist/grado.min.css</code>, en ese orden, con <code>&lt;link rel="stylesheet"&gt;</code>.</p>${code(`<button class="k5-btn k5-btn--primary">Guardar cambios</button>`, 'HTML')}</div><p class="small-note">Sustituye las definiciones anteriores de los tokens equivalentes. Utiliza <code>tokens-hsl.css</code> para Tailwind 3; <code>tokens.css</code> para colores completos. No importes ambos.</p><details class="api-details"><summary>Otras versiones de grado.css ${svg(icons.chevron)}</summary><ul class="docs-list"><li><code>grado.min.css</code>: el mismo CSS minificado, para servirlo sin bundler.</li><li><code>grado.layer.css</code>: dentro de <code>@layer components</code>. Tu CSS sin capa gana siempre, sin pelear por especificidad.</li><li><code>css/button.css</code>, <code>css/calendar.css</code>…: un archivo por componente. Todos necesitan <code>tokens.css</code> y <code>css/base.css</code>.</li><li><code>fonts.css</code>: Barlow en 400, 500, 600 y 700. Si tu app ya carga Barlow, no lo importes.</li></ul></details>`,
)}
${step(
  'temas',
  '4',
  'Elige tu tema',
  `<p><strong>Consola</strong> es el tema por defecto. Activa <strong>Marca</strong> en el documento o en un contenedor. El modo oscuro se controla con la clase <code>dark</code> o el atributo <code>data-theme="dark"</code>.</p><div class="theme-options"><div><strong>Consola</strong><span>Herramientas internas</span><code>sin atributo</code></div><div><strong>Marca</strong><span>Lo que ve el cliente</span><code>data-k5-theme="marca"</code></div><a href="personalizar.html"><strong>Tu tema</strong><span>Tus colores sobre cualquiera de los dos</span><span class="text-link">Crear en Personalizar ${arrow}</span></a></div>${code(`<html lang="es" data-k5-theme="marca" class="dark">`, 'Marca · modo oscuro')}<p>Para crear componentes propios, utiliza los tokens semánticos. Así responderán al tema y al modo de color:</p>${code(
    `.mi-panel {
  background: var(--k5-card);
  color: var(--k5-card-foreground);
  border: 1px solid var(--k5-border);
  border-radius: var(--k5-radius-panel);
}`,
    'CSS',
  )}<p>Los tokens de marca como <code>--k5-mint</code> son constantes. Los semánticos como <code>--k5-primary</code> cambian con el tema. Para gráficos también puedes importar <code>themes</code> desde <code>@1k5/grado/tokens</code>.</p>`,
)}
${step(
  'primer-componente',
  '5',
  'Añade tu primer componente',
  `<div class="first-component"><div class="first-component-preview">${render(h('form', { className: 'live-stack', 'aria-label': 'Ejemplo de formulario' }, h(G.Field, { label: 'Potencia instalada', required: true }, h(G.Input, { suffix: 'kWp', inputMode: 'decimal', defaultValue: '8,4' })), h('div', null, h(G.Button, { type: 'button' }, 'Guardar instalación'))))}</div><div class="first-component-code"><div data-framework="react">${code(
    `import { Button, Field, Input } from '@1k5/grado-react';

export default function Instalacion() {
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <Field label="Potencia instalada" required>
        <Input suffix="kWp" inputMode="decimal" />
      </Field>
      <Button type="submit">Guardar instalación</Button>
    </form>
  );
}`,
    'React · ejemplo de presentación',
  )}</div><div data-framework="vue" hidden>${code(components[2].vue, 'Vue · ejemplo con v-model')}</div></div></div><p>Conecta el envío a la lógica de tu aplicación. Los componentes no realizan peticiones de datos por su cuenta.</p>`,
)}
${step(
  'idioma',
  '6',
  'Elige el idioma',
  `<p>Sin configurar nada, los textos de los componentes (cerrar, buscar, página siguiente…) están en español. Para otro idioma, envuelve la aplicación. También cambia el formato de números y fechas.</p><div data-framework="react">${code(
    `import { GradoProvider } from '@1k5/grado-react';

export default function Raiz() {
  return (
    <GradoProvider locale="de-DE">
      <App />
    </GradoProvider>
  );
}`,
    'React · raíz de la aplicación',
  )}</div><div data-framework="vue" hidden>${code(
    `import { createApp } from 'vue';
import { Grado } from '@1k5/grado-vue';
import App from './App.vue';

createApp(App).use(Grado, { locale: 'de-DE' }).mount('#app');`,
    'Vue · main.ts',
  )}</div><p>Idiomas incluidos: <code>es-ES</code>, <code>de-DE</code> y <code>en-GB</code>. Con <code>messages</code> cambias textos sueltos, por ejemplo <code>{ noResults: 'Sin coincidencias' }</code>. Las props de cada componente, como <code>closeLabel</code>, siguen teniendo prioridad.</p>`,
)}
<section class="k5-card docs-step" id="migracion"><div class="docs-step__head"><h2>Migrar un proyecto existente</h2></div><div class="docs-step__body"><ol class="migration-grid"><li><span class="step-number">1</span><strong>Empieza por los tokens</strong><p>Reemplaza las variables equivalentes y revisa los colores escritos directamente.</p></li><li><span class="step-number">2</span><strong>Unifica la estructura</strong><p>Adopta AppShell y la navegación donde encajen con tu producto.</p></li><li><span class="step-number">3</span><strong>Sustituye las piezas repetidas</strong><p>Botones, campos, tarjetas y tablas, pantalla a pantalla.</p></li><li><span class="step-number">4</span><strong>Comprueba el resultado</strong><p>Móvil, teclado, modo oscuro, validaciones y estados de carga.</p></li></ol><p>Los componentes existentes que usen variables compatibles de shadcn recogerán los nuevos valores. Adoptar solo los tokens no sustituye automáticamente sus tamaños, estructura ni comportamiento.</p>${render(h(G.Alert, { tone: 'info', title: 'Estado de accesibilidad' }, 'Todas las combinaciones de color llegan a 4,5 : 1 en los dos temas y los dos modos, y axe-core revisa cada componente en el navegador con React y con Vue. Las comprobaciones automáticas no sustituyen a una revisión con personas ni equivalen a una certificación.'))}</div></section>
<a class="k5-card next-page" href="components.html"><span>Siguiente</span><strong>Explora los componentes ${arrow}</strong></a>`

// ── Componentes ───────────────────────────────────────────────────────────
const previewThemeSwitch = `<div class="segmented" role="group" aria-label="Tema de las vistas previas" data-preview-theme-switch><button type="button" data-preview-theme="site" aria-pressed="true">Tema de la web</button><button type="button" data-preview-theme="custom" aria-pressed="false">Mi tema <code data-preview-theme-code></code></button></div>`
const componentsBody = `${pageHeader('Componentes', 'Piezas pequeñas para construir algo consistente. Explora sus estados, pruébalas con tu tema y lleva el código a tu aplicación.', `${previewThemeSwitch}${frameworkSwitch}`)}<p class="demo-note" data-preview-theme-missing hidden>Todavía no has creado un tema. <a href="personalizar.html">Créalo en Personalizar</a> y vuelve para ver aquí los componentes con tus colores.</p><p class="demo-note">${components.length} componentes en ${byCategory.length} familias. Las vistas previas usan los componentes reales; los datos y las acciones de negocio son demostrativos.</p>${byCategory.map((group) => `<section class="component-family" id="familia-${slug(group.name)}" aria-labelledby="familia-${slug(group.name)}-titulo"><h2 class="component-family__title" id="familia-${slug(group.name)}-titulo"><span class="docs-icon" aria-hidden="true">${svg(icons[group.name])}</span>${group.name}<span class="component-family__count">${group.items.length}</span></h2>${group.items.map(componentSection).join('')}</section>`).join('')}`

// ── Estado: cobertura de cada componente y adopción por app ──────────────────
// Se calcula al generar la web leyendo los tests, así que no se queda desactualizado.
const sources = {
  parity: ['test/parity.test.mjs', 'test/patterns.test.mjs', 'test/i18n.test.mjs'].map(read).join('\n'),
  browser: read('test/browser/fixture.mjs'),
  visual: read('scripts/catalog.mjs'),
}
const adoption = JSON.parse(read('docs-site/adoption.json'))
const exportNames = (c) => c.name.split(/[^A-Za-z]+/).filter((word) => /^[A-Z]/.test(word))
const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const mentions = (source, names, patterns) => names.some((name) => patterns.some((make) => new RegExp(make(escapeRe(name))).test(source)))
const coverage = components.map((c) => {
  const names = exportNames(c)
  return {
    c,
    react: names.every((name) => name in G),
    vue: names.every((name) => name in V),
    parity: mentions(sources.parity, names, [(n) => `R\\.${n}\\b`, (n) => `\\['${n}'`]),
    browser: mentions(sources.browser, names, [(n) => `C\\('${n}'`]),
    visual: mentions(sources.visual, names, [(n) => `G\\.${n}\\b`]),
    guide: Boolean(guidelines[c.id]),
    figma: adoption.figma?.[c.id] ?? '',
  }
})
const yes = (ok, label) =>
  ok
    ? `<span class="status-yes" title="${label}: sí">✓<span class="sr-only"> sí</span></span>`
    : `<span class="status-no" title="${label}: no">—<span class="sr-only"> no</span></span>`
const count = (key) => coverage.filter((row) => row[key]).length
const percentOf = (key) => `${Math.round((count(key) / coverage.length) * 100)} %`
const adoptionTone = { migrando: 'info', adoptada: 'success', pendiente: 'neutral' }
const adoptionLabel = { migrando: 'Migrando', adoptada: 'Adoptada', pendiente: 'Pendiente' }
const statusBody = `${pageHeader('Estado', 'Qué está probado de cada componente y qué versión usa cada aplicación. Se genera con la web a partir de los tests del repositorio.')}
${render(
  h(
    G.KpiGroup,
    { label: 'Cobertura' },
    h(G.Kpi, { label: 'Componentes', value: String(components.length), hint: 'Con la misma API en React y Vue' }),
    h(G.Kpi, { label: 'Probados en navegador', value: percentOf('browser'), hint: 'Teclado, foco y axe' }),
    h(G.Kpi, { label: 'Con captura de referencia', value: percentOf('visual'), hint: 'Regresión visual' }),
    h(G.Kpi, { label: 'Con guía de uso', value: percentOf('guide'), hint: 'Cuándo usarlo y qué evitar' }),
  ),
)}
<section class="docs-section" aria-labelledby="cobertura-titulo">${sectionHead('cobertura-titulo', 'Cobertura por componente', '<strong>Mismo HTML</strong>: React y Vue generan el mismo marcado (tests de paridad). <strong>Navegador</strong>: teclado, foco y axe-core en 2 temas × 2 modos. <strong>Captura</strong>: aparece en las capturas de regresión visual. <strong>Figma</strong>: enlace al componente en la librería de diseño, cuando exista.')}
${render(
  h(
    G.Table,
    { caption: 'Cobertura de cada componente', compact: true, className: 'status-table' },
    h(
      'thead',
      null,
      h(
        'tr',
        null,
        ...['Componente', 'React', 'Vue', 'Mismo HTML', 'Navegador', 'Captura', 'Guía', 'Figma'].map((label) =>
          h('th', { key: label, scope: 'col' }, label),
        ),
      ),
    ),
    h(
      'tbody',
      null,
      coverage.map((row) =>
        h(
          'tr',
          { key: row.c.id },
          h('th', { scope: 'row' }, h('a', { href: `components.html#${row.c.id}` }, row.c.name)),
          ...['react', 'vue', 'parity', 'browser', 'visual', 'guide'].map((key) =>
            h('td', { key, dangerouslySetInnerHTML: { __html: yes(row[key], key) } }),
          ),
          h('td', null, row.figma ? h('a', { href: row.figma }, 'Abrir') : '—'),
        ),
      ),
    ),
  ),
)}
</section>
<section class="docs-section" aria-labelledby="adopcion-titulo">${sectionHead('adopcion-titulo', 'Adopción por aplicación', `Se mantiene a mano en <code>docs-site/adoption.json</code>. Versión actual de Grado: ${version}.`)}
${render(
  h(
    G.Table,
    { caption: 'Aplicaciones que usan Grado' },
    h(
      'thead',
      null,
      h(
        'tr',
        null,
        h('th', { scope: 'col' }, 'Aplicación'),
        h('th', { scope: 'col' }, 'Estado'),
        h('th', { scope: 'col' }, 'Versión'),
        h('th', { scope: 'col' }, 'Detalle'),
      ),
    ),
    h(
      'tbody',
      null,
      adoption.apps.map((app) =>
        h(
          'tr',
          { key: app.app },
          h('th', { scope: 'row' }, app.app),
          h('td', null, h(G.Badge, { tone: adoptionTone[app.estado] ?? 'neutral' }, adoptionLabel[app.estado] ?? app.estado)),
          h('td', null, app.version ? h('code', null, app.version) : '—'),
          h('td', null, app.detalle || '—'),
        ),
      ),
    ),
  ),
)}
</section>`

// ── Cambios: CHANGELOG.md del repositorio ─────────────────────────────────
// Markdown mínimo: títulos ## y ###, listas con «- », párrafos y `código`.
const inline = (text) => esc(text).replace(/`([^`]+)`/g, '<code>$1</code>')
function markdown(source) {
  const html = []
  let list = false
  const closeList = () => {
    if (list) {
      html.push('</ul>')
      list = false
    }
  }
  for (const line of source.split('\n')) {
    if (line.startsWith('# ')) continue
    if (line.startsWith('## ')) {
      closeList()
      const title = line.slice(3)
      html.push(`<h2 id="v-${slug(title.split('·')[0])}">${inline(title)}</h2>`)
    } else if (line.startsWith('### ')) {
      closeList()
      html.push(`<h3>${inline(line.slice(4))}</h3>`)
    } else if (line.startsWith('- ')) {
      if (!list) {
        html.push('<ul>')
        list = true
      }
      html.push(`<li>${inline(line.slice(2))}</li>`)
    } else if (line.trim()) {
      closeList()
      html.push(`<p>${inline(line)}</p>`)
    } else closeList()
  }
  closeList()
  return html.join('\n')
}
const changelogSource = read('CHANGELOG.md')
const changelogIntro = changelogSource.split('\n').find((line) => line && !line.startsWith('#')) ?? ''
const changelogBody = `${pageHeader('Cambios', changelogIntro.replaceAll('`', ''))}
<div class="k5-card changelog">${markdown(changelogSource.replace(changelogIntro, ''))}</div>`

mkdirSync(new URL('assets/', out), { recursive: true })
// Solo los paquetes de esta versión: npm pack los vuelve a generar después.
rmSync(new URL('downloads/', out), { recursive: true, force: true })
mkdirSync(new URL('downloads/', out), { recursive: true })
for (const file of ['tokens.css', 'grado.css']) copyFileSync(new URL(`packages/grado/dist/${file}`, root), new URL(`assets/${file}`, out))
// Barlow desde el propio paquete: la web no depende de Google Fonts para su fuente.
writeFileSync(new URL('assets/fonts.css', out), read('packages/grado/dist/fonts.css').replaceAll('../assets/fonts/', 'fonts/'))
cpSync(new URL('packages/grado/assets/fonts/', root), new URL('assets/fonts/', out), { recursive: true })
writeFileSync(new URL('assets/grado-mark.svg', out), renderToStaticMarkup(h(GradoMark, { xmlns: 'http://www.w3.org/2000/svg' })))
for (const stale of [
  'assets/docs.js',
  'assets/live-demos.js',
  'assets/site.css',
  'assets/logo-1k5.svg',
  'assets/logo-1k5-white.svg',
  'assets/signet-1k5.svg',
])
  rmSync(new URL(stale, out), { force: true })
cpSync(new URL('docs-site/assets/', root), new URL('assets/', out), {
  recursive: true,
  filter: (source) => !source.endsWith('.mjs') && !source.endsWith('/docs.js'),
})
const pages = {
  home: { title: 'Introducción', html: cleanRouteLinks(pageShell('home', home)) },
  customize: { title: 'Personalizar', html: cleanRouteLinks(pageShell('customize', customize)) },
  installation: { title: 'Instalación', html: cleanRouteLinks(pageShell('installation', installation, installToc)) },
  components: { title: 'Componentes', html: cleanRouteLinks(pageShell('components', componentsBody)) },
  status: { title: 'Estado', html: cleanRouteLinks(pageShell('status', statusBody)) },
  changelog: { title: 'Cambios', html: cleanRouteLinks(pageShell('changelog', changelogBody)) },
}
mkdirSync(new URL('assets/pages/', out), { recursive: true })
for (const [key, data] of Object.entries(pages)) writeFileSync(new URL(`assets/pages/${key}.json`, out), JSON.stringify(data))
// El marco es el AppShell de Grado: sigue el tema elegido, Marca por defecto.
const documentHtml = `<!doctype html>
<html lang="es" data-k5-theme="marca"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="description" content="Grado, el sistema de diseño de 1KOMMA5° España. Guía de instalación, configurador de temas, componentes y ejemplos para React, Vue y HTML."><title>Grado · Sistema de diseño</title><link rel="icon" href="assets/grado-mark.svg" type="image/svg+xml"><link rel="stylesheet" href="assets/fonts.css"><link rel="stylesheet" href="assets/tokens.css"><link rel="stylesheet" href="assets/grado.css"><link rel="stylesheet" href="assets/docs.css"><script src="assets/theme.js"></script></head>
<body><div id="app"></div><script src="assets/app.js" type="module"></script></body></html>`
writeFileSync(new URL('index.html', out), documentHtml)
for (const filename of ['personalizar.html', 'installation.html', 'components.html', 'status.html', 'changelog.html'])
  rmSync(new URL(filename, out), { force: true })
rmSync(new URL('assets/chunks/', out), { recursive: true, force: true })
await build({
  entryPoints: [fileURLToPath(new URL('docs-site/assets/app.mjs', root))],
  outdir: fileURLToPath(new URL('assets/', out)),
  entryNames: 'app',
  chunkNames: 'chunks/[name]-[hash]',
  bundle: true,
  splitting: true,
  format: 'esm',
  minify: true,
  platform: 'browser',
  target: 'es2020',
  define: { 'process.env.NODE_ENV': '"production"' },
})
console.log(`Documentación de Grado ${version}: docs-site/dist/ (${components.length} componentes, configurador de temas)`)
