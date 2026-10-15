import { createElement as h } from 'react'
import { LiveDemo } from './demos.mjs'

// Ejemplos completos y formateados. Solo importan useState o ref cuando los usan.
const indent = (text, spaces) =>
  text
    .split('\n')
    .map((line) => (line ? ' '.repeat(spaces) + line : line))
    .join('\n')
export const react = (names, markup, setup = '') => {
  const hooks = setup.includes('useState') ? "import { useState } from 'react';\n" : ''
  const state = setup ? `${indent(setup, 2)}\n` : ''
  const jsx = markup.includes('\n') ? `(\n${indent(markup, 4)}\n  )` : markup
  return `${hooks}import { ${names} } from '@1k5-tech-es/grado-react';\n\nexport default function Ejemplo() {\n${state}  return ${jsx};\n}`
}
export const vue = (names, markup, setup = '') => {
  const refs = setup.includes('ref(') ? "import { ref } from 'vue';\n" : ''
  return `<script setup>\n${refs}import { ${names} } from '@1k5-tech-es/grado-vue';\n${setup ? `\n${setup}\n` : ''}</script>\n\n<template>\n${indent(markup, 2)}\n</template>`
}
export const entry = (id, name, category, description, reactCode, vueCode, props, note) => ({
  id,
  name,
  category,
  description,
  preview: h(LiveDemo, { id }),
  live: true,
  react: reactCode,
  vue: vueCode,
  props,
  note,
})
export const list = (...rows) => `[\n${rows.map((row) => `  ${row},`).join('\n')}\n]`
