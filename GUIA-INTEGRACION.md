# Integrar Grado en una app: guía para agentes de código

Esta guía es para el agente (Claude Code u otro) que trabaja en una app de 1KOMMA5° España y tiene que usar **Grado**, el sistema de diseño de la empresa. Si eres una persona, también te sirve; los pasos que solo puede hacer una persona están marcados con **👤**.

Versión actual: **0.9.0**. Hasta la 1.0, una versión menor (0.7 → 0.8) puede cambiar una API o el aspecto: lee el `CHANGELOG.md` antes de actualizar.

> **Con Claude Code, mejor la skill.** Este repositorio publica un plugin con la skill `grado`, que lleva esta guía partida por temas y Claude carga sola cuando la tarea toca Grado. Dentro de la app:
>
> ```
> /plugin marketplace add 1K5-TECH-ES/grado-system-design
> /plugin install grado@grado
> ```
>
> Para que todo el equipo la tenga, en el `.claude/settings.json` de la app:
>
> ```json
> {
>   "extraKnownMarketplaces": {
>     "grado": { "source": { "source": "github", "repo": "1K5-TECH-ES/grado-system-design" } }
>   },
>   "enabledPlugins": { "grado@grado": true }
> }
> ```

---

## 1. Qué es Grado

Cuatro paquetes npm públicos, en GitHub Packages, con el ámbito `@1k5-tech-es`:

| Paquete | Para qué |
|---|---|
| `@1k5-tech-es/grado` | Base: tokens (CSS y JS), `grado.css`, preset de Tailwind, fuente Inter, logos, textos (es/de/en) y la CLI `grado` (`migrate`, `usage`). **Siempre hace falta.** |
| `@1k5-tech-es/grado-react` | Componentes React 18+ |
| `@1k5-tech-es/grado-vue` | Los mismos componentes en Vue 3.5+, con las mismas props y el mismo HTML |
| `@1k5-tech-es/grado-elements` | Web Components (`k5-combobox`, `k5-dialog`, `k5-tabs`, `k5-menu`, `k5-toaster`) para HTML sin framework: PHP, Twig, páginas estáticas |

Grado aporta presentación y componentes. El router, los datos, el estado y la lógica siguen siendo de la app.

Tres temas sobre los mismos tokens: **Consola** (por defecto, herramientas internas), **Marca** (lo que ve el cliente) y **Campo** (alto contraste 7 : 1 y controles de 44 px, para técnicos al sol). Cada uno con modo claro y oscuro.

Requisitos: Node.js 22 o superior. Tailwind es opcional (3 o 4).

---

## 2. Acceso: el token de GitHub

Los paquetes son públicos, pero el registro npm de GitHub Packages pide un token incluso para descargar paquetes públicos. Vale cualquier cuenta de GitHub: no hace falta pertenecer a la organización `1K5-TECH-ES`.

### 2.1 Crear el token (👤, una vez por persona)

1. GitHub → **Settings → Developer settings → Personal access tokens → Tokens (classic)** → *Generate new token (classic)*.
2. Marca **solo** `read:packages`. No hace falta `repo` ni `write:packages`.
3. Tiene que ser **classic**: GitHub Packages todavía no acepta tokens granulares (*fine-grained*) para npm.
4. Guárdalo en el perfil de la shell, fuera de cualquier repositorio:

```bash
# ~/.bashrc o ~/.zshrc
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

Abre una terminal nueva (o reinicia VS Code) para que la variable exista en los procesos que lanzan `npm`.

### 2.2 Reglas para el agente sobre el token

- **Nunca** escribas el token en un archivo del repositorio, en un commit, en un log ni en la respuesta al usuario. El `.npmrc` solo lo **referencia** como `${GITHUB_TOKEN}`.
- **Nunca** pidas al usuario que pegue el token en el chat. Si falta, dile que lo cree (pasos de 2.1) y lo exporte él mismo.
- Para comprobar que existe sin mostrarlo: `test -n "$GITHUB_TOKEN" && echo "GITHUB_TOKEN definido" || echo "falta GITHUB_TOKEN"`.
- Si el usuario ya pegó un token en el chat o lo subió a un repo, recomiéndale revocarlo y crear otro.

### 2.3 Decirle a npm dónde está Grado

Crea este `.npmrc` en la raíz de la app (junto a su `package.json`) y **súbelo al repositorio**: no contiene ningún secreto.

```ini
@1k5-tech-es:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

En un monorepo, el `.npmrc` va en la carpeta donde se ejecuta `npm install`/`npm ci`.

### 2.4 Instalar

