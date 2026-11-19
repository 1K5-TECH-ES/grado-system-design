import { createElement as h } from 'react'
import * as G from '@1k5-tech-es/grado-react'
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
        h('th', { scope: 'row' }, h('code', null, `@1k5-tech-es/${name}`)),
        h('td', null, text),
        h('td', null, h(G.Badge, null, version)),
        h(
          'td',
          { className: 'docs-cell-end' },
          h(
            'a',
            {
              className: G.buttonClass({ variant: 'secondary', size: 'sm' }),
              href: `downloads/1k5-tech-es-${name}-${version}.tgz`,
              download: true,
            },
            h(icons.installation, { 'aria-hidden': 'true' }),
            'Descargar',
            h('span', { className: 'k5-sr-only' }, ` @1k5-tech-es/${name}`),
          ),
        ),
      ),
    ),
  ),
)

const npmrc = `@1k5-tech-es:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}`
const tokenShell = 'export GITHUB_TOKEN=ghp_tu_token'
const actionsWorkflow = [
  'permissions:',
  '  contents: read',
  '  packages: read',
  '',
  'steps:',
  '  - uses: actions/checkout@v4',
  '  - uses: actions/setup-node@v4',
  '    with:',
  '      node-version: 22',
  '  - run: npm ci',
  '    env:',
  '      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}',
].join('\n')
const install = (framework) => `npm install @1k5-tech-es/grado @1k5-tech-es/grado-${framework}`
const update = (framework) => `npm install @1k5-tech-es/grado@latest @1k5-tech-es/grado-${framework}@latest`
const fromVendor = (framework) => `npm uninstall @1k5/grado @1k5/grado-${framework}
${install(framework)}`

const tailwind4 = `@import 'tailwindcss';
@import '@1k5-tech-es/grado/fonts.css';
@import '@1k5-tech-es/grado/tailwind.css';
@import '@1k5-tech-es/grado/grado.css' layer(components);`
const tailwind3 = `@import '@1k5-tech-es/grado/fonts.css';
@import '@1k5-tech-es/grado/tokens-hsl.css';
@import '@1k5-tech-es/grado/grado.css';

@tailwind base;
@tailwind components;
@tailwind utilities;`
const tailwind3Config = `import grado from '@1k5-tech-es/grado/tailwind-preset';

export default {
  presets: [grado],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx,vue}'],
  // Conserva los plugins que utilice tu aplicación.
};`
const cssImports = `import '@1k5-tech-es/grado/fonts.css';
import '@1k5-tech-es/grado/tokens.css';
import '@1k5-tech-es/grado/grado.css';`
const cssBase = `*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--k5-font-sans);
  font-size: var(--k5-text-body);
  background: var(--k5-background);
  color: var(--k5-foreground);
}`
const firstReact = `import { Button, Field, Input } from '@1k5-tech-es/grado-react';

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
</template>`
const localeReact = `import { GradoProvider } from '@1k5-tech-es/grado-react';
import de from '@1k5-tech-es/grado/messages/de';

export default function Raiz() {
  return (
    <GradoProvider locale="de-DE" messages={de}>
      <App />
    </GradoProvider>
  );
}`
const localeVue = `import { createApp } from 'vue';
import { Grado } from '@1k5-tech-es/grado-vue';
import de from '@1k5-tech-es/grado/messages/de';
import App from './App.vue';

createApp(App).use(Grado, { locale: 'de-DE', messages: de }).mount('#app');`

