// Informe de la API pública: una línea por prop, para que cualquier cambio se vea en el diff
// de un pull request. Necesita el build hecho.
//   node scripts/api.mjs         escribe api/*.api.md
//   node scripts/api.mjs check   falla si api/ no coincide con lo que hay ahora (lo usa el CI)
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import * as V from '@1k5-tech-es/grado-vue'
import * as VF from '@1k5-tech-es/grado-vue/vee-validate'
import * as VL from '@1k5-tech-es/grado-vue/labs'

const root = new URL('../', import.meta.url)
const path = (relative) => fileURLToPath(new URL(relative, root))
const header = (name) => `# API de ${name}\n\nGenerado por \`npm run api\`. Si cambia sin querer, alguien ha cambiado la API pública.\n`

// ---------- @1k5-tech-es/grado: sus .d.ts, sin comentarios ----------
function core() {
  const printer = ts.createPrinter({ removeComments: true })
  const files = [
    ...readdirSync(path('packages/grado/src'))
      .filter((file) => file.endsWith('.d.ts'))
      .map((file) => `packages/grado/src/${file}`),
    // Textos de cada idioma: @1k5-tech-es/grado/messages/de, /en…
    ...readdirSync(path('packages/grado/src/messages'))
      .filter((file) => file.endsWith('.d.ts'))
      .map((file) => `packages/grado/src/messages/${file}`),
    'packages/grado/dist/tokens.d.ts',
    'packages/grado/dist/tailwind-preset.d.ts',
  ].sort()
  const sections = files.map((file) => {
    const source = ts.createSourceFile(file, readFileSync(path(file), 'utf8'), ts.ScriptTarget.Latest, true)
    return `## ${file.replace('packages/grado/', '')}\n\n\`\`\`ts\n${printer.printFile(source).trim()}\n\`\`\`\n`
  })
  return `${header('@1k5-tech-es/grado')}\n${sections.join('\n')}`
}

// ---------- @1k5-tech-es/grado-react: props propias y elemento de la ref ----------
function react(file, name) {
  const entry = path(`packages/grado-react/dist/${file}`)
  const program = ts.createProgram([entry], {
    strict: true,
    skipLibCheck: true,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  })
  const checker = program.getTypeChecker()
  const module = checker.getSymbolAtLocation(program.getSourceFile(entry))
  const flags = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope
  const own = (prop) => prop.declarations?.some((d) => !d.getSourceFile().fileName.includes('node_modules'))
  const lines = []
  const types = []
  for (const symbol of checker.getExportsOfModule(module).sort((a, b) => a.name.localeCompare(b.name))) {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
    const declaration = target.declarations?.[0]
    if (!declaration) continue
    if (!(target.flags & ts.SymbolFlags.Value)) {
      types.push(symbol.name)
      continue
    }
    const type = checker.getTypeOfSymbolAtLocation(target, declaration)
    const signature = type.getCallSignatures()[0]
    const props = signature?.parameters[0] && checker.getTypeOfSymbolAtLocation(signature.parameters[0], declaration)
    // Componente: nombre en PascalCase que se llama con un objeto de props. Lo demás (toast, cx, MESSAGES…) va con su tipo.
    const isComponent = /^[A-Z][a-z]/.test(symbol.name) && props
    if (!isComponent) {
      lines.push(`## ${symbol.name}\n\n\`\`\`ts\n${checker.typeToString(type, declaration, flags)}\n\`\`\`\n`)
      continue
    }
    const members = props.getProperties()
    const ref = members.find((prop) => prop.name === 'ref')
    const refType = ref ? checker.typeToString(checker.getTypeOfSymbolAtLocation(ref, declaration), declaration, flags) : 'sin ref'
    const element = /Ref<([A-Za-z]+)>/.exec(refType)?.[1] ?? refType
    // ref y key las pone React a todos; el resto que no es nuestro son atributos HTML.
    const react = (prop) => prop.name === 'ref' || prop.name === 'key'
    const inherited = members.some((prop) => !react(prop) && !own(prop))
    const rows = members
      .filter((prop) => !react(prop) && own(prop))
      .map((prop) => {
        const optional = prop.flags & ts.SymbolFlags.Optional ? '?' : ''
        const text = checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, declaration), declaration, flags)
        return `  ${prop.name}${optional}: ${text.replace(/ \| undefined$/, '')}`
      })
      .sort()
    lines.push(
      `## ${symbol.name}\n\nref: ${element}${inherited ? ' · admite además los atributos HTML de ese elemento' : ''}\n\n\`\`\`ts\n${rows.length ? rows.join('\n') : '  (sin props propias)'}\n\`\`\`\n`,
    )
  }
  return `${header(name)}\nTipos exportados: ${types.join(', ')}\n\n${lines.join('\n')}`
}

