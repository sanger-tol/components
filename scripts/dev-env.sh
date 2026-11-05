#!/bin/sh
# SPDX-FileCopyrightText: 2026 Genome Research Ltd.
#
# SPDX-License-Identifier: MIT

set -eu

cd "$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

if ! command -v ksm >/dev/null 2>&1; then
    printf '%s\n' 'Keeper Secrets Manager CLI (ksm) is required. See README.md for setup.' >&2
    exit 1
fi

umask 077
temp_dir=$(mktemp -d .keeper-env.XXXXXX)
cleanup() {
    rm -f "$temp_dir/.env.dev" "$temp_dir/.env.tmp" "$temp_dir/..env.dev.ksm-secret"
    rmdir "$temp_dir"
}
trap cleanup EXIT
trap 'exit 1' HUP INT TERM

# Keeper can write its output before reporting validation errors.
ksm interpolate .env.dev.template --output-file "$temp_dir/.env.dev" --validate
chmod 600 "$temp_dir/.env.dev"
mv -f "$temp_dir/.env.dev" .env.dev
printf '%s\n' 'Generated .env.dev from Keeper. Treat this file as a secret; do not commit it.'
