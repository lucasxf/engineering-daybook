import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';

export type AppTabsParamList = {
  Feed: undefined;
  NewLearning: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

// Lazy imports
const FeedScreenLazy = React.lazy(() =>
  import('@/screens/app/FeedScreen').then((m) => ({ default: m.FeedScreen }))
);
const LearningNewScreenLazy = React.lazy(() =>
  import('@/screens/app/LearningNewScreen').then((m) => ({
    default: m.LearningNewScreen,
  }))
);
const ProfileScreenLazy = React.lazy(() =>
  import('@/screens/app/ProfileScreen').then((m) => ({ default: m.ProfileScreen }))
);

export function AppTabs() {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreenLazy as any}
        options={{ title: t('learnings.feed.title') }}
      />
      <Tab.Screen
        name="NewLearning"
        component={LearningNewScreenLazy as any}
        options={{ title: t('learnings.new.title') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreenLazy as any}
        options={{ title: t('profile.title') }}
      />
    </Tab.Navigator>
  );
}
