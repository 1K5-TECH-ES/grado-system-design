import '@1k5-tech-es/grado/fonts.css'
import '@1k5-tech-es/grado/tokens.css'
import '@1k5-tech-es/grado/grado.css'

export const metadata = { title: 'Grado · Next' }

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-k5-theme="consola">
      <body>{children}</body>
    </html>
  )
}
