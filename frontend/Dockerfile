# ExcaliDash frontend (web app + nginx proxy to the backend) for Railway.
# Upstream image pinned by version and digest: https://hub.docker.com/r/zimengxiong/excalidash-frontend
FROM zimengxiong/excalidash-frontend:0.7.0@sha256:c528f96807a20d865f15a99938833a49a0611ed0fd9913c571b8a5303b420641

COPY --chmod=0555 railway-entrypoint.sh /railway-entrypoint.sh
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["/railway-entrypoint.sh"]
CMD ["nginx", "-c", "/tmp/nginx.conf", "-g", "daemon off;"]
