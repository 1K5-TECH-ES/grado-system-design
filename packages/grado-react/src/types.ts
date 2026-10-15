import type { ComponentType } from 'react'

/** Cualquier icono de Lucide (lucide-react) u otro componente SVG. */
export type IconComponent = ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
