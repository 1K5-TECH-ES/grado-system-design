// Pruebas en navegador · grupo «energía» (0.4): lo que se lee, el teclado y el ratón.
// check(page, { expect, framework })
export async function check(page, { expect }) {
  // PriceChart: punta resaltada en la franja de ahora; con el teclado se oye cada franja.
  const price = page.locator('#energia-precio .k5-chart')
  const body = price.locator('.k5-chart__body')
  await expect(body).toHaveAccessibleName('Precio de la luz')
  await expect(price.locator('.k5-chart__group[data-current]')).toHaveCount(1)
  await expect(price.locator('.k5-price__now')).toHaveText('Ahora')
  await body.focus()
  await page.keyboard.press('ArrowRight')
  await expect(body.locator('[aria-live=polite]')).toHaveText('00:00–01:00: Valle 0,112 €/kWh')
  await page.keyboard.press('End')
  await expect(price.locator('.k5-chart__tooltip-title')).toHaveText('23:00–00:00')
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowLeft')
  await expect(body.locator('[aria-live=polite]')).toHaveText('19:00–20:00: Punta 0,214 €/kWh')
  await page.keyboard.press('Escape')
  await expect(price.locator('.k5-chart__tooltip')).toHaveCount(0)
  const plot = price.locator('.k5-chart__plot')
  await plot.scrollIntoViewIfNeeded()
  const box = await plot.boundingBox()
  await page.mouse.move(box.x + box.width * (4.5 / 24), box.y + box.height / 2)
  await expect(price.locator('.k5-chart__tooltip-row')).toHaveText('Valle0,094 €/kWh')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height + 200)

  // BatteryLevel: un meter con su nombre y todo el texto; el relleno a la altura de la carga.
  const battery = page.locator('#energia-bateria .k5-battery').first()
  await expect(battery).toHaveAttribute('role', 'meter')
  await expect(battery).toHaveAccessibleName('Batería')
  await expect(battery).toHaveAttribute('aria-valuetext', /72\s%, 7,2 de 10 kWh, Cargando · 2,1 kW, Reserva: 20\s%/)
  const [cell, fill] = await Promise.all([
    battery.locator('.k5-battery__cell').boundingBox(),
    battery.locator('.k5-battery__fill').boundingBox(),
  ])
  expect(fill.width / (cell.width - 10)).toBeGreaterThan(0.68)
  expect(fill.width / (cell.width - 10)).toBeLessThan(0.76)
  await expect(page.locator('#energia-bateria .k5-battery--low .k5-battery__state')).toHaveText('Descargando · 1,4 kW')

  // Heatmap: flechas en las dos direcciones, Fin al final de la fila, y la celda se anuncia.
  const heat = page.locator('#energia-calor .k5-heatmap__body')
  await expect(heat).toHaveAccessibleName('Consumo por hora')
  await heat.focus()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('End')
  await expect(heat.locator('[aria-live=polite]')).toHaveText('martes, 23 h: 0,3 kWh')
  await expect(heat.locator('.k5-heatmap__cell[data-active]')).toHaveCount(1)
  await expect(heat.locator('.k5-chart__tooltip-title')).toHaveText('martes · 23 h')
  await page.keyboard.press('Tab')
  await expect(heat.locator('.k5-chart__tooltip')).toHaveCount(0)

  // Iconos: decorativos salvo el que tiene nombre.
  const icons = page.locator('#energia-iconos svg')
  await expect(icons).toHaveCount(7)
  await expect(page.locator('#energia-iconos svg[aria-hidden=true]')).toHaveCount(6)
  await expect(page.locator('#energia-iconos svg[role=img]')).toHaveAccessibleName('Bomba de calor')
}
