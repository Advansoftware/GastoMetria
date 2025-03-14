export interface Produto {
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

// Necessário para o Expo Router
export default {
  name: 'camera-types',
  version: '1.0.0'
};
