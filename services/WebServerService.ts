import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from '../app/services/StorageService';

interface ServerConfig {
  port: number;
  enabled: boolean;
}

interface NetworkInfo {
  type: string;
  isConnected: boolean | null | undefined;
  details: {
    ipAddress: string;
    isInternetReachable: boolean | null | undefined;
  };
}

interface ServerStatus {
  isRunning: boolean;
  url: string | null;
  networkInfo: NetworkInfo | null;
  error: string | null;
}

class WebServerService {
  private config: ServerConfig;
  private networkInfo: NetworkInfo | null = null;
  private statusCallbacks: ((status: ServerStatus) => void)[] = [];
  private isRunning: boolean = false;

  constructor() {
    this.config = {
      port: 3000,
      enabled: false
    };
  }

  private async getNetworkState() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const ipAddress = await Network.getIpAddressAsync();
      
      return {
        type: networkState.type?.toString() || 'unknown',
        isConnected: networkState.isConnected,
        details: {
          ipAddress: ipAddress,
          isInternetReachable: networkState.isInternetReachable
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
    <title>GastoMetria - Dashboard</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/recharts@2.8.0/esm/index.js" type="module"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .card { background: white; border-radius: 0.5rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem; }
        .grid { display: grid; gap: 1rem; }
        .grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
        .grid-4 { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
        .text-xl { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; }
        .text-sm { font-size: 0.875rem; color: #6b7280; }
        .text-2xl { font-size: 2rem; font-weight: bold; color: #111827; }
        .text-green { color: #059669; }
        .text-blue { color: #2563eb; }
        .text-purple { color: #7c3aed; }
        .text-orange { color: #ea580c; }
        .btn { padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; font-weight: 500; }
        .btn-primary { background: #2563eb; color: white; }
        .btn-primary:hover { background: #1d4ed8; }
        .status-indicator { display: inline-block; width: 0.75rem; height: 0.75rem; border-radius: 50%; margin-right: 0.5rem; }
        .status-online { background: #10b981; }
        .status-offline { background: #ef4444; }
        .loading { text-align: center; padding: 2rem; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h1 style="font-size: 2rem; font-weight: bold; color: #111827;">
                    💰 GastoMetria Dashboard
                </h1>
                <div>
                    <span class="status-indicator status-online"></span>
                    <span style="color: #059669; font-weight: 500;">Servidor Ativo</span>
                </div>
            </div>
            <p class="text-sm">Dashboard completo do GastoMetria servido diretamente do seu celular</p>
        </div>

        <div id="dashboard-content" class="loading">
            Carregando dados...
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
                    '<div class="card"><p style="color: #ef4444;">Erro ao carregar dados: ' + error.message + '</p></div>';
            }
        }

        function renderDashboard() {
            if (!dashboardData) return;

            const { stats, items } = dashboardData;

            const content = \`
                <div class="grid grid-4">
                    <div class="card">
                        <div class="text-sm">Total Gasto</div>
                        <div class="text-2xl text-green">R$ \${stats.totalGasto?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div class="card">
                        <div class="text-sm">Total de Itens</div>
                        <div class="text-2xl text-blue">\${stats.totalItens || 0}</div>
                    </div>
                    <div class="card">
                        <div class="text-sm">Estabelecimentos</div>
                        <div class="text-2xl text-purple">\${stats.estabelecimentosUnicos || 0}</div>
                    </div>
                    <div class="card">
                        <div class="text-sm">Gasto Médio</div>
                        <div class="text-2xl text-orange">R$ \${stats.gastoMedio?.toFixed(2) || '0.00'}</div>
                    </div>
                </div>

                <div class="grid grid-2">
                    <div class="card">
                        <h2 class="text-xl">Últimas Compras</h2>
                        <div style="max-height: 300px; overflow-y: auto;">
                            \${items.slice(0, 10).map(item => \`
                                <div style="padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
                                    <div style="font-weight: 500;">\${item.produto}</div>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: #6b7280;">
                                        <span>\${item.estabelecimento}</span>
                                        <span>R$ \${item.valor?.toFixed(2) || '0.00'}</span>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>

                    <div class="card">
                        <h2 class="text-xl">Top Estabelecimentos</h2>
                        <div style="max-height: 300px; overflow-y: auto;">
                            \${getTopEstabelecimentos(items).map((est, index) => \`
                                <div style="padding: 0.75rem 0; border-bottom: 1px solid #e5e7eb;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <div style="font-weight: 500;">\${est.name}</div>
                                            <div style="font-size: 0.875rem; color: #6b7280;">\${est.count} compras</div>
                                        </div>
                                        <div style="font-weight: 600; color: #059669;">R$ \${est.total.toFixed(2)}</div>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h2 class="text-xl">Informações do Servidor</h2>
                    <div class="grid grid-2">
                        <div>
                            <div class="text-sm">Endereço do Servidor</div>
                            <div style="font-family: monospace; background: #f3f4f6; padding: 0.5rem; border-radius: 0.25rem; margin-top: 0.5rem;">
                                \${window.location.href}
                            </div>
                        </div>
                        <div>
                            <div class="text-sm">Última Atualização</div>
                            <div style="margin-top: 0.5rem;">\${new Date().toLocaleString('pt-BR')}</div>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="loadDashboardData()" style="margin-top: 1rem;">
                        🔄 Atualizar Dados
                    </button>
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

        // Auto-refresh a cada 30 segundos
        setInterval(loadDashboardData, 30000);
        
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

      // Em React Native, não podemos criar um servidor HTTP real
      // Vamos simular o servidor e usar um WebView ou similar
      this.isRunning = true;
      this.config.enabled = true;

      // Salvar configuração
      await AsyncStorage.setItem('webserver_config', JSON.stringify(this.config));
      
      this.notifyStatusChange();
    } catch (error: any) {
      throw new Error(`Falha ao iniciar servidor: ${error?.message || error}`);
    }
  }

  async stopServer(): Promise<void> {
    this.isRunning = false;
    this.config.enabled = false;
    
    await AsyncStorage.setItem('webserver_config', JSON.stringify(this.config));
    this.notifyStatusChange();
  }

  getStatus(): ServerStatus {
    const url = this.isRunning && this.networkInfo?.details?.ipAddress 
      ? `http://${this.networkInfo.details.ipAddress}:${this.config.port}`
      : null;

    return {
      isRunning: this.isRunning,
      url,
      networkInfo: this.networkInfo,
      error: null
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

  // API Endpoints simulados
  async handleWebRequest(path: string, query?: any): Promise<any> {
    const storageService = StorageService.getInstance();
    const items = await storageService.getAllPurchaseItems();

    switch (path) {
      case '/':
        return {
          content: this.generateWebHTML(),
          contentType: 'text/html'
        };

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
        throw new Error('Página não encontrada');
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
}

export default new WebServerService();
