// Pruebas en navegador · grupo «maquetación y tipografía»: teclado, foco y comportamiento, en React y en Vue.
// Se ejecuta antes de la pasada de axe, que también revisa lo que pinta maquetacion.fixture.mjs.
// check(page, { expect, framework })
export async function check(page, { expect }) {
  const layout = page.locator('#maq-layout')
  const container = layout.locator('.k5-container')
  // Container md: 60rem como máximo y 24 px de margen lateral desde 768 px.
  await expect(container).toHaveCSS('max-width', '960px')
  await expect(container).toHaveCSS('padding-left', '24px')
  // Stack: columna con hueco 6 por fuera; fila con hueco 2 y reparto between por dentro.
  const outer = container.locator('> .k5-stack')
  await expect(outer).toHaveCSS('flex-direction', 'column')
  await expect(outer).toHaveCSS('row-gap', '24px')
  const row = outer.locator('> .k5-stack--row')
  await expect(row).toHaveCSS('flex-direction', 'row')
  await expect(row).toHaveCSS('justify-content', 'space-between')
  await expect(row).toHaveCSS('column-gap', '8px')
  await expect(row.locator('h2')).toHaveText('Instalaciones')
  // Grid: tres columnas en escritorio y una por debajo de 600 px; la automática cabe en dos.
  // Columnas con ancho: auto-fit deja a 0 px las que no tienen elemento.
  const tracks = (locator) =>
    locator.evaluate(
      (el) =>
        getComputedStyle(el)
          .gridTemplateColumns.split(' ')
          .filter((w) => parseFloat(w) > 0).length,
    )
  const fixed = layout.locator('.k5-grid--cols-3')
  const auto = layout.locator('.k5-grid--auto')
  expect(await tracks(fixed)).toBe(3)
  expect(await tracks(auto)).toBe(2)
  const viewport = page.viewportSize()
  await page.setViewportSize({ width: 480, height: viewport.height })
  await expect.poll(() => tracks(fixed)).toBe(1)
  await expect(container).toHaveCSS('padding-left', '16px')
  await page.setViewportSize(viewport)
  await expect.poll(() => tracks(fixed)).toBe(3)

  // Tipografía: tamaños de la escala, tracking en display y colores de estado.
  const type = page.locator('#maq-type')
  const display = type.locator('h3.k5-heading--display')
  await expect(display).toHaveCSS('font-size', '40px')
  await expect(display).toHaveCSS('font-weight', '600')
  await expect(display).toHaveCSS('letter-spacing', '-1.2px')
  await expect(type.locator('h3.k5-heading--lead')).toHaveCSS('font-size', '16px')
  await expect(type.locator('p.k5-heading--heading')).toHaveCSS('font-size', '20px')
  await expect(type.locator('p.k5-text--lead')).toHaveCSS('line-height', '24px')
  const token = (name) =>
    type.evaluate((el, n) => {
      const probe = document.createElement('span')
      probe.style.color = `var(${n})`
      el.append(probe)
      const color = getComputedStyle(probe).color
      probe.remove()
      return color
    }, name)
  await expect(type.locator('.k5-text--danger')).toHaveCSS('color', await token('--k5-destructive-text'))
  await expect(type.locator('.k5-text--danger')).toHaveCSS('font-weight', '500')
  // truncate: una sola línea con puntos suspensivos.
  const long = type.locator('.k5-text--truncate')
  await expect(long).toHaveCSS('text-overflow', 'ellipsis')
  await expect(long).toHaveCSS('white-space', 'nowrap')
  expect(await long.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
}
