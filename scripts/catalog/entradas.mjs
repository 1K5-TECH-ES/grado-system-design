// Catálogo · grupo «entradas». Devuelve las secciones que se añaden al final de catalog/index.html.
// section(título, nota, ...hijos), row(...hijos) y label(texto) son los mismos ayudantes que usa catalog.mjs.
// sections({ r, G, section, row, label, icons })

const address = (id, street, postalCode, city, province, cadastralRef) => ({
  id,
  label: street,
  description: `${postalCode} ${city} (${province})`,
  value: { street, postalCode, city, province, cadastralRef },
})
const instalacion = address('valencia-colon', 'Calle de Colón, 12, 3.º B', '46004', 'Valencia', 'Valencia', '5824503YJ2752D0007BU')
// Un suggest de ejemplo: en la aplicación, llama a tu proveedor (CartoCiudad, Google Places…).
const suggest = async (query) =>
  [
    instalacion,
    address('madrid-alcala', 'Calle de Alcalá, 48', '28014', 'Madrid', 'Madrid'),
    address('sevilla-sierpes', 'Calle Sierpes, 5', '41004', 'Sevilla', 'Sevilla'),
  ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))

export default function sections({ r, G, section }) {
  const field = (props, control) => r(G.Field, props, control)
  return [
    section(
      'Campos especiales',
      'SearchInput, NifInput, PhoneInput, IbanInput, AddressInput, TimePicker, Slider y PasswordInput: alta de un cliente de autoconsumo. Datos de ejemplo.',
      r(
        G.Card,
        null,
        r(
          G.CardHeader,
          null,
          r(G.CardTitle, null, 'Alta de cliente'),
          r(G.CardDescription, null, 'Busca primero si ya existe. NIF, teléfono e IBAN se comprueban al salir de cada campo.'),
        ),
        r(
          G.CardContent,
          null,
          r(
            'div',
            { className: 'cat-grid' },
            field({ label: 'Buscar cliente existente' }, r(G.SearchInput, { defaultValue: 'Fernández', placeholder: 'Nombre, NIF o CUPS' })),
            field({ label: 'Nombre y apellidos' }, r(G.Input, { defaultValue: 'Lucía Fernández Gómez', autoComplete: 'name' })),
            field({ label: 'NIF', hint: 'DNI, NIE o CIF', required: true }, r(G.NifInput, { defaultValue: '12345678Z' })),
            field({ label: 'Teléfono', required: true }, r(G.PhoneInput, { defaultValue: '+34612345678' })),
            field({ label: 'IBAN para la domiciliación' }, r(G.IbanInput, { defaultValue: 'ES9121000418450200051332' })),
            field(
              { label: 'Dirección de la instalación', hint: 'Escribe al menos 3 letras' },
              r(G.AddressInput, { suggest, defaultValue: instalacion }),
            ),
            field(
              { label: 'Hora de la visita técnica', hint: 'De 08:00 a 20:00, cada 15 minutos' },
              r(G.TimePicker, { defaultValue: '10:30', min: '08:00', max: '20:00' }),
            ),
            field(
              { label: 'Potencia estimada' },
              r(G.Slider, {
                defaultValue: 6.5,
                min: 2,
                max: 17,
                step: 0.5,
                unit: 'kWp',
                showValue: true,
                marks: [
                  { value: 2, label: '2' },
                  { value: 6, label: '6' },
                  { value: 10, label: '10' },
                  { value: 17, label: '17 kWp' },
                ],
              }),
            ),
          ),
        ),
      ),
      r(
        'div',
        { className: 'cat-grid' },
        field({ label: 'NIF con la letra mal' }, r(G.NifInput, { defaultValue: '12345678A' })),
        field({ label: 'IBAN con un dígito cambiado' }, r(G.IbanInput, { defaultValue: 'ES9121000418450200051333' })),
        field({ label: 'Teléfono incompleto' }, r(G.PhoneInput, { defaultValue: '+3461234' })),
        field({ label: 'Visita fuera de horario' }, r(G.TimePicker, { defaultValue: '21:00', min: '08:00', max: '20:00' })),
        field({ label: 'Contraseña del portal del cliente' }, r(G.PasswordInput, { defaultValue: 'Solar2026', autoComplete: 'new-password' })),
        field({ label: 'Buscar instalación' }, r(G.SearchInput, { defaultValue: 'INS-2041', loading: true, size: 'sm' })),
      ),
    ),
  ]
}
