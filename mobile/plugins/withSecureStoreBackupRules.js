/**
 * withSecureStoreBackupRules.js
 *
 * expo prebuild --clean does NOT generate the secure_store_backup_rules.xml and
 * secure_store_data_extraction_rules.xml files even when expo-secure-store is in
 * the plugins list. The AndroidManifest references them, so their absence causes
 * Resources.NotFoundException on launch (instant crash, no splash screen).
 *
 * This plugin copies the files from the expo-secure-store package into the
 * android/app/src/main/res/xml/ directory after every prebuild.
 */
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/** @type {import('@expo/config-plugins').ConfigPlugin} */
const withSecureStoreBackupRules = (config) => {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const destDir = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'res',
        'xml',
      );

      const secureStorePkg = path.join(
        projectRoot,
        'node_modules',
        'expo-secure-store',
        'android',
        'src',
        'main',
        'res',
        'xml',
      );

      fs.mkdirSync(destDir, { recursive: true });

      for (const filename of [
        'secure_store_backup_rules.xml',
        'secure_store_data_extraction_rules.xml',
      ]) {
        const src = path.join(secureStorePkg, filename);
        const dest = path.join(destDir, filename);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        } else {
          // Fail hard: AndroidManifest already references these XML files via
          // android:fullBackupContent and android:dataExtractionRules. If the files
          // are absent, Android throws Resources.NotFoundException on launch — the
          // exact crash this plugin prevents. A missing source means node_modules is
          // corrupt or expo-secure-store is not installed; that must be fixed before
          // the native directory is usable, not papered over with a warning.
          throw new Error(
            `[withSecureStoreBackupRules] Source not found: ${src} — ` +
              `ensure expo-secure-store is installed (run 'npm install --legacy-peer-deps').`,
          );
        }
      }

      return cfg;
    },
  ]);
};

module.exports = withSecureStoreBackupRules;
