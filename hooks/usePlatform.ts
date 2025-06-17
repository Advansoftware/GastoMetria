import { Platform } from 'react-native';

export interface PlatformCapabilities {
  isWeb: boolean;
  isMobile: boolean;
  hasCamera: boolean;
  hasFileSystem: boolean;
  hasStorage: boolean;
  supportsQRScanning: boolean;
  supportsImagePicker: boolean;
}

export const usePlatformCapabilities = (): PlatformCapabilities => {
  const isWeb = Platform.OS === 'web';
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  return {
    isWeb,
    isMobile,
    hasCamera: isMobile,
    hasFileSystem: isMobile,
    hasStorage: true, // AsyncStorage funciona em todas as plataformas
    supportsQRScanning: isMobile,
    supportsImagePicker: isMobile,
  };
};

export const PlatformConfig = {
  web: {
    showCameraButton: false,
    showFileUpload: true,
    readonly: true,
    features: ['view', 'stats', 'reports'],
  },
  mobile: {
    showCameraButton: true,
    showFileUpload: false,
    readonly: false,
    features: ['view', 'stats', 'reports', 'camera', 'scan', 'add', 'edit', 'delete'],
  },
};
