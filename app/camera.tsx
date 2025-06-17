import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { CameraView } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useCamera from './hooks/useCamera';
import LoadingOverlay from './components/LoadingOverlay';
import { ModernButton } from '@/components/ui/ModernButton';
import { Card } from '@/components/ui/Card';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { usePlatformCapabilities } from '@/hooks/usePlatform';
import { useTheme } from '@/contexts/ThemeContext';
import { tw } from '@/utils/tailwind';

function CameraScreen() {
  const [isComponentMounted, setIsComponentMounted] = useState(true);
  const { isWeb } = usePlatformCapabilities();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const {
    permission,
    requestPermission,
    facing,
    cameraRef,
    toggleCameraFacing,
    tirarFoto,
    isProcessingImage,
    isProcessingIA,
    handleBarcodeScanned,
    isScanning,
    stopScanning,
    isCompletelyProcessing,
    scanBlocked,
    barcodeScannerSettings,
  } = useCamera();

  useFocusEffect(
    React.useCallback(() => {
      console.log('CameraScreen: Componente focado');
      setIsComponentMounted(true);
      
      return () => {
        console.log('CameraScreen: Componente desfocado - iniciando cleanup');
        setIsComponentMounted(false);
        
        // Garantir que o scanner seja desabilitado quando sair da tela
        // Isso ajuda a prevenir erros de removeView()
        stopScanning();
        
        console.log('CameraScreen: Cleanup finalizado');
      };
    }, [stopScanning])
  );

  // Web version - show information instead of camera
  if (isWeb) {
    const webBgColor = isDark ? '#111827' : '#f9fafb';
    const headerBgColor = isDark ? '#1f2937' : '#ffffff';
    const textColor = isDark ? '#f9fafb' : '#1f2937';
    
    return (
      <View style={[tw('flex-1'), { backgroundColor: webBgColor }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        
        {/* Header */}
        <View style={[tw('flex-row items-center justify-between p-4'), { backgroundColor: headerBgColor }]}>
          <TouchableOpacity 
            style={tw('w-10 h-10 rounded-full items-center justify-center')}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[tw('text-lg font-semibold'), { color: textColor }]}>
            Câmera
          </Text>
          <View style={tw('w-10')} />
        </View>

        {/* Content */}
        <View style={tw('flex-1 p-4')}>
          <Animated.View entering={FadeInDown}>
            <Card variant="elevated">
              <View style={tw('p-6')}>
                <View style={tw('items-center mb-6')}>
                  <MaterialIcons name="smartphone" size={64} color="#3b82f6" />
                </View>
                
                <Text style={tw('text-2xl font-bold text-gray-900 text-center mb-4')}>
                  Funcionalidade Móvel
                </Text>
                
                <Text style={tw('text-gray-600 text-center mb-6 leading-6')}>
                  A funcionalidade da câmera está disponível apenas nos dispositivos móveis (Android/iOS).
                </Text>

                <View style={tw('bg-blue-50 p-4 rounded-lg mb-6')}>
                  <Text style={tw('text-blue-800 font-medium mb-3')}>
                    🔍 O que você pode fazer no celular:
                  </Text>
                  <Text style={tw('text-blue-700 text-sm leading-5')}>
                    • Escanear QR codes de notas fiscais{'\n'}
                    • Processar texto automaticamente com OCR{'\n'}
                    • Extrair dados usando IA{'\n'}
                    • Categorizar produtos automaticamente{'\n'}
                    • Salvar dados no dispositivo
                  </Text>
                </View>

                <ModernButton
                  variant="primary"
                  size="lg"
                  leftIcon="arrow-back"
                  onPress={() => router.back()}
                  fullWidth
                >
                  Voltar ao Início
                </ModernButton>
              </View>
            </Card>
          </Animated.View>
        </View>
      </View>
    );
  }

  if (!permission) {
    return <View style={[tw('flex-1'), { backgroundColor: 'black' }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[tw('flex-1 justify-center items-center px-8'), { backgroundColor: 'black', paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar style="light" />
        <Animated.View entering={FadeInDown}>
          <MaterialIcons name="camera-alt" size={80} color="white" style={{ marginBottom: 24 }} />
          <Text style={tw('text-white text-xl font-semibold text-center mb-6')}>
            Permissão da Câmera
          </Text>
          <Text style={tw('text-gray-300 text-base text-center mb-8 leading-6')}>
            Precisamos de sua permissão para usar a câmera e escanear QR codes das notas fiscais
          </Text>
          <ModernButton
            variant="primary"
            size="lg"
            leftIcon="camera"
            onPress={requestPermission}
            fullWidth
          >
            Permitir Câmera
          </ModernButton>
        </Animated.View>
      </View>
    );
  }

  // Se o componente não estiver montado OU se estiver processando, mostrar uma tela preta
  if (!isComponentMounted || isCompletelyProcessing) {
    return (
      <View style={[tw('flex-1'), { backgroundColor: 'black' }]}>
        <StatusBar style="light" />
        {isCompletelyProcessing && (
          <LoadingOverlay message="Processando e salvando dados da nota fiscal..." />
        )}
      </View>
    );
  }

  return (
    <View style={[tw('flex-1'), { backgroundColor: 'black' }]}>
      <StatusBar style="light" />
      
      {/* CameraView com controle de lifecycle mais rigoroso */}
      <CameraView 
        ref={cameraRef}
        style={tw('flex-1 w-full h-full')}
        facing={facing} 
        barcodeScannerSettings={barcodeScannerSettings}
        onBarcodeScanned={
          isScanning && 
          isComponentMounted && 
          !isCompletelyProcessing && 
          !scanBlocked
            ? handleBarcodeScanned 
            : undefined
        }
        key={`camera-${isScanning}-${isCompletelyProcessing}-${scanBlocked}`}
      >
        {/* Header com controles */}
        <Animated.View entering={FadeInUp}>
          <View style={[tw('absolute left-0 right-0 flex-row-reverse justify-between items-center px-6 z-10'), { top: insets.top + 12 }]}>
            <TouchableOpacity 
              style={tw('w-12 h-12 rounded-full items-center justify-center ml-4')}
              onPress={() => {
                if (!isCompletelyProcessing) {
                  console.log('CameraScreen: Botão fechar pressionado');
                  stopScanning();
                  setTimeout(() => router.back(), 100);
                }
              }}
              disabled={isCompletelyProcessing}
            >
              <View style={[tw('w-full h-full rounded-full items-center justify-center'), { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <MaterialIcons name="close" size={24} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={tw('w-12 h-12 rounded-full items-center justify-center')}
              onPress={toggleCameraFacing}
              disabled={isCompletelyProcessing}
            >
              <View style={[tw('w-full h-full rounded-full items-center justify-center'), { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <MaterialIcons name="flip-camera-ios" size={24} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Instruções */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <View style={tw('absolute top-1/3 left-6 right-6 items-center')}>
            <View style={[tw('rounded-2xl p-6 items-center'), { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <MaterialIcons name="qr-code-scanner" size={48} color="white" style={{ marginBottom: 16 }} />
              <Text style={tw('text-white text-lg font-semibold text-center mb-2')}>
                Escaneie o QR Code
              </Text>
              <Text style={tw('text-gray-300 text-sm text-center leading-5')}>
                Posicione o QR Code da nota fiscal dentro da área de captura ou tire uma foto para análise
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Botões de ação */}
        <Animated.View entering={FadeInUp.delay(500)}>
          <View style={tw('absolute bottom-10 left-6 right-6 items-center')}>
            <View style={[tw('rounded-2xl p-4 w-full'), { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <View style={tw('mb-3')}>
                <ModernButton
                  variant="primary"
                  size="lg"
                  leftIcon="camera"
                  onPress={tirarFoto}
                  fullWidth
                  disabled={isCompletelyProcessing}
                >
                  Detectar QR Code ou Texto
                </ModernButton>
              </View>
              
              <Text style={tw('text-gray-300 text-xs text-center')}>
                Toque para capturar e analisar a imagem
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Overlay de scan */}
        {isScanning && isComponentMounted && (
          <Animated.View entering={FadeInDown}>
            <View style={tw('absolute inset-0 items-center justify-center')}>
              <View style={tw('w-64 h-64 border-4 border-white rounded-3xl opacity-50')} />
              <View style={[tw('absolute w-72 h-72 border-2 rounded-3xl'), { borderColor: '#3b82f6' }]} />
            </View>
          </Animated.View>
        )}
      </CameraView>

      {/* Loading overlays */}
      {isCompletelyProcessing ? (
        <LoadingOverlay message="Processando e salvando dados da nota fiscal..." />
      ) : isProcessingImage ? (
        <LoadingOverlay message="Procurando QR Code ou processando imagem..." />
      ) : isProcessingIA ? (
        <LoadingOverlay message="Analisando dados com IA..." />
      ) : null}
    </View>
  );
}

export default CameraScreen;