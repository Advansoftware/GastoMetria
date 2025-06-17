import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../app/services/StorageService';
import { Platform, NativeModules } from 'react-native';

// Debug do módulo nativo
console.log('=== DEBUG HTTP BRIDGE ===');
console.log('Platform:', Platform.OS);
console.log('NativeModules disponíveis:', Object.keys(NativeModules).filter(key => key.toLowerCase().includes('http')));

// Tentar importar o http-bridge, mas não falhar se não estiver disponível
let httpBridge: any = null;
try {
  if (Platform.OS !== 'web') {
    httpBridge = require('react-native-http-bridge');
    console.log('✅ react-native-http-bridge importado com sucesso');
    console.log('🔍 Métodos disponíveis:', Object.keys(httpBridge || {}));
    console.log('🔍 httpBridge.start tipo:', typeof httpBridge?.start);
    console.log('🔍 httpBridge.stop tipo:', typeof httpBridge?.stop);
    console.log('🔍 httpBridge.respond tipo:', typeof httpBridge?.respond);
  }
} catch (error) {
  console.warn('❌ react-native-http-bridge não disponível:', error);
}

// Verificar módulo nativo diretamente
const HttpBridgeModule = NativeModules.HttpBridge;
console.log('🏗️ HttpBridge nativo disponível:', !!HttpBridgeModule);
if (HttpBridgeModule) {
  console.log('📋 Métodos nativos:', Object.keys(HttpBridgeModule));
}

interface ServerConfig {
  port: number;
  enabled: boolean;
}

interface NetworkInfo {
  type: string;
  isConnected: boolean | null;
  details: {
    ipAddress: string;
    isInternetReachable: boolean | null;
  };
}

interface ServerStatus {
  isRunning: boolean;
  url: string | null;
  networkInfo: NetworkInfo | null;
  error: string | null;
}

class RealWebServerService {
  private config: ServerConfig;
  private networkInfo: NetworkInfo | null = null;
  private statusCallbacks: ((status: ServerStatus) => void)[] = [];
  private isRunning: boolean = false;
  private isRealServerMode: boolean = false;
  private simulatedServer: any = null;

  constructor() {
    this.config = {
      port: 3000,
      enabled: false
    };
    
    // Detectar se o servidor real está disponível
    // Tentar servidor real mesmo em modo dev se o httpBridge estiver disponível
    this.isRealServerMode = httpBridge !== null && Platform.OS === 'android';
    
    console.log(`🔧 Modo: ${__DEV__ ? 'DESENVOLVIMENTO' : 'PRODUÇÃO'}`);
    console.log(`📱 Platform: ${Platform.OS}`);
    console.log(`🌉 httpBridge disponível: ${httpBridge !== null}`);
    console.log(`🌐 Modo do servidor: ${this.isRealServerMode ? 'REAL' : 'SIMULADO'}`);
  }

  private async getNetworkState(): Promise<NetworkInfo | null> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const ipAddress = await Network.getIpAddressAsync();
      
