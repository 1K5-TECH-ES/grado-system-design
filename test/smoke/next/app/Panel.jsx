'use client'
import { useState } from 'react'
import { Button, Dialog, LineChart, Toaster, toast } from '@1k5-tech-es/grado-react'
import { Form, FormField } from '@1k5-tech-es/grado-react/react-hook-form'
import { Input } from '@1k5-tech-es/grado-react'

const data = [
  { day: 'Lun', production: 30, consumption: 20 },
  { day: 'Mar', production: 34, consumption: 24 },
]

export function Panel() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <LineChart
        title="Producción"
        data={data}
        categoryKey="day"
        series={[
          { key: 'production', label: 'Producción' },
          { key: 'consumption', label: 'Consumo' },
        ]}
        unit="kWh"
      />
      <Button onClick={() => setOpen(true)}>Nueva nota</Button>
      <Dialog open={open} onOpenChange={setOpen} title="Nota">
        <Form onSubmit={() => toast.success('Guardada')} defaultValues={{ text: '' }}>
          <FormField name="text" label="Texto" required>
            <Input />
          </FormField>
          <Button type="submit">Guardar</Button>
        </Form>
      </Dialog>
      <Toaster />
    </>
  )
}
