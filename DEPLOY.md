# Deployment

TraceForge v0.1 is a static PWA: no build command and no server-side secrets are required.

## Vercel

Create a project from this folder/repository and deploy the root directory. `vercel.json` supplies basic response headers.

## GitHub Pages / any static host

Serve the repository root over HTTPS. The service worker only handles same-origin static assets.

## Important

Do not put API secrets in `app.js` or browser storage. HIBP and other key-bearing providers should be added later through a server-side proxy/function.
