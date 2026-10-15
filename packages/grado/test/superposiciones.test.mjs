// Grupo «superposiciones y acciones»: cada clase que generan sus ayudantes existe en grado.css.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as k5 from '@1k5-tech-es/grado/classes'

const css = readFileSync(new URL('../dist/grado.css', import.meta.url), 'utf8')

test('cada clase de Popover, Banner, ActionBar, IconButton y ToggleGroup existe en grado.css', () => {
  const produced = new Set()
  const add = (s) => s.split(' ').forEach((c) => produced.add(c))
  for (const tone of k5.BANNER_TONES) add(k5.bannerClass({ tone }))
  for (const variant of k5.ICON_BUTTON_VARIANTS) for (const size of k5.SIZES) add(k5.iconButtonClass({ variant, size }))
  for (const align of k5.POPOVER_ALIGNS) for (const side of ['bottom', 'top']) add(k5.popoverClass({ align, side }))
  for (const inline of [false, true]) add(k5.actionBarClass({ inline }))
  for (const size of k5.SIZES) for (const iconOnly of [false, true]) add(k5.toggleGroupClass({ size, iconOnly }))
  // Clases fijas de los componentes.
  for (const name of [
    'k5-popover',
    'k5-popover__title',
    'k5-banner__icon',
    'k5-banner__content',
    'k5-banner__title',
    'k5-banner__action',
    'k5-action-bar__count',
    'k5-action-bar__actions',
    'k5-action-bar__clear',
    'k5-toggle-group__item',
    'k5-context-menu',
    'k5-context-menu__content',
    'k5-app__banner',
  ])
    produced.add(name)
  for (const name of produced) assert.ok(css.includes(`.${name}`), `.${name} no está en grado.css`)
})

test('valores no válidos caen en el valor por defecto', () => {
  assert.equal(k5.bannerClass({ tone: 'rojo' }), 'k5-banner k5-banner--info')
  assert.equal(k5.iconButtonClass({ variant: 'danger' }), 'k5-btn k5-btn--ghost k5-btn--icon')
  assert.equal(k5.popoverClass({ align: 'x', side: 'izquierda' }), 'k5-popover__content k5-popover__content--start')
})
