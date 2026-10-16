// Componente de servidor: los de Grado llevan 'use client' y se pueden usar desde aquí.
import { Badge, Card, CardContent, CardHeader, CardTitle, Kpi, KpiGroup, PageHeader } from '@1k5-tech-es/grado-react'
import { Panel } from './Panel'

export default function Page() {
  return (
    <main>
      <PageHeader title="Panel" />
      <KpiGroup>
        <Kpi label="Producción" change={0.12}>
          33,8 kWh
        </Kpi>
        <Kpi label="Consumo" change={-0.04}>
          21 kWh
        </Kpi>
      </KpiGroup>
      <Card>
        <CardHeader>
          <CardTitle>Instalación</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge>Instalada</Badge>
        </CardContent>
      </Card>
      <Panel />
    </main>
  )
}
