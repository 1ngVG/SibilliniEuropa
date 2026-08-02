# Migration Plan (Draft)

1. Export WordPress data (posts/pages/media links).
2. Normalize and map data to new content model.
3. Bulk import content into Firestore collections.
4. Migrate media files to Cloud Storage buckets.
5. Build redirect map from old WP URLs to new Nuxt routes.
6. Validate SEO metadata and sitemap before cutover.
