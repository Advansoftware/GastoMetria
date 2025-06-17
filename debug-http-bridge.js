// Arquivo de debug para testar o react-native-http-bridge
import { Platform, NativeModules } from 'react-native';

console.log('=== DEBUG HTTP BRIDGE ===');
console.log('Platform:', Platform.OS);
console.log('NativeModules keys:', Object.keys(NativeModules));

try {
  const httpBridge = require('react-native-http-bridge');
  console.log('✅ httpBridge importado:', !!httpBridge);
  console.log('📋 httpBridge métodos:', Object.keys(httpBridge || {}));
  console.log('🔍 httpBridge.start:', typeof httpBridge?.start);
  console.log('🔍 httpBridge.stop:', typeof httpBridge?.stop);
  console.log('🔍 httpBridge.respond:', typeof httpBridge?.respond);
} catch (error) {
  console.error('❌ Erro ao importar httpBridge:', error);
}

// Verificar se o módulo nativo está disponível
const HttpBridgeModule = NativeModules.HttpBridge;
console.log('🏗️ HttpBridge nativo:', !!HttpBridgeModule);
if (HttpBridgeModule) {
  console.log('📋 Métodos nativos:', Object.keys(HttpBridgeModule));
}
