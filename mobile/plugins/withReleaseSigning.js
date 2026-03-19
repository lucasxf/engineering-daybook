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
 *    eas.json credentials — no signingConfig line should appear in the release buildType.
 *
 * This plugin removes the spurious `signingConfig signingConfigs.debug` that prebuild
 * inserts into the release buildType. The env-var signingConfig for local builds is
 * set separately in android/app/build.gradle and is not affected by this plugin.
 */
const { withAppBuildGradle } = require('@expo/config-plugins');

/** @type {import('@expo/config-plugins').ConfigPlugin} */
const withReleaseSigning = (config) => {
  return withAppBuildGradle(config, (cfg) => {
    // Remove `signingConfig signingConfigs.debug` that appears inside the release block.
    // The pattern targets only the line inside `release { ... }` by looking for the
    // word "release" earlier in the block, but Gradle build files aren't parseable
    // with a simple regex. We use a targeted replacement of the exact generated line.
    cfg.modResults.contents = cfg.modResults.contents.replace(
      /(\s*release\s*\{[^}]*?)\s*signingConfig signingConfigs\.debug(\s)/gs,
      (match, beforeGroup, after) => {
        return (
          beforeGroup +
          '\n            // Signing is injected by EAS Build via eas.json credentials.\n            // Do not set signingConfig here.' +
          after
        );
      },
    );
    // Verify the replacement actually happened. The debug block legitimately keeps
    // `signingConfig signingConfigs.debug`, and `signingConfigs { release { ... } }` also
    // contains a `release {}` block — so a generic `match(/release\s*\{...\}/)` would match
    // the wrong block. Instead, use a positive assertion: if the replacement comment was
    // inserted by the replace() above, it will appear in the output. If it does not, the
    // regex did not match (Gradle template may have changed) and the debug signingConfig
    // is still present in the release buildType — a Play Store rejection waiting to happen.
    if (!cfg.modResults.contents.includes('Signing is injected by EAS Build')) {
      throw new Error(
        '[withReleaseSigning] Replacement did not apply — expected comment not found. ' +
          'The Gradle template may have changed. Check that the release buildType still ' +
          'contains `signingConfig signingConfigs.debug` in the unmodified prebuild output.',
      );
    }
    return cfg;
  });
};

module.exports = withReleaseSigning;
