// <k5-toaster></k5-toaster>
// import { toast } from '@1k5-tech-es/grado-elements'
// toast.success('Oferta enviada', { action: { label: 'Deshacer', shortcut: ['⌘', 'Z'], onClick: deshacer } })
// Avisos con cola, con el mismo HTML que Toaster de React y Vue y la misma cola
// (createToastStore de @1k5-tech-es/grado/patterns). Pon un <k5-toaster> en la página.
import { buttonClass, ICON_PATHS, keyShortcuts, STATUS_ICONS } from '@1k5-tech-es/grado/classes'
import { createToastStore, visibleToasts } from '@1k5-tech-es/grado/patterns'
import { define, el, icon, setAttrs, texts } from './dom.js'

const store = createToastStore()

/** Añade un aviso a la cola: toast('…'), toast.success, warning, error, info, promise y dismiss. */
export const toast = store.toast

export class K5Toaster extends HTMLElement {
  static observedAttributes = ['max', 'label']

  connectedCallback() {
    if (this.region) return
    // La región está siempre en la página: así los lectores de pantalla anuncian lo que entra.
    this.region = el('section', { class: 'k5-toaster', 'aria-live': 'polite' })
    this.replaceChildren(this.region)
    this.nodes = new Map()
    this.unsubscribe = store.subscribe(() => this.render())
    this.render()
  }

  disconnectedCallback() {
    this.unsubscribe?.()
    this.region = null
    for (const { timer } of this.nodes?.values() ?? []) clearTimeout(timer)
  }

  attributeChangedCallback() {
    if (this.region) this.render()
  }

  render() {
    const m = texts(this)
    setAttrs(this.region, { 'aria-label': this.getAttribute('label') ?? m.notifications })
    const shown = visibleToasts(store.getSnapshot(), Number(this.getAttribute('max') ?? 3))
    const ids = new Set(shown.map((item) => item.id))
    for (const [id, entry] of this.nodes) {
      if (ids.has(id)) continue
      clearTimeout(entry.timer)
      entry.node.remove()
      this.nodes.delete(id)
    }
    for (const item of shown) {
      const old = this.nodes.get(item.id)
      // toast.promise cambia el aviso en su sitio: se vuelve a pintar si cambia algo.
      if (old && old.item === item) continue
      const node = this.toastNode(item, m)
      if (old) {
        clearTimeout(old.timer)
        old.node.replaceWith(node)
      } else this.region.append(node)
      const entry = { item, node, remaining: item.duration, timer: 0, started: 0 }
      this.nodes.set(item.id, entry)
      this.schedule(entry)
    }
  }

  // Se cierra solo pasada su duración; se para mientras tiene el ratón o el foco encima.
  schedule(entry) {
    if (entry.item.duration <= 0) return
    entry.started = Date.now()
    entry.timer = setTimeout(() => toast.dismiss(entry.item.id), Math.max(0, entry.remaining))
  }
  pause(entry) {
    clearTimeout(entry.timer)
    entry.remaining -= Date.now() - entry.started
  }

  toastNode(item, m) {
    const close = el('button', { type: 'button', class: 'k5-close', 'aria-label': m.dismiss }, [icon(ICON_PATHS.x)])
    close.addEventListener('click', () => toast.dismiss(item.id))
    let action = null
    if (item.action) {
      const keys = item.action.shortcut ?? []
      action = el(
        'button',
        {
          type: 'button',
          class: buttonClass({ variant: 'link', size: 'sm' }),
          'aria-keyshortcuts': keys.length ? keyShortcuts(keys) : undefined,
        },
        [
          item.action.label,
          keys.length
            ? el(
                'span',
                { class: 'k5-btn__shortcut', 'aria-hidden': 'true' },
                keys.map((key) => el('kbd', {}, key)),
              )
            : null,
        ],
      )
      action.addEventListener('click', () => {
        item.action.onClick?.()
        toast.dismiss(item.id)
      })
    }
    const alert = el('div', { class: `k5-alert k5-alert--${item.tone}`, role: item.tone === 'danger' ? 'alert' : null }, [
      icon(ICON_PATHS[STATUS_ICONS[item.tone] ?? 'info'], 'k5-alert__icon'),
      el('div', { class: 'k5-alert__content' }, [
        el('strong', { class: 'k5-alert__title' }, item.title),
        item.description ? el('div', { class: 'k5-alert__description' }, item.description) : null,
        action ? el('div', { class: 'k5-alert__action' }, [action]) : null,
      ]),
      close,
    ])
    const node = el('div', { class: 'k5-toast' }, [alert])
    const entry = () => this.nodes.get(item.id)
    node.addEventListener('mouseenter', () => entry() && this.pause(entry()))
    node.addEventListener('mouseleave', () => {
      if (entry() && !node.contains(document.activeElement)) this.schedule(entry())
    })
    node.addEventListener('focusin', () => entry() && this.pause(entry()))
    node.addEventListener('focusout', (event) => {
      if (entry() && !node.contains(event.relatedTarget)) this.schedule(entry())
    })
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') toast.dismiss(item.id)
    })
    return node
  }
}

define('k5-toaster', K5Toaster)
