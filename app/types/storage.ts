export interface PurchaseItem {
  produto: string;
  categoria: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  estabelecimento: string;
  data: string;
}

export interface GroupedItems {
  [key: string]: {
    valor_total: number;
    itens: PurchaseItem[];
    data: string;
  };
}
