import { defineComponent, h, ref, type PropType } from 'vue'
import { cx } from '@1k5-tech-es/grado/classes'
import {
  isSignatureEmpty,
  SIGNATURE_SIZE,
  signatureDataUrl,
  signaturePath,
  signaturePoint,
  type SignaturePoint,
  type SignatureValue,
} from '@1k5-tech-es/grado/labs'
import { formatMessage } from '@1k5-tech-es/grado/messages'
import { Button } from './Button.js'
import { Input } from './Field.js'
import { autoId } from './helpers.js'
import { useGrado } from './Locale.js'
import { labsMessages } from './labs-messages.js'

/**
 * Firma con el dedo, un lápiz o el ratón. Quien no puede dibujar (o usa el teclado) escribe su
 * nombre. La firma es { strokes } o { typed } (v-model); signatureSvg() y signatureDataUrl() la exportan.
 */
export const SignaturePad = defineComponent({
  name: 'K5SignaturePad',
  props: {
    /** «Firma del titular». */
    label: { type: String, required: true },
    modelValue: { type: Object as PropType<SignatureValue | null>, default: undefined },
    defaultValue: { type: Object as PropType<SignatureValue | null>, default: null },
    hint: String,
    error: String,
    required: Boolean,
    disabled: Boolean,
    /** Envía la firma con el formulario: un campo oculto con su SVG como data URL. */
    name: String,
    id: String,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const t = useGrado()
    const auto = autoId('k5-signature')
    const inner = ref<SignatureValue | null>(props.defaultValue)
    const drawing = ref<SignaturePoint[] | null>(null)
    const current = () => (props.modelValue === undefined ? inner.value : props.modelValue)
    const change = (next: SignatureValue | null) => {
      const clean = next && isSignatureEmpty(next) && !('typed' in next) ? null : next
      if (props.modelValue === undefined) inner.value = clean
      emit('update:modelValue', clean)
    }
    return () => {
      const m = labsMessages(t.value)
      const base = props.id ?? auto
      const value = current()
      const typed = value != null && 'typed' in value ? value.typed : null
      const strokes = value && 'strokes' in value ? value.strokes : []
      const empty = isSignatureEmpty(value)
      const describedBy = [`${base}-hint`, props.error ? `${base}-error` : null].filter(Boolean).join(' ')
      const accessibleName = empty
        ? m.signatureEmpty
        : typed != null
          ? formatMessage(m.signatureTyped, { name: typed.trim() })
          : m.signatureDrawn
      const rectOf = (event: PointerEvent) => (event.currentTarget as SVGSVGElement).getBoundingClientRect()
      const pad =
        typed != null
          ? h('div', { class: 'k5-signature__typed' }, [
              h(Input, {
                id: `${base}-typed`,
                'aria-labelledby': `${base}-label ${base}-typed-label`,
                'aria-describedby': describedBy,
                'aria-invalid': props.error ? true : undefined,
                'aria-required': props.required || undefined,
                autocomplete: 'name',
                disabled: props.disabled,
                modelValue: typed,
                'onUpdate:modelValue': (text: string) => change({ typed: text }),
              }),
              h('span', { class: 'k5-sr-only', id: `${base}-typed-label` }, m.signatureTypedLabel),
              h('span', { class: 'k5-signature__preview', 'aria-hidden': 'true' }, typed),
            ])
          : h('div', { class: cx('k5-signature__pad', props.error && 'k5-signature__pad--invalid'), 'data-empty': empty || undefined }, [
              h(
                'svg',
                {
                  class: 'k5-signature__canvas',
                  viewBox: `0 0 ${SIGNATURE_SIZE.width} ${SIGNATURE_SIZE.height}`,
                  role: 'img',
                  'aria-labelledby': `${base}-label ${base}-state`,
                  'aria-describedby': describedBy,
                  onPointerdown: (event: PointerEvent) => {
                    if (props.disabled || (event.pointerType === 'mouse' && event.button !== 0)) return
                    ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
                    drawing.value = [signaturePoint(rectOf(event), event.clientX, event.clientY, SIGNATURE_SIZE)]
                  },
                  onPointermove: (event: PointerEvent) => {
                    if (!drawing.value) return
                    const rect = rectOf(event)
                    const events = event.getCoalescedEvents?.() ?? [event]
                    drawing.value = [...drawing.value, ...events.map((e) => signaturePoint(rect, e.clientX, e.clientY, SIGNATURE_SIZE))]
                  },
                  onPointerup: () => {
                    if (!drawing.value) return
                    const done = drawing.value
                    drawing.value = null
                    change({ strokes: [...strokes, done] })
                  },
                  onPointercancel: () => (drawing.value = null),
                },
                [
                  h('line', { class: 'k5-signature__baseline', x1: '24', x2: String(SIGNATURE_SIZE.width - 24), y1: '150', y2: '150' }),
                  h(
                    'g',
                    { class: 'k5-signature__strokes' },
                    [...strokes, ...(drawing.value ? [drawing.value] : [])].map((points, i) =>
                      h('path', { key: i, d: signaturePath(points) }),
                    ),
                  ),
                ],
              ),
              h('span', { class: 'k5-sr-only', id: `${base}-state` }, accessibleName),
            ])
      return h('div', { class: cx('k5-field', 'k5-signature', props.disabled && 'k5-signature--disabled') }, [
        h('span', { class: 'k5-field__label', id: `${base}-label` }, [
          props.label,
          props.required ? h('span', { class: 'k5-field__required', 'aria-hidden': 'true' }, '*') : null,
        ]),
        pad,
        h('p', { class: 'k5-field__hint', id: `${base}-hint` }, props.hint ?? m.signatureHint),
        props.error ? h('p', { class: 'k5-field__error', id: `${base}-error` }, props.error) : null,
        h('div', { class: 'k5-signature__actions' }, [
          h(
            Button,
            {
              variant: 'ghost',
              size: 'sm',
              disabled: props.disabled || empty,
              onClick: () => change(typed != null ? { typed: '' } : null),
            },
            () => m.signatureClear,
          ),
          h(
            Button,
            { variant: 'ghost', size: 'sm', disabled: props.disabled, onClick: () => change(typed != null ? null : { typed: '' }) },
            () => (typed != null ? m.signatureDrawInstead : m.signatureTypeInstead),
          ),
        ]),
        props.name ? h('input', { type: 'hidden', name: props.name, value: empty ? '' : signatureDataUrl(value) }) : null,
      ])
    }
  },
})
