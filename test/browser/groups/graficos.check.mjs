// Pruebas en navegador · grupo «gráficos»: lo que se dibuja, lo que leen los lectores de
// pantalla, el movimiento reducido y el ancho mínimo del flujo de energía. En React y en Vue.
// check(page, { expect, framework })
const vertices = (locator) => locator.evaluateAll((paths) => paths.map((p) => (p.getAttribute('d').match(/[ML]/g) ?? []).length))

export async function check(page, { expect }) {
  // Sparkline: siete puntos, el último marcado, y una imagen con nombre.
  const lines = page.locator('#graficos-lineas')
  const spark = lines.locator('.k5-sparkline')
  await expect(spark).toHaveAttribute('role', 'img')
  await expect(spark).toHaveAccessibleName('Producción de la semana: al alza')
  expect(await vertices(spark.locator('.k5-sparkline__line'))).toEqual([7])
  await expect(spark.locator('.k5-sparkline__dot')).toHaveCount(1)
  await expect(spark.locator('.k5-sparkline__area')).toHaveCount(1)

  // LineChart: dos líneas de siete puntos, el último de cada una marcado, y la tabla oculta.
  const chart = lines.locator('.k5-chart').first()
  expect(await vertices(chart.locator('.k5-chart__line'))).toEqual([7, 7])
  await expect(chart.locator('.k5-chart__point')).toHaveCount(2)
  await expect(chart.locator('.k5-chart__area')).toHaveCount(0)
  await expect(chart.locator('.k5-chart__column')).toHaveCount(7)
  await expect(chart.locator('.k5-chart__legend li')).toHaveText(['Producción', 'Consumo'])
  await expect(chart.locator('table caption')).toHaveText('Producción y consumo')
  await expect(chart.locator('table tbody tr')).toHaveCount(7)
  await expect(chart.locator('table tbody tr').first()).toHaveText('Lun31,2 kWh18,4 kWh')
  await expect(chart.locator('table tbody tr').last()).toHaveText('Dom30,9 kWh22,7 kWh')
  // El punto final cae en la última columna, a la altura de su valor (30,9 de 40).
  const plot = await chart.locator('.k5-chart__plot').boundingBox()
  const dot = await chart.locator('.k5-chart__point').first().boundingBox()
  expect(Math.abs(dot.x + dot.width / 2 - (plot.x + plot.width * (13 / 14)))).toBeLessThan(2)
  expect(Math.abs(dot.y + dot.height / 2 - (plot.y + plot.height * (1 - 30.9 / 40)))).toBeLessThan(2)
  // AreaChart: el área rellena por defecto, sin leyenda con una sola serie.
  const area = lines.locator('.k5-chart').nth(1)
  await expect(area.locator('.k5-chart__area')).toHaveCount(1)
  await expect(area.locator('.k5-chart__legend')).toHaveCount(0)

  // Donut: dos porciones, nombre con los porcentajes y lista oculta con los valores.
  const donuts = page.locator('#graficos-donut .k5-donut')
  const ring = donuts.first().locator('[role=img]')
  await expect(ring).toHaveAccessibleName('Energía producida hoy: Autoconsumo 68 %, Excedentes 32 %')
  await expect(donuts.first().locator('.k5-donut__segment')).toHaveCount(2)
  await expect(donuts.first().locator('.k5-sr-only li')).toHaveText(['Autoconsumo: 13,6 kWh (68 %)', 'Excedentes: 6,4 kWh (32 %)'])
  await expect(donuts.first().locator('.k5-donut__center')).toHaveText('68 %Autoconsumo')
  await expect(donuts.nth(1).locator('.k5-donut__segment')).toHaveCount(1)
  await expect(donuts.nth(1).locator('.k5-sr-only li')).toHaveText(['Cobertura solar: 68 % (6,8 de 10 kWh)'])

  // Meter: role meter con sus valores; la barra al 72 % y 7 de 10 segmentos encendidos.
  const meters = page.locator('#graficos-meter [role=meter]')
  await expect(meters).toHaveCount(2)
  await expect(meters.first()).toHaveAccessibleName('Carga de batería')
  await expect(meters.first()).toHaveAttribute('aria-valuenow', '72')
  await expect(meters.first()).toHaveAttribute('aria-valuetext', '72 %')
  await expect(meters.first()).toHaveClass(/k5-meter--good/)
  const track = await meters.first().locator('.k5-meter__track').boundingBox()
  const fill = await meters.first().locator('.k5-meter__fill').boundingBox()
  expect(Math.abs(fill.width / track.width - 0.72)).toBeLessThan(0.01)
  await expect(meters.nth(1).locator('.k5-meter__segment')).toHaveCount(10)
  await expect(meters.nth(1).locator('.k5-meter__segment--on')).toHaveCount(7)

  // EnergyFlow: cuatro nodos con su línea y su flecha, resumen y lista oculta.
  const energy = page.locator('#graficos-energia .k5-energy')
  const diagram = energy.locator('[role=img]')
  await expect(diagram).toHaveAccessibleName(
    'Flujo de energía. Placas: 5,8 kW · Produciendo. Red: 2,1 kW · Exportando. Casa: 2,1 kW · Consumiendo. Batería: 1,6 kW · Cargando · Carga: 72 %',
  )
  await expect(energy.locator('.k5-energy__node')).toHaveCount(4)
  await expect(energy.locator('.k5-energy__line')).toHaveCount(4)
  await expect(energy.locator('.k5-energy__arrow')).toHaveCount(4)
  await expect(energy.locator('.k5-energy__node--solar .k5-energy__value')).toHaveText('5,8 kW')
  await expect(energy.locator('.k5-energy__node--grid .k5-energy__state')).toHaveText('Exportando')
  await expect(energy.locator('.k5-sr-only li')).toHaveText([
    'Placas: 5,8 kW · Produciendo',
    'Red: 2,1 kW · Exportando',
    'Casa: 2,1 kW · Consumiendo',
    'Batería: 1,6 kW · Cargando · Carga: 72 %',
  ])
  // Sentido: la red exporta (flecha a la izquierda) y la batería carga (flecha hacia abajo).
  await expect(energy.locator('.k5-energy__line--grid')).toHaveClass(/k5-energy__line--left/)
  await expect(energy.locator('.k5-energy__line--battery')).toHaveClass(/k5-energy__line--down/)
  const animation = (selector) => energy.locator(selector).evaluate((el) => getComputedStyle(el, '::before').animationName)
  expect(await animation('.k5-energy__line--solar')).toBe('k5-energy-y')
  expect(await animation('.k5-energy__line--grid')).toBe('k5-energy-x')
  // Sin batería ni red, esos nodos no aparecen; sin producción, la línea queda apagada.
  const night = page.locator('#graficos-noche .k5-energy')
  await expect(night.locator('.k5-energy__node')).toHaveCount(2)
  await expect(night.locator('.k5-energy__line--off')).toHaveCount(1)
  await expect(night.locator('.k5-energy__arrow')).toHaveCount(1)
  // Con «reducir movimiento» no hay animación, pero las flechas siguen ahí.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => animation('.k5-energy__line--solar')).toBe('none')
  await expect(energy.locator('.k5-energy__arrow').first()).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  // A 320 px de ancho cabe sin desbordar, y los nodos no se pisan.
  const viewport = page.viewportSize()
  await page.setViewportSize({ width: 320, height: viewport.height })
  await expect
    .poll(() => diagram.evaluate((el) => el.scrollWidth <= el.clientWidth && el.getBoundingClientRect().right <= innerWidth))
    .toBe(true)
  const boxes = await energy.locator('.k5-energy__node').evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().toJSON()))
  for (const a of boxes)
    for (const b of boxes) if (a !== b) expect(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top).toBe(true)
  await page.setViewportSize(viewport)
  // Deja la página como estaba: sin desplazamiento horizontal.
  await page.evaluate(() => scrollTo(0, scrollY))

  // Kpi con trend: sparkline decorativa bajo la cifra, del color de la variación.
  const kpis = page.locator('#graficos-kpi .k5-kpi')
  await expect(kpis.locator('.k5-kpi__trend')).toHaveCount(2)
  await expect(kpis.first().locator('.k5-kpi__trend')).toHaveAttribute('aria-hidden', 'true')
  await expect(kpis.first().locator('.k5-kpi__trend')).toHaveClass(/k5-sparkline--success/)
  await expect(kpis.nth(1).locator('.k5-kpi__trend')).toHaveClass(/k5-sparkline--danger/)
  expect(await vertices(kpis.nth(1).locator('.k5-sparkline__line'))).toEqual([5])
}

