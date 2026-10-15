// Catálogo · grupo «maquetación y tipografía». Devuelve las secciones que se añaden al final de catalog/index.html.
// section(título, nota, ...hijos), row(...hijos) y label(texto) son los mismos ayudantes que usa catalog.mjs.
// sections({ r, G, section, row, label, icons })
import { formatNumber } from '@1k5-tech-es/grado/patterns'

export default function sections({ r, G, section, label, icons }) {
  const kwp = (value) => `${formatNumber(value, 'es-ES', 1)} kWp`
  const headings = [
    ['display', 'Display · 40 px', `${formatNumber(1042)} kWp instalados`],
    ['title', 'Title · 28 px', 'Instalaciones en Valencia'],
    ['heading', 'Heading · 20 px', 'Documentación de la obra'],
    ['lead', 'Lead · 16 px', 'Datos del suministro'],
  ]
  const texts = [
    ['lead', 'Lead · 16 px', 'Ahorra hasta un 70 % en la factura de la luz con autoconsumo.'],
    ['body', 'Body · 14 px', 'La instalación de Lucía Fernández tiene 16 módulos y una batería de 10 kWh.'],
    ['small', 'Small · 13 px', 'Última lectura del contador: hoy a las 10:30.'],
    ['caption', 'Caption · 12 px', 'CUPS ES0021000012345678AB · Iberdrola'],
  ]
  const tones = [
    ['muted', 'Sin conexión desde ayer'],
    ['primary', 'Plan Dynamic Pulse'],
    ['success', 'Conectada'],
    ['warning', 'Pendiente de legalizar'],
    ['danger', 'Inversor sin respuesta'],
    ['info', 'Revisión programada'],
  ]
  const kpis = [
    ['Potencia instalada', kwp(8.4), 'Valencia'],
    ['Producción de octubre', `${formatNumber(1126)} kWh`, 'Autoconsumo del 68 %'],
    ['Excedentes', `${formatNumber(362.5)} kWh`, 'Compensados en factura'],
  ]
  return [
    section(
      'Maquetación y tipografía',
      'Heading y Text recorren la escala tipográfica; Stack apila en una dirección y Grid coloca piezas del mismo peso.',
      r(
        G.Grid,
        { columns: 2, gap: '8' },
        r(
          G.Stack,
          { gap: '4' },
          ...headings.map(([size, name, sample]) =>
            r(G.Stack, { gap: '1', key: size }, label(name), r(G.Heading, { level: 3, size }, sample)),
          ),
        ),
        r(
          G.Stack,
          { gap: '4' },
          ...texts.map(([size, name, sample]) => r(G.Stack, { gap: '1', key: size }, label(name), r(G.Text, { size }, sample))),
        ),
      ),
      r(
        G.Stack,
        { direction: 'row', gap: '4', wrap: true },
        ...tones.map(([tone, sample]) => r(G.Text, { tone, weight: 'medium', key: tone }, sample)),
      ),
      label('Stack en fila: título a la izquierda, acciones a la derecha'),
      r(
        G.Stack,
        { direction: 'row', justify: 'between', gap: '4', wrap: true },
        r(
          G.Stack,
          { gap: '0-5' },
          r(G.Heading, { level: 3 }, 'Lucía Fernández'),
          r(G.Text, { tone: 'muted', size: 'small' }, `Valencia · ${kwp(8.4)} · Placas y batería`),
        ),
        r(
          G.Stack,
          { direction: 'row', gap: '2' },
          r(G.Button, { variant: 'secondary' }, 'Ver ficha'),
          r(G.Button, { icon: icons.Plus }, 'Nueva oferta'),
        ),
      ),
      label('Grid de tres columnas: una sola por debajo de 600 px'),
      r(
        G.Grid,
        { columns: 3, gap: '4' },
        ...kpis.map(([name, value, note]) =>
          r(
            G.Card,
            { key: name },
            r(
              G.CardContent,
              null,
              r(
                G.Stack,
                { gap: '1' },
                r(G.Text, { size: 'small', tone: 'muted' }, name),
                r(G.Text, { size: 'lead', weight: 'semibold', numeric: true }, value),
                r(G.Text, { size: 'caption', tone: 'muted' }, note),
              ),
            ),
          ),
        ),
      ),
    ),
  ]
}
