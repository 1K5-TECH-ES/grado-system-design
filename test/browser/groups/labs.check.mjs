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

  // VisuallyHidden: el botón se llama con el texto oculto incluido.
  await expect(page.locator('#labs-oculto button')).toHaveAccessibleName('Ver la oferta OF-0418')
}
