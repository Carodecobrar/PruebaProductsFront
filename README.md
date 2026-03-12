
# front-linktic-prueba-nicolas

Proyecto front-end de ejemplo (Vue 3 + Vite) usado como prueba técnica. Este README está en español y resume cómo instalar, desarrollar y desplegar la aplicación localmente (incluye instrucciones Docker que existen en el repo).

## Recommended IDE Setup


[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup


## Resumen rápido

- Framework: Vue 3
- Bundler: Vite
- Estado: aplicación cliente que consume APIs (variables VITE_API_...)
- Tests: Vitest (configurado para `jsdom`)

## Type Support for `.vue` Imports in TS


## Requisitos

- Node.js: versión compatible indicada en `package.json` (recomendado Node 20+)
- npm (o pnpm/yarn) para instalar dependencias
- Docker & docker-compose (opcional, hay docker-compose en el repo)

## Customize configuration


## Instalación

Instala dependencias:

## Project Setup


```bash
npm install
```

### Compile and Hot-Reload for Development


```bash
npm run dev
```

### Type-Check, Compile and Minify for Production


```bash
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)


```bash
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)


```bash
npm run lint
```

## Desarrollo

Levanta el servidor de desarrollo con recarga en caliente:

```bash
npm run dev
```

Por defecto Vite escucha en el puerto 5173 (configurado en `vite.config.ts`).

### Variables de entorno

La aplicación usa variables `VITE_` para apuntar a las APIs. Ejemplos que aparecen en `docker-compose.yml`:

- VITE_API_PRODUCTS_URL (ej. `/api`)
- VITE_API_INVENTORY_URL (ej. `/inventory`)

Puedes definir variables en un archivo `.env` en la raíz o exportarlas en tu entorno de desarrollo.

## Build / Producción

Generar artefactos de producción:

```bash
npm run build
```

Previsualizar el build localmente:

```bash
npm run preview
```

## Docker (desarrollo)

El repo incluye ejemplos de `docker-compose.yml` y un servicio `nginx-proxy` dentro de `nginx-proxy/`.

Levantar con Docker Compose (desarrollo):

```powershell
# desde la raíz del repo
docker-compose up -d --build
```

El `docker-compose.yml` de la raíz expone el frontend en el puerto 5173 y monta el código para desarrollo con hot-reload. El servicio define variables de entorno útiles como `VITE_API_PRODUCTS_URL`.

Si usas la carpeta `nginx-proxy`, hay un contenedor nginx preparado para enrutar tráfico; ambos stacks usan una red `microservices-net` externa (asegúrate de crearla si la usas).

## Tests

Ejecutar tests unitarios con Vitest:

```bash
npm run test:unit
```

## Lint

El proyecto incluye scripts para lint y formato. Ejecuta:

```bash
npm run lint
```

Eso ejecuta las tareas configuradas (`oxlint`, `eslint`) y puede intentar autoarreglos con `--fix`.

## Estructura del proyecto (resumen)

- `src/` - código fuente
  - `main.ts` - arranque de la app
  - `App.vue` - componente raíz
  - `router/` - rutas
  - `stores/` - stores de Pinia
  - `views/` - vistas (por ejemplo `ProductDetail.vue`)
- `vite.config.ts` - configuración de Vite
- `vitest.config.ts` - configuración de tests
- `docker-compose.yml` - ejemplo para desarrollo con Docker

## Observaciones y recomendaciones

- Archivo `src/views/ProductDetail.vue` muestra flujo de compra, carga de inventario y manejo de errores.
- Revisar variables environment y asegurar que las URLs de API sean correctas en cada entorno.
- Añadir un `.env.example` con las variables `VITE_API_PRODUCTS_URL` y `VITE_API_INVENTORY_URL` ayudaría a otros desarrolladores.
- Considerar añadir scripts CI (GitHub Actions) para ejecutar tests y lint en pushes/PRs.

## Siguientes pasos sugeridos

1. Añadir `.env.example` con variables mínimas.
2. Crear un workflow de CI para lint y tests.
3. Documentar endpoints/backend esperados (contrato API) si el frontend depende de rutas concretas.

---

He añadido a continuación un ejemplo de variables de entorno (`.env.example`), y unas secciones para contribuir y la licencia mínima del proyecto.

## Ejemplo de variables de entorno (`.env.example`)

Coloca en la raíz un archivo `.env` (no lo subas a git) con las variables necesarias. Un ejemplo mínimo se proporciona en `.env.example`:

```text
# URL base para el servicio de productos (puede ser relativa o absoluta)
VITE_API_PRODUCTS_URL=/api

# URL base para el servicio de inventario
VITE_API_INVENTORY_URL=/inventory

# (Opcional) URL de autenticación u otras APIs
# VITE_API_AUTH_URL=/auth
```

## Contribuir

Si quieres contribuir a este repositorio, sigue estos pasos básicos:

1. Haz un fork y crea una rama feature/mi-cambio
2. Instala dependencias: `npm install`
3. Ejecuta tests y lint: `npm run test:unit` y `npm run lint`
4. Crea un Pull Request describiendo los cambios y por qué son necesarios

Gracias por tu interés en mejorar el proyecto.

## Licencia

Este repositorio no incluye una licencia explícita por defecto. Si quieres añadir una, una opción común y permisiva es MIT. Para añadirla crea un archivo `LICENSE` con el texto correspondiente. Si quieres que añada una licencia MIT ahora, puedo hacerlo.
