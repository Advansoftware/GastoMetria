import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { tw } from '@/utils/tailwind';

interface LoadingOverlayProps {
  message: string;
}

const LoadingOverlay = ({ message }: LoadingOverlayProps) => {
  const rotation = useSharedValue(0);
  
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

  return (
    <View style={[tw('absolute inset-0 justify-center items-center z-50'), { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
      <Animated.View entering={FadeIn.duration(300)}>
        <View style={tw('items-center px-8')}>
          
          {/* Ícone principal animado */}
          <Animated.View 
            entering={FadeInDown.delay(200)} 
            style={[
              tw('w-24 h-24 rounded-full items-center justify-center mb-8'),
              { backgroundColor: '#3B82F6' },
              animatedStyle
            ]}
          >
            <MaterialIcons name="sync" size={40} color="white" />
          </Animated.View>
          
          {/* Título */}
          <Animated.View entering={FadeInDown.delay(400)}>
            <Text style={tw('text-white text-2xl font-bold text-center mb-3')}>
              Processando...
            </Text>
          </Animated.View>
          
          {/* Mensagem */}
          <Animated.View entering={FadeInDown.delay(600)}>
            <Text style={tw('text-gray-300 text-base text-center leading-6 mb-8 max-w-xs')}>
              {message}
            </Text>
          </Animated.View>
          
          {/* Spinner adicional */}
          <Animated.View entering={FadeInDown.delay(800)}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </Animated.View>
          
          {/* Barra de progresso animada */}
          <Animated.View entering={FadeInDown.delay(1000)} style={tw('mt-8 w-64')}>
            <View style={[tw('w-full h-2 rounded-full overflow-hidden'), { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Animated.View 
                style={[
                  tw('h-full rounded-full'),
                  { backgroundColor: '#3B82F6', width: '70%' }
                ]}
              />
            </View>
          </Animated.View>
          
        </View>
      </Animated.View>
    </View>
  );
};

export default LoadingOverlay;
