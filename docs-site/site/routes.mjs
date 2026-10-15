// Rutas de la web, índices de página y lo que encuentra el buscador.
import { icons } from './icons.mjs'
import { version } from './ui.mjs'

export const routes = [
  { key: 'home', path: '/', title: 'Introducción', label: 'Inicio', icon: icons.home, meta: 'Introducción' },
  {
    key: 'customize',
    path: '/personalizar',
    title: 'Personalizar',
    label: 'Personalizar',
    icon: icons.customize,
    meta: 'Constructor de temas',
  },
  {
    key: 'foundations',
    path: '/fundamentos',
    title: 'Fundamentos',
    label: 'Fundamentos',
    icon: icons.foundations,
    meta: 'Tipografía, color, elevación, densidad',
  },
  {
    key: 'installation',
    path: '/instalacion',
    title: 'Instalación',
    label: 'Instalación',
    icon: icons.installation,
    meta: 'Paquetes y estilos',
  },
  {
    key: 'components',
    path: '/componentes',
    title: 'Componentes',
    label: 'Componentes',
    icon: icons.components,
    meta: 'Vista previa, código y propiedades',
  },
  { key: 'status', path: '/estado', title: 'Estado', label: 'Estado', icon: icons.status, meta: 'Cobertura y adopción' },
  {
    key: 'changelog',
    path: '/cambios',
    title: 'Cambios',
    label: 'Cambios',
    icon: icons.changelog,
    meta: `Versión ${version}`,
    badge: version,
  },
]
export const routeByPath = Object.fromEntries(routes.map((route) => [route.path, route]))

export const installToc = [
  ['requisitos', 'Requisitos'],
  ['paquetes', 'Paquetes'],
  ['estilos', 'Estilos'],
  ['temas', 'Temas'],
  ['primer-componente', 'Primer componente'],
  ['idioma', 'Idioma'],
  ['migracion', 'Migración'],
]
export const foundationsToc = [
  ['principios', 'Principios'],
  ['tipografia', 'Tipografía'],
  ['color', 'Escala tonal'],
  ['elevacion', 'Elevación'],
  ['radios', 'Radios'],
  ['espaciado', 'Espaciado'],
  ['densidad', 'Densidad'],
  ['otras-escalas', 'Iconos y contenedores'],
  ['versiones', 'Versiones y deprecación'],
]

// Grupos de CommandPalette. El id de cada elemento es la ruta a la que lleva.
export const searchGroups = (families) => [
  { label: 'Páginas', items: routes.map((route) => ({ id: route.path, label: route.label, description: route.meta })) },
  {
    label: 'Instalación',
    items: installToc.map(([id, label]) => ({ id: `/instalacion#${id}`, label, description: 'Guía', keywords: 'instalación' })),
  },
  {
    label: 'Fundamentos',
    items: foundationsToc.map(([id, label]) => ({ id: `/fundamentos#${id}`, label, description: 'Fundamentos', keywords: 'tokens' })),
  },
  ...families.map((group) => ({
    label: group.name,
    items: group.items.map((c) => ({ id: `/componentes#${c.id}`, label: c.name, description: c.description, keywords: group.name })),
  })),
]
