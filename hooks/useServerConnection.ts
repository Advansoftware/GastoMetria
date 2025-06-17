import { useState, useCallback } from 'react';
import { useServerDiscovery } from './useServerDiscovery';

interface ServerData {
  items: any[];
  stats: any;
  products: any[];
  establishments: any[];
}

interface UseServerConnectionReturn {
  isConnected: boolean;
  isLoading: boolean;
  serverUrl: string;
  serverData: ServerData;
  error: string | null;
  setServerUrl: (url: string) => void;
  connectToServer: () => Promise<boolean>;
  disconnectFromServer: () => void;
  refreshData: () => Promise<void>;
  // Discovery features
  isScanning: boolean;
  foundServers: Array<{
    url: string;
    name: string;
    status: 'online' | 'offline';
    lastSeen: Date;
  }>;
  scanForServers: () => Promise<void>;
  connectToFoundServer: (url: string) => Promise<boolean>;
}

export function useServerConnection(): UseServerConnectionReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [serverData, setServerData] = useState<ServerData>({
    items: [],
    stats: {},
    products: [],
    establishments: []
  });
  const [error, setError] = useState<string | null>(null);

  // Use server discovery hook
  const {
    isScanning,
    foundServers,
    scanForServers,
    addManualServer,
    testServerConnection
  } = useServerDiscovery();

  const connectToFoundServer = useCallback(async (url: string): Promise<boolean> => {
    setServerUrl(url);
    return await connectToServer();
  }, []);

  const connectToServer = useCallback(async (): Promise<boolean> => {
    if (!serverUrl) {
      setError('URL do servidor é obrigatória');
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Test connection first
      const statusResponse = await fetch(`${serverUrl}/api/status`);
      if (!statusResponse.ok) {
        throw new Error('Servidor não encontrado');
      }
      
      // Fetch all data
      const [itemsRes, statsRes, productsRes, establishmentsRes] = await Promise.all([
        fetch(`${serverUrl}/api/items`),
        fetch(`${serverUrl}/api/stats`),
        fetch(`${serverUrl}/api/products`),
        fetch(`${serverUrl}/api/establishments`)
      ]);

      const [itemsData, statsData, productsData, establishmentsData] = await Promise.all([
        itemsRes.json(),
        statsRes.json(),
        productsRes.json(),
        establishmentsRes.json()
      ]);

      setServerData({
        items: itemsData.items || [],
        stats: statsData,
        products: productsData.products || [],
        establishments: establishmentsData.establishments || []
      });

      setIsConnected(true);
      
      // Add to found servers if not already there
      await addManualServer(serverUrl);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [serverUrl, addManualServer]);

  const disconnectFromServer = useCallback(() => {
    setIsConnected(false);
    setError(null);
    setServerData({
      items: [],
      stats: {},
      products: [],
      establishments: []
    });
  }, []);

  const refreshData = useCallback(async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [itemsRes, statsRes, productsRes, establishmentsRes] = await Promise.all([
        fetch(`${serverUrl}/api/items`),
        fetch(`${serverUrl}/api/stats`),
        fetch(`${serverUrl}/api/products`),
        fetch(`${serverUrl}/api/establishments`)
      ]);

      const [itemsData, statsData, productsData, establishmentsData] = await Promise.all([
        itemsRes.json(),
        statsRes.json(),
        productsRes.json(),
        establishmentsRes.json()
      ]);

      setServerData({
        items: itemsData.items || [],
        stats: statsData,
        products: productsData.products || [],
        establishments: establishmentsData.establishments || []
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar dados';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, serverUrl]);

  return {
    isConnected,
    isLoading,
    serverUrl,
    serverData,
    error,
    setServerUrl,
    connectToServer,
    disconnectFromServer,
    refreshData,
    // Discovery features
    isScanning,
    foundServers,
    scanForServers,
    connectToFoundServer
  };
}
