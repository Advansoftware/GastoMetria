import * as ImageManipulator from "expo-image-manipulator";
import TextRecognition, {
  TextRecognitionScript,
} from "@react-native-ml-kit/text-recognition";
import { ProcessedText } from "../types/camera";

const useImageProcessing = () => {
  const processImage = async (uri: string): Promise<ProcessedText | null> => {
    try {
      const processedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Usar apenas OCR
      const result = await TextRecognition.recognize(
        processedImage.uri,
        TextRecognitionScript.LATIN
      );

      if (!result || !result.text) return null;

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

// Garantindo a exportação default
export default useImageProcessing;
