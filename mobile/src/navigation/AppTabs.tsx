import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
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

// Typed wrappers — satisfy Tab.Screen component prop; screens access nav via hooks
function FeedTab(_props: BottomTabScreenProps<AppTabsParamList, 'Feed'>) {
  return <FeedScreenLazy />;
}
function NewLearningTab(_props: BottomTabScreenProps<AppTabsParamList, 'NewLearning'>) {
  return <LearningNewScreenLazy />;
}
function ProfileTab(_props: BottomTabScreenProps<AppTabsParamList, 'Profile'>) {
  return <ProfileScreenLazy />;
}

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
        component={FeedTab}
        options={{ title: t('learnings.feed.title') }}
      />
      <Tab.Screen
        name="NewLearning"
        component={NewLearningTab}
        options={{ title: t('learnings.new.title') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTab}
        options={{ title: t('profile.title') }}
      />
    </Tab.Navigator>
  );
}
