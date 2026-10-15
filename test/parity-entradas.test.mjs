// Campos especiales (grupo «entradas»): React y Vue generan el mismo HTML con las mismas props.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as R from '@1k5/grado-react'
import * as V from '@1k5/grado-vue'
import { normalize } from './normalize.mjs'

const css = readFileSync(new URL('../packages/grado/dist/grado.css', import.meta.url), 'utf8')

// En Vue, value → modelValue y autoComplete → autocomplete.
const vueProps = ({ value, autoComplete, ...props }) => ({
  ...props,
  ...(value === undefined ? {} : { modelValue: value }),
  ...(autoComplete ? { autocomplete: autoComplete } : {}),
})
// El mismo componente, dentro de un Field o suelto, en los dos frameworks.
const pair = (name, props, field) => [
  field ? r(R.Field, field, r(R[name], props)) : r(R[name], props),
  () => (field ? h(V.Field, field, () => [h(V[name], vueProps(props))]) : h(V[name], vueProps(props))),
]

const madrid = {
  id: 'alcala-48',
  label: 'Calle de Alcalá, 48',
  description: '28014 Madrid',
  value: { street: 'Calle de Alcalá, 48', postalCode: '28014', city: 'Madrid', province: 'Madrid', cadastralRef: '0847106VK4704F0001HE' },
}
const suggest = async () => [madrid]

const SCENARIOS = {
  'búsqueda vacía con etiqueta': pair('SearchInput', { placeholder: 'Buscar clientes…' }, { label: 'Buscar', id: 'buscar' }),
  'búsqueda con texto, cargando y pequeña': pair('SearchInput', { value: 'Fernández', loading: true, size: 'sm', id: 'b2' }),
  'búsqueda sola, con el nombre por defecto': pair('SearchInput', { id: 'b3', disabled: true, value: 'x' }),
  'contraseña nueva con ayuda': pair(
    'PasswordInput',
    { value: 'Solar2026', autoComplete: 'new-password', name: 'clave' },
    { label: 'Contraseña', hint: 'Mínimo 12 caracteres', id: 'clave' },
  ),
  'slider con unidad, valor y marcas': pair(
    'Slider',
    {
      value: 8.4,
      min: 2,
      max: 17,
      step: 0.1,
      unit: 'kWp',
      showValue: true,
      name: 'potencia',
      marks: [
        { value: 2, label: '2 kWp' },
        { value: 9.5, label: '9,5 kWp' },
        { value: 17, label: '17 kWp' },
      ],
    },
    { label: 'Potencia', id: 'potencia' },
  ),
  'slider suelto con formato propio': pair('Slider', { label: 'Autoconsumo', value: 65, formatValue: (n) => `${n} %`, id: 's2' }),
  'hora con franjas y campo oculto': pair(
    'TimePicker',
    { value: '09:30', min: '08:00', max: '20:00', name: 'visita' },
    { label: 'Hora de la visita', id: 'visita' },
  ),
  'hora fuera de rango': pair('TimePicker', { defaultValue: '21:00', max: '20:00', size: 'lg', id: 't2', label: 'Hora' }),
  'teléfono español': pair('PhoneInput', { value: '+34612345678', name: 'telefono' }, { label: 'Teléfono', id: 'telefono' }),
  'teléfono francés con países elegidos': pair('PhoneInput', {
    value: '+33612345678',
    country: 'FR',
    countries: ['ES', 'FR', 'PT'],
    id: 'tel-fr',
    size: 'sm',
  }),
  'teléfono que no es español': pair('PhoneInput', { defaultValue: '+3451234', id: 'tel-mal' }),
  'NIF válido': pair('NifInput', { value: 'B12345674', name: 'nif' }, { label: 'NIF', id: 'nif' }),
  'DNI con la letra mal': pair('NifInput', { defaultValue: '12345678A', id: 'dni' }, { label: 'DNI', hint: 'Con letra', id: 'dni' }),
  'IBAN válido': pair('IbanInput', { value: 'ES9121000418450200051332' }, { label: 'IBAN', id: 'iban' }),
  'IBAN con un dígito cambiado': pair('IbanInput', { defaultValue: 'ES9121000418450200051333', id: 'iban2', size: 'lg' }),
  'dirección elegida': pair('AddressInput', { suggest, value: madrid, name: 'direccion' }, { label: 'Dirección', id: 'direccion' }),
  'dirección vacía': pair('AddressInput', { suggest, label: 'Dirección de la instalación', id: 'd2', placeholder: 'Calle y número' }),
}

