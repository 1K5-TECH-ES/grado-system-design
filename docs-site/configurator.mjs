// Configurador de temas de la web («Personalizar»).
// Controles y vista previa con los componentes de @1k5/grado-react; solo el marco
// de la vista previa, las muestras de color y los selectores segmentados son de la web.
import { createElement as h, useEffect, useId, useMemo, useRef, useState } from 'react'
import * as G from '@1k5/grado-react'
import { themes } from '@1k5/grado/tokens'
import gradoPackage from '@1k5/grado/package.json' with { type: 'json' }
import { GradoLogo } from './brand.mjs'
import {
  BRAND,
  DEFAULTS,
  FONTS,
  PRESETS,
  VARIANTS,
  contrastChecks,
  cssVariables,
  decodeTheme,
  installSteps,
  normalizeHex,
  primaryContrast,
  resolveTheme,
  themeCss,
  withPrimary,
} from './palette.mjs'

export const STORAGE_KEY = 'grado-docs-custom-theme'
// La versión de los paquetes descargables: la misma que la del paquete base.
const VERSION = gradoPackage.version
const icon =
  (paths, strokeWidth = 2) =>
  (props) =>
    h(
      'svg',
      {
        ...props,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
      paths.map((d) => h('path', { key: d, d })),
    )
const plus = icon(['M12 5v14', 'M5 12h14'])
const check = icon(['m5 12 5 5 9-10'], 3)
const downloadIcon = icon(['M12 4v12', 'm7 11 5 5 5-5', 'M5 20h14'])
const linkIcon = icon(['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1', 'M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'])
const pasteIcon = icon(['M9 3h6v4H9z', 'M15 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2'])
const fileIcon = icon(['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z', 'M14 3v5h5'])
const RADIUS_NAMES = { r4: 'rectas', r8: 'suaves', r12: 'redondas' }
const presetName = (hex) => PRESETS.find((preset) => preset.hex === hex)?.name ?? 'Personalizado'

const store = {
  read() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    } catch {
      return null
    }
  },
  write(value) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      /* sin almacenamiento local: se sigue sin recordar */
    }
  },
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* sin almacenamiento local: se sigue sin recordar */
    }
  },
}

/** Tema guardado para pintar las vistas previas de Componentes. */
export function savedThemeVariables(mode) {
  const saved = store.read()
  const config = saved && decodeTheme(saved.code)
  if (!config) return null
  const theme = resolveTheme(config)
  return { code: theme.code, base: config.base, font: theme.font, vars: cssVariables(theme.tokens, mode) }
}

/** Añade a la página la hoja de Google Fonts de cada fuente que aún no la tenga. */
export function loadFonts(fonts) {
  for (const font of fonts) {
    if (!font.href || document.querySelector(`link[href="${font.href}"]`)) continue
    document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: font.href }))
  }
}

/**
 * Variables de la vista previa: todos los colores de la base de Grado para ese modo y, encima,
 * los del tema. Así la vista previa clara no hereda tarjetas ni textos del modo oscuro de la página.
 */
function previewVariables(theme, mode) {
  const out = {}
  for (const [name, value] of Object.entries(themes[theme.config.base]?.[mode]?.color ?? {})) out[`--k5-${name}`] = value
  return { ...out, ...cssVariables(theme.tokens, mode) }
}

