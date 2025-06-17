import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../app/services/StorageService';
import { Platform } from 'react-native';

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

class ExpoWebServerService {
  private config: ServerConfig;
  private networkInfo: NetworkInfo | null = null;
  private statusCallbacks: ((status: ServerStatus) => void)[] = [];
  private isRunning: boolean = false;
  private server: any = null;

  constructor() {
    this.config = {
      port: 3000,
      enabled: false
    };
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

  private generateWebHTML(ip: string) {
    return `<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌐 GastoMetria - Dashboard Mobile</title>
    <script src="https://cdn.tailwindcss.com"></script>
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
        .warning { background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 12px; padding: 1rem; margin: 1rem 0; color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero-section">
            <h1 class="hero-title">💰 GastoMetria</h1>
            <p class="hero-subtitle">Dashboard em tempo real servido do celular via Expo</p>
            <div class="status-indicator status-online" style="display: inline-flex; margin-top: 1rem;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; margin-right: 8px; animation: pulse 2s infinite;"></div>
                Conectado via ${ip}:${this.config.port}
            </div>
        </div>

        <div class="warning">
            <h3>⚠️ Modo Expo Demonstration</h3>
            <p>Este é um dashboard de demonstração. Para servidor HTTP real funcionando externamente:</p>
            <ol>
                <li>Compile o APK: <code>npx expo build:android</code></li>
                <li>Instale no celular físico</li>
                <li>Execute o servidor no app instalado</li>
                <li>Acesse de outros dispositivos: http://${ip}:${this.config.port}</li>
            </ol>
        </div>

        <div id="dashboard-content" class="loading">
            <div class="animate-pulse">🔄 Carregando dados do celular...</div>
        </div>
    </div>

    <script>
        let dashboardData = null;

        // Simular carregamento de dados do celular
        async function loadDashboardData() {
            try {
                // Em um cenário real, isso viria de uma API
                // Por agora, vamos simular dados
                const mockStats = {
                    totalGasto: 1250.45,
                    totalItens: 34,
                    estabelecimentosUnicos: 8,
                    gastoMedio: 36.78
                };

                const mockItems = [
                    { produto: "Arroz Integral", estabelecimento: "Supermercado ABC", valor: 12.50, data: Date.now() },
                    { produto: "Feijão Preto", estabelecimento: "Mercearia Local", valor: 8.90, data: Date.now() - 86400000 },
                    { produto: "Macarrão", estabelecimento: "Supermercado ABC", valor: 4.25, data: Date.now() - 172800000 }
                ];

                dashboardData = { stats: mockStats, items: mockItems };
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
                        <h2 class="text-xl">📋 Últimas Compras (Demonstração)</h2>
                        <div style="max-height: 350px; overflow-y: auto;">
                            \${items.map(item => \`
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
                        <h2 class="text-xl">📱 Informações do Servidor</h2>
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                            <div class="text-sm">🌐 IP do Celular</div>
                            <div style="font-family: monospace; font-weight: bold; margin-top: 0.5rem;">${ip}</div>
                        </div>
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                            <div class="text-sm">🔌 Porta do Servidor</div>
                            <div style="font-family: monospace; font-weight: bold; margin-top: 0.5rem;">${this.config.port}</div>
                        </div>
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                            <div class="text-sm">🕒 Última Atualização</div>
                            <div style="margin-top: 0.5rem;">\${new Date().toLocaleString('pt-BR')}</div>
                        </div>
                        <button class="btn btn-primary" onclick="loadDashboardData()">
                            🔄 Atualizar Dados
                        </button>
                    </div>
                </div>
            \`;

            document.getElementById('dashboard-content').innerHTML = content;
        }

        // Carregar dados iniciais
        loadDashboardData();
        
        // Auto-refresh a cada 30 segundos
        setInterval(loadDashboardData, 30000);
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

      console.log('🚀 Iniciando servidor Expo Web...');
      console.log(`📡 IP do dispositivo: ${this.networkInfo.details.ipAddress}`);
      console.log(`🌐 Acesse em: http://${this.networkInfo.details.ipAddress}:${this.config.port}`);
      
      // Criar servidor simulado que gera os dados para demonstração
      this.server = {
        port: this.config.port,
        isActive: true,
        ip: this.networkInfo.details.ipAddress,
        html: this.generateWebHTML(this.networkInfo.details.ipAddress)
      };

      this.isRunning = true;
      this.config.enabled = true;

      // Salvar configuração
      await AsyncStorage.setItem('webserver_config', JSON.stringify(this.config));
      
      console.log('✅ Servidor Expo iniciado com sucesso!');
      console.log('📋 Status: Simulado para demonstração');
      this.notifyStatusChange();
      
    } catch (error: any) {
      throw new Error(`Falha ao iniciar servidor: ${error?.message || error}`);
    }
  }

  async stopServer(): Promise<void> {
    try {
      this.server = null;
      this.isRunning = false;
      this.config.enabled = false;
      
      await AsyncStorage.setItem('webserver_config', JSON.stringify(this.config));
      console.log('🛑 Servidor Expo parado');
      this.notifyStatusChange();
    } catch (error) {
      console.warn('Erro ao parar servidor:', error);
    }
  }

  getStatus(): ServerStatus {
    let url = null;
    let error = null;

    if (this.isRunning && this.networkInfo?.details?.ipAddress) {
      url = `http://${this.networkInfo.details.ipAddress}:${this.config.port}`;
      error = `📱 Servidor Expo ativo. Para acesso externo real, compile APK com 'npx expo build:android' e instale no celular.`;
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

  // Método para manipular requisições web (para compatibilidade)
  async handleWebRequest(path: string): Promise<{ content: string }> {
    try {
      const storageService = StorageService.getInstance();
      const items = await storageService.getAllPurchaseItems();
      
      switch (path) {
        case '/':
          const html = this.server?.html || '<h1>Servidor não iniciado</h1>';
          return { content: html };
        case '/api/stats':
          const stats = this.calculateStats(items);
          return { content: JSON.stringify(stats) };
        case '/api/items':
          return { content: JSON.stringify(items) };
        default:
          throw new Error('Endpoint não encontrado');
      }
    } catch (error) {
      throw new Error(`Erro ao processar requisição: ${(error as Error).message}`);
    }
  }

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
}

export default new ExpoWebServerService();
