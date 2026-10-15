import { createElement as h } from 'react'
import * as G from '@1k5/grado-react'
import { icons } from '../icons.mjs'
import { installToc } from '../routes.mjs'
import { rich } from '../text.mjs'
import { CodeBlock, FrameworkCode, FrameworkSwitch, LinkButton, Page, TextLink, version } from '../ui.mjs'

const P = (text) => h(G.Text, null, rich(text))

/** Un paso de la guía: tarjeta con «Paso n» y su título. */
const Step = ({ id, number, title, children }) =>
  h(
    'section',
    { id, className: 'docs-step', 'aria-labelledby': `${id}-titulo` },
    h(
      G.Card,
      null,
      h(
        G.CardHeader,
        null,
        number ? h(G.Badge, { tone: 'brand' }, `Paso ${number}`) : null,
        h(G.CardTitle, { as: 'h2', id: `${id}-titulo` }, title),
      ),
      h(G.CardContent, { className: 'docs-step__body' }, children),
    ),
  )

const packages = [
  ['grado', 'Tokens, CSS y recursos de marca'],
  ['grado-react', 'Componentes para React 18+'],
  ['grado-vue', 'Componentes para Vue 3.5+'],
]
const downloads = h(
  G.Table,
  { caption: 'Paquetes descargables', compact: true },
  h(
    'thead',
    null,
    h(
      'tr',
      null,
      h('th', { scope: 'col' }, 'Paquete'),
      h('th', { scope: 'col' }, 'Contenido'),
      h('th', { scope: 'col' }, 'Versión'),
      h('th', { scope: 'col' }, h('span', { className: 'k5-sr-only' }, 'Descarga')),
    ),
  ),
  h(
    'tbody',
    null,
    packages.map(([name, text]) =>
      h(
        'tr',
        { key: name },
        h('th', { scope: 'row' }, h('code', null, `@1k5/${name}`)),
        h('td', null, text),
        h('td', null, h(G.Badge, null, version)),
        h(
          'td',
          { className: 'docs-cell-end' },
          h(
            'a',
            {
              className: G.buttonClass({ variant: 'secondary', size: 'sm' }),
              href: `downloads/1k5-${name}-${version}.tgz`,
              download: true,
            },
            h(icons.installation, { 'aria-hidden': 'true' }),
            'Descargar',
            h('span', { className: 'k5-sr-only' }, ` @1k5/${name}`),
          ),
        ),
      ),
    ),
  ),
)

const tailwind4 = `@import 'tailwindcss';
@import '@1k5/grado/fonts.css';
@import '@1k5/grado/tailwind.css';
@import '@1k5/grado/grado.css' layer(components);`
const tailwind3 = `@import '@1k5/grado/fonts.css';
@import '@1k5/grado/tokens-hsl.css';
@import '@1k5/grado/grado.css';

@tailwind base;
@tailwind components;
@tailwind utilities;`
const tailwind3Config = `import grado from '@1k5/grado/tailwind-preset';

export default {
  presets: [grado],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,vue}'],
  // Conserva los plugins que utilice tu aplicación.
};`
const cssImports = `import '@1k5/grado/fonts.css';
import '@1k5/grado/tokens.css';
import '@1k5/grado/grado.css';`
const cssBase = `*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--k5-font-sans);
  font-size: var(--k5-text-body);
  background: var(--k5-background);
  color: var(--k5-foreground);
}`
const firstReact = `import { Button, Field, Input } from '@1k5/grado-react';

export default function Instalacion() {
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <Field label="Potencia instalada" required>
        <Input suffix="kWp" inputMode="decimal" />
      </Field>
      <Button type="submit">Guardar instalación</Button>
    </form>
  );
}`
const firstVue = `<script setup>
import { ref } from 'vue';
import { Button, Field, Input } from '@1k5/grado-vue';
const potencia = ref('8,4');
</script>

<template>
  <form @submit.prevent>
    <Field label="Potencia instalada" required>
      <Input v-model="potencia" suffix="kWp" inputmode="decimal" />
    </Field>
    <Button type="submit">Guardar instalación</Button>
  </form>
</template>`
const localeReact = `import { GradoProvider } from '@1k5/grado-react';

export default function Raiz() {
  return (
    <GradoProvider locale="de-DE">
      <App />
    </GradoProvider>
  );
}`
const localeVue = `import { createApp } from 'vue';
import { Grado } from '@1k5/grado-vue';
import App from './App.vue';

createApp(App).use(Grado, { locale: 'de-DE' }).mount('#app');`

