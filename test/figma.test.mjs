// Comprobación de los tokens de Figma (npm run figma:check): mismo formato que Tokens Studio.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compareTokens, flattenTokens } from '../scripts/figma.mjs'

const studio = JSON.parse(readFileSync(new URL('../packages/grado/dist/tokens-studio.json', import.meta.url), 'utf8'))

test('el export de Tokens Studio del repositorio coincide consigo mismo', () => {
  const sets = flattenTokens(studio)
  assert.ok(Object.keys(sets).length >= 5)
  assert.ok(Object.values(sets).every((tokens) => Object.keys(tokens).length > 0))
  assert.deepEqual(compareTokens(sets, flattenTokens(structuredClone(studio))), [])
})

test('cuenta los cambios de valor, los que faltan y los que sobran, sin mayúsculas ni el formato antiguo', () => {
  const repo = flattenTokens({
    global: { palette: { aubergine: { $type: 'color', $value: '#5C068C' }, mint: { $type: 'color', $value: '#2ED8C3' } } },
    'consola/light': { radius: { $value: '0.5rem' } },
  })
  const figma = flattenTokens({
    $themes: [],
    global: { palette: { aubergine: { type: 'color', value: '#5c068c' }, fuchsia: { $value: '#FA65EC' } } },
    'consola/light': { radius: { $value: '0.75rem' } },
    'marca/light': { radius: { $value: '1rem' } },
  })
  assert.deepEqual(compareTokens(repo, figma), [
    'Figma tiene el conjunto «marca/light», que no está en el repositorio.',
    'global · palette.mint: falta en Figma (en el repositorio, #2ED8C3).',
    'global · palette.fuchsia: está en Figma y no en el repositorio.',
    'consola/light · radius: en Figma 0.75rem, en el repositorio 0.5rem.',
  ])
})
