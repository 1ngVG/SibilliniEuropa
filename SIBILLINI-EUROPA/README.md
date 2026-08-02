# SIBILLINI-EUROPA (MEVN Migration)

Initial implementation scaffold for the WordPress to MEVN migration.

Current priority: zero recurring cost hosting for the public website.

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

## Zero-cost production path (recommended)

Use static generation + GitHub Pages:

1. Build static site: `npm --workspace frontend run generate`
2. Deploy via workflow: `.github/workflows/deploy-pages-free.yml`
3. Configure `www.sibillinieuropa.eu` as custom domain in GitHub Pages

Detailed guide: `docs/zero-cost-hosting.md`.

## Docker local run

From `infra/`:

- `docker compose up --build`

## Cloud Run deployment (optional later phase)

Deployment is automated by GitHub Actions:

- workflow file: `.github/workflows/deploy-cloud-run.yml`

Required GitHub repository secrets:

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`

How it works:

1. Build Docker images for frontend and all backend services.
2. Push images to Artifact Registry (`sibillini-platform`).
3. Deploy backend services (`auth-service`, `content-service`, `media-service`, `schedule-service`).
4. Resolve backend URLs and deploy `api-gateway` with service env vars.
5. Deploy frontend with `NUXT_PUBLIC_API_BASE` set to gateway URL.

See detailed notes in `infra/cloudrun/README.md`.

## First endpoints

- Gateway health: `GET http://localhost:8080/health`
- Auth health: `GET http://localhost:4101/health`
- Content health: `GET http://localhost:4102/health`
- Media health: `GET http://localhost:4103/health`
- Schedule health: `GET http://localhost:4104/health`
