// Pruebas en navegador · grupo «entradas»: lo que se pinta en la página de pruebas.
// render recibe los ayudantes de fixture.mjs y devuelve una lista de section(id, ...hijos).
// C(nombre, props, ...hijos) pinta el componente en React o en Vue con las mismas props;
// en Vue, value → modelValue y onValueChange → onUpdate:modelValue. isVue para lo demás.
import { normalizeSearch } from '@1k5-tech-es/grado/patterns'

export const initial = {
  entradasSearch: '',
  entradasPassword: '',
  entradasPower: 8,
  entradasTime: '',
  entradasPhone: '',
  entradasNif: '',
  entradasIban: '',
  entradasAddress: null,
}

const address = (id, street, postalCode, city, province) => ({
  id,
  label: street,
  description: `${postalCode} ${city}`,
  value: { street, postalCode, city, province },
})
const addresses = [
  address('alcala', 'Calle de Alcalá, 48', '28014', 'Madrid', 'Madrid'),
  address('gran-via', 'Gran Vía, 32', '28013', 'Madrid', 'Madrid'),
  address('colon', 'Calle de Colón, 12', '46004', 'Valencia', 'Valencia'),
  address('sierpes', 'Calle Sierpes, 5', '41004', 'Sevilla', 'Sevilla'),
]
// Las búsquedas de tres letras tardan más y traen una opción de más: sirve para comprobar
// que una respuesta que llega tarde no pisa la de la búsqueda más reciente.
const suggest = (query) =>
  new Promise((done) => {
    const found = addresses.filter((item) => normalizeSearch(`${item.label} ${item.description}`).includes(normalizeSearch(query)))
    const slow = query.length === 3
    setTimeout(
      () => done(slow ? [address('antigua', 'Respuesta antigua', '00000', 'Ninguna', 'Ninguna'), ...found] : found),
      slow ? 400 : 20,
    )
  })

// render({ C, make, section, button, set, state, update, isVue })
export function render({ C, make, section, set, state }) {
  return [
    section(
      'entradas-search',
      C('Field', { label: 'Buscar cliente' }, C('SearchInput', { value: state.entradasSearch, onValueChange: set('entradasSearch') })),
      make('output', null, state.entradasSearch),
    ),
    section(
      'entradas-password',
      C('Field', { label: 'Contraseña' }, C('PasswordInput', { value: state.entradasPassword, onValueChange: set('entradasPassword') })),
    ),
    section(
      'entradas-slider',
      C(
        'Field',
        { label: 'Potencia' },
        C('Slider', {
          value: state.entradasPower,
          onValueChange: set('entradasPower'),
          min: 2,
          max: 17,
          step: 0.5,
          unit: 'kWp',
          showValue: true,
          marks: [
            { value: 2, label: '2 kWp' },
            { value: 17, label: '17 kWp' },
          ],
        }),
      ),
      make('output', null, String(state.entradasPower)),
    ),
    section(
      'entradas-time',
      C(
        'Field',
        { label: 'Hora de la visita' },
        C('TimePicker', { value: state.entradasTime, onValueChange: set('entradasTime'), min: '08:00', max: '20:00' }),
      ),
      make('output', null, state.entradasTime),
    ),
    section(
      'entradas-phone',
      C('Field', { label: 'Teléfono' }, C('PhoneInput', { value: state.entradasPhone, onValueChange: set('entradasPhone') })),
      make('output', null, state.entradasPhone),
    ),
    section(
      'entradas-nif',
      C('Field', { label: 'NIF' }, C('NifInput', { value: state.entradasNif, onValueChange: set('entradasNif') })),
      make('output', null, state.entradasNif),
    ),
    section(
      'entradas-iban',
      C('Field', { label: 'IBAN' }, C('IbanInput', { value: state.entradasIban, onValueChange: set('entradasIban') })),
      make('output', null, state.entradasIban),
    ),
    section(
      'entradas-address',
      C(
        'Field',
        { label: 'Dirección de la instalación' },
        C('AddressInput', { suggest, debounce: 20, value: state.entradasAddress, onValueChange: set('entradasAddress') }),
      ),
      make('output', null, state.entradasAddress?.id ?? ''),
    ),
  ]
}
