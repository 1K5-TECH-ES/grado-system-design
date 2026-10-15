// Ayudas para publicar una versión. Sin dependencias.
//   node scripts/release.mjs check 0.3.0   comprueba que los tres paquetes y sus dependencias internas
//                                          están en esa versión y que el CHANGELOG tiene su sección
//   node scripts/release.mjs notes 0.3.0   imprime las notas de esa versión sacadas de CHANGELOG.md
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')
const PACKAGES = ['grado', 'grado-react', 'grado-vue']
const [command, version] = process.argv.slice(2)

if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version ?? '')) {
  console.error('Uso: node scripts/release.mjs check|notes <versión>, p. ej. 0.3.0')
  process.exit(1)
}

/** La sección «## <versión> · …» de CHANGELOG.md, sin el título. */
export function changelogSection(changelog, wanted) {
  const lines = changelog.split('\n')
  const start = lines.findIndex((line) => line.startsWith(`## ${wanted} `) || line === `## ${wanted}`)
  if (start < 0) return null
  const end = lines.findIndex((line, i) => i > start && line.startsWith('## '))
  return lines
    .slice(start + 1, end < 0 ? undefined : end)
    .join('\n')
    .trim()
}

if (command === 'check') {
  const problems = []
  for (const name of PACKAGES) {
    const pkg = JSON.parse(read(`packages/${name}/package.json`))
    if (pkg.version !== version) problems.push(`${pkg.name} está en ${pkg.version}`)
    const internal = pkg.dependencies?.['@1k5/grado']
    if (internal && internal !== `^${version}`) problems.push(`${pkg.name} depende de @1k5/grado ${internal}`)
  }
  if (!changelogSection(read('CHANGELOG.md'), version)) problems.push(`CHANGELOG.md no tiene la sección ${version}`)
  if (problems.length) {
    console.error(`No se puede publicar ${version}:\n- ${problems.join('\n- ')}`)
    process.exit(1)
  }
  console.log(`Todo listo para publicar ${version}.`)
} else if (command === 'notes') {
  console.log(changelogSection(read('CHANGELOG.md'), version) ?? '')
} else {
  console.error(`Orden desconocida: ${command}`)
  process.exit(1)
}
