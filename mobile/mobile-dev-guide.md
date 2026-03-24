# Mobile Dev Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Resume](#quick-resume)
3. [Full Setup](#full-setup)
4. [Release Builds](#release-builds)
5. [Dev Utilities](#dev-utilities)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Install and configure these **once** before following any steps below:

| Tool | Check |
|------|-------|
| Android Studio + AVD named `Pixel_8_API35` | `emulator -list-avds` |
| `ANDROID_HOME` set; `$ANDROID_HOME/emulator` and `$ANDROID_HOME/platform-tools` on `PATH` | `echo $ANDROID_HOME` |
| `adb` reachable | `adb version` |
| Java 21 + Maven | `mvn -v` |
| Node.js 20+ and npm | `node -v` |
| Docker Desktop | `docker info` |
| EAS CLI | `eas whoami` |

---

## Quick Resume

Use this when Docker, emulator, and Metro are just being **restarted** — not first-time setup:

```bash
# Terminal 1 — backend/
docker compose up -d
mvn spring-boot:run -Dspring-boot.run.profiles=local

# Terminal 2 — emulator
emulator -avd Pixel_8_API35 &

# Terminal 3 — mobile/
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api/v1 npx expo start --android
```

---

## Full Setup

1. Start Docker (wait ~20s for Desktop to be ready)

2. Start the database

```bash
cd /c/repo/engineering-daybook/backend

docker compose up

# Wait until you see: database system is ready to accept connections
```

3. Start the backend

```bash
cd /c/repo/engineering-daybook/backend

mvn spring-boot:run -Dspring-boot.run.profiles=local

# Wait until you see: Started EdApplication
```

4. Start the Android emulator

```bash
emulator -avd Pixel_8_API35 &

# Wait until fully booted — you see the Android home screen, not the boot animation
```

5. Verify emulator is ready

```bash
adb devices
# Must show: emulator-5554   device   (not "offline")
```

6. Start Expo

```bash
cd /c/repo/engineering-daybook/mobile

EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api/v1 npx expo start --android
# Metro opens and auto-launches the app. First JS bundle takes ~15–30s.
```

7. **Rebuild native binaries** (when needed)

> **Which path to use:**
> - `expo start --android` — fast path; use when native code hasn't changed
> - `prebuild + run:android` — use when you've added/changed a native module, updated `app.json` plugins, or hit a "module not found" native error

```bash
cd /c/repo/engineering-daybook/mobile

npx expo prebuild --clean
npx expo run:android
```

---

8. Seed demo data (one-time, after the app is running)

```bash
cd /c/repo/engineering-daybook/mobile/store-assets

bash seed-demo-data.sh
```

---

9. Log in with demo credentials:
   - email: `demo@learnimo.net`
   - password: `Demo@learnimo1`

---

**Key ordering rules:**

- Docker must be up before `docker compose up`
- Database must be up before the backend
- Emulator must show the home screen before running `expo start --android`
- Backend must be running before the app loads (otherwise login fails)

---

## Release Builds

### Option A — Local AAB via Gradle (Windows, no EAS)

> Use when you need a signed AAB for Play Store submission without an EAS cloud build.

#### First-time setup (do once per machine)

**1. Download the release keystore:**

```bash
cd mobile
eas credentials --platform android
# → select "Keystore" → "Download existing keystore"
# Saves to mobile/@lucasxf__learnimo.jks and prints alias + passwords.
```

**2. Create the signing env file:**

```bash
cp mobile/.env.signing.example mobile/.env.signing
# Fill in the values printed by `eas credentials` above.
# .env.signing is gitignored — never commit it.
```

#### Build (run every time)

```bash
cd mobile
bash scripts/build-release.sh
```

The script handles everything automatically:
- Runs `expo prebuild --clean` (regenerates `android/` with config plugins)
- Copies the keystore into `android/app/` after prebuild
- Auto-bumps `android.versionCode` (+1) and `expo.version` (patch +1) in `app.json` (prebuild propagates these into `android/app/build.gradle`)
- Builds the signed AAB via `./gradlew bundleRelease`
- Prints the output path when done

Output: `android/app/build/outputs/bundle/release/app-release.aab`

#### Recovering Credentials

If you've lost the keystore password, alias, or key password:

```bash
eas credentials --platform android
# → select "Keystore" → "Download existing keystore"
# The CLI re-downloads the .jks file and prints the alias + both passwords.
# Copy those values into mobile/.env.signing.
```

#### Manual build (reference only)

<details>
<summary>Expand for manual steps</summary>

```bash
# Export signing env vars (required each terminal session — not one-time)
export ANDROID_KEYSTORE_PATH=release.keystore   # relative to android/app/
export ANDROID_KEYSTORE_PASSWORD=<password>
export ANDROID_KEY_ALIAS=<alias>
export ANDROID_KEY_PASSWORD=<password>

# 1. Regenerate native directory
cd mobile
npx expo prebuild --clean --platform android

# 2. Copy keystore (must be AFTER prebuild — prebuild wipes android/)
cp mobile/@lucasxf__learnimo.jks mobile/android/app/release.keystore

# 3. Bump android.versionCode in app.json (build.gradle is regenerated by expo prebuild — do not edit it directly)

# 4. Build
cd mobile/android
./gradlew clean
./gradlew bundleRelease
```

</details>

4. Upload to Play Store via Play Console (drag-and-drop the `.aab` file).

---

### Option B — EAS Cloud Build (recommended)

> `eas build --local` is not supported on Windows. Use EAS cloud builds.

**Preview APK** (smoke-test gate — always run before a production submit):

```bash
cd mobile
eas build --platform android --profile preview
```

Install on emulator when done:

```bash
eas build:run --platform android --profile preview
# or: download APK from expo.dev → Builds, drag onto emulator
# or: adb install /path/to/downloaded.apk
```

**Smoke-test checklist — do not submit if any fail:**
- [ ] App launches from home screen icon (not Android Studio)
- [ ] Splash screen + Onnim icon appear
- [ ] Login screen loads within ~2 seconds
- [ ] Cold start works: kill app → relaunch → same result

**Production AAB:**

```bash
eas build --platform android --profile production
```

**Submit to Play Store internal track:**

```bash
eas submit --platform android --profile production
```

**Build + submit in one step (recommended for production releases):**

```bash
eas build --platform android --profile production --auto-submit
```

**Other EAS utilities:**

```bash
eas build:list                          # view recent builds + status
eas build:cancel <build-id>             # cancel a queued or running build
eas whoami                              # confirm you're logged in to the right account
eas credentials --platform android      # manage keystores and signing credentials
```

---

### Maestro E2E Flows

> Maestro runs against **debug builds** (`expo run:android`). It does **not** cover release builds.

```bash
# Run a single flow
maestro test e2e/auth-login.yaml

# Run all flows
maestro test e2e/

# Run with verbose output
maestro test --debug-output e2e/auth-login.yaml
```

For release-mode smoke testing, install the EAS Preview APK and work through the checklist above.

---

### Unit Tests & Coverage

```bash
cd mobile
npm test -- --no-coverage --selectProjects lib        # fast (node env, no RN setup)
npm test -- --no-coverage --selectProjects rn          # RN component tests (jest-expo)
npm run test:coverage                                  # full report — must pass ≥ 80% lines
```

---

## Dev Utilities

### Cache Clearing

```bash
# Clear Metro bundler cache (fixes stale JS bundles)
npx expo start --clear

# Clear all caches (nuclear option)
rm -rf mobile/.expo mobile/node_modules/.cache

# Clear Gradle build cache
cd mobile/android && ./gradlew clean
```

### ADB — Device & App Management

```bash
# List connected devices / emulators
adb devices

# Forward Metro port (fixes "Unable to connect to Metro" on some setups)
adb reverse tcp:8081 tcp:8081

# Forward backend port (alternative to 10.0.2.2 if needed)
adb reverse tcp:8080 tcp:8080

# Install an APK manually
adb install /path/to/app.apk

# Uninstall the app (useful when reinstalling a different signing variant)
adb uninstall net.learnimo.app

# Clear app data without uninstalling
adb shell pm clear net.learnimo.app

# Take a screenshot and pull it to the current directory
adb shell screencap /sdcard/screen.png && adb pull /sdcard/screen.png

# Launch the app from the shell
adb shell am start -n net.learnimo.app/.MainActivity
```

### Logcat — Crash & Log Inspection

```bash
# Stream all logs (noisy)
adb logcat

# Filter to app logs only (most useful)
adb logcat --pid=$(adb shell pidof -s net.learnimo.app)

# Filter by tag (e.g. ReactNativeJS for JS console output)
adb logcat -s ReactNativeJS

# Capture crash log to file
adb logcat -d > crash.log

# Clear existing logcat buffer before reproducing a bug
adb logcat -c
```

### Emulator Management

```bash
# List available AVDs
emulator -list-avds

# Cold boot (ignores saved snapshot — use when emulator is stuck)
emulator -avd Pixel_8_API35 -no-snapshot-load &

# Wipe emulator data (nuclear — resets to factory state)
emulator -avd Pixel_8_API35 -wipe-data &

# Kill the emulator cleanly
adb emu kill
```

### Dependency Management

```bash
cd mobile

# Add a new Expo-compatible package (resolves correct version for current SDK)
npx expo install <package-name>

# Add a non-Expo package
npm install <package-name> --legacy-peer-deps

# Check for outdated Expo SDK packages
npx expo install --check

# Reinstall all dependencies from scratch
rm -rf node_modules && npm install --legacy-peer-deps
```

---

## Troubleshooting

**Emulator shows "offline" in `adb devices`**
→ `adb kill-server && adb start-server`, then recheck.

**Metro can't connect to emulator**
→ Ensure emulator is fully booted (home screen visible), then run:
```bash
adb reverse tcp:8081 tcp:8081
```

**App shows "Network request failed" on login**
→ Backend not running, or `EXPO_PUBLIC_API_URL` is wrong. Verify with:
```bash
# From within the emulator shell:
curl http://10.0.2.2:8080/api/v1/actuator/health
```

**`docker compose up` fails — port 5432 in use**
→ `docker ps` to find the conflicting container, then `docker stop <id>`.

**Metro bundler stuck at 0%**
→ Kill Metro (`Ctrl+C`), delete `mobile/.expo` and `mobile/node_modules/.cache`, restart.

**App crashes on launch (release/preview build only)**
→ Run `adb logcat -d | grep -i "fatal\|crash\|exception"` immediately after the crash. Common causes: missing `res/xml/` backup rules, wrong signing config, or stale `android/` directory. Re-run `npx expo prebuild --clean` and retry.

**`./gradlew bundleRelease` fails with "keystore not found"**
→ Verify `ANDROID_KEYSTORE_PATH` is set and `release.keystore` is at `android/app/release.keystore` (not `android/release.keystore`).

**EAS build fails with `npm ci` ERESOLVE**
→ Ensure `mobile/.npmrc` contains `legacy-peer-deps=true`, and that `react-test-renderer` matches the exact `react` version in `package.json`.
