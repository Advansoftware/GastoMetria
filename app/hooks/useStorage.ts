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
      const stored = await AsyncStorage.getItem('purchase_items');
      let currentItems: PurchaseItem[] = stored ? JSON.parse(stored) : [];
      
      // Procurar item existente do mesmo estabelecimento com nome exatamente igual
      const existingItemIndex = currentItems.findIndex(item => 
        item.estabelecimento === newItem.estabelecimento && 
        item.produto.toLowerCase() === newItem.produto.toLowerCase() &&
        Math.abs(item.valor_unitario - newItem.valor_unitario) < 0.01 // Tolerância para diferenças de centavos
      );

      if (existingItemIndex >= 0) {
        // Atualizar item existente somando quantidade e valor
        currentItems[existingItemIndex] = {
          ...currentItems[existingItemIndex],
          quantidade: currentItems[existingItemIndex].quantidade + newItem.quantidade,
          valor_total: currentItems[existingItemIndex].valor_total + newItem.valor_total
        };
        console.log('Item existente atualizado:', currentItems[existingItemIndex]);
      } else {
        // Adicionar novo item
        currentItems.push(newItem);
        console.log('Novo item adicionado:', newItem);
      }

      await AsyncStorage.setItem('purchase_items', JSON.stringify(currentItems));
      setItems(currentItems);
      groupItems(currentItems);
      
      console.log('Total de itens após salvar:', currentItems.length);
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      throw error;
    }
  };

  const groupItems = (items: PurchaseItem[]) => {
    const grouped = items.reduce((acc: GroupedItems, item) => {
      const key = item.estabelecimento;
      
      if (!acc[key]) {
        acc[key] = {
          valor_total: 0,
          itens: [],
          data: item.data
        };
      }
      
      // Procurar item existente no grupo
      const existingItemIndex = acc[key].itens.findIndex(existingItem => 
        existingItem.produto.toLowerCase() === item.produto.toLowerCase() &&
        Math.abs(existingItem.valor_unitario - item.valor_unitario) < 0.01
      );

      if (existingItemIndex === -1) {
        // Adicionar novo item
        acc[key].itens.push(item);
      }
      
      acc[key].valor_total = acc[key].itens.reduce((total, item) => total + item.valor_total, 0);
      
      return acc;
    }, {});

    console.log('Estabelecimentos agrupados:', Object.keys(grouped));
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
