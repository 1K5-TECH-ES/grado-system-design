// El armazón de aplicación (catalog/app.html) en escritorio, plegado y móvil. Los componentes
// tienen cada uno su captura en components.spec.mjs. Si una captura cambia sin querer, el test
// falla y Playwright deja la diferencia en test-results/. Si el cambio es querido, regenera con
// npm run test:visual:docker -- --update-snapshots y revisa las imágenes nuevas en el pull request.
import { test, expect } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const catalog = (file, query) => `file://${fileURLToPath(new URL(`../../catalog/${file}`, import.meta.url))}?${query}`

async function open(page, url) {
  await page.goto(url)
  await page.evaluate(() => document.fonts.ready)
  // Barlow tiene que haberse cargado: si no, la captura saldría con la fuente de respaldo.
  expect(await page.evaluate(() => document.fonts.check('600 14px Barlow'))).toBe(true)
}

test('armazón · consola · escritorio', async ({ page }) => {
  await open(page, catalog('app.html', 'tema=consola&modo=light'))
  await expect(page).toHaveScreenshot('armazon-consola-escritorio.png')
})

test('armazón · marca · oscuro · plegado', async ({ page }) => {
  await open(page, catalog('app.html', 'tema=marca&modo=dark&plegado=si'))
  await expect(page).toHaveScreenshot('armazon-marca-oscuro-plegado.png')
})

test('armazón · móvil con el menú abierto', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await open(page, catalog('app.html', 'tema=marca&modo=light&menu=abierto'))
  await expect(page).toHaveScreenshot('armazon-movil-menu.png')
})
