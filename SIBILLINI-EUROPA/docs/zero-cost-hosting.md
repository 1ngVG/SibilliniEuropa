# Zero-cost Hosting Plan

## Goal

Publish the public website with no recurring hosting costs.

## Recommended stack

1. Nuxt static output (`npm run generate`)
2. GitHub Pages for hosting
3. Existing domain connected via DNS records

## Activation checklist

1. Push repository changes to `main`.
2. Open repository settings on GitHub.
3. In `Pages`, set source to `GitHub Actions`.
4. Run workflow `Deploy Frontend to GitHub Pages (Free)`.
5. Wait for deployment URL.

## Custom domain

1. In GitHub Pages settings, add custom domain `www.sibillinieuropa.eu`.
2. In DNS provider, point domain to GitHub Pages.
3. Keep `Enforce HTTPS` enabled.

## Operational model

- Content updates happen through repository edits and commits.
- No runtime backend required for public pages.
- Media files are versioned in the repository (or Git LFS if needed).

## Limits

- No live CMS with complex roles.
- No live API CRUD in production.
- Dynamic features require a future backend phase.
