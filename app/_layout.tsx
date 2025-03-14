import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#f5f5f5' }
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="scanner" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      </Stack>
    </View>
  );
}
