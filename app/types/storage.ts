export interface PurchaseItem {
  produto: string;
  categoria: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  estabelecimento: string;
  data: string;
}

export interface GroupedByDate {
  [date: string]: {
    valor_total: number;
    itens: PurchaseItem[];
  };
}

export interface GroupedItems {
  [estabelecimento: string]: {
    valor_total: number;
    compras: GroupedByDate;
  };
}
