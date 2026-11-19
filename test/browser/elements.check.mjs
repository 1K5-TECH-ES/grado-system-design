// Pruebas en navegador · grado-elements (0.6): Web Components en una página HTML sin framework.
// Mismo HTML que React (comparado con renderToStaticMarkup), teclado, formulario, avisos y axe.
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as G from '@1k5-tech-es/grado-react'
import { normalize } from '../normalize.mjs'

const options = [
  { value: 'md', label: 'Madrid' },
  { value: 'bcn', label: 'Barcelona', disabled: true },
  { value: 'vlc', label: 'Valencia' },
]

/** La página: los cinco elementos como los escribiría una plantilla PHP. */
export const page = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Grado · Web Components</title>
<link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="themes/campo.css"><link rel="stylesheet" href="grado.css">
<style>body{font:14px system-ui;margin:0;padding:16px;background:var(--k5-background);color:var(--k5-foreground)}section{max-width:600px;margin-bottom:24px}</style>
<script type="module" src="grado-elements.min.js"></script></head><body><main>
<section id="combo"><form id="form" onsubmit="event.preventDefault()">
<k5-combobox label="Provincia" name="provincia" value="md">${options.map((o) => `<option value="${o.value}"${o.disabled ? ' disabled' : ''}>${o.label}</option>`).join('')}</k5-combobox>
</form></section>
<section id="tabs"><k5-tabs label="Ficha"><k5-tab value="a" label="Resumen">Uno</k5-tab><k5-tab value="b" label="Documentos">Dos</k5-tab></k5-tabs></section>
<section id="dialog"><button type="button" data-k5-open="nota">Nueva nota</button><k5-dialog id="nota" label="Nota"><label>Texto <input></label></k5-dialog></section>
<section id="menu"><k5-menu label="Acciones"><option value="edit" data-shortcut="⌘ e">Editar</option><option value="del" data-danger data-separator>Eliminar</option></k5-menu><output></output></section>
<k5-toaster></k5-toaster>
</main></body></html>`

export async function checkElements(browser, base, { expect, axe }) {
  // Con «reducir movimiento» las duraciones valen 0 y axe no mide colores a mitad de un fundido.
  const p = await browser.newPage({ viewport: { width: 1000, height: 900 }, reducedMotion: 'reduce' })
  const errors = []
  p.on('pageerror', (error) => errors.push(error.message))
  await p.goto(`${base}/elements.html`)
  await p.waitForFunction(() => customElements.get('k5-toaster') && document.querySelector('k5-tabs .k5-tabs'))
  const inner = (selector) => p.locator(selector).evaluate((node) => node.innerHTML)

  // Mismo HTML que React, salvo los ids automáticos.
  const react = {
    'k5-combobox': r(G.Combobox, { label: 'Provincia', options, name: 'provincia', defaultValue: 'md' }),
    'k5-tabs': r(G.Tabs, {
      label: 'Ficha',
      items: [
        { value: 'a', label: 'Resumen', content: 'Uno' },
        { value: 'b', label: 'Documentos', content: 'Dos' },
      ],
    }),
    'k5-dialog': r(G.Dialog, { title: 'Nota' }, r('label', null, 'Texto ', r('input'))),
    'k5-menu': r(G.DropdownMenu, {
      label: 'Acciones',
      items: [
        { id: 'edit', label: 'Editar', shortcut: ['⌘', 'e'] },
        { id: 'del', label: 'Eliminar', danger: true, separator: true },
      ],
    }),
    'k5-toaster': r(G.Toaster),
  }
  for (const [tag, element] of Object.entries(react))
    expect(normalize(await inner(tag)), `${tag}: mismo HTML que React`).toBe(normalize(renderToStaticMarkup(element)))

  // k5-combobox: flechas que saltan lo desactivado, Enter elige, change y el valor en el formulario.
  const input = p.locator('k5-combobox input[role=combobox]')
  await p.evaluate(() => {
    window.changes = []
    document.querySelector('k5-combobox').addEventListener('change', (event) => window.changes.push(event.target.value))
  })
  await input.focus()
  await expect(input).toHaveAttribute('aria-expanded', 'true')
  await p.keyboard.press('ArrowDown')
  await p.keyboard.press('ArrowDown')
  await expect(input).toHaveAttribute('aria-activedescendant', /-option-2$/)
  await p.keyboard.press('Enter')
  await expect(input).toHaveValue('Valencia')
  await expect(input).toHaveAttribute('aria-expanded', 'false')
  expect(await p.evaluate(() => Object.fromEntries(new FormData(document.querySelector('#form'))))).toEqual({ provincia: 'vlc' })
  expect(await p.evaluate(() => window.changes)).toEqual(['vlc'])
  await input.fill('mad')
  await expect(p.locator('k5-combobox [role=option]')).toHaveText(['Madrid'])
  await p.keyboard.press('Escape')
  await expect(input).toHaveValue('Valencia')

  // k5-tabs: flechas mueven el foco y eligen; se ve su panel.
  await p.locator('k5-tabs [role=tab]').first().focus()
  await p.keyboard.press('ArrowRight')
  await expect(p.locator('k5-tabs [role=tab]').nth(1)).toBeFocused()
  await expect(p.locator('k5-tabs [role=tab]').nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(p.locator('k5-tabs [role=tabpanel]:visible')).toHaveText('Dos')
  expect(await p.locator('k5-tabs').evaluate((node) => node.value)).toBe('b')

  // k5-dialog: se abre con data-k5-open, el foco entra, Escape cierra y el foco vuelve.
  const opener = p.locator('[data-k5-open="nota"]')
  await opener.click()
  await expect(p.locator('k5-dialog dialog')).toBeVisible()
  await expect(p.locator('k5-dialog input')).toBeFocused()
  await axe(p, 'grado-elements · diálogo abierto')
  await p.keyboard.press('Escape')
  await expect(p.locator('k5-dialog dialog')).toBeHidden()
  await expect(opener).toBeFocused()
  // Pulsar en el campo y soltar en el fondo no lo cierra; un clic en el fondo, sí.
  await opener.click()
  const field = await p.locator('k5-dialog input').boundingBox()
  await p.mouse.move(field.x + 4, field.y + field.height / 2)
  await p.mouse.down()
  await p.mouse.move(5, 5, { steps: 4 })
  await p.mouse.up()
  await expect(p.locator('k5-dialog dialog')).toBeVisible()
  await p.mouse.click(5, 5)
  await expect(p.locator('k5-dialog dialog')).toBeHidden()

  // k5-menu: flecha abajo abre en la primera, Fin va a la última, Enter elige y avisa.
  await p.evaluate(() =>
    document.querySelector('k5-menu').addEventListener('k5-select', (event) => {
      document.querySelector('#menu output').textContent = event.detail.value
    }),
  )
  const trigger = p.locator('k5-menu > .k5-menu > button')
  await trigger.focus()
  await p.keyboard.press('ArrowDown')
  await expect(p.locator('k5-menu [role=menuitem]').first()).toBeFocused()
  // Abierto, el menú tiene el mismo HTML que el de React con el atajo pintado.
  await expect(p.locator('k5-menu [role=menuitem]').first()).toHaveAttribute('aria-keyshortcuts', 'Meta+E')
  await expect(p.locator('k5-menu .k5-menu__shortcut kbd')).toHaveText(['⌘', 'e'])
  await p.keyboard.press('End')
  await expect(p.locator('k5-menu [role=menuitem]').last()).toBeFocused()
  await p.keyboard.press('Enter')
  await expect(p.locator('#menu output')).toHaveText('del')
  await expect(trigger).toBeFocused()
  await expect(p.locator('k5-menu [role=menu]')).toHaveCount(0)

  // k5-toaster: toast() desde el módulo, con acción; Cerrar lo quita; los de error son alert.
  await p.evaluate(async () => {
    const { toast } = await import('./grado-elements.min.js')
    window.undone = false
    toast.success('Oferta enviada', {
      duration: 0,
      action: { label: 'Deshacer', shortcut: ['⌘', 'z'], onClick: () => (window.undone = true) },
    })
    toast.error('No se ha podido guardar', { duration: 0 })
  })
  await expect(p.locator('k5-toaster .k5-toast')).toHaveCount(2)
  await expect(p.locator('k5-toaster [role=alert]')).toHaveText(/No se ha podido guardar/)
  await axe(p, 'grado-elements · avisos')
  await expect(p.locator('k5-toaster button', { hasText: 'Deshacer' })).toHaveAttribute('aria-keyshortcuts', 'Meta+Z')
  await expect(p.locator('k5-toaster button', { hasText: 'Deshacer' }).locator('kbd')).toHaveText(['⌘', 'z'])
  await p.locator('k5-toaster button', { hasText: 'Deshacer' }).click()
  expect(await p.evaluate(() => window.undone)).toBe(true)
  await p.locator('k5-toaster .k5-close').click()
  await expect(p.locator('k5-toaster .k5-toast')).toHaveCount(0)

  // Accesibilidad en los tres temas y los dos modos.
  for (const theme of ['consola', 'marca', 'campo'])
    for (const mode of ['light', 'dark']) {
      await p.evaluate(
        ([t, m]) => {
          document.documentElement.dataset.k5Theme = t
          document.documentElement.classList.toggle('dark', m === 'dark')
        },
        [theme, mode],
      )
      await axe(p, `grado-elements · ${theme} · ${mode}`)
    }
  expect(errors).toEqual([])
  await p.close()
}
