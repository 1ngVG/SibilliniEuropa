# SIBILLINI-EUROPA (MEVN Migration)

Initial implementation scaffold for the WordPress to MEVN migration.

## Monorepo layout

- `frontend/`: Nuxt 3 public website (Vue)
- `backend/api-gateway/`: single REST entrypoint for frontend/admin
- `backend/auth-service/`: admin authentication and role checks
- `backend/content-service/`: pages/sections/articles CRUD
- `backend/media-service/`: media metadata and upload orchestration
- `backend/schedule-service/`: program and event management
- `infra/`: local/container infrastructure definitions
- `docs/`: architecture, API contracts, and migration notes

## Quick start

1. Install dependencies from monorepo root:
   - `npm install`
2. Start backend only:
   - `npm run dev:backend`
3. Start full stack (frontend + backend):
   - `npm run dev`

## First endpoints

- Gateway health: `GET http://localhost:8080/health`
- Auth health: `GET http://localhost:4101/health`
- Content health: `GET http://localhost:4102/health`
- Media health: `GET http://localhost:4103/health`
- Schedule health: `GET http://localhost:4104/health`