// Gráficos interactivos (0.4): tarjeta al pasar el ratón y recorrido con flechas, anunciado en voz.
export async function checkInteractive(page, { expect }) {
  const chart = page.locator('#graficos-lineas .k5-chart').first()
  const body = chart.locator('.k5-chart__body')
  const plot = chart.locator('.k5-chart__plot')
  const days = await chart.locator('.k5-chart__category').allTextContents()
  const tooltip = plot.locator('.k5-chart__tooltip')
  const spoken = body.locator('[aria-live=polite]')

  await expect(body).toHaveAttribute('role', 'group')
  await expect(body).toHaveAccessibleName('Producción y consumo')
  await expect(body).toHaveAccessibleDescription('Usa las flechas para recorrer los datos.')

  // Ratón: sobre el primer día sale su tarjeta con las dos series, el cursor y los puntos del día.
  await plot.scrollIntoViewIfNeeded()
  const box = await plot.boundingBox()
  await page.mouse.move(box.x + box.width * 0.05, box.y + box.height / 2)
  await expect(tooltip.locator('.k5-chart__tooltip-title')).toHaveText(days[0])
  await expect(tooltip.locator('.k5-chart__tooltip-row')).toHaveCount(2)
  await expect(tooltip).toHaveClass(/k5-chart__tooltip--after/)
  await expect(plot.locator('.k5-chart__crosshair')).toHaveCount(1)
  await expect(plot.locator('.k5-chart__point--active')).toHaveCount(2)
  await expect(spoken).toHaveText('')
  await page.mouse.move(box.x + box.width * 0.95, box.y + box.height / 2)
  await expect(tooltip.locator('.k5-chart__tooltip-title')).toHaveText(days.at(-1))
  await expect(tooltip).toHaveClass(/k5-chart__tooltip--before/)
  await page.mouse.move(box.x + box.width / 2, box.y + box.height + 200)
  await expect(tooltip).toHaveCount(0)

  // Teclado: la primera flecha entra por el principio; Fin va al último; se anuncia cada dato.
  await body.focus()
  await page.keyboard.press('ArrowRight')
  await expect(tooltip.locator('.k5-chart__tooltip-title')).toHaveText(days[0])
  await expect(spoken).toContainText(`${days[0]}: Producción`)
  await page.keyboard.press('End')
  await page.keyboard.press('ArrowLeft')
  await expect(spoken).toContainText(`${days.at(-2)}:`)
  await expect(plot.locator('.k5-chart__column[data-active]')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(tooltip).toHaveCount(0)

  // BarChart: el grupo activo se resalta y la tarjeta lleva una fila por serie apilada.
  const bars = page.locator('#chart .k5-chart')
  await bars.locator('.k5-chart__body').focus()
  await page.keyboard.press('Home')
  await expect(bars.locator('.k5-chart__group[data-active]')).toHaveCount(1)
  await expect(bars.locator('.k5-chart__tooltip-row')).toHaveText(['Autoconsumo210 kWh', 'Excedentes85 kWh'])
  await page.keyboard.press('Tab')
  await expect(bars.locator('.k5-chart__tooltip')).toHaveCount(0)
}
