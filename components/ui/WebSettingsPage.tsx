import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Switch, Clipboard, Platform } from 'react-native';
import { useStorage } from '@/app/hooks/useStorage';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { ModernButton } from '@/components/ui/ModernButton';
import { DesktopLayout } from '@/components/ui/DesktopLayout';
import { router } from 'expo-router';
import { tw } from '@/utils/tailwind';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function WebSettingsPage() {
  const { clearStorage } = useStorage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [webServiceEnabled, setWebServiceEnabled] = useState(true);
  const [serverAddress, setServerAddress] = useState('');
  const { effectiveTheme } = useTheme();
  const colors = Colors[effectiveTheme];

  // Obtém o endereço IP local
  useEffect(() => {
    if (Platform.OS === 'web') {
      setServerAddress(window.location.origin);
    } else {
      // Para mobile, podemos tentar obter o IP da rede local
      setServerAddress('http://192.168.1.100:8081'); // IP exemplo - seria obtido dinamicamente
    }
  }, []);

  const copyToClipboard = async () => {
    try {
      await Clipboard.setString(serverAddress);
      Alert.alert('Sucesso', 'Endereço copiado para a área de transferência!');
    } catch {
      Alert.alert('Erro', 'Não foi possível copiar o endereço.');
    }
  };

  const handleClearStorage = () => {
    Alert.alert(
      "Limpar Todos os Dados",
      "Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita e removerá:\n\n• Todas as compras registradas\n• Histórico de estabelecimentos\n• Configurações personalizadas\n\nEsta ação é irreversível.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar Limpeza",
          style: "destructive",
          onPress: async () => {
            await clearStorage();
            router.push('/');
          },
        },
      ]
    );
  };

  const SettingCard = ({ 
    icon, 
    title, 
    description, 
    children,
    variant = 'default'
  }: {
    icon: string;
    title: string;
    description: string;
    children?: React.ReactNode;
    variant?: 'default' | 'danger';
  }) => (
    <Card variant="elevated" style={[
      tw('mb-4'),
      variant === 'danger' && { borderColor: colors.error + '30', borderWidth: 1 }
    ]}>
      <View style={tw('p-6')}>
        <View style={tw('flex-row items-start')}>
          <View style={[
            tw('w-12 h-12 rounded-full justify-center items-center mr-4'),
            { 
              backgroundColor: variant === 'danger' 
                ? colors.error + '20' 
                : colors.primaryContainer 
            }
          ]}>
            <MaterialIcons 
              name={icon as any} 
              size={24} 
              color={variant === 'danger' ? colors.error : colors.onPrimaryContainer}
            />
          </View>
          <View style={tw('flex-1')}>
            <Text style={[
              tw('text-lg font-semibold mb-2'), 
              { color: variant === 'danger' ? colors.error : colors.text }
            ]}>
              {title}
            </Text>
            <Text style={[tw('text-sm mb-4 leading-5'), { color: colors.textSecondary }]}>
              {description}
            </Text>
            {children}
          </View>
        </View>
      </View>
    </Card>
  );

  const ToggleSetting = ({ 
    value, 
    onValueChange, 
    label 
  }: { 
    value: boolean; 
    onValueChange: (value: boolean) => void; 
    label: string;
  }) => (
    <View style={tw('flex-row items-center justify-between')}>
      <Text style={[tw('text-base'), { color: colors.text }]}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary + '50' }}
        thumbColor={value ? colors.primary : colors.surfaceVariant}
      />
    </View>
  );

  return (
    <DesktopLayout>
      <ScrollView style={[tw('flex-1'), { backgroundColor: colors.background }]}>
        <View style={tw('p-6 max-w-4xl mx-auto w-full')}>
          {/* Header */}
          <Animated.View entering={FadeInDown}>
            <Text style={[tw('text-3xl font-bold mb-2'), { color: colors.text }]}>
              Configurações
            </Text>
            <Text style={[tw('text-lg mb-8'), { color: colors.textSecondary }]}>
              Personalize sua experiência no GastoMetria
            </Text>
          </Animated.View>

          {/* Serviço Web */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text style={[tw('text-xl font-semibold mb-4'), { color: colors.text }]}>
              🌐 Serviço Web
            </Text>
            <SettingCard
              icon="computer"
              title="Dashboard Web"
              description="Acesse seus dados através do navegador no desktop"
            >
              <View style={tw('mt-4 p-4 bg-blue-50 rounded-lg')}>
                <View style={tw('flex-row items-center justify-between mb-3')}>
                  <Text style={[tw('font-medium'), { color: colors.primary }]}>
                    Status do Serviço
                  </Text>
                  <View style={tw('flex-row items-center')}>
                    <View style={[tw('w-3 h-3 rounded-full mr-2'), { backgroundColor: '#10B981' }]} />
                    <Text style={[tw('text-sm font-medium'), { color: '#10B981' }]}>
                      Ativo
                    </Text>
                  </View>
                </View>
                
                <Text style={[tw('text-sm mb-3'), { color: colors.onSurfaceVariant }]}>
                  Endereço de acesso:
                </Text>
                
                <View style={[tw('p-3 bg-white rounded-lg border'), { borderColor: colors.border }]}>
                  <Text style={[tw('font-mono text-sm'), { color: colors.text }]}>
                    {serverAddress}
                  </Text>
                </View>
                
                <View style={tw('flex-row mt-4 gap-3')}>
                  <View style={tw('flex-1')}>
                    <ModernButton
                      variant="outline"
                      size="sm"
                      leftIcon="content-copy"
                      onPress={copyToClipboard}
                      fullWidth
                    >
                      Copiar Endereço
                    </ModernButton>
                  </View>
                  
                  <View style={tw('flex-1')}>
                    <ModernButton
                      variant="primary"
                      size="sm"
                      leftIcon="open-in-new"
                      onPress={() => {
                        if (Platform.OS === 'web') {
                          window.open(serverAddress, '_blank');
                        }
                      }}
                      fullWidth
                    >
                      Abrir no Navegador
                    </ModernButton>
                  </View>
                </View>
              </View>
            </SettingCard>

            <SettingCard
              icon="settings"
              title="Configurações do Serviço"
              description="Configure como o serviço web funciona"
            >
              <View style={tw('space-y-4')}>
                <ToggleSetting
                  value={webServiceEnabled}
                  onValueChange={setWebServiceEnabled}
                  label="Ativar serviço web"
                />
                
                <View style={tw('p-3 bg-gray-50 rounded-lg')}>
                  <Text style={[tw('text-xs font-medium mb-2'), { color: colors.onSurfaceVariant }]}>
                    INFORMAÇÕES TÉCNICAS
                  </Text>
                  <View style={tw('space-y-1')}>
                    <View style={tw('flex-row justify-between')}>
                      <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>Porta:</Text>
                      <Text style={[tw('text-xs font-mono'), { color: colors.text }]}>8081</Text>
                    </View>
                    <View style={tw('flex-row justify-between')}>
                      <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>Protocolo:</Text>
                      <Text style={[tw('text-xs font-mono'), { color: colors.text }]}>HTTP</Text>
                    </View>
                    <View style={tw('flex-row justify-between')}>
                      <Text style={[tw('text-xs'), { color: colors.textSecondary }]}>Status:</Text>
                      <Text style={[tw('text-xs font-medium'), { color: '#10B981' }]}>Online</Text>
                    </View>
                  </View>
                </View>
              </View>
            </SettingCard>
          </Animated.View>

          {/* Preferências */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={[tw('text-xl font-semibold mb-4 mt-8'), { color: colors.text }]}>
              ⚙️ Preferências
            </Text>

            <SettingCard
              icon="notifications"
              title="Notificações"
              description="Receba alertas sobre gastos, lembretes e novidades do aplicativo"
            >
              <ToggleSetting
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                label="Ativar notificações"
              />
            </SettingCard>

            <SettingCard
              icon="dark-mode"
              title="Tema Escuro"
              description="Ative o modo escuro para uma experiência visual mais confortável"
            >
              <ToggleSetting
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                label="Usar tema escuro"
              />
            </SettingCard>
          </Animated.View>

          {/* Dados e Backup */}
          <Animated.View entering={FadeInDown.delay(300)}>
            <Text style={[tw('text-xl font-semibold mb-4 mt-8'), { color: colors.text }]}>
              💾 Dados e Backup
            </Text>

            <SettingCard
              icon="backup"
              title="Backup Automático"
              description="Mantenha seus dados seguros com backup automático na nuvem"
            >
              <ToggleSetting
                value={autoBackupEnabled}
                onValueChange={setAutoBackupEnabled}
                label="Backup automático"
              />
            </SettingCard>

            <SettingCard
              icon="download"
              title="Exportar Dados"
              description="Baixe todos os seus dados em formato CSV para análise externa"
            >
              <ModernButton
                variant="outline"
                size="md"
                leftIcon="download"
                onPress={() => {
                  Alert.alert("Em breve", "Funcionalidade de exportação será implementada em breve.");
                }}
              >
                Exportar CSV
              </ModernButton>
            </SettingCard>
          </Animated.View>

          {/* Sobre */}
          <Animated.View entering={FadeInDown.delay(400)}>
            <Text style={[tw('text-xl font-semibold mb-4 mt-8'), { color: colors.text }]}>
              ℹ️ Sobre o Aplicativo
            </Text>

            <SettingCard
              icon="info"
              title="Informações do Sistema"
              description="Versão atual e detalhes técnicos do aplicativo"
            >
              <View style={tw('space-y-2')}>
                <View style={tw('flex-row justify-between')}>
                  <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>Versão:</Text>
                  <Text style={[tw('text-sm font-medium'), { color: colors.text }]}>1.0.0</Text>
                </View>
                <View style={tw('flex-row justify-between')}>
                  <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>Plataforma:</Text>
                  <Text style={[tw('text-sm font-medium'), { color: colors.text }]}>Web Desktop</Text>
                </View>
                <View style={tw('flex-row justify-between')}>
                  <Text style={[tw('text-sm'), { color: colors.textSecondary }]}>Última atualização:</Text>
                  <Text style={[tw('text-sm font-medium'), { color: colors.text }]}>Dezembro 2024</Text>
                </View>
              </View>
            </SettingCard>

            <SettingCard
              icon="help"
              title="Ajuda e Suporte"
              description="Obtenha ajuda ou entre em contato com nossa equipe de suporte"
            >
              <View style={tw('flex-row space-x-3')}>
                <ModernButton
                  variant="outline"
                  size="sm"
                  leftIcon="help"
                  onPress={() => {
                    Alert.alert("Ajuda", "Documentação e tutoriais estão sendo preparados.");
                  }}
                >
                  Central de Ajuda
                </ModernButton>
                <ModernButton
                  variant="outline"
                  size="sm"
                  leftIcon="email"
                  onPress={() => {
                    Alert.alert("Suporte", "Entre em contato pelo email: suporte@gastometria.com");
                  }}
                >
                  Contato
                </ModernButton>
              </View>
            </SettingCard>
          </Animated.View>

          {/* Zona de Perigo */}
          <Animated.View entering={FadeInDown.delay(500)}>
            <Text style={[tw('text-xl font-semibold mb-4 mt-8'), { color: colors.error }]}>
              ⚠️ Zona de Perigo
            </Text>

            <SettingCard
              icon="warning"
              title="Limpar Todos os Dados"
              description="Remove permanentemente todos os dados do aplicativo. Esta ação não pode ser desfeita."
              variant="danger"
            >
              <ModernButton
                variant="destructive"
                size="md"
                leftIcon="delete-forever"
                onPress={handleClearStorage}
              >
                Limpar Todos os Dados
              </ModernButton>
            </SettingCard>
          </Animated.View>

          {/* Footer */}
          <View style={tw('mt-12 pt-8 border-t border-gray-200')}>
            <Text style={[tw('text-center text-sm'), { color: colors.textSecondary }]}>
              GastoMetria © 2024 - Versão Desktop
            </Text>
            <Text style={[tw('text-center text-xs mt-2'), { color: colors.textSecondary }]}>
              Desenvolvido com ❤️ para ajudar você a controlar seus gastos
            </Text>
          </View>
        </View>
      </ScrollView>
    </DesktopLayout>
  );
}
