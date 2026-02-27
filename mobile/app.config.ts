import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'learnimo',
  slug: 'learnimo',
  extra: {
    ...config.extra,
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1',
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    eas: {
      // TODO (Milestone 3.4): Replace with real EAS UUID from `eas init`.
      projectId: 'learnimo-mobile',
    },
  },
});
