#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
. "${SCRIPT_DIR}/_pg_common.sh"

SQL="
ALTER TABLE cart_article
  ADD COLUMN IF NOT EXISTS color VARCHAR(64);

ALTER TABLE cart_article
  ADD COLUMN IF NOT EXISTS size VARCHAR(64);
"

psql_exec "${SQL}"
echo "Done. cart_article now supports color/size variants."
