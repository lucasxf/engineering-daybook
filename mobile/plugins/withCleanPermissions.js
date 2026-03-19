/**
 * withCleanPermissions.js
 *
 * expo prebuild --clean adds spurious permissions (RECORD_AUDIO, SYSTEM_ALERT_WINDOW)
 * and omits android:maxSdkVersion="28" from legacy storage permissions.
 *
 * This plugin removes the spurious entries and pins maxSdkVersion on the
 * storage permissions after every prebuild.
 */
const { withAndroidManifest } = require('@expo/config-plugins');

const PERMISSIONS_TO_REMOVE = [
  'android.permission.RECORD_AUDIO',
  'android.permission.SYSTEM_ALERT_WINDOW',
];

const PERMISSIONS_NEEDS_MAX_SDK = [
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
];

const MAX_SDK_VERSION = '28';

/** @type {import('@expo/config-plugins').ConfigPlugin} */
const withCleanPermissions = (config) => {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    const permissions = manifest.manifest['uses-permission'] ?? [];

    // Remove spurious permissions
    manifest.manifest['uses-permission'] = permissions.filter((perm) => {
      const name = perm.$['android:name'];
      return !PERMISSIONS_TO_REMOVE.includes(name);
    });

    // Add maxSdkVersion to legacy storage permissions
    for (const perm of manifest.manifest['uses-permission']) {
      if (PERMISSIONS_NEEDS_MAX_SDK.includes(perm.$['android:name'])) {
        perm.$['android:maxSdkVersion'] = MAX_SDK_VERSION;
      }
    }

    return cfg;
  });
};

module.exports = withCleanPermissions;
