import { ref, watch } from 'vue'
import { caretAfter } from '@1k5-tech-es/grado/patterns'

/**
 * Validación de los campos con formato (TimePicker, PhoneInput, NifInput, IbanInput). Uso interno.
 * El mensaje se muestra después de salir del campo, o desde el principio si ya traía un valor.
 * notify recibe siempre el error real, se vea o no, para bloquear el envío.
 */
export function useCheck(error: () => string, startTouched: boolean, notify: (message: string) => void) {
  const touched = ref(startTouched)
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
    message: () => (touched.value ? error() : ''),
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
