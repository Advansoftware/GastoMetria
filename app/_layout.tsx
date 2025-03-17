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
        <Stack.Screen 
          name="camera" 
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'fade',
            contentStyle: {
              backgroundColor: 'black'
            }
          }} 
        />
        <Stack.Screen name="estabelecimento/[id]" options={{ headerShown: true, title: 'Estabelecimento' }} />
        <Stack.Screen name="estabelecimento/[id]/data/[date]" options={{ headerShown: true, title: 'Detalhes da Compra' }} />
      </Stack>
    </View>
  );
}