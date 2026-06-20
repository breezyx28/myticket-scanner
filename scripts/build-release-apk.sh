#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION="$(node -p "require('./package.json').version")"
APP_NAME="$(node -p "require('./package.json').name")"
RELEASES_DIR="$ROOT/releases"
APK_OUT="$ROOT/android/app/build/outputs/apk/release/app-release.apk"

npm run build
npx cap sync android

if [[ -f "$ROOT/assets/icon-only.png" ]]; then
  npx capacitor-assets generate --android
fi

if [[ ! -f "$ROOT/android/keystore.properties" ]]; then
  echo "Missing android/keystore.properties — copy keystore.properties.example and add your release keystore."
  exit 1
fi

cd "$ROOT/android"
./gradlew assembleRelease
cd "$ROOT"

mkdir -p "$RELEASES_DIR"
cp "$APK_OUT" "$RELEASES_DIR/scanner-${VERSION}.apk"
cp "$APK_OUT" "$RELEASES_DIR/scanner-latest.apk"

if [[ -f "$ROOT/resources/icon-512.png" ]]; then
  cp "$ROOT/resources/icon-512.png" "$RELEASES_DIR/icon-512.png"
elif [[ -f "$ROOT/assets/icon-only.png" ]]; then
  cp "$ROOT/assets/icon-only.png" "$RELEASES_DIR/icon-512.png"
fi

if command -v sha256sum >/dev/null 2>&1; then
  SHA256="$(sha256sum "$RELEASES_DIR/scanner-latest.apk" | awk '{print $1}')"
else
  SHA256="$(shasum -a 256 "$RELEASES_DIR/scanner-latest.apk" | awk '{print $1}')"
fi

RELEASED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

cat > "$RELEASES_DIR/manifest.json" <<EOF
{
  "name": "MyTicket Scanner",
  "nameAr": "ماسح MyTicket",
  "packageId": "com.myticket.scanner",
  "version": "${VERSION}",
  "sha256": "${SHA256}",
  "url": "./scanner-latest.apk",
  "icon": "./icon-512.png",
  "releasedAt": "${RELEASED_AT}"
}
EOF

echo "Built $RELEASES_DIR/scanner-latest.apk (v${VERSION}, sha256: $SHA256)"
