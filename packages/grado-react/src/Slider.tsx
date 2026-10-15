'use client'
import { forwardRef, type CSSProperties, type InputHTMLAttributes } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'
import { clampNumber, decimalsOf, formatNumber, type SliderMark } from '@1k5-tech-es/grado/patterns'
import { useControl, useField } from './Field.js'
import { useGrado } from './Locale.js'
import { useAutoId, useValue } from './hooks.js'

export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'min' | 'max' | 'step'
> {
  value?: number
  /** Por defecto, el mínimo. */
  defaultValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Unidad tras el valor: kWp, kWh, %. */
  unit?: string
  /** Muestra el valor elegido a la derecha. */
  showValue?: boolean
  /** Texto del valor (visible y para lectores de pantalla). Por defecto, el número en el idioma activo y la unidad. */
  formatValue?: (value: number) => string
  /** Marcas bajo la pista: [{ value: 2, label: '2 kWp' }]. */
  marks?: SliderMark[]
  /** Nombre accesible si no hay Field con etiqueta. */
  label?: string
  invalid?: boolean
  /** Formato de los números. Por defecto, el de GradoProvider (es-ES). */
  locale?: string
}

/** Fracción de la pista (0 a 1), con cuatro decimales para que React y Vue escriban lo mismo. */
const fractionOf = (value: number, min: number, max: number) => (max > min ? Math.round(((value - min) / (max - min)) * 10000) / 10000 : 0)

/**
 * Un valor dentro de un rango, con el input range nativo: flechas, Re Pág, Av Pág, Inicio y Fin
 * funcionan sin código. El tramo relleno sale de la variable --_fill.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    value,
    defaultValue,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    unit,
    showValue = false,
    formatValue,
    marks,
    label,
    invalid,
    locale: localeProp,
    id,
    required,
    className,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const { locale: contextLocale } = useGrado()
  const locale = localeProp ?? contextLocale
  const field = useField()
  const inputId = useAutoId('k5-slider', id ?? field?.id)
  const control = useControl({ id: inputId, required, invalid, 'aria-describedby': describedBy })
  const [current, setCurrent] = useValue(value, defaultValue ?? min, onValueChange)
  const shown = clampNumber(current, min, max)
  const text = (n: number) => (formatValue ? formatValue(n) : `${formatNumber(n, locale, decimalsOf(step))}${unit ? ` ${unit}` : ''}`)
  return (
    <div
      className={cx('k5-slider', marks?.length && 'k5-slider--marks', className)}
      style={{ '--_fill': String(fractionOf(shown, min, max)) } as CSSProperties}
    >
      <div className="k5-slider__track">
        <input
          {...rest}
          {...control}
          ref={ref}
          type="range"
          className="k5-slider__input"
          min={min}
          max={max}
          step={step}
          value={shown}
          aria-label={label}
          aria-valuetext={text(shown)}
          onChange={(event) => setCurrent(Number(event.target.value))}
        />
        {marks?.length ? (
          <div className="k5-slider__marks" aria-hidden="true">
            {marks.map((mark) => (
              <span
                key={mark.value}
                className="k5-slider__mark"
                style={{ '--_at': String(fractionOf(clampNumber(mark.value, min, max), min, max)) } as CSSProperties}
              >
                {mark.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {showValue ? (
        <output className="k5-slider__value" htmlFor={inputId} aria-hidden="true">
          {text(shown)}
        </output>
      ) : null}
    </div>
  )
})
