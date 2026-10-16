import { inject, ref, watch } from 'vue'
import { caretAfter } from '@1k5-tech-es/grado/patterns'
import { MANAGED_KEY } from './Field.js'

/**
 * Validación de los campos con formato (TimePicker, PhoneInput, NifInput, IbanInput). Uso interno.
 * El mensaje se muestra después de salir del campo, o desde el principio si ya traía un valor.
 * notify recibe siempre el error real, se vea o no, para bloquear el envío.
 * Dentro de un FormField no se pinta: el error lo enseña el Field con el resto de la validación.
 */
export function useCheck(error: () => string, startTouched: boolean, notify: (message: string) => void) {
  const touched = ref(startTouched)
  const managed = inject(MANAGED_KEY, false)
  let last = ''
  watch(
    error,
    (now) => {
      if (now === last) return
      last = now
      notify(now)
    },
    { immediate: true },
  )
  return {
    message: () => (touched.value && !managed ? error() : ''),
    touch: () => {
      touched.value = true
    },
  }
}

/**
 * Escribe el texto reformateado en el campo y deja el cursor detrás de la misma letra o cifra.
 * Se hace en el propio evento: si el valor no cambia (un espacio de más), Vue no repinta el campo.
 */
export function rewrite(element: HTMLInputElement, text: string, count: number) {
  if (element.value !== text) element.value = text
  const position = count < 0 ? text.length : caretAfter(text, count)
  if (element.ownerDocument.activeElement === element) element.setSelectionRange(position, position)
}
