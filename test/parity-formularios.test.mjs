// Formularios (0.4): React con react-hook-form y Vue con VeeValidate generan el mismo HTML.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as r } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import * as RF from '@1k5-tech-es/grado-react/react-hook-form'
import * as VF from '@1k5-tech-es/grado-vue/vee-validate'
import { normalize } from './normalize.mjs'

const same = (html) => normalize(html).replace(/(k5-[a-z-]+-)(?:_R_[A-Za-z0-9]*_|v-\d+(?:-\d+)*)/g, '$1AUTO')
const vue = (render) => renderToString(createSSRApp({ render }))

const values = { titular: 'Lucía Fernández', nif: '12345678A', kwp: 4.6, provincia: 'md', acepto: false }
const errors = { nif: 'La letra no coincide con el número', acepto: 'Acepta las condiciones para continuar' }
const provincias = [
  { value: 'md', label: 'Madrid' },
  { value: 'vc', label: 'Valencia' },
]

const reactForm = () =>
  r(function Oferta() {
    return r(
      RF.Form,
      { defaultValues: values, errors, onSubmit() {}, 'aria-label': 'Oferta' },
      r(RF.ErrorSummary),
      r(RF.FormField, { name: 'titular', label: 'Titular', required: true, hint: 'Como aparece en el DNI' }, r(R.Input)),
      r(RF.FormField, { name: 'nif', label: 'NIF del titular', required: true }, r(R.NifInput)),
      r(RF.FormField, { name: 'kwp', label: 'Potencia' }, r(R.NumberInput, { step: 0.1, suffix: 'kWp' })),
      r(RF.FormField, { name: 'provincia', label: 'Provincia' }, r(R.Combobox, { options: provincias })),
      r(RF.FormField, { name: 'acepto', required: true }, r(R.Checkbox, { label: 'Acepto las condiciones' })),
    )
  })
const vueForm = () =>
  h(VF.Form, { initialValues: values, initialErrors: errors, 'aria-label': 'Oferta' }, () => [
    h(VF.ErrorSummary),
    h(VF.FormField, { name: 'titular', label: 'Titular', required: true, hint: 'Como aparece en el DNI' }, () => h(V.Input)),
    h(VF.FormField, { name: 'nif', label: 'NIF del titular', required: true }, () => h(V.NifInput)),
    h(VF.FormField, { name: 'kwp', label: 'Potencia' }, () => h(V.NumberInput, { step: 0.1, suffix: 'kWp' })),
    h(VF.FormField, { name: 'provincia', label: 'Provincia' }, () => h(V.Combobox, { options: provincias })),
    h(VF.FormField, { name: 'acepto', required: true }, () => h(V.Checkbox, { label: 'Acepto las condiciones' })),
  ])

test('formulario con errores: mismo HTML en react-hook-form y VeeValidate', async () => {
  const react = renderToStaticMarkup(reactForm())
  // El error del formulario se ve una vez: NifInput no pinta el suyo dentro de FormField.
  assert.equal((react.match(/k5-field__error/g) ?? []).length, 2)
  assert.match(
    react,
    /aria-invalid="true"[^>]*aria-describedby="k5-form-[^"]*-nif-error"|aria-describedby="k5-form-[^"]*-nif-error"[^>]*aria-invalid/,
  )
  assert.match(react, /novalidate/i, 'React 19 escribe noValidate y React 18, novalidate')
  // Antes de enviar no hay resumen.
  assert.doesNotMatch(react, /k5-error-summary/)
  assert.equal(same(react), same(await vue(vueForm)))
})

test('ErrorSummary: título con plural, enlaces y nombre del campo', async () => {
  const items = [
    { id: 'nif', label: 'NIF del titular', message: 'La letra no coincide con el número' },
    { id: 'iban', message: 'Faltan 4 dígitos' },
  ]
  const react = renderToStaticMarkup(r(R.ErrorSummary, { errors: items }))
  assert.match(react, /role="alert"/)
  assert.match(react, /Revisa 2 campos antes de continuar/)
  assert.match(react, /<a class="k5-error-summary__link" href="#nif">NIF del titular: La letra no coincide con el número<\/a>/)
  assert.match(react, /href="#iban">Faltan 4 dígitos</)
  assert.equal(same(react), same(await vue(() => h(V.ErrorSummary, { errors: items }))))
  assert.equal(renderToStaticMarkup(r(R.ErrorSummary, { errors: [] })), '')
  const german = renderToStaticMarkup(r(R.GradoProvider, { locale: 'de-DE' }, r(R.ErrorSummary, { errors: items.slice(0, 1) })))
  assert.match(german, /Bitte prüfe 1 Feld, bevor du fortfährst/)
})
