#!/usr/bin/env bash
# Deploy (or roll back to) a Presmistique API image tag on the VPS.
#
#   ./deploy.sh sha-1a2b3c4      deploy that tag; roll back automatically if unhealthy
#   ./deploy.sh                  re-deploy the tag currently in .env
#
# The image repository comes from $API_IMAGE (set by the workflow) or the
# existing .env. Called by .github/workflows/deploy-backend.yml after it logs
# in to ghcr.io.
set -euo pipefail
cd "$(dirname "$0")"

HEALTH_URL="http://127.0.0.1:5000/health"
env_value() { sed -n "s/^$1=//p" .env 2>/dev/null || true; }

API_IMAGE="${API_IMAGE:-$(env_value API_IMAGE)}"
if [ -z "$API_IMAGE" ]; then
  echo "API_IMAGE is not set (pass it in the environment or put it in .env)" >&2
  exit 2
fi

PREV_TAG="$(env_value IMAGE_TAG)"
NEW_TAG="${1:-$PREV_TAG}"
if [ -z "$NEW_TAG" ]; then
  echo "Usage: $0 <image-tag>" >&2
  exit 2
fi

wait_healthy() {
  for _ in $(seq 1 45); do
    if curl -fsS -m 3 "$HEALTH_URL" >/dev/null 2>&1; then return 0; fi
    sleep 2
  done
  return 1
}

set_tag() { printf 'API_IMAGE=%s\nIMAGE_TAG=%s\n' "$API_IMAGE" "$1" > .env; }

echo "==> Deploying $NEW_TAG (previous: ${PREV_TAG:-none})"
mkdir -p data/uploads data/logs
chown -R 1000:1000 data

set_tag "$NEW_TAG"
docker compose pull api
docker compose up -d --remove-orphans api

if wait_healthy; then
  echo "==> Healthy on $NEW_TAG"
else
  echo "!! $NEW_TAG failed its health check. Last logs:" >&2
  docker compose logs --tail 60 api >&2 || true
  if [ -n "$PREV_TAG" ] && [ "$PREV_TAG" != "$NEW_TAG" ]; then
    echo "==> Rolling back to $PREV_TAG" >&2
    set_tag "$PREV_TAG"
    docker compose up -d api
    wait_healthy && echo "==> Rolled back to $PREV_TAG" >&2
  fi
  exit 1
fi

# Keep the current and previous images for instant rollback; remove older ones.
# Cleanup must never fail a deploy that is already healthy (grep exits 1 when
# there is nothing to remove, which pipefail would otherwise turn into a failure).
old_tags="$(docker images "$API_IMAGE" --format '{{.Tag}}' \
  | grep -v -x -e "$NEW_TAG" -e "${PREV_TAG:-__none__}" -e '<none>' || true)"
for tag in $old_tags; do
  docker rmi "$API_IMAGE:$tag" >/dev/null 2>&1 || true
done
docker image prune -f --filter "label=org.opencontainers.image.title=presmistique-api" >/dev/null 2>&1 || true

echo "==> Done"
