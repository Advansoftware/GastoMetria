import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useWebLayout } from '@/hooks/useWebLayout';
import { tw } from '@/utils/tailwind';

export default function TabsLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isDesktop } = useWebLayout();

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: isDesktop ? { display: 'none' } : {
        backgroundColor: colors.tabBackground,
        height: 70,
        borderTopWidth: 0,
        elevation: 8,
        shadowColor: colors.shadow,
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        position: 'absolute',
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarActiveTintColor: colors.tabIconSelected,
      tabBarInactiveTintColor: colors.tabIconDefault,
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[tw('p-1 rounded-lg'), focused && { backgroundColor: colorScheme === 'dark' ? colors.primary + '30' : colors.primary + '20' }]}>
              <MaterialIcons name="home" size={size} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="relatorio"
        options={{
          title: "Relatório",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[tw('p-1 rounded-lg'), focused && { backgroundColor: colorScheme === 'dark' ? colors.primary + '30' : colors.primary + '20' }]}>
              <MaterialIcons name="assessment" size={size} color={color} />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[tw('p-1 rounded-lg'), focused && { backgroundColor: colorScheme === 'dark' ? colors.primary + '30' : colors.primary + '20' }]}>
              <MaterialIcons name="settings" size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
