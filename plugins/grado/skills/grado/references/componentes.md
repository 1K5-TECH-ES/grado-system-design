# Componentes

Lista de **Grado 0.7.0**. Si la app tiene otra versión, los tipos en `node_modules/@1k5-tech-es/grado-react/dist/*.d.ts` (o `grado-vue`) mandan: un componente de esta lista que no esté ahí es de una versión posterior.

## 1. Primer componente

React:

```tsx
import { Button, Field, Input } from '@1k5-tech-es/grado-react'

export function FormInstalacion() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Field label="Potencia instalada" required>
        <Input suffix="kWp" inputMode="decimal" />
      </Field>
      <Button type="submit">Guardar instalación</Button>
    </form>
  )
}
```

Vue:

```vue
<script setup>
import { ref } from 'vue'
import { Button, Field, Input } from '@1k5-tech-es/grado-vue'
const potencia = ref('8,4')
</script>

<template>
  <form @submit.prevent>
    <Field label="Potencia instalada" required>
      <Input v-model="potencia" suffix="kWp" inputmode="decimal" />
    </Field>
    <Button type="submit">Guardar instalación</Button>
  </form>
</template>
```

## 2. React y Vue: mismas props, distinta forma de escuchar

| React | Vue |
|---|---|
| `value` + `onValueChange` / `onChange` | `v-model` (`modelValue` / `update:modelValue`) |
| `open` + `onOpenChange` (`Dialog`, `Drawer`, `Sheet`…) | `v-model:open` |
| `footer={<…/>}` y otras props que reciben nodos | slot con el mismo nombre: `<template #footer>` |
| `className` | `class` |

En React, todos los componentes aceptan `ref`.

## 3. Qué hay

- **Armazón:** `AppShell`, `Nav`, `NavSection`, `NavGroup`, `NavItem`, `AppSearch`, `AppLogo`, `Avatar`, `AvatarGroup`, `PageHeader`
- **Maquetación y texto:** `Container`, `Stack`, `Grid`, `Separator`, `Heading`, `Text`, `Link`, `Kbd`
- **Tarjetas:** `Card` (`variant`: `panel`, `alert` o `plain`), `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- **Acciones:** `Button`, `IconButton`, `CopyButton`, `DropdownMenu`, `ContextMenu`, `CommandPalette`, `ActionBar`
- **Formularios:** `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `NumberInput`, `PasswordInput`, `SearchInput`, `Combobox`, `MultiSelect`, `SegmentedControl`, `ToggleGroup`, `DatePicker`, `DateRangePicker`, `TimePicker`, `Calendar`, `FileUpload`
- **Campos españoles:** `NifInput`, `IbanInput`, `PhoneInput`, `AddressInput`
- **Datos:** `Table`, `DataTable` (orden, selección, paginación, datos del servidor con `manual`, selector de columnas, cabecera fija con `maxHeight`, filas virtuales automáticas a partir de 200 filas, CSV), `Pagination`, `FilterBar`, `FilterChip`, `DescriptionList`, `Timeline`, `Stepper`, `Kpi`, `KpiGroup`, `Badge`, `Tag`, `Status`, `Meter`, `Progress`
- **Feedback:** `Alert`, `Banner`, `Toaster` + `toast()`, `Toast` (un aviso suelto, controlado con `open`), `EmptyState`, `Skeleton`, `Spinner`
- **Superposiciones:** `Dialog`, `AlertDialog`, `Drawer`, `Sheet`, `Popover`, `Tooltip`, `Accordion`, `Tabs`, `Breadcrumbs`
- **Gráficos:** `LineChart`, `AreaChart`, `BarChart`, `Donut`, `Sparkline`, `Heatmap`
- **Energía:** `EnergyFlow`, `PriceChart` (tarifa 2.0TD), `BatteryLevel` e iconos: `SolarPanelIcon`, `InverterIcon`, `HomeBatteryIcon`, `WallboxIcon`, `HeatPumpIcon`, `ElectricMeterIcon`, `PowerGridIcon`
- **Idioma:** `GradoProvider` (React y Vue) y el plugin `Grado` (Vue), sección 6
- **Formularios con librería:** `@1k5-tech-es/grado-react/react-hook-form` y `@1k5-tech-es/grado-vue/vee-validate` traen `Form`, `FormField` y `ErrorSummary`
- **`labs`** (`@1k5-tech-es/grado-react/labs` o `grado-vue/labs`): `TariffComparison`, `SignaturePad`, `SolarForecast`, `Amount` + `formatEuro`/`formatEnergy`/`formatPower`, `RelativeTime`, `useTheme` + `ThemeToggle`, `ScrollArea`, `useHotkey`, `VisuallyHidden`. Necesitan además `@import '@1k5-tech-es/grado/labs.css'` después de `grado.css`, y su API puede cambiar en una versión menor sin aviso.

