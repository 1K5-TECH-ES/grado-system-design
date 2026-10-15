import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  BRAND,
  DEFAULTS,
  FONTS,
  VARIANTS,
  buildPalettes,
  cliCommand,
  contrastChecks,
  decodeTheme,
  encodeTheme,
  fromOklch,
  harmonies,
  installSteps,
  normalizeHex,
  oklch,
  primaryContrast,
  ratio,
  resolveTheme,
  themeCss,
  withPrimary,
} from '../palette.mjs'

const tokensCss = readFileSync(new URL('../../packages/grado/dist/tokens.css', import.meta.url), 'utf8')
const consolaLight = Object.fromEntries(
  [...tokensCss.split('/* consola · oscuro */')[0].matchAll(/--k5-([a-z0-9-]+):\s*(#[0-9A-F]{6})/g)].map((m) => [m[1], m[2]]),
)

test('normaliza colores HEX y rechaza el resto', () => {
  assert.equal(normalizeHex('5c068c'), '#5C068C')
  assert.equal(normalizeHex(' #2ed8c3 '), '#2ED8C3')
  for (const bad of ['', '#FFF', 'rojo', '#12345G', null]) assert.equal(normalizeHex(bad), null)
})

test('la paleta de marca en su variante Fiel reproduce Consola', () => {
  const { palette, variant, tokens } = resolveTheme({})
  assert.equal(palette.id, 'marca')
  assert.equal(variant.id, 'F')
  for (const name of [
    'primary',
    'primary-foreground',
    'accent',
    'accent-foreground',
    'ring',
    'header',
    'muted-foreground',
    'sidebar-accent',
    'background',
  ]) {
    assert.equal(tokens.light[name], consolaLight[name], name)
  }
})

const SAMPLES = [BRAND.primary, '#1D4ED8', '#0F6B4F', '#B9400E', '#222222', '#38BDF8', '#F5B000', '#FFFFFF', '#000000']

test('cada principal recibe paletas que combinan con él', () => {
  for (const primary of SAMPLES) {
    const list = harmonies(primary)
    assert.ok(list.length >= 5, primary)
    assert.equal(new Set(list.map((p) => p.id)).size, list.length, primary)
    for (const palette of list)
      for (const color of [palette.accent, palette.highlight]) assert.match(color, /^#[0-9A-F]{6}$/, `${primary} ${palette.id}`)
    // Sin contraste con el principal, el acento no se distinguiría en menús ni gráficos.
    for (const palette of list) assert.ok(ratio(palette.accent, primary) >= 1.5, `${primary} ${palette.id}`)
  }
})

test('las armonías giran el tono del principal en OKLCH', () => {
  const hue = (hex) => oklch(hex).h
  const turn = (a, b) => (((hue(b) - hue(a)) % 360) + 360) % 360
  const byId = Object.fromEntries(harmonies('#1D4ED8').map((p) => [p.id, p]))
  assert.ok(Math.abs(turn('#1D4ED8', byId.complementaria.accent) - 180) < 4)
  assert.ok(Math.abs(turn('#1D4ED8', byId.triada.accent) - 120) < 4)
  assert.ok(Math.abs(turn('#1D4ED8', byId.triada.highlight) - 240) < 4)
  assert.ok(Math.abs(turn('#1D4ED8', byId.monocromatica.accent)) < 4)
  assert.deepEqual(oklch('#FFFFFF').c < 0.001, true)
  assert.equal(fromOklch(oklch('#5C068C').l, oklch('#5C068C').c, oklch('#5C068C').h), '#5C068C')
})

test('la berenjena y los grises empiezan por la paleta de marca; el resto, por las armonías', () => {
  for (const primary of [BRAND.primary, '#222222']) {
    const [first] = harmonies(primary)
    assert.deepEqual([first.id, first.accent, first.highlight], ['marca', BRAND.accent, BRAND.highlight])
  }
  assert.ok(!harmonies('#1D4ED8').some((p) => p.id === 'marca'))
  assert.ok(harmonies('#222222').every((p) => p.id !== 'monocromatica'))
})

test('un acento que no está entre las sugeridas se conserva como «Personalizada»', () => {
  const theme = resolveTheme({ primary: '#1D4ED8', accent: '#F5B000' })
  assert.equal(theme.palette.id, 'personalizada')
  assert.equal(theme.tokens.light.accent, '#F5B000')
  assert.equal(theme.palettes.at(-1), theme.palette)
  assert.equal(resolveTheme({}).palettes.filter((p) => p.id === 'personalizada').length, 0)
})

test('al cambiar el principal se mantiene el tipo de paleta', () => {
  const triada = harmonies(BRAND.primary).find((p) => p.id === 'triada')
  const next = withPrimary({ ...DEFAULTS, accent: triada.accent }, '#1D4ED8')
  assert.equal(next.primary, '#1D4ED8')
  assert.equal(resolveTheme(next).palette.id, 'triada')
  // La de marca solo existe con la berenjena: con otro principal se pasa a la primera armonía.
  assert.equal(resolveTheme(withPrimary(DEFAULTS, '#1D4ED8')).palette.id, 'complementaria')
  assert.equal(resolveTheme(withPrimary(DEFAULTS, '#222222')).palette.id, 'marca')
})

test('Alto contraste llega a AAA y el acento se puede usar como fondo de texto blanco', () => {
  for (const primary of ['#2ED8C3', '#38BDF8', BRAND.primary]) {
    for (const palette of buildPalettes(primary, BRAND.accent, 'C')) {
      assert.ok(ratio(palette.colors.primary, '#FFFFFF') >= 7, `${primary} ${palette.id}`)
      assert.ok(ratio(palette.colors.accent, '#FFFFFF') >= 4.5, `${primary} ${palette.id}`)
    }
  }
})

test('los textos derivados se leen sobre sus fondos', () => {
  for (const primary of [BRAND.primary, '#1D4ED8', '#0F6B4F', '#222222', '#F5B000']) {
    for (const { accent } of harmonies(primary)) {
      for (const variant of VARIANTS.map((v) => v.id)) {
        for (const base of ['consola', 'marca']) {
          const { tokens } = resolveTheme({ primary, accent, variant, base })
          for (const mode of ['light', 'dark']) {
            const c = { ...tokens[mode] }
            const bg = c.background,
              card = c.card ?? '#FFFFFF'
            const where = `${primary} ${accent} ${variant} ${base} ${mode}`
            assert.ok(ratio(c['muted-foreground'], c.muted) >= 4.5, `${where} muted`)
            assert.ok(ratio(c['secondary-foreground'], c.secondary) >= 4.5, `${where} secondary`)
            assert.ok(ratio(c['primary-text'], bg) >= 4.5 && ratio(c['primary-text'], card) >= 4.5, `${where} primary-text`)
            assert.ok(ratio(c['accent-foreground'], c.accent) >= 3, `${where} accent`)
          }
        }
      }
    }
  }
})

test('avisa cuando el principal no se distingue del fondo', () => {
  assert.ok(primaryContrast('#FFFFFF').warning)
  assert.equal(primaryContrast(BRAND.primary).warning, null)
  assert.equal(primaryContrast(BRAND.primary).label, 'AAA')
})

test('el panel de contraste revisa el modo claro y, si el tema lo incluye, el oscuro', () => {
  const failing = (config) =>
    contrastChecks(resolveTheme(config))
      .filter((item) => !item.pass)
      .map((item) => `${item.mode} · ${item.label} · ${item.status}`)
  assert.equal(contrastChecks(resolveTheme({ dark: true })).length, 6)
  assert.equal(contrastChecks(resolveTheme({ dark: false })).length, 4)
  // Con los colores de marca, la menta no llega a 3 : 1 sobre blanco (aviso) y el principal en oscuro se queda en 4,1 : 1.
  assert.deepEqual(failing({ dark: true }), ['light · Acento sobre el fondo · warning', 'dark · Texto del botón principal · fail'])
  assert.deepEqual(failing({ dark: true, variant: 'C' }), ['dark · Texto del botón principal · fail'])
})

test('el código de tema guarda y recupera la configuración', () => {
  const config = { primary: '#1D4ED8', accent: '#F5B000', variant: 'S', radius: 'r12', font: 'barlow', base: 'marca', dark: true }
  const code = encodeTheme(config)
  assert.equal(code, 'GRADO-1D4ED8-F5B000-S-R12-M-D')
  assert.deepEqual(decodeTheme(code), config)
  assert.deepEqual(decodeTheme(' grado-5c068c-2ed8c3-f-r8 '), {
    primary: '#5C068C',
    accent: '#2ED8C3',
    variant: 'F',
    radius: 'r8',
    font: 'barlow',
    base: 'consola',
    dark: false,
  })
  // Los códigos con la antigua propuesta «Equilibrada» se abren con «Fiel».
  assert.equal(decodeTheme('GRADO-1D4ED8-F5B000-E-R8').variant, 'F')
  for (const bad of [
    '',
    'GRADO-5C068C-2ED8C3-X-R8',
    'GRADO-5C068C-2ED8C3-F-R9',
    'GRADO-5C068C-2ED8C3-F-R8-COMIC',
    'GRADO-5C068C-2ED8C3-F-R8-INTER-ROBOTO',
    'otra cosa',
  ])
    assert.equal(decodeTheme(bad), null)
})

test('el código de tema guarda la fuente, salvo la de marca', () => {
  for (const font of FONTS) {
    const config = { primary: '#1D4ED8', accent: '#F5B000', variant: 'C', radius: 'r4', font: font.id, base: 'consola', dark: false }
    const code = encodeTheme(config)
    assert.equal(code.includes(font.id.toUpperCase()), font.id !== 'barlow', code)
    assert.deepEqual(decodeTheme(code), config)
  }
  assert.equal(encodeTheme({ font: 'inter', base: 'marca', dark: true }), 'GRADO-5C068C-2ED8C3-F-R8-INTER-M-D')
  assert.equal(decodeTheme('grado-5c068c-2ed8c3-f-r8-m-plex').font, 'plex')
})

test('las fuentes tienen nombre, pila, paquete y hoja de Google Fonts; Barlow coincide con los tokens', () => {
  assert.equal(new Set(FONTS.map((font) => font.id)).size, FONTS.length)
  for (const font of FONTS) {
    assert.match(font.stack, /(^|, )ui-sans-serif, system-ui, sans-serif, /, font.id)
    if (font.system) {
      assert.equal(font.package, undefined)
      assert.equal(font.href, undefined)
      continue
    }
    if (font.bundled) assert.equal(font.package, undefined, 'Barlow viene en @1k5/grado/fonts.css')
    else assert.match(font.package, /^@fontsource\/[a-z0-9-]+$/, font.id)
    assert.match(font.href, /^https:\/\/fonts\.googleapis\.com\/css2\?family=[A-Za-z0-9+]+:wght@400;500;600;700&display=swap$/, font.id)
  }
  const tokensFont = tokensCss.match(/--k5-font-sans: ([^;]+);/)[1]
  assert.equal(FONTS.find((font) => font.id === 'barlow').stack, tokensFont)
  assert.equal(FONTS.find((font) => font.id === 'sourcesans').stack.split(',')[0], '"Source Sans 3"')
})

test('el CSS del tema define cada token con y sin prefijo', () => {
  const theme = resolveTheme({ primary: '#1D4ED8', accent: '#F5B000', dark: true })
  const css = themeCss(theme)
  assert.match(css, /--k5-primary: #1D4ED8;\n {2}--primary: #1D4ED8;/)
  assert.match(css, /--k5-radius: 0\.5rem;/)
  assert.match(css, /Principal #1D4ED8 · Paleta «Personalizada», acento #F5B000 · Variante «Fiel»/)
  assert.match(css, /\.dark,\n\[data-theme="dark"\]/)
  assert.doesNotMatch(themeCss(resolveTheme({ dark: false })), /\.dark/)
  assert.match(themeCss(theme, { styles: 'tailwind3' }), /--k5-primary: #1D4ED8;\n {2}--primary: [\d.]+ [\d.]+% [\d.]+%;/)
  assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length)
})

test('el CSS del tema lleva la fuente y, con Tailwind 3, la aplica por encima del preset', () => {
  const theme = resolveTheme({ font: 'inter' })
  assert.match(themeCss(theme), /--k5-font-sans: Inter, ui-sans-serif,/)
  assert.match(themeCss(theme), /Fuente Inter/)
  assert.doesNotMatch(themeCss(theme), /font-family:/)
  assert.match(themeCss(theme, { styles: 'tailwind3' }), /:root \{\n {2}font-family: var\(--k5-font-sans\);\n\}/)
})

test('los pasos de instalación usan los paquetes y los imports reales', () => {
  const theme = resolveTheme({ base: 'marca' })
  const react = installSteps(theme, { framework: 'react', styles: 'tailwind4' })
  assert.match(react[0].code, /1k5-grado-0\.1\.0\.tgz \\\n {2}\.\/vendor\/1k5-grado-react-0\.1\.0\.tgz/)
  assert.ok(react[1].file)
  assert.match(react[2].code, /@import '\.\/grado-tema\.css';/)
  assert.match(react.at(-1).code, /data-k5-theme="marca"/)
  const html = installSteps(theme, { framework: 'html' })
  assert.equal(html[0].code, 'npm install ./vendor/1k5-grado-0.1.0.tgz')
  assert.match(html[2].code, /grado-tema\.css/)
  assert.equal(installSteps(resolveTheme({ font: 'sistema' }), { framework: 'react' }).length, 4)
  assert.equal(
    cliCommand('GRADO-5C068C-2ED8C3-F-R8', { framework: 'vue', styles: 'css' }),
    'npx @1k5/grado init --tema GRADO-5C068C-2ED8C3-F-R8 --framework vue --estilos css',
  )
})

test('los pasos de instalación cargan la fuente elegida', () => {
  const inter = resolveTheme({ font: 'inter', dark: false })
  const tailwind = installSteps(inter, { framework: 'vue', styles: 'tailwind4' })
  assert.match(tailwind[0].code, /1k5-grado-vue-0\.1\.0\.tgz \\\n {2}@fontsource\/inter$/)
  assert.equal(tailwind[3].label, 'Entrada de tu aplicación · main.ts · fuente Inter')
  assert.equal(
    tailwind[3].code,
    "import '@fontsource/inter/400.css';\nimport '@fontsource/inter/500.css';\nimport '@fontsource/inter/600.css';\nimport '@fontsource/inter/700.css';",
  )
  const css = installSteps(inter, { framework: 'react', styles: 'css' })
  assert.equal(css.length, 3)
  assert.match(css[2].code, /^import '@fontsource\/inter\/400\.css';[\s\S]*import '\.\/grado-tema\.css';$/)
  const html = installSteps(inter, { framework: 'html' })
  assert.equal(html[0].code, 'npm install ./vendor/1k5-grado-0.1.0.tgz')
  assert.match(
    html[2].code,
    /<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter:wght@400;500;600;700&display=swap">\n {2}<link rel="stylesheet" href="\/grado\/tokens\.css">/,
  )
  const barlow = installSteps(resolveTheme({ font: 'barlow', dark: false }), { framework: 'react', styles: 'tailwind4' })
  assert.doesNotMatch(barlow[0].code, /fontsource/)
  assert.equal(barlow.at(-1).code, "import '@1k5/grado/fonts.css';")
  const system = resolveTheme({ font: 'sistema' })
  for (const framework of ['react', 'html'])
    for (const step of installSteps(system, { framework })) assert.doesNotMatch(step.code ?? '', /fontsource|fonts\.googleapis/)
})
