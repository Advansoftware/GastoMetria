import { useRef, useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult, BarcodeSettings } from 'expo-camera';
import useImageProcessing from './useImageProcessing';
import useAIProcessing from './useAIProcessing';
import useQRCodeProcessing from './useQRCodeProcessing';
import { ProcessedText } from '@/app/types/camera';
import { useStorage } from './useStorage';

function useCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);
  const { processImage } = useImageProcessing();
  const { extrairProdutoPrincipal } = useAIProcessing();
  const { processQRCode } = useQRCodeProcessing();
  const { saveItem, verificarNotaExistente, salvarNotaProcessada } = useStorage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isProcessingIA, setIsProcessingIA] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [isMounted, setIsMounted] = useState(true);
  const [isCompletelyProcessing, setIsCompletelyProcessing] = useState(false);
  const [scanBlocked, setScanBlocked] = useState(false);

  // Controle de montagem do componente
  useEffect(() => {
    setIsMounted(true);
    
    return () => {
      console.log('useCamera: Cleanup iniciado');
      setIsMounted(false);
      setIsProcessing(false);
      setIsProcessingImage(false);
      setIsProcessingIA(false);
      setIsScanning(false);
      setIsCompletelyProcessing(false);
      setScanBlocked(false);
      
      // Aguardar um pouco para garantir que todas as operações assíncronas sejam canceladas
      setTimeout(() => {
        console.log('useCamera: Cleanup finalizado');
      }, 100);
    };
  }, []);

  // Função para parar o scanner de forma segura
  const stopScanning = useCallback(() => {
    console.log('useCamera: Parando scanner');
    if (isMounted) {
      setIsScanning(false);
      setIsProcessing(false);
      setIsProcessingImage(false);
      setIsProcessingIA(false);
      setIsCompletelyProcessing(false);
      setScanBlocked(false);
    }
  }, [isMounted]);

  const toggleCameraFacing = useCallback(() => {
    if (!isProcessing && isMounted) {
      setFacing(current => (current === 'back' ? 'front' : 'back'));
    }
  }, [isProcessing, isMounted]);

  const handleProcessedText = useCallback(async (resultado: ProcessedText | null) => {
    if (!resultado || !isMounted) {
      console.log('useCamera: Nenhum resultado disponível ou componente desmontado');
      if (isMounted) {
        setIsScanning(true);
      }
      return;
    }

    console.log('useCamera: Processando resultado:', resultado.analiseIA);

    // Ativar o estado de processamento completo - mantém loading até o final
    setIsCompletelyProcessing(true);
    setIsScanning(false);
    setIsProcessing(true);
    
    const { analiseIA } = resultado;
    
    // Verificar se a nota já foi processada (flag do QR code processing)
    if (analiseIA.notaProcessada) {
      console.log('useCamera: Nota já processada anteriormente');
      setIsCompletelyProcessing(false);
      setTimeout(() => {
        if (isMounted) {
          Alert.alert(
            "Nota Já Processada",
            `Esta nota fiscal já foi processada anteriormente para o estabelecimento ${analiseIA.estabelecimento}.`,
            [{ text: "OK", onPress: () => router.back() }]
          );
        }
      }, 500);
      return;
    }

    const { estabelecimento, data, produtos, chaveNota } = analiseIA;
    
    console.log('useCamera: Dados extraídos:', {
      estabelecimento,
      data,
      produtosCount: produtos?.length || 0,
      chaveNota
    });

    try {
      // Verificar novamente se a nota já foi processada (segurança adicional)
      const notaExistente = await verificarNotaExistente(chaveNota);
      
      if (notaExistente) {
        console.log('useCamera: Nota duplicada encontrada');
        setIsCompletelyProcessing(false);
        Alert.alert(
          "Nota Fiscal Duplicada",
          `Esta nota fiscal já foi processada em ${new Date(notaExistente.processadaEm).toLocaleDateString()} para o estabelecimento ${notaExistente.estabelecimento}.`,
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      // Verificar se há produtos para salvar
      if (!produtos || produtos.length === 0) {
        console.error('useCamera: Nenhum produto encontrado para salvar');
        setIsCompletelyProcessing(false);
        Alert.alert(
          "Erro",
          "Nenhum produto foi encontrado na nota fiscal. Por favor, tente novamente.",
          [{ text: "OK", onPress: () => {
            if (isMounted) {
              setIsScanning(true);
              setIsProcessing(false);
            }
          }}]
        );
        return;
      }

      console.log('useCamera: Salvando produtos...');
      
      // Salvar os produtos
      for (const produto of produtos) {
        if (!produto.nome) {
          console.warn('useCamera: Produto sem nome ignorado:', produto);
          continue;
        }
        
        console.log('useCamera: Salvando produto:', produto.nome);
        
        await saveItem({
          produto: produto.nome,
          categoria: produto.categoria || 'Não categorizado',
          quantidade: produto.quantidade || 1,
          valor_unitario: produto.valor_unitario || produto.valor_pago / (produto.quantidade || 1),
          valor_total: produto.valor_pago,
          estabelecimento,
          data,
          chaveNota
        });
      }

      // Registrar que a nota foi processada
      console.log('useCamera: Registrando nota como processada');
      await salvarNotaProcessada(chaveNota, estabelecimento, data);

      console.log('useCamera: Nota fiscal processada com sucesso');
      
      // IMPORTANTE: Só parar o loading após TUDO estar salvo
      console.log('useCamera: Desativando estados de processamento e liberando scanner');
      setIsCompletelyProcessing(false);
      setScanBlocked(false); // Reativar possibilidade de novos scans
      setIsScanning(false);
      setIsProcessing(false);
      setIsProcessingImage(false);
      setIsProcessingIA(false);
      
      console.log('useCamera: Todos os dados salvos, iniciando navegação em 1 segundo');
      
      // Aguardar mais tempo antes de navegar para garantir que todas as operações terminaram
      // e que o componente da câmera seja completamente desmontado
      setTimeout(() => {
        if (isMounted) {
          console.log('useCamera: Navegando para tabs - componente ainda montado');
          // Usar push em vez de replace para uma transição mais suave
          router.push("/(tabs)/");
        } else {
          console.log('useCamera: Componente desmontado, navegação cancelada');
        }
      }, 1000); // Reduzido para 1 segundo após salvar tudo
      
    } catch (error) {
      console.error('Erro ao processar itens:', error);
      setIsCompletelyProcessing(false);
      setScanBlocked(false); // Reativar possibilidade de novos scans
      if (isMounted) {
        Alert.alert(
          'Erro', 
          'Não foi possível salvar todos os itens',
          [{ text: "OK", onPress: () => {
            if (isMounted) {
              setIsScanning(true);
              setIsProcessing(false);
            }
          }}]
        );
      }
    }
  }, [verificarNotaExistente, saveItem, salvarNotaProcessada, isMounted]);

  const handleBarcodeScanned = useCallback(async ({ data }: BarcodeScanningResult) => {
    console.log('useCamera: Barcode detectado - BLOQUEANDO IMEDIATAMENTE:', data);
    
    // BLOQUEIO ABSOLUTO IMEDIATO - antes de qualquer verificação
    setScanBlocked(true);
    setIsScanning(false);
    setIsCompletelyProcessing(true);
    
    // Agora verifica condições (mas já bloqueou)
    if (isProcessing || !isMounted) {
      console.log('useCamera: Barcode já estava sendo processado ou componente desmontado');
      return;
    }
    
    console.log('useCamera: Barcode sendo processado:', data);
    
    // Ativar processamento completo
    setIsProcessing(true);

    try {
      if (!isMounted) {
        console.log('useCamera: Componente desmontado durante processamento');
        return;
      }
      
      console.log('useCamera: Processando QR Code...');
      setIsProcessingImage(true);
      
      try {
        const qrResult = await processQRCode(data);
        
        if (!isMounted) {
          console.log('useCamera: Componente desmontado após processamento QR');
          return;
        }
        
        if (qrResult) {
          // QR code processado com sucesso
          console.log('useCamera: QR Code processado com sucesso');
          
          // Manter o loading ativo, será desativado em handleProcessedText
          setIsProcessingImage(false);
          handleProcessedText(qrResult);
          return;
        }
        
        // Se qrResult é null, significa que não é um QR code de NFCe
        // Pode tentar processar com IA
        if (!isMounted) return;
        
        console.log('useCamera: QR Code não é NFCe, tentando processamento com IA...');
        setIsProcessingImage(false);
        setIsProcessingIA(true);
        const analiseIA = await extrairProdutoPrincipal(data);
        
        if (!isMounted) return;
        
        // Manter o loading ativo, será desativado em handleProcessedText
        setIsProcessingIA(false);
        handleProcessedText({ 
          fullText: data, 
          analiseIA,
          blocks: []
        });
        
      } catch (qrError: unknown) {
        // Erro específico do processamento de QR code
        if (!isMounted) return;
        
        console.error("useCamera: Erro específico ao processar QR code:", qrError);
        
        // Parar o loading em caso de erro
        setIsCompletelyProcessing(false);
        setScanBlocked(false);
        setIsProcessingImage(false);
        setIsProcessingIA(false);
        
        if (qrError instanceof Error) {
          // Se é erro relacionado a NFCe, mostra erro específico e não tenta IA
          if (qrError.message.includes('NFCe') || 
              qrError.message.includes('conexão') || 
              qrError.message.includes('nota fiscal')) {
            Alert.alert(
              "Erro na Nota Fiscal", 
              qrError.message,
              [{ 
                text: "Tentar Novamente", 
                onPress: () => {
                  if (isMounted) {
                    setIsScanning(true);
                    setIsProcessing(false);
                  }
                }
              },
              { 
                text: "Voltar", 
                onPress: () => {
                  if (isMounted) {
                    router.back();
                  }
                }
              }]
            );
            return; // Não tenta IA para erros de NFCe
          }
          
          // Para outros tipos de erro, mostra mensagem genérica
          Alert.alert("Erro", qrError.message || "Não foi possível processar o QR code");
        } else {
          Alert.alert("Erro", "Não foi possível processar o QR code");
        }
        
        // Para erros não relacionados a NFCe, volta para scanner
        if (isMounted) {
          router.back();
        }
      }
      
    } catch (e: unknown) {
      // Erro geral da função
      if (!isMounted) return;
      
      console.error("useCamera: Erro geral ao processar barcode:", e);
      
      // Parar o loading em caso de erro
      setIsCompletelyProcessing(false);
      setScanBlocked(false);
      setIsProcessingImage(false);
      setIsProcessingIA(false);
      
      if (e instanceof Error) {
        Alert.alert("Erro", e.message || "Erro inesperado ao processar código");
      } else {
        Alert.alert("Erro", "Erro inesperado ao processar código");
      }
      
      // Só navegar se o componente ainda estiver montado
      if (isMounted) {
        router.back();
      }
    } finally {
      // NÃO resetar isCompletelyProcessing aqui - será resetado em handleProcessedText
      if (isMounted && !isCompletelyProcessing) {
        setIsProcessingImage(false);
        setIsProcessingIA(false);
        setIsProcessing(false);
        // Aguardar mais tempo antes de reativar o scanner
        setTimeout(() => {
          if (isMounted && !isCompletelyProcessing) {
            console.log('useCamera: Reativando scanner');
            setIsScanning(true);
          }
        }, 2000);
      }
    }
  }, [isProcessing, isCompletelyProcessing, isMounted, processQRCode, extrairProdutoPrincipal, handleProcessedText]);

  const tirarFoto = useCallback(async () => {
    if (!cameraRef.current || isProcessing || isCompletelyProcessing || scanBlocked || !isMounted) {
      return;
    }

    try {
      // BLOQUEAR IMEDIATAMENTE qualquer novo scan
      setScanBlocked(true);
      
      // Ativar processamento completo
      setIsCompletelyProcessing(true);
      setIsProcessing(true);
      setIsProcessingImage(true);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        isImageMirror: false,
        skipProcessing: false,
        imageType: 'jpg',
        exif: true
      });
      
      if (!isMounted) return; // Verificação após operação assíncrona
      
      if (photo?.uri) {
        const resultadoImagem = await processImage(photo.uri);
        
        if (!isMounted) return;
        
        setIsProcessingImage(false);
        
        if (resultadoImagem) {
          // Se já tem analiseIA, veio do QR Code
          if (resultadoImagem.analiseIA) {
            // Manter o loading ativo, será desativado em handleProcessedText
            handleProcessedText(resultadoImagem);
          } 
          // Se não tem analiseIA, processa com IA
          else if (resultadoImagem.fullText) {
            if (!isMounted) return;
            
            setIsProcessingIA(true);
            const analiseIA = await extrairProdutoPrincipal(resultadoImagem.fullText);
            
            if (!isMounted) return;
            
            setIsProcessingIA(false);
            const resultado: ProcessedText = {
              ...resultadoImagem,
              analiseIA
            };
            // Manter o loading ativo, será desativado em handleProcessedText
            handleProcessedText(resultado);
          }
        }
      }
    } catch (e: unknown) {
      if (!isMounted) return;
      
      console.error("Erro ao processar imagem:", e);
      
      // Parar o loading em caso de erro
      setIsCompletelyProcessing(false);
      setScanBlocked(false);
      setIsProcessingImage(false);
      setIsProcessingIA(false);
      setIsProcessing(false);
      
      if (e instanceof Error) {
        Alert.alert("Erro", e.message || "Não foi possível processar a imagem");
      } else {
        Alert.alert("Erro", "Não foi possível processar a imagem");
      }
    }
    // NÃO usar finally aqui - o loading será gerenciado por handleProcessedText
  }, [scanBlocked, isProcessing, isCompletelyProcessing, isMounted, processImage, extrairProdutoPrincipal, handleProcessedText]);

  return {
    permission,
    requestPermission,
    facing,
    cameraRef,
    toggleCameraFacing,
    tirarFoto,
    isProcessingImage,
    isProcessingIA,
    isScanning,
    isProcessing,
    isMounted,
    isCompletelyProcessing,
    scanBlocked,
    handleBarcodeScanned,
    stopScanning,
    barcodeScannerSettings: {
      barcodeTypes: ["qr"] satisfies BarcodeSettings["barcodeTypes"]
    }
  };
}

// Garantir que o hook é exportado como padrão
export default useCamera;
