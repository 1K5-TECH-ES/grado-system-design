import { createElement as h, Fragment } from 'react'

export const slug = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const normalize = (value) => value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

/** Texto con `código` y **negrita**, como en el CHANGELOG. El resto se escapa como texto. */
export function rich(text) {
  if (typeof text !== 'string') return text
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean)
  return h(
    Fragment,
    null,
    ...parts.map((part, i) =>
      part.startsWith('`') && part.length > 1
        ? h('code', { key: i }, part.slice(1, -1))
        : part.startsWith('**') && part.length > 3
          ? h('strong', { key: i }, part.slice(2, -2))
          : part,
    ),
  )
}