const html = {}
for (const [name, [reactTree, vueRender]] of Object.entries(SCENARIOS)) {
  test(`mismo HTML en React y Vue: ${name}`, async () => {
    const react = normalize(renderToStaticMarkup(reactTree))
    const vue = normalize(await renderToString(createSSRApp({ render: vueRender })))
    html[name] = react
    assert.equal(vue, react)
  })
}

test('cada clase k5- de los campos especiales existe en grado.css', () => {
  const classes = new Set(Object.values(html).flatMap((out) => [...out.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(' '))))
  for (const cls of classes)
    if (cls.startsWith('k5-')) assert.match(css, new RegExp(`\\.${cls}[\\s{:,.\\[)]`), `falta .${cls} en grado.css`)
})

test('SearchInput: lupa o spinner y botón de borrar solo con texto', () => {
  assert.match(
    html['búsqueda vacía con etiqueta'],
    /<input class="k5-input" id="buscar" placeholder="Buscar clientes…" type="search" value>/,
  )
  assert.doesNotMatch(html['búsqueda vacía con etiqueta'], /k5-input-action/)
  const busy = html['búsqueda con texto, cargando y pequeña']
  assert.match(busy, /k5-input-wrap k5-input-wrap--sm/)
  assert.match(busy, /aria-busy="true"/)
  assert.match(busy, /<span aria-hidden="true" class="k5-spinner k5-spinner--sm">/)
  assert.match(busy, /<button aria-controls="b2" aria-label="Borrar búsqueda" class="k5-input-action" type="button">/)
  assert.match(html['búsqueda sola, con el nombre por defecto'], /aria-label="Buscar"/)
  assert.doesNotMatch(html['búsqueda sola, con el nombre por defecto'], /k5-input-action/)
})

test('PasswordInput: oculta por defecto, con aria-pressed y el autocompletado pedido', () => {
  const out = html['contraseña nueva con ayuda']
  assert.match(out, /autocomplete="new-password"/)
  assert.match(out, /type="password"/)
  assert.match(out, /aria-describedby="clave-hint"/)
  assert.match(out, /aria-label="Mostrar contraseña" aria-pressed="false"/)
})

test('Slider: valor en es-ES con unidad, relleno y marcas', () => {
  const out = html['slider con unidad, valor y marcas']
  assert.match(out, /aria-valuetext="8,4 kWp"/)
  assert.match(out, /style="--_fill:0.4267"/)
  assert.match(out, /<output aria-hidden="true" class="k5-slider__value" for="potencia">8,4 kWp<\/output>/)
  assert.match(out, /style="--_at:0.5">9,5 kWp/)
  assert.match(html['slider suelto con formato propio'], /aria-valuetext="65 %"/)
})

test('TimePicker: combobox cerrado, campo oculto y error fuera de rango', () => {
  const out = html['hora con franjas y campo oculto']
  assert.match(out, /aria-expanded="false"/)
  assert.match(out, /role="combobox"/)
  assert.match(out, /<input name="visita" type="hidden" value="09:30">/)
  const late = html['hora fuera de rango']
  assert.match(late, /aria-invalid="true"/)
  assert.match(late, /<p class="k5-field__error" id="t2-check" role="alert">Elige una hora hasta las 20:00\.<\/p>/)
})

test('PhoneInput: número agrupado, prefijo elegido y error de España', () => {
  assert.match(html['teléfono español'], /value="612 345 678"/)
  assert.match(html['teléfono español'], /<option selected value="ES">ES \+34<\/option>/)
  assert.match(html['teléfono francés con países elegidos'], /value="6 12 34 56 78"/)
  assert.equal([...html['teléfono francés con países elegidos'].matchAll(/<option/g)].length, 3)
  assert.match(html['teléfono que no es español'], /Un teléfono español tiene 9 cifras\./)
})

test('NifInput e IbanInput: errores concretos enlazados con el campo', () => {
  assert.doesNotMatch(html['NIF válido'], /k5-field__error/)
  const dni = html['DNI con la letra mal']
  assert.match(dni, /aria-describedby="dni-check dni-hint"|aria-describedby="dni-hint dni-check"/)
  assert.match(dni, /La letra del DNI no coincide\./)
  assert.match(html['IBAN válido'], /value="ES91 2100 0418 4502 0005 1332"/)
  assert.match(html['IBAN con un dígito cambiado'], /Los dígitos de control del IBAN no coinciden/)
})

test('AddressInput: muestra la dirección elegida y envía su id', () => {
  const out = html['dirección elegida']
  assert.match(out, /value="Calle de Alcalá, 48"/)
  assert.match(out, /<input name="direccion" type="hidden" value="alcala-48">/)
  assert.match(html['dirección vacía'], /aria-label="Dirección de la instalación"/)
})
