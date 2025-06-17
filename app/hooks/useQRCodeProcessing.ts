import type { ProcessedText } from '../types/camera';
import { isNFCeUrl, extractNFCeData } from '../services/nfceService';
import { useStorage } from './useStorage';
import { router } from 'expo-router';

export default function useQRCodeProcessing() {
  const { verificarNotaExistente } = useStorage();

  const extractChaveNota = (qrCodeData: string) => {
    try {
      console.log('QR Code data:', qrCodeData);
      const chaveMatch = qrCodeData.match(/p=([0-9]{44})/);
      return chaveMatch ? chaveMatch[1] : null;
    } catch (error) {
      console.error('Erro ao extrair chave da nota:', error);
      return null;
    }
  };

  const processQRCode = async (data: string): Promise<ProcessedText | null> => {
    try {
      if (isNFCeUrl(data)) {
        const chaveNota = extractChaveNota(data);
        if (!chaveNota) {
          router.back();
          throw new Error('QR Code inválido. Por favor, tente novamente.');
        }

        // Verifica se a nota já foi processada
        const notaExistente = await verificarNotaExistente(chaveNota);
        if (notaExistente) {
          router.replace('/(tabs)/');
          return {
            fullText: data,
            blocks: [],
            analiseIA: {
              estabelecimento: notaExistente.estabelecimento,
              data: notaExistente.data,
              produtos: [],
              total_devido: 0,
              chaveNota,
              notaProcessada: true, // Flag para indicar que a nota já foi processada
              stopScanning: true // Nova flag para parar o scanner
            }
          };
        }

        // Se chegou aqui, busca os dados da nota
        const nfceData = await extractNFCeData(data);
        if (nfceData) {
          return { 
            fullText: data,
            blocks: [],
            analiseIA: {
              ...nfceData,
              chaveNota // Inclui a chave no resultado
            }
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao processar QR Code:', error.message);
      throw error; // Propaga o erro para tratamento adequado
    }
  };

  return { processQRCode };
}
