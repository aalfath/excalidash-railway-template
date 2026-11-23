[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/excalidash-1?utm_medium=integration&utm_source=button&utm_campaign=excalidash)

# Deploy and Host ExcaliDash on Railway

ExcaliDash is a self-hosted dashboard for Excalidraw, the hand-drawn style whiteboard. It saves your drawings on your own server, organises them into collections, keeps version history, and lets several people edit the same drawing live. It supports local accounts, sharing links, API keys and optional OpenID Connect sign-in.

## About Hosting ExcaliDash

This template deploys ExcaliDash 0.7.0 as three services: the web app, its backend and a Railway PostgreSQL database. The web app is the only public service; it serves the interface and passes API and live-collaboration traffic to the backend over Railway's private network. Drawings, embedded images, users and history are stored in PostgreSQL. On the first boot the backend runs its database migrations and creates your administrator account, so nobody else can claim the instance. After deploy, open the public URL and sign in with the email and password in the `excalidash-backend` service's variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).

## Common Use Cases

* A private library of architecture sketches, diagrams and whiteboard notes
* Live collaborative drawing sessions for a team, with view or edit sharing links
* Keeping drawing history and restoring earlier versions

## Dependencies for ExcaliDash Hosting

* PostgreSQL (Railway's own Postgres service, included)
* Two app services built from this repository: `excalidash` (web) and `excalidash-backend` (API)

### Deployment Dependencies

* ExcaliDash source and docs: https://github.com/ZimengXiong/ExcaliDash
* Release used: https://github.com/ZimengXiong/ExcaliDash/releases/tag/v0.7.0
* Upstream images: https://hub.docker.com/r/zimengxiong/excalidash-backend and https://hub.docker.com/r/zimengxiong/excalidash-frontend

### Implementation Details

Services:

* `excalidash`: the web app (upstream frontend image with nginx). Public domain, listens on `PORT` 8080, health check `/healthz`. It finds the backend through `BACKEND_URL` (a reference to the backend's private domain) and re-resolves it every 10 seconds, so a backend redeploy needs no frontend restart.
* `excalidash-backend`: the API and Socket.IO collaboration server, private only, health check `/health`. It waits for PostgreSQL, applies migrations, creates the first administrator, then starts.
* `Postgres`: all data, on its own Railway volume.

Variables you may want to look at (all set for you):

* `ADMIN_EMAIL` (default `admin@excalidash.local`) and `ADMIN_PASSWORD` (generated, 24 characters): the first administrator. They are used once, on the first boot with an empty database; later changes have no effect. Change your email and password in the app's Profile page.
* `JWT_SECRET`, `CSRF_SECRET`, `API_KEY_HASH_PEPPER`: generated per deployment. Don't change `API_KEY_HASH_PEPPER` after creating API keys.
* `FRONTEND_URL`: the public web address, used for CORS, cookies and HTTPS redirects. If you add a custom domain, set it to `https://YOUR-DOMAIN` on the backend.

Optional features are off: email and password reset (`MAIL_TRANSPORT`, `SMTP_*`), OpenID Connect (`AUTH_MODE=hybrid`, `OIDC_*`) and S3 image storage (`S3_*`). Add those variables to `excalidash-backend` to turn them on; see the upstream environment reference. Self-registration is off; invite users from Admin, or allow registration there.

Resources: each service ran within 0.5 GB RAM and 1 vCPU in our tests (the backend's Node heap is capped at 320 MB), so it fits Railway's Free and Trial plans.

Updates: every service builds from this GitHub repository, which pins the upstream images by version and digest. When we publish a new ExcaliDash version here, Railway shows an update notice in your project; read `CHANGELOG.md` and back up the Postgres volume before you apply it.

## Why Deploy ExcaliDash on Railway?

<!-- Recommended: Keep this section as shown below -->
Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying ExcaliDash on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
<!-- End recommended section -->
