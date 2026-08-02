# API Contracts (Draft)

## Gateway

- `GET /health`
- `ANY /api/auth/*` -> `auth-service`
- `ANY /api/content/*` -> `content-service`
- `ANY /api/media/*` -> `media-service`
- `ANY /api/schedule/*` -> `schedule-service`

## Auth service

- `GET /health`
- `POST /auth/session`

## Content service

- `GET /health`
- `GET /content/sections`
- `POST /content/sections`
- `GET /content/articles`
- `POST /content/articles`

## Media service

- `GET /health`
- `GET /media/assets`
- `POST /media/assets`

## Schedule service

- `GET /health`
- `GET /schedule/events`
- `POST /schedule/events`
