// Pruebas en navegador · grupo «formularios» (0.4): Form, FormField y ErrorSummary con
// react-hook-form en React y VeeValidate en Vue, con los mismos campos y las mismas reglas.
import * as R from '@1k5-tech-es/grado-react'
import * as V from '@1k5-tech-es/grado-vue'
import * as RF from '@1k5-tech-es/grado-react/react-hook-form'
import * as VF from '@1k5-tech-es/grado-vue/vee-validate'

export const initial = { formSent: '' }

const provincias = [
  { value: 'md', label: 'Madrid' },
  { value: 'vc', label: 'Valencia' },
]
const values = { titular: '', nif: '', kwp: null, provincia: '', acepto: false }
const maxKwp = (value) => value == null || value <= 15 || 'Como mucho 15 kWp'

export function render({ make, section, state, update, isVue }) {
  const G = isVue ? V : R
  const F = isVue ? VF : RF
  // En Vue el control va en el slot; en React, como hijo.
  const field = (props, control) => make(F.FormField, props, isVue ? () => control : control)
  const children = [
    make(F.ErrorSummary),
    field({ name: 'titular', label: 'Titular', required: true }, make(G.Input)),
    field({ name: 'nif', label: 'NIF del titular', required: true }, make(G.NifInput)),
    field({ name: 'kwp', label: 'Potencia', validate: maxKwp }, make(G.NumberInput, { step: 0.1, suffix: 'kWp' })),
    field({ name: 'provincia', label: 'Provincia', required: true }, make(G.Combobox, { options: provincias })),
    field({ name: 'acepto', label: 'Condiciones', required: true }, make(G.Checkbox, { label: 'Acepto las condiciones' })),
    make('button', { type: 'submit' }, 'Enviar'),
  ]
  const sent = (data) => update({ formSent: JSON.stringify(data) })
  const form = isVue
    ? make(VF.Form, { initialValues: values, 'aria-label': 'Oferta', onSubmit: sent }, () => children)
    : make(RF.Form, { defaultValues: values, 'aria-label': 'Oferta', onSubmit: sent }, ...children)
  return [section('formularios', form, make('output', null, state.formSent))]
}
