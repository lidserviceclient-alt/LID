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
DELETE FROM authentication_roles
WHERE roles = 0
  AND authentication_user_id IN (
    SELECT user_id FROM user_entity WHERE email = '${EMAIL}'
  );
SQL
)

java -cp "$H2_JAR" org.h2.tools.Shell \
  -url "$URL" \
  -user "$USER" \
  -password "$PASS" \
  -sql "$SQL"

echo "Done. ADMIN role revoked if the email existed."
