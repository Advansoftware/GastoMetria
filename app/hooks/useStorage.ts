import { useState, useEffect, useCallback } from 'react';
import { PurchaseItem, GroupedItems } from '@/app/types/storage';
import StorageService from '@/app/services/StorageService';

export function useStorage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedItems>({});

  const loadItems = useCallback(async () => {
    try {
      const loadedItems = await StorageService.getAllPurchaseItems();
      setItems(loadedItems);
      const grouped = StorageService.groupItems(loadedItems);
      setGroupedItems(grouped);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  }, []);

  const saveItem = async (newItem: PurchaseItem) => {
    try {
      await StorageService.savePurchaseItem(newItem);
      await loadItems(); // Recarrega os dados
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      throw error;
    }
  };

  const verificarNotaExistente = async (chaveNota: string) => {
    return StorageService.getNotaFiscal(chaveNota);
  };

  const salvarNotaProcessada = async (chaveNota: string, estabelecimento: string, data: string) => {
    await StorageService.saveNotaProcessada(chaveNota, estabelecimento, data);
  };

  const removeEstabelecimento = async (estabelecimento: string) => {
    try {
      await StorageService.removeEstabelecimento(estabelecimento);
      await loadItems(); // Recarrega os dados
    } catch (error) {
      console.error('Erro ao remover estabelecimento:', error);
      throw error;
    }
  };

  const clearStorage = async () => {
    try {
      await StorageService.clearAllData();
      setItems([]);
      setGroupedItems({});
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    groupedItems,
    saveItem,
    loadItems,
    clearStorage,
    verificarNotaExistente,
    salvarNotaProcessada,
    removeEstabelecimento
  };
}

export default useStorage;
