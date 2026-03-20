#!/usr/bin/env bash
# build-release.sh — Signed Android AAB for Play Store (local build, no EAS cloud)
#
# Usage: bash scripts/build-release.sh
#
# Prerequisites:
#   1. mobile/.env.signing exists with valid credentials
#      (copy from .env.signing.example and fill in values)
#   2. mobile/@lucasxf__learnimo.jks exists
#      (download via: eas credentials --platform android)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ANDROID_DIR="$MOBILE_DIR/android"
KEYSTORE_SRC="$MOBILE_DIR/@lucasxf__learnimo.jks"
ENV_FILE="$MOBILE_DIR/.env.signing"

echo "=== learnimo Android release build ==="
echo ""

# ── 1. Load signing credentials ──────────────────────────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found."
  echo ""
  echo "  1. Copy the template:  cp mobile/.env.signing.example mobile/.env.signing"
  echo "  2. Fill in credentials: eas credentials --platform android"
  echo "     → select 'Keystore' → 'Download existing keystore'"
  echo "     The CLI prints the alias + passwords."
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

# Validate all four vars are set and non-empty
for var in ANDROID_KEYSTORE_PATH ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_ALIAS ANDROID_KEY_PASSWORD; do
  if [[ -z "${!var:-}" ]]; then
    echo "ERROR: $var is not set in $ENV_FILE"
    exit 1
  fi
done

echo "[1/7] Signing credentials loaded from .env.signing"

# ── 2. Verify keystore source file ───────────────────────────────────────────
if [[ ! -f "$KEYSTORE_SRC" ]]; then
  echo "ERROR: Keystore not found at $KEYSTORE_SRC"
  echo ""
  echo "  Download it: eas credentials --platform android"
  echo "  → select 'Keystore' → 'Download existing keystore'"
  exit 1
fi

echo "[2/7] Keystore source verified: @lucasxf__learnimo.jks"

# ── 3. Auto-bump versionCode and version in app.json (BEFORE prebuild) ───────
# app.json is the source of truth — prebuild reads it to generate build.gradle.
# Bumping here ensures the correct values survive every prebuild --clean.
APP_JSON="$MOBILE_DIR/app.json"

OLD_VC=$(grep -oP '"versionCode":\s*\K[0-9]+' "$APP_JSON")
NEW_VC=$((OLD_VC + 1))
sed -i "s/\"versionCode\": $OLD_VC/\"versionCode\": $NEW_VC/" "$APP_JSON"

OLD_VN=$(grep -oP '"version":\s*"\K[^"]+' "$APP_JSON" | head -1)
IFS='.' read -r VN_MAJOR VN_MINOR VN_PATCH <<< "$OLD_VN"
NEW_PATCH=$((VN_PATCH + 1))
NEW_VN="$VN_MAJOR.$VN_MINOR.$NEW_PATCH"
sed -i "s/\"version\": \"$OLD_VN\"/\"version\": \"$NEW_VN\"/" "$APP_JSON"

echo "[3/7] Version bumped in app.json: versionCode $OLD_VC → $NEW_VC | version $OLD_VN → $NEW_VN"

# ── 4. Expo prebuild (wipes android/, then regenerates with config plugins) ──
# Pre-delete android/ using bash rm -rf before expo prebuild --clean.
# expo's built-in delete uses Node fs.rm which throws EBUSY on Windows when
# any terminal has android/ as its CWD. bash rm -rf gives a clearer error.
cd "$MOBILE_DIR"

# Stop any lingering Gradle daemons — they hold file handles inside android/build/
# and android/app/.cxx/ that cause EBUSY when rm -rf tries to delete the directory.
if command -v taskkill &>/dev/null; then
  taskkill //F //IM java.exe &>/dev/null || true
fi

if [[ -d "$ANDROID_DIR" ]]; then
  rm -rf "$ANDROID_DIR" 2>/dev/null || {
    echo ""
    echo "ERROR: Cannot delete android/ — a process has it locked (EBUSY)."
    echo ""
    echo "  Most likely cause: a terminal window with CWD inside mobile/android/"
    echo "  Fix: close or 'cd ~' out of any such terminal, then re-run this script."
    echo ""
    echo "  To find the culprit in PowerShell:"
    echo "    Get-Process mintty | Select-Object Id, MainWindowTitle"
    echo ""
    exit 1
  }
  echo "[4/7] Existing android/ removed"
fi
echo "[4/7] Running expo prebuild --clean ..."
npx expo prebuild --clean --platform android

# ── 5. Copy keystore into android/app/ (must be AFTER prebuild wipes android/) ─
cp "$KEYSTORE_SRC" "$ANDROID_DIR/app/release.keystore"
echo "[5/7] Keystore copied to android/app/release.keystore"

# ── 6. Clear Metro transform cache ───────────────────────────────────────────
# Metro caches Babel-inlined EXPO_PUBLIC_* values. A stale cache from a prior
# build (when env vars were absent) will cause the Google button to stay hidden
# even after .env.production.local is created. Clearing ensures the next Gradle
# build gets a fresh bundle with the current env values baked in.
echo "[6/7] Clearing Metro transform cache ..."
rm -rf "$MOBILE_DIR/node_modules/.cache/metro" 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true

# ── 7. Build ──────────────────────────────────────────────────────────────────
# NODE_ENV=production ensures @expo/env loads .env.production.local.
# Without it, Gradle skips .env.production.local and only reads .env.local/.env.
echo "[7/7] Building signed AAB ..."
export NODE_ENV=production
cd "$ANDROID_DIR"
./gradlew clean
./gradlew bundleRelease

# ── Done ──────────────────────────────────────────────────────────────────────
AAB="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"

if [[ -f "$AAB" ]]; then
  echo ""
  echo "✓ Build complete"
  echo "  versionCode:  $NEW_VC"
  echo "  version:      $NEW_VN"
  echo "  AAB:          $AAB"
  echo ""
  echo "Next step: upload to Play Console or run:"
  echo "  eas submit --platform android --latest"
else
  echo ""
  echo "ERROR: Expected AAB not found at: $AAB"
  exit 1
fi
