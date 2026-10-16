// Tablas con datos del servidor (0.4): columnas visibles y exportación a CSV.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toCsv, visibleColumns } from '@1k5-tech-es/grado/patterns'

const columns = [
  { key: 'cliente', header: 'Cliente' },
  { key: 'kwp', header: 'Potencia (kWp)' },
  { key: 'alta', header: 'Alta', csvValue: (row) => row.alta.slice(0, 10) },
  { key: 'nota', header: 'Nota' },
]
const rows = [
  { cliente: 'Lucía Martín', kwp: 6.4, alta: '2026-10-12T09:00:00Z', nota: 'Tejado; orientación sur' },
  { cliente: 'Jordi "JP" Puig', kwp: 1234.5, alta: '2026-10-14T16:30:00Z', nota: '=HIPERVINCULO("x")' },
  { cliente: 'Ana Gómez', kwp: null, alta: '2026-10-15T08:00:00Z', nota: '-' },
]

test('CSV en español: «;», coma decimal, sin miles y con BOM para Excel', () => {
  assert.equal(
    toCsv(rows, columns),
    '﻿Cliente;Potencia (kWp);Alta;Nota\r\n' +
      'Lucía Martín;6,4;2026-10-12;"Tejado; orientación sur"\r\n' +
      '"Jordi ""JP"" Puig";1234,5;2026-10-14;"\'=HIPERVINCULO(""x"")"\r\n' +
      "Ana Gómez;;2026-10-15;'-\r\n",
  )
})

test('CSV en inglés usa «,» y punto decimal; el separador se puede elegir', () => {
  const csv = toCsv(rows.slice(0, 1), columns.slice(0, 2), { locale: 'en-GB' })
  assert.equal(csv, '﻿Cliente,Potencia (kWp)\r\nLucía Martín,6.4\r\n')
  assert.equal(toCsv(rows.slice(0, 1), columns.slice(0, 2), { separator: '\t' }), '﻿Cliente\tPotencia (kWp)\r\nLucía Martín\t6,4\r\n')
})

test('columnas visibles: las ocultas salen, salvo las que no se pueden ocultar', () => {
  const list = [{ key: 'cliente', hideable: false }, { key: 'provincia' }, { key: 'kwp' }]
  assert.deepEqual(
    visibleColumns(list, ['provincia', 'cliente']).map((column) => column.key),
    ['cliente', 'kwp'],
  )
  assert.equal(visibleColumns(list).length, 3)
})
