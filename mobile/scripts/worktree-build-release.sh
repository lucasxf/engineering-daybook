#!/usr/bin/env bash
# worktree-build-release.sh — Bootstrap gitignored files from the main repo,
# then delegate to build-release.sh for the actual signed AAB build.
#
# Use this script when building from a git worktree.
# Use build-release.sh directly when building from develop (main repo).
#
# Usage (from mobile/scripts/ inside a worktree):
#   bash worktree-build-release.sh
#
# What this does that build-release.sh doesn't:
#   1. Installs node_modules if missing (gitignored, not shared between worktrees)
#   2. Copies .env.signing from main repo (gitignored signing credentials)
#   3. Copies signing keystore from main repo (gitignored binary)
#   4. Copies .env.production.local from main repo (gitignored env vars)
#   Then hands off to build-release.sh for steps 1–7.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Derive main repo root via git's shared object store.
# In a worktree, `git rev-parse --git-common-dir` returns the main .git path.
GIT_COMMON_DIR="$(git -C "$MOBILE_DIR" rev-parse --git-common-dir 2>/dev/null)"
MAIN_REPO_ROOT="$(cd "${GIT_COMMON_DIR}/.." && pwd)"
MAIN_MOBILE_DIR="$MAIN_REPO_ROOT/mobile"

echo "=== learnimo Worktree Build Bootstrap ==="
echo "  Worktree : $MOBILE_DIR"
echo "  Main repo: $MAIN_MOBILE_DIR"
echo ""

if [[ ! -d "$MAIN_MOBILE_DIR" ]]; then
  echo "ERROR: Could not locate main repo mobile dir at $MAIN_MOBILE_DIR"
  exit 1
fi

# ── 1. node_modules ──────────────────────────────────────────────────────────
if [[ ! -d "$MOBILE_DIR/node_modules" ]]; then
  echo "[bootstrap 1/4] node_modules missing — running npm install --legacy-peer-deps ..."
  cd "$MOBILE_DIR"
  npm install --legacy-peer-deps
  echo "[bootstrap 1/4] node_modules installed"
else
  echo "[bootstrap 1/4] node_modules present — skipping install"
fi

# ── 2. .env.signing ──────────────────────────────────────────────────────────
if [[ ! -f "$MOBILE_DIR/.env.signing" ]]; then
  if [[ -f "$MAIN_MOBILE_DIR/.env.signing" ]]; then
    cp "$MAIN_MOBILE_DIR/.env.signing" "$MOBILE_DIR/.env.signing"
    echo "[bootstrap 2/4] .env.signing copied from main repo"
  else
    echo "ERROR: .env.signing not found in main repo ($MAIN_MOBILE_DIR/.env.signing)"
    echo "  Create it: cp mobile/.env.signing.example mobile/.env.signing"
    exit 1
  fi
else
  echo "[bootstrap 2/4] .env.signing present"
fi

# ── 3. Signing keystore ───────────────────────────────────────────────────────
KEYSTORE_NAME="@lucasxf__learnimo.jks"
if [[ ! -f "$MOBILE_DIR/$KEYSTORE_NAME" ]]; then
  if [[ -f "$MAIN_MOBILE_DIR/$KEYSTORE_NAME" ]]; then
    cp "$MAIN_MOBILE_DIR/$KEYSTORE_NAME" "$MOBILE_DIR/$KEYSTORE_NAME"
    echo "[bootstrap 3/4] Keystore copied from main repo"
  else
    echo "ERROR: Keystore not found in main repo ($MAIN_MOBILE_DIR/$KEYSTORE_NAME)"
    echo "  Download it: eas credentials --platform android → Keystore → Download"
    exit 1
  fi
else
  echo "[bootstrap 3/4] Keystore present"
fi

# ── 4. .env.production.local ─────────────────────────────────────────────────
if [[ ! -f "$MOBILE_DIR/.env.production.local" ]]; then
  if [[ -f "$MAIN_MOBILE_DIR/.env.production.local" ]]; then
    cp "$MAIN_MOBILE_DIR/.env.production.local" "$MOBILE_DIR/.env.production.local"
    echo "[bootstrap 4/4] .env.production.local copied from main repo"
  else
    echo "WARNING: .env.production.local not found in main repo — Google OAuth button will be hidden"
    echo "         Create $MAIN_MOBILE_DIR/.env.production.local with EXPO_PUBLIC_GOOGLE_* vars"
    echo "[bootstrap 4/4] Skipping (optional, but Google button will not appear)"
  fi
else
  echo "[bootstrap 4/4] .env.production.local present"
fi

echo ""
echo "Bootstrap complete — handing off to build-release.sh ..."
echo ""

# ── Delegate ──────────────────────────────────────────────────────────────────
bash "$SCRIPT_DIR/build-release.sh"
