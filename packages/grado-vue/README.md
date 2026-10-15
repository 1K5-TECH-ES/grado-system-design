# @1k5/grado-vue

Componentes Vue 3 de Grado, el sistema de diseño de 1KOMMA5° España. Son una capa fina sobre `grado.css`: generan exactamente el mismo HTML que `@1k5/grado-react`. No necesitan compilar `.vue`: están hechos con `defineComponent`.

## Instalación

```bash
npm i @1k5/grado @1k5/grado-vue
```

Importa el CSS una vez en toda la app. Con Tailwind 3 (1komma5es_help, Sales Coach), en `src/assets/index.css`:

```css
@import '@1k5/grado/tokens-hsl.css';
@import '@1k5/grado/grado.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

Así las utilidades de Tailwind quedan después y pueden sobrescribir a los componentes, por ejemplo `<Button class="w-full">`.

## Uso

```vue
<script setup lang="ts">
import { Button, Field, Input, Switch, PageHeader } from '@1k5/grado-vue'
import { Plus } from 'lucide-vue-next'
const kwp = ref('8,4')
const auto = ref(true)
</script>

<template>
  <PageHeader title="Instalaciones" subtitle="Obras de autoconsumo">
    <template #actions>
      <Button :icon="Plus">Nueva instalación</Button>
    </template>
  </PageHeader>

  <Field label="Potencia instalada" hint="Suma de los módulos" required>
    <Input v-model="kwp" suffix="kWp" inputmode="decimal" />
  </Field>

  <Switch v-model="auto" label="Respuesta automática" />
</template>
```

## Armazón de aplicación

```vue
<AppShell product="Sales Coach">
  <template #actions><Avatar :name="user.name" /></template>
  <template #sidebar>
    <Nav>
      <NavItem v-for="item in nav" :key="item.to" :as="RouterLink" :to="item.to" :label="item.label" :icon="item.icon" :active="item.active()" />
    </Nav>
  </template>
  <RouterView />
</AppShell>
```

Slots: `#brand` (para envolver logo y nombre en un `RouterLink`), `#search`, `#actions`, `#sidebar`, `#sidebar-footer` y el de por defecto. `RouterLink` marca la ruta exacta con `aria-current="page"`; usa `active` para rutas anidadas. `NavGroup` admite `v-model:open`.

## Componentes

Los mismos que en React, con las mismas props. Solo cambia lo que en Vue se hace de otra forma:

| React | Vue |
|---|---|
| `value` + `onChange` en `Input`, `Textarea`, `Select` | `v-model` |
| `checked` + `onCheckedChange` en `Switch` | `v-model` |
| `actions={…}` en `PageHeader` | `<template #actions>` |
| `action={…}` en `EmptyState` | `<template #action>` |
| `prefix` / `suffix` como nodo | prop de texto o `<template #prefix>` / `<template #suffix>` |
| `className` | `class` |

Componentes nuevos en 0.2.0, con `v-model`: `NumberInput` (número o null), `SegmentedControl`, `MultiSelect` (lista), `Calendar` (texto ISO, o `{ start, end }` con `mode="range"`; `v-model:month` para el mes visible) y `CommandPalette` (`v-model:open` y evento `select`). `BarChart` no tiene v-model. `NumberInput` admite los slots `#prefix` y `#suffix`.

En `Input`, `Textarea`, `Select`, `Switch` y `Table`, `class` y los atributos van al control (el `<input>`, la `<table>`), no al contenedor.

En `Input`, `v-model` devuelve siempre texto. Para cifras usa `NumberInput`, que entiende «8,4» y devuelve 8.4.

## Idioma

Sin configurar nada, los textos están en español. Para toda la app:

```ts
import { Grado } from '@1k5/grado-vue'

createApp(App).use(Grado, { locale: 'de-DE' }).mount('#app')
```

Para una parte de la página, `<GradoProvider locale="en-GB">`. Las props de cada componente siguen teniendo prioridad. `useGrado()` devuelve el idioma y los textos activos dentro de `setup()`.
