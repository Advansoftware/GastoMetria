import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PurchaseItem, GroupedItems } from '../types/storage';

export function useStorage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedItems>({});

  const loadItems = async () => {
    try {
      const stored = await AsyncStorage.getItem('purchase_items');
      if (stored) {
        const loadedItems = JSON.parse(stored);
        setItems(loadedItems);
        groupItems(loadedItems);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    }
  };

  const saveItem = async (newItem: PurchaseItem) => {
    try {
      // Primeiro, carregar os itens existentes do AsyncStorage
      const stored = await AsyncStorage.getItem('purchase_items');
      let currentItems: PurchaseItem[] = stored ? JSON.parse(stored) : [];
      
      // Adicionar o novo item
      currentItems.push(newItem);
      
      // Salvar no AsyncStorage
      await AsyncStorage.setItem('purchase_items', JSON.stringify(currentItems));
      
      // Atualizar o estado
      setItems(currentItems);
      groupItems(currentItems);
      
      console.log('Total de itens após salvar:', currentItems.length);
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      throw error;
    }
  };

  const groupItems = (items: PurchaseItem[]) => {
    console.log('Iniciando agrupamento de', items.length, 'itens');
    
    const grouped = items.reduce((acc: GroupedItems, item) => {
      const key = item.estabelecimento;
      
      if (!acc[key]) {
        acc[key] = {
          valor_total: 0,
          itens: [],
          data: item.data
        };
      }
      
      acc[key].itens.push(item);
      acc[key].valor_total += item.valor_total;
      
      return acc;
    }, {});

    console.log('Estabelecimentos encontrados:', Object.keys(grouped));
    Object.keys(grouped).forEach(key => {
      console.log(`Itens em ${key}:`, grouped[key].itens.length);
    });

    setGroupedItems(grouped);
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      setItems([]);
      setGroupedItems({});
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  return {
    items,
    groupedItems,
    saveItem,
    loadItems,
    clearStorage
  };
}
