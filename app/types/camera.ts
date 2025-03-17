export interface Produto {
  nome: string;
  categoria?: string;
  quantidade: number;
  valor_unitario?: number;
  valor_pago: number;
}

export interface ResultadoAnalise {
  estabelecimento: string;
  data: string;
  produtos: Produto[];
  total_devido: number;
  chaveNota: string; // Chave da NFC-e obtida do site
  notaProcessada?: boolean;
  stopScanning?: boolean;
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
