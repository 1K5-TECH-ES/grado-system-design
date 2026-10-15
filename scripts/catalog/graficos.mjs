// Catálogo · grupo «gráficos». Devuelve las secciones que se añaden al final de catalog/index.html.
// section(título, nota, ...hijos), row(...hijos) y label(texto) son los mismos ayudantes que usa catalog.mjs.
// sections({ r, G, section, row, label, icons })

// Últimos 7 días de una vivienda con 8,4 kWp en Valencia. Datos de ejemplo.
const week = [
  { dia: 'Jue 8', produccion: 31.2, consumo: 18.4 },
  { dia: 'Vie 9', produccion: 28.6, consumo: 17.9 },
  { dia: 'Sáb 10', produccion: 12.3, consumo: 19.5 },
  { dia: 'Dom 11', produccion: 25.1, consumo: 16.2 },
  { dia: 'Lun 12', produccion: 33.8, consumo: 21.0 },
  { dia: 'Mar 13', produccion: 34.5, consumo: 24.3 },
  { dia: 'Mié 14', produccion: 30.9, consumo: 22.7 },
]

export default function sections({ r, G, section, label }) {
  const card = (...children) => r(G.Card, null, r(G.CardContent, null, ...children))
  return [
    section(
      'Gráficos y energía',
      'LineChart, Donut, Meter, EnergyFlow y Kpi con trend. Vivienda de 8,4 kWp en Valencia, datos de ejemplo.',
      r(
        G.KpiGroup,
        { label: 'Energía de la vivienda' },
        r(G.Kpi, {
          label: 'Producción hoy',
          value: '30,9 kWh',
          change: 8.4,
          previous: '28,5 kWh',
          trend: week.map((d) => d.produccion),
        }),
        r(G.Kpi, {
          label: 'Consumo hoy',
          value: '22,7 kWh',
          change: -6.6,
          better: 'lower',
          previous: '24,3 kWh',
          trend: week.map((d) => d.consumo),
        }),
        r(G.Kpi, { label: 'Autoconsumo', value: '68 %', change: 3.1, previous: '66 %', trend: [61, 63, 58, 64, 66, 66, 68] }),
        r(G.Kpi, { label: 'Vertido a la red', value: '8,2 kWh', hint: 'Compensado en factura', trend: [12.8, 10.7, 0, 8.9, 12.8, 10.2, 8.2] }),
      ),
      r(
        'div',
        { className: 'cat-grid' },
        card(
          r(G.LineChart, {
            title: 'Producción frente a consumo',
            description: 'kWh por día · últimos 7 días',
            data: week,
            categoryKey: 'dia',
            categoryLabel: 'Día',
            series: [
              { key: 'produccion', label: 'Producción' },
              { key: 'consumo', label: 'Consumo' },
            ],
            unit: 'kWh',
            height: 180,
          }),
        ),
        card(r(G.EnergyFlow, { title: 'Ahora mismo', solar: 5.8, home: 2.1, battery: 1.6, grid: -2.1, batteryLevel: 72 })),
      ),
      r(
        'div',
        { className: 'cat-grid' },
        card(
          r(G.Donut, {
            label: 'Energía producida hoy',
            segments: [
              { label: 'Autoconsumo', value: 21 },
              { label: 'Excedentes', value: 9.9 },
            ],
            unit: 'kWh',
            centerValue: '68 %',
            centerLabel: 'Autoconsumo',
          }),
        ),
        card(
          r(
            'div',
            { className: 'cat-stack', style: { gap: 20, justifyItems: 'stretch' } },
            r(G.Meter, { label: 'Carga de batería', value: 72, low: 20, high: 50, optimum: 100, unit: '%', variant: 'segments' }),
            r(G.Meter, { label: 'Cobertura solar del consumo', value: 68, low: 30, high: 60, optimum: 100, unit: '%' }),
            r(G.Meter, { label: 'Batería de reserva', value: 15, low: 20, high: 50, optimum: 100, unit: '%' }),
            label('Tono de low, high y optimum, como <meter>: bien, regular o mal.'),
          ),
        ),
      ),
    ),
  ]
}
