// <k5-combobox label="Provincia" name="provincia" value="md">
//   <option value="md">Madrid</option>
//   <option value="bcn" disabled>Barcelona</option>
// </k5-combobox>
// Lista con búsqueda. Mismo HTML, teclado y textos que Combobox de React y Vue: el estado y las
// teclas salen del núcleo común (@1k5-tech-es/grado/core). Con name, el valor viaja con el
// formulario en un campo oculto. Avisa con un evento change; el valor está en .value.
import { controlClass, ICON_PATHS } from '@1k5-tech-es/grado/classes'
import { comboboxReduce, comboboxState, comboboxView } from '@1k5-tech-es/grado/core'
import { filterOptions } from '@1k5-tech-es/grado/patterns'
import { changed, define, el, icon, setAttrs, texts, uid } from './dom.js'

export class K5Combobox extends HTMLElement {
  static observedAttributes = ['value', 'label', 'placeholder', 'disabled', 'required', 'loading', 'name', 'empty-label']

  connectedCallback() {
    if (this.root) return
    // Las <option> de dentro son las opciones; luego el elemento pinta su propio HTML.
    this.options = [...this.querySelectorAll('option')].map((option) => ({
      value: option.value,
      label: option.textContent.trim(),
      disabled: option.disabled,
    }))
    this.replaceChildren()
    this.state = comboboxState()
    this.controlId = this.getAttribute('control-id') || uid('k5-combobox')
    this.root = el('div', { class: 'k5-combobox' })
    this.field = el('input', { type: 'hidden' })
    this.input = el('input', { role: 'combobox', 'aria-autocomplete': 'list', autocomplete: 'off', id: this.controlId })
    this.input.className = controlClass('input')
    this.input.addEventListener('focus', () => this.send({ type: 'focus' }))
    this.input.addEventListener('click', () => this.send({ type: 'click' }))
    this.input.addEventListener('input', () => this.send({ type: 'input', value: this.input.value }))
    this.input.addEventListener('keydown', (event) => this.send({ type: 'key', key: event.key }, event))
    this.root.addEventListener('focusout', (event) => {
      if (!this.root.contains(event.relatedTarget)) this.send({ type: 'leave' })
    })
    this.root.append(this.field, this.input)
    this.append(this.root)
    this.render()
  }

  attributeChangedCallback() {
    if (this.root) this.render()
  }

  get value() {
    return this.getAttribute('value') ?? ''
  }
  set value(next) {
    this.setAttribute('value', next ?? '')
  }

  send(event, dom) {
    const filtered = filterOptions(this.options, this.state.query)
    const result = comboboxReduce(this.state, event, { filtered, loading: this.hasAttribute('loading') })
    if (result.preventDefault) dom?.preventDefault()
    if (result.stopPropagation) dom?.stopPropagation()
    this.state = result.state
    if (result.query !== undefined) this.dispatchEvent(new CustomEvent('k5-query', { detail: { query: result.query }, bubbles: true }))
    if (result.select !== undefined && result.select !== this.value) {
      this.value = result.select
      changed(this)
    }
    this.render()
    if (result.focusInput) this.input.focus()
  }

  render() {
    const m = texts(this)
    const label = this.getAttribute('label') ?? undefined
    const filtered = filterOptions(this.options, this.state.query)
    const view = comboboxView(this.state, {
      options: this.options,
      filtered,
      selected: this.value,
      id: this.controlId,
      placeholder: this.getAttribute('placeholder') ?? m.searchPlaceholder,
    })
    const name = this.getAttribute('name')
    const disabled = this.hasAttribute('disabled')
    const loading = this.hasAttribute('loading')
    if (name) setAttrs(this.field, { name, value: this.value, disabled })
    else this.field.remove()
    setAttrs(this.input, {
      'aria-label': label,
      'aria-expanded': String(this.state.open),
      'aria-controls': this.state.open ? view.listId : null,
      'aria-activedescendant': view.activeDescendant,
      'aria-busy': loading || null,
      placeholder: view.inputPlaceholder,
      disabled,
      required: this.hasAttribute('required'),
    })
    // El atributo, como en el HTML de React; la propiedad, la que se ve aunque se haya escrito.
    this.input.setAttribute('value', view.inputValue)
    if (this.input.value !== view.inputValue) this.input.value = view.inputValue
    this.list?.remove()
    this.list = null
    if (!this.state.open) return
    const items =
      loading || !filtered.length
        ? [
            el(
              'li',
              { role: 'presentation', class: 'k5-combobox__empty' },
              loading ? m.loadingEllipsis : (this.getAttribute('empty-label') ?? m.noResults),
            ),
          ]
        : filtered.map((option, index) => {
            const item = el(
              'li',
              {
                role: 'option',
                id: view.optionId(index),
                'aria-selected': String(option.value === this.value),
                'aria-disabled': option.disabled || null,
                'data-active': String(index === this.state.active),
                class: 'k5-combobox__option',
              },
              [el('span', {}, option.label), icon(ICON_PATHS.check, 'k5-combobox__check')],
            )
            item.addEventListener('mousedown', (event) => event.preventDefault())
            item.addEventListener('mousemove', () => {
              if (this.state.active !== index) this.send({ type: 'hover', index })
            })
            item.addEventListener('click', () => this.send({ type: 'pick', option }))
            return item
          })
    this.list = el('ul', { class: 'k5-combobox__list', id: view.listId, role: 'listbox', 'aria-label': label ?? m.options }, items)
    this.root.append(this.list)
    if (view.activeDescendant) this.list.querySelector(`#${CSS.escape(view.activeDescendant)}`)?.scrollIntoView({ block: 'nearest' })
  }
}

define('k5-combobox', K5Combobox)
