'use client'
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { caretAfter } from '@1k5-tech-es/grado/patterns'
import { ManagedFieldContext } from './Field.js'

/**
 * Validación de los campos con formato (TimePicker, PhoneInput, NifInput, IbanInput). Uso interno.
 * El mensaje se muestra después de salir del campo, o desde el principio si ya traía un valor.
 * onErrorChange recibe siempre el error real, se vea o no, para bloquear el envío.
 * Dentro de un FormField no se pinta: el error lo enseña el Field con el resto de la validación.
 */
export function useCheck(error: string, startTouched: boolean, onErrorChange?: (message: string) => void) {
  const [touched, setTouched] = useState(startTouched)
  const managed = useContext(ManagedFieldContext)
  const last = useRef('')
  const notify = useRef(onErrorChange)
  useEffect(() => {
    notify.current = onErrorChange
  })
  useEffect(() => {
    if (last.current === error) return
    last.current = error
    notify.current?.(error)
  }, [error])
  return { message: touched && !managed ? error : '', touch: () => setTouched(true) }
}

/**
 * Mantiene el cursor en su sitio cuando el texto se reformatea al escribir («612 345 678»):
 * place(texto nuevo, letras y cifras antes del cursor) lo deja detrás de la misma cifra.
 */
export function useCaret<T extends HTMLInputElement>() {
  const input = useRef<T>(null)
  const pending = useRef<number | null>(null)
  useLayoutEffect(() => {
    const element = input.current
    if (pending.current === null || !element) return
    const position = pending.current
    pending.current = null
    if (element.ownerDocument.activeElement === element) element.setSelectionRange(position, position)
  })
  return {
    input,
    place: (text: string, count: number) => {
      pending.current = caretAfter(text, count)
    },
  }
}
