// Regresión visual: capturas del catálogo en los dos temas y los dos modos.
//   npm run test:visual                      compara con las capturas guardadas
//   npm run test:visual -- --update-snapshots  las vuelve a generar tras un cambio querido
// Las capturas dependen del navegador y del sistema: genéralas en el mismo entorno que el CI.
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
  use: {
    browserName: 'chromium',
    launchOptions: { executablePath },
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
  },
})
