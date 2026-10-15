// Normaliza el HTML de React y de Vue para compararlo: quita los comentarios que
// Vue usa para fragmentos, ordena atributos y clases, unifica atributos booleanos
// y sustituye los ids automáticos (useId de cada framework). Los nombres de
// atributo se comparan en minúsculas: en HTML inputMode e inputmode son el mismo.
export function normalize(html) {
  return html
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
    .replace(/(k5-(?:group-)?)(?:_R_[A-Za-z0-9]*_|v-[0-9-]+)/g, '$1AUTO')
}
