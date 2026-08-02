# Content Model (Draft)

## Section

- `id`
- `slug`
- `title`
- `body`
- `status` (`draft|published`)
- `updatedAt`

## Article

- `id`
- `slug`
- `title`
- `excerpt`
- `body`
- `coverAssetId`
- `tags[]`
- `status`
- `publishedAt`
- `updatedAt`

## Media asset

- `id`
- `fileName`
- `contentType`
- `storagePath`
- `publicUrl`
- `variants[]`
- `createdAt`

## Event

- `id`
- `day`
- `startTime`
- `endTime`
- `title`
- `description`
- `location`
- `updatedAt`
