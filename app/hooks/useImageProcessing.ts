import * as ImageManipulator from "expo-image-manipulator";
import TextRecognition, { TextRecognitionScript } from "@react-native-ml-kit/text-recognition";
import { BarCodeScanner, PermissionStatus } from 'expo-barcode-scanner';
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

      // Verificar permissão do scanner
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      
      if (status === PermissionStatus.GRANTED) {
        try {
          const [scannedBarcode] = await BarCodeScanner.scanFromURLAsync(processedImage.uri, [
            BarCodeScanner.Constants.BarCodeType.qr
          ]);
          
          if (scannedBarcode) {
            const qrResult = await processQRCode(scannedBarcode.data);
            if (qrResult) {
              return {
                fullText: scannedBarcode.data,
                blocks: [],
                analiseIA: qrResult
              };
            }
          }
        } catch (scanError) {
          console.log('Nenhum QR code encontrado, continuando com OCR...');
        }
      }

      // Continuar com OCR se não encontrar QR code
      console.log("QR Code não encontrado, iniciando OCR...");
      const result = await TextRecognition.recognize(
        processedImage.uri,
        TextRecognitionScript.LATIN
      );
     
      if (!result || !result.text) return null;

      return {
        fullText: result.text,
        blocks: result.blocks.map((block) => block.text)
      };
    } catch (error) {
      console.error("Erro no processamento da imagem:", error);
      throw new Error("Falha ao processar imagem");
    }
  };

  return { processImage };
};

export default useImageProcessing;
