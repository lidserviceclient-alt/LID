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
DELETE FROM authentication_roles ar
USING user_entity u
WHERE ar.authentication_user_id = u.user_id
  AND ar.roles = 'SUPER_ADMIN'
  AND u.email = '${EMAIL_ESCAPED}';
"

psql_exec "${SQL}"
echo "Done. SUPER_ADMIN revoked if user exists: ${EMAIL}"
