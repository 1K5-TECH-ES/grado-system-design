// Tablas con datos del servidor (0.4): columnas visibles y exportación a CSV.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pixelHeight, toCsv, virtualWindow, visibleColumns } from '@1k5-tech-es/grado/patterns'

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

test('filas virtuales: el tramo visible con margen y el alto de lo que no se pinta', () => {
  assert.deepEqual(virtualWindow({ count: 1000, rowHeight: 40, scrollTop: 0, viewport: 400, overscan: 10 }), {
    start: 0,
    end: 20,
    before: 0,
    after: 980 * 40,
  })
  // A mitad: desde 10 filas antes de la primera visible hasta 10 después de la última.
  assert.deepEqual(virtualWindow({ count: 1000, rowHeight: 40, scrollTop: 20_000, viewport: 400, overscan: 10 }), {
    start: 490,
    end: 520,
    before: 490 * 40,
    after: 480 * 40,
  })
  // Al final no se pasa del total; sin medida de fila usa la estimación.
  assert.deepEqual(virtualWindow({ count: 30, rowHeight: 40, scrollTop: 5000, viewport: 400 }), {
    start: 30,
    end: 30,
    before: 1200,
    after: 0,
  })
  assert.equal(virtualWindow({ count: 1000, rowHeight: 0, viewport: 410 }).end, 20)
})

test('pixelHeight: solo números y px', () => {
  assert.equal(pixelHeight(480), 480)
  assert.equal(pixelHeight('480px'), 480)
  assert.equal(pixelHeight(' 32.5px '), 32.5)
  assert.equal(pixelHeight('60vh'), null)
  assert.equal(pixelHeight('30rem'), null)
  assert.equal(pixelHeight(undefined), null)
})
