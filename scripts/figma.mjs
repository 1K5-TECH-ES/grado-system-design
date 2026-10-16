// Compara los tokens de Figma con los del repositorio. Sin dependencias; necesita el build hecho.
//   node scripts/figma.mjs check [export.json]
// El export es el JSON de Tokens Studio (un solo archivo, con un conjunto por tema y modo), guardado
// por defecto en design/figma-tokens.json. Si no existe, no hay nada que comparar y no falla.
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = new URL('../', import.meta.url)
const DEFAULT = 'design/figma-tokens.json'

/** { 'conjunto': { 'ruta.del.token': valor } } de un JSON de Tokens Studio ($value o value). */
export function flattenTokens(json) {
  const sets = {}
  for (const [set, tree] of Object.entries(json)) {
    if (set.startsWith('$') || !tree || typeof tree !== 'object') continue
    const tokens = {}
    const walk = (node, path) => {
      if (node && typeof node === 'object' && ('$value' in node || 'value' in node)) {
        tokens[path.join('.')] = normalizeValue(node.$value ?? node.value)
        return
      }
      for (const [key, child] of Object.entries(node ?? {})) if (!key.startsWith('$')) walk(child, [...path, key])
    }
    walk(tree, [])
    sets[set] = tokens
  }
  return sets
}

// #5C068C y #5c068c son el mismo color; los espacios de más no cuentan.
const normalizeValue = (value) =>
  typeof value === 'string' ? value.trim().replace(/^#[0-9a-f]{3,8}$/i, (hex) => hex.toUpperCase()) : JSON.stringify(value)

/** Diferencias entre los tokens del repositorio y los de Figma, en frases. */
export function compareTokens(repo, figma) {
  const problems = []
  for (const set of Object.keys(repo)) if (!(set in figma)) problems.push(`Falta el conjunto «${set}» en Figma.`)
  for (const set of Object.keys(figma))
    if (!(set in repo)) problems.push(`Figma tiene el conjunto «${set}», que no está en el repositorio.`)
  for (const [set, tokens] of Object.entries(repo)) {
    const other = figma[set]
    if (!other) continue
    for (const [path, value] of Object.entries(tokens)) {
      if (!(path in other)) problems.push(`${set} · ${path}: falta en Figma (en el repositorio, ${value}).`)
      else if (other[path] !== value) problems.push(`${set} · ${path}: en Figma ${other[path]}, en el repositorio ${value}.`)
    }
    for (const path of Object.keys(other)) if (!(path in tokens)) problems.push(`${set} · ${path}: está en Figma y no en el repositorio.`)
  }
  return problems
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, file = DEFAULT] = process.argv.slice(2)
  if (command !== 'check') {
    console.error('Uso: node scripts/figma.mjs check [export.json]')
    process.exit(1)
  }
  const exported = fileURLToPath(new URL(file, root))
  if (!existsSync(exported)) {
    console.log(`No hay export de Figma en ${file}: no hay nada que comparar.`)
    process.exit(0)
  }
  const repo = flattenTokens(JSON.parse(readFileSync(new URL('packages/grado/dist/tokens-studio.json', root), 'utf8')))
  const problems = compareTokens(repo, flattenTokens(JSON.parse(readFileSync(exported, 'utf8'))))
  if (problems.length) {
    console.error(`Los tokens de Figma y los del repositorio no coinciden (${problems.length}):\n- ${problems.join('\n- ')}`)
    console.error(
      '\nSi el cambio viene de diseño, pásalo a packages/grado/src/tokens.json. Si viene del repositorio, importa packages/grado/dist/tokens-studio.json en Tokens Studio y vuelve a exportar.',
    )
    process.exit(1)
  }
  const count = Object.values(repo).reduce((total, tokens) => total + Object.keys(tokens).length, 0)
  console.log(`Figma y el repositorio tienen los mismos ${count} tokens.`)
}
