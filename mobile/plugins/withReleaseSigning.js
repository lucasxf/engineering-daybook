/**
 * withReleaseSigning.js
 *
 * expo prebuild --clean adds `signingConfig signingConfigs.debug` to the release
 * buildType. This makes release builds signed with the debug keystore, producing
 * AABs that are rejected or incorrectly signed for Play Store.
 *
 * Two-path signing approach:
 *  - Local builds (./gradlew bundleRelease): signingConfig is set via env vars
 *    (ANDROID_KEYSTORE_PATH, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS,
 *    ANDROID_KEY_PASSWORD) and the release buildType references signingConfigs.release.
 *  - EAS cloud builds: EAS injects the correct signing config automatically via
 *    eas.json credentials — signingConfig is null so EAS takes over.
 *
 * This plugin:
 *  1. Removes the spurious `signingConfig signingConfigs.debug` from the release buildType
 *  2. Injects a `signingConfigs.release` block that reads from env vars
 *  3. Adds a conditional `signingConfig` to the release buildType
 */
const { withAppBuildGradle } = require('@expo/config-plugins');

/** @type {import('@expo/config-plugins').ConfigPlugin} */
const withReleaseSigning = (config) => {
  return withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;

    // ── Step 1: Remove `signingConfig signingConfigs.debug` from the release block ──
    contents = contents.replace(
      /(\s*release\s*\{[^}]*?)\s*signingConfig signingConfigs\.debug(\s)/gs,
      (match, beforeGroup, after) => {
        return beforeGroup + after;
      },
    );

    // ── Step 2: Inject signingConfigs.release block (after the debug block) ──
    // Only inject if not already present (idempotency guard).
    if (!contents.includes('signingConfigs.release') && !contents.includes('signingConfigs {\n        release')) {
      const releaseSigningBlock = [
        '        release {',
        '            if (System.getenv("ANDROID_KEYSTORE_PATH")) {',
        '                storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))',
        '                storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")',
        '                keyAlias System.getenv("ANDROID_KEY_ALIAS")',
        '                keyPassword System.getenv("ANDROID_KEY_PASSWORD")',
        '            }',
        '        }',
      ].join('\n');

      // Insert the release block at the closing brace of signingConfigs { debug { ... } }
      // The generated pattern ends with: `        }\n    }` (debug close + signingConfigs close)
      contents = contents.replace(
        /(signingConfigs\s*\{[\s\S]*?debug\s*\{[\s\S]*?\}\s*)(\})/,
        (match, before, closingBrace) => {
          return before + releaseSigningBlock + '\n    ' + closingBrace;
        },
      );
    }

    // ── Step 3: Add conditional signingConfig to the release buildType ──
    // Scope to buildTypes { ... } to avoid matching the signingConfigs.release block
    // that was injected in Step 2. Only inject if not already present (idempotency guard).
    const signingConfigLine =
      '            // Local: env-var signing. EAS: null (EAS injects credentials).\n' +
      '            signingConfig System.getenv("ANDROID_KEYSTORE_PATH") ? signingConfigs.release : null';

    if (!contents.includes(signingConfigLine)) {
      contents = contents.replace(
        /(buildTypes\s*\{[\s\S]*?release\s*\{)/,
        (match) => match + '\n' + signingConfigLine,
      );
    }

    // ── Validation ──
    // 1. Verify `signingConfig signingConfigs.debug` is gone from the release buildType.
    const releaseBlockMatch = contents.match(/release\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s);
    if (releaseBlockMatch && /signingConfig\s+signingConfigs\.debug/.test(releaseBlockMatch[1])) {
      throw new Error(
        '[withReleaseSigning] `signingConfig signingConfigs.debug` is still present in the ' +
          'release buildType. The replacement may be incomplete — check the Gradle template.',
      );
    }

    // 2. Verify that signingConfigs.release was injected.
    if (!contents.includes('signingConfigs.release')) {
      throw new Error(
        '[withReleaseSigning] `signingConfigs.release` was not injected into build.gradle. ' +
          'The Gradle template may have changed — check withReleaseSigning.js.',
      );
    }

    cfg.modResults.contents = contents;
    return cfg;
  });
};

module.exports = withReleaseSigning;