      return {
        type: networkState.type?.toString() || 'unknown',
        isConnected: networkState.isConnected ?? null,
        details: {
          ipAddress: ipAddress,
          isInternetReachable: networkState.isInternetReachable ?? null
        }
      };
    } catch (error: any) {
      console.warn('Error getting network state:', error);
      return null;
    }
  }

  private notifyStatusChange() {
    const status = this.getStatus();
    this.statusCallbacks.forEach(callback => callback(status));
  }

  private generateWebHTML() {
    return `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌐 GastoMetria - Dashboard Mobile</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/chart.js@4.4.0/dist/chart.umd.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .card { background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-radius: 16px; padding: 2rem; box-shadow: 0 8px 32px rgba(0,0,0,0.1); margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.2); }
        .glass-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(15px); border-radius: 20px; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.2); }
        .grid { display: grid; gap: 1.5rem; }
        .grid-2 { grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); }
        .grid-4 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
        .text-xl { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #1f2937; }
        .text-sm { font-size: 0.875rem; color: #6b7280; }
        .text-2xl { font-size: 2.5rem; font-weight: bold; }
        .text-green { color: #059669; }
        .text-blue { color: #2563eb; }
        .text-purple { color: #7c3aed; }
        .text-orange { color: #ea580c; }
        .btn { padding: 0.75rem 1.5rem; border-radius: 12px; border: none; cursor: pointer; font-weight: 600; transition: all 0.3s ease; }
        .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
        .status-indicator { display: inline-flex; align-items: center; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.875rem; font-weight: 500; }
        .status-online { background: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.2); }
        .loading { text-align: center; padding: 3rem; color: white; }
        .hero-section { text-align: center; margin-bottom: 3rem; }
        .hero-title { font-size: 3rem; font-weight: 900; color: white; margin-bottom: 0.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .hero-subtitle { font-size: 1.2rem; color: rgba(255,255,255,0.9); }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .chart-container { height: 300px; position: relative; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero-section">
            <h1 class="hero-title">💰 GastoMetria</h1>
            <p class="hero-subtitle">Dashboard em tempo real servido diretamente do seu celular</p>
            <div class="status-indicator status-online" style="display: inline-flex; margin-top: 1rem;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; margin-right: 8px; animation: pulse 2s infinite;"></div>
                Servidor ativo em \${window.location.host}
            </div>
        </div>

        <div id="dashboard-content" class="loading">
            <div class="animate-pulse">🔄 Carregando dados...</div>
        </div>
    </div>

    <script>
        let dashboardData = null;

        async function loadDashboardData() {
            try {
                const [statsResponse, itemsResponse] = await Promise.all([
                    fetch('/api/stats'),
                    fetch('/api/items')
                ]);

                const stats = await statsResponse.json();
                const items = await itemsResponse.json();

                dashboardData = { stats, items };
                renderDashboard();
            } catch (error) {
                document.getElementById('dashboard-content').innerHTML = 
                    '<div class="card"><p style="color: #ef4444; text-align: center; font-size: 1.2rem;">❌ Erro ao carregar dados: ' + error.message + '</p></div>';
            }
        }

        function renderDashboard() {
            if (!dashboardData) return;

            const { stats, items } = dashboardData;

            const content = \`
                <div class="grid grid-4">
                    <div class="glass-card">
                        <div class="text-sm" style="color: rgba(255,255,255,0.8);">Total Gasto</div>
                        <div class="text-2xl text-green">R$ \${stats.totalGasto?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div class="glass-card">
                        <div class="text-sm" style="color: rgba(255,255,255,0.8);">Total de Itens</div>
                        <div class="text-2xl text-blue">\${stats.totalItens || 0}</div>
                    </div>
                    <div class="glass-card">
                        <div class="text-sm" style="color: rgba(255,255,255,0.8);">Estabelecimentos</div>
                        <div class="text-2xl text-purple">\${stats.estabelecimentosUnicos || 0}</div>
                    </div>
                    <div class="glass-card">
                        <div class="text-sm" style="color: rgba(255,255,255,0.8);">Gasto Médio</div>
                        <div class="text-2xl text-orange">R$ \${stats.gastoMedio?.toFixed(2) || '0.00'}</div>
                    </div>
                </div>

                <div class="grid grid-2">
                    <div class="card">
                        <h2 class="text-xl">📋 Últimas Compras</h2>
                        <div style="max-height: 350px; overflow-y: auto;">
                            \${items.slice(0, 10).map(item => \`
                                <div style="padding: 1rem 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-weight: 600; color: #1f2937;">\${item.produto}</div>
                                        <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">📍 \${item.estabelecimento}</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-weight: 700; color: #059669;">R$ \${item.valor?.toFixed(2) || '0.00'}</div>
                                        <div style="font-size: 0.75rem; color: #9ca3af;">\${new Date(item.data || Date.now()).toLocaleDateString('pt-BR')}</div>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>

                    <div class="card">
                        <h2 class="text-xl">🏪 Top Estabelecimentos</h2>
                        <div style="max-height: 350px; overflow-y: auto;">
                            \${getTopEstabelecimentos(items).map((est, index) => \`
                                <div style="padding: 1rem 0; border-bottom: 1px solid #e5e7eb;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div style="display: flex; align-items: center;">
                                            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 1rem;">
                                                \${index + 1}
                                            </div>
                                            <div>
                                                <div style="font-weight: 600; color: #1f2937;">\${est.name}</div>
                                                <div style="font-size: 0.875rem; color: #6b7280;">\${est.count} compras</div>
                                            </div>
                                        </div>
                                        <div style="font-weight: 700; color: #059669; font-size: 1.1rem;">R$ \${est.total.toFixed(2)}</div>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h2 class="text-xl">🔧 Informações do Servidor</h2>
                    <div class="grid grid-2">
                        <div>
                            <div class="text-sm">🌐 Endereço do Servidor</div>
                            <div style="font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; background: #f3f4f6; padding: 1rem; border-radius: 8px; margin-top: 0.5rem; border-left: 4px solid #667eea;">
                                \${window.location.href}
                            </div>
                        </div>
                        <div>
                            <div class="text-sm">🕒 Última Atualização</div>
                            <div style="margin-top: 0.5rem; padding: 1rem; background: #f8fafc; border-radius: 8px;">
                                \${new Date().toLocaleString('pt-BR')}
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                        <button class="btn btn-primary" onclick="loadDashboardData()">
                            🔄 Atualizar Dados
                        </button>
                        <button class="btn btn-primary" onclick="window.location.reload()">
                            ↻ Recarregar Página
                        </button>
                    </div>
                </div>
            \`;

            document.getElementById('dashboard-content').innerHTML = content;
        }

        function getTopEstabelecimentos(items) {
            const estabelecimentos = {};
            
            items.forEach(item => {
                const nome = item.estabelecimento || 'Não informado';
                if (!estabelecimentos[nome]) {
                    estabelecimentos[nome] = { count: 0, total: 0 };
                }
                estabelecimentos[nome].count++;
                estabelecimentos[nome].total += item.valor || 0;
            });

            return Object.entries(estabelecimentos)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);
        }

        // Auto-refresh a cada 10 segundos
        setInterval(loadDashboardData, 10000);
        
        // Carregar dados iniciais
        loadDashboardData();
    </script>
</body>
</html>`;
  }

  async startServer(): Promise<void> {
    try {
      this.networkInfo = await this.getNetworkState();
      
      if (!this.networkInfo?.isConnected) {
        throw new Error('Sem conexão de rede');
      }

      if (Platform.OS === 'web') {
        throw new Error('Servidor não disponível na versão web');
      }

      // Tentar sempre o servidor real primeiro se o httpBridge estiver disponível
      if (httpBridge && typeof httpBridge.start === 'function') {
        console.log('🚀 Tentando iniciar servidor HTTP real...');
        console.log(`📡 Iniciando servidor na porta ${this.config.port} para aceitar conexões externas...`);
        console.log(`🌐 IP do dispositivo: ${this.networkInfo.details.ipAddress}`);
        
        try {
          // Configurar servidor HTTP para aceitar conexões de qualquer IP
          // Verificar se há método para configurar host
          console.log('🔧 Configurando servidor para aceitar conexões externas...');
          
          // Tentar diferentes formas de configurar o servidor
          if (httpBridge.bind) {
            // Se existir método bind, usar para todas as interfaces
            httpBridge.bind('0.0.0.0', this.config.port);
          }
          
          // Iniciar servidor HTTP
          httpBridge.start(this.config.port, 'http_service', (request: any) => {
            console.log(`📨 Requisição recebida: ${request.method} ${request.url} de ${request.remoteAddress || 'unknown'}`);
            this.handleHttpRequest(request);
          });
          
          this.isRealServerMode = true;
          console.log('✅ Servidor HTTP REAL iniciado com sucesso!');
          
        } catch (bridgeError) {
          console.error('❌ Erro ao iniciar servidor real:', bridgeError);
          this.isRealServerMode = false;
          console.log('🔧 Fallback para servidor simulado...');
          this.startSimulatedServer();
        }
      } else {
        console.warn('⚠️ httpBridge não disponível ou sem método start');
        console.log('🔧 Usando servidor simulado...');
        this.isRealServerMode = false;
        this.startSimulatedServer();
      }

      this.isRunning = true;
      this.config.enabled = true;

      // Salvar configuração
      await AsyncStorage.setItem('webserver_config', JSON.stringify(this.config));
      
      const serverType = this.isRealServerMode ? 'REAL' : 'SIMULADO';
      console.log(`🌐 Servidor ${serverType} iniciado em ${this.networkInfo.details.ipAddress}:${this.config.port}`);
      this.notifyStatusChange();
      
    } catch (error: any) {
      throw new Error(`Falha ao iniciar servidor: ${error?.message || error}`);
    }
  }

  private startSimulatedServer() {
    // Servidor simulado para desenvolvimento
    // Cria um servidor "virtual" que responde às requisições localmente
    this.simulatedServer = {
      port: this.config.port,
      isActive: true,
      lastRequest: null
    };
    
    console.log('📱 Servidor simulado ativo - em desenvolvimento, use o build APK para servidor real');
  }

  async stopServer(): Promise<void> {
    try {
      if (this.isRealServerMode && httpBridge && httpBridge.stop) {
        try {
          httpBridge.stop();
          console.log('🛑 Servidor HTTP real parado');
        } catch (bridgeError) {
          console.warn('Aviso ao parar servidor real:', bridgeError);
        }
      } else {
        this.simulatedServer = null;
        console.log('🛑 Servidor simulado parado');
      }
      
      this.isRunning = false;
      this.config.enabled = false;
      
      await AsyncStorage.setItem('webserver_config', JSON.stringify(this.config));
      this.notifyStatusChange();
    } catch (error) {
      console.warn('Erro ao parar servidor:', error);
    }
  }

  private async handleHttpRequest(request: any) {
    try {
      const { url, method } = request;
      const path = url.split('?')[0];
      
      console.log(`📨 ${method} ${path}`);

      let response;
      
      if (path === '/') {
        response = {
          content: this.generateWebHTML(),
          contentType: 'text/html; charset=utf-8'
        };
      } else if (path.startsWith('/api/')) {
        response = await this.handleApiRequest(path);
      } else {
        response = {
          content: JSON.stringify({ error: 'Not Found' }),
          contentType: 'application/json',
          statusCode: 404
        };
      }

      httpBridge.respond(request.requestId, response.statusCode || 200, response.contentType, response.content);
    } catch (error) {
      console.error('Erro ao processar requisição:', error);
      httpBridge.respond(request.requestId, 500, 'application/json', 
        JSON.stringify({ error: 'Internal Server Error' }));
    }
  }

  private async handleApiRequest(path: string): Promise<any> {
    const storageService = StorageService.getInstance();
    const items = await storageService.getAllPurchaseItems();

    switch (path) {
      case '/api/stats':
        const stats = this.calculateStats(items);
        return {
          content: JSON.stringify(stats),
          contentType: 'application/json'
        };

      case '/api/items':
        return {
          content: JSON.stringify(items),
          contentType: 'application/json'
        };

      case '/api/establishments':
        const establishments = this.getEstablishmentStats(items);
        return {
          content: JSON.stringify(establishments),
          contentType: 'application/json'
        };

      case '/api/products':
        const products = this.getProductStats(items);
        return {
          content: JSON.stringify(products),
          contentType: 'application/json'
        };

      default:
        return {
          content: JSON.stringify({ error: 'API endpoint not found' }),
          contentType: 'application/json',
          statusCode: 404
        };
    }
  }

  getStatus(): ServerStatus {
    let url = null;
    let error = null;

    if (this.isRunning && this.networkInfo?.details?.ipAddress) {
      if (this.isRealServerMode) {
        url = `http://${this.networkInfo.details.ipAddress}:${this.config.port}`;
        error = null; // Servidor real funcionando
      } else {
        url = `http://${this.networkInfo.details.ipAddress}:${this.config.port} (simulado)`;
        error = `⚠️ Servidor HTTP real não disponível - verifique se react-native-http-bridge está configurado corretamente.`;
      }
    }

    return {
      isRunning: this.isRunning,
      url,
      networkInfo: this.networkInfo,
      error
    };
  }

  async getNetworkInfo(): Promise<NetworkInfo | null> {
    this.networkInfo = await this.getNetworkState();
    return this.networkInfo;
  }

  onStatusChange(callback: (status: ServerStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  // Métodos de estatísticas
  private calculateStats(items: any[]) {
    const totalGasto = items.reduce((sum, item) => sum + (item.valor || 0), 0);
    const totalItens = items.length;
    const estabelecimentosUnicos = new Set(items.map(item => item.estabelecimento)).size;
    const gastoMedio = totalItens > 0 ? totalGasto / totalItens : 0;

    return {
      totalGasto,
      totalItens,
      estabelecimentosUnicos,
      gastoMedio
    };
  }

  private getEstablishmentStats(items: any[]) {
    const establishments: Record<string, any> = {};
    
    items.forEach(item => {
      const nome = item.estabelecimento || 'Não informado';
      if (!establishments[nome]) {
        establishments[nome] = { count: 0, total: 0, items: [] };
      }
      establishments[nome].count++;
      establishments[nome].total += item.valor || 0;
      establishments[nome].items.push(item);
    });

    return Object.entries(establishments)
      .map(([name, data]: [string, any]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }

  private getProductStats(items: any[]) {
    const products: Record<string, any> = {};
    
    items.forEach(item => {
      const nome = item.produto || 'Não informado';
      if (!products[nome]) {
        products[nome] = { count: 0, total: 0, avgPrice: 0 };
      }
      products[nome].count++;
      products[nome].total += item.valor || 0;
      products[nome].avgPrice = products[nome].total / products[nome].count;
    });

    return Object.entries(products)
      .map(([name, data]: [string, any]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }

  // Método para manipular requisições web (para compatibilidade)
  async handleWebRequest(path: string): Promise<{ content: string }> {
    try {
      const storageService = StorageService.getInstance();
      const items = await storageService.getAllPurchaseItems();
      
      switch (path) {
        case '/api/stats':
          const stats = this.calculateStats(items);
          return { content: JSON.stringify(stats) };
        case '/api/items':
          return { content: JSON.stringify(items) };
        case '/api/establishments':
          const establishmentStats = this.getEstablishmentStats(items);
          return { content: JSON.stringify(establishmentStats) };
        case '/api/products':
          const productStats = this.getProductStats(items);
          return { content: JSON.stringify(productStats) };
        default:
          throw new Error('Endpoint não encontrado');
      }
    } catch (error) {
      throw new Error(`Erro ao processar requisição: ${(error as Error).message}`);
    }
  }
}

export default new RealWebServerService();
