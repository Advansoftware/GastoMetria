import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { tw } from '@/utils/tailwind';
import { router, usePathname } from 'expo-router';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const pathname = usePathname();

  const navigationItems = [
    { 
      label: 'Dashboard', 
      icon: 'dashboard', 
      path: '/(tabs)/',
      active: pathname === '/(tabs)/' || pathname === '/' || pathname === '/(tabs)'
    },
    { 
      label: 'Relatórios', 
      icon: 'assessment', 
      path: '/(tabs)/relatorio',
      active: pathname === '/(tabs)/relatorio' || pathname.includes('/relatorio')
    },
    { 
      label: 'Configurações', 
      icon: 'settings', 
      path: '/(tabs)/settings',
      active: pathname === '/(tabs)/settings' || pathname.includes('/settings')
    }
  ];

  const sidebarWidth = sidebarCollapsed ? 80 : 280;

  const handleNavigation = async (path: string) => {
    try {
      console.log('Navigating to:', path);
      
      // Para web, usar router.replace é mais seguro
      await router.replace(path);
      
    } catch (error) {
      console.error('Navigation error:', error);
      
      // Fallback para reload da página em caso de erro
      if (typeof window !== 'undefined') {
        window.location.href = window.location.origin + path;
      }
    }
  };

  const NavItem = ({ item }: { item: typeof navigationItems[0] }) => (
    <TouchableOpacity
      style={[
        tw('flex-row items-center px-4 py-3 mx-2 rounded-lg mb-1 transition-colors'),
        {
          backgroundColor: item.active ? colors.primaryContainer : 'transparent'
        }
      ]}
      onPress={() => {
        console.log('Clicked nav item:', item.label, item.path);
        handleNavigation(item.path);
      }}
      activeOpacity={0.7}
    >
      <MaterialIcons 
        name={item.icon as any} 
        size={24} 
        color={item.active ? colors.onPrimaryContainer : colors.onSurfaceVariant}
      />
      {!sidebarCollapsed && (
        <Text 
          style={[
            tw('ml-3 font-medium'),
            { color: item.active ? colors.onPrimaryContainer : colors.onSurfaceVariant }
          ]}
        >
          {item.label}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[tw('flex-1 flex-row'), { backgroundColor: colors.background }]}>
      {/* Sidebar */}
      <View 
        style={[
          tw('h-full border-r'),
          { 
            width: sidebarWidth,
            backgroundColor: colors.surface,
            borderColor: colors.border
          }
        ]}
      >
        {/* Sidebar Header */}
        <View style={tw('p-4 border-b')}>
          <View style={tw('flex-row items-center justify-between')}>
            {!sidebarCollapsed && (
              <View>
                <Text style={[tw('text-xl font-bold'), { color: colors.primary }]}>
                  GastoMetria
                </Text>
                <Text style={[tw('text-sm'), { color: colors.onSurfaceVariant }]}>
                  Dashboard
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={[
                tw('p-2 rounded-lg'),
                { backgroundColor: colors.surfaceVariant }
              ]}
            >
              <MaterialIcons 
                name={sidebarCollapsed ? 'menu-open' : 'menu'} 
                size={20} 
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation */}
        <ScrollView style={tw('flex-1 py-4')}>
          {navigationItems.map((item, index) => (
            <NavItem key={index} item={item} />
          ))}
        </ScrollView>

        {/* Sidebar Footer */}
        <View style={[tw('p-4 border-t'), { borderColor: colors.border }]}>
          {!sidebarCollapsed && (
            <View style={tw('flex-row items-center')}>
              <View style={[
                tw('w-8 h-8 rounded-full justify-center items-center mr-3'),
                { backgroundColor: colors.primary }
              ]}>
                <MaterialIcons name="person" size={16} color={colors.onPrimary} />
              </View>
              <View>
                <Text style={[tw('font-medium'), { color: colors.onSurface }]}>
                  Usuário
                </Text>
                <Text style={[tw('text-xs'), { color: colors.onSurfaceVariant }]}>
                  Versão Desktop
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View style={tw('flex-1')}>
        {children}
      </View>
    </View>
  );
}
