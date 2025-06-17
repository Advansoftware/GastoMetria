import { useState, useCallback, useEffect } from 'react';

interface ServerDiscovery {
  isScanning: boolean;
  foundServers: Array<{
    url: string;
    name: string;
    status: 'online' | 'offline';
    lastSeen: Date;
  }>;
  error: string | null;
}

interface UseServerDiscoveryReturn extends ServerDiscovery {
  scanForServers: () => Promise<void>;
  addManualServer: (url: string) => Promise<boolean>;
  testServerConnection: (url: string) => Promise<boolean>;
}

export function useServerDiscovery(): UseServerDiscoveryReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [foundServers, setFoundServers] = useState<Array<{
    url: string;
    name: string;
    status: 'online' | 'offline';
    lastSeen: Date;
  }>>([]);
  const [error, setError] = useState<string | null>(null);

  const testServerConnection = useCallback(async (url: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${url}/api/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return data.status === 'online' && data.appName === 'GastoMetria';
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  const addManualServer = useCallback(async (url: string): Promise<boolean> => {
    try {
      const isOnline = await testServerConnection(url);
      
      const serverEntry = {
        url,
        name: 'GastoMetria Mobile',
        status: isOnline ? 'online' as const : 'offline' as const,
        lastSeen: new Date()
      };

      setFoundServers(prev => {
        const existing = prev.find(s => s.url === url);
        if (existing) {
          return prev.map(s => s.url === url ? serverEntry : s);
        }
        return [...prev, serverEntry];
      });

      return isOnline;
    } catch (error) {
      setError((error as Error).message);
      return false;
    }
  }, [testServerConnection]);

  const scanForServers = useCallback(async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      // Get potential local IP ranges
      const localIpRanges = [
        '192.168.1.',
        '192.168.0.',
        '192.168.100.',
        '10.0.0.',
        '172.16.0.'
      ];
      
      const port = 3000;
      const promises: Promise<void>[] = [];
      
      for (const range of localIpRanges) {
        for (let i = 1; i <= 254; i++) {
          const ip = `${range}${i}`;
          const url = `http://${ip}:${port}`;
          
          promises.push(
            (async () => {
              try {
                const isOnline = await testServerConnection(url);
                if (isOnline) {
                  setFoundServers(prev => {
                    const existing = prev.find(s => s.url === url);
                    if (!existing) {
                      return [...prev, {
                        url,
                        name: 'GastoMetria Mobile',
                        status: 'online' as const,
                        lastSeen: new Date()
                      }];
                    }
                    return prev;
                  });
                }
              } catch (error) {
                // Ignore individual failures during scanning
              }
            })()
          );
        }
      }
      
      // Wait for all scans to complete, but with a reasonable timeout
      await Promise.allSettled(promises);
      
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsScanning(false);
    }
  }, [testServerConnection]);

  // Auto-refresh server status every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (foundServers.length > 0 && !isScanning) {
        const updatedServers = await Promise.all(
          foundServers.map(async (server) => {
            const isOnline = await testServerConnection(server.url);
            return {
              ...server,
              status: isOnline ? 'online' as const : 'offline' as const,
              lastSeen: isOnline ? new Date() : server.lastSeen
            };
          })
        );
        setFoundServers(updatedServers);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [foundServers, isScanning, testServerConnection]);

  return {
    isScanning,
    foundServers,
    error,
    scanForServers,
    addManualServer,
    testServerConnection
  };
}
