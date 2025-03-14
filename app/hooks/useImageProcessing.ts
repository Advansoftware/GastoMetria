import * as ImageManipulator from "expo-image-manipulator";
import TextRecognition, { TextRecognitionScript } from "@react-native-ml-kit/text-recognition";
import { BarCodeScanner } from 'expo-barcode-scanner';
import { ProcessedText } from '../types/camera';
import useQRCodeProcessing from './useQRCodeProcessing';

const useImageProcessing = () => {
  const { processQRCode } = useQRCodeProcessing();

  const processImage = async (uri: string): Promise<ProcessedText | null> => {
    try {
      const processedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 1. Tentar ler QR Code primeiro
      const scannedCodes = await BarCodeScanner.scanFromURLAsync(processedImage.uri);
      
      if (scannedCodes.length > 0) {
        const qrData = scannedCodes[0].data;
        console.log("QR Code encontrado:", qrData);
        
        const qrResult = await processQRCode(qrData);
        if (qrResult) {
          return {
            fullText: qrData,
            blocks: [],
            analiseIA: qrResult // Resultado do QR sem usar IA
          };
        }
      }

      // 2. Se não encontrou QR Code válido, tenta OCR
      console.log("QR Code não encontrado, tentando OCR...");
      const result = await TextRecognition.recognize(
        processedImage.uri,
        TextRecognitionScript.LATIN
      );
     
      if (!result || !result.text) return null;

      // Retorna o texto do OCR para ser processado pela IA posteriormente
      return {
        fullText: result.text,
        blocks: result.blocks.map((block) => block.text),
      };

    } catch (error) {
      console.error("Erro no processamento da imagem:", error);
      throw new Error("Falha ao processar imagem");
    }
  };

  return { processImage };
};

export default useImageProcessing;
