#!/usr/bin/env sh
set -eu

REPLICAS="${REPLICAS:-2}"
COMPOSE="${COMPOSE:-docker compose}"
ENV_FILE="${ENV_FILE:-.env}"

compose() {
  # COMPOSE intentionally supports values like "docker compose".
  # shellcheck disable=SC2086
  $COMPOSE --env-file "${ENV_FILE}" "$@"
}

app_compose() {
  compose -f docker-compose.yml "$@"
}

app_observability_compose() {
  compose -f docker-compose.yml -f docker-compose.observability.yml "$@"
}

observability_compose() {
  compose -f observability/docker-compose.yml "$@"
}

require_env_value() {
  key="$1"
  value="$(grep -E "^${key}=" "${ENV_FILE}" 2>/dev/null | tail -n 1 | cut -d '=' -f 2- || true)"
  if [ -z "${value}" ]; then
    echo "Missing ${key} in ${ENV_FILE}" >&2
    exit 1
  fi
}

usage() {
  cat <<'EOF'
Usage: ./scripts/deployment/compose-control.sh <command>

Commands:
  pull                         Pull LID API image
  pull-observability            Pull observability images and LID API image
  up                           Start LID API without observability
  up-observability              Start observability, then LID API with observability wiring
  stop                         Stop LID API stack without removing containers
  stop-observability            Stop LID API observability stack and observability services
  down                         Stop/remove LID API stack
  down-volumes                  Stop/remove LID API stack and volumes
  down-observability            Stop/remove LID API observability stack and observability services
  down-observability-volumes    Stop/remove LID API observability stack, observability services and volumes
  ps                           Show LID API stack status
  ps-observability              Show LID API and observability stack status
EOF
}

case "${1:-}" in
  pull)
    app_compose pull lid-api
    ;;
  pull-observability)
    observability_compose pull
    app_observability_compose pull lid-api
    ;;
  up)
    require_env_value DOMAIN
    app_compose pull lid-api
    app_compose up -d --pull always --force-recreate --scale "lid-api=${REPLICAS}" lid-api
    ;;
  up-observability)
    require_env_value DOMAIN
    observability_compose up -d --pull always
    app_observability_compose up -d --pull always --force-recreate --scale "lid-api=${REPLICAS}" lid-api
    ;;
  stop)
    app_compose stop
    ;;
  stop-observability)
    app_observability_compose stop || true
    observability_compose stop || true
    ;;
  down)
    app_compose down --remove-orphans
    ;;
  down-volumes)
    app_compose down -v --remove-orphans
    ;;
  down-observability)
    app_observability_compose down --remove-orphans || true
    observability_compose down --remove-orphans || true
    ;;
  down-observability-volumes)
    app_observability_compose down -v --remove-orphans || true
    observability_compose down -v --remove-orphans || true
    ;;
  ps)
    app_compose ps
    ;;
  ps-observability)
    app_observability_compose ps
    observability_compose ps
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    usage
    exit 64
    ;;
esac
