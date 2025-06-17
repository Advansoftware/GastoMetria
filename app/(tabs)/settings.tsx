import React, { useState } from "react";
import { View, Text, Alert, ScrollView, Switch } from "react-native";
import { useStorage } from "../hooks/useStorage";
import { router } from "expo-router";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import { ModernButton } from '@/components/ui/ModernButton';
import { Card } from '@/components/ui/Card';
import { WebSettingsPage } from '@/components/ui/WebSettingsPage';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { tw } from '@/utils/tailwind';
import { useWebLayout } from '@/hooks/useWebLayout';

export default function SettingsScreen() {
  const { clearStorage } = useStorage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { isDesktop } = useWebLayout();

  // Se for desktop, mostrar a versão web
  if (isDesktop) {
    return <WebSettingsPage />;
  }

  const handleClearStorage = () => {
    Alert.alert(
      "Limpar Dados",
      "Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Limpar",
          style: "destructive",
          onPress: async () => {
            await clearStorage();
            router.push({
              pathname: '/(tabs)/',
              params: { refresh: Date.now() }
            });
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    rightElement, 
    onPress 
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <Card variant="outlined" style={tw('mb-3')}>
      <View style={tw('flex-row items-center justify-between p-4')}>
        <View style={tw('flex-row items-center flex-1')}>
          <View style={[tw('w-10 h-10 rounded-full items-center justify-center mr-3'), { backgroundColor: colorScheme === 'dark' ? colors.primary + '30' : colors.primary + '20' }]}>
            <MaterialIcons name={icon} size={20} color={colors.primary} />
          </View>
          <View style={tw('flex-1')}>
            <Text style={[tw('font-semibold text-base'), { color: colors.text }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[tw('text-sm mt-1'), { color: colors.textSecondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {rightElement}
      </View>
    </Card>
  );

  return (
    <View style={[tw('flex-1'), { backgroundColor: colors.background }]}>
      <ScrollView 
        style={tw('flex-1')} 
        contentContainerStyle={tw('px-4 pt-6 pb-20')}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown}>
          <Text style={[tw('text-3xl font-bold mb-2'), { color: colors.text }]}>
            Configurações
          </Text>
          <Text style={[tw('mb-8'), { color: colors.textSecondary }]}>
            Personalize sua experiência no app
          </Text>
        </Animated.View>

        {/* Configurações Gerais */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={[tw('text-lg font-semibold mb-4'), { color: colors.text }]}>
            Geral
          </Text>

          <SettingItem
            icon="notifications"
            title="Notificações"
            subtitle="Receber alertas e lembretes"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={notificationsEnabled ? colors.primary : colors.textSecondary}
              />
            }
          />

          <SettingItem
            icon="dark-mode"
            title="Modo Escuro"
            subtitle="Alternar tema do aplicativo"
            rightElement={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={darkModeEnabled ? colors.primary : colors.textSecondary}
              />
            }
          />
        </Animated.View>

        {/* Dados */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={[tw('text-lg font-semibold mb-4 mt-8'), { color: colors.text }]}>
            Dados
          </Text>

          <SettingItem
            icon="backup"
            title="Backup"
            subtitle="Fazer backup dos seus dados"
            rightElement={
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            }
            onPress={() => {
              Alert.alert("Em breve", "Funcionalidade de backup será implementada em breve.");
            }}
          />

          <SettingItem
            icon="download"
            title="Exportar Dados"
            subtitle="Baixar seus dados em formato CSV"
            rightElement={
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            }
            onPress={() => {
              Alert.alert("Em breve", "Funcionalidade de exportação será implementada em breve.");
            }}
          />
        </Animated.View>

        {/* Serviço Web */}
        <Animated.View entering={FadeInDown.delay(250)}>
          <Text style={[tw('text-lg font-semibold mb-4 mt-8'), { color: colors.text }]}>
            🌐 Acesso Desktop
          </Text>

          <Card variant="elevated" style={tw('mb-4')}>
            <View style={tw('p-4')}>
              <View style={tw('flex-row items-start')}>
                <View style={[
                  tw('w-12 h-12 rounded-full justify-center items-center mr-4'),
                  { backgroundColor: colors.primaryContainer }
                ]}>
                  <MaterialIcons 
                    name="computer" 
                    size={24} 
                    color={colors.onPrimaryContainer}
                  />
                </View>
                <View style={tw('flex-1')}>
                  <Text style={[tw('text-lg font-semibold mb-2'), { color: colors.text }]}>
                    Dashboard Web
                  </Text>
                  <Text style={[tw('text-sm mb-4 leading-5'), { color: colors.textSecondary }]}>
                    Acesse seus dados através do navegador no computador. 
                    Execute o comando abaixo no terminal para iniciar o servidor:
                  </Text>
                  
                  <View style={[tw('p-3 bg-gray-100 rounded-lg mb-4'), { backgroundColor: colors.surfaceVariant }]}>
                    <Text style={[tw('font-mono text-xs'), { color: colors.text }]}>
                      npm run web
                    </Text>
                  </View>
                  
                  <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>
                    Depois acesse: http://localhost:8081 no seu navegador
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Sobre */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={[tw('text-lg font-semibold mb-4 mt-8'), { color: colors.text }]}>
            Sobre
          </Text>

          <SettingItem
            icon="info"
            title="Versão do App"
            subtitle="1.0.0"
            rightElement={
              <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>
                Atualizado
              </Text>
            }
          />

          <SettingItem
            icon="help"
            title="Ajuda e Suporte"
            subtitle="Dúvidas e suporte técnico"
            rightElement={
              <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
            }
            onPress={() => {
              Alert.alert("Suporte", "Entre em contato pelo email: suporte@gastometria.com");
            }}
          />
        </Animated.View>

        {/* Zona de Perigo */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={[tw('text-lg font-semibold mb-4 mt-8'), { color: colors.error }]}>
            Zona de Perigo
          </Text>

          <Card variant="outlined" style={[tw('border-2'), { borderColor: colors.error + '30' }]}>
            <View style={tw('p-4')}>
              <View style={tw('flex-row items-center mb-4')}>
                <MaterialIcons name="warning" size={24} color={colors.error} />
                <Text style={[tw('font-semibold text-base ml-2'), { color: colors.error }]}>
                  Limpar Todos os Dados
                </Text>
              </View>
              <Text style={[tw('text-sm mb-4'), { color: colors.textSecondary }]}>
                Esta ação irá remover permanentemente todos os seus dados, incluindo histórico de compras, 
                estabelecimentos e configurações. Esta ação não pode ser desfeita.
              </Text>
              <ModernButton
                variant="destructive"
                size="md"
                leftIcon="delete-forever"
                onPress={handleClearStorage}
                fullWidth
              >
                Limpar Todos os Dados
              </ModernButton>
            </View>
          </Card>
        </Animated.View>

        {/* Espaçamento final */}
        <View style={tw('h-8')} />
      </ScrollView>
    </View>
  );
}
