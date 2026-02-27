import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppTabs } from './AppTabs';

export type AppStackParamList = {
  AppTabs: undefined;
  LearningDetail: { pokId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const LearningDetailScreenLazy = React.lazy(() =>
  import('@/screens/app/LearningDetailScreen').then((m) => ({
    default: m.LearningDetailScreen,
  }))
);

// Typed wrapper so Stack.Screen receives a proper ComponentType; screen accesses params via hooks
function LearningDetailWrapper(
  _props: NativeStackScreenProps<AppStackParamList, 'LearningDetail'>
) {
  return <LearningDetailScreenLazy />;
}

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppTabs" component={AppTabs} />
      <Stack.Screen name="LearningDetail" component={LearningDetailWrapper} />
    </Stack.Navigator>
  );
}