async function copyText(text) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Portapapeles no disponible')
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.style.cssText = 'position:fixed;left:-9999px;top:0'
    document.body.append(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

function downloadFile(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/css' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** `text` puede ser una función para calcular el valor al pulsar (el enlace depende de la URL). */
function CopyButton({ text, label = 'Copiar', doneLabel = 'Copiado ✓', icon: Icon, className = 'copy-button' }) {
  const [done, setDone] = useState(false)
  const timer = useRef()
  useEffect(() => () => clearTimeout(timer.current), [])
  return h(
    'button',
    {
      type: 'button',
      className,
      onClick: async () => {
        setDone(await copyText(typeof text === 'function' ? text() : text))
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setDone(false), 1800)
      },
    },
    Icon && h(Icon, { 'aria-hidden': 'true' }),
    done ? doneLabel : label,
    h('span', { className: 'sr-only', role: 'status' }, done ? 'Copiado al portapapeles' : ''),
  )
}

function CodeBlock({ label, code, collapsible = false }) {
  const [open, setOpen] = useState(false)
  const lines = code.split('\n').length
  const collapsed = collapsible && !open && lines > 14
  return h(
    'div',
    { className: `code-block${collapsed ? ' code-block--collapsed' : ''}` },
    h('div', { className: 'code-bar' }, h('span', null, label), h(CopyButton, { text: code })),
    h('pre', { tabIndex: 0 }, h('code', null, code)),
    collapsible &&
      lines > 14 &&
      h(
        'button',
        { type: 'button', className: 'code-expand', 'aria-expanded': open, onClick: () => setOpen(!open) },
        open ? 'Contraer' : `Ver el archivo completo · ${lines} líneas`,
      ),
  )
}

/** Selector segmentado de la web: botones con aria-pressed. Una opción [clave, texto, desactivada]. */
export function Segmented({ label, value, options, onChange, disabledTitle }) {
  const id = useId()
  return h(
    'div',
    { className: 'segmented-field' },
    h('span', { className: 'segmented-label', id }, label),
    h(
      'div',
      { className: 'segmented', role: 'group', 'aria-labelledby': id },
      options.map(([key, text, disabled = false]) =>
        h(
          'button',
          {
            key,
            type: 'button',
            'aria-pressed': value === key,
            disabled,
            title: disabled ? disabledTitle : undefined,
            onClick: () => onChange(key),
          },
          text,
        ),
      ),
    ),
  )
}

function Swatches({ colors }) {
  const list = [colors.primary, colors.soft, colors.accent, colors.highlight]
  return h(
    'span',
    { className: 'swatches', 'aria-hidden': 'true' },
    list.map((color, i) => h('i', { key: i, style: { background: color } })),
  )
}

/** El color principal: muestra, HEX editable, contraste del texto que lleva encima y colores sugeridos con nombre. */
function ColorField({ value, draft, onDraft, onPick }) {
  const invalid = draft !== value && normalizeHex(draft) === null
  const contrast = primaryContrast(value)
  return h(
    'div',
    { className: 'color-card' },
    h(
      'div',
      { className: 'color-card__top' },
      h(
        'label',
        { className: 'color-swatch', style: { background: value }, title: 'Abrir el selector de color' },
        h('input', {
          type: 'color',
          value: value.toLowerCase(),
          'aria-label': 'Principal: selector de color',
          onChange: (event) => onPick(event.target.value),
        }),
      ),
      h(
        G.Field,
        {
          label: h('span', { className: 'color-field__label' }, 'Principal', h('span', null, presetName(value))),
          error: invalid ? 'Escribe un color HEX de seis cifras, por ejemplo #5C068C.' : undefined,
        },
        h(G.Input, {
          value: draft,
          spellCheck: false,
          autoComplete: 'off',
          maxLength: 7,
          invalid,
          className: 'color-field__hex',
          onChange: (event) => onDraft(event.target.value),
        }),
      ),
    ),
    h(
      'p',
      { className: 'color-card__contrast' },
      h(G.Badge, { tone: contrast.tone }, contrast.label),
      `Texto encima: ${contrast.text}`,
      contrast.warning && h('span', { className: 'color-card__warning' }, contrast.warning),
    ),
    h(
      'div',
      { className: 'preset-grid', role: 'group', 'aria-label': 'Principal: colores sugeridos' },
      PRESETS.map((preset) =>
        h(
          'button',
          {
            key: preset.hex,
            type: 'button',
            className: 'preset-tile',
            'aria-pressed': preset.hex === value,
            onClick: () => onPick(preset.hex),
          },
          h('span', { className: 'preset-tile__swatch', style: { background: preset.hex }, 'aria-hidden': 'true' }),
          h('span', { className: 'preset-tile__name' }, preset.name),
        ),
      ),
    ),
  )
}

/** Grupo de controles del configurador, con número y título. */
function Group({ id, step, title, action, children }) {
  return h(
    'section',
    { className: 'studio-group', id, 'aria-labelledby': `${id}-titulo` },
    h(
      'div',
      { className: 'studio-group__head' },
      h('h2', { id: `${id}-titulo` }, h('span', { className: 'step-number' }, step), title),
      action,
    ),
    children,
  )
}

/** Paleta que combina con el principal: sus colores, ya con la variante, y en qué consiste. */
function PaletteCard({ item, checked, onSelect }) {
  return h(
    'label',
    { className: 'palette-card', title: `Acento ${item.colors.accent} · destacado ${item.colors.highlight}` },
    h('input', { type: 'radio', className: 'sr-only', name: 'paleta', value: item.id, checked, onChange: onSelect }),
    h(Swatches, { colors: item.colors }),
    h('span', { className: 'palette-card__text' }, h('strong', null, item.name), h('span', null, item.description)),
    h('span', { className: 'palette-card__check', 'aria-hidden': 'true' }, h(check, { width: 11, height: 11 })),
  )
}

/** Base del tema: una miniatura de la disposición, con el color principal del tema. */
function BaseTile({ base, label, description, selected, primary, onSelect }) {
  return h(
    'button',
    {
      type: 'button',
      className: `style-tile style-tile--${base}`,
      'aria-pressed': selected,
      onClick: onSelect,
      style: { '--tile-primary': primary },
    },
    h(
      'span',
      { className: 'style-tile__thumb', 'aria-hidden': 'true' },
      h('i', { className: 'style-tile__header' }),
      h('i', { className: 'style-tile__side' }),
      h('i', { className: 'style-tile__main' }, h('b'), h('b')),
    ),
    h('span', { className: 'style-tile__text' }, h('strong', null, label), h('span', null, description)),
  )
}

function RadiusTile({ label, px, selected, onSelect }) {
  return h(
    'button',
    { type: 'button', className: 'radius-tile', 'aria-pressed': selected, onClick: onSelect, style: { '--tile-radius': `${px * 1.5}px` } },
    h('span', { className: 'radius-tile__glyph', 'aria-hidden': 'true' }),
    h('span', { className: 'radius-tile__text' }, h('strong', null, label), h('span', null, `${px} px`)),
  )
}

/** Fuente: su nombre y una muestra escritos con ella. */
function FontTile({ font, selected, onSelect }) {
  return h(
    'button',
    {
      type: 'button',
      className: 'font-tile',
      'aria-pressed': selected,
      title: `${font.name} · ${font.note}`,
      onClick: onSelect,
      style: { fontFamily: font.stack },
    },
    h('span', { className: 'font-tile__sample', 'aria-hidden': 'true' }, 'Aa'),
    h('span', { className: 'font-tile__name' }, font.name),
  )
}

const installations = [
  ['Casa Martín', 'Valencia', '8,4', 'Conectada', 'success'],
  ['Nave Ruiz', 'Sevilla', '42,0', 'En obra', 'brand'],
  ['Ático Soler', 'Madrid', '5,2', 'Pendiente', 'neutral'],
]

function PreviewPanel() {
  return h(
    'div',
    { className: 'tp-main' },
    h(G.PageHeader, {
      as: 'h3',
      title: 'Instalaciones',
      subtitle: 'Seguimiento de obras en curso',
      actions: h('div', { className: 'demo-row' }, h(G.Button, { variant: 'secondary' }, 'Exportar'), h(G.Button, { icon: plus }, 'Nueva')),
    }),
    h(
      G.KpiGroup,
      null,
      h(G.Kpi, { label: 'Activas', value: '128', change: 10, previous: '116' }),
      h(G.Kpi, { label: 'Potencia', value: '1.042', hint: 'kWp instalados' }),
      h(G.Kpi, { label: 'Incidencias', value: '3', change: -25, better: 'lower', previous: '4' }),
    ),
    h(
      'div',
      { className: 'tp-grid' },
      h(
        G.Card,
        null,
        h(G.CardHeader, null, h(G.CardTitle, { as: 'h4' }, 'Últimas instalaciones')),
        h(
          G.Table,
          { compact: true },
          h(
            'thead',
            null,
            h(
              'tr',
              null,
              h('th', null, 'Cliente'),
              h('th', { className: 'k5-num' }, h('span', { className: 'k5-unit' }, 'kWp')),
              h('th', null, 'Estado'),
            ),
          ),
          h(
            'tbody',
            null,
            installations.map(([name, city, kwp, status, tone]) =>
              h(
                'tr',
                { key: name },
                h('td', null, h('strong', null, name), h('br'), h('span', { className: 'tp-muted' }, city)),
                h('td', { className: 'k5-num' }, kwp),
                h('td', null, h(G.Badge, { tone }, status)),
              ),
            ),
          ),
        ),
      ),
      h(
        G.Card,
        null,
        h(
          G.CardContent,
          { className: 'tp-form' },
          h(G.Field, { label: 'Potencia instalada' }, h(G.Input, { defaultValue: '8,4', suffix: 'kWp', inputMode: 'decimal' })),
          h(G.Switch, { label: 'Incluir batería', defaultChecked: true }),
          h(
            'div',
            null,
            h('span', { className: 'tp-muted' }, 'Producción por origen'),
            h(
              'div',
              { className: 'tp-chart', 'aria-hidden': 'true' },
              ['chart-1', 'chart-2', 'chart-3'].map((name, i) =>
                h('i', { key: name, style: { flex: 5 - i, background: `var(--k5-${name})` } }),
              ),
            ),
          ),
          h(G.Button, { block: true }, 'Guardar cambios'),
        ),
      ),
    ),
  )
}

function PreviewComponents() {
  return h(
    'div',
    { className: 'tp-main tp-components' },
    h(
      'div',
      { className: 'demo-row' },
      h(G.Button, null, 'Principal'),
      h(G.Button, { variant: 'secondary' }, 'Secundario'),
      h(G.Button, { variant: 'ghost' }, 'Fantasma'),
      h(G.Button, { variant: 'link' }, 'Enlace'),
    ),
    h(
      'div',
      { className: 'demo-row' },
      h(G.Badge, { tone: 'success' }, 'Conectada'),
      h(G.Badge, { tone: 'brand' }, 'En obra'),
      h(G.Badge, { tone: 'neutral' }, 'Pendiente'),
      h(G.Badge, { tone: 'warning' }, 'Revisar'),
      h(G.Badge, { tone: 'highlight' }, 'Nuevo'),
    ),
    h(
      'div',
      { className: 'tp-components__form' },
      h(G.Field, { label: 'Cliente' }, h(G.Input, { placeholder: 'Buscar cliente…' })),
      h(
        'div',
        { className: 'tp-components__checks' },
        h(G.Checkbox, { label: 'Notificar al cliente', defaultChecked: true }),
        h(G.Switch, { label: 'Incluir batería', defaultChecked: true }),
      ),
    ),
    h(G.Tabs, {
      label: 'Pestañas de ejemplo',
      defaultValue: 'resumen',
      items: [
        {
          value: 'resumen',
          label: 'Resumen',
          content: h('p', { className: 'tp-muted' }, 'Las pestañas, los focos y la selección usan el color principal.'),
        },
        { value: 'documentos', label: 'Documentos', content: h('p', { className: 'tp-muted' }, 'Sin documentos.') },
        { value: 'historial', label: 'Historial', content: h('p', { className: 'tp-muted' }, 'Sin cambios.') },
      ],
    }),
    h(G.Pagination, { total: 48, pageSize: 10, defaultPage: 2, label: 'Paginación de ejemplo' }),
  )
}

/** Aplicación de ejemplo con el tema: componentes reales de Grado con las variables del tema. */
function ThemePreview({ theme, mode, scene }) {
  const marca = theme.config.base === 'marca'
  const nav = h(
    G.Nav,
    { label: 'Navegación de ejemplo' },
    h(G.NavItem, { as: 'button', type: 'button', label: 'Instalaciones', active: true }),
    h(G.NavItem, { as: 'button', type: 'button', label: 'Clientes', badge: 12 }),
    h(G.NavItem, { as: 'button', type: 'button', label: 'Documentos' }),
    h(G.NavItem, { as: 'button', type: 'button', label: 'Ajustes' }),
  )
  return h(
    'div',
    {
      className: `theme-preview${marca ? ' theme-preview--marca' : ''}${mode === 'dark' ? ' dark' : ''}`,
      'data-k5-theme': theme.config.base,
      style: previewVariables(theme, mode),
    },
    h(
      'div',
      { className: 'tp-header' },
      !marca && h(GradoLogo, { className: 'tp-logo' }),
      h('span', { className: 'tp-product' }, 'Mi aplicación'),
      h(G.Avatar, { name: 'Lucía Fernández', size: 'sm' }),
    ),
    h('div', { className: 'tp-sidebar' }, marca && h(GradoLogo, { className: 'tp-logo tp-logo--sidebar' }), nav),
    scene === 'components' ? h(PreviewComponents) : h(PreviewPanel),
  )
}

/** Las combinaciones de color que más se ven, con su contraste en claro y en oscuro. */
function ContrastPanel({ theme, onFix }) {
  const checks = contrastChecks(theme)
  const count = (status) => checks.filter((item) => item.status === status).length
  const warnings = count('warning'),
    fails = count('fail')
  const summary = [
    `${count('ok')} de ${checks.length} cumplen`,
    warnings && `${warnings} ${warnings === 1 ? 'aviso' : 'avisos'}`,
    fails && `${fails} no ${fails === 1 ? 'llega' : 'llegan'}`,
  ]
    .filter(Boolean)
    .join(' · ')
  return h(
    'section',
    { className: 'contrast-panel', 'aria-labelledby': 'cfg-contraste' },
    h(
      'div',
      { className: 'contrast-panel__head' },
      h('h3', { id: 'cfg-contraste' }, 'Contraste'),
      h('span', null, summary),
      onFix && warnings + fails > 0 && h(G.Button, { variant: 'secondary', size: 'sm', onClick: onFix }, 'Probar «Alto contraste»'),
    ),
    h(
      'ul',
      { className: 'contrast-list' },
      checks.map((item) =>
        h(
          'li',
          { key: `${item.mode}-${item.label}` },
          h(
            'span',
            { className: 'contrast-sample', style: { background: item.background, color: item.foreground }, 'aria-hidden': 'true' },
            item.ui ? '●' : 'Aa',
          ),
          h(
            'span',
            { className: 'contrast-label' },
            item.label,
            h('span', null, `${item.mode === 'dark' ? 'Oscuro' : 'Claro'} · mínimo ${String(item.min).replace('.', ',')} : 1`),
          ),
          h('span', { className: 'contrast-value' }, item.text),
          h(G.Badge, { tone: item.tone }, item.tag),
        ),
      ),
    ),
  )
}

function initialConfig() {
  const fromHash = decodeTheme(decodeURIComponent(location.hash.slice(1)))
  if (fromHash) return fromHash
  const saved = store.read()
  return (saved && decodeTheme(saved.code)) || DEFAULTS
}

export function Configurator() {
  const [config, setConfig] = useState(DEFAULTS)
  const [draftHex, setDraftHex] = useState(DEFAULTS.primary)
  const [view, setView] = useState('light')
  const [scene, setScene] = useState('panel')
  const [framework, setFramework] = useState('react')
  const [styles, setStyles] = useState('tailwind4')
  const [showFile, setShowFile] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [code, setCode] = useState(''),
    [codeError, setCodeError] = useState('')
  const importForm = useId()
  const loaded = useRef(false)

  const apply = (next) => {
    setConfig(next)
    setDraftHex(next.primary)
  }
  // El tema guardado o el del enlace se aplican tras montar, para no desajustar el HTML generado.
  useEffect(() => {
    apply(initialConfig())
    loadFonts(FONTS)
    try {
      setFramework(localStorage.getItem('grado-docs-framework') === 'vue' ? 'vue' : 'react')
      if (document.documentElement.classList.contains('dark')) setView('dark')
    } catch {
      /* sin almacenamiento local: se sigue sin recordar */
    }
    loaded.current = true
  }, [])

  const theme = useMemo(() => resolveTheme(config), [config])
  useEffect(() => {
    if (!loaded.current) return
    store.write({ code: theme.code })
    history.replaceState(null, '', `#${theme.code}`)
  }, [theme.code])

  const update = (patch) => setConfig((current) => ({ ...current, ...patch }))
  // Al cambiar el principal se recalculan las paletas y se mantiene el tipo elegido.
  const draft = (value) => {
    setDraftHex(value)
    const hex = normalizeHex(value)
    if (hex) setConfig((current) => withPrimary(current, hex))
  }
  const pick = (value) => {
    const hex = normalizeHex(value)
    if (hex) {
      setConfig((current) => withPrimary(current, hex))
      setDraftHex(hex)
    }
  }
  const isBrand = config.primary === BRAND.primary && config.accent === BRAND.accent
  const closeImport = () => {
    setImportOpen(false)
    setCode('')
    setCodeError('')
  }
  const loadCode = (event) => {
    event.preventDefault()
    const next = decodeTheme(code)
    if (!next) {
      setCodeError('Ese código no es válido. Tiene la forma GRADO-5C068C-2ED8C3-F-R8.')
      return
    }
    apply(next)
    closeImport()
  }

  // «Alto contraste» solo se sugiere si arregla algo: no toca, por ejemplo, el principal en oscuro.
  const problems = (value) => contrastChecks(value).filter((item) => !item.pass).length
  const fixable = config.variant !== 'C' && problems(resolveTheme({ ...config, variant: 'C' })) < problems(theme)
  // Sin modo oscuro en el tema, la vista previa solo puede ser clara.
  const mode = config.dark ? view : 'light'
  const modes = mode === 'both' ? ['light', 'dark'] : [mode]
  const css = themeCss(theme, { styles: framework === 'html' ? 'css' : styles })
  const lines = css.trimEnd().split('\n').length
  const steps = installSteps(theme, { framework, styles, version: VERSION })
  const [install, file, ...imports] = steps
  const baseName = config.base === 'marca' ? 'Marca' : 'Consola'

  return h(
    'div',
    { className: 'configurator' },
    h(G.PageHeader, {
      className: 'cfg-head',
      title: 'Personalizar',
      subtitle:
        'Diseña un tema a partir de tu color principal. Grado te propone paletas que combinan con él, comprueba el contraste y prepara el código.',
      actions: h(
        'div',
        { className: 'cfg-head__actions' },
        h(
          'div',
          { className: 'theme-code' },
          h('span', null, 'Código'),
          h('code', null, theme.code),
          h(CopyButton, { text: theme.code, label: 'Copiar', className: G.buttonClass({ variant: 'ghost', size: 'sm' }) }),
        ),
        h(
          'div',
          { className: 'cfg-head__buttons' },
          h(G.Button, { variant: 'secondary', icon: pasteIcon, onClick: () => setImportOpen(true) }, 'Pegar código'),
          h(CopyButton, {
            text: () => `${location.origin}${location.pathname}#${theme.code}`,
            label: 'Copiar enlace',
            doneLabel: 'Enlace copiado ✓',
            icon: linkIcon,
            className: G.buttonClass({ variant: 'secondary' }),
          }),
          h(G.Button, { icon: downloadIcon, onClick: () => downloadFile('grado-tema.css', css) }, 'Descargar grado-tema.css'),
        ),
        h('p', { className: 'cfg-head__note' }, 'Tu tema se guarda en este navegador y en el enlace de esta página.'),
      ),
    }),

    h(
      'div',
      { className: 'studio' },
      h(
        'div',
        { className: 'studio-controls' },
        h(
          Group,
          {
            id: 'cfg-colores',
            step: '1',
            title: 'Tu color principal',
            action:
              !isBrand &&
              h(
                G.Button,
                { variant: 'ghost', size: 'sm', onClick: () => apply({ ...config, primary: BRAND.primary, accent: BRAND.accent }) },
                'Restablecer',
              ),
          },
          h(ColorField, { value: config.primary, draft: draftHex, onDraft: draft, onPick: pick }),
        ),

        h(
          Group,
          { id: 'cfg-paleta', step: '2', title: 'Paleta' },
          h(
            'p',
            { className: 'studio-group__intro' },
            'Colores que combinan con tu principal. El acento resalta menús y selección; el acento y el destacado colorean los gráficos.',
          ),
          h(
            'fieldset',
            { className: 'palette-grid' },
            h('legend', { className: 'sr-only' }, 'Elige una paleta'),
            theme.palettes.map((item) =>
              h(PaletteCard, { key: item.id, item, checked: item === theme.palette, onSelect: () => update({ accent: item.accent }) }),
            ),
          ),
          h(
            'div',
            { className: 'variant-field' },
            h(Segmented, {
              label: 'Variante',
              value: theme.variant.id,
              options: VARIANTS.map((item) => [item.id, item.name]),
              onChange: (variant) => update({ variant }),
            }),
            h('p', { className: 'field-note' }, theme.variant.description),
          ),
        ),

        h(
          Group,
          { id: 'cfg-estilo', step: '3', title: 'Estilo' },
          h(
            'div',
            { className: 'settings' },
            h(
              'div',
              { className: 'style-field' },
              h('span', { className: 'segmented-label', id: 'cfg-base' }, 'Base'),
              h(
                'div',
                { className: 'style-tiles', role: 'group', 'aria-labelledby': 'cfg-base' },
                h(BaseTile, {
                  base: 'consola',
                  label: 'Consola',
                  description: 'Cabecera de color. Herramientas internas.',
                  selected: config.base === 'consola',
                  primary: theme.tokens.light.primary,
                  onSelect: () => update({ base: 'consola' }),
                }),
                h(BaseTile, {
                  base: 'marca',
                  label: 'Marca',
                  description: 'Barra lateral de color. Lo que ve el cliente.',
                  selected: config.base === 'marca',
                  primary: theme.tokens.light.primary,
                  onSelect: () => update({ base: 'marca', radius: config.radius === 'r8' ? 'r12' : config.radius }),
                }),
              ),
            ),
            h(
              'div',
              { className: 'style-field' },
              h('span', { className: 'segmented-label', id: 'cfg-esquinas' }, 'Esquinas'),
              h(
                'div',
                { className: 'radius-tiles', role: 'group', 'aria-labelledby': 'cfg-esquinas' },
                [
                  ['r4', 'Rectas', 4],
                  ['r8', 'Suaves', 8],
                  ['r12', 'Redondas', 12],
                ].map(([key, label, px]) =>
                  h(RadiusTile, { key, label, px, selected: config.radius === key, onSelect: () => update({ radius: key }) }),
                ),
              ),
            ),
            h(
              'div',
              { className: 'style-field' },
              h('span', { className: 'segmented-label', id: 'cfg-fuente' }, 'Fuente'),
              h(
                'div',
                { className: 'font-tiles', role: 'group', 'aria-labelledby': 'cfg-fuente' },
                FONTS.map((font) =>
                  h(FontTile, { key: font.id, font, selected: theme.font.id === font.id, onSelect: () => update({ font: font.id }) }),
                ),
              ),
              h('p', { className: 'field-note' }, h('strong', null, theme.font.name), ` · ${theme.font.note}`),
            ),
            h(G.Switch, {
              label: 'Incluir modo oscuro',
              description: 'Añade al CSS los colores para la clase dark y activa «Oscuro» en la vista previa.',
              checked: config.dark,
              onCheckedChange: (dark) => update({ dark }),
            }),
          ),
        ),
      ),

      h(
        'section',
        { className: 'studio-canvas', 'aria-labelledby': 'cfg-vista' },
        h(
          'div',
          { className: 'canvas-bar' },
          h(
            'div',
            null,
            h('h2', { id: 'cfg-vista' }, 'Vista previa'),
            h(
              'p',
              null,
              `${theme.palette.name} · ${theme.variant.name} · ${baseName} · esquinas ${RADIUS_NAMES[config.radius]} · ${theme.font.name}`,
            ),
          ),
          h(
            'div',
            { className: 'canvas-bar__controls' },
            h(Segmented, {
              label: 'Escena de la vista previa',
              value: scene,
              options: [
                ['panel', 'Panel'],
                ['components', 'Componentes'],
              ],
              onChange: setScene,
            }),
            h(Segmented, {
              label: 'Modo de la vista previa',
              value: mode,
              options: [
                ['light', 'Claro'],
                ['dark', 'Oscuro', !config.dark],
                ['both', 'Claro y oscuro', !config.dark],
              ],
              onChange: setView,
              disabledTitle: 'Activa «Incluir modo oscuro» para verlo',
            }),
          ),
        ),
        h(
          'div',
          { className: `canvas-stage${mode === 'dark' ? ' canvas-stage--dark' : ''}${mode === 'both' ? ' canvas-stage--both' : ''}` },
          modes.map((item) =>
            h(
              'div',
              { key: item, className: 'canvas-view' },
              mode === 'both' && h('p', { className: 'canvas-view__label' }, item === 'dark' ? 'Oscuro' : 'Claro'),
              h(ThemePreview, { theme, mode: item, scene }),
            ),
          ),
        ),
        h(ContrastPanel, { theme, onFix: fixable ? () => update({ variant: 'C' }) : null }),
        h(
          'p',
          { className: 'canvas-note' },
          'Componentes reales de Grado con las variables de tu tema. Los datos son de ejemplo. ',
          h('a', { href: 'componentes?vista=mi-tema' }, 'Ver todos los componentes con tu tema →'),
        ),
      ),
    ),

    h(
      'section',
      { className: 'install-panel', id: 'cfg-instalar', 'aria-labelledby': 'cfg-instalar-titulo' },
      h(
        'div',
        { className: 'install-head' },
        h(
          'div',
          null,
          h('span', { className: 'step-number', 'aria-hidden': 'true' }, '4'),
          h('h2', { id: 'cfg-instalar-titulo' }, 'Lleva el tema a tu aplicación'),
          h(
            'p',
            null,
            'Un archivo CSS que se importa después de Grado y, si no usas la del sistema, la fuente. No hay que tocar la librería.',
          ),
        ),
        h(
          'div',
          { className: 'install-options' },
          h(Segmented, {
            label: 'Framework',
            value: framework,
            options: [
              ['react', 'React'],
              ['vue', 'Vue'],
              ['html', 'HTML'],
            ],
            onChange: setFramework,
          }),
          framework !== 'html' &&
            h(Segmented, {
              label: 'Estilos',
              value: styles,
              options: [
                ['tailwind4', 'Tailwind 4'],
                ['tailwind3', 'Tailwind 3'],
                ['css', 'CSS'],
              ],
              onChange: setStyles,
            }),
        ),
      ),
      h(
        'ol',
        { className: 'install-grid' },
        h('li', null, h('h3', null, 'Instala Grado'), h(CodeBlock, { label: install.label, code: install.code })),
        h(
          'li',
          null,
          h('h3', null, 'Añade tu tema'),
          h(
            'div',
            { className: 'file-card' },
            h(
              'div',
              { className: 'file-card__head' },
              h('span', { className: 'file-card__icon', 'aria-hidden': 'true' }, h(fileIcon, { width: 20, height: 20 })),
              h(
                'span',
                { className: 'file-card__name' },
                h('strong', null, 'grado-tema.css'),
                h('span', null, `${lines} líneas · ${config.dark ? 'claro y oscuro' : 'solo claro'}`),
              ),
              h(Swatches, { colors: theme.palette.colors }),
            ),
            h(
              'div',
              { className: 'file-card__actions' },
              h(G.Button, { size: 'sm', icon: downloadIcon, onClick: () => downloadFile('grado-tema.css', css) }, 'Descargar'),
              h(CopyButton, { text: css, label: 'Copiar', className: G.buttonClass({ variant: 'secondary', size: 'sm' }) }),
              h(
                G.Button,
                { variant: 'ghost', size: 'sm', 'aria-expanded': showFile, onClick: () => setShowFile(!showFile) },
                showFile ? 'Ocultar el archivo' : 'Ver el archivo',
              ),
            ),
            h('p', null, 'Guárdalo en ', h('code', null, file.label.split(' · ')[0]), '.'),
          ),
        ),
        h(
          'li',
          null,
          h('h3', null, 'Impórtalo'),
          imports.map((item) => h(CodeBlock, { key: item.label, label: item.label, code: item.code })),
        ),
      ),
      showFile && h('div', { className: 'install-file' }, h(CodeBlock, { label: file.label, code: css })),
    ),

    h(
      G.Dialog,
      {
        open: importOpen,
        onOpenChange: (open) => (open ? setImportOpen(true) : closeImport()),
        title: 'Cargar un tema',
        description: 'Pega un código de Grado para recuperar sus colores y ajustes.',
        footer: [
          h(G.Button, { key: 'cancel', variant: 'secondary', onClick: closeImport }, 'Cancelar'),
          h(G.Button, { key: 'load', type: 'submit', form: importForm }, 'Cargar'),
        ],
      },
      h(
        'form',
        { id: importForm, onSubmit: loadCode },
        h(
          G.Field,
          {
            label: 'Código de tema',
            hint: codeError ? undefined : 'Tiene la forma GRADO-5C068C-2ED8C3-F-R8.',
            error: codeError || undefined,
          },
          h(G.Input, {
            value: code,
            placeholder: 'GRADO-…',
            spellCheck: false,
            autoComplete: 'off',
            onChange: (event) => {
              setCode(event.target.value)
              setCodeError('')
            },
          }),
        ),
      ),
    ),
  )
}
