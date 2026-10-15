# @1k5/grado

Tokens de diseño de 1KOMMA5° España: colores de marca, tipografía, radios, sombras y alturas de control. Funcionan con React, Vue, Tailwind 3, Tailwind 4 o CSS sin framework.

> Versión 0.2.0. Todavía no está publicado en ningún registro. Mientras tanto se instala desde la carpeta o con los `.tgz` de la web. Cambios: [CHANGELOG.md](../../CHANGELOG.md).

## Qué archivo usar

| Tu app usa | Importa | Ejemplo |
|---|---|---|
| Tailwind 3 + shadcn-vue (1komma5es_help, Sales Coach) | `tokens-hsl.css` y `tailwind-preset` | `hsl(var(--primary))`, `bg-primary/10` |
| Tailwind 4 + shadcn (Kompilot, IRVE, Memorias) | `tailwind.css` | `var(--primary)`, `bg-primary/10` |
| CSS sin Tailwind (OfferTool, páginas sueltas) | `tokens.css` | `var(--k5-primary)` |
| JavaScript: gráficos, React Native, correos | `@1k5/grado/tokens` | `themes.consola.light.color.primary` |
| Figma con Tokens Studio | `@1k5/grado/tokens.dtcg.json` | Formato W3C: un conjunto global y uno por tema y modo |

