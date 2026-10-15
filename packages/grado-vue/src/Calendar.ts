import { computed, defineComponent, h, nextTick, ref, type PropType } from 'vue'
import { cx, ICON_PATHS } from '@1k5/grado/classes'
import {
  addDays,
  addMonths,
  clampDate,
  dateLabel,
  monthTitle,
  monthWeeks,
  nextRange,
  startOfWeek,
  todayIso,
  weekdayNames,
  type DateRangeValue,
} from '@1k5/grado/patterns'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { autoId, model } from './helpers.js'

const KEY_MOVES: Record<string, (iso: string, shift: boolean, weekStartsOn: number) => string> = {
  ArrowLeft: (iso) => addDays(iso, -1),
  ArrowRight: (iso) => addDays(iso, 1),
  ArrowUp: (iso) => addDays(iso, -7),
  ArrowDown: (iso) => addDays(iso, 7),
  Home: (iso, _, start) => startOfWeek(iso, start),
  End: (iso, _, start) => addDays(startOfWeek(iso, start), 6),
  PageUp: (iso, shift) => addMonths(iso, shift ? -12 : -1),
  PageDown: (iso, shift) => addMonths(iso, shift ? 12 : 1),
}

/**
 * Un mes para elegir una fecha (mode="single", v-model con texto ISO) o un periodo
 * (mode="range", v-model con { start, end }). Flechas: días y semanas. Re Pág / Av Pág:
 * meses (con Mayúsculas, años). Inicio y Fin: principio y final de la semana.
 * v-model:month controla el mes visible (YYYY-MM).
 */
