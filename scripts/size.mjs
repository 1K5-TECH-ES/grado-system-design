// Presupuesto de tamaño: lo que descarga una app que usa Grado, minificado y con gzip.
// Falla si algo pasa de su límite. Necesita el build hecho.
//   node scripts/size.mjs
// Si un paquete crece a propósito (componentes nuevos), sube su límite aquí y dilo en el CHANGELOG.
import { readFileSync, appendFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const KB = 1024
const LIMITS = {
  'grado.min.css': 17 * KB,
  'tokens.css': 4 * KB,
  '@1k5-tech-es/grado-react': 46 * KB,
  '@1k5-tech-es/grado-vue': 48 * KB,
}

const path = (relative) => fileURLToPath(new URL(`../${relative}`, import.meta.url))
const gzip = (bytes) => gzipSync(bytes, { level: 9 }).length

// Un paquete entero, como lo metería un bundler en la app: minificado, sin React ni Vue.
async function bundle(entry) {
  const result = await build({
    entryPoints: [path(entry)],
    bundle: true,
    minify: true,
    write: false,
    format: 'esm',
    external: ['react', 'react-dom', 'react/jsx-runtime', 'vue'],
    logLevel: 'silent',
  })
  return result.outputFiles[0].contents
}

const sizes = {
  'grado.min.css': gzip(readFileSync(path('packages/grado/dist/grado.min.css'))),
  'tokens.css': gzip(readFileSync(path('packages/grado/dist/tokens.css'))),
  '@1k5-tech-es/grado-react': gzip(await bundle('packages/grado-react/dist/index.js')),
  '@1k5-tech-es/grado-vue': gzip(await bundle('packages/grado-vue/dist/index.js')),
}

const kb = (bytes) => `${(bytes / KB).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} KB`
const rows = Object.entries(sizes).map(([name, size]) => ({ name, size, limit: LIMITS[name], over: size > LIMITS[name] }))
const width = Math.max(...rows.map((row) => row.name.length))
console.log('Tamaño con gzip (límite)')
for (const row of rows) console.log(`${row.over ? '✗' : '✓'} ${row.name.padEnd(width)}  ${kb(row.size).padStart(8)}  (${kb(row.limit)})`)

// En GitHub Actions, la misma tabla en el resumen del trabajo.
if (process.env.GITHUB_STEP_SUMMARY)
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `### Tamaño de Grado (gzip)\n\n| | Tamaño | Límite |\n|---|---:|---:|\n${rows
      .map((row) => `| ${row.over ? '✗' : '✓'} \`${row.name}\` | ${kb(row.size)} | ${kb(row.limit)} |`)
      .join('\n')}\n`,
  )

const over = rows.filter((row) => row.over)
if (over.length) {
  console.error(`\nPasan de su límite: ${over.map((row) => row.name).join(', ')}. Si es a propósito, sube el límite en scripts/size.mjs.`)
  process.exit(1)
}
