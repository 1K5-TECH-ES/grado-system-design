import { useId, useState } from 'react'

/** Estado controlado o no controlado: usa `value` si llega y, si no, su propio estado. */
export function useValue<T>(value: T | undefined, initial: T, change?: (value: T) => void) {
  const [inner, setInner] = useState(initial)
  return [
    value ?? inner,
    (next: T) => {
      if (value === undefined) setInner(next)
      change?.(next)
    },
  ] as const
}

/** id estable con prefijo k5-: el pasado o uno generado. */
export function useAutoId(prefix: string, id?: string) {
  const auto = useId()
  return id ?? `${prefix}-${auto.replace(/[^a-zA-Z0-9_-]/g, '')}`
}

export const present = (node: unknown) => node != null && node !== false && node !== ''