// ---------- @1k5-tech-es/grado-vue: props, emits y lo demás, leídos de los componentes ----------
function vue(module, name) {
  const typeName = (type) => (type == null ? 'any' : Array.isArray(type) ? type.map(typeName).join(' | ') : (type.name ?? String(type)))
  const lines = []
  for (const [name, value] of Object.entries(module).sort(([a], [b]) => a.localeCompare(b))) {
    const component = value && typeof value === 'object' && 'setup' in value ? value : null
    if (!component) {
      lines.push(`## ${name}\n\n${Array.isArray(value) ? 'array' : typeof value}\n`)
      continue
    }
    const props = Object.entries(component.props ?? {})
      .map(([prop, def]) => {
        const option = typeof def === 'function' || Array.isArray(def) ? { type: def } : (def ?? {})
        const extra = [option.required ? 'obligatoria' : '', 'default' in option ? 'con valor por defecto' : ''].filter(Boolean)
        return `  ${prop}: ${typeName(option.type)}${extra.length ? `  // ${extra.join(', ')}` : ''}`
      })
      .sort()
    const emits = [...(Array.isArray(component.emits) ? component.emits : Object.keys(component.emits ?? {}))].sort()
    lines.push(
      `## ${name}\n\n\`\`\`ts\n${props.length ? props.join('\n') : '  (sin props)'}\n\`\`\`\n${emits.length ? `\nemits: ${emits.join(', ')}\n` : ''}`,
    )
  }
  return `${header(name)}\n${lines.join('\n')}`
}

const reports = {
  'api/grado.api.md': core(),
  'api/grado-react.api.md': react('index.d.ts', '@1k5-tech-es/grado-react'),
  'api/grado-react-react-hook-form.api.md': react('react-hook-form.d.ts', '@1k5-tech-es/grado-react/react-hook-form'),
  'api/grado-vue.api.md': vue(V, '@1k5-tech-es/grado-vue'),
  'api/grado-vue-vee-validate.api.md': vue(VF, '@1k5-tech-es/grado-vue/vee-validate'),
  // Labs: fuera de la promesa de la 1.0, pero sus cambios también se ven en el diff.
  'api/grado-react-labs.api.md': react('labs.d.ts', '@1k5-tech-es/grado-react/labs'),
  'api/grado-vue-labs.api.md': vue(VL, '@1k5-tech-es/grado-vue/labs'),
}

if (process.argv[2] === 'check') {
  const stale = Object.entries(reports).filter(([file, text]) => !existsSync(path(file)) || readFileSync(path(file), 'utf8') !== text)
  if (stale.length) {
    console.error(
      `La API pública ha cambiado (${stale.map(([file]) => file).join(', ')}).\n` +
        'Si el cambio es a propósito, ejecuta `npm run api`, revisa el diff y añádelo al CHANGELOG.',
    )
    process.exit(1)
  }
  console.log('La API pública coincide con api/.')
} else {
  mkdirSync(path('api'), { recursive: true })
  for (const [file, text] of Object.entries(reports)) writeFileSync(path(file), text)
  console.log(`Escrito ${Object.keys(reports).join(', ')}`)
}
