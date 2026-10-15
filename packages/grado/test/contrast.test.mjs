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
    test(`contraste ${id}: todas las parejas llegan a AA`, () => {
      const c = modes[mode].full.color
      for (const [fg, bg, label] of CONTRAST_PAIRS) {
        const ratio = contrast(c[fg].color, c[bg].color)
        assert.ok(ratio >= AA, `${id} ${label} (${fg}/${bg}) tiene ${ratio.toFixed(2)} : 1, por debajo de ${AA}`)
      }
    })
  }
}
