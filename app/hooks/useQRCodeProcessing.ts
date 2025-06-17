import type { ProcessedText } from '../types/camera';
import { isNFCeUrl, extractNFCeData } from '../services/nfceService';
import { useStorage } from './useStorage';

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
      console.log('useQRCodeProcessing: Processando QR Code:', data);
      
      // Primeiro verifica se é um QR code de NFCe
      if (isNFCeUrl(data)) {
        console.log('useQRCodeProcessing: QR Code de NFCe detectado');
        
        const chaveNota = extractChaveNota(data);
        if (!chaveNota) {
          throw new Error('QR Code de NFCe inválido. Chave da nota fiscal não encontrada.');
        }

        console.log('useQRCodeProcessing: Chave da nota extraída:', chaveNota);

        // Verifica se a nota já foi processada
        const notaExistente = await verificarNotaExistente(chaveNota);
        if (notaExistente) {
          console.log('useQRCodeProcessing: Nota já processada anteriormente');
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
        console.log('useQRCodeProcessing: Extraindo dados da NFCe...');
        
        try {
          const nfceData = await extractNFCeData(data);
          
          if (nfceData) {
            console.log('useQRCodeProcessing: Dados extraídos com sucesso:', {
              estabelecimento: nfceData.estabelecimento,
              produtos: nfceData.produtos.length
            });
            
            return { 
              fullText: data,
              blocks: [],
              analiseIA: {
                ...nfceData,
                chaveNota // Inclui a chave no resultado
              }
            };
          } else {
            // Se nfceData é null, significa erro de rede ou servidor
            throw new Error('Erro de conexão: Não foi possível obter dados da nota fiscal. Verifique sua conexão com a internet e tente novamente.');
          }
        } catch (networkError) {
          // Se houve erro ao buscar dados da NFCe, é erro de rede, não tenta IA
          console.error('useQRCodeProcessing: Erro de rede ao processar NFCe:', networkError);
          throw new Error('Erro de conexão: Não foi possível processar a nota fiscal. Verifique sua internet e tente novamente.');
        }
      }
      
      // Se não é NFCe, retorna null para permitir processamento com IA
      console.log('useQRCodeProcessing: Não é uma URL de NFCe válida, pode tentar IA');
      return null;
      
    } catch (error) {
      console.error('useQRCodeProcessing: Erro ao processar QR Code:', error);
      
      // Se o erro foi relacionado a NFCe (rede, processamento), propaga o erro
      // Isso impedirá que tente processar com IA
      if (error instanceof Error && 
          (error.message.includes('NFCe') || 
           error.message.includes('conexão') || 
           error.message.includes('nota fiscal'))) {
        throw error;
      }
      
      // Para outros erros, também propaga para evitar processamento IA inadequado
      throw error;
    }
  };

  return { processQRCode };
}
