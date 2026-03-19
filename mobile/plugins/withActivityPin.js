/**
 * withActivityPin.js
 *
 * Expo SDK 53 targets compileSdk 35 with AGP 8.8.x. androidx.activity:1.11.0+
 * requires compileSdk 36 + AGP 8.9.1 and will fail the build if resolved.
 *
 * This plugin forces androidx.activity and activity-ktx to 1.9.3 to prevent
 * Gradle from resolving an incompatible version. Remove this plugin once
 * Expo SDK upgrades its Gradle toolchain to compileSdk 36.
 */
const { withAppBuildGradle } = require('@expo/config-plugins');

const FORCE_PIN_BLOCK = `
// Force androidx.activity to a version compatible with compileSdk 35 and AGP 8.8.x.
// androidx.activity:1.11.0+ requires compileSdk 36 + AGP 8.9.1, which Expo SDK 53
// does not yet target. Remove once Expo SDK upgrades its Gradle toolchain.
configurations.all {
    resolutionStrategy {
        force 'androidx.activity:activity:1.9.3'
        force 'androidx.activity:activity-ktx:1.9.3'
    }
}
`;

/** @type {import('@expo/config-plugins').ConfigPlugin} */
const withActivityPin = (config) => {
  return withAppBuildGradle(config, (cfg) => {
    // Idempotent: only add if not already present
    if (!cfg.modResults.contents.includes('androidx.activity:activity:1.9.3')) {
      // Insert before the dependencies block
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /^dependencies \{/m,
        `${FORCE_PIN_BLOCK}\ndependencies {`,
      );
    }
    return cfg;
  });
};

module.exports = withActivityPin;
