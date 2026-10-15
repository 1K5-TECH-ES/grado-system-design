// Pruebas en navegador · grupo «datos y piezas»: teclado, foco y comportamiento, en React y en Vue.
// Se ejecuta antes de la pasada de axe, que también revisa lo que pinta datos.fixture.mjs.
// check(page, { expect, framework })
export async function check(page, { expect }) {
  // CopyButton: copia con teclado, lo anuncia y vuelve al estado inicial a los 2 s.
  const copy = page.locator('#datos-copy .k5-copy').first()
  await copy.locator('button').focus()
  await page.keyboard.press('Enter')
  await expect(copy.locator('[role=status]')).toHaveText('Copiado')
  await expect(copy.locator('button')).toHaveText('Copiado')
  await expect(page.locator('#datos-copy output')).toHaveText('1')
  await expect(copy.locator('button')).toBeFocused()
  await expect(copy.locator('button')).toHaveText('Copiar', { timeout: 4000 })
  await expect(copy.locator('[role=status]')).toHaveText('')
  const icon = page.locator('#datos-copy .k5-copy').nth(1).locator('button')
  await expect(icon).toHaveAttribute('aria-label', 'Copiar CUPS')
  await icon.click()
  await expect(page.locator('#datos-copy .k5-copy').nth(1).locator('[role=status]')).toHaveText('Copiado')
  // Sin permiso de lectura del portapapeles no se puede comprobar el contenido: solo el anuncio.
  const pasted = await page.evaluate(() =>
    Promise.race([navigator.clipboard.readText().catch(() => null), new Promise((done) => setTimeout(() => done(null), 1000))]),
  )
  if (pasted != null) expect(pasted).toBe('ES0021000012345678AB')

  // Tag: al quitar una etiqueta, el foco pasa a la siguiente; en la última, a la anterior.
  const tags = page.locator('#datos-tags > div .k5-tag')
  await tags.first().locator('button').focus()
  await page.keyboard.press('Enter')
  await expect(tags).toHaveCount(3)
  await expect(tags.first()).toHaveText('Valencia')
  await expect(tags.first().locator('button')).toBeFocused()
  await tags.last().locator('button').click()
  await expect(tags).toHaveCount(2)
  await expect(tags.last().locator('button')).toBeFocused()
  await expect(tags.last().locator('button')).toHaveAttribute('aria-label', 'Quitar Sevilla')
  await expect(page.locator('#datos-tags > .k5-tag button')).toBeDisabled()

  // Progress: valores accesibles.
  const bars = page.locator('#datos-progress [role=progressbar]')
  await expect(bars.first()).toHaveAttribute('aria-valuenow', '64')
  await expect(bars.first()).toHaveAccessibleName('Subida de la memoria técnica')
  await expect(bars.nth(1)).not.toHaveAttribute('aria-valuenow', /.*/)
  await expect(bars.nth(2)).toHaveAttribute('aria-valuetext', 'Paso 3 de 5')

  // DescriptionList: el botón de copiar de la ficha copia el CUPS.
  const cups = page.locator('#datos-ficha dd button').first()
  await expect(cups).toHaveAccessibleName('Copiar CUPS')
  await cups.click()
  await expect(page.locator('#datos-ficha dd [role=status]').first()).toHaveText('Copiado')

  // Link externo: nueva pestaña segura y aviso para lectores de pantalla.
  const external = page.locator('#datos-piezas a[target=_blank]')
  await expect(external).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(external).toHaveAccessibleName('Sede del Catastro (se abre en otra pestaña)')
  // Con teclado (Tab desde el enlace anterior) el foco es visible.
  await external.focus()
  await page.keyboard.press('Tab')
  await expect(page.locator('#datos-piezas a[href="#datos-ficha"]')).toBeFocused()
  await expect(page.locator('#datos-piezas a[href="#datos-ficha"]')).toHaveCSS('outline-style', 'solid')

  // AvatarGroup y Separator.
  await expect(page.locator('#datos-piezas .k5-avatar-group [role=img]')).toHaveCount(4)
  await expect(page.locator('#datos-piezas .k5-avatar-group .k5-sr-only')).toHaveText('y 2 más')
  await expect(page.locator('#datos-piezas [role=separator]')).toHaveAttribute('aria-orientation', 'horizontal')
}
