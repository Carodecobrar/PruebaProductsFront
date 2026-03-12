
# front-linktic-prueba-nicolas

Proyecto front-end de ejemplo (Vue 3 + Vite) usado como prueba técnica. Este README está en español y resume cómo instalar, desarrollar y desplegar la aplicación localmente (incluye instrucciones Docker que existen en el repo).

## Recommended IDE Setup


[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup


## Resumen rápido

- Framework: Vue 3
- Bundler: Vite

# front-linktic-prueba-nicolas — Documentación técnica

Este repositorio contiene una aplicación front-end desarrollada en Vue 3 (Vite) creada como prueba técnica. La app consume dos microservicios: uno de productos y otro de inventario. Este documento explica la arquitectura, cómo ejecutar y desarrollar localmente, las convenciones clave y el contrato mínimo de APIs que el cliente espera.

Contenido
- Resumen técnico
- Requisitos
- Instalación y ejecución
- Variables de entorno
- Desarrollo (hot-reload, Docker)
- Pruebas y linting
- Estructura del proyecto
- Contrato API (endpoints y formatos)
- Flujo de autenticación y seguridad
- Caché y comportamiento offline
- Buenas prácticas y siguientes pasos

## Resumen técnico

- Framework: Vue 3
- Estado management: Pinia
- Router: vue-router (history mode)
- HTTP client: axios (clientes separados: `apiProducts` y `apiInventory`)
- Estilo: TailwindCSS
- Tests: Vitest + @vue/test-utils
- Bundler: Vite

El front actúa como cliente para dos APIs (configurables via variables de entorno):
- Products Service (cliente `apiProducts`) — rutas: `/products`, `/products/:id`, `/auth/login`.
- Inventory Service (cliente `apiInventory`) — rutas: `/purchases`, etc.

## Requisitos

- Node.js (ver `package.json` → `engines`) — recomendado Node 20+.
- npm (o pnpm/yarn) para dependencias.
- Docker & docker-compose (opcional, para entorno de desarrollo con contenedores).

## Instalación (rápida)

1. Clona el repositorio:

```bash
git clone <repo-url>
cd front-linktic-prueba-nicolas
```

2. Instala dependencias:

```bash
npm install
```

3. Copia el fichero de ejemplo de variables de entorno:

```bash
cp .env.example .env
# editar .env según sea necesario
```

## Ejecución en desarrollo

Levanta Vite (hot-reload):

```bash
npm run dev
```

Por defecto Vite escucha en el puerto 5173 (configurado en `vite.config.ts`).

### Docker (desarrollo)

El repositorio contiene un `docker-compose.yml` de ejemplo que monta el código y expone el puerto 5173. Para levantar con Docker Compose:

```powershell
docker-compose up -d --build
```

Nota: el `docker-compose.yml` y el stack `nginx-proxy` usan una red externa llamada `microservices-net`. Crea esa red si no existe:

```powershell
docker network create microservices-net
```

## Variables de entorno

- VITE_API_PRODUCTS_URL — URL base del servicio de productos (por defecto `/api`).
- VITE_API_INVENTORY_URL — URL base del servicio de inventario (por defecto `/inventory`).

Ejemplo en `.env.example` (ya añadido en este repo):

```text
VITE_API_PRODUCTS_URL=/api
VITE_API_INVENTORY_URL=/inventory
```

Variables con prefijo `VITE_` son expuestas al cliente por diseño de Vite.

## Tests y linting

- Ejecutar tests unitarios:

```bash
npm run test:unit
```

- Ejecutar linter (oxlint + eslint):

```bash
npm run lint
```

Nota: al ejecutar los tests en este repo localmente se detectó un fallo en `src/__tests__/App.spec.ts` relacionado con la ausencia de un stub para `router-view`. Recomendación: stubear `router-view` o proporcionar un `createRouter` con `createMemoryHistory` en el entorno de test.

## Estructura del proyecto

- src/
  - main.ts — bootstrap de la app (pinia + router)
  - App.vue — componente raíz (renderiza `<router-view/>`)
  - router/ — definición de rutas y guard hooks (requieren autenticación en rutas protegidas)
  - stores/ — Pinia stores (`auth`, `products`, `counter`)
  - services/ — clientes API (`api.ts`) y configuración de axios
  - views/ — páginas (Login, Dashboard, ProductDetail, ...)
  - components/ — componentes reutilizables (ConfirmModal, Pagination, ...)
  - __tests__/ — tests unitarios

## Contrato API (mínimo esperado por el frontend)

El frontend espera que los servicios sigan convenciones simples (JSON API-like para productos):

Products Service (`apiProducts`)
- GET /products
  - Query params: page, size, filters
  - Respuesta esperada: { data: [ { attributes: { id, sku, name, price, status, ... } }, ... ], meta: { page, size, totalElements, totalPages } }

- GET /products/:id
  - Respuesta esperada: { data: [ { attributes: { id, sku, name, price, status, ... } } ] }

- POST /auth/login
  - Body: { email, password }
  - Respuesta esperada: { token, email, role }

Inventory Service (`apiInventory`)
- POST /purchases
  - Body: { productId, quantity }
  - Headers: se recomienda usar `Idempotency-Key` para idempotencia de compras
  - Respuesta esperada: datos de la compra o error con campo `errors[0].detail`

Inventory read endpoints (ej. `/inventory`):
- GET /inventory/:productId (opcional) — respuesta: { productId, available, reserved }

Errores: los stores esperan que errores sigan la forma `error.response.data.errors[0].detail` para mostrar mensajes amigables.

## Flujo de autenticación y seguridad

- La app realiza login en `apiProducts.post('/auth/login')` y almacena `token` en `localStorage`.
- `apiProducts` añade el header `Authorization: Bearer <token>` automáticamente salvo para la ruta `/login`.
- Si el servidor responde 401, el interceptor de `apiProducts` llama a `authStore.logout()` y redirige a `/login`.

## Caché y comportamiento

- `stores/products.ts` implementa caching en memoria con duración configurable (`CACHE_DURATION` = 5 minutos). La caché evita llamadas repetidas a `GET /products` y `GET /products/:id` si los datos están frescos.
- Métodos relevantes: `clearCache()`, `clearCurrentProduct()`.

## Manejo de compras (idempotencia)

- `stores/products.purchase` genera un `Idempotency-Key` (usando `crypto.randomUUID()`) y lo envía en la cabecera al `apiInventory.post('/purchases')` para evitar duplicados.

## Contribuir

1. Fork + branch feature/mi-cambio
2. Ejecutar tests y linter localmente
3. Crear PR describiendo cambios

## Licencia

Este repositorio no incluye licencia por defecto. Si necesitas una licencia permisiva te puedo añadir una MIT.
