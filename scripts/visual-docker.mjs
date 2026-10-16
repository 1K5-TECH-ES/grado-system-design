// npm run test:visual:docker [-- --update-snapshots]
// Pasa la regresión visual dentro de la imagen oficial de Playwright, la misma que usa el CI,
// para que las capturas salgan igual que allí. Fuera de ella el suavizado de las letras
// cambia y las capturas no coinciden aunque no haya ningún cambio. Necesita Docker.
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { userInfo } from 'node:os'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
// La versión de la imagen sale del lockfile: siempre la del @playwright/test instalado.
const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'))
const version = lock.packages['node_modules/@playwright/test'].version
const image = `mcr.microsoft.com/playwright:v${version}-noble`
const { uid, gid } = userInfo()

const args = [
  'run',
  '--rm',
  '--ipc=host',
  // Con tu usuario: las capturas y dist/ no quedan como root.
  '--user',
  `${uid}:${gid}`,
  '-e',
  'HOME=/tmp',
  '-e',
  'CI=1',
  '-v',
  `${root}:/work`,
  '-w',
  '/work',
  image,
  'npm',
  'run',
  'test:visual',
  '--',
  ...process.argv.slice(2),
]
console.log(`Regresión visual en ${image}`)
const result = spawnSync('docker', args, { stdio: 'inherit' })
if (result.error) {
  console.error(`No se pudo lanzar Docker: ${result.error.message}`)
  process.exit(1)
}
process.exit(result.status ?? 1)
