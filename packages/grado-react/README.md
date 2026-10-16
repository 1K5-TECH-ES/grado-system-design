# @1k5-tech-es/grado-react

Componentes React de Grado, el sistema de diseño de 1KOMMA5° España. Son una capa fina sobre `grado.css`: generan exactamente el mismo HTML que `@1k5-tech-es/grado-vue`.

## Instalación

```bash
npm i @1k5-tech-es/grado @1k5-tech-es/grado-react
```

Importa el CSS una vez en toda la app.

Tailwind 4 (Kompilot, Memorias), en `src/app/styles.css`:

```css
@import 'tailwindcss';
@import '@1k5-tech-es/grado/tailwind.css';
@import '@1k5-tech-es/grado/grado.css' layer(components);
```

`layer(components)` hace que las clases de Tailwind puedan sobrescribir a los componentes, por ejemplo `<Button className="w-full">`.

Sin Tailwind, en `main.tsx`:

```ts
import '@1k5-tech-es/grado/tokens.css'
import '@1k5-tech-es/grado/grado.css'
```

## Uso

```tsx
import { Button, Field, Input, KpiGroup, Kpi } from '@1k5-tech-es/grado-react'
import { Plus } from 'lucide-react'

<Button icon={Plus}>Nueva instalación</Button>

<Field label="Potencia instalada" hint="Suma de los módulos" error={errors.kwp?.message} required>
  <Input suffix="kWp" inputMode="decimal" {...register('kwp')} />
</Field>

<KpiGroup>
  <Kpi label="Tickets abiertos" value="128" change={-5.9} better="lower" previous="136" />
</KpiGroup>
```

## Armazón de aplicación

```tsx
import { NavLink, Outlet } from 'react-router-dom'
import { AppShell, AppSearch, Avatar, Nav, NavItem } from '@1k5-tech-es/grado-react'
import { Ticket, Users } from 'lucide-react'

<AppShell
  product="Kompilot"
  search={<AppSearch label="Buscar instalaciones" shortcut="⌘K" onClick={openPalette} />}
  actions={<Avatar name={user.name} />}
  sidebar={
    <Nav>
      <NavItem as={NavLink} to="/tickets" label="Tickets" icon={Ticket} badge={12} />
      <NavItem as={NavLink} to="/clientes" label="Clientes" icon={Users} />
    </Nav>
  }
>
  <Outlet />
</AppShell>
```

`NavLink` ya marca la página actual con `aria-current="page"`. Usa `active` para rutas anidadas. En móvil la barra lateral se abre como cajón desde el botón de menú, sin configurar nada.

## Componentes

| Componente | Props propias |
|---|---|
| `Button` | `variant` (primary, secondary, ghost, danger, link), `size` (sm, md, lg), `icon`, `iconOnly`, `block`, `loading` |
| `Badge` | `tone` (neutral, brand, info, success, warning, danger, highlight), `icon` |
| `Field` | `label`, `hint`, `error`, `required`, `id` |
| `Input` | `size`, `prefix`, `suffix`, `invalid` |
| `Textarea` | `invalid` |
| `Select` | `size`, `invalid` |
| `Switch` | `label`, `description`, `onCheckedChange` |
| `Card` y sus partes | `variant` (panel, alert, plain); `CardTitle` acepta `as` |
| `Table` | `caption`, `compact` |
| `KpiGroup`, `Kpi` | `label`, `value`, `change`, `better` (higher, lower, neutral), `previous`, `hint`, `tone`, `selectable`, `selected` |
| `PageHeader` | `title`, `subtitle`, `actions`, `as` |
| `EmptyState` | `icon`, `title`, `description`, `action`, `compact` |
| `Spinner` | `size`, `label`, `decorative` |
| `AppShell` | `product`, `brand`, `search`, `actions`, `sidebar`, `sidebarFooter`, `collapsed`, `mainId` |
| `AppLogo`, `AppSearch` | `label`; `AppSearch` también `shortcut` |
| `Nav`, `NavSection` | `label`; `title` |
| `NavItem` | `as` (NavLink o Link), `label`, `icon`, `badge`, `active` |
| `NavGroup` | `label`, `icon`, `badge`, `active`, `defaultOpen`, `open`, `onOpenChange` |
| `Avatar` | `name`, `initials`, `size`, `status` (online, away, busy) |
| `NumberInput` | `value` (número o null), `onValueChange`, `min`, `max`, `step`, `decimals`, `prefix`, `suffix`, `size`, `hideSteppers`, `name` |
| `SegmentedControl` | `options`, `value`, `onValueChange`, `label`, `size`, `block`, `name` |
| `MultiSelect` | `options`, `value` (lista), `onValueChange`, `onQueryChange`, `label`, `placeholder`, `loading`, `emptyLabel`, `name` |
| `Calendar` | `mode` (single, range), `value`, `onValueChange`, `min`, `max`, `month`, `onMonthChange`, `weekStartsOn`, `plain` |
| `CommandPalette` | `groups`, `onSelect`, `open`, `onOpenChange`, `onQueryChange`, `hotkey` (k; false la desactiva) |
| `BarChart` | `data`, `categoryKey`, `series`, `stacked`, `unit`, `title`, `description`, `categoryLabel`, `height` |
| `GradoProvider` | `locale` (es-ES, de-DE, en-GB…), `messages` |

Además, los componentes interactivos (`Dialog`, `Tabs`, `Combobox`, `DataTable`…) están documentados con ejemplos en la web de Grado.

## Avisos

Pon un `Toaster` una vez, junto a `AppShell`, y lanza los avisos desde cualquier sitio, también fuera de un componente:

```tsx
import { Toaster, toast } from '@1k5-tech-es/grado-react'

<Toaster />

toast.success('Oferta enviada', { description: 'A Lucía Fernández', action: { label: 'Deshacer', onClick: deshacer } })
toast.error('No se ha podido guardar')
toast.promise(guardar(), { loading: 'Guardando…', success: 'Guardado', error: 'No se ha podido guardar' })
```

Se ven como mucho tres a la vez (`max`); el resto espera su turno. El tiempo de cada uno empieza cuando se ve.

## Idioma

Sin configurar nada, los textos de los componentes están en español. Para otro idioma:

```tsx
import { GradoProvider } from '@1k5-tech-es/grado-react'

<GradoProvider locale="de-DE" messages={{ noResults: 'Nichts gefunden' }}>
  <App />
</GradoProvider>
```

Las props de cada componente (`closeLabel`, `emptyLabel`…) siguen teniendo prioridad. `useGrado()` devuelve el idioma y los textos activos.

## Next.js

Los módulos con estado o eventos llevan `'use client'`, así que se pueden importar desde un Server Component del App Router.

Reglas comunes:

- `className` y el resto de atributos HTML van al elemento principal: el `<button>`, el `<input>`, el `<table>`…
- Todos los componentes reenvían `ref`. En los campos (`Input`, `NumberInput`, `Combobox`, `TimePicker`…) va al `<input>` que recibe el foco, así que funcionan con `register()` de react-hook-form y con el foco en el primer error. En el resto va al elemento que recibe los atributos HTML o, si no los admite, al raíz: el `<dialog>` de `Dialog`, la `<table>` de `Table`, el `<figure>` de los gráficos.
- Dentro de un `Field`, los controles reciben solos el `id`, `aria-describedby`, `aria-invalid` y `required`.
- Para un enlace con aspecto de botón (o el `Link` del router), usa la función: `<Link className={buttonClass({ variant: 'secondary' })}>`.
