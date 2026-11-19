/** Teclas de un atajo pintadas junto a un texto. Ocultas a lectores de pantalla: el control lleva aria-keyshortcuts. */
export function ShortcutKeys({ keys, className }: { keys: string[]; className: string }) {
  return (
    <span className={className} aria-hidden="true">
      {keys.map((key, index) => (
        <kbd key={`${key}-${index}`}>{key}</kbd>
      ))}
    </span>
  )
}
