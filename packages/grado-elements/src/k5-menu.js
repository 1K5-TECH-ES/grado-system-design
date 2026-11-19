// <k5-menu label="Acciones">
//   <option value="editar">Editar</option>
//   <option value="duplicar" data-shortcut="⌘ D">Duplicar</option>
//   <option value="borrar" data-danger data-separator>Eliminar</option>
// </k5-menu>
// Menú de acciones con el mismo HTML y teclado que DropdownMenu de React y Vue. Al elegir,
// avisa con un evento k5-select que lleva el valor en detail.value.
import { buttonClass, cx, ICON_PATHS, keyShortcuts } from '@1k5-tech-es/grado/classes'
import { moveFocus } from '@1k5-tech-es/grado/patterns'
import { define, el, icon, setAttrs, uid } from './dom.js'

export class K5Menu extends HTMLElement {
  static observedAttributes = ['label', 'disabled', 'align']

  connectedCallback() {
    if (this.root) return
    this.items = [...this.querySelectorAll('option')].map((option) => ({
      id: option.value,
      label: option.textContent.trim(),
      disabled: option.disabled,
      danger: option.hasAttribute('data-danger'),
      separator: option.hasAttribute('data-separator'),
      shortcut: option.dataset.shortcut ? option.dataset.shortcut.split(/\s+/).filter(Boolean) : undefined,
    }))
    this.menuId = uid('k5-menu')
    this.isOpen = false
    this.labelNode = document.createTextNode('')
    this.trigger = el('button', { 'aria-haspopup': 'menu', type: 'button', class: buttonClass({ variant: 'secondary' }) }, [
      this.labelNode,
      icon(ICON_PATHS.chevronDown, 'k5-menu__chevron'),
    ])
    this.trigger.addEventListener('click', () => this.toggle(!this.isOpen, 'first'))
    this.trigger.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
      event.preventDefault()
      this.toggle(true, event.key === 'ArrowUp' ? 'last' : 'first')
    })
    this.root = el('div', { class: 'k5-menu' }, [this.trigger])
    this.root.addEventListener('focusout', (event) => {
      if (!this.root.contains(event.relatedTarget)) this.toggle(false)
    })
    this.outside = (event) => {
      if (!this.root.contains(event.target)) this.toggle(false)
    }
    this.replaceChildren(this.root)
    this.render()
  }

  disconnectedCallback() {
    document.removeEventListener('pointerdown', this.outside)
  }

  attributeChangedCallback() {
    if (this.root) this.render()
  }

  toggle(open, first = 'first') {
    if (open === this.isOpen) return
    this.isOpen = open
    this.render()
    if (open) {
      document.addEventListener('pointerdown', this.outside)
      const buttons = this.content.querySelectorAll('button:not(:disabled)')
      buttons[first === 'last' ? buttons.length - 1 : 0]?.focus()
    } else document.removeEventListener('pointerdown', this.outside)
  }

  render() {
    const label = this.getAttribute('label') ?? ''
    this.labelNode.data = label
    setAttrs(this.trigger, {
      disabled: this.hasAttribute('disabled'),
      'aria-expanded': String(this.isOpen),
      'aria-controls': this.isOpen ? this.menuId : null,
    })
    this.content?.remove()
    this.content = null
    if (!this.isOpen) return
    this.content = el(
      'div',
      {
        class: cx('k5-menu__content', this.getAttribute('align') === 'start' && 'k5-menu__content--start'),
        role: 'menu',
        'aria-label': label,
        id: this.menuId,
      },
      this.items.map((item) => {
        const button = el(
          'button',
          {
            type: 'button',
            role: 'menuitem',
            tabindex: '-1',
            disabled: item.disabled,
            class: cx('k5-menu__item', item.danger && 'k5-menu__item--danger'),
            'aria-keyshortcuts': item.shortcut?.length ? keyShortcuts(item.shortcut) : undefined,
          },
          item.shortcut?.length
            ? [
                item.label,
                el(
                  'span',
                  { class: 'k5-menu__shortcut', 'aria-hidden': 'true' },
                  item.shortcut.map((key) => el('kbd', {}, key)),
                ),
              ]
            : item.label,
        )
        button.addEventListener('pointermove', () => {
          if (!item.disabled) button.focus()
        })
        button.addEventListener('click', () => {
          this.toggle(false)
          this.trigger.focus()
          this.dispatchEvent(new CustomEvent('k5-select', { detail: { value: item.id }, bubbles: true }))
        })
        return el('div', { role: 'none' }, [item.separator ? el('div', { role: 'separator', class: 'k5-menu__separator' }) : null, button])
      }),
    )
    this.content.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        this.toggle(false)
        this.trigger.focus()
      } else moveFocus(event, this.content, '[role="menuitem"]')
    })
    this.root.append(this.content)
  }
}

define('k5-menu', K5Menu)
