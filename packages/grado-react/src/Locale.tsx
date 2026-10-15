'use client'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { DEFAULT_LOCALE, messagesFor, type Messages } from '@1k5/grado/messages'

interface GradoContextValue {
  locale: string
  messages: Messages
  overrides?: Partial<Messages>
}

const GradoContext = createContext<GradoContextValue>({ locale: DEFAULT_LOCALE, messages: messagesFor(DEFAULT_LOCALE) })

export interface GradoProviderProps {
  /** Idioma de los textos y de los números y fechas: es-ES (por defecto), de-DE, en-GB… */
  locale?: string
  /** Cambia textos sueltos: { noResults: 'Sin coincidencias' }. */
  messages?: Partial<Messages>
  children?: ReactNode
}

/**
 * Idioma de todos los componentes que hay dentro. Sin proveedor, Grado habla español.
 * Las props de cada componente (closeLabel, emptyLabel…) siguen teniendo prioridad.
 */
export function GradoProvider({ locale, messages, children }: GradoProviderProps) {
  const parent = useContext(GradoContext)
  const value = useMemo(() => {
    const resolved = locale ?? parent.locale
    const overrides = locale ? messages : { ...parent.overrides, ...messages }
    return { locale: resolved, overrides, messages: messagesFor(resolved, overrides) }
  }, [locale, messages, parent])
  return <GradoContext.Provider value={value}>{children}</GradoContext.Provider>
}

/** Idioma y textos activos, por si haces un componente propio. */
export function useGrado() {
  return useContext(GradoContext)
}
