// Web de documentación · grupo «entradas»: demo en vivo de cada ficha (id → componente React).
// No importes doc-helpers.mjs aquí: demos.mjs carga este archivo y doc-helpers carga demos.mjs.
import { createElement as h, useState } from 'react'
import * as G from '@1k5/grado-react'
import { formatNumber, normalizeSearch } from '@1k5/grado/patterns'

// La vista previa es flex: live-stack hace que la demo ocupe todo el ancho.
const frame = (...children) => h('div', { className: 'live-stack' }, ...children)
const note = (text) => h('p', { className: 'demo-status', role: 'status' }, text)

const clients = [
  ['Lucía Fernández', 'Valencia', 'INS-2041'],
  ['Javier Ortega', 'Murcia', 'INS-1873'],
  ['Marta Ruiz', 'Sevilla', 'INS-2035'],
  ['Andrés Molina', 'Madrid', 'INS-2029'],
  ['Carmen López', 'Alicante', 'INS-1990'],
]

// Direcciones de ejemplo; en tu aplicación, suggest llama a tu proveedor.
const address = (id, street, postalCode, city, province, cadastralRef) => ({
  id,
  label: street,
  description: `${postalCode} ${city} (${province})`,
  value: { street, postalCode, city, province, cadastralRef },
})
const addresses = [
  address('valencia-colon', 'Calle de Colón, 12', '46004', 'Valencia', 'Valencia', '5824503YJ2752D0007BU'),
  address('valencia-blasco', 'Avenida de Blasco Ibáñez, 21', '46010', 'Valencia', 'Valencia'),
  address('madrid-alcala', 'Calle de Alcalá, 48', '28014', 'Madrid', 'Madrid', '0847106VK4704F0001HE'),
  address('madrid-castellana', 'Paseo de la Castellana, 95', '28046', 'Madrid', 'Madrid'),
  address('sevilla-sierpes', 'Calle Sierpes, 5', '41004', 'Sevilla', 'Sevilla'),
  address('murcia-libertad', 'Avenida de la Libertad, 3', '30009', 'Murcia', 'Murcia'),
  address('alicante-maisonnave', 'Avenida de Maisonnave, 33', '03003', 'Alicante', 'Alicante'),
]
const suggest = (query) =>
  new Promise((done) =>
    setTimeout(
      () => done(addresses.filter((item) => normalizeSearch(`${item.label} ${item.description}`).includes(normalizeSearch(query)))),
      400,
    ),
  )

function SearchDemo() {
  const [query, setQuery] = useState('')
  const found = clients.filter((client) => normalizeSearch(client.join(' ')).includes(normalizeSearch(query)))
  return frame(
    h(
      G.Field,
      { label: 'Buscar cliente' },
      h(G.SearchInput, { value: query, onValueChange: setQuery, placeholder: 'Nombre, provincia o instalación' }),
    ),
    note(
      query
        ? `${found.length === 1 ? '1 cliente' : `${found.length} clientes`}: ${found.map((client) => client[0]).join(', ') || '—'}`
        : 'Escribe para filtrar. Escape borra.',
    ),
  )
}

function PasswordDemo() {
  const [value, setValue] = useState('')
  return frame(
    h(
      G.Field,
      { label: 'Contraseña del portal', hint: 'Mínimo 12 caracteres' },
      h(G.PasswordInput, { value, onValueChange: setValue, autoComplete: 'new-password' }),
    ),
    note(value.length >= 12 ? 'Longitud suficiente.' : `Faltan ${12 - value.length} caracteres.`),
  )
}

function SliderDemo() {
  const [kwp, setKwp] = useState(6.5)
  // Unos 1.450 kWh por kWp al año, media orientativa en la península.
  return frame(
    h(
      G.Field,
      { label: 'Potencia estimada' },
      h(G.Slider, {
        value: kwp,
        onValueChange: setKwp,
        min: 2,
        max: 17,
        step: 0.5,
        unit: 'kWp',
        showValue: true,
        marks: [
          { value: 2, label: '2 kWp' },
          { value: 10, label: '10 kWp' },
          { value: 17, label: '17 kWp' },
        ],
      }),
    ),
    note(`Producción orientativa: ${formatNumber(kwp * 1450, 'es-ES', 0)} kWh al año.`),
  )
}

function TimeDemo() {
  const [time, setTime] = useState('10:30')
  const [error, setError] = useState('')
  return frame(
    h(
      G.Field,
      { label: 'Hora de la visita técnica', hint: 'De 08:00 a 20:00. Prueba a escribir 930.' },
      h(G.TimePicker, { value: time, onValueChange: setTime, min: '08:00', max: '20:00', onErrorChange: setError }),
    ),
    note(error ? 'Hora no válida' : time ? `Valor recibido: «${time}»` : 'Sin hora'),
  )
}

function PhoneDemo() {
  const [phone, setPhone] = useState('+34612345678')
  const [country, setCountry] = useState('ES')
  return frame(
    h(G.Field, { label: 'Teléfono' }, h(G.PhoneInput, { value: phone, onValueChange: setPhone, country, onCountryChange: setCountry })),
    note(phone ? `Valor recibido: ${phone}` : 'Sin teléfono'),
  )
}

function NifDemo() {
  const [nif, setNif] = useState('')
  const [error, setError] = useState('')
  return frame(
    h(
      G.Field,
      { label: 'NIF del titular', hint: 'Prueba 12345678Z, X1234567L, B12345674 o 12345678A.' },
      h(G.NifInput, { value: nif, onValueChange: setNif, onErrorChange: setError }),
    ),
    note(nif ? (error ? 'NIF no válido' : `NIF válido: ${nif}`) : 'Sin NIF'),
  )
}

function IbanDemo() {
  const [iban, setIban] = useState('')
  const [error, setError] = useState('')
  return frame(
    h(
      G.Field,
      { label: 'IBAN para la domiciliación', hint: 'Prueba ES9121000418450200051332.' },
      h(G.IbanInput, { value: iban, onValueChange: setIban, onErrorChange: setError }),
    ),
    note(iban ? (error ? 'IBAN no válido' : `Valor recibido: ${iban}`) : 'Sin IBAN'),
  )
}

function AddressDemo() {
  const [value, setValue] = useState(null)
  return frame(
    h(
      G.Field,
      { label: 'Dirección de la instalación', hint: 'Prueba «colón», «madrid» o «avenida». Las respuestas tardan 400 ms.' },
      h(G.AddressInput, { suggest, value, onValueChange: setValue }),
    ),
    note(
      value
        ? `${value.value.street} · ${value.value.postalCode} ${value.value.city} (${value.value.province})${value.value.cadastralRef ? ` · Ref. catastral ${value.value.cadastralRef}` : ''}`
        : 'Ninguna dirección elegida',
    ),
  )
}

export const demos = {
  'search-input': SearchDemo,
  'password-input': PasswordDemo,
  slider: SliderDemo,
  'time-picker': TimeDemo,
  'phone-input': PhoneDemo,
  'nif-input': NifDemo,
  'iban-input': IbanDemo,
  'address-input': AddressDemo,
}
