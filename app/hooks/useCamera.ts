import { useRef, useState } from 'react';
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
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isProcessingIA, setIsProcessingIA] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleProcessedText = async (resultado: ProcessedText | null) => {
    if (!resultado) {
      console.log('Nenhum resultado disponível');
      setIsScanning(true);
      return;
    }

    setIsScanning(false);
    
    const { analiseIA } = resultado;
    if (analiseIA.notaProcessada) {
      setTimeout(() => {
        Alert.alert(
          "Nota Já Processada",
          `Esta nota fiscal já foi processada anteriormente para o estabelecimento ${analiseIA.estabelecimento}.`
        );
      }, 500);
      return;
    }

    // Verifica se é uma nota já processada
    if (resultado.analiseIA.notaProcessada) {
      setTimeout(() => {
        Alert.alert(
          "Nota Já Processada",
          `Esta nota fiscal já foi processada anteriormente para o estabelecimento ${resultado.analiseIA.estabelecimento}.`
        );
      }, 500); // Pequeno delay para garantir que a navegação aconteceu
      return;
    }

    const { estabelecimento, data, produtos, total_devido, chaveNota } = resultado.analiseIA;
    
    try {
      // Verificar se a nota já foi processada
      const notaExistente = await verificarNotaExistente(chaveNota);
      
      if (notaExistente) {
        Alert.alert(
          "Nota Fiscal Duplicada",
          `Esta nota fiscal já foi processada em ${new Date(notaExistente.processadaEm).toLocaleDateString()} para o estabelecimento ${notaExistente.estabelecimento}.`,
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      // Salvar os produtos
      for (const produto of produtos) {
        if (!produto.nome) continue;
        
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
      await salvarNotaProcessada(chaveNota, estabelecimento, data);

      console.log('Nota fiscal processada com sucesso');
      router.replace("(tabs)");
    } catch (error) {
      console.error('Erro ao processar itens:', error);
      Alert.alert('Erro', 'Não foi possível salvar todos os itens');
    }
  };

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    setIsScanning(false);
    try {
      setIsProcessingImage(true);
      const qrResult = await processQRCode(data);
      
      if (qrResult) {
        handleProcessedText(qrResult);
        return;
      }

      // Se não processou via QR code, tenta com IA
      setIsProcessingIA(true);
      const analiseIA = await extrairProdutoPrincipal(data);
      handleProcessedText({ 
        fullText: data, 
        analiseIA,
        blocks: []
      });
    } catch (e: unknown) {
      console.error("Erro ao processar QR code:", e);
      if (e instanceof Error) {
        Alert.alert("Aviso", e.message || "Não foi possível processar o QR code");
      } else {
        Alert.alert("Aviso", "Não foi possível processar o QR code");
      }
      router.back(); // Volta para tela anterior em caso de erro
    } finally {
      setIsProcessingImage(false);
      setIsProcessingIA(false);
      setIsScanning(true);
    }
  };

  const tirarFoto = async () => {
    if (cameraRef.current) {
      try {
        setIsProcessingImage(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
          isImageMirror: false,
          skipProcessing: false,
          imageType: 'jpg',
          exif: true
        });
        
        if (photo?.uri) {
          const resultadoImagem = await processImage(photo.uri);
          setIsProcessingImage(false);
          
          if (resultadoImagem) {
            // Se já tem analiseIA, veio do QR Code
            if (resultadoImagem.analiseIA) {
              handleProcessedText(resultadoImagem);
            } 
            // Se não tem analiseIA, processa com IA
            else if (resultadoImagem.fullText) {
              setIsProcessingIA(true);
              const analiseIA = await extrairProdutoPrincipal(resultadoImagem.fullText);
              const resultado: ProcessedText = {
                ...resultadoImagem,
                analiseIA
              };
              handleProcessedText(resultado);
            }
          }
        }
      } catch (e: unknown) {
        console.error("Erro ao processar imagem:", e);
        if (e instanceof Error) {
          Alert.alert("Erro", e.message || "Não foi possível processar a imagem");
        } else {
          Alert.alert("Erro", "Não foi possível processar a imagem");
        }
      } finally {
        setIsProcessingImage(false);
        setIsProcessingIA(false);
      }
    }
  };

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
    handleBarcodeScanned,
    barcodeScannerSettings: {
      barcodeTypes: ["qr"] satisfies BarcodeSettings["barcodeTypes"]
    }
  };
}

// Garantir que o hook é exportado como padrão
export default useCamera;
