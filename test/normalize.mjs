// Normaliza el HTML de React y de Vue para compararlo: quita los comentarios que
// Vue usa para fragmentos, ordena atributos y clases, unifica atributos booleanos
// y sustituye los ids automáticos (useId de cada framework). Los nombres de
// atributo se comparan en minúsculas: en HTML inputMode e inputmode son el mismo.
export function normalize(html) {
  return (
    html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s=>/]+(?:="[^"]*")?)*)\s*\/?>/g, (_, tag, attrs) => {
        const list = [...attrs.matchAll(/([^\s=]+)(?:="([^"]*)")?/g)]
          .map(([, name, value = '']) => {
            const v =
              name === 'class' ? value.split(/\s+/).filter(Boolean).sort().join(' ') : name === 'style' ? value.replace(/;$/, '') : value
            const key = name.toLowerCase()
            return v === '' ? key : `${key}="${v}"`
          })
          .sort()
        return `<${tag}${list.length ? ` ${list.join(' ')}` : ''}>`
      })
      // useId: «_R_x_» en React 19.1+, «R2q» en React 18 (de «:R2q:»), «v-0-1» en Vue y «v0» en Vue 3.5.0 (de «v:0») y «e1» en grado-elements.
      .replace(/(k5-[a-z-]*?)(?:_R_[A-Za-z0-9]*_|R[0-9a-v]+(?![A-Za-z0-9])|v-?\d+(?:-\d+)*|e\d+(?![A-Za-z0-9]))/g, '$1AUTO')
  )
}
