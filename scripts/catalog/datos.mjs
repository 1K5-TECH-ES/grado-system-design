// Catálogo · grupo «datos y piezas». Devuelve las secciones que se añaden al final de catalog/index.html.
// section(título, nota, ...hijos), row(...hijos) y label(texto) son los mismos ayudantes que usa catalog.mjs.
import { formatNumber } from '@1k5-tech-es/grado/patterns'

const kwp = (value) => `${formatNumber(value, 'es-ES', 1)} kWp`

const installations = [
  { id: 'INS-2041', client: 'Lucía Fernández', province: 'Valencia', power: 8.4, tone: 'success', status: 'Produciendo', pulse: true },
  { id: 'INS-2038', client: 'Javier Ortega', province: 'Murcia', power: 5.2, tone: 'info', status: 'En obra' },
  { id: 'INS-2035', client: 'Marta Ruiz', province: 'Sevilla', power: 6.3, tone: 'warning', status: 'Pendiente de legalizar' },
  { id: 'INS-2029', client: 'Comunidad Las Encinas', province: 'Madrid', power: 24, tone: 'danger', status: 'Incidencia en el inversor' },
  { id: 'INS-2027', client: 'Ana Pérez', province: 'Málaga', power: 4.1, tone: 'neutral', status: 'Sin datos' },
]

const team = [
  { name: 'Lucía Fernández' },
  { name: 'Javier Ortega' },
  { name: 'Marta Ruiz' },
  { name: 'Ana Pérez' },
  { name: 'Carlos Gil' },
  { name: 'Ángel Núñez' },
]

// sections({ r, G, section, row, label, icons })
export default function sections({ r, G, section, row, label }) {
  const stack = (...children) => r('div', { className: 'cat-stack' }, ...children)
  const card = (title, description, ...content) =>
    r(
      G.Card,
      null,
      r(G.CardHeader, null, r(G.CardTitle, null, title), description ? r(G.CardDescription, null, description) : null),
      r(G.CardContent, null, ...content),
    )
  return [
    section(
      'Estado y progreso',
      'Status (punto y texto) para el estado de una fila; Progress con valor, por pasos o indeterminado.',
      r(
        G.Table,
        { caption: 'Instalaciones en seguimiento' },
        r(
          'thead',
          null,
          r(
            'tr',
            null,
            r('th', null, 'Referencia'),
            r('th', null, 'Cliente'),
            r('th', null, 'Provincia'),
            r('th', { className: 'k5-num' }, 'Potencia'),
            r('th', null, 'Estado'),
          ),
        ),
        r(
          'tbody',
          null,
          ...installations.map((item) =>
            r(
              'tr',
              { key: item.id },
              r('td', null, r('span', { className: 'cat-id' }, item.id)),
              r('td', null, item.client),
              r('td', null, item.province),
              r('td', { className: 'k5-num' }, kwp(item.power)),
              r('td', null, r(G.Status, { tone: item.tone, pulse: item.pulse }, item.status)),
            ),
          ),
        ),
      ),
      r(
        'div',
        { className: 'cat-grid' },
        card(
          'Legalización',
          'INS-2035 · Marta Ruiz',
          r(G.Progress, { steps: 5, value: 3, label: 'Trámites completados', showLabel: true, showValue: true }),
          r('p', { className: 'cat-label' }, 'Siguiente: certificado de instalación eléctrica (CIE).'),
        ),
        card(
          'Documentación',
          'Subida de archivos',
          stack(
            r(G.Progress, { value: 64, label: 'memoria-tecnica.pdf', showLabel: true, showValue: true }),
            r(G.Progress, { value: 100, label: 'boletin-cie.pdf', showLabel: true, showValue: true, tone: 'success' }),
            r(G.Progress, { value: 18, label: 'planos-cubierta.dwg', showLabel: true, showValue: true, tone: 'danger', size: 'sm' }),
          ),
        ),
        card(
          'Producción',
          'Cálculo en curso',
          r(G.Progress, { value: null, label: 'Calculando la producción estimada', showLabel: true }),
          r('p', { className: 'cat-label' }, 'Sin valor conocido: barra indeterminada.'),
        ),
      ),
    ),
    section(
      'Fichas y piezas',
      'DescriptionList con copia, CopyButton, Tag, AvatarGroup, Kbd, Separator y Link.',
      r(
        'div',
        { className: 'cat-grid' },
        card(
          'Instalación INS-2041',
          'Autoconsumo residencial con batería',
          r(G.DescriptionList, {
            items: [
              { id: 'cliente', term: 'Cliente', description: 'Lucía Fernández' },
              { id: 'direccion', term: 'Dirección', description: 'Calle de Colón 14, 46004 Valencia' },
              { id: 'potencia', term: 'Potencia', description: `${kwp(8.4)} · 14 módulos` },
              { id: 'cups', term: 'CUPS', description: 'ES0021000012345678AB', copy: 'ES0021000012345678AB', mono: true },
              {
                id: 'catastro',
                term: 'Ref. catastral',
                description: '9872023VH5797S0001WX',
                copy: '9872023VH5797S0001WX',
                mono: true,
              },
            ],
          }),
        ),
        card(
          'Resumen',
          'DescriptionList apilada',
          r(G.DescriptionList, {
            layout: 'stacked',
            items: [
              { term: 'Producción anual', description: '11.240 kWh' },
              { term: 'Ahorro estimado', description: '1.380 €/año' },
              { term: 'Alta en la distribuidora', description: '12 oct 2026' },
              { term: 'Estado', description: r(G.Status, { tone: 'success' }, 'Conectada') },
            ],
          }),
        ),
        card(
          'Zona de trabajo',
          'Equipo de Levante',
          stack(
            label('Provincias'),
            row(
              r(G.Tag, { label: 'Valencia', onRemove: () => {} }),
              r(G.Tag, { label: 'Alicante', onRemove: () => {} }),
              r(G.Tag, { label: 'Castellón', onRemove: () => {} }),
              r(G.Tag, { label: 'Murcia', onRemove: () => {}, disabled: true }),
            ),
            label('Equipo'),
            row(r(G.AvatarGroup, { items: team }), r('span', { className: 'cat-label' }, '6 técnicos')),
            r(G.Separator, { label: 'o' }),
            row(r(G.CopyButton, { value: 'https://1komma5.es/zonas/levante', label: 'Copiar enlace' })),
          ),
        ),
      ),
      row(
        r('span', null, 'Buscar ', r(G.Kbd, { keys: ['Ctrl', 'K'] })),
        r(G.Separator, { orientation: 'vertical' }),
        r('span', null, 'Nueva oferta ', r(G.Kbd, null, 'N')),
        r(G.Separator, { orientation: 'vertical' }),
        r('span', null, 'Cerrar ', r(G.Kbd, null, 'Esc')),
        r(G.Tag, { size: 'sm' }, 'Atajos'),
      ),
      r(
        'p',
        null,
        'Consulta la parcela en la ',
        r(G.Link, { href: 'https://www.sedecatastro.gob.es', external: true, underline: 'always' }, 'Sede del Catastro'),
        ' o vuelve a la ',
        r(G.Link, { href: '#', underline: 'always', tone: 'muted' }, 'lista de instalaciones'),
        '. ',
        r(G.Link, { href: '#' }, 'Ver historial'),
      ),
    ),
  ]
}
