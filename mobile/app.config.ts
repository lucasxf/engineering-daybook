import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'learnimo',
  slug: 'learnimo',
  extra: {
    ...config.extra,
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1',
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  },
});
