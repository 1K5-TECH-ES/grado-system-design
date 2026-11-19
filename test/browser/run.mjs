import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:http'
import { build } from 'esbuild'
import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { check as maquetacionCheck } from './groups/maquetacion.check.mjs'
import { check as datosCheck } from './groups/datos.check.mjs'
import { check as graficosCheck, checkInteractive as graficosInteractiveCheck } from './groups/graficos.check.mjs'
import { check as entradasCheck } from './groups/entradas.check.mjs'
import { check as superposicionesCheck } from './groups/superposiciones.check.mjs'
import { check as formulariosCheck } from './groups/formularios.check.mjs'
import { check as tablasCheck } from './groups/tablas.check.mjs'
import { check as energiaCheck } from './groups/energia.check.mjs'
import { check as labsCheck } from './groups/labs.check.mjs'
import { checkElements, page as elementsPage } from './elements.check.mjs'

// Análisis de accesibilidad: axe-core con las reglas de WCAG 2.2 A y AA.
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
async function axe(page, label) {
  if (!(await page.evaluate(() => 'axe' in window))) await page.addScriptTag({ content: axeSource })
  const result = await page.evaluate((tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }), AXE_TAGS)
  const detail = (n) => {
    const d = n.any?.[0]?.data
    return d?.contrastRatio ? ` [${d.fgColor} sobre ${d.bgColor} = ${d.contrastRatio}]` : ''
  }
  const problems = result.violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.nodes
        .slice(0, process.env.AXE_ALL ? 99 : 3)
        .map((n) => n.target.join(' ') + detail(n))
        .join(' | ')}`,
  )
  if (problems.length && process.env.AXE_ALL) {
    console.log(`axe · ${label}:\n  ${problems.join('\n  ')}`)
    return
  }
  if (problems.length) throw new Error(`axe · ${label}:\n  ${problems.join('\n  ')}`)
}

const directory = mkdtempSync(join(tmpdir(), 'grado-browser-'))
const root = new URL('../../', import.meta.url)
await build({
  entryPoints: [fileURLToPath(new URL('test/browser/fixture.mjs', root))],
  outfile: join(directory, 'fixture.js'),
  bundle: true,
  platform: 'browser',
  define: {
    'process.env.NODE_ENV': '"development"',
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
})
mkdirSync(join(directory, 'themes'))
for (const file of ['grado.css', 'tokens.css', 'labs.css', 'themes/campo.css'])
  writeFileSync(join(directory, file), readFileSync(new URL(`packages/grado/dist/${file}`, root)))
// grado-elements: una página HTML sin framework con el archivo para usar sin bundler.
writeFileSync(join(directory, 'grado-elements.min.js'), readFileSync(new URL('packages/grado-elements/dist/grado-elements.min.js', root)))
writeFileSync(join(directory, 'elements.html'), elementsPage)
writeFileSync(
  join(directory, 'index.html'),
  '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Grado · pruebas</title><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="themes/campo.css"><link rel="stylesheet" href="grado.css"><link rel="stylesheet" href="labs.css"><style>*{box-sizing:border-box}body{font:14px system-ui;margin:0;background:var(--k5-background);color:var(--k5-foreground)}section{max-width:800px}input{font:inherit}</style></head><body><div id="app"></div><script src="fixture.js"></script></body></html>',
)
const server = createServer((request, response) => {
  const pathname = new URL(request.url, 'http://local').pathname
  const path = resolve(directory, `.${pathname === '/' ? '/index.html' : pathname}`)
  if (!path.startsWith(directory + '/')) {
    response.writeHead(403).end()
    return
  }
  try {
    response.setHeader(
      'Content-Type',
      { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[extname(path)] ?? 'application/octet-stream',
    )
    response.end(readFileSync(path))
  } catch {
    response.writeHead(404).end()
  }
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const base = `http://127.0.0.1:${server.address().port}`
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : undefined)
const browser = await chromium.launch({ headless: true, executablePath })
try {
  for (const framework of ['react', 'vue']) {
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`${base}/?framework=${framework}`)
    await page.locator('#dialog > button').click()
    await expect(page.locator('#dialog dialog')).toBeVisible()
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
    // Escape con un Tooltip abierto dentro quita solo el tooltip; el siguiente Escape cierra el diálogo.
    await page.locator('#dialog .k5-tooltip button').focus()
    await expect(page.locator('#dialog [role=tooltip]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#dialog [role=tooltip]')).toHaveCount(0)
    await expect(page.locator('#dialog dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#dialog dialog')).not.toBeVisible()
    await expect(page.locator('#dialog > button')).toBeFocused()
    await page.locator('#alert > button').click()
    await page.mouse.click(5, 5)
    await expect(page.locator('#alert dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#alert output')).toHaveCount(0)
    await page.locator('#drawer > button').click()
    await expect(page.locator('#drawer dialog')).toBeVisible()
    await page.locator('#drawer .k5-close').click()
    // Drawer sin velo: la lista sigue usable detrás, Escape lo cierra y el foco vuelve a la última fila.
    const preview = page.locator('#preview dialog')
    await page.locator('#preview > button', { hasText: 'Fila 1' }).click()
    await expect(preview).toBeVisible()
    await expect(preview).not.toHaveAttribute('aria-modal', 'true')
    await page.locator('#preview > button', { hasText: 'Fila 2' }).click()
    await expect(preview.locator('.k5-dialog__title')).toHaveText('Fila 2')
    await expect(preview).toBeVisible()
    await preview.locator('.k5-close').focus()
    await page.keyboard.press('Escape')
    await expect(preview).toBeHidden()
    await expect(page.locator('#preview > button', { hasText: 'Fila 2' })).toBeFocused()
    // Pantalla completa sin cabecera: Escape no la cierra (la app lo usa), el botón de la app sí.
    await page.locator('#editor > button').click()
    await expect(page.locator('#editor dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#editor dialog')).toBeVisible()
    // Se mide al acabar la animación de entrada (escala).
    await page.waitForFunction(() => document.querySelector('#editor dialog').getAnimations().length === 0)
    const editor = await page.locator('#editor dialog').boundingBox()
    assert.ok(Math.abs(editor.x - 16) < 2 && Math.abs(editor.width - (1100 - 32)) < 2, `${framework}: editor a pantalla completa`)
    await page.locator('#editor dialog button').click()
    await expect(page.locator('#editor dialog')).not.toBeVisible()
    // Con el preflight de Tailwind 4 (margin: 0 en todo), el diálogo sigue centrado.
    const reset = await page.addStyleTag({ content: '*, ::before, ::after { margin: 0 }' })
    await page.locator('#dialog > button').click()
    await page.waitForFunction(() => document.querySelector('#dialog dialog').getAnimations().length === 0)
    const box = await page.locator('#dialog dialog').boundingBox()
    assert.ok(Math.abs(box.x + box.width / 2 - 550) < 2, `${framework}: diálogo centrado con margin: 0`)
    // Pulsar en el campo y soltar en el fondo (seleccionar texto arrastrando) no lo cierra; un clic en el fondo, sí.
    const field = await page.locator('#dialog dialog input').boundingBox()
    await page.mouse.move(field.x + 4, field.y + field.height / 2)
    await page.mouse.down()
    await page.mouse.move(5, 5, { steps: 4 })
    await page.mouse.up()
    await expect(page.locator('#dialog dialog')).toBeVisible()
    await page.mouse.click(5, 5)
    await expect(page.locator('#dialog dialog')).not.toBeVisible()
    await reset.evaluate((node) => node.remove())
    await page.locator('#tabs [role=tab]').first().focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('#tabs [role=tab]').last()).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('#tabs [role=tabpanel]').last()).toBeVisible()
    await page.locator('#checkbox input').check()
    await expect(page.locator('#checkbox output')).toHaveText('true')
    await page.locator('#radio input').first().focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('#radio input').last()).toBeChecked()
    await page.locator('#combo input[role=combobox]').fill('lucia')
    await expect(page.locator('#combo [role=option]')).toHaveCount(1)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.locator('#combo output')).toHaveText('a')
    await page.locator('#combo input[role=combobox]').click()
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Enter')
    await expect(page.locator('#combo output')).toHaveText('b')
    await page.locator('#combo input[role=combobox]').fill('zzzz')
    await expect(page.locator('#combo .k5-combobox__empty')).toHaveText('No hay resultados')
    await page.keyboard.press('Escape')
    await expect(page.locator('#combo input[role=combobox]')).toHaveValue('Marta Ruiz')
    // Fecha escrita: lo que se escribe propone fechas; Enter elige y el valor es ISO.
    const due = page.locator('#natural-date input[role=combobox]')
    await due.fill('en 2 semanas')
    await expect(page.locator('#natural-date [role=option]')).toHaveText(['Dentro de 2 semanas · jue, 3 dic'])
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.locator('#natural-date output')).toHaveText('2026-12-03')
    await expect(due).toHaveValue('jue, 3 dic')
    await due.fill('zzz')
    await expect(page.locator('#natural-date .k5-combobox__empty')).toHaveText('Escribe una fecha: mañana, viernes, en 2 semanas, 20/11')
    await page.keyboard.press('Escape')
    await expect(due).toHaveValue('jue, 3 dic')
    // Escape vacía la búsqueda y avisa: al volver a abrir, las fechas de partida.
    await due.click()
    await expect(page.locator('#natural-date [role=option]').first()).toHaveText('Hoy · jue, 19 nov')
    await page.keyboard.press('Escape')
    // «Crear "…"»: solo si lo escrito no es ya una opción; elegirlo crea y selecciona.
    const creatable = page.locator('#creatable input[role=combobox]')
    await creatable.fill('urgente')
    await expect(page.locator('#creatable .k5-combobox__create')).toHaveCount(0)
    await creatable.fill('Revisión')
    await expect(page.locator('#creatable [role=option]')).toHaveText(['Crear «Revisión»'])
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.locator('#creatable output')).toHaveText('revisión')
    await expect(creatable).toHaveValue('Revisión')
    await expect(creatable).toBeFocused()
    await page.locator('#menu button').click()
    await expect(page.locator('#menu [role=menuitem]').first()).toBeFocused()
    // El atajo se anuncia con aria-keyshortcuts y las teclas pintadas no entran en el nombre.
    await expect(page.locator('#menu [role=menuitem]').first()).toHaveAttribute('aria-keyshortcuts', 'Meta+E')
    await expect(page.locator('#menu [role=menuitem]').first()).toHaveAccessibleName('Editar')
    expect((await page.locator('#menu [role=menu]').boundingBox()).x).toBeGreaterThanOrEqual(0)
    await page.locator('#menu [role=menuitem]').nth(1).hover()
    await expect(page.locator('#menu [role=menuitem]').nth(1)).not.toBeFocused()
    await page.locator('#menu [role=menuitem]').nth(2).hover()
    await expect(page.locator('#menu [role=menuitem]').nth(2)).toBeFocused()
    await page.locator('#menu [role=menuitem]').first().focus()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.locator('#menu output')).toHaveText('delete')
    await page.locator('#tooltip button').focus()
    await expect(page.locator('#tooltip [role=tooltip]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#tooltip [role=tooltip]')).toHaveCount(0)
    await page.locator('#toast > button').click()
    await expect(page.locator('.k5-toast')).toBeVisible()
    await page.locator('.k5-toast').hover()
    await page.waitForTimeout(650)
    await expect(page.locator('.k5-toast')).toBeVisible()
    await page.mouse.move(1050, 0)
    await expect(page.locator('.k5-toast')).toHaveCount(0, { timeout: 1500 })
    // toast(): tres a la vez, el cuarto espera; la acción se ejecuta y cierra el aviso.
    const toasts = page.locator('.k5-toaster .k5-toast')
    await page.locator('#toaster button').filter({ hasText: 'Avisar' }).click()
    await expect(toasts).toHaveCount(3)
    await expect(page.locator('.k5-toaster')).not.toContainText('Instalación programada')
    await expect(page.locator('.k5-toaster [role=alert]')).toContainText('No se ha podido guardar')
    // axe mide el contraste: espera a que termine la entrada animada de los avisos.
    await page.waitForFunction(() =>
      document
        .getAnimations()
        .filter((animation) => animation.effect?.target?.closest?.('.k5-toaster'))
        .every((animation) => animation.playState !== 'running'),
    )
    await axe(page, `${framework} · Toaster con avisos`)
    await expect(page.locator('.k5-toaster button').filter({ hasText: 'Deshacer' })).toHaveAttribute('aria-keyshortcuts', 'Meta+Z')
    await expect(page.locator('.k5-toaster button').filter({ hasText: 'Deshacer' })).toHaveAccessibleName('Deshacer')
    await page.locator('.k5-toaster button').filter({ hasText: 'Deshacer' }).click()
    await expect(page.locator('#toaster output')).toHaveText('true')
    await expect(toasts).toHaveCount(3)
    await expect(page.locator('.k5-toaster')).toContainText('Instalación programada')
    await toasts.first().locator('.k5-close').focus()
    await page.keyboard.press('Escape')
    await expect(toasts).toHaveCount(2)
    await page.locator('#toaster button').filter({ hasText: 'Cerrar avisos' }).click()
    await expect(toasts).toHaveCount(0)
    await page.locator('#pagination [aria-label="Página siguiente"]').click()
    await expect(page.locator('#pagination [aria-current=page]')).toHaveText('2')
    await page.locator('#range input').first().fill('2026-11-01')
    await expect(page.locator('#range [role=alert]')).toContainText('posterior')
    await page.locator('#range input').last().fill('2026-11-10')
    await expect(page.locator('#range [role=alert]')).toHaveCount(0)
    await page.locator('#upload input[type=file]').setInputFiles({ name: 'nota.txt', mimeType: 'text/plain', buffer: Buffer.from('test') })
    await expect(page.locator('#upload [role=alert]')).toContainText('formato')
    await page
      .locator('#upload input[type=file]')
      .setInputFiles({ name: 'memoria.pdf', mimeType: 'application/pdf', buffer: Buffer.from('pdf') })
    await expect(page.locator('#upload .k5-upload__file')).toContainText('memoria.pdf')
    await page.locator('#upload .k5-close').click()
    await expect(page.locator('#upload .k5-upload__file')).toHaveCount(0)
    await page.locator('#stepper button').last().click()
    await expect(page.locator('#stepper [aria-current=step]')).toContainText('Oferta')
    await expect(page.locator('#stepper li').first()).toContainText('Cliente, completado')
    await page.locator('#filters input').fill('Lucía')
    // Filtro en partes: cada parte es un botón; el grupo lleva la frase entera.
    const parts = page.locator('#filters .k5-chip--parts')
    await expect(parts).toHaveAttribute('aria-label', 'Provincia es Madrid')
    await parts.locator('.k5-chip__operator').click()
    await expect(parts).toHaveAttribute('aria-label', 'Provincia no es Madrid')
    await parts.locator('.k5-chip__value').focus()
    await page.keyboard.press('Enter')
    await expect(parts.locator('.k5-chip__value')).toHaveText('Valencia')
    await parts.locator('.k5-chip__remove').click()
    await expect(page.locator('#filters .k5-chip')).toHaveCount(1)
    await page.locator('#filters .k5-chip__remove').click()
    await expect(page.locator('#filters .k5-chip')).toHaveCount(0)
    await expect(page.locator('#filters input')).toBeFocused()
    await page.locator('#filters button').filter({ hasText: 'Limpiar' }).click()
    await expect(page.locator('#filters input')).toHaveValue('')
    await page.locator('#accordion button').first().click()
    await expect(page.locator('#accordion [role=region]').first()).toBeVisible()
    await page.locator('#accordion button').last().click()
    await expect(page.locator('#accordion [role=region]').first()).not.toBeVisible()
    await page.locator('#table th button').filter({ hasText: 'Potencia' }).click()
    await expect(page.locator('#table tbody tr').first()).toContainText('Ana')
    await page.locator('#table thead input').check()
    await expect(page.locator('#table .k5-data-table__selection')).toHaveText('2 filas seleccionadas')
    await page.locator('#table [aria-label="Página siguiente"]').click()
    await expect(page.locator('#table tbody input').first()).not.toBeChecked()
    await page.locator('#table tbody input').first().check()
    await expect(page.locator('#table .k5-data-table__selection')).toHaveText('3 filas seleccionadas')
    await page.locator('#table [aria-label="Página 3"]').click()
    await page.locator('#table > button').click()
    await expect(page.locator('#table tbody tr')).toHaveCount(1)
    await expect(page.locator('#table [aria-current=page]')).toHaveText('1')
    // Componentes básicos: el interruptor responde a Espacio y anuncia su estado.
    const toggle = page.locator('#base [role=switch]')
    await expect(toggle).toHaveAccessibleName(/Respuesta automática/)
    await toggle.focus()
    await page.keyboard.press('Space')
    await expect(page.locator('#base output')).toHaveText('true')
    await expect(page.locator('#base [aria-busy=true]')).toBeDisabled()
    // NumberInput: coma decimal, flechas, límites y botones.
    const number = page.locator('#number input[role=spinbutton]')
    await expect(number).toHaveValue('8,4')
    await expect(number).toHaveAccessibleName('Potencia instalada')
    await number.focus()
    await page.keyboard.press('ArrowUp')
    await expect(page.locator('#number output')).toHaveText('8.5')
    await number.fill('12,75')
    await expect(page.locator('#number output')).toHaveText('12.8')
    await number.fill('99')
    await page.keyboard.press('Tab')
    await expect(number).toHaveValue('20')
    await page.locator('#number [aria-label="Reducir"]').click()
    await expect(number).toHaveValue('19,9')
    await expect(page.locator('#number input[type=hidden]')).toHaveValue('19.9')
    // SegmentedControl: flechas mueven y eligen; la opción desactivada se salta.
    await page.locator('#segmented [aria-checked=true]').focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('#segmented output')).toHaveText('d')
    await expect(page.locator('#segmented [role=radio]').first()).toBeFocused()
    await page.keyboard.press('ArrowLeft')
    await expect(page.locator('#segmented output')).toHaveText('m')
    // MultiSelect: busca, marca con Enter sin cerrar y quita con Retroceso.
    const multi = page.locator('#multi input[role=combobox]')
    await multi.click()
    await multi.fill('val')
    await expect(page.locator('#multi [role=option]')).toHaveCount(1)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.locator('#multi output')).toHaveText('md,vc')
    await expect(page.locator('#multi [role=listbox]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#multi [role=listbox]')).toHaveCount(0)
    await page.keyboard.press('Backspace')
    await expect(page.locator('#multi output')).toHaveText('md')
    await page.locator('#multi .k5-chip__remove').click()
    await expect(page.locator('#multi output')).toHaveText('')
    // Calendar: periodo en dos clics y navegación con teclado entre meses.
    await page.locator('#calendar [data-date="2026-11-03"]').click()
    await page.locator('#calendar [data-date="2026-11-10"]').click()
    await expect(page.locator('#calendar output')).toHaveText('2026-11-03/2026-11-10')
    await expect(page.locator('#calendar td[data-in-range="true"]')).toHaveCount(8)
    await expect(page.locator('#calendar td[aria-selected="true"]')).toHaveCount(8)
    await expect(page.locator('#calendar table')).toHaveAttribute('aria-multiselectable', 'true')
    await expect(page.locator('#calendar [data-date="2026-11-01"]')).toBeDisabled()
    await page.locator('#calendar [data-date="2026-11-10"]').focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('#calendar [data-date="2026-11-11"]')).toBeFocused()
    await page.keyboard.press('PageDown')
    await expect(page.locator('#calendar [data-date="2026-12-11"]')).toBeFocused()
    await expect(page.locator('#calendar .k5-calendar__title')).toHaveText('Diciembre de 2026')
    await page.keyboard.press('Enter')
    await expect(page.locator('#calendar output')).toHaveText('2026-12-11/')
    // CommandPalette: Ctrl+K, filtro, flechas que saltan lo desactivado, Enter y Escape.
    await page.locator('body').click({ position: { x: 1, y: 1 } })
    await page.keyboard.press('Control+k')
    await expect(page.locator('#command dialog')).toBeVisible()
    await expect(page.locator('#command .k5-command__input')).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('#command [data-active=true]')).toHaveText('Lucía Fernández' + 'Valencia')
    await page.keyboard.type('ofer')
    await expect(page.locator('#command [role=option]')).toHaveCount(1)
    await page.keyboard.press('Enter')
    await expect(page.locator('#command dialog')).not.toBeVisible()
    await expect(page.locator('#command output')).toHaveText('offer')
    await page.locator('#command > button').click()
    await page.keyboard.type('zzz')
    await expect(page.locator('#command .k5-command__empty')).toHaveText('No hay resultados')
    await page.keyboard.press('Escape')
    await expect(page.locator('#command dialog')).not.toBeVisible()
    await expect(page.locator('#command > button')).toBeFocused()
    // BarChart: barras apiladas y la tabla oculta para lectores de pantalla.
    await expect(page.locator('#chart .k5-chart__bar')).toHaveCount(6)
    await expect(page.locator('#chart table tbody tr').first()).toHaveText('S1210 kWh85 kWh')
    // GradoProvider: la paginación en alemán.
    await expect(page.locator('#german [aria-label="Nächste Seite"]')).toBeVisible()

    // Componentes de 0.3 y 0.4, por grupo.
    for (const check of [
      maquetacionCheck,
      datosCheck,
      graficosCheck,
      entradasCheck,
      superposicionesCheck,
      formulariosCheck,
      tablasCheck,
      graficosInteractiveCheck,
      energiaCheck,
      labsCheck,
    ])
      await check(page, { expect, framework })
    expect(errors).toEqual([])
    // Accesibilidad en los tres temas y los dos modos, más una pasada con listas y la paleta abiertas.
    // Con «reducir movimiento» las duraciones valen 0 y axe no mide colores a mitad de transición.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--k5-duration-base').trim())).toBe('0s')
    for (const theme of ['consola', 'marca', 'campo']) {
      for (const mode of ['light', 'dark']) {
        await page.evaluate(
          ([t, m]) => {
            document.documentElement.dataset.k5Theme = t
            document.documentElement.classList.toggle('dark', m === 'dark')
          },
          [theme, mode],
        )
        await axe(page, `${framework} · ${theme} · ${mode}`)
      }
    }
    await page.evaluate(() => {
      delete document.documentElement.dataset.k5Theme
      document.documentElement.classList.remove('dark')
    })
    await page.locator('#multi input[role=combobox]').click()
    await axe(page, `${framework} · MultiSelect abierto`)
    await page.locator('#combo input[role=combobox]').click()
    await axe(page, `${framework} · Combobox abierto`)
    await page.locator('#command > button').click()
    await axe(page, `${framework} · CommandPalette abierta`)
    await page.keyboard.press('Escape')
    await page.close()

    // Armazón en móvil: el cajón se abre desde el menú, recibe el foco y Escape lo cierra.
    const mobile = await browser.newPage({ viewport: { width: 390, height: 800 }, reducedMotion: 'reduce' })
    mobile.on('pageerror', (error) => errors.push(error.message))
    await mobile.goto(`${base}/?framework=${framework}&shell=1`)
    const menu = mobile.locator('.k5-app__menu')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(mobile.locator('.k5-app__sidebar')).not.toBeInViewport()
    await menu.click()
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    await expect(mobile.locator('.k5-app__sidebar')).toBeInViewport()
    await expect(mobile.locator('.k5-app__sidebar a').first()).toBeFocused()
    await axe(mobile, `${framework} · armazón móvil abierto`)
    await mobile.keyboard.press('Escape')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await expect(menu).toBeFocused()
    await menu.click()
    await mobile.locator('.k5-app__sidebar a').nth(1).click()
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await mobile.locator('.k5-app__skip').focus()
    await expect(mobile.locator('.k5-app__skip')).toBeInViewport()
    await axe(mobile, `${framework} · armazón móvil`)
    expect(errors).toEqual([])
    await mobile.close()

    // Impresión: sin armazón, con todo el contenido (no solo lo que cabe en la ventana) y el
    // modo oscuro en colores claros.
    const media = await browser.newPage({ viewport: { width: 1100, height: 600 } })
    await media.goto(`${base}/?framework=${framework}&shell=1`)
    const background = () => media.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--k5-background').trim())
    const light = await background()
    await media.evaluate(() => {
      document.documentElement.classList.add('dark')
      const long = document.createElement('div')
      long.style.height = '3000px'
      document.querySelector('.k5-app__main').append(long)
    })
    expect(await background()).not.toBe(light)
    await media.emulateMedia({ media: 'print' })
    await expect(media.locator('.k5-app__sidebar')).toBeHidden()
    await expect(media.locator('.k5-app__header')).toBeHidden()
    expect(await media.evaluate(() => getComputedStyle(document.querySelector('.k5-app__main')).overflowY)).toBe('visible')
    expect(await media.evaluate(() => document.querySelector('.k5-app').getBoundingClientRect().height)).toBeGreaterThan(3000)
    expect(await background()).toBe(light)
    await media.close()

    // Alto contraste: lo elegido lleva el resaltado del sistema, no un fondo que desaparece.
    const forced = await browser.newPage({ viewport: { width: 1100, height: 900 }, reducedMotion: 'reduce' })
    await forced.goto(`${base}/?framework=${framework}`)
    await forced.emulateMedia({ forcedColors: 'active' })
    const [tab, highlight] = await forced.evaluate(() => {
      const probe = document.body.appendChild(document.createElement('span'))
      probe.style.cssText = 'forced-color-adjust: none; background: highlight'
      return [
        getComputedStyle(document.querySelector('#tabs .k5-tabs__tab[aria-selected="true"]')).backgroundColor,
        getComputedStyle(probe).backgroundColor,
      ]
    })
    expect(tab).toBe(highlight)
    await forced.close()
    console.log(
      `✓ ${framework}: modal, foco, teclado, filtros, archivos, fechas, temporizadores, tabla, componentes nuevos, idioma, armazón móvil, impresión, alto contraste y axe (3 temas × 2 modos)`,
    )
  }
  // ref: cada componente de React la pasa al elemento que toca.
  const refs = await browser.newPage()
  await refs.goto(`${base}/?refs=1`)
  await refs.waitForFunction(() => window.refResults)
  const { missing, results } = await refs.evaluate(() => window.refResults)
  expect(missing, 'componentes sin caso en test/browser/refs.fixture.mjs').toEqual([])
  const { cases } = await import('./refs.fixture.mjs')
  expect(results).toEqual(cases.map(([name, , selector]) => `${name}: ${selector}`))
  await refs.close()
  console.log(`✓ react: ${results.length} componentes pasan ref al elemento esperado`)
  await checkElements(browser, base, { expect, axe })
  console.log('✓ grado-elements: mismo HTML que React, teclado, formulario, avisos y axe (3 temas × 2 modos)')
} finally {
  await browser.close()
  await new Promise((done) => server.close(done))
  rmSync(directory, { recursive: true, force: true })
}
