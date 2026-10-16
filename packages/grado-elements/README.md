# @1k5-tech-es/grado-elements

Web Components de Grado para HTML sin framework: PHP, Twig, plantillas de servidor y páginas
estáticas. Generan el mismo HTML que los componentes de `@1k5-tech-es/grado-react` y
`@1k5-tech-es/grado-vue`, con el mismo teclado y los mismos textos: el estado sale del núcleo
común (`@1k5-tech-es/grado/core`). Usan el DOM normal (sin shadow DOM), así que `grado.css` y
tus estilos se aplican igual.

## Instalación

Sin bundler, copia `dist/grado-elements.min.js` (lo trae todo) y los CSS de `@1k5-tech-es/grado`:

```html
<link rel="stylesheet" href="/vendor/grado/fonts.css" />
<link rel="stylesheet" href="/vendor/grado/tokens.css" />
<link rel="stylesheet" href="/vendor/grado/grado.css" />
<script type="module" src="/vendor/grado-elements.min.js"></script>
```

Con bundler: `import '@1k5-tech-es/grado-elements'`.

## Elementos

```html
<k5-combobox label="Provincia" name="provincia" value="md">
  <option value="md">Madrid</option>
  <option value="vlc">Valencia</option>
</k5-combobox>

<button data-k5-open="nota">Nueva nota</button>
<k5-dialog id="nota" label="Nueva nota">
  <p>Contenido</p>
  <div slot="footer"><button class="k5-btn k5-btn--primary">Guardar</button></div>
</k5-dialog>

<k5-tabs label="Ficha">
  <k5-tab value="resumen" label="Resumen">…</k5-tab>
  <k5-tab value="documentos" label="Documentos">…</k5-tab>
</k5-tabs>

<k5-menu label="Acciones">
  <option value="editar">Editar</option>
  <option value="borrar" data-danger data-separator>Eliminar</option>
</k5-menu>

<k5-toaster></k5-toaster>
<script type="module">
  import { toast } from '/vendor/grado-elements.min.js'
  toast.success('Oferta enviada')
</script>
```

- `k5-combobox`: con `name`, el valor viaja con el formulario en un campo oculto. Evento `change`; el valor, en `.value`.
- `k5-dialog`: `show()`, `close()`, el atributo `open` o cualquier botón `data-k5-open="id"`. Evento `close`.
- `k5-tabs`: evento `change`; la pestaña elegida, en `.value`.
- `k5-menu`: evento `k5-select` con `detail.value`.
- `k5-toaster` y `toast()`: la misma cola que `toast()` de React y Vue.

Los textos salen del `lang` de la página (`es`, `de`, `en`).
