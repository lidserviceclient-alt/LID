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

: "${POSTGRES_USER:?POSTGRES_USER is required (deployment/.env)}"
: "${POSTGRES_DB:?POSTGRES_DB is required (deployment/.env)}"

DB_CONTAINER="${DB_CONTAINER:-lid-db}"

psql_exec() {
  local sql="$1"
  docker exec -i "${DB_CONTAINER}" \
    psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "${sql}"
}

sql_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}
