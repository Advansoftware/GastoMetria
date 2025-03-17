import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PurchaseItem, GroupedItems, NotasFiscais } from '@/app/types/storage';

export function useStorage() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedItems>({});

  const verificarNotaExistente = async (chaveNota: string) => {
    try {
      if (!chaveNota) {
        console.warn('Tentativa de verificar nota sem chave');
        return null;
      }

      const notasSalvas = await AsyncStorage.getItem('notas_processadas');
      if (notasSalvas) {
        const notas: NotasFiscais = JSON.parse(notasSalvas);
        return notas[chaveNota];
      }
      return null;
    } catch (error) {
      console.error('Erro ao verificar nota:', error);
      return null;
    }
  };

  const salvarNotaProcessada = async (chaveNota: string, estabelecimento: string, data: string) => {
    try {
      const notasSalvas = await AsyncStorage.getItem('notas_processadas');
      const notas: NotasFiscais = notasSalvas ? JSON.parse(notasSalvas) : {};
      
      notas[chaveNota] = {
        estabelecimento,
        data,
        processadaEm: new Date().toISOString()
      };

      await AsyncStorage.setItem('notas_processadas', JSON.stringify(notas));
    } catch (error) {
      console.error('Erro ao salvar nota processada:', error);
    }
  };

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
      const dateKey = item.data || 'sem_data'; // Valor padrão caso a data seja undefined
      
      if (!acc[key]) {
        acc[key] = {
          valor_total: 0,
          data: item.data, // Opcional: armazenar a data do primeiro item
          compras: {}
        };
      }

      if (!acc[key].compras[dateKey]) {
        acc[key].compras[dateKey] = {
          valor_total: 0,
          itens: []
        };
      }
      
      // Resto da lógica permanece igual
      acc[key].compras[dateKey].itens.push(item);
      acc[key].compras[dateKey].valor_total += item.quantidade * item.valor_unitario;
      acc[key].valor_total += item.quantidade * item.valor_unitario;
      
      return acc;
    }, {});

    setGroupedItems(grouped);
  };

  const removeEstabelecimento = async (estabelecimento: string) => {
    try {
      // 1. Remover itens do estabelecimento
      const stored = await AsyncStorage.getItem('purchase_items');
      if (stored) {
        let currentItems: PurchaseItem[] = JSON.parse(stored);
        currentItems = currentItems.filter(item => item.estabelecimento !== estabelecimento);
        await AsyncStorage.setItem('purchase_items', JSON.stringify(currentItems));
        setItems(currentItems);
        groupItems(currentItems);
      }

      // 2. Remover notas processadas do estabelecimento
      const notasSalvas = await AsyncStorage.getItem('notas_processadas');
      if (notasSalvas) {
        const notas: NotasFiscais = JSON.parse(notasSalvas);
        // Filtrar e manter apenas as notas de outros estabelecimentos
        const notasAtualizadas = Object.entries(notas).reduce((acc, [chave, nota]) => {
          if (nota.estabelecimento !== estabelecimento) {
            acc[chave] = nota;
          }
          return acc;
        }, {} as NotasFiscais);
        
        await AsyncStorage.setItem('notas_processadas', JSON.stringify(notasAtualizadas));
      }

    } catch (error) {
      console.error('Erro ao remover estabelecimento:', error);
      throw error;
    }
  };

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
      await AsyncStorage.removeItem('notas_processadas');
      setItems([]);
      setGroupedItems({}); 
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      throw error;
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
    clearStorage,
    verificarNotaExistente,
    salvarNotaProcessada,
    removeEstabelecimento
  };
}

export default useStorage;
