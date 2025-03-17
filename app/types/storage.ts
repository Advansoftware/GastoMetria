export interface PurchaseItem {
  produto: string;
  categoria: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  estabelecimento: string;
  data: string;
  chaveNota?: string; // Identificador único da nota fiscal
}

export interface NotaProcessada {
  estabelecimento: string;
  data: string;
  processadaEm: string;
}

export interface NotasFiscais {
  [chaveNota: string]: NotaProcessada;
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
    data?: string; // Adicionando propriedade data como opcional
    compras: GroupedByDate;
  };
}
