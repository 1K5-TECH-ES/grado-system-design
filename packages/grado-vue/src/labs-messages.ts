import { labsMessagesFor, type LabsMessages } from '@1k5-tech-es/grado/labs'
import type { GradoContext } from './Locale.js'

/** Textos de labs en el idioma de GradoProvider o del plugin, con sus cambios. Uso interno. */
export const labsMessages = (context: GradoContext): LabsMessages => labsMessagesFor(context.locale, context.overrides)
