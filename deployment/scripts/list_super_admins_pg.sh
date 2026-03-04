#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
. "${SCRIPT_DIR}/_pg_common.sh"

SQL="
SELECT u.user_id, u.email
FROM user_entity u
JOIN authentication_roles ar
  ON ar.authentication_user_id = u.user_id
WHERE ar.roles = 'SUPER_ADMIN'
ORDER BY u.email;
"

psql_exec "${SQL}"
