// Inventario «npx @1k5-tech-es/grado usage»: componentes, props, funciones, clases y adoption.json.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  componentCounts,
  gradoImports,
  gradoPackages,
  mergeUsage,
  propOf,
  propSummary,
  usageOf,
  withAdoption,
} from '../packages/grado/src/usage.js'

const bin = fileURLToPath(new URL('../packages/grado/bin/grado.mjs', import.meta.url))

test('imports con nombre, alias, tipos y espacio de nombres', () => {
  const { named, namespaces } = gradoImports(
    [
      "import { Button, Dialog as Modal, type ButtonProps } from '@1k5-tech-es/grado-react'",
      "import type { Size } from '@1k5-tech-es/grado-react'",
      "import { FormField } from '@1k5-tech-es/grado-react/react-hook-form'",
      "import * as G from '@1k5/grado-vue'",
      "import { Button as Other } from 'otra-libreria'",
    ].join('\n'),
  )
  assert.deepEqual(named, { Button: 'Button', Modal: 'Dialog', FormField: 'FormField' })
  assert.deepEqual(namespaces, ['G'])
})

test('React: etiquetas, props con su valor literal y funciones', () => {
  const usage = usageOf(
    `import { Button, Dialog as Modal, toast } from '@1k5-tech-es/grado-react'
export function Ofertas({ rest }) {
  return (
    <Modal open={open} title="Borrar oferta">
      <Button variant="destructive" size={'sm'} disabled onClick={() => toast.success('Hecho')}>Borrar</Button>
      <Button variant="ghost" {...rest} />
      <Button variant={tipo} loading={true}>Otra</Button>
    </Modal>
  )
}
toast('Guardado')`,
    { path: 'src/Ofertas.tsx' },
  )
  assert.deepEqual(componentCounts(usage), { Button: 3, Dialog: 1 })
  assert.deepEqual(usage.components.Button.props.variant, { count: 3, values: { destructive: 1, ghost: 1 } })
  assert.deepEqual(usage.components.Button.props.size, { count: 1, values: { sm: 1 } })
  assert.deepEqual(usage.components.Button.props.disabled, { count: 1, values: { true: 1 } })
  assert.deepEqual(usage.components.Button.props.loading, { count: 1, values: { true: 1 } })
  assert.deepEqual(usage.components.Dialog.props.title, { count: 1, values: {} }, 'los textos con espacios no son valores')
  assert.deepEqual(usage.functions, { toast: 2 })
})

test('Vue: PascalCase, kebab-case, v-bind, v-model y eventos; <button> no es Button', () => {
  const usage = usageOf(
    `<script setup lang="ts">
import { AppShell, Button, DataTable } from '@1k5-tech-es/grado-vue'
</script>
<template>
  <app-shell>
    <template #brand>Sales Coach</template>
    <Button
      variant="ghost"
      icon-only
      :icon="Sun"
      :aria-label="label"
      :tone="'neutral'"
      @click.prevent="toggle"
    />
    <button type="button">nativo</button>
    <DataTable v-model:hidden-columns="hidden" v-model="sort" :rows="rows" manual />
  </app-shell>
</template>`,
    { path: 'src/App.vue' },
  )
  assert.deepEqual(componentCounts(usage), { AppShell: 1, Button: 1, DataTable: 1 })
  const props = usage.components.Button.props
  assert.deepEqual(Object.keys(props).sort(), ['@click', 'aria-label', 'icon', 'iconOnly', 'tone', 'variant'])
  assert.deepEqual(props.variant.values, { ghost: 1 })
  assert.deepEqual(props.iconOnly.values, { true: 1 })
  assert.deepEqual(props.tone.values, { neutral: 1 })
  assert.deepEqual(Object.keys(usage.components.DataTable.props).sort(), ['manual', 'rows', 'v-model', 'v-model:hiddenColumns'])
})

test('espacio de nombres y referencias sin etiqueta (:as, h())', () => {
  const usage = usageOf(
    `import * as G from '@1k5-tech-es/grado-react'
import { Button, cx } from '@1k5-tech-es/grado-react'
const a = <G.Card tone="alert"><G.Card /></G.Card>
const b = h(Button, { variant: 'ghost' })
const c = cx('a', 'b') + G.formatMessage('x')
const d = G.Badge`,
    { path: 'a.jsx' },
  )
  assert.deepEqual(componentCounts(usage), { Card: 2, Badge: 1, Button: 1 })
  assert.deepEqual(usage.components.Card.props.tone.values, { alert: 1 })
  assert.deepEqual(usage.functions, { cx: 1, formatMessage: 1 })
})

test('clases k5-… y tokens --k5-… en código, plantillas y estilos', () => {
  const php = usageOf('<div class="k5-card k5-card--alert" data-k5-density="compact" style="color: var(--k5-primary)">', {
    path: 'oferta.php',
  })
  assert.deepEqual(php.classes, { 'k5-card': 1, 'k5-card--alert': 1 })
  assert.deepEqual(php.tokens, { '--k5-primary': 1 })
  const css = usageOf('.k5-app__product { font: var(--k5-text-small); color: var(--k5-primary) } .k5-app__product:hover {}', {
    path: 'a.css',
  })
  assert.deepEqual(css.classes, { 'k5-app__product': 2 })
  assert.deepEqual(css.tokens, { '--k5-text-small': 1, '--k5-primary': 1 })
  assert.deepEqual(css.components, {})
})

test('propOf deja fuera key, ref, class y slots', () => {
  for (const name of ['key', 'ref', 'class', 'className', 'v-if', 'v-for', '#brand', 'v-slot:footer'])
    assert.equal(propOf({ name, value: 'x' }), null)
  assert.deepEqual(propOf({ name: 'data-testid', value: 'x', quoted: true }), { prop: 'data-testid', literal: 'x' })
  assert.deepEqual(propOf({ name: 'v-on:update:model-value', value: 'f' }), { prop: '@update:modelValue', literal: null })
})

