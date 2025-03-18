import AsyncStorage from '@react-native-async-storage/async-storage';
import { PurchaseItem, NotasFiscais, GroupedItems } from '../types/storage';

export class StorageService {
  private static instance: StorageService;
  private KEYS = {
    PURCHASE_ITEMS: 'purchase_items',
    NOTAS_PROCESSADAS: 'notas_processadas'
  };

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Métodos genéricos
  private async getItem<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Erro ao buscar item ${key}:`, error);
      return null;
    }
  }

  private async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erro ao salvar item ${key}:`, error);
      throw error;
    }
  }

  // Métodos específicos para PurchaseItems
  async getAllPurchaseItems(): Promise<PurchaseItem[]> {
    const items = await this.getItem<PurchaseItem[]>(this.KEYS.PURCHASE_ITEMS);
    return items || [];
  }

  async savePurchaseItem(newItem: PurchaseItem): Promise<void> {
    const items = await this.getAllPurchaseItems();
    
    const existingItemIndex = items.findIndex(item => 
      item.estabelecimento === newItem.estabelecimento && 
      item.produto.toLowerCase() === newItem.produto.toLowerCase() &&
      Math.abs(item.valor_unitario - newItem.valor_unitario) < 0.01
    );

    if (existingItemIndex >= 0) {
      items[existingItemIndex] = {
        ...items[existingItemIndex],
        quantidade: items[existingItemIndex].quantidade + newItem.quantidade,
        valor_total: items[existingItemIndex].valor_total + newItem.valor_total
      };
    } else {
      items.push(newItem);
    }

    await this.setItem(this.KEYS.PURCHASE_ITEMS, items);
  }

  // Métodos para Notas Fiscais
  async getNotaFiscal(chaveNota: string): Promise<NotasFiscais[string] | null> {
    const notas = await this.getItem<NotasFiscais>(this.KEYS.NOTAS_PROCESSADAS);
    return notas?.[chaveNota] || null;
  }

  async saveNotaProcessada(chaveNota: string, estabelecimento: string, data: string): Promise<void> {
    const notas = await this.getItem<NotasFiscais>(this.KEYS.NOTAS_PROCESSADAS) || {};
    notas[chaveNota] = {
      estabelecimento,
      data,
      processadaEm: new Date().toISOString()
    };
    await this.setItem(this.KEYS.NOTAS_PROCESSADAS, notas);
  }

  // Métodos para estabelecimentos
  async removeEstabelecimento(estabelecimento: string): Promise<void> {
    // Remove itens do estabelecimento
    const items = await this.getAllPurchaseItems();
    const filteredItems = items.filter(item => item.estabelecimento !== estabelecimento);
    await this.setItem(this.KEYS.PURCHASE_ITEMS, filteredItems);

    // Remove notas processadas do estabelecimento
    const notas = await this.getItem<NotasFiscais>(this.KEYS.NOTAS_PROCESSADAS) || {};
    const notasAtualizadas = Object.entries(notas).reduce((acc, [chave, nota]) => {
      if (nota.estabelecimento !== estabelecimento) {
        acc[chave] = nota;
      }
      return acc;
    }, {} as NotasFiscais);
    await this.setItem(this.KEYS.NOTAS_PROCESSADAS, notasAtualizadas);
  }

  // Método para agrupar itens
  groupItems(items: PurchaseItem[]): GroupedItems {
    return items.reduce((acc: GroupedItems, item) => {
      const key = item.estabelecimento;
      const dateKey = item.data || 'sem_data';
      
      if (!acc[key]) {
        acc[key] = {
          valor_total: 0,
          data: item.data,
          compras: {}
        };
      }

      if (!acc[key].compras[dateKey]) {
        acc[key].compras[dateKey] = {
          valor_total: 0,
          itens: []
        };
      }
      
      acc[key].compras[dateKey].itens.push(item);
      acc[key].compras[dateKey].valor_total += item.quantidade * item.valor_unitario;
      acc[key].valor_total += item.quantidade * item.valor_unitario;
      
      return acc;
    }, {});
  }

  // Método para limpar todos os dados
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      throw error;
    }
  }
}

export default StorageService.getInstance();
