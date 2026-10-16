// Pruebas en navegador · grupo «labs» (0.6): lo que se lee, el tema, el scroll y los atajos.
// check(page, { expect, framework })
export async function check(page, { expect }) {
  // Amount: formato español, número en value y color en las variaciones.
  const amounts = page.locator('#labs-amount data')
  await expect(amounts).toHaveText(['1234,50 €', '12,5 MWh', '6,4 kWp', '-4 %', '—'])
  await expect(amounts.first()).toHaveAttribute('value', '1234.5')
  await expect(amounts.nth(3)).toHaveClass(/k5-amount--negative/)

  // RelativeTime: texto relativo, fecha completa en title y ISO en datetime.
  const time = page.locator('#labs-tiempo time')
  await expect(time).toHaveText('hace 5 minutos')
  await expect(time).toHaveAttribute('datetime', '2026-10-16T08:25:00.000Z')
  await expect(time).toHaveAttribute('title', /16 de octubre de 2026/)

  // ThemeToggle: Oscuro pone .dark en <html> y lo guarda; Sistema lo borra.
  const html = page.locator('html')
  await page.locator('#labs-tema [role=radio]', { hasText: 'Oscuro' }).click()
  await expect(html).toHaveClass(/\bdark\b/)
  expect(await page.evaluate(() => localStorage.getItem('k5-mode-pruebas'))).toBe('dark')
  await page.locator('#labs-tema [role=radio]', { hasText: 'Claro' }).click()
  await expect(html).not.toHaveClass(/\bdark\b/)
  await page.locator('#labs-tema [role=radio]', { hasText: 'Sistema' }).click()
  expect(await page.evaluate(() => localStorage.getItem('k5-mode-pruebas'))).toBe(null)
  await page.locator('#labs-tema-vista [role=radio]', { hasText: 'Oscuro' }).click()
  expect(await page.evaluate(() => localStorage.getItem('k5-mode-vista'))).toBe('dark')
  await expect(page.locator('#labs-tema-vista [role=radio][aria-checked=true]')).toHaveText('Oscuro')
  await expect(html).not.toHaveClass(/\bdark\b/)
  await page.locator('#labs-tema-vista [role=radio]', { hasText: 'Sistema' }).click()

  // ScrollArea: región con nombre que recibe el foco y se desplaza con las flechas.
  const area = page.locator('#labs-scroll [role=region]')
  await expect(area).toHaveAccessibleName('Historial')
  await area.focus()
  await page.keyboard.press('ArrowDown')
  await expect.poll(() => area.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)

  // useHotkey: «?» salta fuera de los campos y no dentro; mod+j salta también dentro.
  await page.locator('body').click({ position: { x: 1, y: 1 } })
  await page.keyboard.press('Shift+?')
  await expect(page.locator('#labs-help')).toHaveText('1')
  await page.locator('#labs-input').focus()
  await page.keyboard.press('Shift+?')
  await expect(page.locator('#labs-help')).toHaveText('1')
  await page.keyboard.press('Control+j')
  await expect(page.locator('#labs-jump')).toHaveText('1')
  await page.locator('#labs-input').blur()

  // TariffComparison: la más barata marcada en su fila.
  await expect(page.locator('#labs-tarifas tr[data-cheapest] th')).toContainText('Precio fijo')
  await expect(page.locator('#labs-tarifas tr[data-cheapest] th')).toContainText('Más barata')

  // SignaturePad: dibujar con el ratón, borrar y firmar escribiendo el nombre.
  const signature = page.locator('#labs-firma')
  const canvas = signature.locator('svg[role=img]')
  await expect(canvas).toHaveAccessibleName('Firma del titular Sin firmar')
  await canvas.scrollIntoViewIfNeeded()
  const box = await canvas.boundingBox()
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.6)
  await page.mouse.down()
  for (let i = 1; i <= 10; i++) await page.mouse.move(box.x + box.width * (0.2 + i * 0.05), box.y + box.height * (0.6 - (i % 2) * 0.2))
  await page.mouse.up()
  await expect(signature.locator('.k5-signature__strokes path')).toHaveCount(1)
  await expect(canvas).toHaveAccessibleName('Firma del titular Firma dibujada')
  expect(await signature.locator('input[type=hidden]').inputValue()).toMatch(/^data:image\/svg\+xml/)
  await signature.locator('button', { hasText: 'Borrar' }).click()
  await expect(signature.locator('.k5-signature__strokes path')).toHaveCount(0)
  await signature.locator('button', { hasText: 'Escribir mi nombre' }).click()
  const typed = signature.locator('input:not([type=hidden])')
  await expect(typed).toHaveAccessibleName('Firma del titular Nombre y apellidos')
  await typed.fill('Lucía Fernández')
  await expect(signature.locator('.k5-signature__preview')).toHaveText('Lucía Fernández')
  expect(decodeURIComponent(await signature.locator('input[type=hidden]').inputValue())).toContain('Lucía Fernández</text>')
  await signature.locator('button', { hasText: 'Dibujar la firma' }).click()
  await expect(canvas).toBeVisible()

  // SolarForecast: resumen y, con el teclado, cada hora con su previsto, su real y su tiempo.
  const forecast = page.locator('#labs-prevision .k5-forecast')
  await expect(forecast.locator('.k5-forecast__status')).toHaveText(/por encima de lo previsto/)
  const body = forecast.locator('.k5-chart__body')
  await body.focus()
  for (let i = 0; i < 13; i++) await page.keyboard.press('ArrowRight')
  await expect(body.locator('[aria-live=polite]')).toHaveText(/12:00–13:00: Previsto 3,6\s?kWh, Producido 3,9\s?kWh, Tiempo Nubes y claros/)
  await page.keyboard.press('ArrowRight')
  await expect(body.locator('[aria-live=polite]')).toHaveText(/13:00–14:00: Previsto 3,4\s?kWh, Tiempo Nubes y claros/)
  await page.keyboard.press('Escape')

  // VisuallyHidden: el botón se llama con el texto oculto incluido.
  await expect(page.locator('#labs-oculto button')).toHaveAccessibleName('Ver la oferta OF-0418')
}
