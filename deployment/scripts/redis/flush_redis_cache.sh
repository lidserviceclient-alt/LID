#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${DEPLOY_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck source=/dev/null
  . "${ENV_FILE}"
  set +a
fi

REDIS_CONTAINER="${REDIS_CONTAINER:-lid-redis}"
REDIS_HOST="${REDIS_HOST:-${SPRING_DATA_REDIS_HOST:-127.0.0.1}}"
REDIS_PORT="${REDIS_PORT:-${SPRING_DATA_REDIS_PORT:-6379}}"
REDIS_DB="${REDIS_DB:-0}"
REDIS_PASSWORD="${REDIS_PASSWORD:-${SPRING_DATA_REDIS_PASSWORD:-}}"

run_redis_cli() {
  if [[ -n "${REDIS_PASSWORD}" ]]; then
    redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" -a "${REDIS_PASSWORD}" -n "${REDIS_DB}" "$@"
  else
    redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" -n "${REDIS_DB}" "$@"
  fi
}

if docker ps --format '{{.Names}}' | grep -qx "${REDIS_CONTAINER}"; then
  echo "Flushing Redis cache via container ${REDIS_CONTAINER}..."
  docker exec -i "${REDIS_CONTAINER}" redis-cli FLUSHALL ASYNC >/dev/null
  echo "Done. Redis cache cleared (FLUSHALL ASYNC)."
  exit 0
fi

if command -v redis-cli >/dev/null 2>&1; then
  echo "Flushing Redis cache via redis-cli (${REDIS_HOST}:${REDIS_PORT}, db=${REDIS_DB})..."
  run_redis_cli FLUSHALL ASYNC >/dev/null
  echo "Done. Redis cache cleared (FLUSHALL ASYNC)."
  exit 0
fi

echo "Unable to flush Redis cache: no running container '${REDIS_CONTAINER}' and redis-cli not found." >&2
exit 1
