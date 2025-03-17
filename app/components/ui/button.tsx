import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, StyleProp, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'text' | 'outlined' | 'contained';
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void | Promise<void>;
}

export const Button = ({ 
  variant = 'contained',
  children,
  style,
  textStyle,
  onPress,
  ...props 
}: ButtonProps): JSX.Element => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        variant === 'outlined' && styles.outlined,
        variant === 'contained' && styles.contained,
        style
      ]}
      {...props}
    >
      <Text style={[
        styles.text,
        variant === 'contained' && styles.containedText,
        textStyle
      ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  contained: {
    backgroundColor: '#007AFF',
  },
  text: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  containedText: {
    color: '#FFFFFF',
  },
});

export default Button;
