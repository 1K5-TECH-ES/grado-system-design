// Codemod «npx @1k5-tech-es/grado migrate»: lo que cambia solo y lo que avisa.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { migratePackageJson, migrateSource, minorOf, npmrcWithRegistry, olderThan } from '../packages/grado/src/migrate.js'

test('imports de @1k5/… a @1k5-tech-es/…, sin tocar otros paquetes', () => {
  const { text, changes } = migrateSource(
    [
      "import '@1k5/grado/grado.css'",
      "import { Button } from '@1k5/grado-react'",
      'import { Dialog } from "@1k5/grado-vue"',
      "import ya from '@1k5-tech-es/grado-react'",
      "import otro from '@1k5/graficos'",
      "@import '@1k5/grado/tokens.css';",
    ].join('\n'),
    { path: 'src/main.ts' },
  )
  assert.equal(
    text,
    [
      "import '@1k5-tech-es/grado/grado.css'",
      "import { Button } from '@1k5-tech-es/grado-react'",
      'import { Dialog } from "@1k5-tech-es/grado-vue"',
      "import ya from '@1k5-tech-es/grado-react'",
      "import otro from '@1k5/graficos'",
      "@import '@1k5-tech-es/grado/tokens.css';",
    ].join('\n'),
  )
  assert.deepEqual(changes, { scope: 4 })
})

test('alias de tamaño a su paso de la escala, con el mismo valor', () => {
  const { text, changes } = migrateSource(
    '.a { font-size: var(--k5-text-badge); } .b { font-size: var(--k5-text-section); } .c { font: var(--k5-text-nav) } .d { font-size: var(--k5-text-label-x) }',
    { path: 'a.css' },
  )
  assert.equal(
    text,
    '.a { font-size: var(--k5-text-caption); } .b { font-size: var(--k5-text-heading); } .c { font: var(--k5-text-small) } .d { font-size: var(--k5-text-label-x) }',
  )
  assert.deepEqual(changes, { size: 3 })
})

test('k5-unit sale de las clases; en CSS solo se avisa', () => {
  const source =
    '<td className="k5-num k5-unit">1</td><td className="k5-unit k5-num">2</td><td class="k5-unit">3</td><td className="k5-units">4</td>'
  const { text, changes } = migrateSource(source, { path: 'Tabla.tsx' })
  assert.equal(text, '<td className="k5-num">1</td><td className="k5-num">2</td><td class="">3</td><td className="k5-units">4</td>')
  assert.deepEqual(changes, { unit: 3 })
  const css = migrateSource('.tabla .k5-unit { color: gray }\n', { path: 'tabla.css' })
  assert.equal(css.text, '.tabla .k5-unit { color: gray }\n')
  assert.deepEqual(css.warnings, [{ rule: 'unitCss', line: 1 }])
})

test('avisa de lo que pide decidir, con su línea, solo si se viene de antes de 0.3', () => {
  const source = [
    'const a = 1',
    '<Button variant="danger">Eliminar</Button>',
    "<Button variant={'danger'} />",
    "h(Button, { variant: 'danger' })",
    '<Badge tone="highlight">Nuevo</Badge>',
    "items: [{ id: 'baja', danger: true }]",
  ].join('\n')
  const { warnings } = migrateSource(source, { path: 'Ficha.tsx', from: '0.2' })
  assert.deepEqual(warnings, [
    { rule: 'danger', line: 2 },
    { rule: 'danger', line: 3 },
    { rule: 'danger', line: 4 },
    { rule: 'highlight', line: 5 },
  ])
  assert.deepEqual(migrateSource(source, { path: 'Ficha.tsx', from: '0.3' }).warnings, [])
})

