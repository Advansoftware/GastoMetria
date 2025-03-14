import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { CameraView } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCamera } from '../hooks/useCamera';
import { styles } from '../components/CameraView/styles';

export default function CameraScreen() {
  const [statusBarStyle, setStatusBarStyle] = useState<'light' | 'dark'>('light');
  const {
    permission,
    requestPermission,
    facing,
    cameraRef,
    toggleCameraFacing,
    tirarFoto,
  } = useCamera();

  useFocusEffect(
    React.useCallback(() => {
      setStatusBarStyle('light');
      return () => {
        setStatusBarStyle('dark');
      };
    }, [])
  );

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
      <StatusBar style={statusBarStyle} />
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
            <Text style={styles.buttonText}>Detectar Texto</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}