```bash
# React
npm install @1k5-tech-es/grado @1k5-tech-es/grado-react
# Vue
npm install @1k5-tech-es/grado @1k5-tech-es/grado-vue
```

Instala **siempre** el paquete base y el del framework en la **misma versión**.

### 2.5 Si la instalación falla

| Error | Causa probable | Qué hacer |
|---|---|---|
| `E404 Not Found … @1k5-tech-es/grado` en `registry.npmjs.org` | npm no ve el `.npmrc` | Comprueba que está en la carpeta donde ejecutas npm y que la primera línea es exacta |
| `E401 Unauthorized` | `GITHUB_TOKEN` vacío en esa shell, o token caducado | `test -n "$GITHUB_TOKEN"`; abre una terminal nueva; si sigue, el usuario crea otro token |
| `E403 Forbidden` | Token sin `read:packages` | El usuario revisa el token (2.1) |
| Funciona en local y falla en CI/Docker | El entorno de build no tiene el token | Sección 6 |

### 2.6 Sin token

La web de documentación de Grado ofrece los `.tgz` para descargar. Guárdalos en `vendor/` de la app, súbelos al repo e instala con:

```bash
npm install ./vendor/1k5-tech-es-grado-0.9.0.tgz ./vendor/1k5-tech-es-grado-react-0.9.0.tgz
```

Es un plan B: con token, usa siempre npm.

---

## 3. Bajarse el repositorio de Grado (recomendado para agentes)

Con el paquete instalado ya tienes los tipos en `node_modules/@1k5-tech-es/*/dist/*.d.ts`. Pero si clonas el repositorio al lado de la app, el agente tiene mucho más contexto: el código de cada componente, los tests, la documentación de la API y los ejemplos.

```bash
cd ~/workspace        # o donde tengas los proyectos
git clone https://github.com/1K5-TECH-ES/grado-system-design.git
cd grado-system-design
npm install           # usa el mismo .npmrc/token que arriba
npm run build         # genera dist/ de los cuatro paquetes y el catálogo
```

Para que Claude Code pueda leerlo desde la sesión de tu app, añádelo como directorio de trabajo adicional: `claude --add-dir ../grado-system-design`, o `/add-dir ../grado-system-design` dentro de la sesión.

**Úsalo como referencia, no como dependencia**: la app sigue instalando Grado desde npm. No edites el repositorio de Grado desde la tarea de otra app; si falta algo en Grado, anótalo y avisa a quien lo mantiene (sección 9).

### Dónde mirar en el repositorio

| Necesito… | Mira |
|---|---|
| Las props exactas de un componente | `api/grado-react.api.md` o `api/grado-vue.api.md` (generados, siempre al día). En Vue también lista los `emits` |
| Formularios con react-hook-form / VeeValidate | `api/grado-react-react-hook-form.api.md`, `api/grado-vue-vee-validate.api.md` |
| Componentes experimentales (`labs`) | `api/grado-react-labs.api.md`, `api/grado-vue-labs.api.md` |
| Tipos compartidos (`ButtonVariant`, `MenuItem`, `ToastOptions`…) | `api/grado.api.md` |
| Cómo está hecho un componente | `packages/grado-react/src/<Componente>.tsx`, `packages/grado-vue/src/<Componente>.ts` |
| Clases CSS `k5-…` de cada componente | `packages/grado/src/css/<componente>.css` y `packages/grado/src/classes.js` |
| Tokens (colores, espaciado, radios…) | `packages/grado/src/tokens.json` (fuente única) |
| Verlos todos funcionando | `catalog/index.html` en el navegador (`?tema=marca&modo=dark`); armazón en `catalog/app.html` |
| Qué cambió entre versiones | `CHANGELOG.md`, sección «Al actualizar» de cada versión |
| Documentación completa con ejemplos | `npm run docs:build && npm run docs:serve` |

---

## 4. Conectar los estilos

Importa los estilos **una sola vez**, en el CSS global de la app. Elige el caso.

### Tailwind 4

```css
@import 'tailwindcss';
@import '@1k5-tech-es/grado/fonts.css';
@import '@1k5-tech-es/grado/tailwind.css';
@import '@1k5-tech-es/grado/grado.css' layer(components);
```

`layer(components)` es importante: así las utilidades de Tailwind (`className="w-full"`) pueden ajustar los componentes.

### Tailwind 3

```css
@import '@1k5-tech-es/grado/fonts.css';
@import '@1k5-tech-es/grado/tokens-hsl.css';
@import '@1k5-tech-es/grado/grado.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

```js
// tailwind.config.js
import grado from '@1k5-tech-es/grado/tailwind-preset';

