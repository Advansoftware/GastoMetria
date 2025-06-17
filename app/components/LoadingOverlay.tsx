import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { tw } from '@/utils/tailwind';

interface LoadingOverlayProps {
  message: string;
}

const LoadingOverlay = ({ message }: LoadingOverlayProps) => {
  const rotation = useSharedValue(0);
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  // Cores baseadas no tema
  const backgroundColor = isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)';
  const primaryColor = '#3B82F6';
  const textColor = isDark ? '#FFFFFF' : '#1F2937';
  const secondaryTextColor = isDark ? '#9CA3AF' : '#6B7280';
  const progressBgColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View 
        style={[
          tw('absolute inset-0 justify-center items-center z-50'), 
          { 
            backgroundColor,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right
          }
        ]}
      >
        <Animated.View entering={FadeIn.duration(300)}>
          <View style={tw('items-center px-8')}>
            
            {/* Ícone principal animado */}
            <Animated.View 
              entering={FadeInDown.delay(200)} 
              style={[
                tw('w-24 h-24 rounded-full items-center justify-center mb-8'),
                { backgroundColor: primaryColor },
                animatedStyle
              ]}
            >
              <MaterialIcons name="sync" size={40} color="white" />
            </Animated.View>
            
            {/* Título */}
            <Animated.View entering={FadeInDown.delay(400)}>
              <Text style={[tw('text-2xl font-bold text-center mb-3'), { color: textColor }]}>
                Processando...
              </Text>
            </Animated.View>
            
            {/* Mensagem */}
            <Animated.View entering={FadeInDown.delay(600)}>
              <Text style={[tw('text-base text-center leading-6 mb-8 max-w-xs'), { color: secondaryTextColor }]}>
                {message}
              </Text>
            </Animated.View>
            
            {/* Spinner adicional */}
            <Animated.View entering={FadeInDown.delay(800)}>
              <ActivityIndicator size="large" color={primaryColor} />
            </Animated.View>
            
            {/* Barra de progresso animada */}
            <Animated.View entering={FadeInDown.delay(1000)} style={tw('mt-8 w-64')}>
              <View style={[tw('w-full h-2 rounded-full overflow-hidden'), { backgroundColor: progressBgColor }]}>
                <Animated.View 
                  style={[
                    tw('h-full rounded-full'),
                    { backgroundColor: primaryColor, width: '70%' }
                  ]}
                />
              </View>
            </Animated.View>
            
          </View>
        </Animated.View>
      </View>
    </>
  );
};

export default LoadingOverlay;
