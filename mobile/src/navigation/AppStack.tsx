import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppTabs } from './AppTabs';

export type AppStackParamList = {
  AppTabs: undefined;
  LearningDetail: { pokId: string };
  LearnerProfile: { handle: string };
  Discover: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const LearningDetailScreenLazy = React.lazy(() =>
  import('@/screens/app/LearningDetailScreen').then((m) => ({
    default: m.LearningDetailScreen,
  }))
);

const LearnerProfileScreenLazy = React.lazy(() =>
  import('@/screens/app/LearnerProfileScreen').then((m) => ({
    default: m.LearnerProfileScreen,
  }))
);

const DiscoverScreenLazy = React.lazy(() =>
  import('@/screens/app/DiscoverScreen').then((m) => ({
    default: m.DiscoverScreen,
  }))
);

// Typed wrapper so Stack.Screen receives a proper ComponentType; screen accesses params via hooks
function LearningDetailWrapper(
  _props: NativeStackScreenProps<AppStackParamList, 'LearningDetail'>
) {
  return <LearningDetailScreenLazy />;
}

function LearnerProfileWrapper(
  _props: NativeStackScreenProps<AppStackParamList, 'LearnerProfile'>
) {
  return <LearnerProfileScreenLazy />;
}

function DiscoverWrapper(
  _props: NativeStackScreenProps<AppStackParamList, 'Discover'>
) {
  return <DiscoverScreenLazy />;
}

export function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen name="LearningDetail" component={LearningDetailWrapper} options={{ headerShown: false }} />
      <Stack.Screen name="LearnerProfile" component={LearnerProfileWrapper} />
      <Stack.Screen name="Discover" component={DiscoverWrapper} />
    </Stack.Navigator>
  );
}
