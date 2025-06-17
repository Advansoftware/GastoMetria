import React from 'react';
import { Platform, Alert } from 'react-native';
import { ModernButton } from '@/components/ui/ModernButton';
import { router } from 'expo-router';
import { usePlatformCapabilities } from '@/hooks/usePlatform';

interface AdaptiveCameraButtonProps {
  onWebFileUpload?: (file: File) => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const AdaptiveCameraButton: React.FC<AdaptiveCameraButtonProps> = ({
  onWebFileUpload,
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  children = 'Escanear QR Code'
}) => {
  const { isWeb, isMobile, hasCamera } = usePlatformCapabilities();

  const handlePress = () => {
    if (isMobile && hasCamera) {
      // No celular, navega para a tela da câmera
      router.push('/camera');
    } else if (isWeb) {
      // Na web, mostra opções alternativas
      Alert.alert(
        'Funcionalidade da Câmera',
        'A câmera não está disponível na web. Em um dispositivo móvel, você pode:\n\n• Escanear QR codes de notas fiscais\n• Capturar texto automaticamente\n• Processar dados com IA',
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Ver Demonstração',
            onPress: () => {
              // Você pode adicionar dados de demonstração aqui
              console.log('Mostrar demonstração');
            }
          }
        ]
      );
    }
  };

  const getButtonIcon = () => {
    if (isWeb) return 'info-outline';
    return 'qr-code-scanner';
  };

  const getButtonText = () => {
    if (isWeb) return 'Sobre a Câmera';
    return children;
  };

  return (
    <ModernButton
      variant={isWeb ? 'outline' : variant}
      size={size}
      leftIcon={getButtonIcon()}
      onPress={handlePress}
      fullWidth={fullWidth}
    >
      {getButtonText()}
    </ModernButton>
  );
};