const themeOptions = [
  ['Consola', 'Herramientas internas', 'sin atributo'],
  ['Marca', 'Lo que ve el cliente', 'data-k5-theme="marca"'],
]
const migration = [
  ['Empieza por los tokens', 'Reemplaza las variables equivalentes y revisa los colores escritos directamente.'],
  ['Unifica la estructura', 'Adopta AppShell y la navegación donde encajen con tu producto.'],
  ['Sustituye las piezas repetidas', 'Botones, campos, tarjetas y tablas, pantalla a pantalla.'],
  ['Comprueba el resultado', 'Móvil, teclado, modo oscuro, validaciones y estados de carga.'],
]

export default function Installation() {
  return h(
    Page,
    {
      title: 'Instalación',
      subtitle:
        'Del primer import a una interfaz compartida. Grado aporta presentación y componentes; tu proyecto conserva el router, los datos y la lógica.',
      actions: h(FrameworkSwitch),
      toc: installToc,
    },
    h(
      G.Stack,
      { gap: '6' },
      h(
        G.Alert,
        {
          tone: 'info',
          role: 'none',
          title: '¿Quieres tus propios colores?',
          action: h(LinkButton, { to: '/personalizar', variant: 'secondary', size: 'sm', icon: icons.customize }, 'Crear mi tema'),
        },
        'Crea tu tema en Personalizar y vuelve con el código de instalación ya preparado.',
      ),
      h(
        Step,
        { id: 'requisitos', number: 1, title: 'Prepara tu proyecto' },
        P(
          'Utiliza React 18 o superior, o Vue 3.5 o superior. Para compilar el repositorio de Grado necesitas Node.js 20 o superior. Tailwind es opcional.',
        ),
        P(
          "Con el App Router de Next.js puedes importar los componentes desde un Server Component: los que tienen estado llevan `'use client'`.",
        ),
      ),
      h(
        Step,
        { id: 'paquetes', number: 2, title: 'Instala los paquetes' },
        P(
          `La versión ${version} aún no está en npm. Descarga el paquete base y el de tu framework, guárdalos en \`vendor/\` dentro de tu aplicación y añádelos al repositorio para que el despliegue también los tenga.`,
        ),
        downloads,
        h(FrameworkCode, {
          react: `npm install ./vendor/1k5-grado-${version}.tgz ./vendor/1k5-grado-react-${version}.tgz`,
          vue: `npm install ./vendor/1k5-grado-${version}.tgz ./vendor/1k5-grado-vue-${version}.tgz`,
          reactLabel: 'Terminal · en tu aplicación',
          vueLabel: 'Terminal · en tu aplicación',
        }),
        h(G.Accordion, {
          items: [
            {
              value: 'repositorio',
              title: 'Trabajar directamente desde el repositorio',
              content: h(
                'div',
                null,
                P(
                  'Ejecuta `npm install` y `npm run build` en el repositorio de Grado. Después instala ambos paquetes desde tu aplicación:',
                ),
                h(CodeBlock, {
                  code: `npm install "/ruta/a/Grado/packages/grado" "/ruta/a/Grado/packages/grado-react"`,
                  label: 'React · sustituye las rutas por las reales',
                }),
                P(
                  'En Vue, sustituye `grado-react` por `grado-vue`. Estas rutas locales deben estar disponibles en el entorno que compila la aplicación.',
                ),
              ),
            },
          ],
        }),
      ),
      h(
        Step,
        { id: 'estilos', number: 3, title: 'Conecta los estilos' },
        P('Importa los estilos una sola vez. Elige la opción que use tu aplicación.'),
        h(G.Tabs, {
          label: 'Configuración de estilos',
          variant: 'pill',
          items: [
            {
              value: 'tailwind4',
              label: 'Tailwind 4',
              content: h(
                'div',
                null,
                h(CodeBlock, { code: tailwind4, label: 'CSS global' }),
                P('La capa `components` permite que las utilidades de Tailwind ajusten los componentes, por ejemplo `className="w-full"`.'),
              ),
            },
            {
              value: 'tailwind3',
              label: 'Tailwind 3',
              content: h(
                'div',
                null,
                h(CodeBlock, { code: tailwind3, label: 'CSS global' }),
                h(CodeBlock, { code: tailwind3Config, label: 'tailwind.config.js' }),
              ),
            },
            {
              value: 'css',
              label: 'CSS sin Tailwind',
              content: h(
                'div',
                null,
                h(CodeBlock, { code: cssImports, label: 'Entrada de tu aplicación con bundler' }),
                h(CodeBlock, { code: cssBase, label: 'CSS global' }),
                P(
                  'En HTML sin bundler, copia las carpetas `dist/` y `assets/fonts/` del paquete base a tu carpeta pública, con esa misma estructura, y carga `dist/fonts.css`, `dist/tokens.css` y `dist/grado.min.css`, en ese orden, con `<link rel="stylesheet">`.',
                ),
                h(CodeBlock, { code: '<button class="k5-btn k5-btn--primary">Guardar cambios</button>', label: 'HTML' }),
              ),
            },
          ],
        }),
        h(
          G.Text,
          { size: 'small', tone: 'muted' },
          rich(
            'Sustituye las definiciones anteriores de los tokens equivalentes. Utiliza `tokens-hsl.css` para Tailwind 3; `tokens.css` para colores completos. No importes ambos.',
          ),
        ),
        h(G.Accordion, {
          items: [
            {
              value: 'versiones-css',
              title: 'Otras versiones de grado.css',
              content: h(G.DescriptionList, {
                items: [
                  { term: 'grado.min.css', mono: true, description: 'El mismo CSS minificado, para servirlo sin bundler.' },
                  {
                    term: 'grado.layer.css',
                    mono: true,
                    description: rich('Dentro de `@layer components`. Tu CSS sin capa gana siempre, sin pelear por especificidad.'),
                  },
                  {
                    term: 'css/button.css…',
                    mono: true,
                    description: rich('Un archivo por componente. Todos necesitan `tokens.css` y `css/base.css`.'),
                  },
                  {
                    term: 'fonts.css',
                    mono: true,
                    description: 'Barlow en 400, 500, 600 y 700. Si tu app ya carga Barlow, no lo importes.',
                  },
                ],
              }),
            },
          ],
        }),
      ),
      h(
        Step,
        { id: 'temas', number: 4, title: 'Elige tu tema' },
        P(
          '**Consola** es el tema por defecto. Activa **Marca** en el documento o en un contenedor. El modo oscuro se controla con la clase `dark` o el atributo `data-theme="dark"`.',
        ),
        h(
          G.Grid,
          { columns: 3 },
          themeOptions.map(([title, use, attribute]) =>
            h(
              G.Card,
              { key: title, variant: 'plain', className: 'docs-option' },
              h(G.Text, { weight: 'semibold' }, title),
              h(G.Text, { size: 'small', tone: 'muted' }, use),
              h('code', null, attribute),
            ),
          ),
          h(
            G.Card,
            { variant: 'plain', className: 'docs-option' },
            h(G.Text, { weight: 'semibold' }, 'Tu tema'),
            h(G.Text, { size: 'small', tone: 'muted' }, 'Tus colores sobre cualquiera de los dos'),
            h(TextLink, { to: '/personalizar' }, 'Crear en Personalizar'),
          ),
        ),
        h(CodeBlock, { code: '<html lang="es" data-k5-theme="marca" class="dark">', label: 'Marca · modo oscuro' }),
        P('Para crear componentes propios, utiliza los tokens semánticos. Así responderán al tema y al modo de color:'),
        h(CodeBlock, {
          code: `.mi-panel {
  background: var(--k5-card);
  color: var(--k5-card-foreground);
  border: 1px solid var(--k5-border);
  border-radius: var(--k5-radius-panel);
}`,
          label: 'CSS',
        }),
        P(
          'Los tokens de marca como `--k5-mint` son constantes. Los semánticos como `--k5-primary` cambian con el tema. Para gráficos también puedes importar `themes` desde `@1k5/grado/tokens`.',
        ),
      ),
      h(
        Step,
        { id: 'primer-componente', number: 5, title: 'Añade tu primer componente' },
        h(
          G.Grid,
          { columns: 2, className: 'docs-first' },
          h(
            'div',
            { className: 'demo-preview' },
            h(
              'form',
              { className: 'live-stack', 'aria-label': 'Ejemplo de formulario', onSubmit: (event) => event.preventDefault() },
              h(
                G.Field,
                { label: 'Potencia instalada', required: true },
                h(G.Input, { suffix: 'kWp', inputMode: 'decimal', defaultValue: '8,4' }),
              ),
              h('div', null, h(G.Button, { type: 'submit' }, 'Guardar instalación')),
            ),
          ),
          h(FrameworkCode, {
            react: firstReact,
            vue: firstVue,
            reactLabel: 'React · ejemplo de presentación',
            vueLabel: 'Vue · ejemplo con v-model',
          }),
        ),
        P('Conecta el envío a la lógica de tu aplicación. Los componentes no realizan peticiones de datos por su cuenta.'),
      ),
      h(
        Step,
        { id: 'idioma', number: 6, title: 'Elige el idioma' },
        P(
          'Sin configurar nada, los textos de los componentes (cerrar, buscar, página siguiente…) están en español. Para otro idioma, envuelve la aplicación. También cambia el formato de números y fechas.',
        ),
        h(FrameworkCode, { react: localeReact, vue: localeVue, reactLabel: 'React · raíz de la aplicación', vueLabel: 'Vue · main.ts' }),
        P(
          "Idiomas incluidos: `es-ES`, `de-DE` y `en-GB`. Con `messages` cambias textos sueltos, por ejemplo `{ noResults: 'Sin coincidencias' }`. Las props de cada componente, como `closeLabel`, siguen teniendo prioridad.",
        ),
      ),
      h(
        Step,
        { id: 'migracion', title: 'Migrar un proyecto existente' },
        h(
          G.Grid,
          { as: 'ol', columns: 'auto', minItemWidth: 'sm', className: 'docs-migration' },
          migration.map(([title, text], i) =>
            h(
              'li',
              { key: title },
              h(G.Badge, { tone: 'brand' }, String(i + 1)),
              h(G.Text, { weight: 'semibold' }, title),
              h(G.Text, { size: 'small', tone: 'muted' }, text),
            ),
          ),
        ),
        P(
          'Los componentes existentes que usen variables compatibles de shadcn recogerán los nuevos valores. Adoptar solo los tokens no sustituye automáticamente sus tamaños, estructura ni comportamiento.',
        ),
        h(
          G.Alert,
          { tone: 'info', title: 'Estado de accesibilidad' },
          'Todas las combinaciones de color llegan a 4,5 : 1 en los dos temas y los dos modos, y axe-core revisa cada componente en el navegador con React y con Vue. Las comprobaciones automáticas no sustituyen a una revisión con personas ni equivalen a una certificación.',
        ),
      ),
      h(
        G.Stack,
        { direction: 'row', justify: 'end' },
        h(LinkButton, { to: '/componentes', variant: 'secondary', icon: icons.components }, 'Siguiente: explora los componentes'),
      ),
    ),
  )
}
