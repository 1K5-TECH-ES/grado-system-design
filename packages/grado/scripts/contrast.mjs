// Informe de contraste de todos los temas: `npm run contrast`.
import { contrast } from './lib/color.mjs'
import { CONTRAST_PAIRS, MODES, loadTokens } from './lib/tokens.mjs'

const { themes } = loadTokens()
let low = 0
for (const [theme, modes] of Object.entries(themes)) {
  for (const mode of MODES) {
    const c = modes[mode].full.color
    console.log(`\n${theme} · ${mode === 'light' ? 'claro' : 'oscuro'}`)
    for (const [fg, bg, label] of CONTRAST_PAIRS) {
      const ratio = contrast(c[fg].color, c[bg].color)
      const ok = ratio >= 4.5
      if (!ok) low++
      console.log(`  ${ok ? 'AA  ' : 'BAJO'}  ${ratio.toFixed(2).padStart(5)} : 1  ${label.padEnd(30)} ${fg} / ${bg}`)
    }
  }
}
console.log(`\n${low} combinaciones por debajo de 4,5 : 1`)
