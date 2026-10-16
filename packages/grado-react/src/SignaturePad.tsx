'use client'
import { forwardRef, useRef, useState, type PointerEvent } from 'react'
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
import { useAutoId } from './hooks.js'
import { useLabsMessages } from './labs-messages.js'

export interface SignaturePadProps {
  /** «Firma del titular». */
  label: string
  value?: SignatureValue | null
  defaultValue?: SignatureValue | null
  /** Con cada trazo terminado, al borrar o al escribir el nombre. null: sin firma. */
  onChange?: (value: SignatureValue | null) => void
  hint?: string
  error?: string
  required?: boolean
  disabled?: boolean
  /** Envía la firma con el formulario: un campo oculto con su SVG como data URL. */
  name?: string
  id?: string
  className?: string
}

/**
 * Firma con el dedo, un lápiz o el ratón. Quien no puede dibujar (o usa el teclado) escribe su
 * nombre. La firma es { strokes } o { typed }; signatureSvg() y signatureDataUrl() la exportan.
 */
export const SignaturePad = forwardRef<HTMLDivElement, SignaturePadProps>(function SignaturePad(
  { label, value, defaultValue = null, onChange, hint, error, required, disabled, name, id, className },
  ref,
) {
  const m = useLabsMessages()
  const base = useAutoId('k5-signature', id)
  const [inner, setInner] = useState<SignatureValue | null>(defaultValue)
  const current = value === undefined ? inner : value
  const typedMode = current != null && 'typed' in current
  const [drawing, setDrawing] = useState<SignaturePoint[] | null>(null)
  const stroke = useRef<SignaturePoint[] | null>(null)
  const change = (next: SignatureValue | null) => {
    const clean = next && isSignatureEmpty(next) && !('typed' in next) ? null : next
    if (value === undefined) setInner(clean)
    onChange?.(clean)
  }
  const strokes = current && 'strokes' in current ? current.strokes : []
  const point = (event: PointerEvent<SVGSVGElement>) =>
    signaturePoint(event.currentTarget.getBoundingClientRect(), event.clientX, event.clientY, SIGNATURE_SIZE)
  const describedBy = [`${base}-hint`, error ? `${base}-error` : null].filter(Boolean).join(' ')
  const empty = isSignatureEmpty(current)
  const accessibleName = empty
    ? m.signatureEmpty
    : current && 'typed' in current
      ? formatMessage(m.signatureTyped, { name: current.typed.trim() })
      : m.signatureDrawn
  return (
    <div ref={ref} className={cx('k5-field', 'k5-signature', disabled && 'k5-signature--disabled', className)}>
      <span className="k5-field__label" id={`${base}-label`}>
        {label}
        {required ? (
          <span className="k5-field__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      {typedMode ? (
        <div className="k5-signature__typed">
          <Input
            id={`${base}-typed`}
            aria-labelledby={`${base}-label ${base}-typed-label`}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            aria-required={required || undefined}
            autoComplete="name"
            disabled={disabled}
            value={current.typed}
            onChange={(event) => change({ typed: event.target.value })}
          />
          <span className="k5-sr-only" id={`${base}-typed-label`}>
            {m.signatureTypedLabel}
          </span>
          <span className="k5-signature__preview" aria-hidden="true">
            {current.typed}
          </span>
        </div>
      ) : (
        <div className={cx('k5-signature__pad', error && 'k5-signature__pad--invalid')} data-empty={empty || undefined}>
          <svg
            className="k5-signature__canvas"
            viewBox={`0 0 ${SIGNATURE_SIZE.width} ${SIGNATURE_SIZE.height}`}
            role="img"
            aria-labelledby={`${base}-label ${base}-state`}
            aria-describedby={describedBy}
            onPointerDown={(event) => {
              if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) return
              event.currentTarget.setPointerCapture(event.pointerId)
              stroke.current = [point(event)]
              setDrawing(stroke.current)
            }}
            onPointerMove={(event) => {
              if (!stroke.current) return
              const events = event.nativeEvent.getCoalescedEvents?.() ?? [event.nativeEvent]
              const rect = event.currentTarget.getBoundingClientRect()
              stroke.current = [...stroke.current, ...events.map((e) => signaturePoint(rect, e.clientX, e.clientY, SIGNATURE_SIZE))]
              setDrawing(stroke.current)
            }}
            onPointerUp={() => {
              if (!stroke.current) return
              const done = stroke.current
              stroke.current = null
              setDrawing(null)
              change({ strokes: [...strokes, done] })
            }}
            onPointerCancel={() => {
              stroke.current = null
              setDrawing(null)
            }}
          >
            <line className="k5-signature__baseline" x1="24" x2={SIGNATURE_SIZE.width - 24} y1="150" y2="150" />
            <g className="k5-signature__strokes">
              {[...strokes, ...(drawing ? [drawing] : [])].map((points, i) => (
                <path key={i} d={signaturePath(points)} />
              ))}
            </g>
          </svg>
          <span className="k5-sr-only" id={`${base}-state`}>
            {accessibleName}
          </span>
        </div>
      )}
      <p className="k5-field__hint" id={`${base}-hint`}>
        {hint ?? m.signatureHint}
      </p>
      {error ? (
        <p className="k5-field__error" id={`${base}-error`}>
          {error}
        </p>
      ) : null}
      <div className="k5-signature__actions">
        <Button variant="ghost" size="sm" disabled={disabled || empty} onClick={() => change(typedMode ? { typed: '' } : null)}>
          {m.signatureClear}
        </Button>
        <Button variant="ghost" size="sm" disabled={disabled} onClick={() => change(typedMode ? null : { typed: '' })}>
          {typedMode ? m.signatureDrawInstead : m.signatureTypeInstead}
        </Button>
      </div>
      {name ? <input type="hidden" name={name} value={empty ? '' : signatureDataUrl(current)} /> : null}
    </div>
  )
})
