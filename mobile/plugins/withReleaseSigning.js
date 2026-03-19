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
    cfg.modResults.contents = cfg.modResults.contents.replace(
      /(\s*release\s*\{[^}]*?)\s*signingConfig signingConfigs\.debug(\s)/gs,
      (match, before, after) => {
        return (
          before +
          '\n            // Signing is injected by EAS Build via eas.json credentials.\n            // Do not set signingConfig here.' +
          after
        );
      },
    );
    return cfg;
  });
};

module.exports = withReleaseSigning;
