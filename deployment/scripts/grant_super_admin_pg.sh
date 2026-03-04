#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <email>" >&2
  exit 1
fi

EMAIL="$1"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
. "${SCRIPT_DIR}/_pg_common.sh"

EMAIL_ESCAPED="$(sql_escape "${EMAIL}")"

SQL="
INSERT INTO authentication (user_id, type, created_at, updated_at, created_by, updated_by)
SELECT u.user_id, 'LOCAL', NOW(), NOW(), 'DEPLOY_SCRIPT', 'DEPLOY_SCRIPT'
FROM user_entity u
WHERE u.email = '${EMAIL_ESCAPED}'
  AND NOT EXISTS (
    SELECT 1
    FROM authentication a
    WHERE a.user_id = u.user_id
  );

INSERT INTO authentication_roles (authentication_user_id, roles)
SELECT u.user_id, 'SUPER_ADMIN'
FROM user_entity u
WHERE u.email = '${EMAIL_ESCAPED}'
  AND NOT EXISTS (
    SELECT 1
    FROM authentication_roles ar
    WHERE ar.authentication_user_id = u.user_id
      AND ar.roles = 'SUPER_ADMIN'
  );
"

psql_exec "${SQL}"
echo "Done. SUPER_ADMIN granted if user exists: ${EMAIL}"
