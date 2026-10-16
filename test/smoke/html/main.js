import '@1k5-tech-es/grado/fonts.css'
import '@1k5-tech-es/grado/tokens.css'
import '@1k5-tech-es/grado/grado.css'
import { toast } from '@1k5-tech-es/grado-elements'

document.querySelector('k5-combobox').addEventListener('change', (event) => toast.success(`Provincia: ${event.target.value}`))
