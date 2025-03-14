import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function TabsLayout() {
  const openScanner = () => {
    router.push("/scanner");
  };

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#f0f0f0', // Cor levemente mais escura que #f5f5f5
        height: 65,
        borderTopWidth: 0,
        elevation: 8, // Sombra para Android
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        position: 'absolute',
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#777777',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            openScanner();
          },
        }}
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.scanButton, focused && styles.scanButtonFocused]}>
              <MaterialIcons name="photo-camera" size={24} color="white" />
            </View>
          ),
          tabBarLabelStyle: { display: 'none' }
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1976d2', // MUI primary color
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 35, // Aumentado para compensar a altura da tab bar
    elevation: 4, // Sombra para Android
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  scanButtonFocused: {
    transform: [{ scale: 1.1 }],
  },
});
