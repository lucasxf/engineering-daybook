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
# Uses Node.js for JSON manipulation to avoid GNU-specific grep -oP / sed -i
# which are unavailable on macOS/BSD.
APP_JSON="$MOBILE_DIR/app.json"

BUMP_INFO=$(APP_JSON="$APP_JSON" node <<'EOF'
const fs = require('fs');
const appJsonPath = process.env.APP_JSON;
const raw = fs.readFileSync(appJsonPath, 'utf8');
const data = JSON.parse(raw);
const expo = data.expo || data;
const android = expo.android || {};

const oldVc = Number(android.versionCode);
if (!Number.isInteger(oldVc) || oldVc < 0) {
  process.stderr.write('ERROR: versionCode not found or invalid in app.json\n');
  process.exit(1);
}
const oldVn = String(expo.version || '');
const parts = oldVn.split('.');
if (parts.length !== 3) {
  process.stderr.write('ERROR: version must be MAJOR.MINOR.PATCH in app.json\n');
  process.exit(1);
}
const newVc = oldVc + 1;
const newVn = parts[0] + '.' + parts[1] + '.' + (Number(parts[2]) + 1);
android.versionCode = newVc;
expo.version = newVn;
if (data.expo) data.expo = expo;
fs.writeFileSync(appJsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
process.stdout.write(newVc + ' ' + newVn + ' ' + oldVc + ' ' + oldVn + '\n');
EOF
)

read -r NEW_VC NEW_VN OLD_VC OLD_VN <<< "$BUMP_INFO"
echo "[3/7] Version bumped in app.json: versionCode $OLD_VC → $NEW_VC | version $OLD_VN → $NEW_VN"

# ── 4. Expo prebuild (wipes android/, then regenerates with config plugins) ──
# Pre-delete android/ using bash rm -rf before expo prebuild --clean.
# expo's built-in delete uses Node fs.rm which throws EBUSY on Windows when
# any terminal has android/ as its CWD. bash rm -rf gives a clearer error.
cd "$MOBILE_DIR"

# Stop processes that hold file handles inside android/ on Windows.
# java.exe  = Gradle daemons (hold android/build/ and android/app/.cxx/)
# adb.exe   = ADB server (holds android/app/build/ after adb install)
# node.exe  = Metro / Expo CLI watchers (hold android/ directory handles)
if command -v taskkill &>/dev/null; then
  taskkill //F //IM java.exe &>/dev/null || true
  taskkill //F //IM adb.exe  &>/dev/null || true
  taskkill //F //IM node.exe &>/dev/null || true
fi

if [[ -d "$ANDROID_DIR" ]]; then
  # Rename android/ out of the way instead of deleting it.
  # mv (rename) succeeds even when files inside are locked by Gradle daemons,
  # Windows Search, VS Code, or ADB — it only moves the directory entry.
  # expo prebuild --clean then creates a fresh android/ directory.
  # The renamed backup is deleted in the background; failures are ignored.
  BACKUP_DIR="${ANDROID_DIR}.bak.$(date +%s)"
  mv "$ANDROID_DIR" "$BACKUP_DIR" 2>/dev/null || {
    echo ""
    echo "ERROR: Cannot rename android/ — something has it locked."
    echo ""
    echo "  Likely causes:"
    echo "    1. A terminal window with CWD inside mobile/android/"
    echo "    2. VS Code has files in android/ open"
    echo "    3. A Chrome tab with a file:// URL inside android/"
    echo ""
    echo "  Fix: close those, then re-run this script."
    echo ""
    echo "  To find the culprit terminal in PowerShell:"
    echo "    Get-Process mintty | Select-Object Id, MainWindowTitle"
    echo ""
    exit 1
  }
  echo "[4/7] Existing android/ moved aside → $(basename "$BACKUP_DIR")"
  # Clean up backup in background — OK if this fails (locked files will be
  # cleaned up by the next build or a reboot).
  rm -rf "$BACKUP_DIR" &
fi
echo "[4/7] Running expo prebuild --clean ..."
npx expo prebuild --clean --platform android

# ── 5. Copy keystore into android/app/ (must be AFTER prebuild wipes android/) ─
# Validate that ANDROID_KEYSTORE_PATH is a simple filename with no path separators.
# Gradle resolves it relative to android/app/ — a path with separators would look
# for a non-existent subdirectory and fail with "keystore not found" at bundleRelease.
if [[ "$ANDROID_KEYSTORE_PATH" == */* ]] || [[ "$ANDROID_KEYSTORE_PATH" == *\\* ]]; then
  echo "ERROR: ANDROID_KEYSTORE_PATH must be a simple filename (no path separators)."
  echo "  Current value: '$ANDROID_KEYSTORE_PATH'"
  echo "  Example:       release.keystore"
  exit 1
fi
cp "$KEYSTORE_SRC" "$ANDROID_DIR/app/$ANDROID_KEYSTORE_PATH"
echo "[5/7] Keystore copied to android/app/$ANDROID_KEYSTORE_PATH"

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
