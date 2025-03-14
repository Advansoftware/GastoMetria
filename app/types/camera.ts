export interface Produto {
  nome: string;
  quantidade: number;
  valor_unitario: number;
  valor_pago: number;
}

export interface ResultadoAnalise {
  estabelecimento: string;
  data: string;
  produtos: Produto[];
  total_devido: number;
}

export type AIAnalysis = ResultadoAnalise;

export interface ProcessedText {
  fullText: string;
  blocks: string[];
  analiseIA?: ResultadoAnalise;
}

// Necessário para o Expo Router
export default {
  name: 'camera-types',
  version: '1.0.0'
};
