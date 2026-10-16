# Apps de prueba

Tres proyectos mínimos que instalan Grado desde los `.tgz` (como una app de verdad, sin el
monorepo) y compilan: **Vite + React**, **Next con App Router** (componentes de servidor y
`'use client'`) y **Nuxt** (SSR). Comprueban los `exports`, `'use client'`, el CSS y los
adaptadores de formularios con las versiones actuales de cada framework.

```bash
npm run test:smoke            # las tres
npm run test:smoke -- next    # solo una: vite-react, next o nuxt
```

`scripts/smoke.mjs` empaqueta los tres paquetes, copia cada app a una carpeta temporal, pone
los `.tgz` en su `package.json`, instala y ejecuta `npm run build`. Necesita red para instalar
los frameworks. Las versiones de cada app están fijadas en su `package.json`.
