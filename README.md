# Percy's Library

Lector de cómics minimalista y rápido: biblioteca local, progreso de lectura, favoritos y lector integrado (CBZ, CBR, PDF, carpetas de imágenes).

## Requisitos

- Node.js 18.18+
- npm

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar base de datos (SQLite por defecto)
copy apps\server\.env.example apps\server\.env
npm run setup

# 3. Arrancar frontend + API
npm run dev
```

Abre **http://localhost:5173**. La API escucha en **http://localhost:4000**.

## Importar cómics

1. Arrastra archivos `.cbz`, `.cbr`, `.pdf` o carpetas de imágenes a la biblioteca.
2. O usa los botones **Importar** en la cabecera.
3. Los metadatos y el progreso se guardan en SQLite (`apps/server/dev.db`).

## Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor + web en desarrollo |
| `npm run setup` | Genera Prisma y aplica el esquema |
| `npm run build` | Build de producción |
| `npm run typecheck` | Comprueba TypeScript |
| `npm run test` | Tests del servidor y la web |

## Postgres (opcional)

Para usar Postgres en lugar de SQLite:

1. Cambia `provider` en `apps/server/prisma/schema.prisma` a `postgresql`.
2. Ajusta `categories` si migras desde SQLite (el proyecto usa JSON en SQLite).
3. Define `DATABASE_URL` en `apps/server/.env`.
4. Ejecuta `npm run setup`.

Con Docker: `npm run db:up` y la URL del ejemplo en `.env.example` (sección Postgres).

## Estructura

- `apps/web` — interfaz React (Vite)
- `apps/server` — API Express + Prisma
- `apps/server/prisma` — esquema de base de datos

## Nota sobre renderizado de PDFs en Windows

El extractor de PDF usa `pdfjs-dist` y puede requerir una librería de canvas nativa para renderizar páginas (`canvas` o `@napi-rs/canvas`). En Windows la instalación de `canvas` a veces falla porque necesita herramientas de compilación C++ (Visual Studio "Desktop development with C++").

Recomendaciones:

- Preferible: instalar `@napi-rs/canvas` que proporciona binarios más sencillos de usar en muchas plataformas:

	```bash
	npm --workspace apps/server install @napi-rs/canvas
	```

- Si necesitas instalar `canvas` (paquete nativo), instala Visual Studio con la workload "Desktop development with C++" y luego:

	```bash
	npm --workspace apps/server install canvas
	```

El código del servidor ya intenta usar `@napi-rs/canvas` cuando está disponible y tolera la ausencia de canvas para operaciones que no requieran renderizado de PDFs.