Funciones útiles: `buttonClass()`, `badgeClass()`… dan las clases de un componente para aplicarlas a otro elemento (un `<a>` o el `Link` del router con aspecto de botón). `cx()` une clases.

Para saber cuándo usar cada uno, qué evitar y qué cuidar de accesibilidad, lee su guía: [guias/indice.md](guias/indice.md) dice en qué archivo está.

Antes de escribir un componente propio, busca aquí: casi todo lo que suelen tener las apps de 1KOMMA5° (tablas con filtros, formularios con NIF o IBAN, diálogos, avisos, gráficos de energía) ya existe.

## 4. Avisos (`toast`)

Pon `<Toaster />` **una vez** en la raíz de la app y llama a `toast()` desde cualquier sitio:

```ts
import { toast } from '@1k5-tech-es/grado-react' // o grado-vue

toast.success('Oferta guardada')
toast.error('No se pudo enviar', { description: 'Revisa la conexión' })
await toast.promise(guardar(), { loading: 'Guardando…', success: 'Guardado', error: 'Error al guardar' })
```

## 5. Iconos

Los componentes que aceptan `icon` reciben un componente (`icon={Save}`), no un elemento (`icon={<Save />}`). Grado usa la línea de **Lucide** (`lucide-react` o `lucide-vue-next`), que instala la app.

## 6. Idioma

Los textos internos (cerrar, paginación, errores…) vienen en español. Para alemán o inglés:

```tsx
// React
import { GradoProvider } from '@1k5-tech-es/grado-react'
import de from '@1k5-tech-es/grado/messages/de'
;<GradoProvider locale="de-DE" messages={de}>
  <App />
</GradoProvider>
```

```ts
// Vue
import { Grado } from '@1k5-tech-es/grado-vue'
import de from '@1k5-tech-es/grado/messages/de'
createApp(App).use(Grado, { locale: 'de-DE', messages: de }).mount('#app')
```

Importa siempre los mensajes desde `@1k5-tech-es/grado/messages/de` o `/en`: dejarán de venir incluidos en la 1.0.

## 7. Next.js

Con el App Router se pueden importar desde un Server Component: los componentes con estado ya llevan `'use client'`.

## 8. HTML sin framework: Web Components

`@1k5-tech-es/grado-elements` trae `k5-combobox`, `k5-dialog`, `k5-tabs`, `k5-menu` y `k5-toaster` (con `toast()`). Generan el mismo HTML que React y Vue y no usan shadow DOM, así que `grado.css` se aplica igual. Para lo demás (botones, campos, tablas, badges) se usan las clases `k5-…` directamente sobre el HTML.

```html
<button data-k5-open="nota" class="k5-btn k5-btn--primary">Nueva nota</button>
<k5-dialog id="nota" label="Nueva nota">
  <p>Contenido</p>
  <div slot="footer"><button class="k5-btn k5-btn--primary">Guardar</button></div>
</k5-dialog>
```

La sintaxis completa y los eventos están en `node_modules/@1k5-tech-es/grado-elements/README.md`. Los textos salen del `lang` de la página.

## 9. Trampas conocidas (0.7.0)

- **`Dialog` deja su contenido montado aunque esté cerrado.** Si dentro hay algo pesado (un editor, un formulario con peticiones), móntalo solo cuando esté abierto: `{open && <Contenido />}` o `v-if="open"`.
- **`DropdownMenu` solo acepta `items` (`id`, `label`, `disabled`, `danger`, `separator`) y `onAction(id)`.** No tiene disparador propio, iconos, opciones marcadas ni contenido libre. Para eso, haz un menú propio con las clases `k5-menu__…`.
- **`ContextMenu` puede cambiar sus opciones según lo que haya bajo el puntero.** El `onContextMenu` (`@contextmenu`) de un hijo se ejecuta antes de que se abra el menú: prepara `items` ahí. Si el hijo llama a `event.stopPropagation()`, el menú no se abre. No hace falta un menú propio para un lienzo o un plano.
- **`Popover` no se abre en la capa superior** (*top layer*): dentro de un contenedor con `overflow: hidden` puede quedar recortado.
- **Botón destructivo:** existen `variant="danger"` y `variant="destructive"`; las dos se mantienen.
- **Tailwind 4:** sin `layer(components)` en el import de `grado.css`, las utilidades de Tailwind no pueden sobrescribir los componentes.
- **`labs`** puede cambiar entre versiones menores sin periodo de aviso.
