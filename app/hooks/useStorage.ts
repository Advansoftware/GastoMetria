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
      
      // Manter a data exatamente como veio, sem manipulação
      const itemParaSalvar = {
        ...newItem,
        data: newItem.data // Garantir que a data original seja mantida
      };

      // Procurar item existente do mesmo estabelecimento com nome exatamente igual
      const existingItemIndex = currentItems.findIndex(item => 
        item.estabelecimento === itemParaSalvar.estabelecimento && 
        item.produto.toLowerCase() === itemParaSalvar.produto.toLowerCase() &&
        Math.abs(item.valor_unitario - itemParaSalvar.valor_unitario) < 0.01 // Tolerância para diferenças de centavos
      );

      if (existingItemIndex >= 0) {
        // Atualizar item existente somando quantidade e valor
        currentItems[existingItemIndex] = {
          ...currentItems[existingItemIndex],
          quantidade: currentItems[existingItemIndex].quantidade + itemParaSalvar.quantidade,
          valor_total: currentItems[existingItemIndex].valor_total + itemParaSalvar.valor_total
        };
        console.log('Item existente atualizado:', currentItems[existingItemIndex]);
      } else {
        // Adicionar novo item
        currentItems.push(itemParaSalvar);
        console.log('Novo item adicionado:', itemParaSalvar);
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
      const dateKey = item.data;
      
      if (!acc[key]) {
        acc[key] = {
          valor_total: 0,
          compras: {}
        };
      }

      if (!acc[key].compras[dateKey]) {
        acc[key].compras[dateKey] = {
          valor_total: 0,
          itens: []
        };
      }
      
      // Adicionar item à data específica
      acc[key].compras[dateKey].itens.push(item);
      // Atualizar total da data
      acc[key].compras[dateKey].valor_total += item.quantidade * item.valor_unitario;
      // Atualizar total do estabelecimento
      acc[key].valor_total += item.quantidade * item.valor_unitario;
      
      return acc;
    }, {});

    setGroupedItems(grouped);
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      setItems([]);
      setGroupedItems({}); // Garantir que o estado está vazio
      console.log('Storage limpo, itens:', []); // Debug
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
