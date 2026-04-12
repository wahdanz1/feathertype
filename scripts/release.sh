#!/usr/bin/env bash
set -euo pipefail

# Usage: pnpm release <version>
# Example: pnpm release 1.2.0

VERSION="$1"

if [[ -z "$VERSION" ]]; then
  echo "Usage: pnpm release <version>"
  echo "Example: pnpm release 1.2.0"
  exit 1
fi

# Validate semver format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be semver (e.g., 1.2.0)"
  exit 1
fi

# Check for clean working tree
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: Working tree is not clean. Commit or stash changes first."
  exit 1
fi

# Check RELEASE_NOTES.md exists and isn't empty
if [[ ! -s "RELEASE_NOTES.md" ]]; then
  echo "Error: RELEASE_NOTES.md is empty or missing. Write your release notes first."
  exit 1
fi

echo "Releasing v${VERSION}..."

# Bump version in all four places
# 1. package.json
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"${VERSION}\"/" package.json

# 2. src-tauri/tauri.conf.json
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"${VERSION}\"/" src-tauri/tauri.conf.json

# 3. src-tauri/Cargo.toml (only the package version, not dependency versions)
sed -i "0,/^version = \"[^\"]*\"/s//version = \"${VERSION}\"/" src-tauri/Cargo.toml

# 4. src/config.ts
sed -i "s/APP_VERSION = '[^']*'/APP_VERSION = '${VERSION}'/" src/config.ts

# Update Cargo.lock
(cd src-tauri && cargo generate-lockfile 2>/dev/null || true)

echo "Version bumped to ${VERSION} in:"
echo "  - package.json"
echo "  - src-tauri/tauri.conf.json"
echo "  - src-tauri/Cargo.toml"
echo "  - src/config.ts"

# Commit, tag, push
git add -A
git commit -m "release: v${VERSION}"
git tag -a "v${VERSION}" -m "v${VERSION}"
git push && git push --tags

echo ""
echo "Done! v${VERSION} tagged and pushed."
echo "GitHub Actions will now build and publish the release."