export default {
  presets: [grado],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,vue}'],
  // conserva los plugins que ya use la app
};
```

### Sin Tailwind

```js
import '@1k5-tech-es/grado/fonts.css';
import '@1k5-tech-es/grado/tokens.css';
import '@1k5-tech-es/grado/grado.css';
```

```css
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--k5-font-sans);
  font-size: var(--k5-text-body);
  background: var(--k5-background);
  color: var(--k5-foreground);
}
```

### Reglas

- `tokens-hsl.css` (Tailwind 3) **o** `tokens.css` (resto). **Nunca los dos.**
- Si la app ya carga Inter, no importes `fonts.css`.
- Borra las definiciones antiguas de variables equivalentes (`--primary`, `--background`… de shadcn u otros) para que no pisen las de Grado.
- Otras variantes: `grado.min.css` (sin bundler), `grado.layer.css` (todo dentro de `@layer components`), `css/<componente>.css` (uno a uno; todos necesitan `tokens.css` y `css/base.css`).

---

## 5. Usar los componentes

### 5.1 Primer componente

React:

```tsx
import { Button, Field, Input } from '@1k5-tech-es/grado-react';

export function FormInstalacion() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Field label="Potencia instalada" required>
        <Input suffix="kWp" inputMode="decimal" />
      </Field>
      <Button type="submit">Guardar instalación</Button>
    </form>
  );
}
```

Vue:

```vue
<script setup>
import { ref } from 'vue';
import { Button, Field, Input } from '@1k5-tech-es/grado-vue';
const potencia = ref('8,4');
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

### 5.2 React y Vue: mismas props, distinta forma de escuchar

| React | Vue |
|---|---|
| `value` + `onValueChange` / `onChange` | `v-model` (`modelValue` / `update:modelValue`) |
| `open` + `onOpenChange` (Dialog, Drawer, Sheet…) | `v-model:open` |
| `footer={<…/>}` y otras props que reciben nodos | slot con el mismo nombre: `<template #footer>` |
| `className` | `class` |

Ante la duda, mira `api/grado-vue.api.md`: lista props y `emits` de cada componente.

### 5.3 Qué hay (0.9.0)

- **Armazón:** `AppShell`, `Nav`, `NavSection`, `NavGroup`, `NavItem`, `AppSearch`, `AppLogo`, `Avatar`, `AvatarGroup`, `PageHeader`
- **Maquetación y texto:** `Container`, `Stack`, `Grid`, `Separator`, `Heading`, `Text`, `Link`, `Kbd`
- **Tarjetas:** `Card` (`variant`: `panel`, `alert` o `plain`), `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- **Acciones:** `Button`, `IconButton`, `CopyButton`, `DropdownMenu`, `ContextMenu`, `CommandPalette`, `ActionBar`
- **Formularios:** `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `NumberInput`, `PasswordInput`, `SearchInput`, `Combobox`, `MultiSelect`, `SegmentedControl`, `ToggleGroup`, `DatePicker`, `DateRangePicker`, `TimePicker`, `Calendar`, `FileUpload`
- **Campos españoles:** `NifInput`, `IbanInput`, `PhoneInput`, `AddressInput`
- **Datos:** `Table`, `DataTable` (orden, selección, paginación, datos del servidor con `manual`, selector de columnas, cabecera fija con `maxHeight`, filas virtuales automáticas a partir de 200 filas, CSV), `Pagination`, `FilterBar`, `FilterChip`, `DescriptionList`, `Timeline`, `Stepper`, `Kpi`, `KpiGroup`, `Badge`, `Tag`, `Status`, `Meter`, `Progress`
- **Feedback:** `Alert`, `Banner`, `Toaster` + `toast()`, `EmptyState`, `Skeleton`, `Spinner`
- **Superposiciones:** `Dialog`, `AlertDialog`, `Drawer`, `Sheet`, `Popover`, `Tooltip`, `Accordion`, `Tabs`, `Breadcrumbs`
- **Gráficos:** `LineChart`, `AreaChart`, `BarChart`, `Donut`, `Sparkline`, `Heatmap`
- **Energía:** `EnergyFlow`, `PriceChart` (tarifa 2.0TD), `BatteryLevel` e iconos (`SolarPanelIcon`, `InverterIcon`, `HomeBatteryIcon`, `WallboxIcon`, `HeatPumpIcon`, `ElectricMeterIcon`, `PowerGridIcon`)
- **Formularios con librería:** `@1k5-tech-es/grado-react/react-hook-form` y `@1k5-tech-es/grado-vue/vee-validate` traen `Form`, `FormField` y `ErrorSummary`
- **`labs`** (`…/labs`, la API puede cambiar sin aviso): `TariffComparison`, `SignaturePad`, `SolarForecast`, `Amount` + `formatEuro`/`formatEnergy`/`formatPower`, `RelativeTime`, `useTheme` + `ThemeToggle`, `ScrollArea`, `useHotkey`, `VisuallyHidden`. Necesitan además `@import '@1k5-tech-es/grado/labs.css'` después de `grado.css`

