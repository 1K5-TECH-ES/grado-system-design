// Presupuesto de tamaño: lo que descarga una app que usa Grado, minificado y con gzip.
// Falla si algo pasa de su límite. Necesita el build hecho.
//   node scripts/size.mjs
// Lo que cuenta es lo que paga una app por lo que importa: los paquetes son sideEffects: false y
// el bundler solo se lleva lo usado. Por eso fallan los límites del CSS, de los adaptadores y de
// cada import; el paquete entero solo avisa. Si algo crece a propósito, sube su límite aquí y
// dilo en el CHANGELOG.
import { readFileSync, appendFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const KB = 1024
const LIMITS = {
  // 0.9: de 17 a 18,5 KB por los atajos (shortcut), Status progress, Tabs view, PageHeader bar,
  // los grupos de DataTable, el filtro en partes, RadioGroup card y Select property; incluye la
  // cabecera de 0.8 (brandHeader, se retira en 0.10).
  'grado.min.css': 18.5 * KB,
  'tokens.css': 4 * KB,
  // Temas en su propio archivo (0.6): solo los cargan las apps que los usan.
  'themes/campo.css': 1.6 * KB,
  // Web Components (0.6): el archivo para usar sin bundler, con todo dentro. 12,6 KB al crearlo.
  'grado-elements.min.js': 14 * KB,
  // Los adaptadores, con los componentes que usan; sin la librería de formularios.
  '@1k5-tech-es/grado-react/react-hook-form': 24 * KB,
  '@1k5-tech-es/grado-vue/vee-validate': 15 * KB,
  // Labs (0.6): todo junto, con sus textos en tres idiomas. Fase 1 (utilidades): 14 y 14,5 KB;
  // fase 2 (TariffComparison, SignaturePad, SolarForecast): 20,7 y 21,2 KB. Un 10 % de margen.
  'labs.css': 2.2 * KB,
  '@1k5-tech-es/grado-react/labs': 23 * KB,
  '@1k5-tech-es/grado-vue/labs': 23.5 * KB,
}
// El paquete entero, como referencia: pasar de aquí avisa pero no falla.
const WARNINGS = {
  // 0.4: de 46 a 50 KB y de 48 a 52 KB por PriceChart, BatteryLevel, Heatmap y los iconos de energía.
  '@1k5-tech-es/grado-react': 50 * KB,
  '@1k5-tech-es/grado-vue': 52 * KB,
}
// Lo que cuesta cada import, igual en React y en Vue. Medido en 0.5 con un 10 % de margen.
// Casi todos llevan ~4,5 KB fijos: los textos de los tres idiomas (messages.js) y classes.js.
const IMPORTS = {
  Button: { names: ['Button'], limit: 7 * KB },
  'Field, Input': { names: ['Field', 'Input'], limit: 2.5 * KB },
  Dialog: { names: ['Dialog'], limit: 9 * KB },
  // 0.6: de 14 a 14,5 KB. El núcleo común (core.js) deja el de Vue justo en 14 KB y el gzip del CI lo pasa.
  // 0.9: de 14,5 a 15,5 KB por groupBy (grupos plegables); Vue queda en 14,8.
  DataTable: { names: ['DataTable'], limit: 15.5 * KB },
  'AppShell, Nav, NavItem': { names: ['AppShell', 'Nav', 'NavItem'], limit: 9.5 * KB },
  LineChart: { names: ['LineChart'], limit: 10 * KB },
  'Toaster, toast': { names: ['Toaster', 'toast'], limit: 9.5 * KB },
  Combobox: { names: ['Combobox'], limit: 10.5 * KB },
  PriceChart: { names: ['PriceChart'], limit: 10.5 * KB },
}

const path = (relative) => fileURLToPath(new URL(`../${relative}`, import.meta.url))
const gzip = (bytes) => gzipSync(bytes, { level: 9 }).length

const EXTERNAL = ['react', 'react-dom', 'react/jsx-runtime', 'vue', 'react-hook-form', 'vee-validate']
const options = { bundle: true, minify: true, write: false, format: 'esm', external: EXTERNAL, logLevel: 'silent' }

// Un paquete entero, como lo metería un bundler en la app: minificado, sin React ni Vue.
async function bundle(entry) {
  const result = await build({ ...options, entryPoints: [path(entry)] })
  return result.outputFiles[0].contents
}

// Solo unos nombres del paquete: lo que se lleva una app que importa eso.
async function bundleImport(entry, names) {
  const result = await build({
    ...options,
    stdin: { contents: `export { ${names.join(', ')} } from ${JSON.stringify(path(entry))}`, resolveDir: path('.'), loader: 'js' },
  })
  return result.outputFiles[0].contents
}

const rows = [
  { name: 'grado.min.css', size: gzip(readFileSync(path('packages/grado/dist/grado.min.css'))) },
  { name: 'tokens.css', size: gzip(readFileSync(path('packages/grado/dist/tokens.css'))) },
  { name: 'themes/campo.css', size: gzip(readFileSync(path('packages/grado/dist/themes/campo.css'))) },
  { name: 'grado-elements.min.js', size: gzip(readFileSync(path('packages/grado-elements/dist/grado-elements.min.js'))) },
  { name: '@1k5-tech-es/grado-react/react-hook-form', size: gzip(await bundle('packages/grado-react/dist/react-hook-form.js')) },
  { name: '@1k5-tech-es/grado-vue/vee-validate', size: gzip(await bundle('packages/grado-vue/dist/vee-validate.js')) },
  { name: 'labs.css', size: gzip(readFileSync(path('packages/grado/dist/labs.css'))) },
  { name: '@1k5-tech-es/grado-react/labs', size: gzip(await bundle('packages/grado-react/dist/labs.js')) },
  { name: '@1k5-tech-es/grado-vue/labs', size: gzip(await bundle('packages/grado-vue/dist/labs.js')) },
].map((row) => ({ ...row, limit: LIMITS[row.name] }))
for (const framework of ['react', 'vue'])
  for (const [label, { names, limit }] of Object.entries(IMPORTS))
    rows.push({
      name: `grado-${framework} · ${label}`,
      size: gzip(await bundleImport(`packages/grado-${framework}/dist/index.js`, names)),
      limit,
    })
for (const [name, limit] of Object.entries(WARNINGS)) {
  const entry = `packages/${name.split('/')[1]}/dist/index.js`
  rows.push({ name: `${name} (entero)`, size: gzip(await bundle(entry)), limit, warnOnly: true })
}
for (const row of rows) row.over = row.size > row.limit

const kb = (bytes) => `${(bytes / KB).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} KB`
const mark = (row) => (!row.over ? '✓' : row.warnOnly ? '!' : '✗')
const width = Math.max(...rows.map((row) => row.name.length))
console.log('Tamaño con gzip (límite)')
for (const row of rows) console.log(`${mark(row)} ${row.name.padEnd(width)}  ${kb(row.size).padStart(8)}  (${kb(row.limit)})`)

// En GitHub Actions, la misma tabla en el resumen del trabajo.
if (process.env.GITHUB_STEP_SUMMARY)
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Tamaño de Grado (gzip)\n\n| | Tamaño | Límite |\n|---|---:|---:|\n${rows
      .map((row) => `| ${mark(row)} \`${row.name}\` | ${kb(row.size)} | ${kb(row.limit)} |`)
      .join('\n')}\n`,
  )

const warned = rows.filter((row) => row.over && row.warnOnly)
if (warned.length)
  console.warn(`\nAviso: ${warned.map((row) => row.name).join(', ')} pasa de su referencia. No falla: cuenta lo que pesa cada import.`)
const over = rows.filter((row) => row.over && !row.warnOnly)
if (over.length) {
  console.error(`\nPasan de su límite: ${over.map((row) => row.name).join(', ')}. Si es a propósito, sube el límite en scripts/size.mjs.`)
  process.exit(1)
}
