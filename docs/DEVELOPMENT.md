# Development

## Install

Run `npm ci` to install the pinned dependencies.

## Build

Run `npm start` for the webpack development server or `npm run build` for a production build in `dist/`.

## Deploy

Push to `main` to run the GitHub Actions deployment workflow. The workflow builds, validates, and publishes `dist/`.

## GitHub Pages

Production builds use `.env.production` and generate URLs for `https://kingchun1991.github.io/outlook-group-mail-classifier`.

## Manifest Generation

`manifest.template.xml` is the source of truth. Webpack replaces `{{BASE_URL}}` using the environment file selected by the build mode and writes `dist/manifest.xml`.

## Common Problems

- Run `npm run validate` after a build to check required files and production URLs.
- Use `npm run build -- --mode development` when testing a localhost manifest.
- If Outlook rejects the add-in, verify that the manifest URL matches the host where `dist/` is served.
