# Architecture (MVP)

## Overview

- Frontend: Nuxt 3 (public website + admin shell later)
- Backend: Node.js microservices with REST APIs
- Gateway: single entrypoint for frontend/admin clients
- Data phase target: Firestore for content metadata, Cloud Storage for media
- Deployment target: Docker images on Cloud Run (managed, autoscaling)

## Runtime platform

- Build: Docker per service
- Registry: Artifact Registry (`sibillini-platform`)
- Runtime: Cloud Run services (one per component)
- CI/CD: GitHub Actions via Workload Identity Federation

Public exposure recommendation:

- Public: `frontend`, `api-gateway`
- Internal-by-policy later: domain services (`auth-service`, `content-service`, `media-service`, `schedule-service`)

## Services

- `api-gateway`:
  - Exposes `/api/*`
  - Forwards requests to domain services
- `auth-service`:
  - Google Workspace authentication integration (stub in MVP)
  - Role model: `admin`, `editor`
- `content-service`:
  - Sections/pages/articles CRUD
- `media-service`:
  - Media metadata and upload flow orchestration
- `schedule-service`:
  - Program and event CRUD

## Next implementation steps

1. Add JWT verification at gateway level.
2. Replace in-memory collections with Firestore repositories.
3. Add signed upload URL flow for Cloud Storage.
4. Add API validation (zod) and OpenAPI contracts.
5. Restrict backend service ingress and service-to-service IAM.
