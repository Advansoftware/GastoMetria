import { useState, useCallback, useRef } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseAsyncStateReturn<T> {
  state: AsyncState<T>;
  execute: (asyncFunction: () => Promise<T>) => Promise<void>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

export function useAsyncState<T = any>(
  initialData: T | null = null
): UseAsyncStateReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    if (!isMountedRef.current) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction();
      
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, data: result, loading: false }));
      }
    } catch (error) {
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          loading: false,
        }));
      }
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data, error: null }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  return {
    state,
    execute,
    reset,
    setData,
    setError,
    setLoading,
  };
}
