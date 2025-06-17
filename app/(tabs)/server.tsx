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
import LocalServerService from '../../services/LocalServer';

interface ServerStatus {
  isRunning: boolean;
  url: string | null;
  networkInfo: any;
  error: string | null;
}

export default function ServerConfigScreen() {
  const { colors, effectiveTheme } = useTheme();
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
    const unsubscribe = LocalServerService.onStatusChange((status) => {
      setServerStatus(status);
    });

    return unsubscribe;
  }, []);

  const updateServerStatus = async () => {
    const status = LocalServerService.getStatus();
    const networkInfo = await LocalServerService.getNetworkInfo();
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
        const success = await LocalServerService.start();
        if (success) {
          Alert.alert(
            'Servidor Iniciado',
            'O servidor local foi iniciado com sucesso! Agora você pode conectar dispositivos na mesma rede.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Erro', 'Falha ao iniciar o servidor local.');
        }
      } else {
        const success = await LocalServerService.stop();
        if (success) {
          Alert.alert('Servidor Parado', 'O servidor local foi parado.');
        }
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
      const response = await fetch(`${serverStatus.url}/api/status`);
      const data = await response.json();
      
      if (data.status === 'online') {
        Alert.alert(
          'Teste de Conexão',
          `✅ Servidor funcionando normalmente!\n\nApp: ${data.appName}\nVersão: ${data.version}\nTimestamp: ${new Date(data.timestamp).toLocaleString()}`
        );
      } else {
        Alert.alert('Teste de Conexão', '❌ Servidor não está respondendo adequadamente.');
      }
    } catch (error) {
      Alert.alert('Teste de Conexão', '❌ Erro ao conectar com o servidor: ' + (error as Error).message);
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
              <Text style={styles.label}>Servidor Local</Text>
              <Text style={styles.description}>
                Compartilhe dados com outros dispositivos na rede
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
                  Escaneie com outro dispositivo:
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
            • O servidor permite que outros dispositivos na mesma rede acessem seus dados{'\n'}
            • Use a URL fornecida em qualquer navegador ou aplicativo desktop{'\n'}
            • Certifique-se de que todos os dispositivos estão na mesma rede Wi-Fi{'\n'}
            • O servidor para automaticamente quando o app é fechado
          </Text>
        </View>

        {Platform.OS === 'web' && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️ O servidor local não está disponível na versão web. Use a versão mobile do app.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
