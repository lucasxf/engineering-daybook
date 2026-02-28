import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

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

// Typed wrappers — satisfy Stack.Screen component prop; screens access nav via hooks
function LoginWrapper(_props: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  return <LoginScreenLazy />;
}
function RegisterWrapper(_props: NativeStackScreenProps<AuthStackParamList, 'Register'>) {
  return <RegisterScreenLazy />;
}
function ForgotPasswordWrapper(_props: NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>) {
  return <ForgotPasswordScreenLazy />;
}
function ChooseHandleWrapper(_props: NativeStackScreenProps<AuthStackParamList, 'ChooseHandle'>) {
  return <ChooseHandleScreenLazy />;
}

export function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginWrapper} />
      <Stack.Screen name="Register" component={RegisterWrapper} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordWrapper} />
      <Stack.Screen name="ChooseHandle" component={ChooseHandleWrapper} />
    </Stack.Navigator>
  );
}
