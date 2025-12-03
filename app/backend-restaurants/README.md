# Restaurants Backend API

Backend de referencia para el proyecto E4. Construido con NestJS, Prisma y PostgreSQL siguiendo los contratos y arquitectura definidos en `docs/e4`.

## Scripts principales

- `npm run start:dev`: inicia el servidor en modo watch.
- `npm run build`: compila la app a `dist/`.
- `npm run test`: ejecuta pruebas unitarias.
- `npm run prisma:generate`: regenera el cliente de Prisma.

## Entorno

Configura la variable `DATABASE_URL` en un archivo `.env` en la raíz. Requiere Node.js 20 LTS.
