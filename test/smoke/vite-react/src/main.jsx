import '@1k5-tech-es/grado/fonts.css'
import '@1k5-tech-es/grado/tokens.css'
import '@1k5-tech-es/grado/grado.css'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button, DataTable, Dialog, GradoProvider, NifInput, Toaster, toast } from '@1k5-tech-es/grado-react'
import { Form, FormField } from '@1k5-tech-es/grado-react/react-hook-form'
import { isValidNif } from '@1k5-tech-es/grado/patterns'

const rows = [
  { id: '1', name: 'Lucía Fernández', power: 6.4 },
  { id: '2', name: 'Jordi Puig', power: 4.8 },
]

function App() {
  const [open, setOpen] = useState(false)
  return (
    <GradoProvider locale="es-ES">
      <Button onClick={() => setOpen(true)}>Abrir</Button>
      <Dialog open={open} onOpenChange={setOpen} title="Oferta">
        <Form onSubmit={() => toast.success('Guardado')} defaultValues={{ nif: '' }}>
          <FormField name="nif" label="NIF" required validate={(v) => isValidNif(v) || 'NIF no válido'}>
            <NifInput />
          </FormField>
          <Button type="submit">Guardar</Button>
        </Form>
      </Dialog>
      <DataTable
        caption="Instalaciones"
        rows={rows}
        rowKey="id"
        columns={[
          { key: 'name', header: 'Cliente', sortable: true },
          { key: 'power', header: 'Potencia', numeric: true },
        ]}
      />
      <Toaster />
    </GradoProvider>
  )
}

createRoot(document.getElementById('app')).render(<App />)
