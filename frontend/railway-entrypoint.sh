#!/bin/sh
# Render upstream's nginx template for Railway:
# - listen on $PORT (IPv4 and IPv6 when the container has IPv6),
# - re-resolve the backend's private hostname through the container's DNS
#   server every 10 s, so a redeployed backend (new IP) is found without a restart,
# - serve /healthz for Railway's health check.
set -eu
: "${BACKEND_URL:?BACKEND_URL must be the backend host:port, for example backend.railway.internal:8000}"
PORT="${PORT:-8080}"
T=/etc/nginx/nginx.conf.template
for m in __BACKEND_URL__ __BACKEND_RESOLVER_CONFIG__ __BACKEND_RESOLVE__ 'listen 80;' 'listen 8080;' 'location / {'; do
  grep -q "$m" "$T" || { echo "nginx template changed upstream: '$m' not found" >&2; exit 1; }
done
NS=$(awk '$1 == "nameserver" { print $2; exit }' /etc/resolv.conf)
[ -n "$NS" ] || { echo "no nameserver in /etc/resolv.conf" >&2; exit 1; }
case "$NS" in *:*) NS="[$NS]" ;; esac
if [ -s /proc/net/if_inet6 ]; then LISTEN="listen [::]:$PORT ipv6only=off;"; else LISTEN="listen $PORT;"; fi
ESC_BACKEND=$(printf '%s' "$BACKEND_URL" | sed 's/[\/&|]/\\&/g')
sed -e "s|__BACKEND_URL__|$ESC_BACKEND|g" \
    -e "s|__BACKEND_RESOLVER_CONFIG__|resolver $NS valid=10s;|" \
    -e "s|__BACKEND_RESOLVE__|resolve|" \
    -e "s|listen 80;|$LISTEN|" \
    -e "/listen 8080;/d" \
    -e "s|^\( *\)location / {|\1location = /healthz { access_log off; default_type text/plain; return 200 'ok'; }\n\1location / {|" \
    "$T" > /tmp/nginx.conf
echo "nginx: port $PORT, backend $BACKEND_URL, resolver $NS"
nginx -q -t -c /tmp/nginx.conf
exec "$@"
