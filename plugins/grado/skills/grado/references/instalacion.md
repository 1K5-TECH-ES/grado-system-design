# Instalar Grado y llevarlo al CI

Los paquetes son públicos, pero el registro npm de GitHub Packages pide un token incluso para descargar paquetes públicos. Vale cualquier cuenta de GitHub: no hace falta pertenecer a la organización `1K5-TECH-ES`.

## 1. El token (lo crea la persona, una vez)

Explícale estos pasos; no puedes hacerlos por ella.

1. GitHub → **Settings → Developer settings → Personal access tokens → Tokens (classic)** → *Generate new token (classic)*.
2. Marcar **solo** `read:packages`. No hace falta `repo` ni `write:packages`.
3. Tiene que ser **classic**: GitHub Packages todavía no acepta tokens granulares (*fine-grained*) para npm.
4. Guardarlo en el perfil de la shell, fuera de cualquier repositorio:

```bash
# ~/.bashrc o ~/.zshrc
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

5. Abrir una terminal nueva (o reiniciar VS Code) para que la variable llegue a los procesos que lanzan `npm`.

Comprueba que existe sin mostrarlo: `test -n "$GITHUB_TOKEN" && echo "GITHUB_TOKEN definido" || echo "falta GITHUB_TOKEN"`.

## 2. Decirle a npm dónde está Grado

Crea este `.npmrc` en la raíz de la app (junto a su `package.json`) y súbelo al repositorio: no contiene ningún secreto.

```ini
@1k5-tech-es:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

En un monorepo, el `.npmrc` va en la carpeta donde se ejecuta `npm install` o `npm ci`. Si la app ya tiene un `.npmrc`, añade estas dos líneas sin quitar las suyas.

## 3. Instalar

```bash
# React
npm install @1k5-tech-es/grado @1k5-tech-es/grado-react
# Vue
npm install @1k5-tech-es/grado @1k5-tech-es/grado-vue
# HTML sin framework (con bundler)
npm install @1k5-tech-es/grado @1k5-tech-es/grado-elements
```

Instala siempre el paquete base y el del framework en la **misma versión**. Los iconos son de Lucide y los instala la app: `lucide-react` o `lucide-vue-next`.

## 4. Si la instalación falla

| Error | Causa probable | Qué hacer |
|---|---|---|
| `E404 Not Found … @1k5-tech-es/grado` en `registry.npmjs.org` | npm no ve el `.npmrc` | Comprueba que está en la carpeta donde se ejecuta npm y que la primera línea es exacta |
| `E401 Unauthorized` | `GITHUB_TOKEN` vacío en esa shell, o token caducado | `test -n "$GITHUB_TOKEN"`; abre una terminal nueva; si sigue, la persona crea otro token |
| `E403 Forbidden` | Token sin `read:packages` | La persona revisa el token (sección 1) |
| Funciona en local y falla en CI o Docker | El entorno de build no tiene el token | Sección 6 |

## 5. Sin token (plan B)

La web de documentación de Grado ofrece los `.tgz` para descargar. Se guardan en `vendor/` de la app, se suben al repositorio y se instalan con:

```bash
npm install ./vendor/1k5-tech-es-grado-0.9.0.tgz ./vendor/1k5-tech-es-grado-react-0.9.0.tgz
```

Con token, usa siempre npm: los `.tgz` hay que cambiarlos a mano en cada versión.

## 6. CI y despliegues

El entorno que ejecuta `npm ci` también necesita el token.

### GitHub Actions

Como los paquetes son públicos, basta el `GITHUB_TOKEN` del propio workflow:

```yaml
permissions:
  contents: read
  packages: read

steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: 22
  - run: npm ci
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Docker

Pasa el token como **secreto de BuildKit**, nunca como `ARG` ni `ENV`: quedaría en las capas de la imagen y en `docker history`.

```dockerfile
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=secret,id=gh,env=GITHUB_TOKEN,required=true npm ci
```

```yaml
# docker-compose.yml
services:
  web:
    build:
      context: .
      secrets: [gh]
secrets:
  gh:
    environment: GITHUB_TOKEN
```

Sin compose: `docker build --secret id=gh,env=GITHUB_TOKEN .`

### Vercel, Netlify y otros

Variable de entorno `GITHUB_TOKEN` con un token classic `read:packages`, mejor de una cuenta de servicio que de una persona. La configura la persona en el panel del servicio.

## 7. Clonar el repositorio de Grado como referencia

Con el paquete instalado ya están los tipos en `node_modules`. Si además se clona el repositorio al lado de la app, hay mucho más contexto: el código de cada componente, los tests, la API generada y los ejemplos.

```bash
cd ..                 # junto a la app
git clone https://github.com/1K5-TECH-ES/grado-system-design.git
cd grado-system-design
git checkout v0.9.0   # la versión que usa la app
npm install           # usa el mismo .npmrc y token
npm run build         # genera dist/ de los paquetes y el catálogo
```

Para leerlo desde la sesión de la app: `claude --add-dir ../grado-system-design`, o `/add-dir ../grado-system-design` dentro de la sesión. Es solo una referencia: la app sigue instalando Grado desde npm, y el repositorio de Grado no se edita desde la tarea de otra app.
