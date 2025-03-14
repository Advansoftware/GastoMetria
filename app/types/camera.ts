interface Produto {
  nome: string;
  quantidade: number;
  valor_pago: number;
}

export interface AIAnalysis {
  estabelecimento: string;
  data: string;
  produtos: Produto[];
  total_devido: number;
}

export interface ProcessedText {
  fullText: string;
  blocks: string[];
  analiseIA?: AIAnalysis;
}
