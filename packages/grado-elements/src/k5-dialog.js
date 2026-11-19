// <k5-dialog id="nota" label="Nueva nota">
//   <p>Contenido</p>
//   <div slot="footer"><button>Guardar</button></div>
// </k5-dialog>
// <button data-k5-open="nota">Abrir</button>
// Diálogo modal con el mismo HTML que Dialog de React y Vue, sobre <dialog>: foco atrapado,
// Escape y clic fuera cierran, y el foco vuelve a quien lo abrió. Se abre con .show(), con el
// atributo open o con cualquier botón data-k5-open="id". Avisa con un evento close.
import { ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { backdropGesture } from '@1k5-tech-es/grado/patterns'
import { define, el, icon, setAttrs, texts, uid } from './dom.js'

export class K5Dialog extends HTMLElement {
  static observedAttributes = ['open', 'label', 'description']

  connectedCallback() {
    if (this.dialog) return
    const m = texts(this)
    const id = uid('k5-dialog')
    const footer = [...this.children].filter((child) => child.getAttribute('slot') === 'footer')
    footer.forEach((node) => node.removeAttribute('slot'))
    const body = [...this.childNodes].filter((node) => !footer.includes(node))
    this.titleNode = el('h2', { class: 'k5-dialog__title', id: `${id}-title` })
    this.descriptionNode = el('p', { class: 'k5-dialog__description', id: `${id}-description` })
    this.heading = el('div', { class: 'k5-dialog__heading' }, [this.titleNode])
    const close = el('button', { type: 'button', class: 'k5-close', 'aria-label': this.getAttribute('close-label') ?? m.close }, [
      icon(ICON_PATHS.x),
    ])
    close.addEventListener('click', () => this.close())
    this.dialog = el('dialog', { 'aria-modal': 'true', 'aria-labelledby': `${id}-title`, class: 'k5-dialog' }, [
      el('div', { class: 'k5-dialog__header' }, [this.heading, close]),
      el('div', { class: 'k5-dialog__body' }, body),
      footer.length ? el('div', { class: 'k5-dialog__footer' }, footer) : null,
    ])
    // Escape: el navegador lo cierra; aquí se ordena igual que un cierre normal.
    this.dialog.addEventListener('cancel', (event) => {
      event.preventDefault()
      this.close()
    })
    // Clic fuera: el clic llega al propio <dialog> cuando cae en el fondo. Solo cuenta si también
    // empezó ahí: arrastrar desde un campo hasta el fondo no lo cierra.
    const backdrop = backdropGesture()
    this.dialog.addEventListener('pointerdown', (event) => backdrop.down(event))
    this.dialog.addEventListener('click', (event) => {
      if (backdrop.click(event) && !this.hasAttribute('keep-open')) this.close()
    })
    this.replaceChildren(this.dialog)
    this.render()
  }

  attributeChangedCallback() {
    if (this.dialog) this.render()
  }

  get open() {
    return this.hasAttribute('open')
  }
  set open(value) {
    this.toggleAttribute('open', Boolean(value))
  }
  show() {
    this.open = true
  }
  close() {
    this.open = false
  }

  render() {
    this.titleNode.textContent = this.getAttribute('label') ?? ''
    const description = this.getAttribute('description')
    if (description) {
      this.descriptionNode.textContent = description
      this.heading.append(this.descriptionNode)
      setAttrs(this.dialog, { 'aria-describedby': this.descriptionNode.id })
    } else {
      this.descriptionNode.remove()
      setAttrs(this.dialog, { 'aria-describedby': null })
    }
    if (this.open && !this.dialog.open) {
      this.opener = document.activeElement
      this.dialog.showModal()
      // El foco va al primer campo o botón del contenido; si no hay, al de cerrar.
      const first = this.dialog.querySelector('.k5-dialog__body :is(input, select, textarea, button, [href], [tabindex]):not([disabled])')
      ;(first ?? this.dialog.querySelector('.k5-close'))?.focus()
    } else if (!this.open && this.dialog.open) {
      this.dialog.close()
      if (this.opener?.isConnected) this.opener.focus()
      this.dispatchEvent(new Event('close', { bubbles: true }))
    }
  }
}

define('k5-dialog', K5Dialog)

// Cualquier botón data-k5-open="id" abre el diálogo con ese id, sin escribir JavaScript.
if (typeof document !== 'undefined' && !document.k5DialogOpeners) {
  document.k5DialogOpeners = true
  document.addEventListener('click', (event) => {
    const opener = event.target instanceof Element ? event.target.closest('[data-k5-open]') : null
    const dialog = opener && document.getElementById(opener.getAttribute('data-k5-open'))
    if (dialog instanceof K5Dialog) dialog.show()
  })
}
