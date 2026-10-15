// Pruebas en navegador · grupo «datos y piezas»: lo que se pinta en la página de pruebas.
// render recibe los ayudantes de fixture.mjs y devuelve una lista de section(id, ...hijos).
// C(nombre, props, ...hijos) pinta el componente en React o en Vue con las mismas props;
// en Vue, value → modelValue y onValueChange → onUpdate:modelValue. isVue para lo demás.
import * as R from '@1k5/grado-react'
import * as V from '@1k5/grado-vue'

export const initial = { datosCopies: 0, datosTags: ['Madrid', 'Valencia', 'Sevilla', 'Murcia'] }

const team = [
  { name: 'Lucía Fernández' },
  { name: 'Javier Ortega' },
  { name: 'Marta Ruiz' },
  { name: 'Ana Pérez' },
  { name: 'Carlos Gil' },
  { name: 'Ángel Núñez' },
]
const ficha = [
  { id: 'cliente', term: 'Cliente', description: 'Lucía Fernández' },
  { id: 'potencia', term: 'Potencia', description: '8,4 kWp' },
  { id: 'cups', term: 'CUPS', description: 'ES0021000012345678AB', copy: 'ES0021000012345678AB', mono: true },
]

// render({ C, make, section, button, set, state, update, isVue })
export function render({ C, make, section, state, update, isVue }) {
  // Progress y CopyButton tienen una prop value que no es v-model: se pintan sin pasar por C().
  const direct = (name, props) => make((isVue ? V : R)[name], props)
  return [
    section(
      'datos-copy',
      direct('CopyButton', { value: 'INS-2041', onCopy: () => update({ datosCopies: state.datosCopies + 1 }) }),
      direct('CopyButton', { value: 'ES0021000012345678AB', iconOnly: true, label: 'Copiar CUPS' }),
      make('output', null, String(state.datosCopies)),
    ),
    section(
      'datos-tags',
      make(
        'div',
        null,
        state.datosTags.map((label) =>
          C('Tag', { key: label, label, onRemove: () => update({ datosTags: state.datosTags.filter((tag) => tag !== label) }) }),
        ),
      ),
      C('Tag', { label: 'Zaragoza', size: 'sm', disabled: true, onRemove: () => {} }),
    ),
    section(
      'datos-progress',
      direct('Progress', { value: 64, label: 'Subida de la memoria técnica', showLabel: true, showValue: true }),
      direct('Progress', { value: null, size: 'sm', label: 'Calculando producción' }),
      direct('Progress', { steps: 5, value: 3, label: 'Legalización', showLabel: true, showValue: true, tone: 'success' }),
    ),
    section('datos-ficha', C('DescriptionList', { items: ficha }), C('DescriptionList', { items: ficha.slice(0, 2), layout: 'stacked' })),
    section(
      'datos-piezas',
      make(
        'p',
        null,
        C('Status', { tone: 'success', pulse: true }, 'Produciendo'),
        ' ',
        C('Status', { tone: 'warning' }, 'Pendiente de legalizar'),
        ' ',
        C('Status', null, 'Sin datos'),
      ),
      C('AvatarGroup', { items: team, size: 'sm' }),
      make('p', null, 'Busca con ', C('Kbd', { keys: ['Ctrl', 'K'] }), ' y cierra con ', C('Kbd', null, 'Esc'), '.'),
      C('Separator', { label: 'o' }),
      C('Separator', { decorative: false }),
      make(
        'p',
        null,
        'Consulta la ',
        C('Link', { href: 'https://www.sedecatastro.gob.es', external: true, underline: 'always' }, 'Sede del Catastro'),
        ' o la ',
        C('Link', { href: '#datos-ficha', underline: 'always', tone: 'muted' }, 'ficha'),
        '.',
      ),
    ),
  ]
}
