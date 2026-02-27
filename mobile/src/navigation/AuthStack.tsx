import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screen imports will be added when screens are created (task #6)
// Placeholder type declarations kept here so the navigator compiles.
import type { LoginScreen } from '@/screens/auth/LoginScreen';
import type { RegisterScreen } from '@/screens/auth/RegisterScreen';
import type { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';
import type { ChooseHandleScreen } from '@/screens/auth/ChooseHandleScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ChooseHandle: { tempToken: string; email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Lazy imports so the native stack only loads screens when needed
const LoginScreenLazy = React.lazy(() =>
  import('@/screens/auth/LoginScreen').then((m) => ({ default: m.LoginScreen }))
);
const RegisterScreenLazy = React.lazy(() =>
  import('@/screens/auth/RegisterScreen').then((m) => ({ default: m.RegisterScreen }))
);
const ForgotPasswordScreenLazy = React.lazy(() =>
  import('@/screens/auth/ForgotPasswordScreen').then((m) => ({
    default: m.ForgotPasswordScreen,
  }))
);
const ChooseHandleScreenLazy = React.lazy(() =>
  import('@/screens/auth/ChooseHandleScreen').then((m) => ({
    default: m.ChooseHandleScreen,
  }))
);

export function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreenLazy as any} />
      <Stack.Screen name="Register" component={RegisterScreenLazy as any} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreenLazy as any} />
      <Stack.Screen name="ChooseHandle" component={ChooseHandleScreenLazy as any} />
    </Stack.Navigator>
  );
}
