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
}
