# Estilos, temas y tokens

## 1. Conectar los estilos

Importa los estilos **una sola vez**, en el CSS global de la app. Elige el caso según el Tailwind que use.

### Tailwind 4

```css
@import 'tailwindcss';
@import '@1k5-tech-es/grado/fonts.css';
@import '@1k5-tech-es/grado/tailwind.css';
@import '@1k5-tech-es/grado/grado.css' layer(components);
```

`layer(components)` es importante: sin él, las utilidades de Tailwind (`className="w-full"`) no pueden ajustar los componentes.

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
import grado from '@1k5-tech-es/grado/tailwind-preset'

export default {
  presets: [grado],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,vue}'],
  // conserva los plugins que ya use la app
}
```

### Sin Tailwind

```js
import '@1k5-tech-es/grado/fonts.css'
import '@1k5-tech-es/grado/tokens.css'
import '@1k5-tech-es/grado/grado.css'
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

### HTML de servidor sin bundler (PHP, Twig)

Copia los CSS de `@1k5-tech-es/grado` y `dist/grado-elements.min.js` a una carpeta pública y enlázalos:

```html
<link rel="stylesheet" href="/vendor/grado/fonts.css" />
<link rel="stylesheet" href="/vendor/grado/tokens.css" />
<link rel="stylesheet" href="/vendor/grado/grado.css" />
<script type="module" src="/vendor/grado-elements.min.js"></script>
```

### Reglas

- `tokens-hsl.css` (Tailwind 3) **o** `tokens.css` (el resto). Nunca los dos: definen las mismas variables en formatos distintos.
- Si la app ya carga Inter, no importes `fonts.css`.
- Borra las definiciones antiguas de variables equivalentes (`--primary`, `--background`… de shadcn u otros) para que no pisen las de Grado.
- Si la app usa componentes de `labs`, importa también `@1k5-tech-es/grado/labs.css` después de `grado.css`.
- Otras variantes: `grado.min.css` (sin bundler), `grado.layer.css` (todo dentro de `@layer components`) y `css/<componente>.css` (uno a uno; todos necesitan `tokens.css` y `css/base.css`).

## 2. Temas y modo oscuro

```html
<html lang="es">                                      <!-- Consola, claro -->
<html lang="es" data-k5-theme="marca" class="dark">  <!-- Marca, oscuro -->
```

- **Consola** es el tema por defecto, para herramientas internas. **Marca**, para lo que ve el cliente. **Campo**, para técnicos al sol.
- El modo oscuro va con la clase `dark` o con `data-theme="dark"`.
- **Campo** necesita además importar `@1k5-tech-es/grado/themes/campo.css` (`themes/campo-hsl.css` con Tailwind 3) después de los tokens, y `data-k5-theme="campo"`.
- El tema se puede poner en un contenedor, no solo en `<html>`.
- `useTheme` y `ThemeToggle` (en `labs`) guardan la preferencia del usuario.

Si no está claro qué tema le toca a la app, pregunta: es una decisión de producto.

## 3. Estilos propios

Cuando algo no existe en Grado, constrúyelo con **tokens semánticos** para que responda al tema y al modo:

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
- Para gráficos propios en JS, o en React Native: `import { themes } from '@1k5-tech-es/grado/tokens'`.
- No escribas colores en hexadecimal: todos los pares de Grado pasan el contraste AA (4,5 : 1) en todos los temas, y un hexadecimal suelto no.
- Para dar a otro elemento el aspecto de un componente (un `<a>` o el `Link` del router con aspecto de botón), usa las funciones de clases: `buttonClass()`, `badgeClass()`… y `cx()` para unir clases.
- La lista completa de tokens está en `node_modules/@1k5-tech-es/grado/src/tokens.json`.

### Principios visuales de Grado

Si construyes una pieza propia, que no desentone:

- Un solo acento por vista.
- Borde o fondo, nunca los dos.
- Jerarquía por tamaño y peso, no por color.
- El estado, con punto y texto, no solo con color.
