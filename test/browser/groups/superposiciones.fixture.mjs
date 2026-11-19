// Pruebas en navegador · grupo «superposiciones y acciones»: lo que se pinta en la página de pruebas.
// render recibe los ayudantes de fixture.mjs y devuelve una lista de section(id, ...hijos).
// C(nombre, props, ...hijos) pinta el componente en React o en Vue con las mismas props;
// en Vue, value → modelValue y onValueChange → onUpdate:modelValue. isVue para lo demás.
export const initial = {
  spPopover: false,
  spContext: '',
  spTick: 0,
  spTarget: '',
  spCount: 0,
  spCleared: 0,
  spPin: false,
  spFormat: '',
  spFilters: [],
  spBanner: true,
}

const power = [{ id: 'copiar-potencia', label: 'Copiar potencia' }]
const menu = [
  { id: 'abrir', label: 'Abrir ficha' },
  { id: 'cups', label: 'Copiar CUPS', disabled: true },
  { id: 'baja', label: 'Dar de baja', danger: true, separator: true },
]

// render({ C, make, section, button, set, state, update, isVue })
export function render({ C, make, section, button, set, state, update, isVue }) {
  // Un icono que sirve como componente en React y como componente funcional en Vue.
  const Pin = (props) =>
    make('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'aria-hidden': props['aria-hidden'] }, [
      make('path', { d: 'M12 17v5', key: 'a' }),
      make('path', { d: 'M9 10.76V4h6v6.76l2 3.24H7z', key: 'b' }),
    ])
  const contextEvent = isVue ? 'onContextmenu' : 'onContextMenu'
  const pressed = isVue ? { 'onUpdate:pressed': set('spPin') } : { onPressedChange: set('spPin') }
  return [
    section(
      'sp-popover',
      C(
        'Popover',
        { label: 'Datos del suministro', title: 'ES0021000000000001AB', open: state.spPopover, onOpenChange: set('spPopover') },
        make('p', null, 'i-DE · Tarifa 2.0TD · 4,6 kW'),
        C('Button', { variant: 'secondary', size: 'sm', onClick: () => update({ spPopover: false }) }, 'Copiar CUPS'),
      ),
      C('Popover', { label: 'Ayuda', align: 'end' }, 'Sin controles dentro'),
    ),
    section(
      'sp-banner',
      state.spBanner
        ? C(
            'Banner',
            {
              tone: 'warning',
              title: 'Mantenimiento del portal de i-DE',
              action: C('Button', { variant: 'link' }, 'Ver estado'),
              onDismiss: () => update({ spBanner: false }),
              ...(isVue ? { dismissible: true } : {}),
            },
            'Las altas de autoconsumo se enviarán el lunes.',
          )
        : null,
      C('Banner', { tone: 'danger', title: 'Sin conexión con Datadis' }),
      C('Banner', { tone: 'brand', title: 'Novedad' }, 'Ya puedes firmar ofertas desde la ficha.'),
    ),
    section(
      'sp-context',
      C(
        'ContextMenu',
        { items: state.spTarget === 'potencia' ? power : menu, label: 'Instalación de Lucía Fernández', onAction: set('spContext') },
        make('p', { 'data-tick': state.spTick }, [
          'Lucía Fernández · Valencia · ',
          // El menú depende de lo que hay bajo el puntero: el hijo prepara items antes de que se abra.
          make('span', { id: 'sp-power', [contextEvent]: () => update({ spTarget: 'potencia' }) }, '8,4 kWp'),
          ' · ',
          // Y un hijo puede dejarlo cerrado.
          make('span', { id: 'sp-no-menu', [contextEvent]: (event) => event.stopPropagation() }, 'sin menú'),
        ]),
      ),
      make('output', null, state.spContext),
    ),
    section(
      'sp-action',
      button('Elegir tres', () => update({ spCount: 3 })),
      C(
        'ActionBar',
        { count: state.spCount, onClear: () => update({ spCount: 0, spCleared: state.spCleared + 1 }) },
        C('Button', { variant: 'secondary', size: 'sm' }, 'Exportar'),
        C('Button', { variant: 'ghost', size: 'sm' }, 'Asignar instalador'),
      ),
      make('output', null, String(state.spCleared)),
      C('ActionBar', { count: 2, inline: true }, C('Button', { variant: 'secondary', size: 'sm' }, 'Exportar')),
    ),
    section(
      'sp-icon',
      C('IconButton', { icon: Pin, label: 'Fijar instalación', pressed: state.spPin, ...pressed }),
      C('IconButton', { icon: Pin, label: 'Fijar en el panel', variant: 'secondary', defaultPressed: true }),
      C('IconButton', { icon: Pin, label: 'Ajustes', variant: 'primary', size: 'sm' }),
      make('output', null, String(state.spPin)),
    ),
    section(
      'sp-single',
      C('ToggleGroup', {
        label: 'Formato del texto',
        options: [
          { value: 'b', label: 'Negrita' },
          { value: 'i', label: 'Cursiva' },
          { value: 'u', label: 'Subrayado', disabled: true },
        ],
        value: state.spFormat,
        onValueChange: set('spFormat'),
      }),
      make('output', null, state.spFormat),
    ),
    section(
      'sp-multi',
      C('ToggleGroup', {
        label: 'Filtros rápidos',
        type: 'multiple',
        options: [
          { value: 'conectadas', label: 'Conectadas', icon: Pin },
          { value: 'obra', label: 'En obra', icon: Pin },
          { value: 'pendientes', label: 'Pendientes', icon: Pin },
        ],
        iconOnly: true,
        size: 'sm',
        value: state.spFilters,
        onValueChange: set('spFilters'),
      }),
      make('output', null, state.spFilters.join(',')),
    ),
  ]
}