Funciones útiles: `buttonClass()`, `badgeClass()`… dan las clases de un componente para aplicarlas a otro elemento (por ejemplo, un `<a>` o el `Link` del router con aspecto de botón). `cx()` une clases.

### 5.4 Avisos (`toast`)

Pon `<Toaster />` **una vez** en la raíz de la app y llama a `toast()` desde cualquier sitio:

```ts
import { toast } from '@1k5-tech-es/grado-react'; // o grado-vue

toast.success('Oferta guardada');
toast.error('No se pudo enviar', { description: 'Revisa la conexión' });
await toast.promise(guardar(), { loading: 'Guardando…', success: 'Guardado', error: 'Error al guardar' });
```

### 5.5 Iconos

Los componentes que aceptan `icon` reciben un componente (`icon={Save}`), no un elemento. Grado usa la línea de **Lucide** (`lucide-react` / `lucide-vue-next`), que instala la app.

### 5.6 Temas y modo oscuro

```html
<html lang="es">                                      <!-- Consola, claro -->
<html lang="es" data-k5-theme="marca" class="dark">  <!-- Marca, oscuro -->
```

- El modo oscuro va con la clase `dark` o con `data-theme="dark"`.
- **Campo** necesita además importar `@1k5-tech-es/grado/themes/campo.css` (`themes/campo-hsl.css` con Tailwind 3) después de los tokens, y `data-k5-theme="campo"`.
- El tema se puede poner en un contenedor, no solo en `<html>`.
- `useTheme` + `ThemeToggle` (en `labs`) guardan la preferencia del usuario.

### 5.7 Idioma

Los textos internos (cerrar, paginación, errores…) vienen en español. Para alemán o inglés:

```tsx
// React
import { GradoProvider } from '@1k5-tech-es/grado-react';
import de from '@1k5-tech-es/grado/messages/de';
<GradoProvider locale="de-DE" messages={de}><App /></GradoProvider>
```

```ts
// Vue
import { Grado } from '@1k5-tech-es/grado-vue';
import de from '@1k5-tech-es/grado/messages/de';
createApp(App).use(Grado, { locale: 'de-DE', messages: de }).mount('#app');
```

### 5.8 Estilos propios

Cuando algo no existe en Grado, construye con **tokens semánticos** para que responda al tema y al modo:

```css
.mi-panel {
  background: var(--k5-card);
  color: var(--k5-card-foreground);
  border: 1px solid var(--k5-border);
  border-radius: var(--k5-radius-panel);
}
```

- Usa los semánticos (`--k5-primary`, `--k5-muted-foreground`…), que cambian con el tema. Los de marca (`--k5-mint`, `--k5-aubergine`…) son constantes: solo para ilustraciones o marca.
- Con Tailwind, el preset expone los mismos tokens como utilidades (`bg-primary`, `text-muted-foreground`…).
- Para gráficos propios en JS: `import { themes } from '@1k5-tech-es/grado/tokens'`.
- No escribas colores en hexadecimal: todos los pares de Grado pasan el contraste AA (4,5 : 1) en todos los temas, y un hexadecimal suelto no.

### 5.9 Next.js

Con el App Router se pueden importar desde un Server Component: los componentes con estado ya llevan `'use client'`.

---

## 6. CI y despliegues

El entorno que ejecuta `npm ci` también necesita el token.

### GitHub Actions

Como los paquetes son públicos, basta el `GITHUB_TOKEN` del propio workflow. En el workflow:

```yaml
permissions:
  contents: read
  packages: read

steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: 22
  - run: npm ci
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Docker

Pasa el token como **secreto de BuildKit**, nunca como `ARG` ni `ENV` (quedaría en las capas de la imagen y en `docker history`):

```dockerfile
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=secret,id=gh,env=GITHUB_TOKEN,required=true npm ci
```

```yaml
# docker-compose.yml
services:
  web:
    build:
      context: .
      secrets: [gh]
secrets:
  gh:
    environment: GITHUB_TOKEN
