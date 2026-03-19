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
    // Sanity-check: verify the release block no longer contains signingConfig.
    // The debug block legitimately keeps `signingConfig signingConfigs.debug`, so we
    // scope the check to only the release block content.
    const releaseBlockMatch = cfg.modResults.contents.match(/release\s*\{([^}]*)\}/s);
    if (releaseBlockMatch && /signingConfig\s+signingConfigs\.debug/.test(releaseBlockMatch[1])) {
      throw new Error(
        '[withReleaseSigning] `signingConfig signingConfigs.debug` is still present in the ' +
          'release buildType. The replacement may be incomplete — check the Gradle template.',
      );
    }
    return cfg;
  });
};

module.exports = withReleaseSigning;