export const Calendar = defineComponent({
  name: 'K5Calendar',
  props: {
    mode: { type: String as PropType<'single' | 'range'>, default: 'single' },
    modelValue: { type: [String, Object] as PropType<string | DateRangeValue>, default: undefined },
    defaultValue: { type: [String, Object] as PropType<string | DateRangeValue>, default: undefined },
    min: String,
    max: String,
    month: String,
    defaultMonth: String,
    today: String,
    weekStartsOn: { type: Number, default: 1 },
    locale: String,
    label: String,
    plain: Boolean,
  },
  emits: ['update:modelValue', 'update:month'],
  setup(props, { emit }) {
    const t = useGrado()
    const id = autoId('k5-calendar')
    const range = computed(() => props.mode === 'range')
    const today = computed(() => props.today ?? todayIso())
    const [current, setCurrent] = model<string | DateRangeValue>(
      () => props.modelValue,
      props.defaultValue ?? (props.mode === 'range' ? { start: '', end: '' } : ''),
      (value) => emit('update:modelValue', value),
    )
    const single = computed(() => (typeof current.value === 'string' ? current.value : ''))
    const span = computed<DateRangeValue>(() =>
      typeof current.value === 'object' && current.value ? current.value : { start: '', end: '' },
    )
    const anchor = (range.value ? span.value.start : single.value) || clampDate(today.value, props.min, props.max)
    const [visible, setVisible] = model(
      () => props.month,
      props.defaultMonth ?? anchor.slice(0, 7),
      (value) => emit('update:month', value),
    )
    const focusDate = ref<string | null>(null)
    const grid = ref<HTMLTableElement>()
    const locale = computed(() => props.locale ?? t.value.locale)

    const go = (target: string) => {
      const next = clampDate(target, props.min, props.max)
      focusDate.value = next
      if (!next.startsWith(visible.value)) setVisible(next.slice(0, 7))
      nextTick(() => grid.value?.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus())
    }
    const choose = (iso: string) => {
      focusDate.value = iso
      setCurrent(range.value ? nextRange(span.value, iso) : iso)
    }
    const onKeydown = (event: KeyboardEvent) => {
      const from = (event.target as HTMLElement).dataset.date
      const move = KEY_MOVES[event.key]
      if (!from || !move) return
      event.preventDefault()
      go(move(from, event.shiftKey, props.weekStartsOn))
    }
    const shiftMonth = (months: number) => {
      setVisible(addMonths(`${visible.value}-01`, months).slice(0, 7))
      focusDate.value = null
    }

    return () => {
      const m = t.value.messages
      const month = visible.value
      const inMonth = (iso: string | null | undefined) => Boolean(iso && iso.startsWith(month))
      const tabbable = [focusDate.value, range.value ? span.value.start : single.value, today.value, `${month}-01`].find(inMonth)
      const blocked = (iso: string) => Boolean((props.min && iso < props.min) || (props.max && iso > props.max))
      const { start, end } = span.value
      return h(
        'div',
        { class: cx('k5-calendar', props.plain && 'k5-calendar--plain'), role: 'group', 'aria-label': props.label ?? m.calendar },
        [
          h('div', { class: 'k5-calendar__header' }, [
            h(
              'button',
              {
                type: 'button',
                class: 'k5-btn k5-btn--ghost k5-btn--icon k5-btn--sm',
                'aria-label': m.previousMonth,
                disabled: Boolean(props.min && `${month}-01` <= props.min),
                onClick: () => shiftMonth(-1),
              },
              [pathIcon(ICON_PATHS.chevronLeft)],
            ),
            h('span', { class: 'k5-calendar__title', id: `${id}-title`, 'aria-live': 'polite' }, monthTitle(month, locale.value)),
            h(
              'button',
              {
                type: 'button',
                class: 'k5-btn k5-btn--ghost k5-btn--icon k5-btn--sm',
                'aria-label': m.nextMonth,
                disabled: Boolean(props.max && addMonths(`${month}-01`, 1) > props.max),
                onClick: () => shiftMonth(1),
              },
              [pathIcon(ICON_PATHS.chevronRight)],
            ),
          ]),
          h(
            'table',
            {
              ref: grid,
              class: 'k5-calendar__grid',
              role: 'grid',
              'aria-labelledby': `${id}-title`,
              'aria-multiselectable': range.value || undefined,
              onKeydown,
            },
            [
              h('thead', null, [
                h(
                  'tr',
                  null,
                  weekdayNames(locale.value, props.weekStartsOn).map((name) =>
                    h('th', { key: name.long, scope: 'col', abbr: name.long }, name.short),
                  ),
                ),
              ]),
              h(
                'tbody',
                null,
                monthWeeks(month, props.weekStartsOn).map((week) =>
                  h(
                    'tr',
                    { key: week[0].iso },
                    week.map((day) => {
                      if (day.outside)
                        return h('td', { key: day.iso }, [h('span', { class: 'k5-calendar__outside', 'aria-hidden': 'true' }, day.day)])
                      // En un periodo, todos sus días constan como seleccionados; los extremos van en sólido.
                      const endpoint = range.value ? day.iso === start || day.iso === end : day.iso === single.value
                      const between = Boolean(range.value && start && end && day.iso >= start && day.iso <= end)
                      return h(
                        'td',
                        {
                          key: day.iso,
                          'aria-selected': endpoint || between,
                          'data-endpoint': endpoint ? true : undefined,
                          'data-in-range': between ? true : undefined,
                          'data-range-start': between && day.iso === start ? true : undefined,
                          'data-range-end': between && day.iso === end ? true : undefined,
                        },
                        [
                          h(
                            'button',
                            {
                              type: 'button',
                              class: 'k5-calendar__day',
                              'data-date': day.iso,
                              tabindex: day.iso === tabbable ? 0 : -1,
                              'aria-label': dateLabel(day.iso, locale.value),
                              'aria-current': day.iso === today.value ? 'date' : undefined,
                              disabled: blocked(day.iso),
                              onClick: () => choose(day.iso),
                            },
                            day.day,
                          ),
                        ],
                      )
                    }),
                  ),
                ),
              ),
            ],
          ),
        ],
      )
    }
  },
})
