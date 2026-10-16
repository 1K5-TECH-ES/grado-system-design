import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contrast } from '../scripts/lib/color.mjs'
import { CONTRAST_PAIRS, MODES, loadTokens } from '../scripts/lib/tokens.mjs'

// AA para texto normal: 4,5 : 1. Desde la 0.2.0 no hay excepciones: todas las parejas de
// CONTRAST_PAIRS lo cumplen en los dos temas y los dos modos.
const AA = 4.5

const { themes } = loadTokens()

for (const [theme, modes] of Object.entries(themes)) {
  for (const mode of MODES) {
    const id = `${theme}.${mode}`
    // Un tema puede pedir más: campo, 7 : 1 (AAA) para leer al sol.
    const min = modes.minContrast ?? AA
    test(`contraste ${id}: todas las parejas llegan a ${min === AA ? 'AA' : `${min} : 1`}`, () => {
      const c = modes[mode].full.color
      for (const [fg, bg, label] of CONTRAST_PAIRS) {
        const ratio = contrast(c[fg].color, c[bg].color)
        assert.ok(ratio >= min, `${id} ${label} (${fg}/${bg}) tiene ${ratio.toFixed(2)} : 1, por debajo de ${min}`)
      }
    })
  }
}

// Con un mínimo propio (campo), también el texto sobre la escala tonal: <color>-text sobre <color>-subtle.
for (const [theme, modes] of Object.entries(themes)) {
  if (!modes.minContrast) continue
  for (const mode of MODES) {
    test(`contraste ${theme}.${mode}: texto sobre tintes a ${modes.minContrast} : 1`, () => {
      const c = modes[mode].full.color
      for (const source of ['primary', 'success', 'warning', 'destructive', 'info']) {
        const ratio = contrast(c[`${source}-text`].color, c[`${source}-subtle`].color)
        assert.ok(ratio >= modes.minContrast, `${theme}.${mode} ${source}-text sobre ${source}-subtle: ${ratio.toFixed(2)} : 1`)
      }
    })
  }
}