test('mergeUsage suma usos, archivos y valores', () => {
  const a = usageOf('import { Button } from \'@1k5-tech-es/grado-react\'\n<Button variant="ghost" />', { path: 'a.tsx' })
  const b = usageOf('import { Button } from \'@1k5-tech-es/grado-react\'\n<Button variant="ghost" /><Button variant="primary" />', {
    path: 'b.tsx',
  })
  const total = mergeUsage([a, b])
  assert.equal(total.components.Button.uses, 3)
  assert.equal(total.components.Button.files, 2)
  assert.deepEqual(total.components.Button.props.variant.values, { ghost: 2, primary: 1 })
  assert.equal(propSummary(total.components.Button.props), 'variant: ghost 2 · primary 1')
})

test('versiones de Grado en package.json, también desde un .tgz', () => {
  const text = JSON.stringify({
    dependencies: { '@1k5/grado': 'file:vendor/1k5-grado-0.1.0.tgz', '@1k5-tech-es/grado-vue': '^0.4.0', vue: '^3.5.0' },
  })
  assert.deepEqual(gradoPackages(text), { '@1k5/grado': '0.1.0', '@1k5-tech-es/grado-vue': '0.4.0' })
})

test('withAdoption actualiza la app sin tocar estado ni detalle, y añade las nuevas', () => {
  const adoption = {
    nota: 'x',
    apps: [
      { app: 'Sales Coach', estado: 'migrando', version: '0.1.0', detalle: 'Rama feat/grado' },
      { app: 'Memorias', estado: 'pendiente', version: null, detalle: '' },
    ],
  }
  const next = withAdoption(adoption, { app: 'sales coach', version: '0.4.0', components: { Button: 2 }, date: '2026-10-16' })
  assert.deepEqual(next.apps[0], {
    app: 'Sales Coach',
    estado: 'migrando',
    version: '0.4.0',
    detalle: 'Rama feat/grado',
    componentes: { Button: 2 },
    inventario: '2026-10-16',
  })
  assert.deepEqual(next.apps[1], adoption.apps[1])
  const added = withAdoption(adoption, { app: 'Nueva', version: null, components: {}, date: '2026-10-16' })
  assert.equal(added.apps.length, 3)
  assert.equal(added.apps[2].estado, 'migrando')
})

test('CLI: usage --json y --adoption sobre un proyecto', () => {
  const dir = mkdtempSync(join(tmpdir(), 'grado-usage-'))
  try {
    mkdirSync(join(dir, 'src'))
    mkdirSync(join(dir, 'node_modules', 'x'), { recursive: true })
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'kompilot', dependencies: { '@1k5-tech-es/grado-react': '^0.4.0' } }))
    writeFileSync(
      join(dir, 'src', 'App.tsx'),
      'import { Button } from \'@1k5-tech-es/grado-react\'\nexport const A = () => <Button variant="ghost" />\n',
    )
    writeFileSync(join(dir, 'node_modules', 'x', 'i.js'), "import { Dialog } from '@1k5-tech-es/grado-react'\n<Dialog />")
    const adoption = join(dir, 'adoption.json')
    writeFileSync(adoption, JSON.stringify({ apps: [{ app: 'Kompilot', estado: 'pendiente', version: null, detalle: '' }] }))

    const json = JSON.parse(execFileSync('node', [bin, 'usage', '--json'], { cwd: dir, encoding: 'utf8' }))
    assert.equal(json.app, 'kompilot')
    assert.deepEqual(json.packages, { '@1k5-tech-es/grado-react': '0.4.0' })
    assert.deepEqual(Object.keys(json.components), ['Button'], 'node_modules no cuenta')

    const out = execFileSync('node', [bin, 'usage', dir, '--app', 'Kompilot', '--adoption', adoption], { encoding: 'utf8' })
    assert.match(out, /Kompilot · @1k5-tech-es\/grado-react 0\.4\.0/)
    assert.match(out, /Button\s+1\s+variant: ghost 1/)
    assert.match(out, /1 componente de Grado en uso/)
    const saved = JSON.parse(readFileSync(adoption, 'utf8')).apps[0]
    assert.equal(saved.version, '0.4.0')
    assert.equal(saved.estado, 'pendiente')
    assert.deepEqual(saved.componentes, { Button: 1 })
    assert.match(saved.inventario, /^\d{4}-\d{2}-\d{2}$/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('CLI: sin orden o con una desconocida enseña la ayuda', () => {
  const help = execFileSync('node', [bin, '--help'], { encoding: 'utf8' })
  assert.match(help, /grado usage/)
  assert.throws(() => execFileSync('node', [bin, 'otra'], { encoding: 'utf8', stdio: 'pipe' }))
})

test('lo que se retira en 1.0: alias de tamaño y text-2xs', () => {
  const css = usageOf('.a { font-size: var(--k5-text-badge) } .b { @apply text-2xs md:text-2xs; } .c { font: var(--k5-text-caption) }', {
    path: 'a.css',
  })
  assert.deepEqual(css.deprecated, { '--k5-text-badge': 1, 'text-2xs': 2 })
  const jsx = usageOf('<p className="text-2xs text-muted-foreground">x</p><p className="text-2xsx" />', { path: 'a.tsx' })
  assert.deepEqual(jsx.deprecated, { 'text-2xs': 1 })
  assert.deepEqual(mergeUsage([css, jsx]).deprecated, { '--k5-text-badge': 1, 'text-2xs': 3 })
})
