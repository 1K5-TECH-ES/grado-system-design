import { computed, shallowRef, useId } from 'vue'

/** v-model controlado o no: usa la prop si llega y, si no, su propio estado. */
export function model<T>(read: () => T | undefined, initial: T, change: (value: T) => void) {
  const inner = shallowRef(initial)
  return [
    computed(() => read() ?? inner.value),
    (next: T) => {
      if (read() === undefined) inner.value = next
      change(next)
    },
  ] as const
}

/**
 * id estable con prefijo k5-. Llámalo dentro de setup(). Vue 3.5.0 tipa useId() como
 * string | undefined (undefined solo fuera de setup); desde 3.5.1, string.
 */
export const autoId = (prefix: string) => `${prefix}-${(useId() ?? '').replace(/[^a-zA-Z0-9_-]/g, '')}`

/** Booleano que distingue «no pasado» (undefined) de false. */
export const booleanOptional = { type: Boolean, default: undefined }