```

O sin compose: `docker build --secret id=gh,env=GITHUB_TOKEN .`

### Vercel, Netlify y otros

Variable de entorno `GITHUB_TOKEN` con un token classic `read:packages`, mejor de una cuenta de servicio que de una persona.

---

## 7. Migrar una app que ya tiene su propia UI

Orden que ha funcionado en Memorias y NeuroHelp:

1. **Inventario.** Lista qué librerías de UI usa la app (shadcn, Radix, reka-ui, Headless UI, sonner, cva, clsx, tailwind-merge…) y qué componentes propios las envuelven.
2. **Tokens y estilos** (sección 4). Borra las variables antiguas equivalentes.
3. **Armazón:** `AppShell` y la navegación, si encajan.
4. **Piezas repetidas**, pantalla a pantalla: botones, campos, tarjetas, tablas, diálogos, avisos.
5. **Quita las dependencias** que ya no se usen.
6. **Comprueba:** móvil, teclado (Tab, Escape, flechas), modo oscuro, validaciones, estados de carga y vacíos. Mejor con capturas antes/después.

Herramientas:

```bash
npx @1k5-tech-es/grado usage            # qué componentes, props, clases k5- y tokens usa la app (no cambia nada)
npx @1k5-tech-es/grado usage --json     # inventario completo
npx @1k5-tech-es/grado migrate --dry    # cambios mecánicos al actualizar de versión, sin escribir
npx @1k5-tech-es/grado migrate          # los aplica; avisa con archivo:línea de lo que pide una decisión
```

Si algo de la app no tiene equivalente en Grado, constrúyelo sobre las clases `k5-…` y los tokens (sección 5.8) en vez de traer otra librería.

---

## 8. Cosas que hay que saber (0.9.0)

- **`Dialog` deja su contenido montado aunque esté cerrado.** Si dentro hay algo pesado (un editor, un formulario con peticiones), móntalo solo cuando esté abierto: `{open && <Contenido />}` / `v-if="open"`.
- **`DropdownMenu` solo acepta `items` (`id`, `label`, `disabled`, `danger`, `separator`) y `onAction(id)`:** no hay disparador propio, iconos, opciones marcadas ni contenido libre. Para eso, construye un menú propio con las clases `k5-menu__…`.
- **`ContextMenu` puede cambiar sus opciones según lo que haya bajo el puntero.** El `onContextMenu` (`@contextmenu`) de un hijo se ejecuta antes de que se abra el menú: prepara `items` ahí. Si el hijo llama a `event.stopPropagation()`, el menú no se abre. No hace falta un menú propio para un lienzo o un plano.
- **`Popover` no se abre en la capa superior** (*top layer*): dentro de un contenedor con `overflow: hidden` puede quedar recortado.
- **Botón destructivo:** existen `variant="danger"` y `variant="destructive"`; las dos se mantienen.
- **`labs`** puede cambiar entre versiones menores sin periodo de aviso.
- **Tailwind 4:** sin `layer(components)` en el import de `grado.css`, las utilidades de Tailwind no podrán sobrescribir los componentes.
- Los textos en alemán e inglés dejarán de venir incluidos en la 1.0; importa siempre desde `@1k5-tech-es/grado/messages/de|en`.

---

## 9. Si falta algo en Grado

No hagas un parche dentro de `node_modules` ni copies el componente de Grado a la app para modificarlo. En su lugar:

1. Resuélvelo en la app con una pieza propia sobre clases y tokens de Grado, en un archivo aparte (por ejemplo `AppMenu`), para poder cambiarlo por el componente oficial cuando exista.
2. Anota qué faltaba (componente, prop, caso de uso) y díselo al usuario para que lo comunique a quien mantiene Grado, o abre una issue en `1K5-TECH-ES/grado-system-design`.

---

## 10. Lista de comprobación para el agente

- [ ] `GITHUB_TOKEN` definido (sin mostrarlo) y `.npmrc` en la raíz de la app
- [ ] `@1k5-tech-es/grado` y `@1k5-tech-es/grado-react`/`-vue` instalados en la misma versión
- [ ] Estilos importados una sola vez, con la variante correcta para su Tailwind; no conviven `tokens.css` y `tokens-hsl.css`
- [ ] `<Toaster />` en la raíz si se usa `toast()`
- [ ] Tema (`data-k5-theme`) y modo oscuro decididos
- [ ] Sin colores hexadecimales nuevos: tokens semánticos
- [ ] CI y Docker con el token como secreto, nunca en el código
- [ ] La app compila y se ha revisado en móvil, teclado y modo oscuro
