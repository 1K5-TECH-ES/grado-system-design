import { computed, defineComponent, h, ref, type PropType } from 'vue'
import { cx } from '@1k5-tech-es/grado/classes'
import { formatNumber, gridKeyMove, heatLevels, tooltipAlign, weekdayNames } from '@1k5-tech-es/grado/patterns'
import { autoId } from './helpers.js'
import { useGrado } from './Locale.js'

/**
 * Un valor por celda en la intensidad de un color: consumo por hora y día de la semana,
 * producción por mes y año. Para lectores de pantalla, los datos van en una tabla oculta.
 */
export const Heatmap = defineComponent({
  name: 'K5Heatmap',
  props: {
    /** Filas de valores: una por día, una columna por hora. null: sin dato. */
    data: { type: Array as PropType<(number | null)[][]>, required: true },
    /** Nombre de cada fila. Con 7 filas y sin él, los días de la semana empezando en lunes. */
    rowLabels: Array as PropType<string[]>,
    /** Nombre de cada columna. Con 24 columnas y sin él, las horas (se ve una de cada seis). */
    columnLabels: Array as PropType<string[]>,
    /** Cabecera de la columna de filas en la tabla accesible: «Día». */
    rowLabel: String,
    unit: String,
    decimals: { type: Number, default: 1 },
    /** Color: chart-1 … chart-5. */
    tone: { type: Number as PropType<1 | 2 | 3 | 4 | 5>, default: 1 },
    min: Number,
    max: Number,
    title: String,
    description: String,
    legend: { type: Boolean, default: true },
    /** Tarjeta al pasar el ratón y flechas para recorrer las celdas. */
    interactive: { type: Boolean, default: true },
    locale: String,
  },
  setup(props) {
    const t = useGrado()
    const id = autoId('k5-heatmap')
    const active = ref<[number, number] | null>(null)
    const spoken = ref('')
    const locale = computed(() => props.locale ?? t.value.locale)
    return () => {
      const m = t.value.messages
      const data = props.data
      const rows = data.length
      const columns = Math.max(0, ...data.map((row) => row.length))
      const days = weekdayNames(locale.value, 1)
      const rowNames = props.rowLabels ?? (rows === 7 ? days.map((day) => day.long) : data.map((_, i) => String(i + 1)))
      const rowShort = props.rowLabels ?? (rows === 7 ? days.map((day) => day.short) : rowNames)
      const columnNames = props.columnLabels ?? Array.from({ length: columns }, (_, i) => (columns === 24 ? `${i} h` : String(i + 1)))
      const scale = heatLevels(data, { min: props.min, max: props.max })
      const withUnit = (value: number | null | undefined) =>
        value == null
          ? '—'
          : props.unit
            ? `${formatNumber(value, locale.value, props.decimals)} ${props.unit}`
            : formatNumber(value, locale.value, props.decimals)
      const cellText = (r: number, c: number) => `${rowNames[r]}, ${columnNames[c]}: ${withUnit(data[r]?.[c])}`
      const current = props.interactive && active.value && active.value[0] < rows && active.value[1] < columns ? active.value : null
      const hasTitle = props.title != null
      const body = props.interactive
        ? {
            role: 'group',
            tabindex: 0,
            'aria-labelledby': hasTitle ? `${id}-title` : undefined,
            'aria-label': hasTitle ? undefined : m.chartData,
            'aria-describedby': `${id}-hint`,
            onKeydown: (event: KeyboardEvent) => {
              if (event.key === 'Escape') return (active.value = null)
              const next = gridKeyMove(event.key, current, rows, columns)
              if (!next) return
              event.preventDefault()
              active.value = next
              spoken.value = cellText(next[0], next[1])
            },
            onBlur: () => (active.value = null),
          }
        : { 'aria-hidden': 'true' }
      const hidden = props.interactive ? { 'aria-hidden': 'true' } : {}
      const x = current ? Math.round(((current[1] + 0.5) / columns) * 10000) / 100 : 0
      return h('figure', { class: cx('k5-chart', 'k5-heatmap', props.tone !== 1 && `k5-heatmap--tone-${props.tone}`) }, [
        props.title != null || props.description != null
          ? h('figcaption', { class: 'k5-chart__header' }, [
              props.title != null
                ? h('span', { class: 'k5-chart__title', id: props.interactive ? `${id}-title` : undefined }, props.title)
                : null,
              props.description != null ? h('span', { class: 'k5-chart__description' }, props.description) : null,
            ])
          : null,
        h('div', { class: 'k5-heatmap__body', ...body }, [
          h(
            'div',
            { class: 'k5-heatmap__rows', ...hidden },
            rowShort.slice(0, rows).map((name, r) => h('span', { key: r }, name)),
          ),
          h(
            'div',
            {
              class: 'k5-heatmap__cells',
              style: { '--_columns': String(columns) },
              ...hidden,
              ...(props.interactive
                ? {
                    onPointermove: (event: PointerEvent) => {
                      const cell = (event.target as HTMLElement).closest<HTMLElement>('[data-cell]')
                      if (cell) active.value = cell.dataset.cell!.split(':').map(Number) as [number, number]
                    },
                    onPointerleave: () => (active.value = null),
                  }
                : {}),
            },
            [
              ...data.flatMap((_, r) =>
                Array.from({ length: columns }, (__, c) => {
                  const level = scale.levels[r]?.[c]
                  return h('span', {
                    key: `${r}:${c}`,
                    'data-cell': `${r}:${c}`,
                    class: cx('k5-heatmap__cell', level == null && 'k5-heatmap__cell--empty'),
                    ...(level == null ? {} : { style: { '--_level': String(level) } }),
                    'data-active': current && current[0] === r && current[1] === c ? true : undefined,
                    title: props.interactive ? undefined : cellText(r, c),
                  })
                }),
              ),
              current
                ? h(
                    'div',
                    {
                      class: `k5-chart__tooltip k5-chart__tooltip--${tooltipAlign(x)}`,
                      style: { left: `${x}%`, bottom: `${Math.round((1 - current[0] / rows) * 10000) / 100}%` },
                    },
                    [
                      h('span', { class: 'k5-chart__tooltip-title' }, `${rowNames[current[0]]} · ${columnNames[current[1]]}`),
                      h('span', { class: 'k5-chart__tooltip-row' }, [
                        h('span', { class: 'k5-chart__tooltip-value' }, withUnit(data[current[0]]?.[current[1]])),
                      ]),
                    ],
                  )
                : null,
            ],
          ),
          h(
            'div',
            { class: 'k5-heatmap__axis', style: { '--_columns': String(columns) }, 'aria-hidden': 'true' },
            columnNames.map((name, c) => h('span', { key: c }, props.columnLabels || columns !== 24 || c % 6 === 0 ? name : '')),
          ),
          ...(props.interactive
            ? [
                h('span', { class: 'k5-sr-only', id: `${id}-hint` }, m.chartHint),
                h('span', { class: 'k5-sr-only', 'aria-live': 'polite' }, spoken.value),
              ]
            : []),
        ]),
        props.legend
          ? h('div', { class: 'k5-heatmap__legend', 'aria-hidden': 'true' }, [
              h('span', null, withUnit(scale.min)),
              h('span', { class: 'k5-heatmap__scale' }),
              h('span', null, withUnit(scale.max)),
            ])
          : null,
        h('table', { class: 'k5-sr-only' }, [
          h('caption', null, props.title ?? m.chartData),
          h('thead', null, [
            h('tr', null, [
              props.rowLabel ? h('th', { scope: 'col' }, props.rowLabel) : h('td'),
              ...columnNames.map((name, c) => h('th', { key: c, scope: 'col' }, name)),
            ]),
          ]),
          h(
            'tbody',
            null,
            data.map((row, r) =>
              h('tr', { key: r }, [
                h('th', { scope: 'row' }, rowNames[r]),
                ...Array.from({ length: columns }, (_, c) => h('td', { key: c }, withUnit(row[c]))),
              ]),
            ),
          ),
        ]),
      ])
    }
  },
})
