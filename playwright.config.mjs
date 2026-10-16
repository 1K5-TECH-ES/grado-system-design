// Regresión visual: una captura por componente (de la web, /componentes) en los dos temas y los
// dos modos, algunos estados abiertos y el armazón de aplicación del catálogo.
//   npm run test:visual:docker                      compara, en la misma imagen de Playwright que el CI
//   npm run test:visual:docker -- --update-snapshots  las vuelve a generar tras un cambio querido
// Las capturas dependen del navegador y del sistema: fuera de esa imagen, el suavizado de las
// letras cambia y npm run test:visual falla aunque no haya ningún cambio.
import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined)

export default defineConfig({
  testDir: 'test/visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}-{platform}{ext}',
  fullyParallel: true,
  reporter: [['list']],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' } },
  // La web generada (npm run test:visual la genera antes) con las rutas de React Router.
  webServer: {
    command: 'node scripts/serve.mjs',
    env: { PORT: '4174' },
    url: 'http://127.0.0.1:4174/componentes',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    browserName: 'chromium',
    launchOptions: { executablePath },
    baseURL: 'http://127.0.0.1:4174',
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
  },
})
