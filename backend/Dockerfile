# ExcaliDash backend (API, Socket.IO collaboration, Prisma migrations) for Railway.
# Upstream image pinned by version and digest: https://hub.docker.com/r/zimengxiong/excalidash-backend
FROM zimengxiong/excalidash-backend:0.7.0@sha256:f0160bc2b28d24e8ec4ab8d07eeaea357e4c524e983b1fbf6f712503ca5fe17f

USER root
COPY --chown=nodejs:nodejs --chmod=0444 railway-wait-db.cjs railway-bootstrap.cjs /app/
# Hook two steps into the upstream entrypoint: wait for Postgres before the
# migrations, and create the first admin after them. The build fails if
# upstream moves either marker.
RUN set -eu; E=/app/docker-entrypoint.sh; \
    grep -q '^# 3. Run Migrations' $E; grep -q '^# 4. Start Application' $E; \
    awk '/^# 3. Run Migrations/ { print "[ -s /proc/net/if_inet6 ] || export BACKEND_HOST=0.0.0.0"; print "run_as_app_user node /app/railway-wait-db.cjs"; print "" } \
         /^# 4. Start Application/ { print "run_as_app_user node /app/railway-bootstrap.cjs"; print "" } { print }' $E > /tmp/e.sh; \
    grep -q '^run_as_app_user node /app/railway-bootstrap.cjs' /tmp/e.sh; \
    cat /tmp/e.sh > $E; rm /tmp/e.sh
USER nodejs

# Fixed settings for this template (the deployer doesn't need to touch them).
# BACKEND_HOST=:: listens on Railway's IPv6/IPv4 private network.
# TRUST_PROXY=2: Railway's edge plus the frontend's nginx.
ENV NODE_ENV=production \
    PORT=8000 \
    BACKEND_HOST=:: \
    DATABASE_PROVIDER=postgresql \
    AUTH_MODE=local \
    TRUST_PROXY=2 \
    UPDATE_CHECK_OUTBOUND=false \
    NODE_OPTIONS=--max-old-space-size=320

EXPOSE 8000
ENTRYPOINT ["./docker-entrypoint.sh"]
