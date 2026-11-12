import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { cores } from '@/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: cores.escura },
          headerTintColor: cores.branco,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: cores.clara },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Blog FIAP' }} />
      </Stack>
    </>
  );
}
