#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <email>" >&2
  exit 1
fi

EMAIL="$1"

H2_DIR="$HOME/.m2/repository/com/h2database/h2"
if [[ ! -d "$H2_DIR" ]]; then
  echo "H2 not found in $H2_DIR. Run mvn package once." >&2
  exit 1
fi

H2_VERSION="$(ls -1 "$H2_DIR" | sort -V | tail -n 1)"
H2_JAR="$H2_DIR/$H2_VERSION/h2-$H2_VERSION.jar"

if [[ ! -f "$H2_JAR" ]]; then
  echo "H2 jar not found: $H2_JAR" >&2
  exit 1
fi

URL="jdbc:h2:tcp://localhost/mem:testdb"
USER="sa"
PASS="password"

SQL=$(cat <<SQL
-- Ensure authentication row exists for the user
MERGE INTO authentication (user_id, type, created_at)
KEY (user_id)
SELECT user_id, 0, CURRENT_TIMESTAMP
FROM user_entity
WHERE email = '${EMAIL}';

-- Ensure ADMIN role (ordinal 0) is present
INSERT INTO authentication_roles (authentication_user_id, roles)
SELECT user_id, 0
FROM user_entity
WHERE email = '${EMAIL}'
  AND NOT EXISTS (
    SELECT 1 FROM authentication_roles ar
    WHERE ar.authentication_user_id = user_entity.user_id
      AND ar.roles = 0
  );
SQL
)

java -cp "$H2_JAR" org.h2.tools.Shell \
  -url "$URL" \
  -user "$USER" \
  -password "$PASS" \
  -sql "$SQL"

echo "Done. If the email exists, ADMIN role is now assigned."
