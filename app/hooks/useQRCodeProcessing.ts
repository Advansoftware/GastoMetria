import type { AIAnalysis, ProcessedText } from '../types/camera';
import { isNFCeUrl, extractNFCeData } from '../services/nfceService';

const useQRCodeProcessing = () => {
  const processQRCode = async (data: string): Promise<ProcessedText | null> => {
    try {
      // Se for URL da NFCe, processa diretamente sem IA
      if (isNFCeUrl(data)) {
        const nfceData = await extractNFCeData(data);
        if (nfceData) {
          return { 
            fullText: data,
            blocks: [],
            analiseIA: nfceData
          };
        }
      }
      
      // Se não for NFCe, retorna null para processar com IA
      return null;
    } catch (error) {
      console.error('Erro ao processar QR Code:', error);
      return null;
    }
  };

  return { processQRCode };
};

export default useQRCodeProcessing;
