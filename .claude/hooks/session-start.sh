#!/bin/bash
# Prepares a Claude Code cloud session: Mill, the Scala dependencies and the
# npm packages, so `./mill __.testForked` and `pnpm build` work immediately.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# repo1.maven.org rate-limits the cloud proxy (HTTP 429); Google's mirror of
# Maven Central does not. Coursier tries the repositories in order.
MIRROR="https://maven-central.storage-download.googleapis.com/maven2"
export COURSIER_REPOSITORIES="$MIRROR|central"

# The native Mill launcher ignores JAVA_TOOL_OPTIONS and so cannot trust the
# proxy CA; the JVM launcher can. It is pre-seeded from the mirror because the
# launcher script hardcodes repo1.
MILL_RELEASE="$(sed -n "s#^//| *mill-version: *##p" build.mill | head -n 1)"
export MILL_VERSION="${MILL_RELEASE}-jvm"
MILL_BIN="$HOME/.cache/mill/download/${MILL_RELEASE}"
if [ ! -s "$MILL_BIN" ]; then
  mkdir -p "$(dirname "$MILL_BIN")"
  curl -fsSL -o "$MILL_BIN.tmp" \
    "$MIRROR/com/lihaoyi/mill-dist/${MILL_RELEASE}/mill-dist-${MILL_RELEASE}.exe"
  chmod +x "$MILL_BIN.tmp"
  mv "$MILL_BIN.tmp" "$MILL_BIN"
fi

if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  {
    echo "export COURSIER_REPOSITORIES=\"$COURSIER_REPOSITORIES\""
    echo "export MILL_VERSION=\"$MILL_VERSION\""
  } >> "$CLAUDE_ENV_FILE"
fi

# Fetch every Scala dependency (and the Scala.js linker) so the cached
# container starts warm.
./mill --no-daemon __.compile

pnpm install
