import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface LocalServerConfig {
  port: number;
  enabled: boolean;
}

interface NetworkInfo {
  type: string;
  isConnected: boolean | null;
  details: any;
}

interface ServerStatus {
  isRunning: boolean;
  url: string | null;
  networkInfo: NetworkInfo | null;
  error: string | null;
}

// Mock server implementation for demonstration
class LocalServerService {
  private config: LocalServerConfig;
  private networkInfo: NetworkInfo | null = null;
  private statusCallbacks: ((status: ServerStatus) => void)[] = [];

  constructor() {
    this.config = {
      port: 3000,
      enabled: false
    };
  }

  private notifyStatusChange() {
    const status = this.getStatus();
    this.statusCallbacks.forEach(callback => callback(status));
  }

  // Simulate getting network info
  private async getNetworkState(): Promise<NetworkInfo | null> {
    try {
      // Mock network info for demonstration
      return {
        type: 'wifi',
        isConnected: true,
        details: {
          ipAddress: '192.168.1.100', // Mock IP - in real implementation this would be dynamic
          isInternetReachable: true
        }
      };
    } catch (error) {
      return null;
    }
  }

  // Public API for handling requests (used by external clients)
  async handleAPIRequest(method: string, path: string, query?: any): Promise<any> {
    if (!this.config.enabled) {
      throw new Error('Server not running');
    }
    
    // Mock API responses
    switch (path) {
      case '/api/status':
        return {
          status: 'online',
          timestamp: new Date().toISOString(),
          network: this.networkInfo,
          appName: 'GastoMetria',
          version: '1.0.0'
        };
        
      case '/api/items':
        try {
          const storedData = await AsyncStorage.getItem('gastometria_items');
          const items = storedData ? JSON.parse(storedData) : [];
          return { 
            items,
            count: items.length,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          throw new Error('Failed to fetch items');
        }
        
      case '/api/stats':
        try {
          const storedData = await AsyncStorage.getItem('gastometria_items');
          const items = storedData ? JSON.parse(storedData) : [];
          
          const totalValue = items.reduce((sum: number, item: any) => sum + item.preco, 0);
          const uniqueProducts = [...new Set(items.map((item: any) => item.produto))];
          const uniqueEstablishments = [...new Set(items.map((item: any) => item.estabelecimento))];
          
          return {
            totalItems: items.length,
            totalValue: parseFloat(totalValue.toFixed(2)),
            uniqueProducts: uniqueProducts.length,
            uniqueEstablishments: uniqueEstablishments.length,
            avgItemValue: items.length > 0 ? parseFloat((totalValue / items.length).toFixed(2)) : 0,
            lastUpdate: new Date().toISOString()
          };
        } catch (error) {
          throw new Error('Failed to fetch stats');
        }
        
      case '/api/products':
        try {
          const storedData = await AsyncStorage.getItem('gastometria_items');
          const items = storedData ? JSON.parse(storedData) : [];
          
          const productStats = items.reduce((acc: any, item: any) => {
            if (!acc[item.produto]) {
              acc[item.produto] = {
                name: item.produto,
                totalValue: 0,
                count: 0,
                establishments: new Set(),
                items: []
              };
            }
            acc[item.produto].totalValue += item.preco;
            acc[item.produto].count += 1;
            acc[item.produto].establishments.add(item.estabelecimento);
            acc[item.produto].items.push(item);
            return acc;
          }, {});

          const products = Object.values(productStats).map((product: any) => ({
            name: product.name,
            totalValue: parseFloat(product.totalValue.toFixed(2)),
            count: product.count,
            establishments: Array.from(product.establishments),
            avgPrice: parseFloat((product.totalValue / product.count).toFixed(2)),
            items: product.items
          }));

          return { 
            products: products.sort((a: any, b: any) => b.totalValue - a.totalValue),
            count: products.length
          };
        } catch (error) {
          throw new Error('Failed to fetch products');
        }
        
      case '/api/establishments':
        try {
          const storedData = await AsyncStorage.getItem('gastometria_items');
          const items = storedData ? JSON.parse(storedData) : [];
          
          const establishmentStats = items.reduce((acc: any, item: any) => {
            if (!acc[item.estabelecimento]) {
              acc[item.estabelecimento] = {
                name: item.estabelecimento,
                totalValue: 0,
                count: 0,
                products: new Set(),
                items: []
              };
            }
            acc[item.estabelecimento].totalValue += item.preco;
            acc[item.estabelecimento].count += 1;
            acc[item.estabelecimento].products.add(item.produto);
            acc[item.estabelecimento].items.push(item);
            return acc;
          }, {});

          const establishments = Object.values(establishmentStats).map((establishment: any) => ({
            name: establishment.name,
            totalValue: parseFloat(establishment.totalValue.toFixed(2)),
            count: establishment.count,
            products: Array.from(establishment.products),
            avgPrice: parseFloat((establishment.totalValue / establishment.count).toFixed(2)),
            items: establishment.items
          }));

          return { 
            establishments: establishments.sort((a: any, b: any) => b.totalValue - a.totalValue),
            count: establishments.length
          };
        } catch (error) {
          throw new Error('Failed to fetch establishments');
        }
        
      default:
        throw new Error('Not found');
    }
  }

  async start(): Promise<boolean> {
    if (Platform.OS === 'web') {
      // Web version doesn't support server
      return false;
    }

    try {
      // Get network info
      this.networkInfo = await this.getNetworkState();
      
      // Simulate server start
      this.config.enabled = true;
      console.log(`Local server started on port ${this.config.port}`);
      this.notifyStatusChange();
      
      return true;
    } catch (error) {
      console.error('Failed to start server:', error);
      return false;
    }
  }

  async stop(): Promise<boolean> {
    try {
      this.config.enabled = false;
      console.log('Local server stopped');
      this.notifyStatusChange();
      return true;
    } catch (error) {
      console.error('Failed to stop server:', error);
      return false;
    }
  }

  isRunning(): boolean {
    return this.config.enabled;
  }

  getServerUrl(): string | null {
    if (!this.config.enabled || !this.networkInfo?.isConnected) {
      return null;
    }
    
    // Get local IP address from network info
    const details = this.networkInfo.details as any;
    const ip = details?.ipAddress || 'localhost';
    return `http://${ip}:${this.config.port}`;
  }

  getStatus(): ServerStatus {
    return {
      isRunning: this.config.enabled,
      url: this.getServerUrl(),
      networkInfo: this.networkInfo,
      error: null
    };
  }

  onStatusChange(callback: (status: ServerStatus) => void) {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }

  async getNetworkInfo(): Promise<NetworkInfo | null> {
    try {
      this.networkInfo = await this.getNetworkState();
      return this.networkInfo;
    } catch (error) {
      console.error('Failed to get network info:', error);
      return null;
    }
  }

  setPort(port: number) {
    this.config.port = port;
  }

  getPort(): number {
    return this.config.port;
  }
}

export default new LocalServerService();
