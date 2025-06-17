import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../contexts/ThemeContext';
import WebServerService from '../../services/WebServerService';

interface MobileWebServerProps {
  isServerRunning: boolean;
}

export default function MobileWebServer({ isServerRunning }: MobileWebServerProps) {
  const { effectiveTheme } = useTheme();
  
  // Cores do tema
  const colors = {
    background: effectiveTheme === 'dark' ? '#000000' : '#ffffff',
    text: effectiveTheme === 'dark' ? '#ffffff' : '#000000',
    textSecondary: effectiveTheme === 'dark' ? '#a3a3a3' : '#6b7280',
    primary: '#007AFF',
    error: '#ff4444'
  };
  const [webContent, setWebContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isServerRunning) {
      loadWebContent();
    }
  }, [isServerRunning]);

  const loadWebContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await WebServerService.handleWebRequest('/');
      setWebContent(response.content);
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'API_REQUEST') {
        const response = await WebServerService.handleWebRequest(message.path, message.query);
        
        // Enviar resposta de volta para o WebView seria feito aqui
        // mas no momento usamos apenas para logging
        console.log('API Response:', response);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem do WebView:', error);
    }
  };

  if (!isServerRunning) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          Servidor desativado
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.message, { color: colors.text, marginTop: 16 }]}>
          Carregando interface web...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.message, { color: colors.error }]}>
          Erro: {error}
        </Text>
      </View>
    );
  }

  // HTML aprimorado com comunicação bidirecional
  const enhancedWebContent = webContent.replace(
    '</head>',
    `<script>
      window.pendingRequests = new Map();
      
      async function makeAPIRequest(path, query = {}) {
        const id = Date.now().toString();
        
        return new Promise((resolve, reject) => {
          window.pendingRequests.set(id, { resolve, reject });
          
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'API_REQUEST',
            id,
            path,
            query
          }));
          
          // Timeout após 10 segundos
          setTimeout(() => {
            if (window.pendingRequests.has(id)) {
              window.pendingRequests.delete(id);
              reject(new Error('Timeout na requisição'));
            }
          }, 10000);
        });
      }
      
      window.handleAPIResponse = function(id, response) {
        const request = window.pendingRequests.get(id);
        if (request) {
          window.pendingRequests.delete(id);
          request.resolve(response);
        }
      };
      
      // Sobrescrever fetch para usar nossa API
      const originalFetch = window.fetch;
      window.fetch = function(url, options = {}) {
        if (url.startsWith('/api/')) {
          return makeAPIRequest(url).then(response => ({
            json: () => Promise.resolve(JSON.parse(response.content)),
            text: () => Promise.resolve(response.content),
            ok: true,
            status: 200
          }));
        }
        return originalFetch(url, options);
      };
    </script>
    </head>`
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WebView
        source={{ html: enhancedWebContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[styles.container, styles.centered]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        onError={(error) => {
          setError('Erro no WebView: ' + error.nativeEvent.description);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 32,
  },
});
