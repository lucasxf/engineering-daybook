/**
 * Minimal expo-secure-store mock for the 'screens' jest project (node env).
 */
module.exports = {
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
};
