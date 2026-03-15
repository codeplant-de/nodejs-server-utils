#!/usr/bin/env bash
# PostToolUse hook: auto-format and lint files after Edit/Write

set -euo pipefail

# Read stdin JSON and extract the file path
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Skip if no file path or file doesn't exist
if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Only process TypeScript/JavaScript files
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs) ;;
  *) exit 0 ;;
esac

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"

# Run prettier (using locally installed version)
"$PROJECT_DIR/node_modules/.bin/prettier" --write "$FILE_PATH" 2>/dev/null || true

# Run eslint with auto-fix (using locally installed version)
"$PROJECT_DIR/node_modules/.bin/eslint" --fix "$FILE_PATH" 2>/dev/null || true

exit 0