Y, en cualquier caso, `@1k5/grado/fonts.css` para la fuente Barlow (ver [Fuente](#fuente)).

Los dos CSS declaran las mismas variables. La única diferencia está en los nombres de shadcn (`--primary`, `--background`…): en `tokens-hsl.css` son tripletes HSL (`278.5 91.8% 28.6%`), como espera Tailwind 3, y en `tokens.css` son colores completos (`#5C068C`). Las variables `--k5-*` son siempre colores completos en los dos archivos.

## Instalación

Mientras no esté publicado, desde la carpeta del repositorio:

```bash
npm i "/ruta/a/1KOMMA5 System Design/packages/grado"
```

## Tailwind 3 (Vue)

`src/assets/index.css`: el import sustituye a los bloques `:root` y `.dark` que tenía la app.

```css
@import '@1k5/grado/tokens-hsl.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

`tailwind.config.js`:

```js
import animate from 'tailwindcss-animate'
import grado from '@1k5/grado/tailwind-preset'

export default {
  presets: [grado],
  content: ['./src/**/*.{ts,tsx,vue}'],
  plugins: [animate],
}
```

El preset trae los colores, `darkMode: ['class']`, los radios (`rounded-sm/md/lg`), las sombras (`shadow-overlay`, `shadow-popover`), la fuente (Barlow), `text-2xs` (11 px), las alturas `h-control-sm`, `h-control` y `h-control-lg`, las duraciones `duration-fast` a `duration-slower`, las curvas `ease-standard` y `ease-emphasized`, las capas `z-overlay` a `z-skip-link` y las animaciones de acordeón de shadcn.

## Tailwind 4 (React)

`src/app/styles.css`: el import sustituye a los bloques `:root`, `.dark`, `@theme inline` y `@custom-variant dark` que tenía la app.

```css
@import 'tailwindcss';
@import '@1k5/grado/tailwind.css';
```

Los componentes de shadcn siguen funcionando sin cambios, porque leen las mismas variables.

## CSS sin framework

```html
<link rel="stylesheet" href="/vendor/grado/tokens.css">

<style>
  .boton { background: var(--k5-primary); color: var(--k5-primary-foreground); border-radius: calc(var(--k5-radius) - 2px); height: var(--k5-control-h); }
</style>
```

## Componentes en CSS (`grado.css`)

Botón, badge, campo, interruptor, tarjeta, tabla, indicadores, cabecera de página, estado vacío y spinner, en CSS normal con clases `k5-*`. Lo usan `@1k5/grado-react` y `@1k5/grado-vue`, y sirve igual en una página hecha a mano:

```html
<button class="k5-btn k5-btn--primary">Generar oferta</button>
<span class="k5-badge k5-badge--success">Firmada</span>

<div class="k5-field">
  <label class="k5-field__label" for="kwp">Potencia instalada</label>
  <div class="k5-input-wrap"><input class="k5-input" id="kwp" value="8,4"><span class="k5-input-wrap__affix">kWp</span></div>
</div>
```

Dónde importarlo:

- **Tailwind 3:** `@import '@1k5/grado/grado.css';` antes de `@tailwind base`. Las utilidades quedan después y pueden sobrescribir a los componentes.
- **Tailwind 4:** `@import '@1k5/grado/grado.css' layer(components);` después de `tailwind.css`.
- **Sin Tailwind:** `<link rel="stylesheet">` después de `tokens.css`.

Las clases para cada combinación de props salen de `@1k5/grado/classes` (`buttonClass({ variant: 'secondary' })`, `badgeClass({ tone: 'success' })`…). Úsalo para dar aspecto de botón a un enlace o para otro framework.

### Texto sobre fondos tintados

Los badges, el botón de borrar y las variaciones de KPI ponen texto de color sobre un tinte del mismo color. Para eso existen `--k5-primary-text`, `--k5-success-text`, `--k5-warning-text`, `--k5-destructive-text` y `--k5-info-text`. El build los calcula en cada tema: mezcla el color con el texto principal hasta llegar a 4,5 : 1 sobre su tinte al 10 %.

### Otras versiones de grado.css

| Archivo | Para qué |
|---|---|
| `grado.min.css` | El mismo CSS minificado, para servirlo sin bundler. |
| `grado.layer.css` | Dentro de `@layer components`: el CSS de tu app sin capa gana siempre. Útil en HTML sin bundler. |
| `css/<componente>.css` | Un archivo por componente (`css/button.css`, `css/calendar.css`…). Todos necesitan `tokens.css` y `css/base.css`. |

## Fuente

Barlow es la fuente de marca y la primera de `--k5-font-sans`. Viene en el paquete (400, 500, 600 y 700; latín y latín extendido) con licencia SIL Open Font License 1.1 (`assets/fonts/OFL.txt`):

```css
@import '@1k5/grado/fonts.css';
```

Con bundler, impórtalo una vez junto a los tokens. Sin bundler, copia `dist/` y `assets/fonts/` manteniendo la estructura. Si tu app ya carga Barlow por su cuenta, no hace falta.

## Idiomas

`@1k5/grado/messages` tiene los textos de los componentes en `es-ES` (por defecto), `de-DE` y `en-GB`, más `messagesFor(locale, overrides)` y `formatMessage()`. Los componentes los leen de `GradoProvider` (React) o del plugin `Grado` (Vue).

## Modo oscuro

Pon la clase `dark` o el atributo `data-theme="dark"` en `<html>`. Es lo que ya hacen 1komma5es_help (clase `dark`) y `next-themes` en las apps de React.

## Temas

| Tema | Cómo se activa | Para qué |
|---|---|---|
| `consola` | Por defecto | Herramientas internas. Es 1komma5es_help con los colores oficiales. |
| `marca` | `data-k5-theme="marca"` en `<html>` o en cualquier contenedor | Lo que ve el cliente: portal, widget, ofertas. Barra lateral berenjena, fondo lila claro, radios y controles más grandes, anillo menta en la sección activa (`--sidebar-primary`). |

Los dos temas tienen exactamente los mismos tokens, así que una pantalla funciona igual en los dos.

## Tokens

Abre `dist/preview.html` en el navegador para verlos todos, con tema y modo intercambiables y el contraste de cada combinación.

- **Marca y neutros:** `--k5-aubergine`, `--k5-mint`, `--k5-fuchsia` con sus tonos `-75`, `-50`, `-25` y `-10`; `--k5-graphite` con `-75`, `-50`, `-25` y `-10`; `--k5-white` y `--k5-black`.
- **Semánticos:** los de shadcn (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `sidebar-*`, `chart-1` a `chart-5`) y los que usa 1komma5es_help (`success`, `warning`, `warning-strong`, `info`, `header`, `brand-pink`).
- **Tipografía:** `--k5-font-sans` (Barlow y la fuente del sistema de respaldo) y `--k5-font-mono`, tamaños `--k5-text-badge` (11 px) a `--k5-text-title` (24 px), pesos y `--k5-tracking-title`.
- **Espaciado:** escala de 4 px, `--k5-space-0-5` (2 px) a `--k5-space-16` (64 px). `space-4` = 1rem.
- **Movimiento:** `--k5-duration-fast` (100 ms), `-base` (150 ms), `-slow` (200 ms), `-slower` (300 ms); `--k5-ease-standard`, `--k5-ease-out`, `--k5-ease-emphasized`. Con `prefers-reduced-motion` las duraciones valen 0.
- **Capas:** `--k5-z-overlay` (40), `-drawer` (50), `-dropdown` (60), `-tooltip` (70), `-toast` (80), `-skip-link` (90). Los diálogos usan `<dialog>` nativo y no necesitan `z-index`.
- **Puntos de corte:** `--k5-breakpoint-sm` (600 px) y `-md` (768 px). Los media queries no aceptan variables: úsalos como referencia o en JS.
- **Forma:** `--radius`, `--k5-radius-panel` (tarjetas y tablas), `--k5-radius-badge`, `--k5-control-h-sm`, `--k5-control-h`, `--k5-control-h-lg`, `--shadow-overlay`, `--shadow-popover`.

Uso de los colores de marca en pantalla:

- **Aubergine:** acción principal, cabecera, logo y estado activo. Lleva texto blanco encima.
- **Mint:** avatar, indicador activo, selección y gráficos. Lleva texto grafito encima y nunca se usa como texto sobre blanco (1,8 : 1).
- **Fuchsia:** novedades, contadores y destacados. Lleva texto grafito encima y nunca se usa como texto sobre blanco (2,6 : 1).

## Logos

- `@1k5/grado/assets/logo-1k5.svg`: berenjena con el anillo menta, para fondos claros.
- `@1k5/grado/assets/logo-1k5-white.svg`: blanco con el anillo menta, para la cabecera.
- `@1k5/grado/assets/signet-1k5.svg`: el signet cuadrado, para favicon y avatares.