test('package.json: nombre nuevo, versión actual, mismo orden y sangría', () => {
  const before = `{
    "name": "sales-coach",
    "dependencies": {
        "@1k5/grado": "file:vendor/1k5-grado-0.1.0.tgz",
        "@1k5/grado-react": "^0.2.0",
        "react": "^19.0.0"
    },
    "peerDependencies": {
        "@1k5/grado-vue": ">=0.2"
    }
}
`
  const { text, changes, warnings, from } = migratePackageJson(before, '0.4.0')
  assert.equal(
    text,
    `{
    "name": "sales-coach",
    "dependencies": {
        "@1k5-tech-es/grado": "^0.4.0",
        "@1k5-tech-es/grado-react": "^0.4.0",
        "react": "^19.0.0"
    },
    "peerDependencies": {
        "@1k5-tech-es/grado-vue": ">=0.2"
    }
}
`,
  )
  assert.deepEqual(changes, { dependencies: 3 })
  assert.deepEqual(warnings, [{ rule: 'vendor', line: 4 }])
  assert.equal(from, '0.1')
  // Ya al día: no cambia ni una coma.
  assert.deepEqual(migratePackageJson(text, '0.4.0'), { text, changes: {}, warnings: [], from: '0.4' })
})

test('versiones y .npmrc', () => {
  assert.equal(minorOf('^0.2.1'), '0.2')
  assert.equal(minorOf('file:vendor/1k5-grado-react-0.1.0.tgz'), '0.1')
  assert.equal(minorOf('latest'), null)
  assert.ok(olderThan('0.2', '0.3'))
  assert.ok(olderThan('0.9', '0.10'))
  assert.ok(!olderThan('0.3', '0.3'))
  assert.equal(
    npmrcWithRegistry(''),
    '@1k5-tech-es:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}\n',
  )
  assert.equal(
    npmrcWithRegistry('//npm.pkg.github.com/:_authToken=${NPM_TOKEN}'),
    '//npm.pkg.github.com/:_authToken=${NPM_TOKEN}\n@1k5-tech-es:registry=https://npm.pkg.github.com\n',
  )
  assert.equal(npmrcWithRegistry('@1k5-tech-es:registry=https://npm.pkg.github.com\n'), null)
})

test('la orden migrate cambia un proyecto de 0.1 y no toca node_modules', () => {
  const bin = fileURLToPath(new URL('../packages/grado/bin/grado.mjs', import.meta.url))
  const dir = mkdtempSync(join(tmpdir(), 'grado-migrate-'))
  try {
    mkdirSync(join(dir, 'src'))
    mkdirSync(join(dir, 'node_modules', 'x'), { recursive: true })
    writeFileSync(join(dir, 'package.json'), '{\n  "dependencies": {\n    "@1k5/grado-react": "^0.1.0"\n  }\n}\n')
    writeFileSync(join(dir, 'src', 'App.tsx'), 'import { Button } from \'@1k5/grado-react\'\n<Button variant="danger" />\n')
    writeFileSync(join(dir, 'node_modules', 'x', 'index.js'), "import '@1k5/grado-react'\n")
    const dry = execFileSync(process.execPath, [bin, 'migrate', '--dry'], { cwd: dir, encoding: 'utf8' })
    assert.match(dry, /migración desde 0\.1/)
    assert.match(dry, /src\/App\.tsx:2 {2}variant="danger"/)
    assert.match(dry, /3 archivos cambiarían \(--dry/)
    assert.match(readFileSync(join(dir, 'src', 'App.tsx'), 'utf8'), /@1k5\/grado-react/)
    execFileSync(process.execPath, [bin, 'migrate'], { cwd: dir, encoding: 'utf8' })
    assert.match(readFileSync(join(dir, 'src', 'App.tsx'), 'utf8'), /@1k5-tech-es\/grado-react/)
    assert.match(readFileSync(join(dir, 'package.json'), 'utf8'), /"@1k5-tech-es\/grado-react": "\^\d+\.\d+\.\d+"/)
    assert.match(readFileSync(join(dir, '.npmrc'), 'utf8'), /^@1k5-tech-es:registry=/)
    assert.equal(readFileSync(join(dir, 'node_modules', 'x', 'index.js'), 'utf8'), "import '@1k5/grado-react'\n")
    // Segunda pasada: ya no hay nada que hacer.
    assert.match(execFileSync(process.execPath, [bin, 'migrate'], { cwd: dir, encoding: 'utf8' }), /0 archivos cambiados · 0 avisos/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
