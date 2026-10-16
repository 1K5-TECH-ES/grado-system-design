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
  PRESETS,
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
  // Botón, enlaces, texto de marca sobre tinte, secundario y texto sobre el acento; en claro, además, el acento sobre el fondo.
  assert.equal(contrastChecks(resolveTheme({ dark: true })).length, 11)
  assert.equal(contrastChecks(resolveTheme({ dark: false })).length, 6)
  // Con los colores de marca, la menta no llega a 3 : 1 sobre blanco: es un aviso. Con «Alto contraste», todo cumple.
  assert.deepEqual(failing({ dark: true }), ['light · Acento sobre el fondo · warning'])
  assert.deepEqual(failing({ dark: true, variant: 'C' }), [])
  // Un principal propio que no llega con ningún texto encima: el panel lo marca como fallo.
  const coral = resolveTheme({ primary: '#E5484D' })
  assert.deepEqual(failing({ primary: '#E5484D', accent: coral.palettes[0].accent, dark: true }), [
    'light · Texto del botón principal · fail',
  ])
})

test('el código de tema guarda y recupera la configuración', () => {
  const config = {
    primary: '#1D4ED8',
    accent: '#F5B000',
    variant: 'S',
    radius: 'r12',
    font: 'inter',
    base: 'marca',
    density: 'default',
    dark: true,
  }
  const code = encodeTheme(config)
  assert.equal(code, 'GRADO-1D4ED8-F5B000-S-R12-M-D')
  assert.deepEqual(decodeTheme(code), config)
  assert.deepEqual(decodeTheme(' grado-5c068c-2ed8c3-f-r8 '), {
    primary: '#5C068C',
    accent: '#2ED8C3',
    variant: 'F',
    radius: 'r8',
    font: 'inter',
    base: 'consola',
    density: 'default',
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

test('el código de tema guarda la fuente, salvo la de Grado', () => {
  for (const font of FONTS) {
    const config = {
      primary: '#1D4ED8',
      accent: '#F5B000',
      variant: 'C',
      radius: 'r4',
      font: font.id,
      base: 'consola',
      density: 'default',
      dark: false,
    }
    const code = encodeTheme(config)
    assert.equal(code.includes(font.id.toUpperCase()), font.id !== 'inter', code)
    assert.deepEqual(decodeTheme(code), config)
  }
  assert.equal(encodeTheme({ font: 'barlow', base: 'marca', dark: true }), 'GRADO-5C068C-2ED8C3-F-R8-BARLOW-M-D')
  assert.equal(decodeTheme('grado-5c068c-2ed8c3-f-r8-m-plex').font, 'plex')
})

test('las fuentes tienen nombre, pila, paquete y hoja de Google Fonts; Inter coincide con los tokens', () => {
  assert.equal(new Set(FONTS.map((font) => font.id)).size, FONTS.length)
  for (const font of FONTS) {
    assert.match(font.stack, /(^|, )ui-sans-serif, system-ui, sans-serif, /, font.id)
    if (font.system) {
      assert.equal(font.package, undefined)
      assert.equal(font.href, undefined)
      continue
    }
    if (font.bundled) assert.equal(font.package, undefined, 'Inter viene en @1k5-tech-es/grado/fonts.css')
    else assert.match(font.package, /^@fontsource\/[a-z0-9-]+$/, font.id)
    assert.match(font.href, /^https:\/\/fonts\.googleapis\.com\/css2\?family=[A-Za-z0-9+]+:wght@400;500;600;700&display=swap$/, font.id)
  }
  const tokensFont = tokensCss.match(/--k5-font-sans: ([^;]+);/)[1]
  assert.equal(FONTS.find((font) => font.id === 'inter').stack, tokensFont)
  assert.equal(FONTS.find((font) => font.id === 'sourcesans').stack.split(',')[0], '"Source Sans 3"')
})

test('el CSS del tema define cada token con y sin prefijo', () => {
  const theme = resolveTheme({ primary: '#1D4ED8', accent: '#F5B000', dark: true })
  const css = themeCss(theme)
  assert.match(css, /--k5-primary: #1D4ED8;\n {2}--primary: #1D4ED8;/)
  assert.match(css, /--k5-radius: 0\.5rem;/)
  assert.match(css, /Principal #1D4ED8 · Paleta «Personalizada», acento #F5B000 · Variante «Fiel»/)
  // El oscuro gana también a .dark[data-k5-theme="marca"] de tokens.css, y no se imprime.
  assert.match(css, /@media not print \{\n {2}\.dark,\n {2}\[data-theme="dark"\],\n {2}\.dark\[data-k5-theme\],/)
  assert.doesNotMatch(themeCss(resolveTheme({ dark: false })), /\.dark/)
  assert.match(themeCss(theme, { styles: 'tailwind3' }), /--k5-primary: #1D4ED8;\n {2}--primary: [\d.]+ [\d.]+% [\d.]+%;/)
  assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length)
})

test('el CSS del tema lleva la fuente y, con Tailwind 3, la aplica por encima del preset', () => {
  const theme = resolveTheme({ font: 'barlow' })
  assert.match(themeCss(theme), /--k5-font-sans: Barlow, ui-sans-serif,/)
  assert.match(themeCss(theme), /Fuente Barlow/)
  assert.doesNotMatch(themeCss(theme), /font-family:/)
  assert.match(themeCss(theme, { styles: 'tailwind3' }), /:root \{\n {2}font-family: var\(--k5-font-sans\);\n\}/)
})

test('los pasos de instalación usan los paquetes y los imports reales', () => {
  const theme = resolveTheme({ base: 'marca' })
  const react = installSteps(theme, { framework: 'react', styles: 'tailwind4' })
  assert.equal(react[0].code, 'npm install @1k5-tech-es/grado @1k5-tech-es/grado-react')
  assert.ok(react[1].file)
  assert.match(react[2].code, /@import '\.\/grado-tema\.css';/)
  assert.match(react.at(-1).code, /data-k5-theme="marca"/)
  const html = installSteps(theme, { framework: 'html' })
  assert.equal(html[0].code, 'npm install @1k5-tech-es/grado @1k5-tech-es/grado-elements')
  assert.match(html[2].code, /grado-tema\.css/)
  assert.match(html.at(-1).code, /<script type="module" src="\/grado\/grado-elements\.min\.js"><\/script>/)
  assert.equal(installSteps(resolveTheme({ font: 'sistema' }), { framework: 'react' }).length, 4)
  assert.equal(
    cliCommand('GRADO-5C068C-2ED8C3-F-R8', { framework: 'vue', styles: 'css' }),
    'npx @1k5-tech-es/grado init --tema GRADO-5C068C-2ED8C3-F-R8 --framework vue --estilos css',
  )
})

test('los pasos de instalación cargan la fuente elegida', () => {
  const barlow = resolveTheme({ font: 'barlow', dark: false })
  const tailwind = installSteps(barlow, { framework: 'vue', styles: 'tailwind4' })
  assert.match(tailwind[0].code, /@1k5-tech-es\/grado-vue \\\n {2}@fontsource\/barlow$/)
  assert.equal(tailwind[3].label, 'Entrada de tu aplicación · main.ts · fuente Barlow')
  assert.equal(
    tailwind[3].code,
    "import '@fontsource/barlow/400.css';\nimport '@fontsource/barlow/500.css';\nimport '@fontsource/barlow/600.css';\nimport '@fontsource/barlow/700.css';",
  )
  const css = installSteps(barlow, { framework: 'react', styles: 'css' })
  assert.equal(css.length, 3)
  assert.match(css[2].code, /^import '@fontsource\/barlow\/400\.css';[\s\S]*import '\.\/grado-tema\.css';$/)
  const html = installSteps(barlow, { framework: 'html' })
  assert.equal(html[0].code, 'npm install @1k5-tech-es/grado @1k5-tech-es/grado-elements')
  assert.match(
    html[2].code,
    /<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=Barlow:wght@400;500;600;700&display=swap">\n {2}<link rel="stylesheet" href="\/grado\/dist\/tokens\.css">/,
  )
  // Inter viene en el paquete: en HTML se copia, sin Google Fonts.
  const interHtml = installSteps(resolveTheme({ font: 'inter' }), { framework: 'html' })
  assert.match(interHtml[2].code, /<link rel="stylesheet" href="\/grado\/dist\/fonts\.css">/)
  assert.doesNotMatch(interHtml[2].code, /googleapis/)
  const inter = installSteps(resolveTheme({ font: 'inter', dark: false }), { framework: 'react', styles: 'tailwind4' })
  assert.doesNotMatch(inter[0].code, /fontsource/)
  assert.equal(inter.at(-1).code, "import '@1k5-tech-es/grado/fonts.css';")
  const system = resolveTheme({ font: 'sistema' })
  for (const framework of ['react', 'html'])
    for (const step of installSteps(system, { framework })) assert.doesNotMatch(step.code ?? '', /fontsource|fonts\.googleapis/)
})

test('el tema recalcula la escala tonal del principal: tinte, borde y texto', () => {
  const theme = resolveTheme({ primary: '#1D4ED8', accent: '#F5B000', dark: true })
  for (const mode of ['light', 'dark']) {
    const c = theme.tokens[mode]
    for (const name of ['primary-subtle', 'primary-border', 'primary-text']) assert.match(c[name], /^#[0-9A-F]{6}$/, `${mode} ${name}`)
    assert.ok(ratio(c['primary-text'], c['primary-subtle']) >= 4.5, `${mode}: texto de marca sobre su tinte`)
  }
  // Sin recalcularlos, el tinte seguiría siendo el de la berenjena.
  assert.notEqual(theme.tokens.light['primary-subtle'], resolveTheme({}).tokens.light['primary-subtle'])
  assert.match(themeCss(theme), /--k5-primary-subtle: #[0-9A-F]{6};\n {2}--primary-subtle:/)
})

test('base Campo: todo el texto a 7 : 1 con cualquier color sugerido y cualquier paleta', () => {
  for (const preset of PRESETS)
    for (const palette of resolveTheme({ primary: preset.hex }).palettes) {
      const theme = resolveTheme({ primary: preset.hex, accent: palette.accent, base: 'campo', dark: true })
      assert.equal(theme.variant.id, 'C', 'Campo usa siempre Alto contraste')
      const checks = contrastChecks(theme)
      assert.ok(checks.some((check) => check.label === 'Borde de los campos'))
      for (const check of checks) assert.ok(check.pass, `${preset.name} · ${palette.name} · ${check.mode} · ${check.label}: ${check.text}`)
      for (const check of checks.filter((item) => !item.ui)) assert.equal(check.min, 7)
    }
})

test('Consola y Marca: todo el texto a 4,5 : 1 con cualquier color sugerido, paleta y variante, también en oscuro', () => {
  // El principal y el acento oscuros, y el principal «Suave», se aclaran solo hasta donde su texto llega.
  const brand = resolveTheme({ dark: true })
  assert.equal(brand.tokens.dark['primary-foreground'], '#222222', 'el principal oscuro de serie lleva texto grafito, como en Grado')
  for (const preset of PRESETS)
    for (const base of ['consola', 'marca'])
      for (const variant of ['F', 'S', 'C'])
        for (const palette of resolveTheme({ primary: preset.hex, variant, base }).palettes) {
          const theme = resolveTheme({ primary: preset.hex, accent: palette.accent, variant, base, dark: true })
          for (const check of contrastChecks(theme).filter((item) => !item.ui))
            assert.ok(check.pass, `${preset.name} · ${base} · ${variant} · ${palette.name} · ${check.mode} · ${check.label}: ${check.text}`)
        }
})

test('base Campo y densidad: en el código, en <html> y en la instalación', () => {
  const config = {
    primary: '#1D4ED8',
    accent: '#F5B000',
    variant: 'F',
    radius: 'r8',
    font: 'inter',
    base: 'campo',
    density: 'compact',
    dark: true,
  }
  const code = encodeTheme(config)
  assert.equal(code, 'GRADO-1D4ED8-F5B000-F-R8-K-COMPACT-D')
  assert.deepEqual(decodeTheme(code), config)
  assert.equal(decodeTheme('GRADO-1D4ED8-F5B000-F-R8-COMFORT').density, 'comfortable')
  assert.equal(decodeTheme('GRADO-1D4ED8-F5B000-F-R8-COMPACT-COMFORT'), null, 'dos densidades')
  assert.equal(decodeTheme('GRADO-1D4ED8-F5B000-F-R8-M-K'), null, 'dos bases')
  const theme = resolveTheme(config)
  const tailwind = installSteps(theme, { framework: 'react', styles: 'tailwind4' })
  assert.match(tailwind[2].code, /@import '@1k5-tech-es\/grado\/themes\/campo\.css';\n@import '@1k5-tech-es\/grado\/grado\.css'/)
  assert.match(tailwind.at(-1).code, /<html lang="es" data-k5-theme="campo" data-k5-density="compact">/)
  assert.match(installSteps(theme, { framework: 'react', styles: 'tailwind3' })[2].code, /themes\/campo-hsl\.css/)
  assert.match(installSteps(theme, { framework: 'html' })[2].code, /\/grado\/dist\/themes\/campo\.css/)
  assert.doesNotMatch(installSteps(resolveTheme({}), { framework: 'react', styles: 'css' })[2].code, /campo/)
})