const themeOptions = [
  ['Consola', 'Herramientas internas', 'sin atributo'],
  ['Marca', 'Lo que ve el cliente', 'data-k5-theme="marca"'],
  ['Campo', 'Técnicos al sol: 7 : 1 y controles de 44 px. Carga además @1k5-tech-es/grado/themes/campo.css', 'data-k5-theme="campo"'],
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
          'Utiliza React 18 o superior, o Vue 3.5 o superior. El comando npx @1k5-tech-es/grado y la compilación del repositorio necesitan Node.js 22 o superior. Tailwind es opcional.',
        ),
        P(
          'Para instalar los paquetes necesitas una cuenta de GitHub, cualquiera: no hace falta pertenecer a la organización `1K5-TECH-ES`.',
        ),
        P(
          "Con el App Router de Next.js puedes importar los componentes desde un Server Component: los que tienen estado llevan `'use client'`.",
        ),
      ),
      h(
        Step,
        { id: 'paquetes', number: 2, title: 'Instala los paquetes' },
        h(
          G.Alert,
          { tone: 'info', title: 'Desde la 0.3.0, Grado se instala con npm' },
          rich(
            'Los paquetes son públicos, están en GitHub Packages y se llaman `@1k5-tech-es/…`. Ya no hace falta guardar archivos `.tgz` en tu repositorio.',
          ),
        ),
        P(
          '**Dile a npm dónde está Grado.** Crea este `.npmrc` en la raíz de tu aplicación y súbelo al repositorio. No contiene ningún secreto: solo el nombre de la variable que guarda el token.',
        ),
        h(CodeBlock, { code: npmrc, label: '.npmrc · raíz de tu aplicación' }),
        P(
          '**Crea tu token, una sola vez.** Aunque los paquetes son públicos, el registro npm de GitHub Packages pide un token para descargar cualquier paquete. En GitHub, ve a Settings → Developer settings → Personal access tokens → Tokens (classic) y crea uno con el permiso `read:packages`. Tiene que ser «classic»: GitHub Packages no acepta tokens granulares para npm. Después, guárdalo en tu shell:',
        ),
        h(CodeBlock, { code: tokenShell, label: '~/.bashrc o ~/.zshrc · no lo subas a ningún repositorio' }),
        P('**Instala el paquete base y el de tu framework.**'),
        h(FrameworkCode, {
          react: install('react'),
          vue: install('vue'),
          reactLabel: 'Terminal · en tu aplicación',
          vueLabel: 'Terminal · en tu aplicación',
        }),
        h(G.Accordion, {
          items: [
            {
              value: 'ci',
              title: 'En el CI y en los despliegues',
              content: h(
                'div',
                null,
                P(
                  '**GitHub Actions.** Como los paquetes son públicos, el `GITHUB_TOKEN` del propio workflow basta para descargarlos. En el workflow de tu aplicación:',
                ),
                h(CodeBlock, { code: actionsWorkflow, label: '.github/workflows/ci.yml · solo lo que cambia' }),
                P(
                  '**Vercel, Netlify, Docker y otros.** Define la variable de entorno `GITHUB_TOKEN` con un token «classic» con `read:packages`, mejor de una cuenta de servicio que de una persona. En Docker, pásalo como secreto de build, no como `ARG`, para que no quede en la imagen.',
                ),
              ),
            },
            {
              value: 'actualizar',
              title: 'Actualizar a una versión nueva',
              content: h(
                'div',
                null,
                P(
                  'Hasta la 1.0, una versión menor (0.3 → 0.4) puede cambiar el aspecto o una API. Antes de actualizar, lee «Al actualizar» de esa versión en Cambios. Luego:',
                ),
                h(FrameworkCode, {
                  react: update('react'),
                  vue: update('vue'),
                  reactLabel: 'Terminal · en tu aplicación',
                  vueLabel: 'Terminal · en tu aplicación',
                }),
                P('Instala siempre el paquete base y el del framework en la misma versión.'),
                P(
                  'Los cambios mecánicos los hace el codemod: imports, dependencias, alias y clases retiradas. `npx @1k5-tech-es/grado migrate --dry` enseña lo que cambiaría; sin `--dry` lo escribe. Lo que pide una decisión, como un `variant="danger"` que debería ser `destructive`, lo avisa con archivo y línea.',
                ),
                P(
                  '`npx @1k5-tech-es/grado usage` cuenta qué componentes, props, clases y tokens de Grado usa tu aplicación, sin cambiar nada. Pásalo antes y después de actualizar para ver qué partes de la app tocan los cambios de esa versión.',
                ),
              ),
            },
            {
              value: 'desde-vendor',
              title: 'Si ya usabas los .tgz de vendor/',
              content: h(
                'div',
                null,
                P('Añade el `.npmrc` y el token de arriba y cambia los paquetes:'),
                h(FrameworkCode, {
                  react: fromVendor('react'),
                  vue: fromVendor('vue'),
                  reactLabel: 'Terminal · en tu aplicación',
                  vueLabel: 'Terminal · en tu aplicación',
                }),
                P(
                  'Después, `npx @1k5-tech-es/grado migrate` cambia `@1k5/` por `@1k5-tech-es/` en los imports de JavaScript y de CSS y en `package.json`, y te dice qué `.tgz` de `vendor/` puedes borrar. Los componentes, las clases y los tokens no cambian de nombre.',
                ),
              ),
            },
            {
              value: 'publicacion',
              title: 'Cómo se publica una versión',
              content: P(
                'Nadie publica a mano. Quien mantiene Grado sube la versión de los tres paquetes, escribe sus cambios y crea la etiqueta `vX.Y.Z` en el repositorio. GitHub Actions pasa los tests, publica los tres paquetes en GitHub Packages y crea la release con las notas. La versión nueva aparece en Cambios.',
              ),
            },
            {
              value: 'descargas',
              title: 'Sin token: paquetes descargables',
              content: h(
                'div',
                null,
                P(
                  'Para probar Grado sin crear un token, o para instalar sin acceso al registro, descarga el paquete base y el de tu framework, guárdalos en `vendor/` dentro de tu aplicación y añádelos al repositorio para que el despliegue también los tenga.',
                ),
                downloads,
                h(FrameworkCode, {
                  react: `npm install ./vendor/1k5-tech-es-grado-${version}.tgz ./vendor/1k5-tech-es-grado-react-${version}.tgz`,
                  vue: `npm install ./vendor/1k5-tech-es-grado-${version}.tgz ./vendor/1k5-tech-es-grado-vue-${version}.tgz`,
                  reactLabel: 'Terminal · en tu aplicación',
                  vueLabel: 'Terminal · en tu aplicación',
                }),
              ),
            },
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
                P(
                  'Para lo interactivo sin framework (PHP, Twig, páginas estáticas), `@1k5-tech-es/grado-elements` trae Web Components con el mismo HTML, teclado y textos que los de React y Vue: `k5-combobox`, `k5-dialog`, `k5-tabs`, `k5-menu` y `k5-toaster` con `toast()`. Copia `grado-elements.min.js` (lo trae todo) y cárgalo como módulo.',
                ),
                h(CodeBlock, {
                  code: `<script type="module" src="/vendor/grado-elements.min.js"></script>

<k5-combobox label="Provincia" name="provincia">
  <option value="md">Madrid</option>
  <option value="vlc">Valencia</option>
</k5-combobox>

<button data-k5-open="nota">Nueva nota</button>
<k5-dialog id="nota" label="Nueva nota">…</k5-dialog>`,
                  label: 'HTML · Web Components',
                }),
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
                    description: 'Inter en 400, 500, 600 y 700. Si tu app ya carga Inter, no lo importes.',
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
            h(G.Text, { size: 'small', tone: 'muted' }, 'Tus colores sobre cualquiera de ellos'),
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
          'Los tokens de marca como `--k5-mint` son constantes. Los semánticos como `--k5-primary` cambian con el tema. Para gráficos también puedes importar `themes` desde `@1k5-tech-es/grado/tokens`.',
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
          "El español viene de serie. Los textos en alemán (`de-DE`) e inglés (`en-GB`) se importan de `@1k5-tech-es/grado/messages/de` y `/en` y se pasan en `messages`: así una app en español no los descarga. Hasta la 1.0 siguen incluidos, pero en desarrollo Grado avisa si pides otro idioma sin pasar sus textos. Con `messages` también cambias textos sueltos, por ejemplo `{ noResults: 'Sin coincidencias' }`. Las props de cada componente, como `closeLabel`, siguen teniendo prioridad.",
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
