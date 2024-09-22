#!/usr/bin/env sh
set -o errexit -o nounset

cd "$(dirname "$0")/.."

TARGET_DIR="target"

mkdir -p "$TARGET_DIR"

# zip "${TARGET_DIR}/gaudio-firefox.zip" * --exclude ".git" --exclude ".gitignore" --exclude "bin/*" --exclude "${TARGET_DIR}"
zip -r "${TARGET_DIR}/gaudio-firefox.zip" . --include "*.js" "*.png" "*.html" "*.json"

