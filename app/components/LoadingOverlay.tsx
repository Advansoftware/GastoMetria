import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, RotateInUpLeft } from 'react-native-reanimated';
import { tw } from '@/utils/tailwind';

interface LoadingOverlayProps {
  message: string;
}

const LoadingOverlay = ({ message }: LoadingOverlayProps) => (
  <View style={[tw('absolute inset-0 justify-center items-center z-50'), { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
    <Animated.View entering={FadeIn.duration(300)}>
      <View style={[tw('rounded-3xl p-8 items-center max-w-xs mx-4'), { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
        <Animated.View entering={RotateInUpLeft.delay(200)}>
          <View style={[tw('w-16 h-16 rounded-full items-center justify-center mb-6'), { backgroundColor: '#3B82F6' }]}>
            <MaterialIcons name="auto-awesome" size={32} color="white" />
          </View>
        </Animated.View>
        
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginBottom: 16 }} />
        
        <Text style={tw('text-white text-lg font-semibold text-center mb-2')}>
          Processando...
        </Text>
        
        <Text style={tw('text-gray-300 text-sm text-center leading-5')}>
          {message}
        </Text>
        
        {/* Indicador de progresso animado */}
        <View style={[tw('w-full h-1 rounded-full mt-6 overflow-hidden'), { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
          <Animated.View 
            entering={FadeIn.delay(500)}
            style={[tw('h-full rounded-full'), { backgroundColor: '#3B82F6', width: '100%' }]}
          />
        </View>
      </View>
    </Animated.View>
  </View>
);

export default LoadingOverlay;
