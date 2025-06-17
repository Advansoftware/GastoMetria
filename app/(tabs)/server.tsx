import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  Clipboard,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../../contexts/ThemeContext';
import ExpoWebServerService from '../../services/ExpoWebServerService';
import MobileWebServer from '../../components/ui/MobileWebServer';

interface ServerStatus {
  isRunning: boolean;
  url: string | null;
  networkInfo: any;
  error: string | null;
}

export default function ServerConfigScreen() {
  const { effectiveTheme } = useTheme();
  
  // Cores do tema
  const colors = {
    background: effectiveTheme === 'dark' ? '#000000' : '#ffffff',
    text: effectiveTheme === 'dark' ? '#ffffff' : '#000000',
    textSecondary: effectiveTheme === 'dark' ? '#a3a3a3' : '#6b7280',
    primary: '#007AFF',
    onPrimary: '#ffffff',
    surface: effectiveTheme === 'dark' ? '#1a1a1a' : '#f8f9fa',
    surfaceVariant: effectiveTheme === 'dark' ? '#2a2a2a' : '#e5e7eb',
    border: effectiveTheme === 'dark' ? '#3a3a3a' : '#d1d5db',
    error: '#ff4444'
  };
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    isRunning: false,
    url: null,
    networkInfo: null,
    error: null
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initial status check
    updateServerStatus();

    // Listen for status changes
    const unsubscribe = ExpoWebServerService.onStatusChange((status) => {
      setServerStatus(status);
    });

    return unsubscribe;
  }, []);

  const updateServerStatus = async () => {
    const status = ExpoWebServerService.getStatus();
    const networkInfo = await ExpoWebServerService.getNetworkInfo();
    setServerStatus({ ...status, networkInfo });
  };

  const handleServerToggle = async (value: boolean) => {
    if (Platform.OS === 'web') {
      Alert.alert('Não disponível', 'O servidor local não está disponível na versão web.');
      return;
    }

    setIsLoading(true);
    try {
      if (value) {
        await ExpoWebServerService.startServer();
        Alert.alert(
          'Servidor Web Iniciado! 🌐',
          'O GastoMetria agora está disponível na web! Outros dispositivos podem acessar a interface completa através do seu IP.',
          [{ text: 'OK' }]
        );
      } else {
        await ExpoWebServerService.stopServer();
        Alert.alert('Servidor Parado', 'O servidor web foi desativado.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao alterar status do servidor: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyUrlToClipboard = () => {
    if (serverStatus.url) {
      Clipboard.setString(serverStatus.url);
      Alert.alert('Copiado!', 'URL do servidor copiada para a área de transferência.');
    }
  };

    const testConnection = async () => {
    if (!serverStatus.url) return;

    try {
      const response = await ExpoWebServerService.handleWebRequest('/api/stats');
      
      Alert.alert(
        'Teste de Conexão ✅',
        `Servidor funcionando perfeitamente!\n\nEstatísticas atuais:\n• Total gasto: R$ ${JSON.parse(response.content).totalGasto?.toFixed(2)}\n• Total de itens: ${JSON.parse(response.content).totalItens}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Erro no Teste ❌',
        'Falha ao testar a conexão com o servidor: ' + (error as Error).message,
        [{ text: 'OK' }]
      );
    }
  };

  const getNetworkStatusIcon = () => {
    if (!serverStatus.networkInfo) return 'wifi-off';
    
    switch (serverStatus.networkInfo.type) {
      case 'wifi':
        return 'wifi';
      case 'cellular':
        return 'signal-cellular-4-bar';
      case 'ethernet':
        return 'settings-ethernet';
      default:
        return 'wifi-off';
    }
  };

  const getNetworkStatusText = () => {
    if (!serverStatus.networkInfo) return 'Desconectado';
    
    const { type, isConnected } = serverStatus.networkInfo;
    
    if (!isConnected) return 'Sem conexão';
    
    switch (type) {
      case 'wifi':
        return 'Wi-Fi conectado';
      case 'cellular':
        return 'Dados móveis';
      case 'ethernet':
        return 'Ethernet';
      default:
        return 'Conectado';
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      padding: 20,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    rowContent: {
      flex: 1,
      marginRight: 12,
    },
    label: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    statusText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '500',
    },
    statusOnline: {
      color: '#4CAF50',
    },
    statusOffline: {
      color: '#F44336',
    },
    urlContainer: {
      backgroundColor: colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    urlText: {
      fontSize: 14,
      fontFamily: 'monospace',
      color: colors.text,
      marginBottom: 8,
    },
    qrContainer: {
      alignItems: 'center',
      marginVertical: 12,
    },
    qrCodeWrapper: {
      padding: 16,
      backgroundColor: 'white',
      borderRadius: 8,
      marginBottom: 12,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonSecondary: {
      backgroundColor: colors.surfaceVariant,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      color: colors.onPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    buttonTextSecondary: {
      color: colors.text,
    },
    networkInfo: {
      marginTop: 8,
      padding: 12,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
    },
    networkInfoText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    warning: {
      backgroundColor: '#FFF3CD',
      borderColor: '#FFEAA7',
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginTop: 16,
    },
    warningText: {
      fontSize: 14,
      color: '#856404',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Server Control Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controle do Servidor</Text>
          
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Servidor Web GastoMetria</Text>
              <Text style={styles.description}>
                Seu celular servirá a versão web completa do GastoMetria para outros dispositivos
              </Text>
            </View>
            <Switch
              value={serverStatus.isRunning}
              onValueChange={handleServerToggle}
              disabled={isLoading}
              trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
              thumbColor={serverStatus.isRunning ? colors.onPrimary : colors.textSecondary}
            />
          </View>

          <View style={styles.statusIndicator}>
            <MaterialIcons
              name={serverStatus.isRunning ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={20}
              color={serverStatus.isRunning ? '#4CAF50' : '#F44336'}
            />
            <Text style={[
              styles.statusText,
              serverStatus.isRunning ? styles.statusOnline : styles.statusOffline
            ]}>
              {serverStatus.isRunning ? 'Online' : 'Offline'}
            </Text>
          </View>

          {serverStatus.url && (
            <View style={styles.urlContainer}>
              <Text style={styles.urlText}>{serverStatus.url}</Text>
              
              {/* QR Code */}
              <View style={styles.qrContainer}>
                <Text style={[styles.label, { marginBottom: 8 }]}>
                  Escaneie para acessar a versão web:
                </Text>
                <View style={styles.qrCodeWrapper}>
                  <QRCode
                    value={serverStatus.url}
                    size={120}
                    backgroundColor="white"
                    color={colors.text}
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={[styles.button, styles.buttonSecondary]} 
                onPress={copyUrlToClipboard}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                  📋 Copiar URL
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Aviso sobre modo de desenvolvimento */}
          {serverStatus.error && (
            <View style={[styles.section, { backgroundColor: colors.surfaceVariant, borderColor: '#FFA500' }]}>
              <MaterialIcons name="info" size={24} color="#FFA500" style={{ marginBottom: 8 }} />
              <Text style={[styles.label, { color: '#FFA500', marginBottom: 8 }]}>
                ℹ️ Modo Desenvolvimento
              </Text>
              <Text style={[styles.description, { fontSize: 14 }]}>
                {serverStatus.error}
              </Text>
              <View style={{ marginTop: 12, padding: 12, backgroundColor: colors.background, borderRadius: 8 }}>
                <Text style={[styles.description, { fontWeight: '600' }]}>
                  📱 Para servidor real:
                </Text>
                <Text style={styles.description}>
                  1. Compile o APK: npx expo build:android{'\n'}
                  2. Instale no celular{'\n'}
                  3. Execute o app instalado{'\n'}
                  4. Ative o servidor{'\n'}
                  5. Acesse do computador: http://SEU_IP:3000
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Network Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status da Rede</Text>
          
          <View style={styles.statusIndicator}>
            <MaterialIcons
              name={getNetworkStatusIcon()}
              size={20}
              color={serverStatus.networkInfo?.isConnected ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.statusText, { color: colors.text }]}>
              {getNetworkStatusText()}
            </Text>
          </View>

          {serverStatus.networkInfo && (
            <View style={styles.networkInfo}>
              <Text style={styles.networkInfoText}>
                Tipo: {serverStatus.networkInfo.type || 'Desconhecido'}
              </Text>
              <Text style={styles.networkInfoText}>
                Conectado: {serverStatus.networkInfo.isConnected ? 'Sim' : 'Não'}
              </Text>
              {serverStatus.networkInfo.details?.ipAddress && (
                <Text style={styles.networkInfoText}>
                  IP: {serverStatus.networkInfo.details.ipAddress}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Actions Section */}
        {serverStatus.isRunning && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações</Text>
            
            <TouchableOpacity style={styles.button} onPress={testConnection}>
              <Text style={styles.buttonText}>🔍 Testar Conexão</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações</Text>
          
          <Text style={styles.description}>
            • Seu celular agora serve a versão web completa do GastoMetria{'\n'}
            • Outros dispositivos podem acessar a interface completa no navegador{'\n'}
            • Use o QR Code ou digite a URL em qualquer navegador{'\n'}
            • Todos os dados são carregados diretamente do seu celular{'\n'}
            • O servidor para automaticamente quando o app é fechado
          </Text>
        </View>

        {/* Web Preview Section */}
        {serverStatus.isRunning && Platform.OS !== 'web' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview da Interface Web</Text>
            <View style={{ height: 400, borderRadius: 8, overflow: 'hidden' }}>
              <MobileWebServer isServerRunning={serverStatus.isRunning} />
            </View>
          </View>
        )}

        {Platform.OS === 'web' && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️ O servidor web não está disponível na versão web. Use a versão mobile do app.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
