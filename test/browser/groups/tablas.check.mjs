// Pruebas en navegador · grupo «tablas» (0.4): paginación y orden en el servidor, columnas y cabecera fija.
// check(page, { expect, framework })
export async function check(page, { expect }) {
  const table = page.locator('#tablas .k5-data-table')
  const firstCell = table.locator('tbody tr').first().locator('td').first()
  await expect(firstCell).toHaveText('Cliente 001')
  await expect(table.locator('tbody tr')).toHaveCount(10)
  await expect(table.locator('.k5-pagination [aria-live]')).toHaveText('1–10 de 125')

  // La página siguiente la «pide» al servidor: llegan otras diez filas.
  await table.locator('[aria-label="Página siguiente"]').click()
  await expect(firstCell).toHaveText('Cliente 011')
  await expect(table.locator('.k5-pagination [aria-live]')).toHaveText('11–20 de 125')

  // Ordenar vuelve a la primera página, ordenada por el servidor.
  await table.locator('th button', { hasText: 'Potencia' }).click()
  await expect(table.locator('th[aria-sort=ascending]')).toHaveText('Potencia')
  await expect(table.locator('.k5-pagination [aria-current=page]')).toHaveText('1')
  await expect(table.locator('tbody tr').first().locator('td').last()).toHaveText('3')

  // Columnas: ocultar Provincia; Cliente no se puede ocultar.
  await table.locator('.k5-data-table__toolbar button', { hasText: 'Columnas' }).click()
  const panel = table.locator('.k5-popover [role=dialog]')
  await expect(panel.locator('input[type=checkbox]')).toHaveCount(2)
  await panel.locator('label', { hasText: 'Provincia' }).locator('input').uncheck()
  await expect(table.locator('thead th')).toHaveText(['Cliente', 'Potencia'])
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(table.locator('.k5-data-table__toolbar button', { hasText: 'Columnas' })).toBeFocused()

  // Cabecera fija: al bajar dentro de la tabla, la fila de títulos se queda arriba.
  const wrap = table.locator('.k5-table-wrap')
  await wrap.evaluate((element) => (element.scrollTop = 200))
  const [top, header] = await Promise.all([wrap.boundingBox(), table.locator('thead th').first().boundingBox()])
  expect(Math.abs(header.y - top.y)).toBeLessThan(2)
  await wrap.evaluate((element) => (element.scrollTop = 0))

  // Filas virtuales: de 2000 filas solo hay unas pocas en el DOM, y al bajar llegan las demás.
  const virtual = page.locator('#virtuales .k5-data-table')
  const body = virtual.locator('tbody tr:not(.k5-data-table__spacer)')
  await expect(virtual.locator('table')).toHaveAttribute('aria-rowcount', '2001')
  await expect(body.first()).toHaveText(/Lectura 0001/)
  expect(await body.count()).toBeLessThan(60)
  const scroller = virtual.locator('.k5-table-wrap')
  const total = await scroller.evaluate((element) => element.scrollHeight)
  expect(total).toBeGreaterThan(2000 * 30)
  await scroller.evaluate((element) => (element.scrollTop = element.scrollHeight))
  await expect(virtual.locator('tbody tr', { hasText: 'Lectura 2000' })).toBeVisible()
  await expect(virtual.locator('tbody tr', { hasText: 'Lectura 2000' })).toHaveAttribute('aria-rowindex', '2001')
  expect(await body.count()).toBeLessThan(60)
  await scroller.evaluate((element) => (element.scrollTop = element.scrollHeight / 2))
  await expect(virtual.locator('tbody tr', { hasText: 'Lectura 1000' })).toBeVisible()
  // La cabecera sigue fija y la barra no salta: el alto total no cambia al bajar.
  expect(Math.abs((await scroller.evaluate((element) => element.scrollHeight)) - total)).toBeLessThan(100)

  // Agrupada: un título por provincia con su total; se pliega con el ratón y con el teclado.
  const grouped = page.locator('#agrupada .k5-data-table')
  const toggles = grouped.locator('.k5-data-table__group-toggle')
  await expect(toggles).toHaveText(['Madrid3', 'Valencia3', 'Sevilla3'])
  await expect(grouped.locator('tbody tr:not(.k5-data-table__group-row)')).toHaveCount(9)
  await toggles.first().click()
  await expect(toggles.first()).toHaveAttribute('aria-expanded', 'false')
  await expect(grouped.locator('tbody tr:not(.k5-data-table__group-row)')).toHaveCount(6)
  // «Seleccionar la página» deja fuera las filas plegadas.
  await grouped.locator('thead input[type=checkbox]').check()
  await expect(grouped.locator('.k5-data-table__selection')).toHaveText('6 filas seleccionadas')
  await toggles.first().focus()
  await page.keyboard.press('Enter')
  await expect(toggles.first()).toHaveAttribute('aria-expanded', 'true')
  await expect(toggles.first()).toBeFocused()
  await expect(grouped.locator('tbody tr:not(.k5-data-table__group-row)')).toHaveCount(9)
}
