# Cloud Run Deployment

This folder contains deployment guidance for running the platform on Google Cloud Run with Docker images hosted in Artifact Registry.

## Services

- `frontend`
- `api-gateway`
- `auth-service`
- `content-service`
- `media-service`
- `schedule-service`

## Recommended topology

1. Deploy backend services first.
2. Read generated service URLs.
3. Deploy `api-gateway` with backend URLs in env vars.
4. Deploy `frontend` with `NUXT_PUBLIC_API_BASE` pointing to the gateway URL.

## Required GitHub secrets

- `GCP_PROJECT_ID`
- `GCP_REGION` (for example `europe-west1`)
- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`

## Required IAM roles (service account)

- `roles/run.admin`
- `roles/iam.serviceAccountUser`
- `roles/artifactregistry.writer`
- `roles/viewer`

## Artifact Registry

Create one Docker repository, for example:

- repository name: `sibillini-platform`
- location: same as Cloud Run region

## Domain strategy

- Public website domain: `www.sibillinieuropa.eu` -> frontend service
- Optional API custom domain: `api.sibillinieuropa.eu` -> api-gateway service

## Runtime notes

- Cloud Run injects `PORT`; services already listen on that env var where applicable.
- Keep backend services private when possible; expose only gateway and frontend.
