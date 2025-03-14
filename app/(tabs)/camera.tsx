import React, { useState, useRef } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import type { CameraCapturedPicture } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import TextRecognition from '@react-native-ml-kit/text-recognition';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const processImage = async (uri: string) => {
    try {
      const processedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const result = await TextRecognition.recognize(processedImage.uri);
      
      if (result && result.text) {
        console.log('Texto completo:', result.text);
        
        let textoDetalhado = '';
        for (let block of result.blocks) {
          textoDetalhado += `${block.text}\n`;
          console.log('Bloco:', block.text);
          
          for (let line of block.lines) {
            console.log('Linha:', line.text);
          }
        }

        Alert.alert(
          "Texto Detectado",
          textoDetalhado,
          [
            { 
              text: "OK", 
              onPress: () => {
                console.log("Texto completo reconhecido:", result.text);
                setImage(uri);
              } 
            },
            { text: "Nova Foto", onPress: () => setImage(null) }
          ]
        );
      } else {
        Alert.alert(
          "Aviso",
          "Nenhum texto detectado na imagem",
          [
            { text: "Tentar Novamente", onPress: () => setImage(null) },
            { text: "Usar Mesmo Assim", onPress: () => setImage(uri) }
          ]
        );
      }
    } catch (error) {
      console.error('Erro no processamento da imagem:', error);
      Alert.alert("Erro", "Não foi possível processar a imagem");
    }
  };

  const tirarFoto = async () => {
    if (cameraRef.current) {
      try {
        const photo: CameraCapturedPicture | undefined = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
        });
        
        if (photo?.uri) {
          await processImage(photo.uri);
        } else {
          console.error("Erro: URI da foto não disponível");
        }
      } catch (e) {
        console.error("Erro ao capturar foto:", e);
      }
    }
  };

  const salvarFoto = async () => {
    if (image) {
      try {
        // Salva na galeria
        const asset = await MediaLibrary.createAssetAsync(image);
        
        // Salva no AsyncStorage
        const novoGasto = {
          estabelecimento: "Mercado Exemplo",
          data: new Date().toISOString(),
          itens: [
            { produto: "Arroz", categoria: "Alimentos", preco: 20.50 },
            { produto: "Feijão", categoria: "Alimentos", preco: 8.90 }
          ],
          foto: image
        };

        const gastosAntigos = await AsyncStorage.getItem('gastos');
        const gastos = gastosAntigos ? JSON.parse(gastosAntigos) : [];
        gastos.push(novoGasto);
        await AsyncStorage.setItem('gastos', JSON.stringify(gastos));

        router.replace('/(tabs)');
      } catch (e) {
        console.error("Erro ao salvar foto:", e);
      }
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Precisamos de sua permissão para usar a câmera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!image ? (
        <CameraView 
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={toggleCameraFacing}
            >
              <MaterialIcons name="flip-camera-ios" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={tirarFoto}>
              <Text style={styles.buttonText}>Tirar Foto</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <View style={styles.camera}>
          <Image source={{ uri: image }} style={StyleSheet.absoluteFill} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setImage(null)}>
              <Text style={styles.buttonText}>Nova Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={salvarFoto}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  controlsTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'black',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  controlButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
});
