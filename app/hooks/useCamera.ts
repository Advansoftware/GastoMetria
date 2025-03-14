import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult, BarcodeSettings } from 'expo-camera';
import useImageProcessing from './useImageProcessing';
import useAIProcessing from './useAIProcessing';
import useQRCodeProcessing from './useQRCodeProcessing';
import { ProcessedText } from '../types/camera';

function useCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);
  const { processImage } = useImageProcessing();
  const { processarTextoComIA } = useAIProcessing();
  const { processQRCode } = useQRCodeProcessing();
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isProcessingIA, setIsProcessingIA] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleProcessedText = (resultado: ProcessedText | null) => {
    if (resultado?.analiseIA) {
      const { estabelecimento, data, produtos, total_devido } = resultado.analiseIA;
      const detalhes = [
        `Estabelecimento: ${estabelecimento}`,
        `Data: ${data}`,
        '',
        'Produtos:',
        ...produtos.map(p => {
          const valorUnitario = p.valor_unitario || p.valor_pago / p.quantidade;
          return `${p.nome}: ${p.quantidade}x R$ ${valorUnitario.toFixed(2)} = R$ ${p.valor_pago.toFixed(2)}`;
        }),
        '',
        `Total: R$ ${total_devido.toFixed(2)}`
      ];

      Alert.alert(
        "Nota Fiscal Processada",
        detalhes.join('\n'),
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Aviso",
        "Não foi possível analisar o texto",
        [{ text: "Tentar Novamente" }]
      );
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
      const analiseIA = await processarTextoComIA(data);
      handleProcessedText({ 
        fullText: data, 
        analiseIA,
        blocks: []
      });
    } catch (e) {
      console.error("Erro ao processar QR code:", e);
      Alert.alert("Erro", "Não foi possível processar o QR code");
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
              const analiseIA = await processarTextoComIA(resultadoImagem.fullText);
              const resultado: ProcessedText = {
                ...resultadoImagem,
                analiseIA
              };
              handleProcessedText(resultado);
            }
          }
        }
      } catch (e) {
        console.error("Erro ao processar imagem:", e);
        Alert.alert("Erro", "Não foi possível processar a imagem");
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
