// Una captura por componente: la vista previa real de cada ficha de /componentes en la web,
// en los dos temas y los dos modos. Si cambia un componente, falla solo su captura y
// Playwright deja la diferencia en test-results/. La web la sirve playwright.config.mjs.
// Para regenerar: npm run test:visual:docker -- --update-snapshots (misma imagen que el CI).
import { test, expect } from '@playwright/test'

// Alta: cada vista previa se captura en posición fija y tiene que caber entera.
test.use({ viewport: { width: 1280, height: 2000 } })

// Fecha fija: calendarios, «hoy» y la franja actual de PriceChart salen siempre igual.
const NOW = new Date('2026-10-16T10:30:00+02:00')

async function openComponents(page, theme, mode) {
  await page.addInitScript(
    ([theme, mode]) => {
      localStorage.setItem('grado-docs-tema', theme)
      localStorage.setItem('grado-docs-mode', mode)
    },
    [theme, mode],
  )
  await page.clock.setFixedTime(NOW)
  await page.goto('/componentes')
  await expect(page.locator('.docs-component').first()).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.fonts.check('600 14px Inter'))).toBe(true)
  expect(await page.evaluate(() => document.documentElement.dataset.k5Theme)).toBe(theme)
  // La vista previa que se captura sale de su sitio y va arriba a la izquierda, con un ancho
  // fijo: así la captura no depende de lo que haya encima en la página (una línea más en una
  // guía movía todo una fracción de píxel y cambiaba el suavizado de todas las capturas). La
  // sombra pinta el fondo alrededor: lo que sobresale (una lista abierta) no deja ver la página.
  await page.addStyleTag({
    content: `[data-k5-shot] { position: fixed !important; inset: 0 auto auto 0 !important; width: 940px !important;
      margin: 0 !important; z-index: 2147483000; background: var(--k5-background);
      box-shadow: 0 0 0 100vmax var(--k5-background) !important; }`,
  })
}

/** Deja sola la vista previa de un componente en su posición fija y la devuelve. */
async function isolate(page, id) {
  await page.evaluate((id) => {
    document.querySelector('[data-k5-shot]')?.removeAttribute('data-k5-shot')
    document.querySelector(`#${id} .demo-preview`).setAttribute('data-k5-shot', '')
  }, id)
  return page.locator(`#${id} .demo-preview`)
}

for (const theme of ['consola', 'marca']) {
  for (const mode of ['light', 'dark']) {
    test(`componentes · ${theme} · ${mode}`, async ({ page }) => {
      test.setTimeout(240_000)
      await openComponents(page, theme, mode)
      const ids = await page.locator('.docs-component').evaluateAll((sections) => sections.map((s) => s.id))
      expect(ids.length).toBeGreaterThan(80)
      for (const id of ids) {
        const preview = await isolate(page, id)
        // Soft: una diferencia no esconde las de los demás componentes.
        await expect.soft(preview, id).toHaveScreenshot(['componentes', `${id}-${theme}-${mode}.png`])
      }
    })
  }
}

// Estados que no se ven en reposo: la tarjeta de los gráficos, listas y menús abiertos.
test('estados · consola · light', async ({ page }) => {
  await openComponents(page, 'consola', 'light')
  const shot = (id, name) => expect.soft(page.locator(`#${id} .demo-preview`), name).toHaveScreenshot(['estados', `${name}.png`])

  await isolate(page, 'line-chart')
  const line = page.locator('#line-chart .demo-preview svg').first()
  const box = await line.boundingBox()
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height / 2)
  await shot('line-chart', 'line-chart-tarjeta')

  await isolate(page, 'price-chart')
  const price = page.locator('#price-chart .demo-preview .k5-chart__plot').first()
  const priceBox = await price.boundingBox()
  await page.mouse.move(priceBox.x + priceBox.width * 0.8, priceBox.y + priceBox.height / 2)
  await shot('price-chart', 'price-chart-tarjeta')
  await page.mouse.move(0, 0)

  await isolate(page, 'combobox')
  const combobox = page.locator('#combobox .demo-preview [role=combobox]').first()
  await combobox.click()
  const listbox = page.locator('#combobox [role=listbox]').first()
  await expect(listbox).toBeVisible()
  // La lista sobresale de la vista previa: la captura recorta las dos juntas.
  const [a, b] = [await page.locator('#combobox .demo-preview').boundingBox(), await listbox.boundingBox()]
  const clip = { x: a.x, y: a.y, width: a.width, height: Math.max(a.y + a.height, b.y + b.height) - a.y + 8 }
  await expect.soft(page, 'combobox-abierto').toHaveScreenshot(['estados', 'combobox-abierto.png'], { clip })
  await page.keyboard.press('Escape')
})
