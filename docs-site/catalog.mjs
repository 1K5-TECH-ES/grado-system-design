// Catálogo de componentes de la web: datos, vista previa, código y propiedades de cada uno.
// Lo usan la aplicación de la web (en el navegador) y el build (búsqueda, Estado).
import { createElement as h, Fragment } from 'react'
import * as G from '@1k5-tech-es/grado-react'
import { newComponents } from './components.mjs'
import { GradoLogo } from './brand.mjs'

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

export const components = [
  {
    id: 'button',
    name: 'Button',
    category: 'Acciones',
    description: 'Una acción, una jerarquía clara. Seis variantes para guiar el siguiente paso.',
    preview: row(
      h(G.Button, { icon: plus }, 'Nueva instalación'),
      h(G.Button, { variant: 'secondary' }, 'Exportar'),
      h(G.Button, { variant: 'ghost' }, 'Cancelar'),
      h(G.Button, { variant: 'danger' }, 'Eliminar'),
      h(G.Button, { variant: 'link' }, 'Ver detalle'),
      h(G.Button, { loading: true }, 'Guardando'),
      h(G.Button, { disabled: true }, 'Desactivado'),
    ),
    react: `import { Button } from '@1k5-tech-es/grado-react';

<Button onClick={guardar}>Guardar cambios</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="danger">Eliminar</Button>
<Button loading>Guardando</Button>`,
    vue: `<script setup>
import { Button } from '@1k5-tech-es/grado-vue';
const emit = defineEmits(['guardar']);
</script>

<template>
  <Button @click="emit('guardar')">Guardar cambios</Button>
  <Button variant="secondary">Cancelar</Button>
  <Button variant="danger">Eliminar</Button>
  <Button loading>Guardando</Button>
</template>`,
    props: [
      ['variant', 'primary · secondary · ghost · danger · destructive · link', 'primary'],
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
    react: `import { Badge } from '@1k5-tech-es/grado-react';

<Badge tone="success">Firmada</Badge>
<Badge tone="warning">Pendiente</Badge>`,
    vue: `<script setup>
import { Badge } from '@1k5-tech-es/grado-vue';
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
    react: `import { Field, Input } from '@1k5-tech-es/grado-react';

<Field label="Potencia instalada" hint="Suma de los módulos" required>
  <Input suffix="kWp" inputMode="decimal" defaultValue="8,4" />
</Field>`,
    vue: `<script setup>
import { ref } from 'vue';
import { Field, Input } from '@1k5-tech-es/grado-vue';
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
    react: `import { Field, Select, Textarea } from '@1k5-tech-es/grado-react';

<Field label="Tipo de instalación">
  <Select defaultValue="solar">
    <option value="solar">Solo placas</option>
    <option value="bateria">Placas y batería</option>
  </Select>
</Field>
<Field label="Notas"><Textarea rows={3} /></Field>`,
    vue: `<script setup>
import { ref } from 'vue';
import { Field, Select, Textarea } from '@1k5-tech-es/grado-vue';
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
import { Switch } from '@1k5-tech-es/grado-react';

function Preferencias() {
  const [activo, setActivo] = useState(true);
  return <Switch checked={activo} onCheckedChange={setActivo}
    label="Respuesta automática" description="Fuera del horario de oficina" />;
}`,
    vue: `<script setup>
import { ref } from 'vue';
import { Switch } from '@1k5-tech-es/grado-vue';
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
  CardContent, CardFooter, Button } from '@1k5-tech-es/grado-react';

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
  CardContent, CardFooter, Button } from '@1k5-tech-es/grado-vue';
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
    react: `import { Table, Badge } from '@1k5-tech-es/grado-react';

<Table caption="Instalaciones">
  <thead><tr><th>Cliente</th><th>Estado</th></tr></thead>
  <tbody><tr>
    <td>Lucía Fernández</td>
    <td><Badge tone="success">Conectada</Badge></td>
  </tr></tbody>
</Table>`,
    vue: `<script setup>
import { Table, Badge } from '@1k5-tech-es/grado-vue';
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
      ['plain', 'Sin caja, para una tabla que ya está dentro de una tarjeta', 'false'],
      ['k5-num', 'Clase: columna numérica en th y td (alineada a la derecha, cifras tabulares)', '—'],
      ['<th scope="row">', 'Cabecera de fila en el cuerpo: se pinta como una celda, con el nombre en negrita', '—'],
    ],
    note: 'El componente aporta estructura y estilos. La ordenación, paginación y selección de filas pertenecen a tu aplicación. Para el estado de cada fila, Status (punto y texto) es más discreto que Badge.',
  },
  {
    id: 'kpi',
    name: 'Kpi',
    category: 'Datos',
    description: 'El dato y su evolución. Tú defines si subir o bajar es una buena noticia.',
    preview: h(
      G.KpiGroup,
      null,
      h(G.Kpi, { label: 'Instalaciones activas', value: '128', change: 10, previous: '116', trend: [104, 108, 107, 112, 116, 121, 128] }),
      h(G.Kpi, { label: 'Días hasta legalizar', value: '23', change: -14.3, better: 'lower', previous: '27' }),
      h(G.Kpi, { label: 'Incidencias', value: '7', tone: 'danger', hint: 'Fuera de plazo' }),
    ),
    react: `import { KpiGroup, Kpi } from '@1k5-tech-es/grado-react';

<KpiGroup>
  <Kpi label="Instalaciones activas" value="128" change={10} previous="116"
    trend={[104, 108, 107, 112, 116, 121, 128]} />
  <Kpi label="Días hasta legalizar" value="23"
    change={-14.3} better="lower" previous="27" />
</KpiGroup>`,
    vue: `<script setup>
import { KpiGroup, Kpi } from '@1k5-tech-es/grado-vue';
</script>

<template>
  <KpiGroup>
    <Kpi label="Instalaciones activas" value="128" :change="10" previous="116"
      :trend="[104, 108, 107, 112, 116, 121, 128]" />
    <Kpi label="Días hasta legalizar" value="23"
      :change="-14.3" better="lower" previous="27" />
  </KpiGroup>
</template>`,
    props: [
      ['label / value', 'Etiqueta / valor mostrado', 'Obligatorios'],
      ['change / previous', 'Variación porcentual / valor anterior', '—'],
      ['better', 'higher · lower · neutral', 'higher'],
      ['trend', 'number[]: línea de tendencia bajo la cifra, del color de la variación', '—'],
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
    react: `import { PageHeader, Button } from '@1k5-tech-es/grado-react';

<PageHeader title="Instalaciones" subtitle="Seguimiento de obras"
  actions={<Button>Nueva instalación</Button>} />`,
    vue: `<script setup>
import { PageHeader, Button } from '@1k5-tech-es/grado-vue';
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
    react: `import { EmptyState, Button } from '@1k5-tech-es/grado-react';

<EmptyState title="Todo al día"
  description="No hay documentos pendientes de revisión."
  action={<Button variant="secondary">Añadir documento</Button>} />`,
    vue: `<script setup>
import { EmptyState, Button } from '@1k5-tech-es/grado-vue';
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
    react: `import { Spinner } from '@1k5-tech-es/grado-react';

<Spinner label="Cargando instalaciones" />
<Spinner size="sm" decorative />`,
    vue: `<script setup>
import { Spinner } from '@1k5-tech-es/grado-vue';
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
    react: `import { Avatar } from '@1k5-tech-es/grado-react';

<Avatar name="Marta Ruiz" status="online" />
<Avatar name="Ana Pérez" size="lg" status="away" />`,
    vue: `<script setup>
import { Avatar } from '@1k5-tech-es/grado-vue';
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
    react: `import { AppShell, Nav, NavItem, PageHeader, Avatar } from '@1k5-tech-es/grado-react';

<AppShell product="Mi aplicación"
  actions={<Avatar name="Lucía Fernández" />}
  sidebar={<Nav><NavItem href="/" label="Instalaciones" active /></Nav>}>
  <PageHeader title="Instalaciones" />
</AppShell>`,
    vue: `<script setup>
import { AppShell, Nav, NavItem, PageHeader, Avatar } from '@1k5-tech-es/grado-vue';
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

// Labs va al final: fuera de la promesa de la 1.0.
export const categories = ['Acciones', 'Formularios', 'Datos', 'Estructura', 'Navegación', 'Superposiciones', 'Respuesta', 'Labs']
export const byCategory = categories
  .map((name) => ({ name, items: components.filter((c) => c.category === name) }))
  .filter((group) => group.items.length)
