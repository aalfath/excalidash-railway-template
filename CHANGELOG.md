# Changelog

All changes to this Railway template. Breaking changes are listed first in each entry.

## 0.7.0 (2026-11-23)

First release of this template.

* ExcaliDash 0.7.0: `zimengxiong/excalidash-backend:0.7.0@sha256:f0160bc2b28d24e8ec4ab8d07eeaea357e4c524e983b1fbf6f712503ca5fe17f` and `zimengxiong/excalidash-frontend:0.7.0@sha256:c528f96807a20d865f15a99938833a49a0611ed0fd9913c571b8a5303b420641`.
* Railway PostgreSQL for all data; backend waits for the database, runs migrations and creates the first administrator from `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
* Frontend listens on `PORT`, re-resolves the backend's private domain every 10 s and serves `/healthz`.
