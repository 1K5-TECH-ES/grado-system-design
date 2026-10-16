// <k5-tabs label="Ficha" value="resumen">
//   <k5-tab value="resumen" label="Resumen">…</k5-tab>
//   <k5-tab value="documentos" label="Documentos">…</k5-tab>
// </k5-tabs>
// Pestañas con el mismo HTML que Tabs de React y Vue: flechas para moverse, Inicio y Fin, y la
// pestaña con el foco es la elegida. Avisa con un evento change; la elegida está en .value.
import { moveFocus } from '@1k5-tech-es/grado/patterns'
import { changed, define, el, setAttrs, uid } from './dom.js'

export class K5Tab extends HTMLElement {}

export class K5Tabs extends HTMLElement {
  static observedAttributes = ['value', 'label']

  connectedCallback() {
    if (this.root) return
    const id = uid('k5-tabs')
    this.items = [...this.querySelectorAll(':scope > k5-tab')].map((tab, index) => ({
      value: tab.getAttribute('value') ?? String(index),
      label: tab.getAttribute('label') ?? '',
      disabled: tab.hasAttribute('disabled'),
      tabId: `${id}-tab-${index}`,
      panelId: `${id}-panel-${index}`,
      content: [...tab.childNodes],
    }))
    this.list = el('div', { class: 'k5-tabs__list', role: 'tablist' })
    this.list.addEventListener('keydown', (event) => moveFocus(event, this.list, '[role="tab"]', true))
    this.buttons = this.items.map((item) => {
      const button = el(
        'button',
        { type: 'button', id: item.tabId, role: 'tab', class: 'k5-tabs__tab', 'aria-controls': item.panelId, disabled: item.disabled },
        item.label,
      )
      button.addEventListener('click', () => this.select(item.value))
      button.addEventListener('focus', () => this.select(item.value))
      return button
    })
    this.list.append(...this.buttons)
    this.panels = this.items.map((item) =>
      el(
        'div',
        { role: 'tabpanel', class: 'k5-tabs__panel', id: item.panelId, 'aria-labelledby': item.tabId, tabindex: '0' },
        item.content,
      ),
    )
    this.root = el('div', { class: 'k5-tabs' }, [this.list, ...this.panels])
    this.replaceChildren(this.root)
    this.render()
  }

  attributeChangedCallback() {
    if (this.root) this.render()
  }

  get value() {
    const wanted = this.getAttribute('value')
    const usable = this.items?.filter((item) => !item.disabled) ?? []
    return usable.some((item) => item.value === wanted) ? wanted : (usable[0]?.value ?? '')
  }
  set value(next) {
    this.setAttribute('value', next)
  }

  select(value) {
    if (value === this.value) return
    this.value = value
    changed(this)
  }

  render() {
    setAttrs(this.list, { 'aria-label': this.getAttribute('label') })
    const current = this.value
    this.items.forEach((item, index) => {
      const selected = item.value === current
      setAttrs(this.buttons[index], { tabindex: selected ? '0' : '-1', 'aria-selected': String(selected) })
      this.panels[index].hidden = !selected
    })
  }
}

define('k5-tab', K5Tab)
define('k5-tabs', K5Tabs)
