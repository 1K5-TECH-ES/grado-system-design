<script setup lang="ts">
import { ref } from 'vue'
import { Button, DataTable, Dialog, Input, Kpi, Toaster, toast } from '@1k5-tech-es/grado-vue'
import { Form, FormField } from '@1k5-tech-es/grado-vue/vee-validate'

const open = ref(false)
const rows = [
  { id: '1', name: 'Lucía Fernández', power: 6.4 },
  { id: '2', name: 'Jordi Puig', power: 4.8 },
]
const columns = [
  { key: 'name', header: 'Cliente', sortable: true },
  { key: 'power', header: 'Potencia', numeric: true },
]
</script>

<template>
  <main>
    <Kpi label="Producción" :change="0.12">33,8 kWh</Kpi>
    <Button @click="open = true">Abrir</Button>
    <Dialog v-model:open="open" title="Nota">
      <Form :initial-values="{ text: '' }" @submit="toast.success('Guardada')">
        <FormField name="text" label="Texto" required>
          <Input />
        </FormField>
        <Button type="submit">Guardar</Button>
      </Form>
    </Dialog>
    <DataTable caption="Instalaciones" :rows="rows" :columns="columns" row-key="id" />
    <Toaster />
  </main>
</template>
