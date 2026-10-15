// Pruebas en navegador · grupo «maquetación y tipografía»: lo que se pinta en la página de pruebas.
// render recibe los ayudantes de fixture.mjs y devuelve una lista de section(id, ...hijos).
// C(nombre, props, ...hijos) pinta el componente en React o en Vue con las mismas props;
// en Vue, value → modelValue y onValueChange → onUpdate:modelValue. isVue para lo demás.
export const initial = {}

// render({ C, make, section, button, set, state, update, isVue })
export function render({ C, section }) {
  const card = (city, power) =>
    C('Stack', { gap: '0-5' }, C('Text', { weight: 'semibold' }, city), C('Text', { size: 'small', tone: 'muted', numeric: true }, power))
  return [
    section(
      'maq-layout',
      C(
        'Container',
        { size: 'md' },
        C(
          'Stack',
          { gap: '6' },
          C(
            'Stack',
            { direction: 'row', justify: 'between', gap: '2', wrap: true },
            C('Heading', { level: 2 }, 'Instalaciones'),
            C('Text', { as: 'span', tone: 'muted' }, '3 en curso'),
          ),
          C('Grid', { columns: 3, gap: '4' }, card('Valencia', '8,4 kWp'), card('Murcia', '5,2 kWp'), card('Sevilla', '6,6 kWp')),
          C('Grid', { gap: '3', minItemWidth: 'sm' }, card('Madrid', '4,1 kWp'), card('Málaga', '12 kWp')),
        ),
      ),
    ),
    section(
      'maq-type',
      C(
        'Stack',
        { gap: '2' },
        C('Heading', { level: 3, size: 'display' }, '1042 kWp instalados'),
        C('Heading', { level: 3 }, 'Datos del suministro'),
        C('Heading', { level: 4, as: 'p', size: 'heading' }, 'Resumen sin encabezado'),
        C('Text', { size: 'lead' }, 'Ahorra hasta un 70 % en la factura de la luz.'),
        C('Text', { tone: 'danger', weight: 'medium' }, 'Inversor sin respuesta'),
        C('Text', { tone: 'warning' }, 'Pendiente de legalizar'),
        C('Text', { tone: 'success' }, 'Conectada'),
        C('Text', { tone: 'info' }, 'Revisión programada'),
        C('Text', { tone: 'primary' }, 'Plan Dynamic Pulse'),
        C(
          'Text',
          { truncate: true, size: 'caption', tone: 'muted' },
          'Instalación de 16 módulos en tejado de teja árabe con batería de 10 kWh, cargador para el coche eléctrico y gestión dinámica de excedentes en Valencia.',
        ),
      ),
    ),
  ]
}
