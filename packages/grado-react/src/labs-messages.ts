import { labsMessagesFor } from '@1k5-tech-es/grado/labs'
import { useGrado } from './Locale.js'

/** Textos de labs en el idioma de GradoProvider, con sus cambios. Uso interno. */
export function useLabsMessages() {
  const { locale, overrides } = useGrado()
  return labsMessagesFor(locale, overrides)
}
