/**
 * Minimal expo-image-picker mock for the 'components' jest project.
 */
const launchImageLibraryAsync = jest.fn();
const requestMediaLibraryPermissionsAsync = jest.fn();

module.exports = {
  __esModule: true,
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
};
