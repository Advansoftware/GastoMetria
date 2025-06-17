import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Platform } from 'react-native';

export function useWebLayout() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const updateScreenSize = () => {
        const { width } = Dimensions.get('window');
        setScreenWidth(width);
        setIsDesktop(width >= 1024); // Desktop a partir de 1024px
      };

      updateScreenSize();
      
      const subscription = Dimensions.addEventListener('change', updateScreenSize);
      return () => subscription?.remove();
    }
  }, []);

  return {
    isDesktop: Platform.OS === 'web' && isDesktop,
    isMobile: Platform.OS !== 'web' || !isDesktop,
    screenWidth,
    isWeb: Platform.OS === 'web'
  };
}
