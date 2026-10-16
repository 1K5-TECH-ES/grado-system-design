import { computed, defineComponent, h, nextTick, ref, type PropType } from 'vue'
import { cx, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { todayIso, type DateRangeValue } from '@1k5-tech-es/grado/patterns'
import { calendarAnchor, calendarChoose, calendarMove, calendarShift, calendarView } from '@1k5-tech-es/grado/core'
import { pathIcon } from './PathIcon.js'
import { useGrado } from './Locale.js'
import { autoId, model } from './helpers.js'

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
    const [visible, setVisible] = model(
      () => props.month,
      props.defaultMonth ?? calendarAnchor(current.value, { mode: props.mode, today: today.value, min: props.min, max: props.max }),
      (value) => emit('update:month', value),
    )
    const focusDate = ref<string | null>(null)
    const grid = ref<HTMLTableElement>()
    const locale = computed(() => props.locale ?? t.value.locale)

    // Rejilla, teclado y periodo salen del núcleo común (@1k5-tech-es/grado/core), como en React.
    const choose = (iso: string) => {
      focusDate.value = iso
      setCurrent(calendarChoose(current.value, iso, props.mode))
    }
    const onKeydown = (event: KeyboardEvent) => {
      const next = calendarMove(event.key, (event.target as HTMLElement).dataset.date, {
        shift: event.shiftKey,
        weekStartsOn: props.weekStartsOn,
        min: props.min,
        max: props.max,
      })
      if (!next) return
      event.preventDefault()
      focusDate.value = next
      if (!next.startsWith(visible.value)) setVisible(next.slice(0, 7))
      nextTick(() => grid.value?.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus())
    }
    const shiftMonth = (months: number) => {
      setVisible(calendarShift(visible.value, months))
      focusDate.value = null
    }

    return () => {
      const m = t.value.messages
      const view = calendarView({
        visible: visible.value,
        value: current.value,
        mode: props.mode,
        today: today.value,
        min: props.min,
        max: props.max,
        focusDate: focusDate.value,
        weekStartsOn: props.weekStartsOn,
        locale: locale.value,
      })
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
                disabled: view.prevBlocked,
                onClick: () => shiftMonth(-1),
              },
              [pathIcon(ICON_PATHS.chevronLeft)],
            ),
            h('span', { class: 'k5-calendar__title', id: `${id}-title`, 'aria-live': 'polite' }, view.title),
            h(
              'button',
              {
                type: 'button',
                class: 'k5-btn k5-btn--ghost k5-btn--icon k5-btn--sm',
                'aria-label': m.nextMonth,
                disabled: view.nextBlocked,
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
                  view.names.map((name) => h('th', { key: name.long, scope: 'col', abbr: name.long }, name.short)),
                ),
              ]),
              h(
                'tbody',
                null,
                view.weeks.map((week) =>
                  h(
                    'tr',
                    { key: week[0].iso },
                    week.map((day) =>
                      day.outside
                        ? h('td', { key: day.iso }, [h('span', { class: 'k5-calendar__outside', 'aria-hidden': 'true' }, day.day)])
                        : // En un periodo, todos sus días constan como seleccionados; los extremos van en sólido.
                          h(
                            'td',
                            {
                              key: day.iso,
                              'aria-selected': day.selected,
                              'data-endpoint': day.endpoint ? true : undefined,
                              'data-in-range': day.between ? true : undefined,
                              'data-range-start': day.rangeStart ? true : undefined,
                              'data-range-end': day.rangeEnd ? true : undefined,
                            },
                            [
                              h(
                                'button',
                                {
                                  type: 'button',
                                  class: 'k5-calendar__day',
                                  'data-date': day.iso,
                                  tabindex: day.tabbable ? 0 : -1,
                                  'aria-label': day.label,
                                  'aria-current': day.today ? 'date' : undefined,
                                  disabled: day.disabled,
                                  onClick: () => choose(day.iso),
                                },
                                day.day,
                              ),
                            ],
                          ),
                    ),
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
