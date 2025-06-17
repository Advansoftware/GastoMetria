import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ServerData {
  items: any[];
  stats: any;
  products: any[];
  establishments: any[];
}

interface ConnectionStatus {
  connected: boolean;
  serverUrl: string;
  lastUpdate: Date | null;
  error: string | null;
}

export default function DesktopClientScreen() {
  const { colors, effectiveTheme } = useTheme();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    serverUrl: '',
    lastUpdate: null,
    error: null
  });
  const [serverData, setServerData] = useState<ServerData>({
    items: [],
    stats: {},
    products: [],
    establishments: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('http://192.168.');

  const connectToServer = async (url: string) => {
    setIsLoading(true);
    try {
      // Test connection first
      const statusResponse = await fetch(`${url}/api/status`);
      if (!statusResponse.ok) {
        throw new Error('Servidor não encontrado');
      }
      
      const statusData = await statusResponse.json();
      
      // Fetch all data
      const [itemsRes, statsRes, productsRes, establishmentsRes] = await Promise.all([
        fetch(`${url}/api/items`),
        fetch(`${url}/api/stats`),
        fetch(`${url}/api/products`),
        fetch(`${url}/api/establishments`)
      ]);

      const [items, stats, products, establishments] = await Promise.all([
        itemsRes.json(),
        statsRes.json(),
        productsRes.json(),
        establishmentsRes.json()
      ]);

      setServerData({
        items: items.items || [],
        stats: stats,
        products: products.products || [],
        establishments: establishments.establishments || []
      });

      setConnectionStatus({
        connected: true,
        serverUrl: url,
        lastUpdate: new Date(),
        error: null
      });

      Alert.alert('Conectado!', `Conectado com sucesso ao ${statusData.appName}`);
    } catch (error) {
      setConnectionStatus({
        connected: false,
        serverUrl: '',
        lastUpdate: null,
        error: (error as Error).message
      });
      Alert.alert('Erro de Conexão', `Não foi possível conectar: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    if (!connectionStatus.connected || !connectionStatus.serverUrl) return;
    
    setIsLoading(true);
    try {
      const [itemsRes, statsRes, productsRes, establishmentsRes] = await Promise.all([
        fetch(`${connectionStatus.serverUrl}/api/items`),
        fetch(`${connectionStatus.serverUrl}/api/stats`),
        fetch(`${connectionStatus.serverUrl}/api/products`),
        fetch(`${connectionStatus.serverUrl}/api/establishments`)
      ]);

      const [items, stats, products, establishments] = await Promise.all([
        itemsRes.json(),
        statsRes.json(),
        productsRes.json(),
        establishmentsRes.json()
      ]);

      setServerData({
        items: items.items || [],
        stats: stats,
        products: products.products || [],
        establishments: establishments.establishments || []
      });

      setConnectionStatus(prev => ({
        ...prev,
        lastUpdate: new Date(),
        error: null
      }));
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        error: (error as Error).message
      }));
      Alert.alert('Erro', `Falha ao atualizar dados: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    connectionSection: {
      backgroundColor: colors.surface,
      margin: 16,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    inputContainer: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.background,
      fontFamily: 'monospace',
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginLeft: 12,
      justifyContent: 'center',
    },
    buttonText: {
      color: colors.onPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 8,
      marginTop: 8,
    },
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
    },
    statusConnected: {
      backgroundColor: '#4CAF50',
    },
    statusDisconnected: {
      backgroundColor: '#F44336',
    },
    statusText: {
      fontSize: 14,
      color: colors.text,
    },
    dataSection: {
      backgroundColor: colors.surface,
      margin: 16,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    statCard: {
      backgroundColor: colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
      margin: 4,
      minWidth: 120,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
    list: {
      marginTop: 12,
    },
    listItem: {
      backgroundColor: colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    listItemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    listItemSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    scrollContainer: {
      flex: 1,
    },
    refreshButton: {
      backgroundColor: colors.surfaceVariant,
      borderWidth: 1,
      borderColor: colors.border,
    },
    refreshButtonText: {
      color: colors.text,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cliente Desktop</Text>
        <Text style={styles.subtitle}>Conecte-se ao servidor mobile do GastoMetria</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Connection Section */}
        <View style={styles.connectionSection}>
          <Text style={styles.sectionTitle}>Conexão com Servidor</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="http://192.168.1.100:3000"
              placeholderTextColor={colors.textSecondary}
              editable={!isLoading}
            />
            <button 
              style={[styles.button, isLoading && { opacity: 0.6 }]}
              onPress={() => connectToServer(urlInput)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Conectando...' : 'Conectar'}
              </Text>
            </button>
          </View>

          {connectionStatus.connected && (
            <button 
              style={[styles.button, styles.refreshButton]}
              onPress={refreshData}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.refreshButtonText]}>
                🔄 Atualizar Dados
              </Text>
            </button>
          )}

          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator, 
              connectionStatus.connected ? styles.statusConnected : styles.statusDisconnected
            ]} />
            <Text style={styles.statusText}>
              {connectionStatus.connected 
                ? `Conectado a ${connectionStatus.serverUrl}` 
                : connectionStatus.error || 'Desconectado'
              }
            </Text>
          </View>

          {connectionStatus.lastUpdate && (
            <Text style={[styles.statusText, { marginTop: 8, fontSize: 12 }]}>
              Última atualização: {connectionStatus.lastUpdate.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Stats Section */}
        {connectionStatus.connected && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Estatísticas</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{serverData.stats.totalItems || 0}</Text>
                <Text style={styles.statLabel}>Total de Itens</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  R$ {(serverData.stats.totalValue || 0).toFixed(2)}
                </Text>
                <Text style={styles.statLabel}>Valor Total</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{serverData.stats.uniqueProducts || 0}</Text>
                <Text style={styles.statLabel}>Produtos Únicos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{serverData.stats.uniqueEstablishments || 0}</Text>
                <Text style={styles.statLabel}>Estabelecimentos</Text>
              </View>
            </View>
          </View>
        )}

        {/* Products Section */}
        {connectionStatus.connected && serverData.products.length > 0 && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Top Produtos ({serverData.products.length})</Text>
            <ScrollView style={styles.list} nestedScrollEnabled>
              {serverData.products.slice(0, 10).map((product, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemTitle}>{product.name}</Text>
                  <Text style={styles.listItemSubtitle}>
                    R$ {product.totalValue} • {product.count} compras • 
                    Média: R$ {product.avgPrice}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Establishments Section */}
        {connectionStatus.connected && serverData.establishments.length > 0 && (
          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>Top Estabelecimentos ({serverData.establishments.length})</Text>
            <ScrollView style={styles.list} nestedScrollEnabled>
              {serverData.establishments.slice(0, 10).map((establishment, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemTitle}>{establishment.name}</Text>
                  <Text style={styles.listItemSubtitle}>
                    R$ {establishment.totalValue} • {establishment.count} compras • 
                    {establishment.products.length} produtos diferentes
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
