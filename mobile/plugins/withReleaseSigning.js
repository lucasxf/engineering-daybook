/**
 * withReleaseSigning.js
 *
 * expo prebuild --clean adds `signingConfig signingConfigs.debug` to the release
 * buildType. This makes release builds signed with the debug keystore, producing
 * AABs that are rejected or incorrectly signed for Play Store.
 *
 * EAS Build injects the correct signing config automatically — no signingConfig
 * line should appear in the release buildType.
 *
 * This plugin removes the signingConfig from the release buildType after every
 * prebuild by patching build.gradle with a regex replacement.
 */
const { withAppBuildGradle } = require('@expo/config-plugins');

/** @type {import('@expo/config-plugins').ConfigPlugin} */
const withReleaseSigning = (config) => {
  return withAppBuildGradle(config, (cfg) => {
    // Remove `signingConfig signingConfigs.debug` that appears inside the release block.
    // The pattern targets only the line inside `release { ... }` by looking for the
    // word "release" earlier in the block, but Gradle build files aren't parseable
    // with a simple regex. We use a targeted replacement of the exact generated line.
    const before = cfg.modResults.contents;
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
    // Verify the debug signingConfig was actually removed. If the regex did not match
    // (e.g., the Gradle template changed), the replace() silently no-ops and the release
    // buildType is still signed with the debug keystore — a Play Store rejection waiting
    // to happen. Detect this early during prebuild instead of at submission time.
    if (before !== cfg.modResults.contents) {
      // Replacement happened — sanity-check that no debug signingConfig remains
      if (/signingConfig\s+signingConfigs\.debug/.test(cfg.modResults.contents)) {
        throw new Error(
          '[withReleaseSigning] Patch applied but `signingConfig signingConfigs.debug` ' +
            'is still present in build.gradle. The replacement may be incomplete.',
        );
      }
    } else {
      // No change — either it was already clean (acceptable) or the pattern didn't match.
      // Only fail if a debug signingConfig reference still exists.
      if (/signingConfig\s+signingConfigs\.debug/.test(cfg.modResults.contents)) {
        throw new Error(
          '[withReleaseSigning] Could not remove `signingConfig signingConfigs.debug` — ' +
            'the pattern did not match. Check the Gradle template for changes.',
        );
      }
    }
    return cfg;
  });
};

module.exports = withReleaseSigning;
