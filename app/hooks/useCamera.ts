import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import useImageProcessing from './useImageProcessing';

const useCamera = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);
  const { processImage } = useImageProcessing();

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleProcessedText = (textoDetectado: string[] | null) => {
    if (textoDetectado) {
      Alert.alert(
        "Texto Detectado",
        textoDetectado.join('\n'),
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Aviso",
        "Nenhum texto detectado na imagem",
        [{ text: "Tentar Novamente" }]
      );
    }
  };

  const tirarFoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
          isImageMirror: false,
          skipProcessing: false,
          imageType: 'jpg',
          exif: true
        });
        
        if (photo?.uri) {
          const resultado = await processImage(photo.uri);
          handleProcessedText(resultado?.blocks || null);
        }
      } catch (e) {
        console.error("Erro ao processar imagem:", e);
        Alert.alert("Erro", "Não foi possível processar a imagem");
      }
    }
  };

  return {
    permission,
    requestPermission,
    facing,
    cameraRef,
    toggleCameraFacing,
    tirarFoto
  };
};

export default useCamera;
