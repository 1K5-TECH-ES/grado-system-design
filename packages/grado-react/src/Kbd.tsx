import { Fragment, type HTMLAttributes } from 'react'
import { cx } from '@1k5-tech-es/grado/classes'

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** Teclas de un atajo: ['Ctrl', 'K'] → Ctrl + K. Sin keys, se usa el contenido. */
  keys?: string[]
}

/** Una tecla o un atajo de teclado. */
export function Kbd({ keys, className, children, ...rest }: KbdProps) {
  return (
    <kbd {...rest} className={cx('k5-kbd', className)}>
      {keys ? (
        keys.map((key, index) => (
          <Fragment key={`${key}-${index}`}>
            {index > 0 ? <span className="k5-kbd__sep">+</span> : null}
            <kbd className="k5-kbd__key">{key}</kbd>
          </Fragment>
        ))
      ) : (
        <kbd className="k5-kbd__key">{children}</kbd>
      )}
    </kbd>
  )
}
