// Pruebas en navegador · grupo «formularios» (0.4): enviar, foco, corregir y resumen de errores,
// igual con react-hook-form (React) que con VeeValidate (Vue).
// check(page, { expect, framework })
export async function check(page, { expect }) {
  const form = page.locator('#formularios form')
  const summary = form.locator('.k5-error-summary')
  const input = (name) => form.locator(`[data-k5-field$="-${name}"] input:not([type=hidden])`).first()
  const error = (name) => form.locator(`[data-k5-field$="-${name}"] .k5-field__error`)
  const send = form.locator('button[type=submit]')

  // Vacío: el resumen lista los cuatro obligatorios y el foco va al primero.
  await expect(summary).toHaveCount(0)
  await send.click()
  await expect(summary).toHaveAttribute('role', 'alert')
  await expect(summary.locator('h2')).toHaveText('Revisa 4 campos antes de continuar')
  await expect(summary.locator('a')).toHaveText([
    'Titular: Este campo es obligatorio',
    'NIF del titular: Este campo es obligatorio',
    'Provincia: Este campo es obligatorio',
    'Condiciones: Este campo es obligatorio',
  ])
  await expect(input('titular')).toBeFocused()
  await expect(input('titular')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.locator('#formularios output')).toHaveText('')

  // Tras enviar, se valida al escribir: el error y su línea del resumen se van.
  await input('titular').fill('Lucía Fernández')
  await expect(error('titular')).toHaveCount(0)
  await expect(summary.locator('a')).toHaveCount(3)

  // NIF: el error de formato lo pone el propio campo y se ve una sola vez.
  await input('nif').fill('12345678A')
  await expect(error('nif')).toHaveText('La letra del DNI no coincide.')
  await expect(form.locator('[data-k5-field$="-nif"] .k5-field__error')).toHaveCount(1)
  await input('nif').fill('12345678Z')
  await expect(error('nif')).toHaveCount(0)

  // Un enlace del resumen lleva al campo.
  await summary.locator('a', { hasText: 'Provincia' }).click()
  await expect(input('provincia')).toBeFocused()
  await page.keyboard.type('Mad')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(error('provincia')).toHaveCount(0)

  // Una comprobación propia, con su mensaje.
  await input('kwp').fill('20')
  await expect(error('kwp')).toHaveText('Como mucho 15 kWp')
  await input('kwp').fill('8,4')
  await expect(error('kwp')).toHaveCount(0)

  await form.locator('[data-k5-field$="-acepto"] input[type=checkbox]').check()
  await expect(summary).toHaveCount(0)
  await send.click()
  await expect(page.locator('#formularios output')).not.toHaveText('')
  expect(JSON.parse(await page.locator('#formularios output').textContent())).toEqual({
    titular: 'Lucía Fernández',
    nif: '12345678Z',
    kwp: 8.4,
    provincia: 'md',
    acepto: true,
  })
}
