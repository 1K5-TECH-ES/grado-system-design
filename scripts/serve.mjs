// Sirve docs-site/dist/ en local, con las rutas de React Router (/componentes, /estado…)
// redirigidas a index.html, como hará el hosting. `npm run docs:serve` (PORT=4173 por defecto).
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = fileURLToPath(new URL('../docs-site/dist/', import.meta.url))
const port = Number(process.env.PORT ?? 4173)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.tgz': 'application/gzip',
}

if (!existsSync(join(dir, 'index.html'))) {
  console.error('No hay web generada. Ejecuta antes: npm run docs:build')
  process.exit(1)
}

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname)
  let file = normalize(join(dir, pathname))
  if (!file.startsWith(dir)) return response.writeHead(403).end()
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(dir, 'index.html')
  response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream')
  response.end(readFileSync(file))
}).listen(port, () => console.log(`Grado · documentación en http://localhost:${port}`))
